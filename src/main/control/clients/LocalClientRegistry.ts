// The local clients the user allowed, and the requests waiting for the user.
// Loaded from the store before the socket listens; every change to a known
// client is saved through it, one save at a time, the latest state winning.
// A save that fails is logged and the client still works for this launch.
//
// Allowing needs secrets that can be stored encrypted: where they cannot (no
// keyring), Allow is refused rather than keeping a secret in the clear.
//
// Pending requests and allowed approvals nobody collected expire on a timer,
// so a screen showing them hears it through onChange.

import {randomBytes, randomUUID} from 'node:crypto'
import type {ControlRule} from 'arroxy-control'
import type {LocalClientsRefusal, LocalClientsSnapshot} from '@shared/localClients.js'
import type {ControlSocketLog} from '../socket/controlConnection.js'
import {failureCode} from '../socket/errnoCode.js'
import type {ApprovalClaim, LocalClient, LocalClientApprovals} from '../socket/localClientApprovals.js'
import type {LocalClientRecord, LocalClientStore} from './localClientStore.js'

// Requests waiting for the user at once; a further one drops the oldest, so a
// looping script cannot pile up prompts.
export const PENDING_APPROVALS_MAX = 8
// How long a request waits for the user.
export const PENDING_APPROVAL_TTL_MS = 10 * 60_000
// How long an allowed approval waits to be collected.
export const ALLOWED_APPROVAL_TTL_MS = 10 * 60_000

export type AllowResult = {readonly ok: true} | {readonly ok: false; readonly code: Extract<LocalClientsRefusal, 'not_pending' | 'secure_storage_unavailable'>}

export interface LocalClientRegistryOptions {
	readonly store: LocalClientStore
	// Whether a secret saved now would be encrypted.
	readonly secretsStorable: () => boolean
	readonly log: ControlSocketLog
	// Allow every request at once. Only an E2E run (ARROXY_E2E) sets it.
	readonly autoAllow?: boolean
	readonly now?: () => number
}

// The client an allowed approval issues, before it is known.
type Issued = Omit<LocalClientRecord, 'firstSeenAt' | 'lastSeenAt'>

type Approval = {readonly state: 'pending'; readonly label: string; readonly requestedAt: number} | {readonly state: 'allowed'; readonly issued: Issued; readonly allowedAt: number; claimed: boolean}

export class LocalClientRegistry implements LocalClientApprovals {
	private readonly approvals = new Map<string, Approval>()
	private readonly records = new Map<string, LocalClientRecord>()
	// The open connections of each known client.
	private readonly connections = new Map<string, Set<symbol>>()
	private readonly revokedListeners = new Set<(clientId: string) => void>()
	private readonly changeListeners = new Set<() => void>()
	private readonly now: () => number
	private timer: NodeJS.Timeout | null = null
	private closed = false
	// Whether a save runs; cleared in the step that finds nothing left to save.
	private saving = false
	private idle: Promise<void> = Promise.resolve()
	private dirty = false

	private constructor(
		private readonly options: LocalClientRegistryOptions,
		records: readonly LocalClientRecord[]
	) {
		this.now = options.now ?? (() => Date.now())
		for (const record of records) this.records.set(record.clientId, record)
	}

	static async load(options: LocalClientRegistryOptions): Promise<LocalClientRegistry> {
		return new LocalClientRegistry(options, await options.store.load())
	}

	request(label: string): string {
		this.dropExpired()
		const approvalId = randomUUID()
		const waiting = this.pendingIds()
		if (waiting.length >= PENDING_APPROVALS_MAX && waiting[0] !== undefined) this.approvals.delete(waiting[0])
		this.approvals.set(approvalId, {state: 'pending', label, requestedAt: this.now()})
		if (this.options.autoAllow === true) this.allow(approvalId, {pathsRead: false})
		this.changed()
		return approvalId
	}

	withdraw(approvalId: string): void {
		if (this.approvals.get(approvalId)?.state === 'pending' && this.approvals.delete(approvalId)) this.changed()
	}

	claim(approvalId: string): ApprovalClaim {
		if (this.dropExpired()) this.changed()
		const approval = this.approvals.get(approvalId)
		if (!approval) return {status: 'refused'}
		if (approval.state === 'pending' || approval.claimed) return {status: 'pending'}
		approval.claimed = true
		this.schedule()
		return {status: 'allowed', client: localClient(approval.issued)}
	}

	confirm(approvalId: string): void {
		const approval = this.approvals.get(approvalId)
		if (approval?.state !== 'allowed' || !approval.claimed) return
		this.approvals.delete(approvalId)
		const now = this.now()
		this.records.set(approval.issued.clientId, {...approval.issued, firstSeenAt: now, lastSeenAt: now})
		this.persist()
		this.changed()
	}

	release(approvalId: string): void {
		const approval = this.approvals.get(approvalId)
		if (approval?.state !== 'allowed') return
		approval.claimed = false
		this.schedule()
	}

	client(clientId: string): LocalClient | null {
		const known = this.records.get(clientId)
		if (known) return localClient(known)
		const claimed = this.claimedFor(clientId)
		return claimed ? localClient(claimed.issued) : null
	}

	proven(clientId: string): void {
		const claimed = this.claimedFor(clientId)
		if (claimed) this.confirm(claimed.approvalId)
	}

	connected(clientId: string): () => void {
		if (!this.records.has(clientId)) return () => undefined
		const connection = Symbol(clientId)
		const open = this.connections.get(clientId) ?? new Set<symbol>()
		open.add(connection)
		this.connections.set(clientId, open)
		this.seen(clientId)
		return () => {
			const current = this.connections.get(clientId)
			if (!current?.delete(connection)) return
			if (current.size === 0) this.connections.delete(clientId)
			this.seen(clientId)
		}
	}

	onRevoked(listener: (clientId: string) => void): () => void {
		this.revokedListeners.add(listener)
		return () => this.revokedListeners.delete(listener)
	}

	onChange(listener: () => void): () => void {
		this.changeListeners.add(listener)
		return () => this.changeListeners.delete(listener)
	}

	// For createControlService's clientLabel.
	label(clientId: string): string | null {
		return this.client(clientId)?.label ?? null
	}

	snapshot(): LocalClientsSnapshot {
		const clients = [...this.records.values()].map(({clientId, label, pathsRead, firstSeenAt, lastSeenAt}) => ({clientId, label, pathsRead, firstSeenAt, lastSeenAt, connected: this.connections.has(clientId)}))
		const pending = [...this.approvals].flatMap(([approvalId, approval]) => (approval.state === 'pending' ? [{approvalId, label: approval.label, requestedAt: approval.requestedAt, expiresAt: approval.requestedAt + PENDING_APPROVAL_TTL_MS}] : []))
		return {clients, pending}
	}

	allow(approvalId: string, grant: {readonly pathsRead: boolean}): AllowResult {
		const approval = this.approvals.get(approvalId)
		if (approval?.state !== 'pending') return {ok: false, code: 'not_pending'}
		if (!this.options.secretsStorable()) return {ok: false, code: 'secure_storage_unavailable'}
		const issued: Issued = {clientId: randomUUID(), label: approval.label, pathsRead: grant.pathsRead, secret: randomBytes(32).toString('base64url')}
		this.approvals.set(approvalId, {state: 'allowed', issued, allowedAt: this.now(), claimed: false})
		this.changed()
		return {ok: true}
	}

	deny(approvalId: string): boolean {
		if (this.approvals.get(approvalId)?.state !== 'pending' || !this.approvals.delete(approvalId)) return false
		this.changed()
		return true
	}

	remove(clientId: string): boolean {
		if (!this.records.delete(clientId)) return false
		this.connections.delete(clientId)
		this.persist()
		for (const listener of [...this.revokedListeners]) listener(clientId)
		this.changed()
		return true
	}

	// Settles once every save asked for so far is done.
	saved(): Promise<void> {
		return this.idle
	}

	// Stops the expiry timer and waits for the last save.
	async close(): Promise<void> {
		this.closed = true
		if (this.timer !== null) clearTimeout(this.timer)
		this.timer = null
		await this.saved()
	}

	private seen(clientId: string): void {
		const record = this.records.get(clientId)
		if (!record) return
		this.records.set(clientId, {...record, lastSeenAt: this.now()})
		this.persist()
		this.changed()
	}

	// Coalesced: while a save runs, later changes wait and go out as one.
	private persist(): void {
		this.dirty = true
		if (this.saving) return
		this.saving = true
		this.idle = this.saveWhileDirty()
	}

	private async saveWhileDirty(): Promise<void> {
		while (this.dirty) {
			this.dirty = false
			try {
				await this.options.store.save([...this.records.values()])
			} catch (error) {
				// A code, never the message: it can carry paths.
				this.options.log.warn('the local clients could not be saved', {code: failureCode(error)})
			}
		}
		this.saving = false
	}

	private changed(): void {
		this.schedule()
		for (const listener of [...this.changeListeners]) listener()
	}

	private pendingIds(): string[] {
		return [...this.approvals].flatMap(([approvalId, approval]) => (approval.state === 'pending' ? [approvalId] : []))
	}

	// The approval being collected for `clientId`, whose secret is being written.
	private claimedFor(clientId: string): {readonly approvalId: string; readonly issued: Issued} | null {
		for (const [approvalId, approval] of this.approvals) if (approval.state === 'allowed' && approval.claimed && approval.issued.clientId === clientId) return {approvalId, issued: approval.issued}
		return null
	}

	// When an approval stops counting; a claimed one is mid-write and stays
	// until confirmed or released.
	private expiresAt(approval: Approval): number | null {
		if (approval.state === 'pending') return approval.requestedAt + PENDING_APPROVAL_TTL_MS
		return approval.claimed ? null : approval.allowedAt + ALLOWED_APPROVAL_TTL_MS
	}

	// Whether anything expired.
	private dropExpired(): boolean {
		const now = this.now()
		let dropped = false
		for (const [approvalId, approval] of this.approvals) {
			const expiresAt = this.expiresAt(approval)
			if (expiresAt !== null && expiresAt < now) dropped = this.approvals.delete(approvalId) || dropped
		}
		return dropped
	}

	// One timer, for the next approval to expire.
	private schedule(): void {
		if (this.timer !== null) clearTimeout(this.timer)
		this.timer = null
		if (this.closed) return
		let next: number | null = null
		for (const approval of this.approvals.values()) {
			const expiresAt = this.expiresAt(approval)
			if (expiresAt !== null && (next === null || expiresAt < next)) next = expiresAt
		}
		if (next === null) return
		this.timer = setTimeout(() => this.expire(), Math.max(0, next - this.now() + 1))
		this.timer.unref()
	}

	private expire(): void {
		this.timer = null
		if (this.dropExpired()) this.changed()
		else this.schedule()
	}
}

function rulesFor(pathsRead: boolean): ControlRule[] {
	return pathsRead ? ['trusted', 'paths.read'] : ['trusted']
}

function localClient({clientId, label, secret, pathsRead}: Issued): LocalClient {
	return {clientId, label, secret, rules: rulesFor(pathsRead)}
}

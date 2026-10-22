// Who may use the Control API over the local socket. A client the user has
// not allowed asks once (the socket answers approval_pending with an
// approvalId); after Allow it collects a client id and its secret once, on a
// new connection; later connections prove they hold that secret.
//
// Collecting is claim, then confirm once the answer carrying the secret was
// written, or release when it was not: a client that vanished mid-handshake
// never becomes a trusted client whose secret nobody holds.
//
// The label is whatever name the client gave in hello. Any screen shows it as
// plain text, marked as the client's own name, never as something Arroxy
// checked.
//
// The handshake keys an HMAC with the secret, so the server needs the secret
// itself, not a hash of it. A persistent store keeps it in an owner-only
// file in userData, encrypted with Electron's safeStorage where that is
// available, and keys rows by clientId.

import {randomBytes, randomUUID} from 'node:crypto'
import type {ControlRule} from 'arroxy-control'

// A client the user allowed, as the handshake and the session see it.
export interface LocalClient {
	readonly clientId: string
	// The name the client gave in hello, shown when the user allowed it.
	readonly label: string
	readonly secret: string
	readonly rules: readonly ControlRule[]
}

// `pending`: the user has not chosen, or another connection is collecting it
// right now. `refused`: denied, withdrawn, expired, unknown, or collected.
export type ApprovalClaim = {readonly status: 'pending'} | {readonly status: 'refused'} | {readonly status: 'allowed'; readonly client: LocalClient}

// What the socket's handshake needs.
export interface LocalClientApprovals {
	// A new request to allow a client, shown with `label`; answers its approvalId.
	request(label: string): string
	// The connection that asked went away before it heard the approvalId.
	withdraw(approvalId: string): void
	// After Allow: the client to issue, held for this connection.
	claim(approvalId: string): ApprovalClaim
	// The answer carrying the secret was written: the client is known from now on.
	confirm(approvalId: string): void
	// The answer was not written: the approval can be collected again.
	release(approvalId: string): void
	// A known client, or one whose secret is being written to it right now
	// (the client can read it, and reconnect, before the write completes; a
	// proof made with the secret shows it arrived). Null when unknown or removed.
	client(clientId: string): LocalClient | null
	// Hears a client's id when the user removes it, so its connections close.
	onRevoked(listener: (clientId: string) => void): () => void
}

export interface PendingApproval {
	readonly approvalId: string
	readonly label: string
}

// Requests waiting for the user at once; a further one drops the oldest, so a
// looping script cannot pile up prompts.
export const PENDING_APPROVALS_MAX = 8
// How long an allowed approval waits to be collected.
export const ALLOWED_APPROVAL_TTL_MS = 10 * 60_000

type Approval = {readonly state: 'pending'; readonly label: string} | {readonly state: 'allowed'; readonly client: LocalClient; readonly allowedAt: number; claimed: boolean}

export interface MemoryLocalClientApprovalsOptions {
	// Allow every request at once. Only an E2E run (ARROXY_E2E) sets it.
	readonly autoAllow?: boolean
	readonly now?: () => number
}

// In memory: the list lasts as long as the app runs.
export class MemoryLocalClientApprovals implements LocalClientApprovals {
	private readonly approvals = new Map<string, Approval>()
	private readonly clients = new Map<string, LocalClient>()
	private readonly revokedListeners = new Set<(clientId: string) => void>()
	private readonly now: () => number

	constructor(private readonly options: MemoryLocalClientApprovalsOptions = {}) {
		this.now = options.now ?? Date.now
	}

	request(label: string): string {
		this.dropExpired()
		const approvalId = randomUUID()
		const waiting = this.pending()
		if (waiting.length >= PENDING_APPROVALS_MAX && waiting[0]) this.approvals.delete(waiting[0].approvalId)
		this.approvals.set(approvalId, {state: 'pending', label})
		if (this.options.autoAllow === true) this.allow(approvalId)
		return approvalId
	}

	withdraw(approvalId: string): void {
		if (this.approvals.get(approvalId)?.state === 'pending') this.approvals.delete(approvalId)
	}

	claim(approvalId: string): ApprovalClaim {
		this.dropExpired()
		const approval = this.approvals.get(approvalId)
		if (!approval) return {status: 'refused'}
		if (approval.state === 'pending' || approval.claimed) return {status: 'pending'}
		approval.claimed = true
		return {status: 'allowed', client: approval.client}
	}

	confirm(approvalId: string): void {
		const approval = this.approvals.get(approvalId)
		if (approval?.state !== 'allowed' || !approval.claimed) return
		this.approvals.delete(approvalId)
		this.clients.set(approval.client.clientId, approval.client)
	}

	release(approvalId: string): void {
		const approval = this.approvals.get(approvalId)
		if (approval?.state === 'allowed') approval.claimed = false
	}

	client(clientId: string): LocalClient | null {
		const known = this.clients.get(clientId)
		if (known) return known
		for (const approval of this.approvals.values()) if (approval.state === 'allowed' && approval.claimed && approval.client.clientId === clientId) return approval.client
		return null
	}

	onRevoked(listener: (clientId: string) => void): () => void {
		this.revokedListeners.add(listener)
		return () => this.revokedListeners.delete(listener)
	}

	// For createControlService's clientLabel.
	label(clientId: string): string | null {
		return this.client(clientId)?.label ?? null
	}

	// Oldest first.
	pending(): PendingApproval[] {
		return [...this.approvals].flatMap(([approvalId, approval]) => (approval.state === 'pending' ? [{approvalId, label: approval.label}] : []))
	}

	allow(approvalId: string, grant: {readonly pathsRead?: boolean} = {}): boolean {
		const approval = this.approvals.get(approvalId)
		if (approval?.state !== 'pending') return false
		const rules: ControlRule[] = grant.pathsRead === true ? ['trusted', 'paths.read'] : ['trusted']
		const client: LocalClient = {clientId: randomUUID(), label: approval.label, secret: randomBytes(32).toString('base64url'), rules}
		this.approvals.set(approvalId, {state: 'allowed', client, allowedAt: this.now(), claimed: false})
		return true
	}

	deny(approvalId: string): boolean {
		return this.approvals.get(approvalId)?.state === 'pending' && this.approvals.delete(approvalId)
	}

	remove(clientId: string): boolean {
		if (!this.clients.delete(clientId)) return false
		for (const listener of [...this.revokedListeners]) listener(clientId)
		return true
	}

	// A claimed approval is mid-write and stays until confirmed or released.
	private dropExpired(): void {
		const cutoff = this.now() - ALLOWED_APPROVAL_TTL_MS
		for (const [approvalId, approval] of this.approvals) if (approval.state === 'allowed' && !approval.claimed && approval.allowedAt < cutoff) this.approvals.delete(approvalId)
	}
}

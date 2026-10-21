// Who may use the Control API over the local socket. A client the user has
// not allowed asks once (the socket answers approval_pending with an
// approvalId); after Allow it collects a client id and its secret once, on a
// new connection; later connections prove they hold that secret.
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

// `refused`: denied, expired, unknown, or already collected.
export type ApprovalCollect = {readonly status: 'pending'} | {readonly status: 'refused'} | {readonly status: 'allowed'; readonly clientId: string; readonly clientSecret: string}

// What the socket's handshake needs.
export interface LocalClientApprovals {
	// A new request to allow a client, shown with `label`; answers its approvalId.
	request(label: string): string
	// After Allow, issues the client id and secret, once.
	collect(approvalId: string): ApprovalCollect
	// A known client, or null when unknown or removed.
	client(clientId: string): LocalClient | null
}

export interface PendingApproval {
	readonly approvalId: string
	readonly label: string
}

// Requests waiting for the user at once; a further one drops the oldest, so a
// looping script cannot pile up prompts.
export const PENDING_APPROVALS_MAX = 8

interface Approval {
	readonly label: string
	// Set once the user allows it.
	rules: readonly ControlRule[] | null
}

export interface MemoryLocalClientApprovalsOptions {
	// Allow every request at once. Only an E2E run (ARROXY_E2E) sets it.
	readonly autoAllow?: boolean
}

// In memory: the list lasts as long as the app runs.
export class MemoryLocalClientApprovals implements LocalClientApprovals {
	private readonly approvals = new Map<string, Approval>()
	private readonly clients = new Map<string, LocalClient>()

	constructor(private readonly options: MemoryLocalClientApprovalsOptions = {}) {}

	request(label: string): string {
		const approvalId = randomUUID()
		const waiting = this.pending()
		if (waiting.length >= PENDING_APPROVALS_MAX && waiting[0]) this.approvals.delete(waiting[0].approvalId)
		this.approvals.set(approvalId, {label, rules: this.options.autoAllow === true ? ['trusted'] : null})
		return approvalId
	}

	collect(approvalId: string): ApprovalCollect {
		const approval = this.approvals.get(approvalId)
		if (!approval) return {status: 'refused'}
		if (approval.rules === null) return {status: 'pending'}
		this.approvals.delete(approvalId)
		const client: LocalClient = {clientId: randomUUID(), label: approval.label, secret: randomBytes(32).toString('base64url'), rules: approval.rules}
		this.clients.set(client.clientId, client)
		return {status: 'allowed', clientId: client.clientId, clientSecret: client.secret}
	}

	client(clientId: string): LocalClient | null {
		return this.clients.get(clientId) ?? null
	}

	// For createControlService's clientLabel.
	label(clientId: string): string | null {
		return this.clients.get(clientId)?.label ?? null
	}

	// Oldest first.
	pending(): PendingApproval[] {
		return [...this.approvals].filter(([, approval]) => approval.rules === null).map(([approvalId, {label}]) => ({approvalId, label}))
	}

	allow(approvalId: string, grant: {readonly pathsRead?: boolean} = {}): boolean {
		const approval = this.approvals.get(approvalId)
		if (approval?.rules !== null) return false
		approval.rules = grant.pathsRead === true ? ['trusted', 'paths.read'] : ['trusted']
		return true
	}

	deny(approvalId: string): boolean {
		return this.approvals.get(approvalId)?.rules === null && this.approvals.delete(approvalId)
	}

	remove(clientId: string): boolean {
		return this.clients.delete(clientId)
	}
}

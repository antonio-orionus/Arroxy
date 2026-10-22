import {z} from 'zod'

// The local clients (programs on this computer the user allowed to use the
// Control API over the local socket) as the window sees them, and what the
// window can ask about them. Never a client's secret. Paired phones are kept
// apart and are not in this list.

// A known client as a screen shows it.
export interface LocalClientView {
	readonly clientId: string
	// The name the client gave when it asked to be allowed.
	readonly label: string
	// Allowed to read the paths of downloaded files.
	readonly pathsRead: boolean
	readonly firstSeenAt: number
	readonly lastSeenAt: number
	// A connection of it is open now.
	readonly connected: boolean
}

// An approval request, waiting for the user's Allow or Deny.
export interface PendingApprovalView {
	readonly approvalId: string
	readonly label: string
	readonly requestedAt: number
	// After this it is dropped, and the client must ask again.
	readonly expiresAt: number
}

export interface LocalClientsSnapshot {
	readonly clients: LocalClientView[]
	// Oldest first.
	readonly pending: PendingApprovalView[]
}

// Why Allow, Deny or Remove changed nothing. `not_pending`: the request was
// already answered, withdrawn or expired. `secure_storage_unavailable`: the
// secret Allow issues could not be stored encrypted (no keyring), so nothing
// was allowed. `unknown_client`: no such client, or it was removed already.
// `not_running`: agent control has not loaded the clients yet, or it stopped
// or failed to start, so there are none to show or change.
const localClientsRefusalSchema = z.enum(['not_pending', 'secure_storage_unavailable', 'unknown_client', 'not_running'])
export type LocalClientsRefusal = z.infer<typeof localClientsRefusalSchema>

// The failure a refused local-clients request answers with, apart from
// AppError so a screen can tell each reason from a malformed request.
export interface LocalClientsError {
	readonly code: LocalClientsRefusal
	readonly message: string
}

// The control protocol's id bounds.
const localClientIdSchema = z.string().min(1).max(128)

export const localClientsAllowSchema = z.strictObject({approvalId: localClientIdSchema, pathsRead: z.boolean()})
export type LocalClientsAllowInput = z.infer<typeof localClientsAllowSchema>
export const localClientsDenySchema = z.strictObject({approvalId: localClientIdSchema})
export type LocalClientsDenyInput = z.infer<typeof localClientsDenySchema>
export const localClientsRemoveSchema = z.strictObject({clientId: localClientIdSchema})
export type LocalClientsRemoveInput = z.infer<typeof localClientsRemoveSchema>

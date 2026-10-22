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
// itself, not a hash of it. LocalClientRegistry implements this and keeps the
// allowed clients between launches.

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
	// A proof made with this client's secret was valid, so the secret arrived:
	// an approval still being collected for it is confirmed, and a later
	// release from the connection that wrote it changes nothing.
	proven(clientId: string): void
	// A known client, or one whose secret is being written to it right now
	// (the client can read it, and reconnect, before the write completes; a
	// proof made with the secret shows it arrived). Null when unknown or removed.
	client(clientId: string): LocalClient | null
	// A session opened for this known client; the answer is called once, when
	// that connection ends.
	connected(clientId: string): () => void
	// Hears a client's id when the user removes it, so its connections close.
	onRevoked(listener: (clientId: string) => void): () => void
}

import {z} from 'zod'

// The local-socket handshake: hello, its challenge, then auth. The server proves
// it holds the discovery token before the client proves anything, because on
// Windows another OS user can squat a stale pipe name and read whatever a client
// sends first; a client's first frame therefore carries no secret.
//
// 1. hello {clientNonce}  ->  {serverProof: HMAC(token, clientNonce), serverNonce}
//    The client checks serverProof and drops the connection if it does not match.
// 2. auth {clientId, proof: HMAC(clientSecret, serverNonce)} for a known client,
//    or auth {proof: HMAC(token, serverNonce)} to ask the user to allow a new one
//    (answers approval_pending with an approvalId), then, on a new connection after
//    Allow, auth {approvalId, proof: HMAC(token, serverNonce)} to collect the
//    client id and its secret, issued once.
//
// HMAC is HMAC-SHA256 keyed by the UTF-8 bytes of the secret or token, over the
// UTF-8 bytes of the nonce string, written as base64url without padding.

// Before a successful auth the server accepts only hello then auth, and writes
// nothing but the hello challenge and at most one closing error line. It closes a
// connection that has not sent hello within HANDSHAKE_TIMEOUT_MS (handshake_timeout),
// drops one whose first frame exceeds HANDSHAKE_MAX_FRAME_BYTES, and answers any
// other method with unauthorized before closing.
export const HANDSHAKE_TIMEOUT_MS = 2000
export const HANDSHAKE_MAX_FRAME_BYTES = 4096

// 16 to 64 random bytes, base64url without padding.
export const handshakeNonceSchema = z.string().regex(/^[A-Za-z0-9_-]{22,86}$/)
// A SHA-256 HMAC (32 bytes), base64url without padding.
export const handshakeProofSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

// Shared by the app and every client so the two sides compute proofs the same way.
export async function handshakeProof(secret: string, nonce: string): Promise<string> {
	const encoder = new TextEncoder()
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
	const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(nonce)))
	let binary = ''
	for (const byte of mac) binary += String.fromCharCode(byte)
	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

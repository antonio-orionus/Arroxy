import {z} from 'zod'

// The local-socket handshake: hello, its challenge, then auth. The server proves
// it holds the discovery token before the client proves anything, because on
// Windows another OS user can squat a stale pipe name and read whatever a client
// sends first; a client's first frame therefore carries no secret.
//
// 1. hello {clientNonce}  ->  {serverProof, serverNonce}
//    serverProof = HMAC(token, "arroxy-control/v1 server\n" + clientNonce). The
//    client checks it and drops the connection if it does not match.
// 2. auth {clientId, proof} for a known client, with the client secret as key;
//    auth {proof} with the token as key to ask the user to allow a new client
//    (answers approval_pending with an approvalId); then, on a new connection
//    after Allow, auth {approvalId, proof} with the token as key to collect the
//    client id and its secret, issued once.
//    proof = HMAC(key, "arroxy-control/v1 client\n" + serverNonce + "\n" + clientNonce)
//
// The two labels keep the proofs apart: without them a client that never read
// the token could say hello on a second connection with the first connection's
// serverNonce and replay the serverProof it gets back as its auth proof.
//
// HMAC is HMAC-SHA256 keyed by the UTF-8 bytes of the secret or token, over the
// UTF-8 bytes of the message, written as base64url without padding.

// Until auth succeeds the server accepts only one hello, then one auth, and
// writes nothing but the hello challenge and at most one closing error line.
// HANDSHAKE_TIMEOUT_MS counts from connect until auth succeeds: a connection
// still unauthenticated then gets handshake_timeout and is closed.
// HANDSHAKE_MAX_FRAME_BYTES caps every frame until auth succeeds; a longer one
// drops the connection. A second hello, or any method other than auth after
// hello (or other than hello before it), answers unauthorized and closes.
export const HANDSHAKE_TIMEOUT_MS = 2000
export const HANDSHAKE_MAX_FRAME_BYTES = 4096

// 16 to 64 random bytes, base64url without padding.
export const handshakeNonceSchema = z.string().regex(/^[A-Za-z0-9_-]{22,86}$/)
// A SHA-256 HMAC (32 bytes), base64url without padding.
export const handshakeProofSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

const SERVER_LABEL = 'arroxy-control/v1 server\n'
const CLIENT_LABEL = 'arroxy-control/v1 client\n'

// The app's answer to hello, which the client checks before sending auth.
export function handshakeServerProof(token: string, clientNonce: string): Promise<string> {
	return hmacBase64Url(token, `${SERVER_LABEL}${clientNonce}`)
}

// The client's auth proof. `key` is the client secret for a known client, and
// the discovery token on a first connection or an approval follow-up.
export function handshakeClientProof(key: string, serverNonce: string, clientNonce: string): Promise<string> {
	return hmacBase64Url(key, `${CLIENT_LABEL}${serverNonce}\n${clientNonce}`)
}

async function hmacBase64Url(key: string, message: string): Promise<string> {
	const encoder = new TextEncoder()
	const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
	const mac = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message)))
	let binary = ''
	for (const byte of mac) binary += String.fromCharCode(byte)
	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

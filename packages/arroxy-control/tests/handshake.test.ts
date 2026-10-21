import {describe, expect, it} from 'vite-plus/test'
import {HANDSHAKE_MAX_FRAME_BYTES, HANDSHAKE_TIMEOUT_MS, handshakeClientProof, handshakeNonceSchema, handshakeProofSchema, handshakeServerProof} from '../src/index'

// Fixed vectors, computed once with Node's
// crypto.createHmac('sha256', key).update(message, 'utf8').digest('base64url').
const NONCE = 'AAECAwQFBgcICQoLDA0ODw'
const CLIENT_NONCE = NONCE
const SERVER_NONCE = 'EBESExQVFhcYGRobHB0eHw'

describe('handshakeServerProof', () => {
	it('is HMAC-SHA256(token, "arroxy-control/v1 server\\n" + clientNonce) in base64url without padding', async () => {
		expect(await handshakeServerProof('s3cret-token', CLIENT_NONCE)).toBe('aXX8xJrwMpp1bl0vZnwTmvRsJSlOhJgVlGBzIQ3srOo')
	})
})

describe('handshakeClientProof', () => {
	it('is HMAC-SHA256(key, "arroxy-control/v1 client\\n" + serverNonce + "\\n" + clientNonce)', async () => {
		expect(await handshakeClientProof('s3cret-token', SERVER_NONCE, CLIENT_NONCE)).toBe('1xbRN__3ad42YpZEfqmtFm8U2mlvcOCurVZJJTTTpLc')
	})

	it('keys with the UTF-8 bytes of the secret', async () => {
		expect(await handshakeClientProof('tökén🔑', SERVER_NONCE, CLIENT_NONCE)).toBe('Ljm3saSY_pmjpEcRyR5Ekhot0F0rL7m01pzvMcEiBy4')
	})

	it('binds both nonces', async () => {
		const proof = await handshakeClientProof('s3cret-token', SERVER_NONCE, CLIENT_NONCE)
		expect(await handshakeClientProof('s3cret-token', SERVER_NONCE, 'ZZZZZZZZZZZZZZZZZZZZZZ')).not.toBe(proof)
		expect(await handshakeClientProof('s3cret-token', 'ZZZZZZZZZZZZZZZZZZZZZZ', CLIENT_NONCE)).not.toBe(proof)
		expect(await handshakeClientProof('s3cret-token', CLIENT_NONCE, SERVER_NONCE)).not.toBe(proof)
	})

	it('produces a value the proof schema accepts', async () => {
		const proof = await handshakeClientProof('another-secret', 'ZZZZZZZZZZZZZZZZZZZZZZ', NONCE)
		expect(proof).toHaveLength(43)
		expect(handshakeProofSchema.safeParse(proof).success).toBe(true)
	})
})

describe('proof separation', () => {
	// A client without the token could otherwise open a second connection, say
	// hello with the first connection's serverNonce, and replay the serverProof
	// it gets back as its own auth proof.
	it('never lets a server proof for nonce X stand in for a client proof over serverNonce X', async () => {
		const key = 's3cret-token'
		const serverProof = await handshakeServerProof(key, SERVER_NONCE)
		for (const clientNonce of [CLIENT_NONCE, SERVER_NONCE, 'ZZZZZZZZZZZZZZZZZZZZZZ', 'a'.repeat(86)]) {
			expect(await handshakeClientProof(key, SERVER_NONCE, clientNonce)).not.toBe(serverProof)
		}
	})
})

describe('handshake schemas', () => {
	it('takes nonces of 16 to 64 random bytes in base64url without padding', () => {
		expect(handshakeNonceSchema.safeParse(NONCE).success).toBe(true)
		expect(handshakeNonceSchema.safeParse('a'.repeat(86)).success).toBe(true)
		expect(handshakeNonceSchema.safeParse('a'.repeat(21)).success).toBe(false)
		expect(handshakeNonceSchema.safeParse('a'.repeat(87)).success).toBe(false)
		expect(handshakeNonceSchema.safeParse(`${'a'.repeat(22)}==`).success).toBe(false)
		expect(handshakeNonceSchema.safeParse(`${'a'.repeat(21)}+`).success).toBe(false)
	})

	it('takes a proof of exactly 43 base64url characters', () => {
		expect(handshakeProofSchema.safeParse('x_IEryNKMjLE5SmIOQBOTwNcA1N-TpctPra9GAb_Irg').success).toBe(true)
		expect(handshakeProofSchema.safeParse('x_IEryNKMjLE5SmIOQBOTwNcA1N-TpctPra9GAb_Ir').success).toBe(false)
		expect(handshakeProofSchema.safeParse('x_IEryNKMjLE5SmIOQBOTwNcA1N-TpctPra9GAb_Irg=').success).toBe(false)
		expect(handshakeProofSchema.safeParse('x/IEryNKMjLE5SmIOQBOTwNcA1N+TpctPra9GAb/Irg').success).toBe(false)
	})

	it('bounds the unauthenticated phase: 2 s to send hello, 4 KiB for the first frame', () => {
		expect(HANDSHAKE_TIMEOUT_MS).toBe(2000)
		expect(HANDSHAKE_MAX_FRAME_BYTES).toBe(4096)
	})
})

import {describe, expect, it} from 'vite-plus/test'
import {HANDSHAKE_MAX_FRAME_BYTES, HANDSHAKE_TIMEOUT_MS, handshakeNonceSchema, handshakeProof, handshakeProofSchema} from '../src/index'

// Fixed vectors, computed once with Node's crypto.createHmac('sha256', key).update(nonce).digest('base64url').
const NONCE = 'AAECAwQFBgcICQoLDA0ODw'

describe('handshakeProof', () => {
	it('is HMAC-SHA256 of the nonce keyed by the secret, in base64url without padding', async () => {
		expect(await handshakeProof('s3cret-token', NONCE)).toBe('x_IEryNKMjLE5SmIOQBOTwNcA1N-TpctPra9GAb_Irg')
	})

	it('keys with the UTF-8 bytes of the secret', async () => {
		expect(await handshakeProof('tökén🔑', NONCE)).toBe('tMUtflht8iUgC_zxyOmPv87a4ZliIsWG4YBG-De13ac')
	})

	it('produces a value the proof schema accepts', async () => {
		const proof = await handshakeProof('another-secret', 'ZZZZZZZZZZZZZZZZZZZZZZ')
		expect(proof).toHaveLength(43)
		expect(handshakeProofSchema.safeParse(proof).success).toBe(true)
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

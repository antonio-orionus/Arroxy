import {describe, expect, it} from 'vite-plus/test'
import {RUNTIME_BINARY_INDEX_SIGNATURE_URL, RUNTIME_BINARY_INDEX_URL} from '@main/services/binary/RuntimeBinaryTrust.js'

describe('RuntimeBinaryTrust', () => {
	it('fetches signed runtime metadata from the dedicated runtime release repo', () => {
		expect(RUNTIME_BINARY_INDEX_URL).toBe('https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v1.json')
		expect(RUNTIME_BINARY_INDEX_SIGNATURE_URL).toBe('https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v1.sig')
		expect(RUNTIME_BINARY_INDEX_URL).toContain('/arroxy-runtime-binaries/releases/latest/download/')
		expect(RUNTIME_BINARY_INDEX_SIGNATURE_URL).toContain('/arroxy-runtime-binaries/releases/latest/download/')
	})
})

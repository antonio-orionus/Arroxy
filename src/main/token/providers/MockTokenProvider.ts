import type {TokenProvider} from '@main/token/TokenProvider.js'

export class MockTokenProvider implements TokenProvider {
	ensureReady(): Promise<void> {
		return Promise.resolve()
	}

	getVisitorData(): Promise<string> {
		return Promise.resolve('MOCK_VISITOR_DATA')
	}

	mintToken(contentBinding: string): Promise<string> {
		return Promise.resolve(`MOCK_TOKEN_${contentBinding.slice(0, 8)}`)
	}

	acquireWindow(): void {
		// No window to lease — the mock answers from memory.
	}

	releaseWindow(): void {
		// No-op
	}

	dispose(): void {
		// No-op
	}
}

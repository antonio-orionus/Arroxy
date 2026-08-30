export interface TokenProvider {
	ensureReady(): Promise<void>
	getVisitorData(): Promise<string>
	mintToken(contentBinding: string): Promise<string>
	// Lease protocol around the provider's shared browsing context. Callers that
	// intend to drive the page must acquire before their first call and release
	// exactly once when done; the context is torn down only when the last lease
	// is released. Without it, two concurrent callers destroy the window out from
	// under each other — see TokenService.lease.
	acquireWindow(): void
	releaseWindow(): void
	dispose(): void
}

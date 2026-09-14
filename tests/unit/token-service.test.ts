import {describe, expect, it, vi} from 'vitest'
import {TokenService} from '@main/services/TokenService.js'

function makeProvider(overrides: Partial<{ensureReady: () => Promise<void>; getVisitorData: () => Promise<string>; mintToken: (binding: string) => Promise<string>; acquireWindow: () => void; releaseWindow: () => void; dispose: () => void}> = {}) {
	return {ensureReady: vi.fn().mockResolvedValue(undefined), getVisitorData: vi.fn().mockResolvedValue('visitor-abc'), mintToken: vi.fn().mockResolvedValue('token-xyz'), acquireWindow: vi.fn(), releaseWindow: vi.fn(), dispose: vi.fn(), ...overrides}
}

describe('TokenService.warmUp', () => {
	it('pre-mints token when visitorData is available and populates cache', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		await service.warmUp()

		expect(provider.ensureReady).toHaveBeenCalledOnce()
		expect(provider.getVisitorData).toHaveBeenCalledOnce()
		expect(provider.mintToken).toHaveBeenCalledWith('visitor-abc')

		// Cache should be populated — subsequent mintTokenForUrl does NOT call provider again
		const result = await service.mintTokenForUrl('https://youtube.com/watch?v=test')
		expect(result).toEqual({token: 'token-xyz', visitorData: 'visitor-abc', fromCache: true})
		// mintToken was called once (by warmUp) and not again (cache hit)
		expect(provider.mintToken).toHaveBeenCalledOnce()
	})

	it('skips minting when visitorData is empty', async () => {
		const provider = makeProvider({getVisitorData: vi.fn().mockResolvedValue('')})
		const service = new TokenService(provider)

		await service.warmUp()

		expect(provider.mintToken).not.toHaveBeenCalled()

		// Cache is empty — mintTokenForUrl calls provider
		const result = await service.mintTokenForUrl('https://youtube.com/watch?v=abc')
		expect(provider.mintToken).toHaveBeenCalledOnce()
		expect(result.token).toBe('token-xyz')
	})

	it('reports ready=false with reason when provider throws (non-fatal)', async () => {
		const provider = makeProvider({ensureReady: vi.fn().mockRejectedValue(new Error('Network error'))})
		const service = new TokenService(provider)

		const status = await service.warmUp()
		expect(status.ready).toBe(false)
		expect(status.reason).toContain('Network error')
	})

	it('reports ready=true on successful warm-up', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		const status = await service.warmUp()
		expect(status.ready).toBe(true)
	})

	it('reports ready=false with no-visitor-data when visitorData is empty', async () => {
		const provider = makeProvider({getVisitorData: vi.fn().mockResolvedValue('')})
		const service = new TokenService(provider)

		const status = await service.warmUp()
		expect(status.ready).toBe(false)
		expect(status.reason).toBe('no-visitor-data')
	})
})

// The warm-up runs once at startup and its outcome used to live only in that
// startup log line, the first thing a rotated log loses. Recording it lets the
// log carry it forward (issue #222: the one line naming the cause was gone).
describe('TokenService.lastWarmUp', () => {
	it('is null before any warm-up has run', () => {
		const service = new TokenService(makeProvider())

		expect(service.lastWarmUp()).toBeNull()
	})

	it('records the outcome of the latest warm-up, failure reason included', async () => {
		const provider = makeProvider({ensureReady: vi.fn().mockRejectedValueOnce(new Error('YouTube failed to load: ERR_ADDRESS_INVALID (-108)')).mockResolvedValue(undefined)})
		const service = new TokenService(provider)

		await service.warmUp()
		expect(service.lastWarmUp()).toEqual({ready: false, reason: 'YouTube failed to load: ERR_ADDRESS_INVALID (-108)', at: expect.any(String)})

		await service.warmUp()
		expect(service.lastWarmUp()).toEqual({ready: true, at: expect.any(String)})
	})
})

describe('TokenService.mintTokenForUrl', () => {
	it('returns cached token without calling provider', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		// Inject cache directly
		;(service as unknown as {cache: unknown}).cache = {token: 'cached-token', visitorData: 'cached-visitor', mintedAt: Date.now()}

		const result = await service.mintTokenForUrl('https://youtube.com/watch?v=x')
		expect(result).toEqual({token: 'cached-token', visitorData: 'cached-visitor', fromCache: true})
		expect(provider.mintToken).not.toHaveBeenCalled()
		expect(provider.ensureReady).not.toHaveBeenCalled()
	})

	it('re-mints when cache is expired', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		// Inject expired cache (7 hours old)
		;(service as unknown as {cache: unknown}).cache = {token: 'stale-token', visitorData: 'stale-visitor', mintedAt: Date.now() - 7 * 60 * 60 * 1_000}

		const result = await service.mintTokenForUrl('https://youtube.com/watch?v=x')
		expect(provider.mintToken).toHaveBeenCalledOnce()
		expect(result.token).toBe('token-xyz')
	})

	it('populates cache on fresh mint', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		await service.mintTokenForUrl('https://youtube.com/watch?v=x')

		const cache = (service as unknown as {cache: {token: string; visitorData: string} | null}).cache
		expect(cache).not.toBeNull()
		expect(cache?.token).toBe('token-xyz')
		expect(cache?.visitorData).toBe('visitor-abc')
	})
})

describe('TokenService.invalidateCache', () => {
	it('forces re-mint on next mintTokenForUrl call', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		await service.warmUp()
		expect(provider.mintToken).toHaveBeenCalledOnce()

		service.invalidateCache()

		await service.mintTokenForUrl('https://youtube.com/watch?v=x')
		expect(provider.mintToken).toHaveBeenCalledTimes(2)
	})
})

describe('TokenService.dispose', () => {
	it('clears cache and calls provider.dispose', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		await service.warmUp()

		service.dispose()

		expect(provider.dispose).toHaveBeenCalledOnce()
		const cache = (service as unknown as {cache: unknown}).cache
		expect(cache).toBeNull()
	})
})

describe('TokenService.warmUp cancellation', () => {
	// The provider's stages take no signal: ensureReady awaits did-finish-load with
	// no timer, so a page that connects but never finishes leaves it pending
	// forever. Aborting the signal alone changed nothing, because warmUp only
	// inspected it between awaits — the budget WarmupService passes was decorative
	// in exactly the case it existed for.
	it('settles on abort even while a provider stage is still pending', async () => {
		const provider = makeProvider({ensureReady: vi.fn().mockImplementation(() => new Promise<void>(() => {}))})
		const service = new TokenService(provider)
		const controller = new AbortController()

		const warm = service.warmUp(controller.signal)
		controller.abort()

		await expect(warm).resolves.toEqual({ready: false, reason: 'cancelled'})
	})

	// Settling is not enough on its own: the hidden BrowserWindow is what keeps the
	// hung load alive, so releasing it is what actually ends the work.
	it('releases the hidden window when it gives up on a pending stage', async () => {
		const provider = makeProvider({ensureReady: vi.fn().mockImplementation(() => new Promise<void>(() => {}))})
		const service = new TokenService(provider)
		const controller = new AbortController()

		const warm = service.warmUp(controller.signal)
		controller.abort()
		await warm

		expect(provider.releaseWindow).toHaveBeenCalled()
	})

	// addEventListener('abort') on an already-aborted signal never fires. If the
	// signal aborts while one stage is resolving, the next stage would race against
	// a listener that can never fire — reintroducing the exact hang, one stage later.
	it('gives up on a stage entered after the signal had already aborted', async () => {
		const controller = new AbortController()
		const provider = makeProvider({
			ensureReady: vi.fn().mockImplementation(async () => {
				controller.abort()
			}),
			getVisitorData: vi.fn().mockImplementation(() => new Promise<string>(() => {}))
		})
		const service = new TokenService(provider)

		await expect(service.warmUp(controller.signal)).resolves.toEqual({ready: false, reason: 'cancelled'})
	})
})

describe('TokenService window leases', () => {
	// Both entrypoints drive the same hidden BrowserWindow and both dispose it on
	// the way out. This needs no cancel to go wrong: the fire-and-forget warmup
	// racing a queue item's on-demand mint is enough, and the loser of that race
	// lands on a destroyed webContents.
	it('holds the window until the last concurrent caller is done', async () => {
		let releaseMint!: (value: string) => void
		const mintGate = new Promise<string>(resolve => {
			releaseMint = resolve
		})
		let mintCalls = 0
		const provider = makeProvider({
			mintToken: vi.fn().mockImplementation(() => {
				mintCalls += 1
				// Only the on-demand mint blocks; the warmup pass finishes first.
				return mintCalls === 1 ? Promise.resolve('warm-token') : mintGate
			})
		})
		const service = new TokenService(provider)

		const warm = service.warmUp()
		const onDemand = service.mintTokenForUrl('https://youtube.com/watch?v=held')
		await warm

		// Two leases were taken and only one given back, so the provider still has
		// an outstanding holder and must not tear the window down yet. Enforcing
		// that is the provider's job; balancing the leases is this one's.
		expect(provider.acquireWindow).toHaveBeenCalledTimes(2)
		expect(provider.releaseWindow).toHaveBeenCalledOnce()

		releaseMint('demand-token')
		await onDemand
		expect(provider.releaseWindow).toHaveBeenCalledTimes(2)
	})

	it('acquires a lease for every caller that touches the window', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)

		await service.warmUp()
		service.invalidateCache()
		await service.mintTokenForUrl('https://youtube.com/watch?v=abc')

		expect(provider.acquireWindow).toHaveBeenCalledTimes(2)
		expect(provider.releaseWindow).toHaveBeenCalledTimes(2)
	})

	// A cache hit never touches the provider, so it must not take a lease either —
	// an unbalanced release would tear down a window another caller is using.
	it('takes no lease when the cache answers', async () => {
		const provider = makeProvider()
		const service = new TokenService(provider)
		await service.warmUp()
		vi.mocked(provider.acquireWindow).mockClear()
		vi.mocked(provider.releaseWindow).mockClear()

		await service.mintTokenForUrl('https://youtube.com/watch?v=cached')

		expect(provider.acquireWindow).not.toHaveBeenCalled()
		expect(provider.releaseWindow).not.toHaveBeenCalled()
	})

	it('releases the lease even when the on-demand mint throws', async () => {
		const provider = makeProvider({mintToken: vi.fn().mockRejectedValue(new Error('mint blew up'))})
		const service = new TokenService(provider)

		await expect(service.mintTokenForUrl('https://youtube.com/watch?v=boom')).rejects.toThrow('mint blew up')
		expect(provider.acquireWindow).toHaveBeenCalledOnce()
		expect(provider.releaseWindow).toHaveBeenCalledOnce()
	})
})

describe('TokenService.resetSession', () => {
	// YouTube pins the googlevideo edge host to the session's visitor_data, and
	// the cache holds that identity for 5h. When the assigned host goes dark,
	// a new identity is the only recovery that does not involve restarting.
	it('replaces the cached session identity with a freshly minted one', async () => {
		const getVisitorData = vi.fn().mockResolvedValue('visitor-abc')
		const mintToken = vi.fn().mockResolvedValue('token-xyz')
		const service = new TokenService(makeProvider({getVisitorData, mintToken}))
		await service.warmUp()

		getVisitorData.mockResolvedValue('visitor-second')
		mintToken.mockResolvedValue('token-second')

		const reset = await service.resetSession()

		expect(reset).toBe(true)
		expect(await service.mintTokenForUrl('https://youtube.com/watch?v=t')).toEqual({token: 'token-second', visitorData: 'visitor-second', fromCache: true})
	})

	// The hidden window awaits `did-finish-load` with no timer of its own, so a
	// page that connects but never settles would otherwise hang the download that
	// asked for the reset. Degrade to the previous identity instead of blocking:
	// retrying with a stale token is strictly better than never retrying.
	// A cancelled job must not wait out the mint budget for an identity nobody is
	// going to use, so the caller's signal is folded in alongside the deadline.
	it('abandons the mint as soon as the caller aborts', async () => {
		const ensureReady = vi.fn().mockResolvedValue(undefined)
		const service = new TokenService(makeProvider({ensureReady}))
		await service.warmUp()

		ensureReady.mockImplementation(() => new Promise<void>(() => undefined))
		const controller = new AbortController()
		setTimeout(() => controller.abort(), 5)

		// A budget far beyond the test's patience: only the abort can settle this.
		const reset = await service.resetSession(60_000, controller.signal)

		expect(reset).toBe(false)
		expect(await service.mintTokenForUrl('https://youtube.com/watch?v=t')).toEqual({token: 'token-xyz', visitorData: 'visitor-abc', fromCache: true})
	})

	// Downloads run concurrently, so the empty window a reset opens is one any
	// other item can mint into. Restoring the stashed identity unconditionally
	// would demote that fresh one back to exactly what the reset was rejecting.
	it('does not restore the stale identity over one another caller minted meanwhile', async () => {
		const getVisitorData = vi.fn().mockResolvedValue('visitor-abc')
		const mintToken = vi.fn().mockResolvedValue('token-xyz')
		const service = new TokenService(makeProvider({getVisitorData, mintToken}))
		await service.warmUp()

		// The reset's own mint never settles; a concurrent caller mints while it hangs.
		getVisitorData.mockImplementation(async () => {
			getVisitorData.mockResolvedValue('visitor-concurrent')
			mintToken.mockResolvedValue('token-concurrent')
			await service.mintTokenForUrl('https://youtube.com/watch?v=other')
			return new Promise<string>(() => undefined)
		})

		const reset = await service.resetSession(20)

		expect(reset).toBe(false)
		expect(await service.mintTokenForUrl('https://youtube.com/watch?v=t')).toEqual({token: 'token-concurrent', visitorData: 'visitor-concurrent', fromCache: true})
	})

	it('keeps the previous identity and gives up when minting outlives its budget', async () => {
		const ensureReady = vi.fn().mockResolvedValue(undefined)
		const service = new TokenService(makeProvider({ensureReady}))
		await service.warmUp()

		ensureReady.mockImplementation(() => new Promise<void>(() => undefined))

		const reset = await service.resetSession(20)

		expect(reset).toBe(false)
		expect(await service.mintTokenForUrl('https://youtube.com/watch?v=t')).toEqual({token: 'token-xyz', visitorData: 'visitor-abc', fromCache: true})
	})
})

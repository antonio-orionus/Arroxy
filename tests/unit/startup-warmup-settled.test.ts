import {describe, expect, it} from 'vite-plus/test'
import {awaitWarmupSettled, type SplashPage} from '../../scripts/startup/warmupSettled.js'

type SplashState = 'attached' | 'detached'

const SPLASH = '[data-testid="splash-overlay"]'
const BLOCKED = '[data-testid="splash-overlay"][data-state="blocked"]'

/**
 * A page whose splash waits resolve only when the test says so, recording the
 * order the waits were started in. Playwright's real `detached` wait resolves at
 * once against the pre-mount DOM, so every `waitFor` started before the splash
 * is released here models that instant resolution.
 */
function fakePage() {
	const started: string[] = []
	const pending = new Map<string, () => void>()
	const page: SplashPage = {
		locator: selector => ({
			waitFor: ({state}: {state: SplashState; timeout: number}) => {
				const key = `${selector === BLOCKED ? 'blocked' : 'splash'}:${state}`
				started.push(key)
				return new Promise<void>(resolve => pending.set(key, resolve))
			}
		})
	}
	const release = (key: string) => {
		const resolve = pending.get(key)
		if (!resolve) throw new Error(`no pending wait for ${key}; started: ${started.join(', ')}`)
		resolve()
	}
	return {page, started, release}
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('awaitWarmupSettled', () => {
	it('does not start waiting for the splash to detach before it has been seen attached', async () => {
		const {page, started, release} = fakePage()
		const settled = awaitWarmupSettled(page, 1000)
		await flush()

		expect(started).toEqual(['splash:attached'])

		release('splash:attached')
		await flush()
		expect(started).toEqual(['splash:attached', 'splash:detached', 'blocked:attached'])

		release('splash:detached')
		await expect(settled).resolves.toBe('main-screen')
	})

	it('reports the repair panel when the splash stays mounted as the blocked container', async () => {
		const {page, release} = fakePage()
		const settled = awaitWarmupSettled(page, 1000)
		await flush()
		release('splash:attached')
		await flush()

		release('blocked:attached')
		await expect(settled).resolves.toBe('repair-panel')
	})

	it('passes the timeout to every wait', async () => {
		const timeouts: number[] = []
		const page: SplashPage = {
			locator: () => ({
				waitFor: ({timeout}) => {
					timeouts.push(timeout)
					return Promise.resolve()
				}
			})
		}
		await awaitWarmupSettled(page, 4242)
		expect(timeouts).toEqual([4242, 4242, 4242])
	})

	it('uses the splash selectors the renderer ships', async () => {
		const selectors: string[] = []
		const page: SplashPage = {
			locator: selector => {
				selectors.push(selector)
				return {waitFor: () => Promise.resolve()}
			}
		}
		await awaitWarmupSettled(page, 1)
		expect(new Set(selectors)).toEqual(new Set([SPLASH, BLOCKED]))
	})
})

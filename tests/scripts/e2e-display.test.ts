import {describe, expect, it} from 'vite-plus/test'

type E2eRunPlan = {kind: 'run'; command: string; args: string[]; env: Record<string, string | undefined>; banner: string} | {kind: 'error'; message: string}

interface E2eDisplayModule {
	planE2eRun: (input: {platform: NodeJS.Platform; env: Record<string, string | undefined>; xvfbRunAvailable: boolean; playwrightArgs: readonly string[]}) => E2eRunPlan
}

async function loadE2eDisplay(): Promise<E2eDisplayModule> {
	return (await import(new URL('../../scripts/e2eDisplay.mjs', import.meta.url).href)) as E2eDisplayModule
}

const PLAYWRIGHT_ARGS = ['playwright', 'test', 'tests/e2e/a.spec.ts']

describe('planE2eRun', () => {
	it('runs a hidden window on macOS and Windows, which keep drawing frames while hidden', async () => {
		const {planE2eRun} = await loadE2eDisplay()
		for (const platform of ['darwin', 'win32'] as const) {
			const plan = planE2eRun({platform, env: {}, xvfbRunAvailable: false, playwrightArgs: PLAYWRIGHT_ARGS})
			expect(plan).toMatchObject({kind: 'run', command: 'bunx', args: PLAYWRIGHT_ARGS})
			if (plan.kind === 'run') expect(plan.env.ARROXY_E2E_HEADLESS).toBe('1')
		}
	})

	// A hidden window on GNOME Wayland gets no frames: rAF stops, the splash's
	// fade never ends and every Playwright click waits forever for "stable".
	it('runs a Linux desktop under xvfb with a visible window, not hidden', async () => {
		const {planE2eRun} = await loadE2eDisplay()
		const plan = planE2eRun({platform: 'linux', env: {DISPLAY: ':0', WAYLAND_DISPLAY: 'wayland-0', XDG_SESSION_TYPE: 'wayland', ARROXY_E2E_HEADLESS: '1'}, xvfbRunAvailable: true, playwrightArgs: PLAYWRIGHT_ARGS})
		expect(plan).toMatchObject({kind: 'run', command: 'xvfb-run', args: ['-a', 'bunx', ...PLAYWRIGHT_ARGS]})
		if (plan.kind !== 'run') return
		expect(plan.env.ARROXY_E2E_HEADLESS).toBeUndefined()
		// Either one left set, Electron picks the desktop's Wayland server over
		// Xvfb and opens its window on the real screen.
		expect(plan.env.WAYLAND_DISPLAY).toBeUndefined()
		expect(plan.env.XDG_SESSION_TYPE).toBeUndefined()
	})

	it('runs a display-less Linux box under xvfb', async () => {
		const {planE2eRun} = await loadE2eDisplay()
		const plan = planE2eRun({platform: 'linux', env: {}, xvfbRunAvailable: true, playwrightArgs: PLAYWRIGHT_ARGS})
		expect(plan).toMatchObject({kind: 'run', command: 'xvfb-run'})
	})

	it('refuses to run on Linux without xvfb-run, display or not', async () => {
		const {planE2eRun} = await loadE2eDisplay()
		for (const env of [{}, {WAYLAND_DISPLAY: 'wayland-0'}, {DISPLAY: ':0'}]) {
			const plan = planE2eRun({platform: 'linux', env, xvfbRunAvailable: false, playwrightArgs: PLAYWRIGHT_ARGS})
			expect(plan.kind).toBe('error')
			if (plan.kind === 'error') expect(plan.message).toMatch(/xvfb/)
		}
	})

	it('does not modify the environment it was given', async () => {
		const {planE2eRun} = await loadE2eDisplay()
		const env = {WAYLAND_DISPLAY: 'wayland-0', ARROXY_E2E_HEADLESS: '1'}
		planE2eRun({platform: 'linux', env, xvfbRunAvailable: true, playwrightArgs: PLAYWRIGHT_ARGS})
		expect(env).toEqual({WAYLAND_DISPLAY: 'wayland-0', ARROXY_E2E_HEADLESS: '1'})
	})
})

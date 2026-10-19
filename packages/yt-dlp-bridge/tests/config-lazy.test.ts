import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
	vi.resetModules()
})

const managedInspect = {kind: 'inspect' as const, inspect: 'metadata' as const, url: 'https://example.com/watch?v=abc', responseFormat: 'json' as const, flatPlaylist: false, limit: 50, offset: 0, auth: {cookiesFile: path.join(os.tmpdir(), 'cookies.txt')}, network: {}}

describe('config is read when a plan needs it, not at import', () => {
	it('importing the package reads neither the environment nor the home directory', async () => {
		vi.resetModules()
		const homedir = vi.spyOn(os, 'homedir')
		await import('../src/index.js')
		await import('../src/environment.js')
		expect(homedir).not.toHaveBeenCalled()
	})

	it('a plan without options.config sees environment set after import', async () => {
		vi.resetModules()
		const {planWorkflow} = await import('../src/index.js')
		expect(() => planWorkflow(managedInspect, {configFiles: {mode: 'disabled'}})).toThrow(/auth\.cookiesFile/)
		vi.stubEnv('YTDLP_MCP_COOKIES_FILE', managedInspect.auth.cookiesFile)
		expect(planWorkflow(managedInspect, {configFiles: {mode: 'disabled'}}).args).toContain(managedInspect.auth.cookiesFile)
	})
})

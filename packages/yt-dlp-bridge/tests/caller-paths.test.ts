import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {loadConfig} from '../src/config.js'
import {planWorkflow} from '../src/index.js'

vi.mock('../src/runner.js', () => ({runCommand: vi.fn(() => Promise.reject(new Error('not run in tests')))}))

const URL = 'https://www.youtube.com/watch?v=test'

afterEach(() => {
	vi.restoreAllMocks()
})

function valuesOf(args: readonly string[], flag: string): string[] {
	return args.flatMap((arg, index) => (arg === flag ? [args[index + 1] ?? ''] : []))
}

// A plan that writes files runs inside its output folder, so a relative path
// the caller gave (from the caller's working directory) would resolve against
// that folder instead.
describe('caller paths resolve against the caller working directory', () => {
	const config = {...loadConfig({}), outputRoot: '/srv/out', tempRoot: '/srv/out/.tmp', allowConfigFiles: true}

	it('resolves a relative cookie jar and netrc in a managed download, which runs in the output root', () => {
		const plan = planWorkflow({kind: 'media', url: URL, auth: {cookiesFile: 'cookies.txt', netrcLocation: 'auth/netrc'}}, {config})

		expect(plan.cwd).toBe('/srv/out')
		expect(valuesOf(plan.args, '--cookies')).toEqual([path.resolve('cookies.txt')])
		expect(valuesOf(plan.args, '--netrc-location')).toEqual([path.resolve('auth/netrc')])
	})

	it('resolves a relative YTDLP_MCP_COOKIES_FILE', () => {
		const plan = planWorkflow({kind: 'media', url: URL}, {config: {...loadConfig({YTDLP_MCP_COOKIES_FILE: 'jar/cookies.txt'}), outputRoot: '/srv/out', tempRoot: '/srv/out/.tmp'}})

		expect(valuesOf(plan.args, '--cookies')).toEqual([path.resolve('jar/cookies.txt')])
	})

	it('resolves relative plugin folders for caller and managed plans', () => {
		const plugins = {mode: 'explicit' as const, dirs: ['plugins', '/abs/plugins']}
		const caller = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}}, {plugins})
		const managed = planWorkflow({kind: 'media', url: URL}, {config, plugins})

		for (const plan of [caller, managed]) expect(valuesOf(plan.args, '--plugin-dirs')).toEqual([path.resolve('plugins'), '/abs/plugins'])
	})

	it('passes as given a path that yt-dlp itself expands to an absolute one', () => {
		for (const file of ['~/cookies.txt', '$HOME/cookies.txt', '/abs/cookies.txt', ...(process.platform === 'win32' ? ['%USERPROFILE%\\cookies.txt'] : [])]) {
			const plan = planWorkflow({kind: 'media', url: URL, auth: {cookiesFile: file}}, {config})
			expect(valuesOf(plan.args, '--cookies'), file).toEqual([file])
		}
	})

	it('keeps the default plugin folders sentinel', () => {
		const plan = planWorkflow({kind: 'media', url: URL}, {config, plugins: {mode: 'explicit', dirs: ['default', 'plugins']}})

		expect(valuesOf(plan.args, '--plugin-dirs')).toEqual(['default', path.resolve('plugins')])
	})

	it('omits an empty cookie jar or netrc, as before', () => {
		const plan = planWorkflow({kind: 'media', url: URL, auth: {cookiesFile: '', netrcLocation: ''}}, {config})

		expect(plan.args).not.toContain('--cookies')
		expect(plan.args).not.toContain('--netrc-location')
	})

	it('passes a relative path as given to a plan that runs in the caller working directory', () => {
		const plan = planWorkflow({kind: 'inspect', inspect: 'metadata', url: URL, auth: {cookiesFile: 'cookies.txt'}}, {config, plugins: {mode: 'explicit', dirs: ['plugins']}})

		expect(plan.cwd).toBeUndefined()
		expect(valuesOf(plan.args, '--cookies')).toEqual(['cookies.txt'])
		expect(valuesOf(plan.args, '--plugin-dirs')).toEqual(['plugins'])
	})

	it('refuses a relative path when the caller working directory has text yt-dlp would expand', () => {
		vi.spyOn(process, 'cwd').mockReturnValue('/work/$HOME')

		expect(() => planWorkflow({kind: 'media', url: URL, auth: {cookiesFile: 'cookies.txt'}}, {config})).toThrow(/auth\.cookiesFile/)
		expect(planWorkflow({kind: 'media', url: URL, auth: {cookiesFile: '/abs/cookies.txt'}}, {config}).args).toContain('/abs/cookies.txt')
	})

	// yt-dlp reads `--netrc-location` with expanduser only and `--plugin-dirs`
	// with no expansion, so variables there are literal text.
	it('resolves netrc and plugin folders by how yt-dlp reads each', () => {
		vi.spyOn(process, 'cwd').mockReturnValue('/work/$HOME')
		const plan = planWorkflow({kind: 'media', url: URL, auth: {netrcLocation: '$X/netrc'}}, {config, plugins: {mode: 'explicit', dirs: ['plugins', '~/plugins']}})
		const tilde = planWorkflow({kind: 'media', url: URL, auth: {netrcLocation: '~/.netrc'}}, {config})

		expect(valuesOf(plan.args, '--netrc-location')).toEqual([path.resolve('/work/$HOME', '$X/netrc')])
		expect(valuesOf(plan.args, '--plugin-dirs')).toEqual([path.resolve('/work/$HOME', 'plugins'), path.resolve('/work/$HOME', '~/plugins')])
		expect(valuesOf(tilde.args, '--netrc-location')).toEqual(['~/.netrc'])
	})

	it('checks the environment cookie jar where the plan will find it', async () => {
		const {checkEnvironment} = await import('../src/environment.js')
		const here = path.relative(process.cwd(), import.meta.filename)
		const report = await checkEnvironment({...loadConfig({}), cookiesFile: here})

		expect(report.cookies).toMatchObject({fileConfigured: true, fileExists: true})
	})

	it('expands a leading ~ in the environment cookie jar, as yt-dlp does', async () => {
		vi.spyOn(os, 'homedir').mockReturnValue(import.meta.dirname)
		const {checkEnvironment} = await import('../src/environment.js')
		const report = await checkEnvironment({...loadConfig({}), cookiesFile: `~/${path.basename(import.meta.filename)}`})

		expect(report.cookies).toMatchObject({fileConfigured: true, fileExists: true})
	})

	it('does not guess whether a cookie jar named by a variable exists', async () => {
		const {checkEnvironment} = await import('../src/environment.js')
		const report = await checkEnvironment({...loadConfig({}), cookiesFile: '$HOME/cookies.txt'})

		expect(report.cookies.fileConfigured).toBe(true)
		expect(report.cookies.fileExists).toBeUndefined()
	})
})

import {describe, expect, it} from 'vitest'

interface ProfileBackdropServerModule {
	profileBackdropServerCommand: (platform?: NodeJS.Platform) => string
	profileBackdropServerEnv: (url: string, baseEnv?: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
	profileBackdropStopCommand: (pid: number, platform?: NodeJS.Platform) => {args: string[]; command: string} | null
}

async function loadProfileBackdropServer(): Promise<ProfileBackdropServerModule> {
	return (await import(new URL('../../scripts/profileBackdropServer.mjs', import.meta.url).href)) as ProfileBackdropServerModule
}

describe('profile backdrop server launcher', () => {
	it('pins auto-started mock server to the URL port being profiled', async () => {
		const {profileBackdropServerEnv} = await loadProfileBackdropServer()

		const env = profileBackdropServerEnv('http://127.0.0.1:45678/?theme=dark&platform=linux&backdrop=1', {PATH: '/bin'})

		expect(env).toMatchObject({PATH: '/bin', ARROXY_RENDERER_PORT: '45678'})
	})

	it('rejects auto-start for URLs without an explicit local renderer port', async () => {
		const {profileBackdropServerEnv} = await loadProfileBackdropServer()

		expect(() => profileBackdropServerEnv('https://example.com/?backdrop=1', {})).toThrow(/explicit local renderer port/)
		expect(() => profileBackdropServerEnv('http://127.0.0.1/?backdrop=1', {})).toThrow(/explicit local renderer port/)
	})

	it('uses the native Bun executable name on Windows', async () => {
		const {profileBackdropServerCommand} = await loadProfileBackdropServer()

		expect(profileBackdropServerCommand('win32')).toBe('bun.exe')
		expect(profileBackdropServerCommand('linux')).toBe('bun')
	})

	it('terminates the auto-started mock server process tree on Windows', async () => {
		const {profileBackdropStopCommand} = await loadProfileBackdropServer()

		expect(profileBackdropStopCommand(1234, 'win32')).toEqual({command: 'taskkill.exe', args: ['/PID', '1234', '/T', '/F']})
		expect(profileBackdropStopCommand(1234, 'linux')).toBeNull()
	})
})

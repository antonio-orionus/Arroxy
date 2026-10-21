import {EventEmitter} from 'node:events'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const spawnMock = vi.hoisted(() => vi.fn())
const existsMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', async importOriginal => ({...(await importOriginal<typeof import('node:child_process')>()), spawn: spawnMock}))
vi.mock('node:fs', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs')>()
	return {...actual, existsSync: (path: string) => (path === '/etc/ssl/cert.pem' ? existsMock() : actual.existsSync(path))}
})

import {spawnFFmpeg, spawnYtDlp} from '@main/utils/process.js'

const REAL_PLATFORM = process.platform

function setPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform})
}

function spawnedEnv(): NodeJS.ProcessEnv {
	return spawnMock.mock.calls.at(-1)?.[2].env
}

// A spawn always hands back a child, which the spawn helpers watch for 'close'.
beforeEach(() => spawnMock.mockImplementation(() => new EventEmitter()))

afterEach(() => {
	setPlatform(REAL_PLATFORM)
	vi.unstubAllEnvs()
	spawnMock.mockReset()
	existsMock.mockReset()
})

// The macOS ffmpeg is a static OpenSSL build whose CA path points into its
// build machine, so every HTTPS open fails certificate verification. yt-dlp's
// ffmpeg downloader (used for a part of a video) opens the media URL in ffmpeg
// itself, so the child needs a CA bundle through the environment.
describe('CA bundle for the embedded ffmpeg', () => {
	it('points OpenSSL at the system bundle on macOS', () => {
		setPlatform('darwin')
		existsMock.mockReturnValue(true)
		vi.stubEnv('SSL_CERT_FILE', '')
		vi.stubEnv('SSL_CERT_DIR', '')

		spawnYtDlp('/bin/yt-dlp', [], '/app/ffmpeg')
		expect(spawnedEnv().SSL_CERT_FILE).toBe('/etc/ssl/cert.pem')

		spawnFFmpeg('/app/ffmpeg', [])
		expect(spawnedEnv().SSL_CERT_FILE).toBe('/etc/ssl/cert.pem')
	})

	it("keeps the user's own bundle", () => {
		setPlatform('darwin')
		existsMock.mockReturnValue(true)
		vi.stubEnv('SSL_CERT_FILE', '/custom/ca.pem')

		spawnYtDlp('/bin/yt-dlp', [], '/app/ffmpeg')

		expect(spawnedEnv().SSL_CERT_FILE).toBe('/custom/ca.pem')
	})

	it('does not override a certificate directory the user set', () => {
		setPlatform('darwin')
		existsMock.mockReturnValue(true)
		vi.stubEnv('SSL_CERT_FILE', '')
		vi.stubEnv('SSL_CERT_DIR', '/custom/certs')

		spawnYtDlp('/bin/yt-dlp', [], '/app/ffmpeg')

		expect(spawnedEnv().SSL_CERT_FILE).toBeFalsy()
	})

	it('leaves the environment alone when the system bundle is missing', () => {
		setPlatform('darwin')
		existsMock.mockReturnValue(false)
		vi.stubEnv('SSL_CERT_FILE', '')
		vi.stubEnv('SSL_CERT_DIR', '')

		spawnYtDlp('/bin/yt-dlp', [], '/app/ffmpeg')

		expect(spawnedEnv().SSL_CERT_FILE).toBeFalsy()
	})

	it.each(['win32', 'linux'] as const)('does not touch it on %s, whose ffmpeg verifies certificates itself', platform => {
		setPlatform(platform)
		existsMock.mockReturnValue(true)
		vi.stubEnv('SSL_CERT_FILE', '')

		spawnYtDlp('/bin/yt-dlp', [], '/app/ffmpeg')

		expect(spawnedEnv().SSL_CERT_FILE).toBeFalsy()
	})
})

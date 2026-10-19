import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'

import {checkEmbeddedPayload, EMBEDDED_PIN_FILE, normalizeEmbeddedHostArch, writeEmbeddedPin} from '../../scripts/build/embeddedPayload.js'
import {embeddedPinFor, martinRiedlShellEnv} from '../../scripts/build/embeddedPin.js'

const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-embedded-payload-'))
	tempDirs.push(dir)
	return dir
}

async function writeFile(filePath: string, mode = 0o755): Promise<void> {
	await fs.mkdir(path.dirname(filePath), {recursive: true})
	await fs.writeFile(filePath, 'stub')
	await fs.chmod(filePath, mode).catch(() => undefined)
}

const linuxLibs = ['libavcodec.so.61', 'libavdevice.so.61', 'libavfilter.so.10', 'libavformat.so.61', 'libavutil.so.59', 'libswresample.so.5', 'libswscale.so.8']
const windowsDlls = ['avcodec-61.dll', 'avdevice-61.dll', 'avfilter-10.dll', 'avformat-61.dll', 'avutil-59.dll', 'swresample-5.dll', 'swscale-8.dll']

describe('embedded payload validation', () => {
	it('rejects unsupported host architectures instead of treating them as x64', () => {
		expect(normalizeEmbeddedHostArch('x64')).toBe('x64')
		expect(normalizeEmbeddedHostArch('arm64')).toBe('arm64')
		expect(() => normalizeEmbeddedHostArch('arm')).toThrow(/unsupported host arch/)
		expect(() => normalizeEmbeddedHostArch('ia32')).toThrow(/unsupported host arch/)
	})

	it('rejects a partial Linux shared-library payload', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg'))
		await writeFile(path.join(dir, 'ffprobe'))
		await writeFile(path.join(dir, 'libavutil.so.59'))

		const result = await checkEmbeddedPayload({platform: 'linux', arch: 'x64', dir})

		expect(result.ok).toBe(false)
		expect(result.message).toMatch(/libavcodec/)
	})

	it('accepts a complete Linux shared-library payload', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg'))
		await writeFile(path.join(dir, 'ffprobe'))
		for (const lib of linuxLibs) await writeFile(path.join(dir, lib), 0o644)
		await writeEmbeddedPin({platform: 'linux', arch: 'x64', dir})

		await expect(checkEmbeddedPayload({platform: 'linux', arch: 'x64', dir})).resolves.toMatchObject({ok: true})
	})

	it('rejects Linux shared-library entries that are not files', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg'))
		await writeFile(path.join(dir, 'ffprobe'))
		for (const lib of linuxLibs) await fs.mkdir(path.join(dir, lib), {recursive: true})

		const result = await checkEmbeddedPayload({platform: 'linux', arch: 'x64', dir})

		expect(result.ok).toBe(false)
		expect(result.message).toMatch(/shared library/)
	})

	it('rejects a partial Windows DLL payload', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg.exe'))
		await writeFile(path.join(dir, 'ffprobe.exe'))
		await writeFile(path.join(dir, 'avutil-59.dll'), 0o644)

		const result = await checkEmbeddedPayload({platform: 'win32', arch: 'x64', dir})

		expect(result.ok).toBe(false)
		expect(result.message).toMatch(/avcodec/)
	})

	it('accepts a complete Windows DLL payload', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg.exe'))
		await writeFile(path.join(dir, 'ffprobe.exe'))
		for (const dll of windowsDlls) await writeFile(path.join(dir, dll), 0o644)
		await writeEmbeddedPin({platform: 'win32', arch: 'x64', dir})

		await expect(checkEmbeddedPayload({platform: 'win32', arch: 'x64', dir})).resolves.toMatchObject({ok: true})
	})

	it.runIf(process.platform !== 'win32')('rejects non-executable POSIX binaries', async () => {
		const dir = await tempDir()
		await writeFile(path.join(dir, 'ffmpeg'), 0o644)
		await writeFile(path.join(dir, 'ffprobe'), 0o755)

		const result = await checkEmbeddedPayload({platform: 'darwin', arch: 'x64', dir})

		expect(result.ok).toBe(false)
		expect(result.message).toMatch(/not executable/)
	})

	describe('pinned build record', () => {
		async function darwinPayload(): Promise<string> {
			const dir = await tempDir()
			await writeFile(path.join(dir, 'ffmpeg'))
			await writeFile(path.join(dir, 'ffprobe'))
			return dir
		}

		it('accepts a payload recorded for the current pin', async () => {
			const dir = await darwinPayload()
			await writeEmbeddedPin({platform: 'darwin', arch: 'arm64', dir})

			await expect(checkEmbeddedPayload({platform: 'darwin', arch: 'arm64', dir})).resolves.toMatchObject({ok: true})
		})

		it('rejects a payload with no pin record, so a checkout fetched before pins were recorded refetches', async () => {
			const dir = await darwinPayload()

			const result = await checkEmbeddedPayload({platform: 'darwin', arch: 'arm64', dir})

			expect(result.ok).toBe(false)
			expect(result.message).toMatch(/no record of which FFmpeg build/)
			expect(result.message).toMatch(/bun run repair/)
		})

		it('rejects a payload recorded for an older pin', async () => {
			const dir = await darwinPayload()
			await fs.writeFile(path.join(dir, EMBEDDED_PIN_FILE), 'martin-riedl /download/macos/arm64/1782000000_N-125070/ ffmpeg=old ffprobe=old\n')

			const result = await checkEmbeddedPayload({platform: 'darwin', arch: 'arm64', dir})

			expect(result.ok).toBe(false)
			expect(result.message).toMatch(/N-125070/)
			expect(result.message).toMatch(/9\.0\.2/)
		})

		it('treats a BtbN tag override as a different pin', async () => {
			const dir = await tempDir()
			await writeFile(path.join(dir, 'ffmpeg'))
			await writeFile(path.join(dir, 'ffprobe'))
			for (const lib of linuxLibs) await writeFile(path.join(dir, lib), 0o644)
			await writeEmbeddedPin({platform: 'linux', arch: 'arm64', dir})

			await expect(checkEmbeddedPayload({platform: 'linux', arch: 'arm64', dir, env: {BTBN_RELEASE_TAG: 'autobuild-2027-01-31-13-08'}})).resolves.toMatchObject({ok: false})
			await expect(checkEmbeddedPayload({platform: 'linux', arch: 'arm64', dir, env: {BTBN_RELEASE_TAG: '  '}})).resolves.toMatchObject({ok: true})
		})

		it('names the upstream build each target is pinned to', () => {
			expect(embeddedPinFor('darwin', 'arm64', {})).toMatch(/^martin-riedl \/download\/macos\/arm64\/\d+_9\.0\.2\/ ffmpeg=[0-9a-f]{64} ffprobe=[0-9a-f]{64}$/)
			expect(embeddedPinFor('darwin', 'x64', {})).toMatch(/\/download\/macos\/amd64\//)
			expect(embeddedPinFor('linux', 'x64', {})).toMatch(/^btbn autobuild-\S+ release\/9\.0$/)
			expect(embeddedPinFor('win32', 'x64', {})).toBe(embeddedPinFor('linux', 'arm64', {}))
		})

		it('hands fetch-embedded.sh the Martin Riedl pin as shell variables', () => {
			const lines = martinRiedlShellEnv('arm64').trim().split('\n')
			expect(lines).toHaveLength(3)
			expect(lines[0]).toMatch(/^MARTIN_RIEDL_PATH='\/download\/macos\/arm64\/\d+_9\.0\.2\/'$/)
			expect(lines[1]).toMatch(/^MARTIN_RIEDL_FFMPEG_SHA='[0-9a-f]{64}'$/)
			expect(lines[2]).toMatch(/^MARTIN_RIEDL_FFPROBE_SHA='[0-9a-f]{64}'$/)
			expect(embeddedPinFor('darwin', 'arm64', {})).toContain(lines[1]?.slice('MARTIN_RIEDL_FFMPEG_SHA='.length + 1, -1))
		})
	})
})

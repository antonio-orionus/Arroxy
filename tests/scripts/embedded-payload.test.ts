import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'

import {checkEmbeddedPayload, normalizeEmbeddedHostArch} from '../../scripts/build/embeddedPayload.js'

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
})

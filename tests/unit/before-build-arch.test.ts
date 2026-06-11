import {describe, expect, it} from 'vitest'

interface BeforeBuildModule {
	resolveBuilderArch: (contextArch: unknown, hostArch: NodeJS.Architecture) => 'x64' | 'arm64' | 'ia32' | 'armv7l'
	requiredEmbeddedBinaryNames: (platform: NodeJS.Platform) => string[]
}

async function loadBeforeBuild(): Promise<BeforeBuildModule> {
	return (await import(new URL('../../build/beforeBuild.mjs', import.meta.url).href)) as BeforeBuildModule
}

describe('beforeBuild arch resolution', () => {
	it('uses string context.arch values from electron-builder instead of falling back to host arch', async () => {
		const {resolveBuilderArch} = await loadBeforeBuild()

		expect(resolveBuilderArch('x64', 'arm64')).toBe('x64')
		expect(resolveBuilderArch('arm64', 'x64')).toBe('arm64')
		expect(resolveBuilderArch('ia32', 'x64')).toBe('ia32')
		expect(resolveBuilderArch('armv7l', 'arm64')).toBe('armv7l')
	})

	it('keeps compatibility with numeric electron-builder arch enum values', async () => {
		const {resolveBuilderArch} = await loadBeforeBuild()

		// electron-builder Arch enum: 1=x64, 3=arm64
		expect(resolveBuilderArch(1, 'arm64')).toBe('x64')
		expect(resolveBuilderArch(3, 'x64')).toBe('arm64')
	})

	it('falls back to the host architecture when context.arch is absent or unsupported', async () => {
		const {resolveBuilderArch} = await loadBeforeBuild()

		expect(resolveBuilderArch(undefined, 'x64')).toBe('x64')
		expect(resolveBuilderArch(null, 'arm64')).toBe('arm64')
		expect(resolveBuilderArch('unsupported', 'arm64')).toBe('arm64')
	})

	it('requires only ffmpeg and ffprobe in packaged resources', async () => {
		const {requiredEmbeddedBinaryNames} = await loadBeforeBuild()

		expect(requiredEmbeddedBinaryNames('win32')).toEqual(['ffmpeg.exe', 'ffprobe.exe'])
		expect(requiredEmbeddedBinaryNames('darwin')).toEqual(['ffmpeg', 'ffprobe'])
		expect(requiredEmbeddedBinaryNames('linux')).toEqual(['ffmpeg', 'ffprobe'])
	})
})

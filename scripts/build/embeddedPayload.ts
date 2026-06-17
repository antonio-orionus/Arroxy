import {constants as fsConstants} from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

export type EmbeddedPlatform = 'win32' | 'darwin' | 'linux'
export type EmbeddedArch = 'x64' | 'arm64'

export interface EmbeddedPayloadStatus {
	dir: string
	message?: string
	ok: boolean
}

const LINUX_LIB_FAMILIES = ['libavcodec.so', 'libavdevice.so', 'libavfilter.so', 'libavformat.so', 'libavutil.so', 'libswresample.so', 'libswscale.so'] as const
const WINDOWS_DLL_FAMILIES = ['avcodec', 'avdevice', 'avfilter', 'avformat', 'avutil', 'swresample', 'swscale'] as const

function normalizeFileUrlForComparison(href: string): string {
	return href.replace(/^file:\/\/\/([a-zA-Z]):/, (_match, drive: string) => `file:///${drive.toUpperCase()}:`)
}

function pathLikeToFileUrl(value: string): string {
	return pathToFileURL(value).href
}

function isCliEntrypoint(meta: Pick<ImportMeta, 'url'> & {main?: boolean}, argvPath: string | undefined = process.argv[1]): boolean {
	if (meta.main === true) return true
	if (!argvPath) return false
	return normalizeFileUrlForComparison(meta.url) === normalizeFileUrlForComparison(pathLikeToFileUrl(argvPath))
}

export function normalizeEmbeddedPlatform(platform: string): EmbeddedPlatform {
	if (platform === 'win32' || platform === 'darwin' || platform === 'linux') return platform
	throw new Error(`unsupported embedded platform: ${platform}`)
}

export function normalizeEmbeddedHostArch(arch: string): EmbeddedArch {
	if (arch === 'x64' || arch === 'arm64') return arch
	throw new Error(`unsupported host arch: ${arch}`)
}

export function hostEmbeddedTarget(repoRoot: string, platform: string = process.platform, arch: string = process.arch): {arch: EmbeddedArch; dir: string; platform: EmbeddedPlatform} {
	const normalizedPlatform = normalizeEmbeddedPlatform(platform)
	const normalizedArch = normalizeEmbeddedHostArch(arch)
	return {platform: normalizedPlatform, arch: normalizedArch, dir: path.join(repoRoot, 'build', 'embedded', `${normalizedPlatform}-${normalizedArch}`)}
}

async function readDirectory(dir: string): Promise<string[]> {
	try {
		return await fs.readdir(dir)
	} catch {
		return []
	}
}

async function requireBinary(dir: string, platform: EmbeddedPlatform, name: 'ffmpeg' | 'ffprobe'): Promise<string | null> {
	const fileName = `${name}${platform === 'win32' ? '.exe' : ''}`
	const filePath = path.join(dir, fileName)
	try {
		const stat = await fs.stat(filePath)
		if (!stat.isFile()) return `${fileName} is not a file in ${dir}`
		if (platform !== 'win32') await fs.access(filePath, fsConstants.X_OK)
		return null
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		if (platform !== 'win32' && message.includes('permission denied')) return `${fileName} is not executable in ${dir}`
		if ((error as NodeJS.ErrnoException).code === 'EACCES') return `${fileName} is not executable in ${dir}`
		return `missing or unusable ${fileName} in ${dir}: ${message}`
	}
}

async function firstUsableFile(dir: string, names: string[]): Promise<string | null> {
	for (const name of names) {
		try {
			const stat = await fs.stat(path.join(dir, name))
			if (stat.isFile()) return name
		} catch {
			// Ignore unusable candidates and report the whole family below.
		}
	}
	return null
}

async function missingLinuxLib(dir: string, entries: string[]): Promise<string | null> {
	for (const family of LINUX_LIB_FAMILIES) {
		const matches = entries.filter(name => name.startsWith(family))
		if (matches.length === 0) return `${family}*`
		if (!(await firstUsableFile(dir, matches))) return `${family}* shared library is not a file`
	}
	return null
}

async function missingWindowsDll(dir: string, entries: string[]): Promise<string | null> {
	const lowerEntries = entries.map(name => ({name, lower: name.toLowerCase()}))
	for (const family of WINDOWS_DLL_FAMILIES) {
		const matches = lowerEntries.filter(entry => entry.lower.startsWith(`${family}-`) && entry.lower.endsWith('.dll')).map(entry => entry.name)
		if (matches.length === 0) return `${family}-*.dll`
		if (!(await firstUsableFile(dir, matches))) return `${family}-*.dll is not a file`
	}
	return null
}

export async function checkEmbeddedPayload(input: {arch: string; dir: string; platform: string}): Promise<EmbeddedPayloadStatus> {
	let platform: EmbeddedPlatform
	try {
		platform = normalizeEmbeddedPlatform(input.platform)
		normalizeEmbeddedHostArch(input.arch)
	} catch (error) {
		return {ok: false, dir: input.dir, message: error instanceof Error ? error.message : String(error)}
	}

	for (const binary of ['ffmpeg', 'ffprobe'] as const) {
		const failure = await requireBinary(input.dir, platform, binary)
		if (failure) return {ok: false, dir: input.dir, message: failure}
	}

	const entries = await readDirectory(input.dir)
	if (platform === 'linux') {
		const missing = await missingLinuxLib(input.dir, entries)
		if (missing) return {ok: false, dir: input.dir, message: `missing Linux FFmpeg shared library ${missing} in ${input.dir}`}
	}
	if (platform === 'win32') {
		const missing = await missingWindowsDll(input.dir, entries)
		if (missing) return {ok: false, dir: input.dir, message: `missing Windows FFmpeg DLL ${missing} in ${input.dir}`}
	}

	return {ok: true, dir: input.dir}
}

async function main(args: string[]): Promise<void> {
	const [command, platform, arch, dir] = args
	if (command === 'host-arch') {
		console.log(normalizeEmbeddedHostArch(process.arch))
		return
	}
	if ((command === 'check' || command === 'assert') && platform && arch && dir) {
		const status = await checkEmbeddedPayload({platform, arch, dir})
		if (status.ok) {
			console.log(`embedded payload OK: ${status.dir}`)
			return
		}
		if (command === 'check') process.exitCode = 1
		else throw new Error(status.message ?? `embedded payload is incomplete at ${status.dir}`)
		if (status.message) console.error(status.message)
		return
	}

	throw new Error('usage: bun scripts/build/embeddedPayload.ts <host-arch|check <platform> <arch> <dir>|assert <platform> <arch> <dir>>')
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}

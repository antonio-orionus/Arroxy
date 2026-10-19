// FFmpeg packages: build them, and install a pinned one the way the app does.
//
// build: packs ffmpeg + ffprobe + their libraries + NOTICE.txt from a
// fetch-embedded.sh output directory into a deterministic tar compressed with
// large-window brotli, and writes the manifest entry that approves it:
//
//   bash scripts/build/fetch-embedded.sh win32 x64
//   bun scripts/build/ffmpegPackage.ts build --platform win32 --arch x64 \
//     --version N-126342-gf88b741dbf-20260831 --tag ffmpeg-2026.10.19
//
// The same inputs always produce the same bytes, so a package can be rebuilt
// and checked against the pinned SHA-256 before it is published.
//
// install: downloads the pinned package for a target from its release URL,
// verifies and unpacks it with the app's own installer, and prints the install
// directory. CI scans that directory with Windows Defender. --all installs
// every pinned target, to check before a release that each asset is published.
//
//   bun scripts/build/ffmpegPackage.ts install --platform win32 --arch x64
//   bun scripts/build/ffmpegPackage.ts install --all --cache-root "$(mktemp -d)"
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {pipeline} from 'node:stream/promises'
import {constants as zlibConstants, createBrotliCompress} from 'node:zlib'
import tarStream from 'tar-stream'
import {FfmpegPackageMaterializer} from '../../src/main/services/binary/FfmpegPackageMaterializer.js'
import {FFMPEG_PACKAGE_PINS} from '../../src/main/services/binary/FfmpegPackagePins.js'
import {ARROXY_RUNTIME_BINARIES_REPO, validateFfmpegPackageEntry} from '../../src/shared/runtimeBinaryManifest.js'
import type {FfmpegPackageEntry} from '../../src/shared/types.js'
import {isCliEntrypoint} from './btbnResolver.js'

type Platform = FfmpegPackageEntry['platform']
type Arch = FfmpegPackageEntry['arch']

interface PackageInput {
	kind: 'file' | 'link'
	name: string
	source: string
	size: number
	linkTarget?: string
}

const NOTICE_NAME = 'NOTICE.txt'
// Fixed so the archive does not change with the build machine's clock.
const PACKAGE_MTIME = new Date('2000-01-01T00:00:00.000Z')
const BROTLI_LARGE_WINDOW_BITS = 30

export function ffmpegPackageAssetName(platform: Platform, arch: Arch): string {
	return `arroxy-ffmpeg-${platform}-${arch}.tar.br`
}

export function ffmpegPackageAssetUrl(tag: string, platform: Platform, arch: Arch): string {
	return `https://github.com/${ARROXY_RUNTIME_BINARIES_REPO}/releases/download/${tag}/${ffmpegPackageAssetName(platform, arch)}`
}

function executableName(platform: Platform, name: 'ffmpeg' | 'ffprobe'): string {
	return platform === 'win32' ? `${name}.exe` : name
}

// Which files in a fetch-embedded.sh output directory belong in the package.
export function isPackagedFfmpegFile(platform: Platform, name: string): boolean {
	if (name === executableName(platform, 'ffmpeg') || name === executableName(platform, 'ffprobe')) return true
	if (platform === 'win32') return /^(avcodec|avdevice|avfilter|avformat|avutil|postproc|swresample|swscale)-\d+\.dll$/.test(name)
	if (platform === 'linux') return /^lib(avcodec|avdevice|avfilter|avformat|avutil|postproc|swresample|swscale)\.so(\.\d+)*$/.test(name)
	return false
}

async function collectInputs(platform: Platform, fromDir: string, noticePath: string): Promise<PackageInput[]> {
	const inputs: PackageInput[] = []
	for (const name of (await fsPromises.readdir(fromDir)).sort()) {
		if (!isPackagedFfmpegFile(platform, name)) continue
		const source = path.join(fromDir, name)
		const stat = await fsPromises.lstat(source)
		if (stat.isSymbolicLink()) inputs.push({kind: 'link', name, source, size: 0, linkTarget: await fsPromises.readlink(source)})
		else if (stat.isFile()) inputs.push({kind: 'file', name, source, size: stat.size})
	}
	const notice = await fsPromises.stat(noticePath)
	inputs.push({kind: 'file', name: NOTICE_NAME, source: noticePath, size: notice.size})
	for (const name of ['ffmpeg', 'ffprobe'] as const) {
		if (!inputs.some(input => input.kind === 'file' && input.name === executableName(platform, name))) throw new Error(`${executableName(platform, name)} missing from ${fromDir}`)
	}
	return inputs.sort((a, b) => a.name.localeCompare(b.name))
}

async function writeArchive(inputs: PackageInput[], outPath: string): Promise<void> {
	const pack = tarStream.pack()
	const brotli = createBrotliCompress({
		params: {[zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY, [zlibConstants.BROTLI_PARAM_LARGE_WINDOW]: 1, [zlibConstants.BROTLI_PARAM_LGWIN]: BROTLI_LARGE_WINDOW_BITS, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: inputs.reduce((sum, input) => sum + input.size, 0)}
	})
	const written = pipeline(pack, brotli, fs.createWriteStream(outPath))
	const common = {mtime: PACKAGE_MTIME, uid: 0, gid: 0, uname: '', gname: ''}
	for (const input of inputs) {
		if (input.kind === 'link') {
			pack.entry({...common, name: input.name, type: 'symlink', linkname: input.linkTarget, mode: 0o777})
			continue
		}
		const mode = input.name === NOTICE_NAME ? 0o644 : 0o755
		const entry = pack.entry({...common, name: input.name, type: 'file', size: input.size, mode})
		await pipeline(fs.createReadStream(input.source), entry)
	}
	pack.finalize()
	await written
}

async function sha256File(filePath: string): Promise<string> {
	const hash = createHash('sha256')
	await pipeline(fs.createReadStream(filePath), hash)
	return hash.digest('hex')
}

export interface BuildFfmpegPackageOptions {
	platform: Platform
	arch: Arch
	version: string
	tag: string
	fromDir: string
	outDir: string
	noticePath: string
}

export async function buildFfmpegPackage(options: BuildFfmpegPackageOptions): Promise<{archivePath: string; entry: FfmpegPackageEntry}> {
	const inputs = await collectInputs(options.platform, options.fromDir, options.noticePath)
	await fsPromises.mkdir(options.outDir, {recursive: true})
	const archivePath = path.join(options.outDir, ffmpegPackageAssetName(options.platform, options.arch))
	await writeArchive(inputs, archivePath)
	const [stat, sha256] = await Promise.all([fsPromises.stat(archivePath), sha256File(archivePath)])
	const candidate: FfmpegPackageEntry = {
		id: 'ffmpeg',
		version: options.version,
		platform: options.platform,
		arch: options.arch,
		url: ffmpegPackageAssetUrl(options.tag, options.platform, options.arch),
		mirrors: [],
		size: stat.size,
		sha256,
		format: 'tar.br',
		ffmpegPath: executableName(options.platform, 'ffmpeg'),
		ffprobePath: executableName(options.platform, 'ffprobe'),
		files: inputs.filter(input => input.kind === 'file').map(input => ({path: input.name, size: input.size})),
		links: inputs.filter(input => input.kind === 'link').map(input => ({path: input.name, target: input.linkTarget ?? ''}))
	}
	const validation = validateFfmpegPackageEntry(candidate)
	if (!validation.ok) throw new Error(`Built FFmpeg package entry is invalid: ${validation.issues.join('; ')}`)
	return {archivePath, entry: validation.value}
}

function option(args: string[], name: string): string | undefined {
	const index = args.indexOf(name)
	return index >= 0 ? args[index + 1] : undefined
}

function required(args: string[], name: string): string {
	const value = option(args, name)
	if (!value) throw new Error(`${name} is required`)
	return value
}

function target(args: string[]): {platform: Platform; arch: Arch} {
	const platform = required(args, '--platform')
	const arch = required(args, '--arch')
	if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') throw new Error(`unsupported platform ${platform}`)
	if (arch !== 'x64' && arch !== 'arm64') throw new Error(`unsupported arch ${arch}`)
	return {platform, arch}
}

async function buildCommand(args: string[]): Promise<void> {
	const {platform, arch} = target(args)
	const root = path.resolve(import.meta.dirname, '..', '..')
	const {archivePath, entry} = await buildFfmpegPackage({
		platform,
		arch,
		version: required(args, '--version'),
		tag: required(args, '--tag'),
		fromDir: option(args, '--from') ?? path.join(root, 'build', 'embedded', `${platform}-${arch}`),
		outDir: option(args, '--out') ?? path.join(root, 'dist', 'ffmpeg-packages'),
		noticePath: path.join(root, 'build', 'ffmpeg-package', NOTICE_NAME)
	})
	const entryPath = archivePath.replace(/\.tar\.br$/, '.entry.json')
	await fsPromises.writeFile(entryPath, `${JSON.stringify(entry, null, 2)}\n`)
	console.log(`Wrote ${archivePath} (${entry.size} bytes, sha256 ${entry.sha256})`)
	console.log(`Wrote ${entryPath}`)
}

function pinnedEntries(args: string[]): readonly FfmpegPackageEntry[] {
	if (args.includes('--all')) return FFMPEG_PACKAGE_PINS
	const {platform, arch} = target(args)
	const entry = FFMPEG_PACKAGE_PINS.find(pin => pin.platform === platform && pin.arch === arch)
	if (!entry) throw new Error(`no pinned FFmpeg package for ${platform}-${arch}`)
	return [entry]
}

async function installCommand(args: string[]): Promise<void> {
	const cacheRoot = option(args, '--cache-root') ?? path.join(path.resolve(import.meta.dirname, '..', '..'), 'dist', 'ffmpeg-install')
	for (const entry of pinnedEntries(args)) {
		// react-doctor-disable-next-line react-doctor/async-await-in-loop -- one ~40 MB download at a time
		const install = await new FfmpegPackageMaterializer().materialize(entry, {cacheRoot})
		console.log(install.rootDir)
	}
}

async function main(args: string[]): Promise<void> {
	const [command, ...rest] = args
	if (command === 'build') return buildCommand(rest)
	if (command === 'install') return installCommand(rest)
	throw new Error('usage: bun scripts/build/ffmpegPackage.ts build|install --platform <win32|darwin|linux> --arch <x64|arm64> [options], or install --all')
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}

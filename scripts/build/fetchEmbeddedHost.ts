import {spawn} from 'node:child_process'
import {createHash} from 'node:crypto'
import {createWriteStream} from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import {pipeline} from 'node:stream/promises'
import {fileURLToPath} from 'node:url'
import * as yauzl from 'yauzl'
import {btbnTargetFor, isCliEntrypoint, resolveBtbnAsset} from './btbnResolver.js'
import {checkEmbeddedPayload, hostEmbeddedTarget, type EmbeddedPlatform} from './embeddedPayload.js'

const NETWORK_FETCH_TIMEOUT_MS = 30_000

interface DownloadedBtbnAsset {
	assetName: string
	archivePath: string
}

function repoRoot(): string {
	return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
}

function commandName(name: 'bash'): string {
	return process.platform === 'win32' ? `${name}.exe` : name
}

async function spawnChecked(command: string, args: string[], cwd: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {cwd, shell: false, stdio: 'inherit'})
		child.once('error', reject)
		child.once('exit', (code, signal) => {
			if (code === 0) {
				resolve()
				return
			}
			const suffix = signal ? `signal ${signal}` : `exit code ${code ?? 'unknown'}`
			reject(new Error(`${command} ${args.join(' ')} failed with ${suffix}`))
		})
	})
}

export async function fetchText(url: string): Promise<string> {
	const response = await fetch(url, {signal: AbortSignal.timeout(NETWORK_FETCH_TIMEOUT_MS)})
	if (!response.ok) throw new Error(`fetch failed (${response.status}): ${url}`)
	return response.text()
}

export async function downloadFile(url: string, destination: string): Promise<void> {
	const response = await fetch(url, {signal: AbortSignal.timeout(NETWORK_FETCH_TIMEOUT_MS)})
	if (!response.ok) throw new Error(`fetch failed (${response.status}): ${url}`)
	await fs.mkdir(path.dirname(destination), {recursive: true})
	await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()))
}

function shaForAsset(sums: string, assetName: string): string | null {
	for (const line of sums.split(/\r?\n/)) {
		const [hash, name] = line.trim().split(/\s+/)
		if (name === assetName) return hash
	}
	return null
}

async function sha256File(filePath: string): Promise<string> {
	return createHash('sha256')
		.update(await fs.readFile(filePath))
		.digest('hex')
}

async function verifySha(filePath: string, expected: string, label: string): Promise<void> {
	const actual = await sha256File(filePath)
	if (actual !== expected) throw new Error(`sha256 mismatch: ${label} (expected ${expected.slice(0, 8)}.., got ${actual.slice(0, 8)}..)`)
}

function openZip(zipPath: string): Promise<yauzl.ZipFile> {
	return new Promise((resolve, reject) => {
		yauzl.open(zipPath, {lazyEntries: true, validateEntrySizes: true}, (error, zipFile) => {
			if (error) {
				reject(error)
				return
			}
			if (!zipFile) {
				reject(new Error(`could not open ZIP: ${zipPath}`))
				return
			}
			resolve(zipFile)
		})
	})
}

function openReadStream(zipFile: yauzl.ZipFile, entry: yauzl.Entry): Promise<NodeJS.ReadableStream> {
	return new Promise((resolve, reject) => {
		zipFile.openReadStream(entry, (error, readStream) => {
			if (error) {
				reject(error)
				return
			}
			if (!readStream) {
				reject(new Error(`could not read ZIP entry: ${entry.fileName}`))
				return
			}
			resolve(readStream)
		})
	})
}

function safeZipDestination(root: string, fileName: string): string | null {
	const normalized = fileName.replaceAll('\\', '/')
	const parts = normalized.split('/').filter(part => part.length > 0)
	if (normalized.startsWith('/') || parts.some(part => part === '..')) return null
	return path.join(root, ...parts)
}

async function extractZipEntry(zipFile: yauzl.ZipFile, entry: yauzl.Entry, destinationRoot: string): Promise<void> {
	const destination = safeZipDestination(destinationRoot, entry.fileName)
	if (!destination) throw new Error(`unsafe ZIP entry path: ${entry.fileName}`)
	if (entry.fileName.endsWith('/')) {
		await fs.mkdir(destination, {recursive: true})
		return
	}

	await fs.mkdir(path.dirname(destination), {recursive: true})
	await pipeline(await openReadStream(zipFile, entry), createWriteStream(destination, {mode: 0o755}))
}

async function extractZip(zipPath: string, destinationRoot: string): Promise<void> {
	const zipFile = await openZip(zipPath)
	try {
		await new Promise<void>((resolve, reject) => {
			zipFile.once('end', resolve)
			zipFile.once('error', reject)
			zipFile.on('entry', (entry: yauzl.Entry) => {
				void extractZipEntry(zipFile, entry, destinationRoot).then(() => zipFile.readEntry(), reject)
			})
			zipFile.readEntry()
		})
	} finally {
		zipFile.close()
	}
}

async function walkFiles(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, {withFileTypes: true})
	const files = await Promise.all(
		entries.map(async entry => {
			const entryPath = path.join(dir, entry.name)
			if (entry.isDirectory()) return walkFiles(entryPath)
			if (entry.isFile()) return [entryPath]
			return []
		})
	)
	return files.flat()
}

async function findFile(root: string, fileName: string): Promise<string> {
	const lowerFileName = fileName.toLowerCase()
	const match = (await walkFiles(root)).find(filePath => path.basename(filePath).toLowerCase() === lowerFileName)
	if (!match) throw new Error(`${fileName} not found in extracted archive`)
	return match
}

async function downloadBtbnAsset(platform: EmbeddedPlatform, arch: string, outDir: string): Promise<DownloadedBtbnAsset> {
	const target = btbnTargetFor(platform, arch)
	if (!target) throw new Error(`unsupported BtbN host target: ${platform}-${arch}`)
	const resolution = await resolveBtbnAsset(target.btbnArch, target.ext)
	const sums = await fetchText(resolution.checksumsUrl)
	const expected = shaForAsset(sums, resolution.assetName)
	if (!expected) throw new Error(`no SHA for ${resolution.assetName} in BtbN checksums.sha256 (${resolution.tagName})`)

	const archivePath = path.join(outDir, resolution.assetName)
	await downloadFile(resolution.assetUrl, archivePath)
	await verifySha(archivePath, expected, resolution.assetName)
	return {assetName: resolution.assetName, archivePath}
}

async function fetchWindowsHost(repo: string): Promise<void> {
	const target = hostEmbeddedTarget(repo)
	const existing = await checkEmbeddedPayload(target)
	if (existing.ok) {
		console.log(`[ OK ] embedded binaries already present at ${target.dir}, skipping fetch`)
		return
	}

	await fs.rm(target.dir, {recursive: true, force: true})
	await fs.mkdir(target.dir, {recursive: true})
	const extractedDir = path.join(target.dir, '_ext')
	const asset = await downloadBtbnAsset(target.platform, target.arch, target.dir)
	await extractZip(asset.archivePath, extractedDir)

	const ffmpeg = await findFile(extractedDir, 'ffmpeg.exe')
	const ffprobe = await findFile(extractedDir, 'ffprobe.exe')
	const binDir = path.dirname(ffmpeg)
	await fs.copyFile(ffmpeg, path.join(target.dir, 'ffmpeg.exe'))
	await fs.copyFile(ffprobe, path.join(target.dir, 'ffprobe.exe'))
	for (const entry of await fs.readdir(binDir)) {
		if (entry.toLowerCase().endsWith('.dll')) await fs.copyFile(path.join(binDir, entry), path.join(target.dir, entry))
	}

	await fs.rm(extractedDir, {recursive: true, force: true})
	await fs.rm(asset.archivePath, {force: true})
	const after = await checkEmbeddedPayload(target)
	if (!after.ok) throw new Error(after.message ?? `embedded payload is incomplete at ${target.dir}`)
	console.log(`[done] embedded ffmpeg + ffprobe at ${target.dir}`)
}

async function main(): Promise<void> {
	const repo = repoRoot()
	if (process.platform !== 'win32') {
		await spawnChecked(commandName('bash'), ['scripts/build/fetch-embedded.sh', 'host'], repo)
		return
	}

	await fetchWindowsHost(repo)
}

if (isCliEntrypoint(import.meta)) {
	main().catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}

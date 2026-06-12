import {createHash, generateKeyPairSync, sign as signPayload, verify as verifyPayload} from 'node:crypto'
import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {downloadArtifactToCache, downloadText, parseShaLine} from '../../src/main/services/binary/BinaryDownloader.js'
import {probeArgs, probeBinary, probeTimeoutMs} from '../../src/main/services/binary/BinaryProbe.js'
import {RuntimeBinaryMaterializer} from '../../src/main/services/binary/RuntimeBinaryMaterializer.js'
import {RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM} from '../../src/main/services/binary/RuntimeBinaryTrust.js'
import {githubYtDlpDownloadUrl, parseSourceForgeLatestYtDlpVersion, sourceForgeYtDlpDownloadUrl, YT_DLP_SOURCES, ytDlpTargets, type YtDlpTarget} from '../../src/main/services/binary/YtDlpBinarySource.js'
import {runtimeBinaryArchFor, runtimeBinaryPlatformFor, validateRuntimeBinaryIndex} from '../../src/shared/runtimeBinaryManifest.js'
import type {RuntimeBinaryChannel, RuntimeBinaryIndex, RuntimeBinaryManifestEntry, RuntimeBinaryProvider} from '../../src/shared/types.js'

interface GithubReleaseAsset {
	name: string
	browserDownloadUrl: string
	size: number
}

interface GithubRelease {
	tagName: string
	assets: GithubReleaseAsset[]
}

interface ArtifactMetadata {
	size: number
	sha256: string
}

interface GenerateOptions {
	outPath: string
	cacheRoot?: string
	validate: boolean
}

interface ValidateOptions {
	manifestPath: string
	cacheRoot?: string
	smoke: 'current' | 'none'
}

interface SignOptions {
	manifestPath: string
	outPath: string
	privateKeyEnv: string
}

interface LocalOptions {
	outDir: string
	cacheRoot?: string
	keyPath: string
	publicKeyPath: string
	envFile: string
}

const MANIFEST_FILE_NAME = 'runtime-index-v1.json'
const SIGNATURE_FILE_NAME = 'runtime-index-v1.sig'
const LOCAL_PUBLIC_KEY_FILE_NAME = 'runtime-index-local.public.pem'
const LOCAL_PRIVATE_KEY_FILE_NAME = 'runtime-index-local.private.pem'
const LOCAL_ENV_FILE_NAME = 'runtime-index.local.env'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function stringValue(value: unknown): string | null {
	return typeof value === 'string' ? value : null
}

function numberValue(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function parseGithubReleaseAsset(value: unknown): GithubReleaseAsset | null {
	if (!isRecord(value)) return null
	const name = stringValue(value.name)
	const browserDownloadUrl = stringValue(value.browser_download_url)
	const size = numberValue(value.size)
	return name && browserDownloadUrl && size !== null ? {name, browserDownloadUrl, size} : null
}

export function parseGithubRelease(value: unknown): GithubRelease {
	if (!isRecord(value)) throw new Error('GitHub release payload was not an object')
	const tagName = stringValue(value.tag_name)
	const assets = Array.isArray(value.assets) ? value.assets.map(parseGithubReleaseAsset).filter((asset): asset is GithubReleaseAsset => asset !== null) : []
	if (!tagName) throw new Error('GitHub release payload did not include tag_name')
	if (assets.length === 0) throw new Error(`GitHub release ${tagName} did not include assets`)
	return {tagName, assets}
}

export function findGithubAsset(release: GithubRelease, assetName: string): GithubReleaseAsset {
	const asset = release.assets.find(candidate => candidate.name === assetName)
	if (!asset) throw new Error(`GitHub release ${release.tagName} did not include ${assetName}`)
	return asset
}

export function githubHeaders(env: Record<string, string | undefined> = process.env): HeadersInit {
	const headers: Record<string, string> = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'}
	const token = (env.GITHUB_TOKEN ?? env.GH_TOKEN)?.trim()
	if (token) headers.Authorization = `Bearer ${token}`
	return headers
}

async function fetchGithubRelease(apiBase: string): Promise<GithubRelease> {
	const response = await fetch(`${apiBase}/releases/latest`, {headers: githubHeaders()})
	if (!response.ok) throw new Error(`GitHub release request failed (${response.status}): ${apiBase}`)
	return parseGithubRelease(await response.json())
}

function hashText(value: string): string {
	return createHash('sha256').update(value).digest('hex')
}

function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`
}

async function artifactMetadata(url: string, expectedSha256: string, downloadRoot: string, cache: Map<string, Promise<ArtifactMetadata>>): Promise<ArtifactMetadata> {
	const cacheKey = `${url}\0${expectedSha256}`
	const cached = cache.get(cacheKey)
	if (cached) return cached

	const pending = (async (): Promise<ArtifactMetadata> => {
		const result = await downloadArtifactToCache({urls: [url], cacheRoot: path.join(downloadRoot, 'verified-cache'), key: hashText(url), sha256: expectedSha256, metadata: {url}})
		return {size: result.size, sha256: expectedSha256}
	})()
	cache.set(cacheKey, pending)
	return pending
}

async function completeEntry(entry: Omit<RuntimeBinaryManifestEntry, 'size' | 'sha256'>, expectedSha256: string, downloadRoot: string, cache: Map<string, Promise<ArtifactMetadata>>): Promise<RuntimeBinaryManifestEntry> {
	const metadata = await artifactMetadata(entry.url, expectedSha256, downloadRoot, cache)
	if (metadata.sha256 !== expectedSha256) {
		throw new Error(`${entry.id} ${entry.provider} ${entry.version} ${entry.platform}-${entry.arch} checksum mismatch. Expected ${expectedSha256}, got ${metadata.sha256}`)
	}
	return {...entry, size: metadata.size, sha256: metadata.sha256}
}

function ytDlpBaseEntry(target: YtDlpTarget, channel: RuntimeBinaryChannel, provider: RuntimeBinaryProvider, version: string, url: string): Omit<RuntimeBinaryManifestEntry, 'size' | 'sha256'> {
	return {id: 'yt-dlp', channel, provider, version, platform: target.platform, arch: target.arch, url, mirrors: [], format: 'raw', executablePath: target.executableName}
}

async function githubYtDlpEntries(channel: 'nightly' | 'stable', downloadRoot: string, cache: Map<string, Promise<ArtifactMetadata>>): Promise<RuntimeBinaryManifestEntry[]> {
	const source = channel === 'nightly' ? YT_DLP_SOURCES.nightlyGithub : YT_DLP_SOURCES.stableGithub
	const release = await fetchGithubRelease(source.api)
	const sums = await downloadText(findGithubAsset(release, 'SHA2-256SUMS').browserDownloadUrl)
	return Promise.all(
		ytDlpTargets().map(target => {
			const asset = findGithubAsset(release, target.assetName)
			const expectedSha = parseShaLine(sums, target.assetName)
			if (!expectedSha) throw new Error(`No SHA2-256SUMS entry for ${target.assetName} in ${release.tagName}`)
			const url = asset.browserDownloadUrl || githubYtDlpDownloadUrl(channel, release.tagName, target.assetName)
			return completeEntry(ytDlpBaseEntry(target, channel, 'github', release.tagName, url), expectedSha, downloadRoot, cache)
		})
	)
}

async function sourceForgeYtDlpEntries(downloadRoot: string, cache: Map<string, Promise<ArtifactMetadata>>): Promise<RuntimeBinaryManifestEntry[]> {
	const rss = await downloadText(YT_DLP_SOURCES.stableSourceForge.rss)
	const version = parseSourceForgeLatestYtDlpVersion(rss)
	if (!version) throw new Error('Could not resolve latest SourceForge yt-dlp mirror version')
	const sums = await downloadText(sourceForgeYtDlpDownloadUrl(version, 'SHA2-256SUMS'))
	return Promise.all(
		ytDlpTargets().map(target => {
			const expectedSha = parseShaLine(sums, target.assetName)
			if (!expectedSha) throw new Error(`No SourceForge SHA2-256SUMS entry for ${target.assetName} in ${version}`)
			return completeEntry(ytDlpBaseEntry(target, 'stable', 'sourceforge', version, sourceForgeYtDlpDownloadUrl(version, target.assetName)), expectedSha, downloadRoot, cache)
		})
	)
}

export async function generateRuntimeBinaryIndex(options: {cacheRoot?: string} = {}): Promise<RuntimeBinaryIndex> {
	const cacheRoot = options.cacheRoot ?? (await fsPromises.mkdtemp(path.join(os.tmpdir(), 'arroxy-runtime-manifest-')))
	const downloadRoot = path.join(cacheRoot, 'generator-downloads')
	const cache = new Map<string, Promise<ArtifactMetadata>>()
	await fsPromises.mkdir(downloadRoot, {recursive: true})
	const [nightlyEntries, stableEntries, sourceForgeEntries] = await Promise.all([githubYtDlpEntries('nightly', downloadRoot, cache), githubYtDlpEntries('stable', downloadRoot, cache), sourceForgeYtDlpEntries(downloadRoot, cache)])
	const entries = [...nightlyEntries, ...stableEntries, ...sourceForgeEntries]
	const index: RuntimeBinaryIndex = {schemaVersion: 1, generatedAt: new Date().toISOString(), entries}
	const validation = validateRuntimeBinaryIndex(index)
	if (!validation.ok) throw new Error(`Generated runtime binary index is invalid: ${validation.issues.join('; ')}`)
	return index
}

async function validateRuntimeBinaryIndexEntries(index: RuntimeBinaryIndex, cacheRoot: string, smoke: 'current' | 'none'): Promise<void> {
	const materializer = new RuntimeBinaryMaterializer()
	const currentPlatform = runtimeBinaryPlatformFor()
	const currentArch = runtimeBinaryArchFor()
	for (const entry of index.entries) {
		const result = await materializer.materialize(entry, {cacheRoot})
		if (smoke === 'current' && entry.platform === currentPlatform && entry.arch === currentArch) {
			const probe = await probeBinary(result.executablePath, probeArgs(entry.id), probeTimeoutMs(entry.id))
			if (!probe.ok) throw new Error(`Smoke probe failed for ${entry.id} ${entry.provider} ${entry.version}: ${probe.failure.message}`)
		}
	}
}

export function normalizePrivateKeyPem(value: string): string {
	const trimmed = value.trim()
	if (trimmed.includes('-----BEGIN')) return `${trimmed.replaceAll('\\n', '\n').trim()}\n`
	const decoded = Buffer.from(trimmed, 'base64').toString('utf8').trim()
	if (!decoded.includes('-----BEGIN')) throw new Error('Runtime manifest signing key must be a PEM string or base64-encoded PEM')
	return `${decoded}\n`
}

export function signRuntimeIndexPayload(payload: string, privateKeyPem: string): string {
	return signPayload(null, Buffer.from(payload), privateKeyPem).toString('base64')
}

export function verifyRuntimeIndexPayloadSignature(payload: string, signatureBase64: string, publicKeyPem: string = RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM): boolean {
	return verifyPayload(null, Buffer.from(payload), publicKeyPem, Buffer.from(signatureBase64.trim(), 'base64'))
}

function formatIndex(index: RuntimeBinaryIndex): string {
	return `${JSON.stringify(index, null, 2)}\n`
}

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

function optionValue(args: string[], name: string): string | undefined {
	const index = args.indexOf(name)
	return index >= 0 ? args[index + 1] : undefined
}

function hasFlag(args: string[], name: string): boolean {
	return args.includes(name)
}

function defaultCacheRoot(): string {
	return path.join(os.tmpdir(), 'arroxy-runtime-binary-manifest-cache')
}

function parseGenerateOptions(args: string[]): GenerateOptions {
	const outPath = optionValue(args, '--out') ?? path.join('dist', 'runtime-binaries', MANIFEST_FILE_NAME)
	return {outPath, cacheRoot: optionValue(args, '--cache-root'), validate: hasFlag(args, '--validate')}
}

function parseValidateOptions(args: string[]): ValidateOptions {
	const manifestPath = optionValue(args, '--manifest') ?? path.join('dist', 'runtime-binaries', MANIFEST_FILE_NAME)
	const smoke = optionValue(args, '--smoke') ?? 'current'
	if (smoke !== 'current' && smoke !== 'none') throw new Error('--smoke must be current or none')
	return {manifestPath, cacheRoot: optionValue(args, '--cache-root'), smoke}
}

function parseSignOptions(args: string[]): SignOptions {
	const manifestPath = optionValue(args, '--manifest') ?? path.join('dist', 'runtime-binaries', MANIFEST_FILE_NAME)
	const outPath = optionValue(args, '--out') ?? path.join(path.dirname(manifestPath), SIGNATURE_FILE_NAME)
	return {manifestPath, outPath, privateKeyEnv: optionValue(args, '--private-key-env') ?? 'ARROXY_RUNTIME_INDEX_SIGNING_KEY'}
}

function parseLocalOptions(args: string[]): LocalOptions {
	const outDir = optionValue(args, '--out-dir') ?? path.join('dist', 'runtime-binaries', 'local')
	const keyPath = optionValue(args, '--key-path') ?? path.join(outDir, LOCAL_PRIVATE_KEY_FILE_NAME)
	const publicKeyPath = optionValue(args, '--public-key-path') ?? path.join(outDir, LOCAL_PUBLIC_KEY_FILE_NAME)
	const envFile = optionValue(args, '--env-file') ?? path.join(outDir, LOCAL_ENV_FILE_NAME)
	return {outDir, cacheRoot: optionValue(args, '--cache-root'), keyPath, publicKeyPath, envFile}
}

async function readIndexFile(manifestPath: string): Promise<{raw: string; index: RuntimeBinaryIndex}> {
	const raw = await fsPromises.readFile(manifestPath, 'utf8')
	const parsed = JSON.parse(raw) as unknown
	const validation = validateRuntimeBinaryIndex(parsed)
	if (!validation.ok) throw new Error(`Runtime binary index validation failed: ${validation.issues.join('; ')}`)
	return {raw, index: validation.value}
}

async function generateCommand(args: string[]): Promise<void> {
	const options = parseGenerateOptions(args)
	const cacheRoot = options.cacheRoot ?? defaultCacheRoot()
	const index = await generateRuntimeBinaryIndex({cacheRoot})
	const raw = formatIndex(index)
	await fsPromises.mkdir(path.dirname(options.outPath), {recursive: true})
	await fsPromises.writeFile(options.outPath, raw)
	if (options.validate) await validateRuntimeBinaryIndexEntries(index, path.join(cacheRoot, 'materialized'), 'current')
	console.log(`Wrote ${options.outPath} with ${index.entries.length} entries`)
}

async function validateCommand(args: string[]): Promise<void> {
	const options = parseValidateOptions(args)
	const {index} = await readIndexFile(options.manifestPath)
	await validateRuntimeBinaryIndexEntries(index, options.cacheRoot ?? defaultCacheRoot(), options.smoke)
	console.log(`Validated ${options.manifestPath} with ${index.entries.length} entries`)
}

async function signCommand(args: string[]): Promise<void> {
	const options = parseSignOptions(args)
	const {raw} = await readIndexFile(options.manifestPath)
	const secret = process.env[options.privateKeyEnv]?.trim()
	if (!secret) throw new Error(`${options.privateKeyEnv} is required to sign runtime binary manifests`)
	const signature = signRuntimeIndexPayload(raw, normalizePrivateKeyPem(secret))
	if (!verifyRuntimeIndexPayloadSignature(raw, signature)) throw new Error('Generated runtime binary index signature did not verify against the bundled public key')
	await fsPromises.mkdir(path.dirname(options.outPath), {recursive: true})
	await fsPromises.writeFile(options.outPath, `${signature}\n`)
	console.log(`Wrote ${options.outPath}`)
}

async function readOrCreateLocalSigningKey(options: Pick<LocalOptions, 'keyPath' | 'publicKeyPath'>): Promise<{privateKeyPem: string; publicKeyPem: string; created: boolean}> {
	try {
		const [privateKeyPem, publicKeyPem] = await Promise.all([fsPromises.readFile(options.keyPath, 'utf8'), fsPromises.readFile(options.publicKeyPath, 'utf8')])
		return {privateKeyPem, publicKeyPem, created: false}
	} catch {
		const {privateKey, publicKey} = generateKeyPairSync('ed25519')
		const privateKeyPem = privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
		const publicKeyPem = publicKey.export({type: 'spki', format: 'pem'}).toString()
		await fsPromises.mkdir(path.dirname(options.keyPath), {recursive: true})
		await Promise.all([fsPromises.writeFile(options.keyPath, privateKeyPem, {mode: 0o600}), fsPromises.writeFile(options.publicKeyPath, publicKeyPem)])
		return {privateKeyPem, publicKeyPem, created: true}
	}
}

async function localCommand(args: string[]): Promise<void> {
	const options = parseLocalOptions(args)
	const manifestPath = path.join(options.outDir, MANIFEST_FILE_NAME)
	const signaturePath = path.join(options.outDir, SIGNATURE_FILE_NAME)
	const cacheRoot = options.cacheRoot ?? defaultCacheRoot()
	await fsPromises.mkdir(options.outDir, {recursive: true})
	const index = await generateRuntimeBinaryIndex({cacheRoot})
	const raw = formatIndex(index)
	const {privateKeyPem, publicKeyPem, created} = await readOrCreateLocalSigningKey(options)
	const signature = signRuntimeIndexPayload(raw, privateKeyPem)
	if (!verifyRuntimeIndexPayloadSignature(raw, signature, publicKeyPem)) throw new Error('Local runtime binary index signature did not verify against the local public key')
	await Promise.all([fsPromises.writeFile(manifestPath, raw), fsPromises.writeFile(signaturePath, `${signature}\n`)])

	const absoluteManifestPath = path.resolve(manifestPath)
	const absoluteSignaturePath = path.resolve(signaturePath)
	const absolutePublicKeyPath = path.resolve(options.publicKeyPath)
	const env = [
		`export ARROXY_RUNTIME_INDEX_FILE=${shellQuote(absoluteManifestPath)}`,
		`export ARROXY_RUNTIME_INDEX_SIG_FILE=${shellQuote(absoluteSignaturePath)}`,
		`export ARROXY_RUNTIME_INDEX_PUBLIC_KEY_FILE=${shellQuote(absolutePublicKeyPath)}`,
		"export ARROXY_RUNTIME_INDEX_URL='off'",
		"export ARROXY_RUNTIME_INDEX_SIG_URL='off'"
	].join('\n')
	await fsPromises.writeFile(options.envFile, `${env}\n`)

	console.log(`Wrote ${manifestPath} with ${index.entries.length} entries`)
	console.log(`Wrote ${signaturePath}`)
	console.log(`${created ? 'Created' : 'Reused'} local signing key at ${options.keyPath}`)
	console.log(`Wrote ${options.envFile}`)
	console.log(`Run: source ${options.envFile} && bun run dev`)
}

async function main(args: string[]): Promise<void> {
	const [command, ...rest] = args
	switch (command) {
		case 'generate':
			await generateCommand(rest)
			return
		case 'validate':
			await validateCommand(rest)
			return
		case 'sign':
			await signCommand(rest)
			return
		case 'local':
			await localCommand(rest)
			return
		default:
			throw new Error('usage: bun scripts/build/runtimeBinaryManifest.ts generate|validate|sign|local [options]')
	}
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}

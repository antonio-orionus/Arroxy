import {ffmpegPackageEntrySchema, runtimeBinaryIndexEnvelopeSchema, runtimeBinaryIndexV1Schema, runtimeBinaryManifestEntrySchema, type FfmpegPackageEntry, type RuntimeBinaryIndex, type RuntimeBinaryIndexEntry, type RuntimeBinaryIndexV1, type RuntimeBinaryManifestEntry} from './runtimeBinarySchemas.js'
import type {RuntimeBinaryPlatform} from './schemas.js'

export const ARROXY_RUNTIME_BINARIES_REPO = 'antonio-orionus/arroxy-runtime-binaries'

// yt-dlp is approved by where it is released, not just by host: anyone can
// publish a GitHub release or a SourceForge project. Each prefix is a host plus
// the path every release asset of that source starts with; a version and an
// asset name must follow it.
const YT_DLP_RELEASE_PREFIXES = {
	github: [
		{host: 'github.com', path: '/yt-dlp/yt-dlp/releases/download/'},
		{host: 'github.com', path: '/yt-dlp/yt-dlp-nightly-builds/releases/download/'}
	],
	sourceforge: [
		{host: 'sourceforge.net', path: '/projects/yt-dlp.mirror/files/'},
		{host: 'downloads.sourceforge.net', path: '/project/yt-dlp.mirror/'}
	]
} as const satisfies Record<RuntimeBinaryManifestEntry['provider'], ReadonlyArray<{host: string; path: string}>>

// FFmpeg packages are built, tested and published by us. Upstream build hosts
// rotate their assets, so a package URL anywhere else is not one we approved.
const FFMPEG_PACKAGE_PATH_PREFIX = `/${ARROXY_RUNTIME_BINARIES_REPO}/releases/download/`

const FLOATING_SEGMENTS = new Set(['latest'])

// A link chain longer than this is a cycle or a broken package, never a real
// soname chain (those are two hops: libx.so -> libx.so.N -> libx.so.N.x.y).
const MAX_LINK_HOPS = 8

type Validation<T> = {ok: true; value: T} | {ok: false; issues: string[]}
export type RuntimeBinaryManifestValidation = Validation<RuntimeBinaryIndex>
export type RuntimeBinaryManifestV1Validation = Validation<RuntimeBinaryIndexV1>
export type RuntimeBinaryManifestEntryValidation = Validation<RuntimeBinaryManifestEntry>
export type FfmpegPackageEntryValidation = Validation<FfmpegPackageEntry>

function platformPathParts(value: string): string[] {
	return value.replaceAll('\\', '/').split('/').filter(Boolean)
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function runtimeBinaryPlatformFor(platform: NodeJS.Platform = process.platform): RuntimeBinaryPlatform | null {
	return platform === 'win32' || platform === 'darwin' || platform === 'linux' ? platform : null
}

export function runtimeBinaryArchFor(arch: NodeJS.Architecture = process.arch): RuntimeBinaryManifestEntry['arch'] | null {
	return arch === 'x64' || arch === 'arm64' ? arch : null
}

export function runtimeBinaryCacheKey(entry: RuntimeBinaryManifestEntry): string {
	return ['arroxy-artifact-v1', entry.id, entry.channel, entry.provider, entry.version, entry.platform, entry.arch, entry.sha256, String(entry.size), entry.format, normalizeRuntimeExecutablePath(entry.executablePath) ?? entry.executablePath].join('\0')
}

export function ffmpegPackageCacheKey(entry: FfmpegPackageEntry): string {
	return ['arroxy-package-v1', entry.id, entry.version, entry.platform, entry.arch, entry.sha256, String(entry.size), entry.format].join('\0')
}

export function normalizeRuntimeExecutablePath(value: string): string | null {
	const normalized = value.replaceAll('\\', '/')
	if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.includes('\0')) return null
	const parts = platformPathParts(normalized)
	if (parts.length === 0 || parts.some(part => part === '.' || part === '..')) return null
	return parts.join('/')
}

function immutableHttpsUrlIssue(rawUrl: string): {parsed: URL; issue: null} | {parsed: null; issue: string} {
	let parsed: URL
	try {
		parsed = new URL(rawUrl)
	} catch {
		return {parsed: null, issue: `invalid URL: ${rawUrl}`}
	}
	if (parsed.protocol !== 'https:') return {parsed: null, issue: `URL must use HTTPS: ${rawUrl}`}
	const segments = parsed.pathname.split('/').filter(Boolean)
	if (segments.some(segment => FLOATING_SEGMENTS.has(segment.toLowerCase()))) return {parsed: null, issue: `URL must be immutable, not /latest: ${rawUrl}`}
	return {parsed, issue: null}
}

function runtimeManifestUrlIssue(rawUrl: string, provider: RuntimeBinaryManifestEntry['provider']): string | null {
	const checked = immutableHttpsUrlIssue(rawUrl)
	if (!checked.parsed) return checked.issue
	const {hostname, pathname} = checked.parsed
	const released = YT_DLP_RELEASE_PREFIXES[provider].some(prefix => hostname === prefix.host && pathname.startsWith(prefix.path) && pathname.slice(prefix.path.length).split('/').filter(Boolean).length >= 2)
	return released ? null : `URL must be a ${provider} yt-dlp release asset: ${rawUrl}`
}

function ffmpegPackageUrlIssue(rawUrl: string): string | null {
	const checked = immutableHttpsUrlIssue(rawUrl)
	if (!checked.parsed) return checked.issue
	if (checked.parsed.hostname !== 'github.com' || !checked.parsed.pathname.startsWith(FFMPEG_PACKAGE_PATH_PREFIX)) return `FFmpeg package URL must be a ${ARROXY_RUNTIME_BINARIES_REPO} release asset: ${rawUrl}`
	return null
}

function zodIssues(error: {issues: Array<{message: string; path: PropertyKey[]}>}): string[] {
	return error.issues.map(issue => (issue.path.length > 0 ? `${issue.path.map(String).join('.')}: ${issue.message}` : issue.message))
}

export function validateRuntimeBinaryManifestEntry(input: unknown): RuntimeBinaryManifestEntryValidation {
	const parsed = runtimeBinaryManifestEntrySchema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: zodIssues(parsed.error)}
	const issues: string[] = []
	const entry = parsed.data
	const urls = [entry.url, ...entry.mirrors]
	for (const url of urls) {
		const issue = runtimeManifestUrlIssue(url, entry.provider)
		if (issue) issues.push(issue)
	}
	if (!normalizeRuntimeExecutablePath(entry.executablePath)) issues.push(`executablePath must be a normalized relative path: ${entry.executablePath}`)
	const normalizedExecutablePath = normalizeRuntimeExecutablePath(entry.executablePath)
	if (entry.format === 'raw' && normalizedExecutablePath && normalizedExecutablePath.includes('/')) {
		issues.push('raw executablePath must be a single file name')
	}
	return issues.length === 0 ? {ok: true, value: entry} : {ok: false, issues}
}

function posixDirname(value: string): string {
	const index = value.lastIndexOf('/')
	return index < 0 ? '' : value.slice(0, index)
}

// Where a link points inside the package, or null when the target is absolute
// or climbs out of the package root.
function resolveFfmpegPackageLinkTarget(linkPath: string, target: string): string | null {
	if (target.startsWith('/') || target.startsWith('\\') || /^[A-Za-z]:/.test(target) || target.includes('\0')) return null
	const parts = platformPathParts(posixDirname(linkPath))
	for (const part of platformPathParts(target)) {
		if (part === '.') continue
		if (part === '..') {
			if (parts.length === 0) return null
			parts.pop()
			continue
		}
		parts.push(part)
	}
	return parts.length > 0 ? parts.join('/') : null
}

function ffmpegPackagePathIssues(entry: FfmpegPackageEntry): string[] {
	const issues: string[] = []
	const files = new Set<string>()
	const links = new Map<string, string>()
	for (const file of entry.files) {
		const normalized = normalizeRuntimeExecutablePath(file.path)
		if (!normalized) issues.push(`file path must be a normalized relative path: ${file.path}`)
		else if (files.has(normalized)) issues.push(`duplicate package path: ${file.path}`)
		else files.add(normalized)
	}
	for (const link of entry.links) {
		const normalized = normalizeRuntimeExecutablePath(link.path)
		if (!normalized) issues.push(`link path must be a normalized relative path: ${link.path}`)
		else if (files.has(normalized) || links.has(normalized)) issues.push(`duplicate package path: ${link.path}`)
		else links.set(normalized, link.target)
	}
	for (const [linkPath, target] of links) {
		let current: string | null = resolveFfmpegPackageLinkTarget(linkPath, target)
		let hops = 0
		while (current && links.has(current) && hops < MAX_LINK_HOPS) {
			current = resolveFfmpegPackageLinkTarget(current, links.get(current) ?? '')
			hops++
		}
		if (!current || !files.has(current)) issues.push(`link ${linkPath} must resolve to a file inside the package (target ${target})`)
	}
	for (const [field, value] of [
		['ffmpegPath', entry.ffmpegPath],
		['ffprobePath', entry.ffprobePath]
	] as const) {
		const normalized = normalizeRuntimeExecutablePath(value)
		if (!normalized || !files.has(normalized)) issues.push(`${field} must name a regular file listed in the package: ${value}`)
	}
	return issues
}

export function validateFfmpegPackageEntry(input: unknown): FfmpegPackageEntryValidation {
	const parsed = ffmpegPackageEntrySchema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: zodIssues(parsed.error)}
	const entry = parsed.data
	const issues = [...[entry.url, ...entry.mirrors].map(ffmpegPackageUrlIssue).filter((issue): issue is string => issue !== null), ...ffmpegPackagePathIssues(entry)]
	return issues.length === 0 ? {ok: true, value: entry} : {ok: false, issues}
}

function validateIndexEntry(input: unknown): Validation<RuntimeBinaryIndexEntry> | {ok: 'skip'} {
	const id = isRecord(input) ? input.id : undefined
	if (id === 'yt-dlp') return validateRuntimeBinaryManifestEntry(input)
	if (id === 'ffmpeg') return validateFfmpegPackageEntry(input)
	return {ok: 'skip'}
}

export interface DroppedRuntimeBinaryIndexEntry {
	position: number
	id: RuntimeBinaryIndexEntry['id']
	issues: string[]
}

export type RuntimeBinaryIndexRead = {ok: true; value: RuntimeBinaryIndex; dropped: DroppedRuntimeBinaryIndexEntry[]} | {ok: false; issues: string[]; dropped: DroppedRuntimeBinaryIndexEntry[]}

type IndexPartition = {ok: true; value: RuntimeBinaryIndex; dropped: DroppedRuntimeBinaryIndexEntry[]} | {ok: false; issues: string[]}

function partitionRuntimeBinaryIndex(input: unknown): IndexPartition {
	const parsed = runtimeBinaryIndexEnvelopeSchema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: zodIssues(parsed.error)}
	const entries: RuntimeBinaryIndexEntry[] = []
	const dropped: DroppedRuntimeBinaryIndexEntry[] = []
	for (const [position, raw] of parsed.data.entries.entries()) {
		const result = validateIndexEntry(raw)
		if (result.ok === 'skip') continue
		if (result.ok) entries.push(result.value)
		else dropped.push({position, id: isRecord(raw) && raw.id === 'ffmpeg' ? 'ffmpeg' : 'yt-dlp', issues: result.issues})
	}
	return {ok: true, value: {schemaVersion: 2, generatedAt: parsed.data.generatedAt, entries}, dropped}
}

// Publishing gate: every entry of a known kind must be valid, so a bad entry
// never reaches users.
export function validateRuntimeBinaryIndex(input: unknown): RuntimeBinaryManifestValidation {
	const partition = partitionRuntimeBinaryIndex(input)
	if (!partition.ok) return partition
	const issues = partition.dropped.flatMap(entry => entry.issues.map(issue => `entries[${entry.position}]: ${issue}`))
	return issues.length === 0 ? {ok: true, value: partition.value} : {ok: false, issues}
}

// What an installed client accepts. Its rules are frozen into every release, so
// an entry it cannot use (a newer format, provider, channel or host) costs that
// entry, never the index; only a broken envelope or nothing usable for this
// machine rejects it.
export function readRuntimeBinaryIndex(input: unknown, platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): RuntimeBinaryIndexRead {
	const partition = partitionRuntimeBinaryIndex(input)
	if (!partition.ok) return {...partition, dropped: []}
	const usable = runtimeEntriesForCurrentTarget(partition.value, 'yt-dlp', platform, arch).length + runtimeEntriesForCurrentTarget(partition.value, 'ffmpeg', platform, arch).length
	if (usable === 0) return {ok: false, issues: [`no usable entries for ${platform}/${arch}`], dropped: partition.dropped}
	return partition
}

export function validateRuntimeBinaryIndexV1(input: unknown): RuntimeBinaryManifestV1Validation {
	const parsed = runtimeBinaryIndexV1Schema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: parsed.error.issues.map(issue => issue.message)}
	const issues: string[] = []
	for (const [index, entry] of parsed.data.entries.entries()) {
		const result = validateRuntimeBinaryManifestEntry(entry)
		if (!result.ok) issues.push(...result.issues.map(issue => `entries[${index}]: ${issue}`))
	}
	return issues.length === 0 ? {ok: true, value: parsed.data} : {ok: false, issues}
}

type EntryFor<Id extends RuntimeBinaryIndexEntry['id']> = Extract<RuntimeBinaryIndexEntry, {id: Id}>

export function runtimeEntriesForCurrentTarget<Id extends RuntimeBinaryIndexEntry['id']>(index: Pick<RuntimeBinaryIndex, 'entries'>, id: Id, platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): Array<EntryFor<Id>> {
	const targetPlatform = runtimeBinaryPlatformFor(platform)
	const targetArch = runtimeBinaryArchFor(arch)
	if (!targetPlatform || !targetArch) return []
	return index.entries.filter((entry): entry is EntryFor<Id> => entry.id === id && entry.platform === targetPlatform && entry.arch === targetArch)
}

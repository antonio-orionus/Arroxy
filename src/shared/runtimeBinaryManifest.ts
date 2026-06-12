import {runtimeBinaryIndexSchema, runtimeBinaryManifestEntrySchema, type RuntimeBinaryId, type RuntimeBinaryIndex, type RuntimeBinaryManifestEntry, type RuntimeBinaryPlatform} from './schemas.js'

const PROVIDER_HOSTS = {github: new Set(['github.com']), sourceforge: new Set(['sourceforge.net', 'downloads.sourceforge.net'])} as const satisfies Record<RuntimeBinaryManifestEntry['provider'], ReadonlySet<string>>

const FLOATING_SEGMENTS = new Set(['latest'])

export type RuntimeBinaryManifestValidation = {ok: true; value: RuntimeBinaryIndex} | {ok: false; issues: string[]}
export type RuntimeBinaryManifestEntryValidation = {ok: true; value: RuntimeBinaryManifestEntry} | {ok: false; issues: string[]}

function platformPathParts(value: string): string[] {
	return value.replaceAll('\\', '/').split('/').filter(Boolean)
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

export function normalizeRuntimeExecutablePath(value: string): string | null {
	const normalized = value.replaceAll('\\', '/')
	if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.includes('\0')) return null
	const parts = platformPathParts(normalized)
	if (parts.length === 0 || parts.some(part => part === '.' || part === '..')) return null
	return parts.join('/')
}

function runtimeManifestUrlIssue(rawUrl: string, provider: RuntimeBinaryManifestEntry['provider']): string | null {
	let parsed: URL
	try {
		parsed = new URL(rawUrl)
	} catch {
		return `invalid URL: ${rawUrl}`
	}
	if (parsed.protocol !== 'https:') return `URL must use HTTPS: ${rawUrl}`
	if (!PROVIDER_HOSTS[provider].has(parsed.hostname)) return `URL host ${parsed.hostname} is not allowlisted for ${provider}`
	const segments = parsed.pathname.split('/').filter(Boolean)
	if (segments.some(segment => FLOATING_SEGMENTS.has(segment.toLowerCase()))) return `URL must be immutable, not /latest: ${rawUrl}`
	return null
}

export function validateRuntimeBinaryManifestEntry(input: unknown): RuntimeBinaryManifestEntryValidation {
	const parsed = runtimeBinaryManifestEntrySchema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: parsed.error.issues.map(issue => issue.message)}
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

export function validateRuntimeBinaryIndex(input: unknown): RuntimeBinaryManifestValidation {
	const parsed = runtimeBinaryIndexSchema.safeParse(input)
	if (!parsed.success) return {ok: false, issues: parsed.error.issues.map(issue => issue.message)}
	const issues: string[] = []
	for (const [index, entry] of parsed.data.entries.entries()) {
		const result = validateRuntimeBinaryManifestEntry(entry)
		if (!result.ok) issues.push(...result.issues.map(issue => `entries[${index}]: ${issue}`))
	}
	return issues.length === 0 ? {ok: true, value: parsed.data} : {ok: false, issues}
}

export function runtimeEntriesForCurrentTarget(index: RuntimeBinaryIndex, id: RuntimeBinaryId, platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): RuntimeBinaryManifestEntry[] {
	const targetPlatform = runtimeBinaryPlatformFor(platform)
	const targetArch = runtimeBinaryArchFor(arch)
	if (!targetPlatform || !targetArch) return []
	return index.entries.filter(entry => entry.id === id && entry.platform === targetPlatform && entry.arch === targetArch)
}

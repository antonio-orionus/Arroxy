export interface ReleaseNotesSection {
	title: string
	body: string[]
	bullets: string[]
}

export interface ReleaseNotes {
	version: string
	intro: string[]
	sections: ReleaseNotesSection[]
}

/** Everything the user missed, newest release first. */
export interface ReleaseNotesDigest {
	version: string
	releases: ReleaseNotes[]
}

interface ParsedVersion {
	major: number
	minor: number
	patch: number
	pre: string[]
}

/** Matches `## 1.2.3` / `## v1.2.3` headings, not `## Unreleased` or `## Highlights`. */
const VERSION_HEADING = /^##\s+v?(\d[0-9A-Za-z.+-]*)$/i

export function extractReleaseNotesMarkdown(changelog: string, version: string): string | null {
	const target = `## ${normalizeVersion(version)}`
	const lines = changelog.split(/\r?\n/)
	const captured: string[] = []
	let capture = false

	for (const line of lines) {
		const trimmed = line.trim()
		if (!capture && trimmed === target) {
			capture = true
			continue
		}
		if (capture && /^##\s+v?\d/i.test(trimmed)) break
		if (capture) captured.push(line)
	}

	while (captured.length > 0 && isIgnorableEdgeLine(captured[0])) captured.shift()
	while (captured.length > 0 && isIgnorableEdgeLine(captured[captured.length - 1])) captured.pop()

	const markdown = captured.join('\n').trim()
	return markdown.length > 0 ? markdown : null
}

export function parseReleaseNotes(version: string, markdown: string): ReleaseNotes {
	const intro: string[] = []
	const sections: ReleaseNotesSection[] = []
	let current: ReleaseNotesSection | null = null

	for (const rawLine of markdown.split(/\r?\n/)) {
		const line = rawLine.trim()
		if (!line || line === '---') continue
		if (line.startsWith('## ')) continue
		if (line.startsWith('### ')) {
			current = {title: cleanInlineMarkdown(line.slice(4)), body: [], bullets: []}
			sections.push(current)
			continue
		}
		if (line.startsWith('- ')) {
			const bullet = cleanInlineMarkdown(line.slice(2))
			if (current) current.bullets.push(bullet)
			else intro.push(bullet)
			continue
		}

		const paragraph = cleanInlineMarkdown(line)
		if (current) current.body.push(paragraph)
		else intro.push(paragraph)
	}

	return {version: normalizeVersion(version), intro, sections: sections.filter(section => section.title.length > 0 && (section.body.length > 0 || section.bullets.length > 0))}
}

export function releaseNotesForVersion(changelog: string, version: string): ReleaseNotes | null {
	const markdown = extractReleaseNotesMarkdown(changelog, version)
	return markdown ? parseReleaseNotes(version, markdown) : null
}

/** Version headings in the order they appear in the file; callers sort if they care. */
export function listChangelogVersions(changelog: string): string[] {
	const seen = new Set<string>()
	const versions: string[] = []
	for (const line of changelog.split(/\r?\n/)) {
		const match = VERSION_HEADING.exec(line.trim())
		const version = match?.[1] ? normalizeVersion(match[1]) : null
		if (!version || seen.has(version) || !parseVersion(version)) continue
		seen.add(version)
		versions.push(version)
	}
	return versions
}

/**
 * Notes for every stable release in `(lastShownVersion, appVersion]`, so a user
 * jumping several versions sees everything they missed rather than only the
 * newest section. Intermediate pre-releases are skipped — their content is
 * consolidated into the stable section they shipped under — but the running
 * build's own section is always included, pre-release or not.
 *
 * Without a `lastShownVersion` there is nothing to catch up on (a fresh install
 * has not missed anything), so only the running version's notes are returned.
 */
export function releaseNotesSince(changelog: string, input: {appVersion: string; lastShownVersion?: string}): ReleaseNotesDigest | null {
	const current = releaseNotesForVersion(changelog, input.appVersion)
	if (!current) return null

	const lastShown = input.lastShownVersion
	if (!lastShown) return {version: current.version, releases: [current]}

	const skipped = listChangelogVersions(changelog)
		.filter(version => version !== current.version && !isPreRelease(version) && compareSemver(version, lastShown) > 0 && compareSemver(version, current.version) < 0)
		.sort((a, b) => compareSemver(b, a))
		.map(version => releaseNotesForVersion(changelog, version))
		.filter((notes): notes is ReleaseNotes => notes !== null)

	return {version: current.version, releases: [current, ...skipped]}
}

export function shouldShowWhatsNew(input: {appVersion: string; lastShownVersion?: string; launchCount?: number; notes: {version: string} | null}): boolean {
	if (!input.notes) return false
	if ((input.launchCount ?? 1) <= 1) return false
	if (!input.lastShownVersion) return true
	return compareSemver(input.appVersion, input.lastShownVersion) > 0
}

function normalizeVersion(version: string): string {
	return version.trim().replace(/^v/i, '')
}

function isIgnorableEdgeLine(line: string): boolean {
	const trimmed = line.trim()
	return trimmed.length === 0 || trimmed === '---'
}

function cleanInlineMarkdown(value: string): string {
	return value
		.trim()
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
}

function isPreRelease(version: string): boolean {
	return (parseVersion(version)?.pre.length ?? 0) > 0
}

function parseVersion(version: string): ParsedVersion | null {
	const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(normalizeVersion(version))
	if (!match) return null
	return {major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), pre: match[4]?.split('.') ?? []}
}

function compareSemver(a: string, b: string): number {
	const left = parseVersion(a)
	const right = parseVersion(b)
	if (!left || !right) return normalizeVersion(a) === normalizeVersion(b) ? 0 : -1
	for (const key of ['major', 'minor', 'patch'] as const) {
		const delta = left[key] - right[key]
		if (delta !== 0) return delta
	}
	if (left.pre.length === 0 && right.pre.length > 0) return 1
	if (left.pre.length > 0 && right.pre.length === 0) return -1
	for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i++) {
		const l = left.pre[i]
		const r = right.pre[i]
		if (l === undefined) return -1
		if (r === undefined) return 1
		const ln = /^\d+$/.test(l) ? Number(l) : null
		const rn = /^\d+$/.test(r) ? Number(r) : null
		if (ln !== null && rn !== null && ln !== rn) return ln - rn
		if (ln !== null && rn === null) return -1
		if (ln === null && rn !== null) return 1
		if (l !== r) return l.localeCompare(r)
	}
	return 0
}

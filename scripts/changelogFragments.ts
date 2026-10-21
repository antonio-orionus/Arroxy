import gt from 'semver/functions/gt.js'
import valid from 'semver/functions/valid.js'

// Pure helpers for changelog.ts. Each PR adds one changelog fragment,
// `changelog.d/<slug>.<kind>.md`, instead of editing CHANGELOG.md, so open PRs
// never conflict on the same lines. The release commit assembles every fragment
// into the version's `## X` section and deletes them.

export const FRAGMENT_DIR = 'changelog.d'
export const FRAGMENT_README = 'README.md'

// Kinds in the order a release section lists them. `intro` paragraphs sit
// directly under `## X`; the others become bullets under their heading.
const FRAGMENT_SECTIONS = {intro: null, highlight: 'Highlights', fix: 'Fixes', note: 'Good to know'} as const
export type FragmentKind = keyof typeof FRAGMENT_SECTIONS
const FRAGMENT_KINDS = Object.keys(FRAGMENT_SECTIONS) as FragmentKind[]

export interface Fragment {
	file: string
	kind: FragmentKind
	text: string
}

// Any `<slug>.<word>.md`; fragmentKind then checks the word is a known kind.
const FRAGMENT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.([a-z]+)\.md$/
const VERSION_HEADING = /^##\s+v?(\d[0-9A-Za-z.+-]*)\s*$/

const baseName = (file: string): string => file.replaceAll('\\', '/').split('/').pop() ?? file

function fragmentKind(file: string): FragmentKind | null {
	const kind = FRAGMENT_NAME.exec(baseName(file))?.[1]
	return FRAGMENT_KINDS.find(known => known === kind) ?? null
}

/** Everything wrong with one fragment; empty when it is well formed. */
export function fragmentProblems(file: string, contents: string): string[] {
	const kind = fragmentKind(file)
	if (kind === null) return [`${file}: name it <slug>.<kind>.md, with a kebab-case slug and a kind of ${FRAGMENT_KINDS.join(', ')}`]
	const body = contents.trim()
	if (body === '') return [`${file}: empty fragment; delete it if the change has nothing user-facing`]
	const problems: string[] = []
	if (/\n\s*\n/.test(body)) problems.push(`${file}: write one paragraph; split separate changes into separate fragments`)
	const lines = body.split(/\r?\n/).map(line => line.trim())
	if (lines.some(line => line.startsWith('#'))) problems.push(`${file}: no heading; the kind in the file name picks the section`)
	if (lines.some(line => /^(?:[-*+]|\d+[.)])\s/.test(line))) problems.push(`${file}: no bullet marker; assembly adds it`)
	if (kind === 'highlight' && !/^\*\*[^*].*?\*\*/.test(lines.join(' '))) problems.push(`${file}: a highlight opens with a bold lead-in, like **New thing.**`)
	return problems
}

/** Reads a well-formed fragment; run fragmentProblems first. */
export function parseFragment(file: string, contents: string): Fragment {
	const kind = fragmentKind(file)
	if (kind === null) throw new Error(`${file} is not a changelog fragment`)
	const text = contents
		.trim()
		.split(/\r?\n/)
		.map(line => line.trim())
		.join(' ')
	return {file, kind, text}
}

/** The `## X` section for these fragments, kinds in section order and each kind in the order given. */
export function assembleSection(version: string, fragments: readonly Fragment[]): string {
	const blocks = [`## ${version}`]
	for (const kind of FRAGMENT_KINDS) {
		const texts = fragments.filter(fragment => fragment.kind === kind).map(fragment => fragment.text)
		if (texts.length === 0) continue
		const heading = FRAGMENT_SECTIONS[kind]
		if (heading === null) blocks.push(...texts)
		else blocks.push(`## ${heading}`, texts.map(text => `- ${text}`).join('\n'))
	}
	return `${blocks.join('\n\n')}\n`
}

const versionHeadings = (changelog: string): string[] => changelog.split(/\r?\n/).flatMap(line => VERSION_HEADING.exec(line.trim())?.[1] ?? [])

/** The body of a version's section, without its heading; null when there is no such section. */
export function releaseSectionBody(changelog: string, version: string): string | null {
	const lines = changelog.split(/\r?\n/)
	const start = lines.findIndex(line => line.trim() === `## ${version}`)
	if (start === -1) return null
	const end = lines.findIndex((line, index) => index > start && VERSION_HEADING.test(line.trim()))
	return lines
		.slice(start + 1, end === -1 ? lines.length : end)
		.join('\n')
		.trim()
}

/** Puts the section above the newest release, or at the end when there is none. */
export function insertSection(changelog: string, version: string, section: string): string {
	if (versionHeadings(changelog).includes(version)) throw new Error(`CHANGELOG.md already has a ## ${version} section`)
	const lines = changelog.split('\n')
	const at = lines.findIndex(line => VERSION_HEADING.test(line.trim()))
	if (at === -1) return `${changelog.trimEnd()}\n\n${section}`
	return [...lines.slice(0, at), ...section.split('\n'), ...lines.slice(at)].join('\n')
}

/**
 * CHANGELOG.md holds released versions only: no section is newer than the
 * package version, which only a `release: X` commit bumps. A beta may go
 * without a section of its own, and corrections to an already-released
 * section stay allowed.
 */
export function changelogProblems(changelog: string, packageVersion: string): string[] {
	const useFragments = `Unreleased changes go in a ${FRAGMENT_DIR}/<slug>.<kind>.md fragment; see ${FRAGMENT_DIR}/${FRAGMENT_README}`
	const lines = changelog.split(/\r?\n/).map(line => line.trim())
	const firstRelease = lines.findIndex(line => VERSION_HEADING.test(line))
	// A `## Unreleased` (or any section) above the newest release would be
	// left out of every release's notes.
	const stray = lines.slice(0, firstRelease === -1 ? lines.length : firstRelease).find(line => /^##\s/.test(line))
	if (stray !== undefined) return [`CHANGELOG.md: "${stray}" sits above the newest release. ${useFragments}`]
	const unreleased = versionHeadings(changelog).find(version => valid(version) !== null && gt(version, packageVersion))
	if (unreleased === undefined) return []
	return [`CHANGELOG.md: it has a ## ${unreleased} section, but package.json is ${packageVersion}. ${useFragments}`]
}

/**
 * Fragment files in the order they reached the branch, read from
 * `git log --first-parent --diff-filter=A --format=%x00%H --name-only`
 * (newest commit first). First-parent history ranks a fragment by the squash
 * or merge commit that brought it in, not by when it was written. Fragments
 * git has not seen come last; ties go by file name.
 */
export function orderFragmentFiles(files: readonly string[], gitLog: string): string[] {
	const commits = gitLog.split('\u0000').filter(entry => entry.trim() !== '')
	const arrival = new Map<string, number>()
	commits.forEach((entry, newestFirst) => {
		for (const name of entry.split('\n').slice(1)) if (name !== '' && !arrival.has(name)) arrival.set(name, commits.length - newestFirst)
	})
	const when = (file: string): number => arrival.get(file) ?? Number.POSITIVE_INFINITY
	return [...files].sort((a, b) => when(a) - when(b) || (a < b ? -1 : a > b ? 1 : 0))
}

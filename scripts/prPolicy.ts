import gt from 'semver/functions/gt.js'
import valid from 'semver/functions/valid.js'
import {releaseSectionBody, versionHeadings} from './changelogFragments.js'

// Pure rules for check-pr-policy.ts: what a pull request may contain, read from
// its own diff against the merge base, its commits and its title and body.
// AGENTS.md states each one as a working convention; this makes them checks.
// Every rule has an opt-out: a `<key>: <reason>` line in the PR body.

export const POLICY_RULES = ['changelog-fragment', 'released-changelog', 'english-only', 'package-scope', 'base-branch', 'ai-attribution'] as const
export type PolicyRule = (typeof POLICY_RULES)[number]

/** The PR body line that waives each rule, followed by `: <reason>`. */
export const OPT_OUT_KEYS: Readonly<Record<PolicyRule, string>> = {'changelog-fragment': 'No changelog', 'released-changelog': 'Released changelog edit', 'english-only': 'Translation change', 'package-scope': 'Package and app together', 'base-branch': 'Stacked PR', 'ai-attribution': 'Attribution false positive'}

/** The title the release translation sync PR opens with (translate-arroxy-i18n skill). */
export const TRANSLATION_SYNC_TITLE = 'i18n: sync translations'

export interface ChangedFile {
	/** The status letter of `git diff --name-status --no-renames`: A, M, D or T. */
	status: string
	path: string
}

export interface Commit {
	sha: string
	message: string
}

export interface PullRequestFacts {
	title: string
	body: string
	baseRef: string
	defaultBranch: string
	files: readonly ChangedFile[]
	commits: readonly Commit[]
	/**
	 * CHANGELOG.md at the merge base and at the head, and the merge base's
	 * package.json version, the newest release; null when the PR leaves
	 * CHANGELOG.md alone.
	 */
	changelog: {base: string; head: string; releasedVersion: string} | null
}

export interface PolicyFailure {
	rule: PolicyRule
	message: string
}

export interface PolicyResult {
	failures: PolicyFailure[]
	waived: {rule: PolicyRule; reason: string}[]
	/** The release translation sync, which must pass `check:i18n:complete` instead of the English-only rule. */
	translationSync: boolean
}

/** Reads `git diff --name-status --no-renames -z` output. */
export function parseNameStatus(output: string): ChangedFile[] {
	const fields = output.split('\0')
	const files: ChangedFile[] = []
	for (let index = 0; index + 1 < fields.length; index += 2) {
		const status = fields[index] ?? ''
		const path = fields[index + 1] ?? ''
		if (status !== '' && path !== '') files.push({status: status.charAt(0), path})
	}
	return files
}

// `<key>: <reason>` on a line of its own, optionally as a list item.
const OPT_OUT_LINE = /^[ \t]*(?:[-*+][ \t]+)?([^:\n]+?)[ \t]*:[ \t]*(.*?)[ \t]*$/gm

/** The reason given for each rule the body waives. The PR template's examples sit in HTML comments, which never count. */
function optOuts(body: string): Map<PolicyRule, string> {
	const visible = body.replace(/<!--[\s\S]*?(?:-->|$)/g, '')
	const reasons = new Map<PolicyRule, string>()
	for (const [, key = '', reason = ''] of visible.matchAll(OPT_OUT_LINE)) {
		const rule = POLICY_RULES.find(candidate => OPT_OUT_KEYS[candidate].toLowerCase() === key.toLowerCase())
		if (rule !== undefined && !reasons.has(rule) && reason !== '' && !/^<[^>]*>$/.test(reason)) reasons.set(rule, reason)
	}
	return reasons
}

const CONVENTIONAL_TYPE = /^([a-z]+)(?:\([^)]*\))?!?:/i
const conventionalType = (title: string): string | null => CONVENTIONAL_TYPE.exec(title.trim())?.[1]?.toLowerCase() ?? null

const isApp = (path: string): boolean => path.startsWith('src/')
const isPackage = (path: string): boolean => path.startsWith('packages/')
const isFragment = (file: ChangedFile): boolean => file.status !== 'D' && /^changelog\.d\/[^/]+\.[a-z]+\.md$/.test(file.path) && file.path !== 'changelog.d/README.md'

function changelogFragment(input: PullRequestFacts): string | null {
	const type = conventionalType(input.title)
	if (type !== 'fix' && type !== 'feat') return null
	if (!input.files.some(file => isApp(file.path)) || input.files.some(isFragment)) return null
	return `A ${type} that changes src/ adds a changelog fragment, changelog.d/<slug>.<kind>.md (see changelog.d/README.md).`
}

/** Bullets plus paragraphs that are neither a heading nor a list; a wrapped line continues its entry. */
function entryCount(section: string): number {
	let count = 0
	let inEntry = false
	for (const raw of section.split(/\r?\n/)) {
		const line = raw.trim()
		if (line === '' || line === '---' || line.startsWith('#')) inEntry = false
		else if (/^(?:[-*+]|\d+[.)])\s/.test(line) || !inEntry) {
			count += 1
			inEntry = true
		}
	}
	return count
}

// Wording fixes to a released section stay allowed (changelog.d/README.md), so
// only a section that gains entries fails; a new fix belongs in a fragment.
function releasedChangelog(input: PullRequestFacts): string | null {
	if (input.changelog === null) return null
	const {base, head, releasedVersion} = input.changelog
	// Before changelog fragments, the next release's section sat above the
	// newest one, newer than package.json; it was never released.
	const released = versionHeadings(base).filter(version => valid(version) !== null && valid(releasedVersion) !== null && !gt(version, releasedVersion))
	const grown = released.filter(version => {
		const before = releaseSectionBody(base, version)
		const after = releaseSectionBody(head, version)
		return before !== null && after !== null && entryCount(after) > entryCount(before)
	})
	if (grown.length === 0) return null
	return `CHANGELOG.md: ${grown.map(version => `## ${version}`).join(', ')} is already released and gains entries. Correct a released section's wording only; a new change goes in a changelog.d/ fragment.`
}

const isEnglishReadmeSource = (path: string): boolean => path.startsWith('readme-src/') && !isTranslation(path)

function isTranslation(path: string): boolean {
	if (path.startsWith('i18n/') || path === 'readme-src/translated-from.json') return true
	const appLocale = /^src\/shared\/i18n\/locales\/([^/]+)\.json$/.exec(path)?.[1]
	const readmeLocale = /^readme-src\/locales\/([^/]+)\.mjs$/.exec(path)?.[1]
	return (appLocale !== undefined && appLocale !== 'en') || (readmeLocale !== undefined && readmeLocale !== 'en')
}

// docs/readme/ is generated from readme-src/, and the commit hook regenerates
// it whenever an English README source changes; then it follows that source.
function englishOnly(input: PullRequestFacts, translationSync: boolean): string | null {
	if (translationSync) return null
	const readmeRebuilt = input.files.some(file => isEnglishReadmeSource(file.path))
	const translated = input.files.map(file => file.path).filter(path => isTranslation(path) || (path.startsWith('docs/readme/') && !readmeRebuilt))
	if (translated.length === 0) return null
	const shown = translated.slice(0, 5).join(', ') + (translated.length > 5 ? ` and ${translated.length - 5} more` : '')
	return `A PR changes English only (ADR 0017); translations change in the "${TRANSLATION_SYNC_TITLE}" PR of a release. Changed: ${shown}.`
}

function packageScope(input: PullRequestFacts): string | null {
	if (!input.files.some(file => isPackage(file.path)) || !input.files.some(file => isApp(file.path))) return null
	return 'packages/ and src/ change in separate PRs: a package publishes on its own tag (AGENTS.md, "One concern per PR").'
}

function baseBranch(input: PullRequestFacts): string | null {
	if (input.baseRef === input.defaultBranch) return null
	return `The PR targets ${input.baseRef}; every PR branches from ${input.defaultBranch} (AGENTS.md, "Don't stack PRs").`
}

// A co-author trailer naming an assistant product, a "generated with/by"
// credit, or an assistant's noreply address. A trailer matches products only,
// never words that are also people's names (Devin, Ai); `claude` never
// matches as `CLAUDE.md`.
const ATTRIBUTION = [
	/co-authored-by:.*\b(?:claude\b(?!\.md)|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|cursor agent|aider)\b/i,
	/generated (?:with|by) \[?(?:claude\b(?!\.md)|anthropic|codex|openai|chatgpt|gpt-?\d\w*|copilot|gemini|cursor agent|devin|aider|an? ai|ai)\b/i,
	/noreply@(?:anthropic|openai)\.com/i
]
const creditsAnAssistant = (text: string): boolean => ATTRIBUTION.some(pattern => pattern.test(text))

function attributionIn(input: PullRequestFacts): {commits: string[]; body: boolean} {
	return {commits: input.commits.filter(commit => creditsAnAssistant(commit.message)).map(commit => commit.sha.slice(0, 7)), body: creditsAnAssistant(input.body)}
}

/** Every rule the PR breaks and does not waive, and every waiver it used. */
export function checkPullRequest(input: PullRequestFacts): PolicyResult {
	const reasons = optOuts(input.body)
	const translationSync = input.title.trim().toLowerCase().startsWith(TRANSLATION_SYNC_TITLE)
	const failures: PolicyFailure[] = []
	const waived: PolicyResult['waived'] = []
	const report = (rule: PolicyRule, message: string | null): void => {
		if (message === null) return
		const reason = reasons.get(rule)
		if (reason === undefined) failures.push({rule, message: `${message} If this PR is the exception, say why in its body: "${OPT_OUT_KEYS[rule]}: <reason>".`})
		else waived.push({rule, reason})
	}

	report('changelog-fragment', changelogFragment(input))
	report('released-changelog', releasedChangelog(input))
	report('english-only', englishOnly(input, translationSync))
	report('package-scope', packageScope(input))
	report('base-branch', baseBranch(input))
	// The body may quote the pattern on purpose; a commit message never may,
	// since it outlives the PR in main's history.
	const attribution = attributionIn(input)
	if (attribution.commits.length > 0) failures.push({rule: 'ai-attribution', message: `Commit ${attribution.commits.join(', ')} credits an AI as an author. Reword the commit message: AGENTS.md, "No AI attribution".`})
	if (attribution.body) report('ai-attribution', 'The PR body credits an AI as an author (AGENTS.md, "No AI attribution").')
	return {failures, waived, translationSync}
}

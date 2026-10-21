import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vite-plus/test'
import {type ChangedFile, checkPullRequest, OPT_OUT_KEYS, parseNameStatus, type PolicyRule, type PullRequestFacts} from '../../scripts/prPolicy.js'

const modified = (...paths: string[]): ChangedFile[] => paths.map(path => ({status: 'M', path}))

function facts(overrides: Partial<PullRequestFacts> = {}): PullRequestFacts {
	return {title: 'chore(tooling): tidy a script', body: '## Summary\n\nTidies a script.\n', baseRef: 'main', defaultBranch: 'main', files: modified('scripts/doctor.ts'), commits: [{sha: 'a'.repeat(40), message: 'chore(tooling): tidy a script\n'}], changelog: null, packageReadmes: [], ...overrides}
}

const failedRules = (input: PullRequestFacts): PolicyRule[] => checkPullRequest(input).failures.map(failure => failure.rule)

describe('parseNameStatus', () => {
	it('reads `git diff --name-status --no-renames -z` output', () => {
		expect(parseNameStatus('M\0src/a.ts\0A\0changelog.d/x.fix.md\0D\0old.ts\0')).toEqual([
			{status: 'M', path: 'src/a.ts'},
			{status: 'A', path: 'changelog.d/x.fix.md'},
			{status: 'D', path: 'old.ts'}
		])
		expect(parseNameStatus('')).toEqual([])
	})
})

describe('changelog-fragment', () => {
	it('fails a fix or feature that changes the app without a fragment', () => {
		for (const title of ['fix(wizard): name every track', 'feat: add a thing', 'fix(queue)!: drop a column']) {
			expect(failedRules(facts({title, files: modified('src/renderer/src/App.tsx')}))).toEqual(['changelog-fragment'])
		}
	})

	it('passes with an added or edited fragment', () => {
		const title = 'fix(wizard): name every track'
		expect(failedRules(facts({title, files: [...modified('src/main/a.ts'), {status: 'A', path: 'changelog.d/name-tracks.fix.md'}]}))).toEqual([])
		expect(failedRules(facts({title, files: modified('src/main/a.ts', 'changelog.d/name-tracks.fix.md')}))).toEqual([])
	})

	it('does not count the README or a deleted fragment', () => {
		const title = 'fix(wizard): name every track'
		expect(failedRules(facts({title, files: modified('src/main/a.ts', 'changelog.d/README.md')}))).toEqual(['changelog-fragment'])
		expect(failedRules(facts({title, files: [...modified('src/main/a.ts'), {status: 'D', path: 'changelog.d/old.fix.md'}]}))).toEqual(['changelog-fragment'])
	})

	it('ignores other kinds and fixes outside the app', () => {
		expect(failedRules(facts({title: 'refactor(main): split a module', files: modified('src/main/a.ts')}))).toEqual([])
		expect(failedRules(facts({title: 'test(e2e): wait for the splash', files: modified('src/main/a.ts')}))).toEqual([])
		expect(failedRules(facts({title: 'fix(review): run lanes with hooks off', files: modified('scripts/dual-review/run.ts')}))).toEqual([])
	})

	it('is waived by a `No changelog:` line with a reason', () => {
		const input = facts({title: 'feat(menu): add a submenu', files: modified('src/main/menu.ts'), body: 'Summary.\n\nNo changelog: behind the language-menu release flag\n'})
		const result = checkPullRequest(input)
		expect(result.failures).toEqual([])
		expect(result.waived).toEqual([{rule: 'changelog-fragment', reason: 'behind the language-menu release flag'}])
	})

	it('ignores an opt-out without a reason, a placeholder, or one inside an HTML comment', () => {
		const files = modified('src/main/menu.ts')
		const title = 'feat(menu): add a submenu'
		for (const body of ['No changelog:\n', 'No changelog: <reason>\n', '<!-- No changelog: the template example -->\n', '<!--\nNo changelog: in a comment\n-->\n']) {
			expect(failedRules(facts({title, files, body}))).toEqual(['changelog-fragment'])
		}
	})

	it('accepts the opt-out as a list item, in any case', () => {
		expect(failedRules(facts({title: 'fix: x', files: modified('src/a.ts'), body: '- no CHANGELOG: nothing a user sees\n'}))).toEqual([])
	})
})

const RELEASED = `# Changelog

Intro text.

---

## 0.7.2

## Highlights

- **A clearer Review.** Each row has an icon.

## Fixes

- Captions show their language name.
- Long labels no longer wrap.

## 0.7.1

Explore grew up.

## Fixes

- A fix.
`

describe('released-changelog', () => {
	const files = modified('CHANGELOG.md')

	it('fails an entry added to a released section', () => {
		const head = RELEASED.replace('- Long labels no longer wrap.\n', '- Long labels no longer wrap.\n- A brand new fix.\n')
		const result = checkPullRequest(facts({files, changelog: {base: RELEASED, head, releasedVersion: '0.7.2'}}))
		expect(result.failures.map(failure => failure.rule)).toEqual(['released-changelog'])
		expect(result.failures[0]?.message).toContain('## 0.7.2')
	})

	it('fails a new paragraph or a new subsection in a released section', () => {
		expect(failedRules(facts({files, changelog: {releasedVersion: '0.7.2', base: RELEASED, head: RELEASED.replace('Explore grew up.\n', 'Explore grew up.\n\nAnd more.\n')}}))).toEqual(['released-changelog'])
		expect(failedRules(facts({files, changelog: {releasedVersion: '0.7.2', base: RELEASED, head: RELEASED.replace('## 0.7.1\n', '## 0.7.1\n\n## Good to know\n\n- Something.\n')}}))).toEqual(['released-changelog'])
	})

	it('allows rewording, wrapping or removing entries', () => {
		const reworded = RELEASED.replace('Captions show their language name.', "YouTube's captions show their language name.")
		const wrapped = RELEASED.replace('- Long labels no longer wrap.', '- Long labels on Review\n  no longer wrap.')
		const removed = RELEASED.replace('- A fix.\n', '')
		for (const head of [reworded, wrapped, removed]) expect(failedRules(facts({files, changelog: {base: RELEASED, head, releasedVersion: '0.7.2'}}))).toEqual([])
	})

	it('leaves a section the base does not have to the release check', () => {
		const head = RELEASED.replace('---\n\n', '---\n\n## 0.7.3\n\n## Fixes\n\n- New.\n\n')
		expect(failedRules(facts({files, changelog: {base: RELEASED, head, releasedVersion: '0.7.2'}}))).toEqual([])
	})

	it('leaves a section newer than package.json alone: it is not released yet', () => {
		const base = RELEASED.replace('## 0.7.2\n', '## 0.7.3\n\n## Fixes\n\n- Pending.\n\n## 0.7.2\n')
		const head = base.replace('- Pending.\n', '- Pending.\n- Another pending fix.\n')
		expect(failedRules(facts({files, changelog: {base, head, releasedVersion: '0.7.2'}}))).toEqual([])
		expect(failedRules(facts({files, changelog: {base, head, releasedVersion: '0.7.3'}}))).toEqual(['released-changelog'])
	})

	it('is waived by a `Released changelog edit:` line', () => {
		const head = RELEASED.replace('- A fix.\n', '- A fix.\n- A fix the release left out.\n')
		expect(failedRules(facts({files, changelog: {base: RELEASED, head, releasedVersion: '0.7.2'}, body: 'Released changelog edit: 0.7.1 shipped this fix but its notes missed it\n'}))).toEqual([])
	})
})

describe('english-only', () => {
	it('fails a PR that changes a translation', () => {
		for (const path of ['i18n/locales/de.po', 'i18n/app.pot', 'src/shared/i18n/locales/de.json', 'readme-src/locales/fr.mjs', 'readme-src/translated-from.json', 'docs/readme/README.de.md']) {
			const result = checkPullRequest(facts({files: modified(path)}))
			expect(
				result.failures.map(failure => failure.rule),
				path
			).toEqual(['english-only'])
			expect(result.failures[0]?.message).toContain(path)
		}
	})

	it('allows the English sources', () => {
		expect(failedRules(facts({files: modified('src/shared/i18n/locales/en.json', 'readme-src/locales/en.mjs')}))).toEqual([])
	})

	it('allows the generated READMEs when an English README source changed', () => {
		expect(failedRules(facts({files: modified('readme-src/locales/en.mjs', 'README.md', 'docs/readme/README.de.md')}))).toEqual([])
		expect(failedRules(facts({files: modified('readme-src/build.mjs', 'docs/readme/README.de.md')}))).toEqual([])
		expect(failedRules(facts({files: modified('readme-src/locales/de.mjs', 'docs/readme/README.de.md')}))).toEqual(['english-only'])
	})

	it('lets the translation sync PR change every locale and flags it for the completeness gate', () => {
		const result = checkPullRequest(facts({title: 'i18n: sync translations', files: modified('i18n/locales/de.po', 'src/shared/i18n/locales/de.json', 'readme-src/locales/de.mjs', 'docs/readme/README.de.md')}))
		expect(result.failures).toEqual([])
		expect(result.translationSync).toBe(true)
		expect(checkPullRequest(facts()).translationSync).toBe(false)
	})

	it('is waived by a `Translation change:` line', () => {
		expect(failedRules(facts({files: modified('src/shared/i18n/locales/de.json'), body: 'Translation change: the German string named the wrong button\n'}))).toEqual([])
	})
})

describe('package-scope', () => {
	it('fails a PR that changes a package and the app', () => {
		expect(failedRules(facts({files: modified('packages/yt-dlp-bridge/src/argv.ts', 'src/main/a.ts')}))).toEqual(['package-scope'])
	})

	it('allows either alone', () => {
		expect(failedRules(facts({files: modified('packages/yt-dlp-bridge/src/argv.ts', 'tests/unit/a.test.ts')}))).toEqual([])
		expect(failedRules(facts({files: modified('src/main/a.ts', 'package.json')}))).toEqual([])
	})

	it('is waived by a `Package and app together:` line', () => {
		expect(failedRules(facts({files: modified('packages/ytdlp-errors/src/a.ts', 'src/main/a.ts'), body: 'Package and app together: the renamed export breaks the app build until both change\n'}))).toEqual([])
	})
})

const BRIDGE_README = `# yt-dlp-bridge

Intro.

## Features

- Plans commands.

## What changed in 0.6.2

- Paths stay unexpanded.

## What changed in 0.6.1

- A fix.

## Usage

Call it.
`

describe('package-changelog', () => {
	const readme = (head: string): Partial<PullRequestFacts> => ({files: modified('packages/yt-dlp-bridge/README.md'), packageReadmes: [{path: 'packages/yt-dlp-bridge/README.md', base: BRIDGE_README, head}]})

	it('fails a PR that edits a package CHANGELOG.md', () => {
		const result = checkPullRequest(facts({title: 'feat(errors): classify a new failure', files: modified('packages/ytdlp-errors/src/catalog.ts', 'packages/ytdlp-errors/CHANGELOG.md')}))
		expect(result.failures.map(failure => failure.rule)).toEqual(['package-changelog'])
		expect(result.failures[0]?.message).toContain('packages/ytdlp-errors/CHANGELOG.md')
	})

	it('fails a PR that edits a "What changed" section of a package README', () => {
		expect(failedRules(facts(readme(BRIDGE_README.replace('- Paths stay unexpanded.', '- Paths stay unexpanded.\n- A new flag.'))))).toEqual(['package-changelog'])
		expect(failedRules(facts(readme(BRIDGE_README.replace('## Features', '## What changed in 0.6.3\n\n- New.\n\n## Features'))))).toEqual(['package-changelog'])
	})

	it('allows README edits outside the "What changed" sections', () => {
		expect(failedRules(facts(readme(BRIDGE_README.replace('Call it.', 'Call it with a plan.').replace('- Plans commands.', '- Plans and runs commands.'))))).toEqual([])
	})

	it('lets the release(packages) PR write the section', () => {
		const head = BRIDGE_README.replace('## What changed in 0.6.2', '## What changed in 0.6.3\n\n- New.\n\n## What changed in 0.6.2')
		expect(failedRules(facts({...readme(head), title: 'release(packages): yt-dlp-bridge 0.6.3'}))).toEqual([])
		expect(failedRules(facts({title: 'release(packages): ytdlp-errors 1.6.0', files: modified('packages/ytdlp-errors/CHANGELOG.md', 'packages/ytdlp-errors/package.json')}))).toEqual([])
	})

	it('exempts only the packages the release title names', () => {
		const head = BRIDGE_README.replace('- A fix.', '- A fix, reworded.')
		expect(failedRules(facts({...readme(head), title: 'release(packages): ytdlp-errors 1.6.0'}))).toEqual(['package-changelog'])
		expect(failedRules(facts({...readme(head), title: 'release(packages):'}))).toEqual(['package-changelog'])
		expect(failedRules(facts({...readme(head), files: modified('packages/yt-dlp-bridge/README.md', 'packages/ytdlp-errors/CHANGELOG.md'), title: 'release(packages): ytdlp-errors 1.6.0 and yt-dlp-bridge 0.6.3'}))).toEqual([])
	})

	it('is waived by a `Package changelog edit:` line', () => {
		expect(failedRules(facts({files: modified('packages/ytdlp-errors/CHANGELOG.md'), body: 'Package changelog edit: fixes a typo in the 1.5.0 notes\n'}))).toEqual([])
	})
})

describe('base-branch', () => {
	it('fails a PR stacked on another branch', () => {
		const result = checkPullRequest(facts({baseRef: 'feat/parent'}))
		expect(result.failures.map(failure => failure.rule)).toEqual(['base-branch'])
		expect(result.failures[0]?.message).toContain('feat/parent')
	})

	it('is waived by a `Stacked PR:` line', () => {
		expect(failedRules(facts({baseRef: 'feat/parent', body: 'Stacked PR: needs #500, which is in review\n'}))).toEqual([])
	})
})

describe('ai-attribution', () => {
	it.each([
		'Co-Authored-By: Claude Opus <noreply@anthropic.com>',
		'co-authored-by: Anthropic Bot <bot@example.com>',
		'🤖 Generated with [Claude Code](https://claude.com/claude-code)',
		'Generated with Claude',
		'Contact: noreply@anthropic.com',
		'Co-Authored-By: Codex <codex@openai.com>',
		'Co-authored-by: Copilot <175728472+Copilot@users.noreply.github.com>',
		'Generated by Claude.',
		'Generated with ChatGPT',
		'Generated by GPT-4o',
		'Co-Authored-By: GPT-4o <bot@example.com>',
		'Generated by AI'
	])('fails %s in a commit message or the body', line => {
		const commit = checkPullRequest(facts({commits: [{sha: 'b'.repeat(40), message: `fix: a thing\n\n${line}\n`}]}))
		expect(commit.failures.map(failure => failure.rule)).toEqual(['ai-attribution'])
		expect(commit.failures[0]?.message).toContain('bbbbbbb')
		expect(failedRules(facts({body: `Summary.\n\n${line}\n`}))).toEqual(['ai-attribution'])
	})

	it('allows tooling mentions of Claude and AI libraries', () => {
		const body =
			'Edits `.claude/settings.json` and `CLAUDE.md`, bumps @anthropic-ai/sdk and openai, and runs the Claude and Codex lanes of review:dual.\nCLAUDE.md is generated by bun run agents:sync, and so is a file generated by CLAUDE.md tooling.\nCo-authored-by: Antonio Orionus <orionusAI@proton.me>\nCo-authored-by: Kai Geminiani <kai@example.com>\nCo-Authored-By: Devin Smith <devin@example.com>\nCo-authored-by: Ai Tanaka <ai@example.com>\n'
		expect(failedRules(facts({body, commits: [{sha: 'c'.repeat(40), message: body}]}))).toEqual([])
	})

	it('waives only the body, never a commit', () => {
		const optOut = 'Attribution false positive: the body quotes the pattern this rule matches\n'
		expect(failedRules(facts({body: `${optOut}Generated with Claude\n`}))).toEqual([])
		expect(failedRules(facts({body: optOut, commits: [{sha: 'd'.repeat(40), message: 'fix: x\n\nGenerated with Claude\n'}]}))).toEqual(['ai-attribution'])
	})
})

describe('opt-out keys', () => {
	it('names one key per rule', () => {
		expect(new Set(Object.values(OPT_OUT_KEYS)).size).toBe(Object.keys(OPT_OUT_KEYS).length)
	})

	it('tells a failing PR the exact line that waives it', () => {
		const [failure] = checkPullRequest(facts({title: 'fix: x', files: modified('src/a.ts')})).failures
		expect(failure?.message).toContain('No changelog: <reason>')
	})
})

describe('opt-out documentation', () => {
	it('lists every opt-out line in the PR template and CONTRIBUTING.md', () => {
		const template = readFileSync('.github/pull_request_template.md', 'utf8')
		const contributing = readFileSync('CONTRIBUTING.md', 'utf8')
		for (const key of Object.values(OPT_OUT_KEYS)) {
			expect(template, key).toContain(`\n${key}: <reason>\n`)
			expect(contributing, key).toContain(`\`${key}: <reason>\``)
		}
	})
})

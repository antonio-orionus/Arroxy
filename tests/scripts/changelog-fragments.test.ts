import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {assembleSection, changelogProblems, fragmentProblems, insertSection, orderFragmentFiles, parseFragment} from '../../scripts/changelogFragments.js'

describe('fragmentProblems', () => {
	it('accepts each kind with a kebab-case slug', () => {
		for (const kind of ['intro', 'fix', 'note']) expect(fragmentProblems(`changelog.d/some-change.${kind}.md`, 'Downloads finish.\n')).toEqual([])
		expect(fragmentProblems('changelog.d/some-change.highlight.md', '**Faster.** Downloads finish sooner.\n')).toEqual([])
	})

	it('rejects a file name without a known kind or a kebab-case slug', () => {
		expect(fragmentProblems('changelog.d/some-change.md', 'Text.')).toEqual([expect.stringMatching(/<slug>\.<kind>\.md/)])
		expect(fragmentProblems('changelog.d/some-change.feature.md', 'Text.')).toEqual([expect.stringMatching(/<slug>\.<kind>\.md/)])
		expect(fragmentProblems('changelog.d/Some_Change.fix.md', 'Text.')).toEqual([expect.stringMatching(/<slug>\.<kind>\.md/)])
	})

	it('rejects an empty fragment', () => {
		expect(fragmentProblems('changelog.d/a.fix.md', ' \n\n')).toEqual([expect.stringMatching(/empty/)])
	})

	it('rejects more than one paragraph, headings and list markers', () => {
		expect(fragmentProblems('changelog.d/a.fix.md', 'One.\n\nTwo.')).toEqual([expect.stringMatching(/one paragraph/)])
		expect(fragmentProblems('changelog.d/a.fix.md', '## Fixes\nOne.')).toEqual([expect.stringMatching(/heading/)])
		expect(fragmentProblems('changelog.d/a.fix.md', '- One.')).toEqual([expect.stringMatching(/bullet/)])
		expect(fragmentProblems('changelog.d/a.fix.md', '1. One.')).toEqual([expect.stringMatching(/bullet/)])
	})

	it('requires a highlight to open with a bold lead-in', () => {
		expect(fragmentProblems('changelog.d/a.highlight.md', 'Faster downloads.')).toEqual([expect.stringMatching(/bold lead-in/)])
	})

	it('accepts a bold lead-in wrapped across lines', () => {
		expect(fragmentProblems('changelog.d/a.highlight.md', '**Manual and auto\nsubtitles together.** Both download.\n')).toEqual([])
	})
})

describe('parseFragment', () => {
	it('reads the kind from the file name and joins wrapped lines', () => {
		expect(parseFragment('changelog.d/explore-zoom.fix.md', 'Explore keeps\n  your zoom.\n')).toEqual({file: 'changelog.d/explore-zoom.fix.md', kind: 'fix', text: 'Explore keeps your zoom.'})
	})
})

describe('assembleSection', () => {
	it('writes intro paragraphs, then Highlights, Fixes and Good to know, in the given order', () => {
		const fragments = [
			{file: 'b.fix.md', kind: 'fix', text: 'Second fix.'},
			{file: 'n.note.md', kind: 'note', text: 'A note.'},
			{file: 'h.highlight.md', kind: 'highlight', text: '**New.** Thing.'},
			{file: 'a.fix.md', kind: 'fix', text: 'First fix.'},
			{file: 'i.intro.md', kind: 'intro', text: 'Welcome.'}
		] as const
		expect(assembleSection('1.2.3', fragments)).toBe(['## 1.2.3', '', 'Welcome.', '', '## Highlights', '', '- **New.** Thing.', '', '## Fixes', '', '- Second fix.', '- First fix.', '', '## Good to know', '', '- A note.', ''].join('\n'))
	})

	it('leaves out kinds with no fragments', () => {
		expect(assembleSection('1.2.3', [{file: 'a.fix.md', kind: 'fix', text: 'Fix.'}])).toBe('## 1.2.3\n\n## Fixes\n\n- Fix.\n')
	})
})

const CHANGELOG = ['# Changelog', '', 'Intro text.', '', '---', '', '## 1.2.2', '', '## Fixes', '', '- Old fix.', ''].join('\n')

describe('insertSection', () => {
	it('puts the section above the newest release', () => {
		expect(insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\n## Fixes\n\n- New fix.\n')).toBe(['# Changelog', '', 'Intro text.', '', '---', '', '## 1.2.3', '', '## Fixes', '', '- New fix.', '', '## 1.2.2', '', '## Fixes', '', '- Old fix.', ''].join('\n'))
	})

	it('refuses a version the changelog already has', () => {
		expect(() => insertSection(CHANGELOG, '1.2.2', '## 1.2.2\n')).toThrow(/already has/)
	})
})

describe('changelogProblems', () => {
	it('accepts a changelog whose newest section is the package version', () => {
		expect(changelogProblems(CHANGELOG, '1.2.2')).toEqual([])
	})

	it('rejects a section for a version that is not released yet', () => {
		const ahead = CHANGELOG.replace('## 1.2.2', '## 1.2.3\n\n- New.\n\n## 1.2.2')
		expect(changelogProblems(ahead, '1.2.2')).toEqual([expect.stringMatching(/changelog\.d/)])
	})

	it('rejects a version heading that is not semver', () => {
		expect(changelogProblems(CHANGELOG.replace('## 1.2.2', '## 1.3\n\n- New.\n\n## 1.2.2'), '1.2.2')).toEqual([expect.stringMatching(/## 1\.3.*semver/)])
	})

	it('accepts a beta that has no section of its own', () => {
		expect(changelogProblems(CHANGELOG, '1.2.3-beta.1')).toEqual([])
	})

	it('rejects an Unreleased or other section above the newest release', () => {
		const unreleased = CHANGELOG.replace('## 1.2.2', '## Unreleased\n\n- New.\n\n## 1.2.2')
		expect(changelogProblems(unreleased, '1.2.2')).toEqual([expect.stringMatching(/## Unreleased.*changelog\.d/)])
	})
})

describe('orderFragmentFiles', () => {
	it('orders committed fragments by when they arrived, then the rest by name', () => {
		// `git log --first-parent --diff-filter=A --format=%x00%H --name-only` lists the newest commit first.
		const log = '\u0000c3\n\nchangelog.d/c.fix.md\n\u0000c1\n\nchangelog.d/a.fix.md\nchangelog.d/b.fix.md\n'
		const files = ['changelog.d/z.fix.md', 'changelog.d/c.fix.md', 'changelog.d/b.fix.md', 'changelog.d/y.fix.md', 'changelog.d/a.fix.md']
		expect(orderFragmentFiles(files, log)).toEqual(['changelog.d/a.fix.md', 'changelog.d/b.fix.md', 'changelog.d/c.fix.md', 'changelog.d/y.fix.md', 'changelog.d/z.fix.md'])
	})

	it('uses the latest add of a fragment that was deleted and re-added', () => {
		const log = '\u0000c3\n\nchangelog.d/a.fix.md\n\u0000c2\n\nchangelog.d/b.fix.md\n\u0000c1\n\nchangelog.d/a.fix.md\n'
		expect(orderFragmentFiles(['changelog.d/a.fix.md', 'changelog.d/b.fix.md'], log)).toEqual(['changelog.d/b.fix.md', 'changelog.d/a.fix.md'])
	})
})

describe('changelog CLI', () => {
	const tempDirs: string[] = []
	afterEach(async () => {
		await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
	})

	const ENV = {...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1'}

	async function repo(files: Record<string, string>): Promise<{root: string; cli: (...args: string[]) => ReturnType<typeof spawnSync>}> {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-changelog-'))
		tempDirs.push(root)
		for (const [file, contents] of Object.entries(files)) {
			await fs.mkdir(path.dirname(path.join(root, file)), {recursive: true})
			await fs.writeFile(path.join(root, file), contents)
		}
		spawnSync('git', ['init', '-q'], {cwd: root, env: ENV})
		const script = path.resolve('scripts/changelog.ts')
		return {root, cli: (...args) => spawnSync('bun', [script, ...args], {cwd: root, encoding: 'utf8', env: ENV})}
	}

	it('assembles the package version from the fragments and deletes them', async () => {
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/README.md': 'How to write one.\n', 'changelog.d/new-thing.fix.md': 'New fix.\n'})
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/changelog:assemble/)})
		expect(cli('assemble')).toMatchObject({status: 0})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toContain('---\n\n## 1.2.3\n\n## Fixes\n\n- New fix.\n\n## 1.2.2')
		expect(await fs.readdir(path.join(root, 'changelog.d'))).toEqual(['README.md'])
		expect(cli('check')).toMatchObject({status: 0})
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 0})
	})

	it('lists each kind in the order its fragments were committed', async () => {
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG})
		const commitFragment = async (name: string, date: string): Promise<void> => {
			await fs.writeFile(path.join(root, 'changelog.d', name), `${name}\n`)
			spawnSync('git', ['add', '-A'], {cwd: root, env: ENV})
			spawnSync('git', ['commit', '-qm', name], {cwd: root, env: {...ENV, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date}})
		}
		await fs.mkdir(path.join(root, 'changelog.d'))
		await commitFragment('zebra.fix.md', '2026-01-01T00:00:00Z')
		await commitFragment('apple.fix.md', '2026-01-02T00:00:00Z')
		expect(cli('assemble')).toMatchObject({status: 0, stderr: ''})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toContain('- zebra.fix.md\n- apple.fix.md\n')
	})

	it('orders a fragment by when its branch merged, not when it was written', async () => {
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG})
		const git = (args: string[], date = '2026-01-01T00:00:00Z') => spawnSync('git', args, {cwd: root, env: {...ENV, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date}})
		git(['commit', '-qm', 'base', '--allow-empty'])
		git(['checkout', '-qb', 'feature'])
		await fs.mkdir(path.join(root, 'changelog.d'))
		await fs.writeFile(path.join(root, 'changelog.d', 'written-first.fix.md'), 'Written first.\n')
		git(['add', '-A'])
		git(['commit', '-qm', 'feature'], '2026-01-02T00:00:00Z')
		git(['checkout', '-q', '-'])
		await fs.mkdir(path.join(root, 'changelog.d'), {recursive: true})
		await fs.writeFile(path.join(root, 'changelog.d', 'merged-first.fix.md'), 'Merged first.\n')
		git(['add', '-A'])
		git(['commit', '-qm', 'other'], '2026-01-03T00:00:00Z')
		git(['merge', '-q', '--no-ff', '-m', 'merge feature', 'feature'], '2026-01-04T00:00:00Z')
		expect(cli('assemble')).toMatchObject({status: 0, stderr: ''})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toContain('- Merged first.\n- Written first.\n')
	})

	it('finishes an assembly whose fragments were left behind', async () => {
		const assembled = insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\n## Fixes\n\n- Fix.\n')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': assembled, 'changelog.d/a.fix.md': 'Fix.\n'})
		expect(cli('assemble')).toMatchObject({status: 0})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(assembled)
		expect(await fs.readdir(path.join(root, 'changelog.d'))).toEqual([])
	})

	it('finishes an assembly that deleted only some fragments', async () => {
		const assembled = insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\n## Fixes\n\n- Fix one.\n- Fix two.\n')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': assembled, 'changelog.d/two.fix.md': 'Fix two.\n'})
		expect(cli('assemble')).toMatchObject({status: 0})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(assembled)
		expect(await fs.readdir(path.join(root, 'changelog.d'))).toEqual([])
	})

	// A release commit that is redone (a failed check, or main moved under its
	// push) picks up fragments merged since into the section it already wrote.
	it('adds new fragments to the section of a version not tagged yet, keeping its edits', async () => {
		const edited = insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\nWelcome.\n\n## Fixes\n\n- Edited fix.\n')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': edited, 'changelog.d/a.fix.md': 'New fix.\n', 'changelog.d/b.highlight.md': '**New.** Thing.\n', 'changelog.d/c.note.md': 'A note.\n', 'changelog.d/d.intro.md': 'More.\n', 'changelog.d/e.fix.md': 'Edited fix.\n'})
		expect(cli('assemble')).toMatchObject({status: 0})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(insertSection(CHANGELOG, '1.2.3', ['## 1.2.3', '', 'Welcome.', '', 'More.', '', '## Highlights', '', '- **New.** Thing.', '', '## Fixes', '', '- Edited fix.', '- New fix.', '', '## Good to know', '', '- A note.', ''].join('\n')))
		expect(await fs.readdir(path.join(root, 'changelog.d'))).toEqual([])
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 0})
	})

	it('leaves the section of a version not tagged yet as it is when no fragment is new', async () => {
		const assembled = insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\n## Fixes\n\n- Fix.\n')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': assembled})
		expect(cli('assemble')).toMatchObject({status: 0, stdout: expect.stringMatching(/already/)})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(assembled)
	})

	it('keeps the fragments when the version is already tagged', async () => {
		const released = insertSection(CHANGELOG, '1.2.3', '## 1.2.3\n\n## Fixes\n\n- Released fix.\n')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': released})
		spawnSync('git', ['commit', '-qm', 'release: 1.2.3', '--allow-empty'], {cwd: root, env: ENV})
		spawnSync('git', ['tag', '-a', 'v1.2.3', '-m', 'release 1.2.3'], {cwd: root, env: ENV})
		await fs.mkdir(path.join(root, 'changelog.d'))
		await fs.writeFile(path.join(root, 'changelog.d', 'a.fix.md'), 'Fix.\n')
		expect(cli('assemble')).toMatchObject({status: 1, stderr: expect.stringMatching(/v1\.2\.3.*bump package\.json/)})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(released)
		expect(await fs.readdir(path.join(root, 'changelog.d'))).toEqual(['a.fix.md'])
	})

	it('warns when git cannot give the merge order', async () => {
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/a.fix.md': 'Fix.\n'})
		await fs.rm(path.join(root, '.git'), {recursive: true})
		expect(cli('assemble')).toMatchObject({status: 0, stderr: expect.stringMatching(/file name order/)})
	})

	it('says there is nothing to release instead of writing an empty section', async () => {
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG})
		expect(cli('assemble')).toMatchObject({status: 1, stderr: expect.stringMatching(/no changelog fragments/i)})
		expect(await fs.readFile(path.join(root, 'CHANGELOG.md'), 'utf8')).toBe(CHANGELOG)
	})

	it('refuses to assemble a version other than the package version', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.2"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/a.fix.md': 'Fix.\n'})
		expect(cli('assemble', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/package\.json/)})
	})

	it('fails the check on a malformed fragment or a stray file', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.2"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/a.fix.md': '- Fix.\n', 'changelog.d/notes.txt': 'x'})
		const result = cli('check')
		expect(result.status).toBe(1)
		expect(result.stderr).toMatch(/a\.fix\.md.*bullet/)
		expect(result.stderr).toMatch(/notes\.txt/)
	})

	it('fails the check on a directory inside changelog.d', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.2"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/nested/a.fix.md': 'Fix.\n'})
		expect(cli('check')).toMatchObject({status: 1, stderr: expect.stringMatching(/nested.*fragment files only/)})
	})

	it('blocks a release whose fragments were not assembled', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.2"}', 'CHANGELOG.md': CHANGELOG, 'changelog.d/a.fix.md': 'Fix.\n'})
		expect(cli('verify-release', '1.2.2')).toMatchObject({status: 1, stderr: expect.stringMatching(/changelog:assemble/)})
	})

	it('blocks a release whose section is empty', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG.replace('## 1.2.2', '## 1.2.3\n\n## 1.2.2')})
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/empty/)})
		const {cli: separatorOnly} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG.replace('## 1.2.2', '## 1.2.3\n\n---\n\n## 1.2.2')})
		expect(separatorOnly('verify-release', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/empty/)})
	})

	it('verifies the tree of a given commit instead of the checkout', async () => {
		const released = CHANGELOG.replace('## 1.2.2', '## 1.2.3\n\n## Fixes\n\n- Fix.\n\n## 1.2.2')
		const {root, cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': released, 'changelog.d/README.md': 'How.\n'})
		spawnSync('git', ['add', '-A'], {cwd: root, env: ENV})
		spawnSync('git', ['commit', '-qm', 'release: 1.2.3'], {cwd: root, env: ENV})
		// A PR merged after the release commit adds a fragment, and the checkout drifts.
		await fs.writeFile(path.join(root, 'changelog.d', 'later.fix.md'), 'Later.\n')
		await fs.writeFile(path.join(root, 'CHANGELOG.md'), CHANGELOG)
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 1})
		expect(cli('verify-release', '1.2.3', 'HEAD')).toMatchObject({status: 0})
		spawnSync('git', ['add', '-A'], {cwd: root, env: ENV})
		spawnSync('git', ['commit', '-qm', 'later'], {cwd: root, env: ENV})
		expect(cli('verify-release', '1.2.3', 'HEAD')).toMatchObject({status: 1, stderr: expect.stringMatching(/fragment/)})
		expect(cli('verify-release', '1.2.3', 'HEAD~1')).toMatchObject({status: 0})
		expect(cli('verify-release', '1.2.3', 'no-such-ref')).toMatchObject({status: 1, stderr: expect.stringMatching(/no-such-ref/)})
	})

	it('blocks a release whose heading the publish workflow would not match', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG.replace('## 1.2.2', '## 1.2.3 \n\n- Fix.\n\n## 1.2.2')})
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/no ## 1\.2\.3 section/)})
	})

	it('blocks a release with no section of its own', async () => {
		const {cli} = await repo({'package.json': '{"version": "1.2.3"}', 'CHANGELOG.md': CHANGELOG})
		expect(cli('verify-release', '1.2.3')).toMatchObject({status: 1, stderr: expect.stringMatching(/## 1\.2\.3/)})
	})
})

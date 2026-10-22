import {spawnSync} from 'node:child_process'
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {gitIn, parsePushedRefs, refsToCheck, revertedFiles, type Git} from '../../scripts/pushGuard.js'

const ZERO = '0'.repeat(40)
const ENV = {...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t'}

let root: string
let origin: string
let clone: string
let git: Git

const sh = (cwd: string, ...args: string[]): string => {
	const result = spawnSync('git', args, {cwd, encoding: 'utf8', env: ENV})
	if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
	return result.stdout.trim()
}

// Lands a commit on origin's main the way a merged PR would, from a second clone.
async function landOnMain(files: Record<string, string | null>, message: string): Promise<void> {
	const other = path.join(root, 'other')
	sh(other, 'pull', '-q', 'origin', 'main')
	for (const [file, content] of Object.entries(files)) {
		if (content === null) sh(other, 'rm', '-q', file)
		else await writeFile(path.join(other, file), content)
	}
	sh(other, 'add', '-A')
	sh(other, 'commit', '-qm', message)
	sh(other, 'push', '-q', 'origin', 'main')
}

async function commit(files: Record<string, string>, message: string): Promise<void> {
	for (const [file, content] of Object.entries(files)) await writeFile(path.join(clone, file), content)
	sh(clone, 'add', '-A')
	sh(clone, 'commit', '-qm', message)
}

beforeEach(async () => {
	root = await mkdtemp(path.join(tmpdir(), 'push-guard-'))
	origin = path.join(root, 'origin.git')
	clone = path.join(root, 'clone')
	sh(root, 'init', '-q', '--bare', '-b', 'main', origin)
	sh(root, 'clone', '-q', origin, 'other')
	sh(path.join(root, 'other'), 'switch', '-qc', 'main')
	await writeFile(path.join(root, 'other', 'a.txt'), 'a1\n')
	await writeFile(path.join(root, 'other', 'b.txt'), 'b1\n')
	sh(path.join(root, 'other'), 'add', '-A')
	sh(path.join(root, 'other'), 'commit', '-qm', 'initial')
	sh(path.join(root, 'other'), 'push', '-q', 'origin', 'main')
	sh(root, 'clone', '-q', origin, 'clone')
	sh(clone, 'switch', '-qc', 'feat/x')
	git = gitIn(clone, ENV)
})

afterEach(async () => {
	await rm(root, {recursive: true, force: true})
})

// The PR #430 sequence: two branch commits, main moves on, then a squash by
// `reset --soft origin/main` re-parents the stale index onto the new main.
async function staleSquash(): Promise<void> {
	await commit({'mine.txt': 'mine\n'}, 'feat: one')
	await commit({'mine.txt': 'mine 2\n'}, 'feat: two')
	await landOnMain({'a.txt': 'a2\n', 'new.txt': 'added on main\n'}, 'fix: other lane')
	sh(clone, 'fetch', '-q', 'origin')
	sh(clone, 'reset', '-q', '--soft', 'origin/main')
	sh(clone, 'commit', '-qm', 'feat: squashed')
}

describe('revertedFiles', () => {
	it('catches the stale-index squash that a two-dot/three-dot comparison misses', async () => {
		await staleSquash()
		const twoDot = sh(clone, 'diff', '--name-only', 'origin/main', 'HEAD')
		const threeDot = sh(clone, 'diff', '--name-only', 'origin/main...HEAD')
		expect(twoDot).toBe(threeDot)
		expect(revertedFiles(git, 'origin/main', 'HEAD').map(r => [r.file, r.undoes])).toEqual([
			['a.txt', expect.stringMatching(/fix: other lane/)],
			['new.txt', expect.stringMatching(/fix: other lane/)]
		])
	})

	it('still catches it after main moves on again', async () => {
		await staleSquash()
		await landOnMain({'b.txt': 'b2\n'}, 'fix: third lane')
		sh(clone, 'fetch', '-q', 'origin')
		expect(revertedFiles(git, 'origin/main', 'HEAD').map(r => r.file)).toEqual(['a.txt', 'new.txt'])
	})

	it('passes a branch that is only behind main', async () => {
		await commit({'mine.txt': 'mine\n'}, 'feat: one')
		await landOnMain({'a.txt': 'a2\n'}, 'fix: other lane')
		sh(clone, 'fetch', '-q', 'origin')
		expect(revertedFiles(git, 'origin/main', 'HEAD')).toEqual([])
	})

	it('passes a squash onto the merge-base', async () => {
		await commit({'mine.txt': 'mine\n'}, 'feat: one')
		await commit({'mine.txt': 'mine 2\n'}, 'feat: two')
		await landOnMain({'a.txt': 'a2\n'}, 'fix: other lane')
		sh(clone, 'fetch', '-q', 'origin')
		sh(clone, 'reset', '-q', '--soft', sh(clone, 'merge-base', 'origin/main', 'HEAD'))
		sh(clone, 'commit', '-qm', 'feat: squashed')
		expect(revertedFiles(git, 'origin/main', 'HEAD')).toEqual([])
	})

	it('passes an edit that does not restore an earlier version', async () => {
		await landOnMain({'a.txt': 'a2\n'}, 'fix: other lane')
		sh(clone, 'pull', '-q', '--rebase', 'origin', 'main')
		await commit({'a.txt': 'a3\n'}, 'feat: edit a')
		expect(revertedFiles(git, 'origin/main', 'HEAD')).toEqual([])
	})

	it('passes deleting a file main added and then edited on its own', async () => {
		await landOnMain({'doc.txt': 'v1\n', 'a.txt': 'a2\n'}, 'feat: add doc')
		await landOnMain({'doc.txt': 'v2\n'}, 'docs: edit doc')
		await landOnMain({'note.txt': 'note\n'}, 'docs: add note')
		sh(clone, 'pull', '-q', '--rebase', 'origin', 'main')
		sh(clone, 'rm', '-q', 'doc.txt', 'note.txt')
		sh(clone, 'commit', '-qm', 'chore: retire doc and note')
		expect(revertedFiles(git, 'origin/main', 'HEAD')).toEqual([])
	})

	it('flags a deliberate revert too', async () => {
		await landOnMain({'a.txt': 'a2\n'}, 'fix: other lane')
		sh(clone, 'pull', '-q', '--rebase', 'origin', 'main')
		await commit({'a.txt': 'a1\n'}, 'revert: other lane')
		expect(revertedFiles(git, 'origin/main', 'HEAD').map(r => r.file)).toEqual(['a.txt'])
	})
})

describe('pre-push refs', () => {
	const line = (localRef: string, localOid: string, remoteRef: string) => `${localRef} ${localOid} ${remoteRef} ${'b'.repeat(40)}`

	it('checks branch pushes and skips main, tags and deletions', () => {
		const stdin = [line('refs/heads/feat/x', 'a'.repeat(40), 'refs/heads/feat/x'), line('refs/heads/main', 'c'.repeat(40), 'refs/heads/main'), line('refs/tags/v1', 'd'.repeat(40), 'refs/tags/v1'), line('(delete)', ZERO, 'refs/heads/gone'), ''].join('\n')
		expect(refsToCheck(parsePushedRefs(stdin))).toEqual([{localRef: 'refs/heads/feat/x', localOid: 'a'.repeat(40), remoteRef: 'refs/heads/feat/x'}])
	})

	it('blocks a real git push of the stale squash unless ARROXY_ALLOW_REVERT=1, and allows the merge-base squash', async () => {
		const hooks = path.join(root, 'hooks')
		const script = path.resolve('scripts/check-push.ts')
		await mkdir(hooks)
		await writeFile(path.join(hooks, 'pre-push'), `#!/bin/sh\nexec bun ${JSON.stringify(script)} "$@"\n`, {mode: 0o755})
		sh(clone, 'config', 'core.hooksPath', hooks)
		await staleSquash()
		const blocked = spawnSync('git', ['push', '-q', 'origin', 'feat/x'], {cwd: clone, encoding: 'utf8', env: ENV})
		expect(blocked.status).not.toBe(0)
		expect(blocked.stderr).toMatch(/a\.txt[\s\S]*new\.txt[\s\S]*merge-base/)

		const allowed = spawnSync('git', ['push', '-q', 'origin', 'feat/x:refs/heads/deliberate'], {cwd: clone, encoding: 'utf8', env: {...ENV, ARROXY_ALLOW_REVERT: '1'}})
		expect(allowed.status).toBe(0)

		sh(clone, 'reset', '-q', '--hard', 'HEAD@{2}')
		sh(clone, 'reset', '-q', '--soft', sh(clone, 'merge-base', 'origin/main', 'HEAD'))
		sh(clone, 'commit', '-qm', 'feat: squashed')
		expect(spawnSync('git', ['push', '-q', 'origin', 'feat/x'], {cwd: clone, encoding: 'utf8', env: ENV}).status).toBe(0)
	})
})

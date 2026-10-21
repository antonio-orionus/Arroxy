import {lstat, mkdir, mkdtemp, readlink, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'

import {internalCheckoutDir, internalRepoUrl, linkInternalDir, worktreePaths} from '../../scripts/internal-docs.js'

describe('internalRepoUrl', () => {
	it('keeps the SSH host alias and owner of the public remote', () => {
		expect(internalRepoUrl('git@github-orionus:antonio-orionus/Arroxy.git')).toBe('git@github-orionus:antonio-orionus/arroxy-internal.git')
	})

	it('handles HTTPS remotes with or without the .git suffix', () => {
		expect(internalRepoUrl('https://github.com/antonio-orionus/Arroxy.git')).toBe('https://github.com/antonio-orionus/arroxy-internal.git')
		expect(internalRepoUrl('https://github.com/antonio-orionus/Arroxy')).toBe('https://github.com/antonio-orionus/arroxy-internal.git')
	})

	it('returns null for a remote it cannot parse', () => {
		expect(internalRepoUrl('not a url')).toBeNull()
	})
})

describe('worktreePaths', () => {
	it('lists every worktree in git worktree list --porcelain output', () => {
		const porcelain = 'worktree /code/arroxy\nHEAD abc\nbranch refs/heads/main\n\nworktree /code/arroxy/.worktrees/a b\nHEAD def\ndetached\n'
		expect(worktreePaths(porcelain)).toEqual(['/code/arroxy', '/code/arroxy/.worktrees/a b'])
	})
})

describe('internalCheckoutDir', () => {
	// Built with join so the expectation uses the platform's separators, as the
	// returned filesystem path does.
	it('puts the clone next to the main checkout, whichever worktree asks', () => {
		const owner = join(tmpdir(), 'code', 'owner')
		expect(internalCheckoutDir(join(owner, 'arroxy', '.git'))).toBe(join(owner, 'arroxy-internal'))
	})
})

describe('linkInternalDir', () => {
	let root: string
	let target: string

	beforeEach(async () => {
		const base = await mkdtemp(join(tmpdir(), 'internal-docs-'))
		root = join(base, 'checkout')
		target = join(base, 'arroxy-internal')
		await mkdir(root)
		await mkdir(target)
	})

	afterEach(async () => {
		await rm(join(root, '..'), {recursive: true, force: true})
	})

	it('creates the .internal link to the shared clone', async () => {
		expect(await linkInternalDir(root, target)).toBe('linked')
		expect(await readlink(join(root, '.internal'))).toBe(target)
	})

	it('replaces a link that points somewhere else', async () => {
		await linkInternalDir(root, join(root, 'stale'))
		expect(await linkInternalDir(root, target)).toBe('linked')
		expect(await readlink(join(root, '.internal'))).toBe(target)
	})

	it('leaves a real .internal directory alone', async () => {
		await mkdir(join(root, '.internal'))
		await writeFile(join(root, '.internal/note.md'), 'mine')
		expect(await linkInternalDir(root, target)).toBe('kept-directory')
		expect((await lstat(join(root, '.internal'))).isDirectory()).toBe(true)
	})
})

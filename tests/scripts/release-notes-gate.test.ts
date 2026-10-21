// A stable tag must publish its CHANGELOG.md section. release.sh checks it before
// tagging, but a tag pushed by hand skips the script, so the tag workflow checks
// it again before building, and publishing refuses a stable tag without notes.
// A beta may still fall back to PR titles. Publishing reads the notes from
// main, so a changelog fix-up on main reaches a re-run of publish-release.

import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import yaml from 'js-yaml'
import {afterEach, describe, expect, it} from 'vite-plus/test'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function jobSteps(job: string): Record<string, unknown>[] {
	const doc: unknown = yaml.load(readFileSync('.github/workflows/release.yml', 'utf8'))
	const jobs = isRecord(doc) && isRecord(doc.jobs) ? doc.jobs : {}
	const found = jobs[job]
	return isRecord(found) && Array.isArray(found.steps) ? found.steps.filter(isRecord) : []
}

describe('release notes for a stable tag', () => {
	it('are verified in the quality gate, for stable tags only, before anything is built', () => {
		const step = jobSteps('quality-gate').find(candidate => typeof candidate.run === 'string' && candidate.run.includes('changelog.ts verify-release'))
		expect(step).toBeDefined()
		expect(step?.run).toContain('"${GITHUB_REF_NAME#v}"')
		expect(step?.if).toBe("${{ !contains(github.ref_name, '-') }}")
	})

	it('are required by publish-release, which falls back to PR titles only for a beta', () => {
		const run = jobSteps('publish-release')
			.map(step => (typeof step.run === 'string' ? step.run : ''))
			.find(text => text.includes('MANUAL_NOTES'))
		expect(run).toBeDefined()
		const fallback = run?.slice(run.indexOf('else'), run.indexOf('gh release edit')) ?? ''
		expect(fallback).toContain('::error::')
		expect(fallback).toMatch(/\*-\*/)
		expect(fallback).toContain('exit 1')
	})
})

// Runs publish-release's notes step as GitHub does (bash -eo pipefail) in a
// checkout of the tag, with a fake gh that records the notes it would post.
describe.skipIf(process.platform === 'win32')('publish-release notes', () => {
	const tempDirs: string[] = []
	afterEach(async () => {
		await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
	})

	const ENV = {GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t'}
	const FAKE_GH = `#!/usr/bin/env bash
if [[ "$1 $2" == "api repos/o/r/releases/generate-notes" ]]; then echo "PR titles"; exit 0; fi
if [[ "$1 $2" == "release edit" ]]; then
  while [[ $# -gt 0 ]]; do [[ "$1" == --notes ]] && printf '%s' "$2" > "$NOTES_OUT"; shift; done
  exit 0
fi
echo "unexpected gh call: $*" >&2; exit 1
`
	const changelog = (sections: Record<string, string>): string => ['# Changelog', '', ...Object.entries(sections).flatMap(([version, fix]) => [`## ${version}`, '', '## Fixes', '', `- ${fix}`, ''])].join('\n')

	// The tag commit carries `atTag`; main later moves to `onMain`, or drops
	// CHANGELOG.md when it is null.
	async function publish(version: string, atTag: string, onMain: string | null): Promise<{status: number | null; notes: string; output: string}> {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-publish-notes-'))
		tempDirs.push(root)
		const git = (cwd: string, ...args: string[]): string => {
			const result = spawnSync('git', args, {cwd, env: {...process.env, ...ENV}, encoding: 'utf8'})
			if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
			return result.stdout.trim()
		}
		const origin = path.join(root, 'origin.git')
		const work = path.join(root, 'work')
		git(root, 'init', '-q', '--bare', '--initial-branch=main', origin)
		git(root, 'clone', '-q', origin, work)
		git(work, 'checkout', '-q', '-B', 'main')
		await fs.writeFile(path.join(work, 'CHANGELOG.md'), atTag)
		git(work, 'add', '.')
		git(work, 'commit', '-qm', `release: ${version}`)
		git(work, 'tag', '-a', `v${version}`, '-m', `release ${version}`)
		if (onMain === null) git(work, 'rm', '-q', 'CHANGELOG.md')
		else await fs.writeFile(path.join(work, 'CHANGELOG.md'), onMain)
		git(work, 'commit', '-qam', 'docs(changelog): fix the notes', '--allow-empty')
		git(work, 'push', '-q', 'origin', 'main', `refs/tags/v${version}`)
		// The job's checkout: the tag commit alone, as actions/checkout leaves it.
		const checkout = path.join(root, 'checkout')
		git(root, 'clone', '-q', '--depth=1', '--branch', `v${version}`, `file://${origin}`, checkout)
		const bin = path.join(root, 'bin')
		await fs.mkdir(bin)
		await fs.writeFile(path.join(bin, 'gh'), FAKE_GH, {mode: 0o755})
		const run = jobSteps('publish-release').find(step => step.name === 'Set release title and notes')?.run
		if (typeof run !== 'string') throw new Error('publish-release has no notes step')
		const notesOut = path.join(root, 'notes.md')
		const result = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', run], {cwd: checkout, encoding: 'utf8', env: {...process.env, ...ENV, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}`, REF_NAME: `v${version}`, REPO: 'o/r', GH_TOKEN: 'x', NOTES_OUT: notesOut}})
		const notes = await fs.readFile(notesOut, 'utf8').catch(() => '')
		return {status: result.status, notes, output: `${result.stdout}${result.stderr}`}
	}

	it("posts main's section, so a changelog fix-up on main reaches a re-run", async () => {
		const {status, notes} = await publish('1.2.3', changelog({'1.2.3': 'Tpyo at the tag.'}), changelog({'1.2.3': 'Fixed on main.'}))

		expect(status).toBe(0)
		expect(notes).toContain('- Fixed on main.')
		expect(notes).not.toContain('Tpyo')
		expect(notes).toContain('PR titles')
	})

	it("falls back to the tag's section, with a warning, when main has none", async () => {
		const {status, notes, output} = await publish('1.2.3-beta.1', changelog({'1.2.3-beta.1': 'Only at the tag.'}), changelog({'1.2.2': 'Older.'}))

		expect(status).toBe(0)
		expect(notes).toContain('- Only at the tag.')
		expect(output).toContain("::warning::main's CHANGELOG.md has no ## 1.2.3-beta.1 section")
	})

	it("fails rather than fall back when main's changelog cannot be read", async () => {
		const {status, notes, output} = await publish('1.2.3', changelog({'1.2.3': 'Only at the tag.'}), null)

		expect(status).not.toBe(0)
		expect(notes).toBe('')
		expect(output).toContain('CHANGELOG.md')
		expect(output).not.toContain('::warning::')
	})

	it('refuses a stable tag with no section on main or at the tag', async () => {
		const {status, output} = await publish('1.2.3', changelog({'1.2.2': 'Older.'}), changelog({'1.2.2': 'Older.'}))

		expect(status).toBe(1)
		expect(output).toContain('::error::')
	})

	it('posts PR titles alone for a beta with no section anywhere', async () => {
		const {status, notes} = await publish('1.2.3-beta.1', changelog({'1.2.2': 'Older.'}), changelog({'1.2.2': 'Older.'}))

		expect(status).toBe(0)
		expect(notes).toContain('PR titles')
		expect(notes).not.toContain('Older.')
	})
})

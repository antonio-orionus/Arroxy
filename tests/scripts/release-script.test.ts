// Runs scripts/release.sh stable against a throwaway origin and a fake `gh`
// that reports check runs per commit, to pin which commit a stable release
// tags and what it pushes. The decisions themselves are covered in
// release-gate.test.ts.

import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'

const SCRIPT = path.resolve(import.meta.dirname, '../../scripts/release.sh')
const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

// Answers only the calls release-gate.ts makes. The required contexts come
// from $FAKE_CONTEXTS, and each commit's check run from $FAKE_CHECKS/<sha>, as
// `status conclusion`; a commit without a file has no check run yet.
const FAKE_GH = `#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  "auth status") exit 0 ;;
  "repo view") echo o/r; exit 0 ;;
esac
path="$2"
if [[ "$path" == repos/o/r/branches/main/protection/required_status_checks ]]; then
  echo "{\\"contexts\\":$FAKE_CONTEXTS}"
elif [[ "$path" =~ ^repos/o/r/commits/([0-9a-f]+)/check-runs ]]; then
  file="$FAKE_CHECKS/\${BASH_REMATCH[1]}"
  if [[ -f "$file" ]]; then
    read -r status conclusion < "$file"
    [[ "$conclusion" == - ]] && conclusion=null || conclusion="\\"$conclusion\\""
    echo "{\\"check_runs\\":[{\\"id\\":1,\\"name\\":\\"check\\",\\"status\\":\\"$status\\",\\"conclusion\\":$conclusion,\\"html_url\\":null}]}"
  else
    echo '{"check_runs":[]}'
  fi
else
  echo "unexpected gh call: $*" >&2
  exit 1
fi
`

const GIT_ENV = {GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com'}

// Every commit carries CHANGELOG.md with a section for its version, the way a
// `release: X` commit assembles it, unless `notes` is false. `fragment` adds an
// unassembled changelog.d/ fragment. `i18nComplete: false` makes its translation
// completeness gate fail.
interface CommitOptions {
	version?: string
	cwd?: string
	notes?: boolean
	fragment?: string
	i18nComplete?: boolean
}

interface Fixture {
	clone: string
	origin: string
	git: (cwd: string, ...args: string[]) => string
	commit: (subject: string, options?: CommitOptions) => Promise<string>
	cloneAgain: () => string
	setCheck: (sha: string, status: string, conclusion: string) => Promise<void>
	release: (mode: 'stable' | 'beta', args?: string[], env?: Record<string, string>) => {status: number | null; output: string}
}

async function fixture(): Promise<Fixture> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-release-script-'))
	tempDirs.push(root)
	const origin = path.join(root, 'origin.git')
	const clone = path.join(root, 'clone')
	const bin = path.join(root, 'bin')
	const checks = path.join(root, 'checks')
	await Promise.all([fs.mkdir(bin), fs.mkdir(checks)])
	await fs.writeFile(path.join(bin, 'gh'), FAKE_GH, {mode: 0o755})
	const env = {...process.env, ...GIT_ENV, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}`, FAKE_CHECKS: checks, FAKE_CONTEXTS: '["check"]', RELEASE_CHECKS_TIMEOUT_MINUTES: '0'}

	const git = (cwd: string, ...args: string[]): string => {
		const result = spawnSync('git', args, {cwd, env, encoding: 'utf8'})
		if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
		return result.stdout.trim()
	}
	git(root, 'init', '--quiet', '--bare', '--initial-branch=main', origin)
	git(root, 'clone', '--quiet', origin, clone)
	git(clone, 'checkout', '--quiet', '-B', 'main')

	const versions = new Map<string, string>()
	// Each commit's package.json carries the translation completeness gate the
	// release script runs on the commit it tags: passing unless told otherwise.
	const commit = async (subject: string, options: CommitOptions = {}): Promise<string> => {
		const cwd = options.cwd ?? clone
		const version = options.version ?? versions.get(cwd) ?? '1.2.2'
		versions.set(cwd, version)
		await fs.writeFile(path.join(cwd, 'package.json'), `${JSON.stringify({name: 'fixture', version, scripts: {'check:i18n:complete': options.i18nComplete === false ? 'echo open entries; exit 1' : 'true'}}, null, 2)}\n`)
		await fs.writeFile(path.join(cwd, 'CHANGELOG.md'), options.notes === false ? '# Changelog\n' : `# Changelog\n\n---\n\n## ${version}\n\n## Fixes\n\n- A fix in ${version}.\n`)
		if (options.fragment !== undefined) {
			await fs.mkdir(path.join(cwd, 'changelog.d'), {recursive: true})
			await fs.writeFile(path.join(cwd, 'changelog.d', options.fragment), 'A fix not released yet.\n')
		}
		await fs.appendFile(path.join(cwd, 'log.txt'), `${subject}\n`)
		git(cwd, 'add', '.')
		git(cwd, 'commit', '--quiet', '-m', subject)
		git(cwd, 'push', '--quiet', 'origin', 'main')
		return git(cwd, 'rev-parse', 'HEAD')
	}
	let clones = 0
	const cloneAgain = (): string => {
		const other = path.join(root, `clone-${++clones}`)
		git(root, 'clone', '--quiet', origin, other)
		versions.set(other, JSON.parse(git(other, 'show', 'HEAD:package.json')).version)
		return other
	}

	return {
		clone,
		origin,
		git,
		commit,
		cloneAgain,
		setCheck: (sha, status, conclusion) => fs.writeFile(path.join(checks, sha), `${status} ${conclusion}\n`),
		release: (mode, args = [], extraEnv = {}) => {
			const result = spawnSync('bash', [SCRIPT, mode, ...args], {cwd: clone, env: {...env, ...extraEnv}, encoding: 'utf8'})
			return {status: result.status, output: `${result.stdout}${result.stderr}`}
		}
	}
}

describe.skipIf(process.platform === 'win32')('release.sh stable', () => {
	it('tags the release commit once its checks passed, even with later work merged on top', async () => {
		const f = await fixture()
		await f.commit('feat: earlier work')
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		const later = await f.commit('fix: merged after the release commit (#9)')
		await f.setCheck(releaseCommit, 'completed', 'success')
		await f.setCheck(later, 'in_progress', '-')

		const {status, output} = f.release('stable')

		expect(output).toContain('Release commit:')
		expect(status).toBe(0)
		expect(f.git(f.origin, 'rev-parse', 'v1.2.3^{commit}')).toBe(releaseCommit)
		expect(f.git(f.origin, 'cat-file', '-t', 'v1.2.3')).toBe('tag')
		expect(f.git(f.origin, 'rev-parse', 'main')).toBe(later)
	})

	it('refuses a release commit that is not fully translated, judged by its own tree', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3', i18nComplete: false})
		const later = await f.commit('i18n: sync translations (#10)')
		await f.setCheck(releaseCommit, 'completed', 'success')
		await f.setCheck(later, 'completed', 'success')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('open entries')
		expect(output).toContain('run the i18n sync first')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
		expect(f.git(f.clone, 'worktree', 'list').split('\n')).toHaveLength(1)
	})

	it('refuses a release commit whose fragments were not assembled, and tags nothing', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3', fragment: 'left-over.fix.md'})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('changelog:assemble')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
	})

	it('refuses a release commit with no notes for its version', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3', notes: false})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('no ## 1.2.3 section')
	})

	it('ignores fragments merged after the release commit', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		await f.commit('fix: merged after the release commit (#9)', {fragment: 'later.fix.md'})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable')

		expect(output).toContain('Release commit:')
		expect(status).toBe(0)
		expect(f.git(f.origin, 'rev-parse', 'v1.2.3^{commit}')).toBe(releaseCommit)
	})

	it('refuses while the release commit is still being checked, and tags nothing', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		await f.setCheck(releaseCommit, 'in_progress', '-')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('still running')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
		expect(f.git(f.clone, 'tag', '--list')).toBe('')
	})

	it('refuses a release commit whose required check failed', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		await f.setCheck(releaseCommit, 'completed', 'failure')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('check: failure')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
	})

	it('refuses when the release commit is not on origin/main yet', async () => {
		const f = await fixture()
		await f.commit('feat: pushed work')
		await fs.writeFile(path.join(f.clone, 'package.json'), `${JSON.stringify({name: 'fixture', version: '1.2.3'}, null, 2)}\n`)
		f.git(f.clone, 'commit', '--quiet', '-am', 'release: 1.2.3')

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('Push the release commit to main first')
	})

	it('refuses a version that has no release commit', async () => {
		const f = await fixture()
		await f.commit('chore: bump version by hand', {version: '1.2.3'})

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain("no 'release: 1.2.3' commit on origin/main")
	})
	it('reads the version from origin/main when the checkout lags behind it', async () => {
		const f = await fixture()
		await f.commit('feat: earlier work')
		const elsewhere = f.cloneAgain()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3', cwd: elsewhere})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable')

		expect(output).toContain('v1.2.3')
		expect(status).toBe(0)
		expect(f.git(f.origin, 'rev-parse', 'v1.2.3^{commit}')).toBe(releaseCommit)
	})

	it('refuses a release commit whose package.json carries another version', async () => {
		const f = await fixture()
		await f.commit('release: 1.2.3')
		await f.commit('chore: bump the version afterwards', {version: '1.2.3'})

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain("has package.json version '1.2.2', not '1.2.3'")
	})

	it('refuses when main has no required checks to verify', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable', [], {FAKE_CONTEXTS: '[]'})

		expect(status).toBe(1)
		expect(output).toContain('main has no required status checks configured')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
	})

	it('verifies without tagging under --verify-only', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', {version: '1.2.3'})
		await f.setCheck(releaseCommit, 'completed', 'success')

		const {status, output} = f.release('stable', ['--verify-only'])

		expect(status).toBe(0)
		expect(output).toContain('verified stable release gate for v1.2.3')
		expect(f.git(f.clone, 'tag', '--list')).toBe('')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
	})

	it('refuses when origin cannot be fetched', async () => {
		const f = await fixture()
		await f.commit('release: 1.2.3', {version: '1.2.3'})
		f.git(f.clone, 'remote', 'set-url', 'origin', path.join(f.origin, 'missing'))

		const {status, output} = f.release('stable')

		expect(status).toBe(1)
		expect(output).toContain('could not fetch origin/main')
	})
})

describe.skipIf(process.platform === 'win32')('release.sh beta', () => {
	it('tags HEAD and pushes it with the branch, without checking GitHub', async () => {
		const f = await fixture()
		await f.commit('release: 1.2.3-beta.1', {version: '1.2.3-beta.1'})
		await fs.writeFile(path.join(f.clone, 'package.json'), `${JSON.stringify({name: 'fixture', version: '1.2.3-beta.2', scripts: {'check:i18n:complete': 'true'}}, null, 2)}\n`)
		f.git(f.clone, 'commit', '--quiet', '-am', 'release: 1.2.3-beta.2')
		const head = f.git(f.clone, 'rev-parse', 'HEAD')

		const {status, output} = f.release('beta', [], {FAKE_CONTEXTS: 'not-json'})

		expect(output).toContain('pushed v1.2.3-beta.2')
		expect(status).toBe(0)
		expect(f.git(f.origin, 'rev-parse', 'v1.2.3-beta.2^{commit}')).toBe(head)
		expect(f.git(f.origin, 'cat-file', '-t', 'v1.2.3-beta.2')).toBe('tag')
		expect(f.git(f.origin, 'rev-parse', 'main')).toBe(head)
	})
})

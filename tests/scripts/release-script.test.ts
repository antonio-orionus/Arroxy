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

// Answers only the calls release-gate.ts makes. Each commit's check run comes
// from $FAKE_CHECKS/<sha>, as `status conclusion`; a commit without a file has
// no check run yet.
const FAKE_GH = `#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  "auth status") exit 0 ;;
  "repo view") echo o/r; exit 0 ;;
esac
path="$2"
if [[ "$path" == repos/o/r/branches/main/protection/required_status_checks ]]; then
  echo '{"contexts":["check"]}'
elif [[ "$path" =~ ^repos/o/r/commits/([0-9a-f]+)/check-runs ]]; then
  file="$FAKE_CHECKS/\${BASH_REMATCH[1]}"
  if [[ -f "$file" ]]; then
    read -r status conclusion < "$file"
    [[ "$conclusion" == - ]] && conclusion=null || conclusion="\\"$conclusion\\""
    echo "{\\"check_runs\\":[{\\"name\\":\\"check\\",\\"status\\":\\"$status\\",\\"conclusion\\":$conclusion,\\"started_at\\":\\"2026-10-21T10:00:00Z\\",\\"html_url\\":null}]}"
  else
    echo '{"check_runs":[]}'
  fi
else
  echo "unexpected gh call: $*" >&2
  exit 1
fi
`

const GIT_ENV = {GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com'}

interface Fixture {
	clone: string
	origin: string
	checks: string
	env: NodeJS.ProcessEnv
	git: (cwd: string, ...args: string[]) => string
	commit: (subject: string, version?: string) => Promise<string>
	setCheck: (sha: string, status: string, conclusion: string) => Promise<void>
	release: (...args: string[]) => {status: number | null; output: string}
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
	const env = {...process.env, ...GIT_ENV, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}`, FAKE_CHECKS: checks}

	const git = (cwd: string, ...args: string[]): string => {
		const result = spawnSync('git', args, {cwd, env, encoding: 'utf8'})
		if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`)
		return result.stdout.trim()
	}
	git(root, 'init', '--quiet', '--bare', '--initial-branch=main', origin)
	git(root, 'clone', '--quiet', origin, clone)
	git(clone, 'checkout', '--quiet', '-B', 'main')

	let version = '1.2.2'
	const commit = async (subject: string, nextVersion?: string): Promise<string> => {
		if (nextVersion) version = nextVersion
		await fs.writeFile(path.join(clone, 'package.json'), `${JSON.stringify({name: 'fixture', version}, null, 2)}\n`)
		await fs.appendFile(path.join(clone, 'log.txt'), `${subject}\n`)
		git(clone, 'add', '.')
		git(clone, 'commit', '--quiet', '-m', subject)
		git(clone, 'push', '--quiet', 'origin', 'main')
		return git(clone, 'rev-parse', 'HEAD')
	}

	return {
		clone,
		origin,
		checks,
		env,
		git,
		commit,
		setCheck: (sha, status, conclusion) => fs.writeFile(path.join(checks, sha), `${status} ${conclusion}\n`),
		release: (...args) => {
			const result = spawnSync('bash', [SCRIPT, 'stable', ...args], {cwd: clone, env: {...env, RELEASE_CHECKS_TIMEOUT_MINUTES: '0'}, encoding: 'utf8'})
			return {status: result.status, output: `${result.stdout}${result.stderr}`}
		}
	}
}

describe.skipIf(process.platform === 'win32')('release.sh stable', () => {
	it('tags the release commit once its checks passed, even with later work merged on top', async () => {
		const f = await fixture()
		await f.commit('feat: earlier work')
		const releaseCommit = await f.commit('release: 1.2.3', '1.2.3')
		const later = await f.commit('fix: merged after the release commit (#9)')
		await f.setCheck(releaseCommit, 'completed', 'success')
		await f.setCheck(later, 'in_progress', '-')

		const {status, output} = f.release()

		expect(output).toContain('Release commit:')
		expect(status).toBe(0)
		expect(f.git(f.origin, 'rev-parse', 'v1.2.3^{commit}')).toBe(releaseCommit)
		expect(f.git(f.origin, 'cat-file', '-t', 'v1.2.3')).toBe('tag')
		expect(f.git(f.origin, 'rev-parse', 'main')).toBe(later)
	})

	it('refuses while the release commit is still being checked, and tags nothing', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', '1.2.3')
		await f.setCheck(releaseCommit, 'in_progress', '-')

		const {status, output} = f.release()

		expect(status).toBe(1)
		expect(output).toContain('still running')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
		expect(f.git(f.clone, 'tag', '--list')).toBe('')
	})

	it('refuses a release commit whose required check failed', async () => {
		const f = await fixture()
		const releaseCommit = await f.commit('release: 1.2.3', '1.2.3')
		await f.setCheck(releaseCommit, 'completed', 'failure')

		const {status, output} = f.release()

		expect(status).toBe(1)
		expect(output).toContain('check: failure')
		expect(f.git(f.origin, 'tag', '--list')).toBe('')
	})

	it('refuses when the release commit is not on origin/main yet', async () => {
		const f = await fixture()
		await f.commit('feat: pushed work')
		await fs.writeFile(path.join(f.clone, 'package.json'), `${JSON.stringify({name: 'fixture', version: '1.2.3'}, null, 2)}\n`)
		f.git(f.clone, 'commit', '--quiet', '-am', 'release: 1.2.3')

		const {status, output} = f.release()

		expect(status).toBe(1)
		expect(output).toContain('Push the release commit to main first')
	})

	it('refuses a version that has no release commit', async () => {
		const f = await fixture()
		await f.commit('chore: bump version by hand', '1.2.3')

		const {status, output} = f.release()

		expect(status).toBe(1)
		expect(output).toContain("no 'release: 1.2.3' commit on origin/main")
	})
})

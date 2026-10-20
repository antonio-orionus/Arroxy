import {spawnSync} from 'node:child_process'
import {chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'

import {afterAll, beforeAll, describe, expect, it} from 'vite-plus/test'

// Drives the real run.ts against a throwaway git repo with fake `codex` and
// `claude` executables first on PATH. The fake codex prints what the real one
// printed when the subscription ran out (2026-10-21).
const RUN_TS = path.resolve(import.meta.dirname, '../../scripts/dual-review/run.ts')
const sh = process.platform !== 'win32'

const CODEX_USAGE_LIMIT = `#!/bin/sh
cat >&2 <<'EOF_STDERR'
Reading additional input from stdin...
2026-10-20T22:48:18.338693Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed
ERROR: You’ve hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/settings/usage to purchase more credits or try again at Oct 27th, 2026 9:20 AM.
EOF_STDERR
exit 1
`

const CODEX_BROKEN = `#!/bin/sh
echo "ERROR: the output schema is invalid" >&2
exit 1
`

// Answers a review with FAKE_FINDING=1 → one finding, else none; answers a
// verification by confirming every id it was handed. Logs each call.
const CLAUDE = `#!/usr/bin/env node
const fs = require('node:fs')
const args = process.argv.slice(2)
const prompt = args[args.length - 1]
const log = (line) => fs.appendFileSync(process.env.FAKE_LOG, line + '\\n')
if (process.env.FAKE_CLAUDE_FAIL) { log('failed'); process.exit(1) }
const out = (structured_output) => process.stdout.write(JSON.stringify({type: 'result', structured_output}))
if (prompt.includes('Findings to check')) {
	const json = prompt.split('Findings to check (JSON, one entry per id):\\n')[1].split('\\n\\nFor each id')[0]
	const ids = JSON.parse(json).map((f) => f.id)
	log('verify')
	out({verdicts: ids.map((id) => ({id, verdict: 'confirmed', reason: 'the code does it', introduced: true}))})
} else {
	log('review:' + prompt.split('Your focus:\\n')[1].split('\\n')[0])
	out({findings: process.env.FAKE_FINDING ? [{title: 'Queue drops a job', body: 'On restart the job is lost.', file: 'a.ts', lineStart: 1, lineEnd: 1, severity: 'P2', confidence: 0.9, introduced: true}] : []})
}
`

interface Run {
	status: number | null
	stdout: string
	stderr: string
	log: string[]
	json: {coverage: {reviewers: string[]; verifiers: string[]; codexSkipped: {reason: string} | null}}
}

describe.skipIf(!sh)('review:dual without a usable Codex', () => {
	let root: string
	let repo: string
	let bun: string
	const git = (...args: string[]) => spawnSync('git', args, {cwd: repo, encoding: 'utf8', env: {...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t'}})

	const install = (dir: string, name: string, body: string) => {
		mkdirSync(dir, {recursive: true})
		writeFileSync(path.join(dir, name), body)
		chmodSync(path.join(dir, name), 0o755)
	}

	beforeAll(() => {
		root = mkdtempSync(path.join(tmpdir(), 'dual-review-'))
		repo = path.join(root, 'repo')
		mkdirSync(repo)
		bun = spawnSync('which', ['bun'], {encoding: 'utf8'}).stdout.trim()
		git('init', '-b', 'main')
		writeFileSync(path.join(repo, 'a.ts'), 'export const a = 1\n')
		git('add', '.')
		git('commit', '-m', 'init')
		git('checkout', '-b', 'feature')
		writeFileSync(path.join(repo, 'a.ts'), 'export const a = 2\n')
		git('commit', '-am', 'feat: change a')
	})

	afterAll(() => rmSync(root, {recursive: true, force: true}))

	// `codex` is the fake's script, or null: every PATH directory holding a real codex is dropped.
	function run(name: string, args: string[], opts: {codex: string | null; env?: Record<string, string>}): Run {
		const bin = path.join(root, `bin-${name}`)
		install(bin, 'claude', CLAUDE)
		if (opts.codex !== null) install(bin, 'codex', opts.codex)
		const logFile = path.join(root, `${name}.log`)
		writeFileSync(logFile, '')
		const out = path.join(root, `out-${name}`)
		const result = spawnSync(bun, [RUN_TS, '--base', 'main', '--out', out, ...args], {
			cwd: repo,
			encoding: 'utf8',
			env: {...process.env, PATH: [bin, ...(process.env.PATH ?? '').split(path.delimiter).filter(dir => opts.codex !== null || !existsSync(path.join(dir, 'codex')))].join(path.delimiter), FAKE_LOG: logFile, ...opts.env}
		})
		return {status: result.status, stdout: result.stdout, stderr: result.stderr, log: readFileSync(logFile, 'utf8').split('\n').filter(Boolean), json: JSON.parse(readFileSync(path.join(out, 'report.json'), 'utf8'))}
	}

	it('--light falls back to one Claude reviewer and has a second Claude pass check its findings', () => {
		const r = run('light-findings', ['--light'], {codex: CODEX_USAGE_LIMIT, env: {FAKE_FINDING: '1'}})
		expect(r.log).toEqual([expect.stringMatching(/^review:The whole change/), 'verify'])
		expect(r.status).toBe(1)
		expect(r.stdout).toContain('Codex skipped (usage limit')
		expect(r.stdout).toContain('try again at Oct 27th, 2026 9:20 AM')
		expect(r.stdout).toContain('confirmed by a second claude pass')
		expect(r.json.coverage).toMatchObject({reviewers: ['claude:review'], verifiers: ['claude'], codexSkipped: {reason: 'usage-limit'}})
	})

	it('--light exits 0 only once a Claude reviewer has actually read the change', () => {
		const r = run('light-clean', ['--light'], {codex: CODEX_USAGE_LIMIT})
		expect(r.status).toBe(0)
		expect(r.log).toHaveLength(1)
		expect(r.stdout).toContain('Reviewed by claude:review')
		expect(r.stdout).toContain('Codex skipped')
	})

	it('full mode has the four Claude lanes checked by a second Claude pass', () => {
		const r = run('full', [], {codex: CODEX_USAGE_LIMIT, env: {FAKE_FINDING: '1'}})
		expect(r.log.filter(l => l.startsWith('review:'))).toHaveLength(4)
		expect(r.log.filter(l => l === 'verify')).toHaveLength(1)
		expect(r.status).toBe(1)
		expect(r.json.coverage.verifiers).toEqual(['claude'])
		expect(r.json.coverage.codexSkipped?.reason).toBe('usage-limit')
	})

	it('treats a missing codex binary like an unavailable Codex', () => {
		const r = run('missing', ['--light'], {codex: null})
		expect(r.status).toBe(0)
		expect(r.json.coverage.codexSkipped?.reason).toBe('missing')
		expect(r.stdout).toContain('Codex skipped (not installed')
	})

	it('exits 2 and says nothing reviewed the change when the fallback reviewer fails too', () => {
		const r = run('both-down', ['--light'], {codex: CODEX_USAGE_LIMIT, env: {FAKE_CLAUDE_FAIL: '1'}})
		expect(r.status).toBe(2)
		expect(r.stdout).toContain('No reviewer completed')
	})

	it('does not mistake an ordinary Codex failure for unavailability', () => {
		const r = run('broken', ['--light'], {codex: CODEX_BROKEN})
		expect(r.status).toBe(2)
		expect(r.log).toEqual([])
		expect(r.json.coverage.codexSkipped).toBeNull()
	})

	it('records the reviewed diff for review:check-head only after a complete review against origin/main', () => {
		const record = git('rev-parse', '--path-format=absolute', '--git-path', 'arroxy-reviewed-diff').stdout.trim()
		rmSync(record, {force: true})
		expect(run('no-origin', ['--light'], {codex: CODEX_USAGE_LIMIT}).status).toBe(0)
		expect(existsSync(record)).toBe(false)

		git('update-ref', 'refs/remotes/origin/main', 'main')
		try {
			expect(run('reviewer-failed', ['--light'], {codex: CODEX_USAGE_LIMIT, env: {FAKE_CLAUDE_FAIL: '1'}}).status).toBe(2)
			expect(existsSync(record)).toBe(false)
			expect(run('recorded', ['--light'], {codex: CODEX_USAGE_LIMIT}).status).toBe(0)
			expect(JSON.parse(readFileSync(record, 'utf8'))).toMatchObject({head: git('rev-parse', 'HEAD').stdout.trim(), mergeBase: git('rev-parse', 'main').stdout.trim()})
		} finally {
			git('update-ref', '-d', 'refs/remotes/origin/main')
			rmSync(record, {force: true})
		}
	})
})

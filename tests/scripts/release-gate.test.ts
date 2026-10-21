import {describe, expect, it} from 'vite-plus/test'
import {evaluateRequiredChecks, findReleaseCommit, waitForRequiredChecks, type CheckRun} from '../../scripts/releaseGate.js'

function run(name: string, status: string, conclusion: string | null = null, startedAt = '2026-10-21T10:00:00Z'): CheckRun {
	return {name, status, conclusion, started_at: startedAt, html_url: `https://github.com/o/r/runs/${name.replaceAll(' ', '-')}`}
}

describe('findReleaseCommit', () => {
	const log = [
		{sha: 'c3', subject: 'fix(queue): later work merged after the release commit (#471)'},
		{sha: 'c2', subject: 'release: 0.6.3'},
		{sha: 'c1', subject: 'release: 0.6.2'}
	]

	it('finds the release commit for the version, whatever merged after it', () => {
		expect(findReleaseCommit(log, '0.6.3')).toEqual({kind: 'found', sha: 'c2'})
	})

	it('accepts a release commit that came through a squash-merged pull request', () => {
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0.6.4 (#480)'}], '0.6.4')).toEqual({kind: 'found', sha: 'c9'})
	})

	it('does not match another version that shares a prefix', () => {
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0.6.30'}], '0.6.3')).toEqual({kind: 'missing'})
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0x6x3'}], '0.6.3')).toEqual({kind: 'missing'})
	})

	it('reports a version that has no release commit', () => {
		expect(findReleaseCommit(log, '0.6.4')).toEqual({kind: 'missing'})
	})

	it('refuses to choose between two release commits for one version', () => {
		expect(findReleaseCommit([...log, {sha: 'c0', subject: 'release: 0.6.3'}], '0.6.3')).toEqual({kind: 'ambiguous', shas: ['c2', 'c0']})
	})
})

describe('evaluateRequiredChecks', () => {
	const contexts = ['check', 'Dev smoke gate']

	it('passes once every required check completed successfully', () => {
		const result = evaluateRequiredChecks(contexts, [run('check', 'completed', 'success'), run('Dev smoke gate', 'completed', 'success')])
		expect(result.verdict).toBe('passed')
	})

	it('waits on a check that is queued, running or not started yet', () => {
		const result = evaluateRequiredChecks([...contexts, 'Cold start gate'], [run('check', 'in_progress'), run('Dev smoke gate', 'queued')])
		expect(result.verdict).toBe('pending')
		expect(result.checks.map(check => [check.context, check.state, check.detail])).toEqual([
			['check', 'pending', 'in progress'],
			['Dev smoke gate', 'pending', 'queued'],
			['Cold start gate', 'pending', 'not started']
		])
	})

	it('fails as soon as one required check failed, even while others still run', () => {
		const result = evaluateRequiredChecks(contexts, [run('check', 'completed', 'failure'), run('Dev smoke gate', 'in_progress')])
		expect(result.verdict).toBe('failed')
		expect(result.checks[0]).toMatchObject({context: 'check', state: 'failed', detail: 'failure', url: 'https://github.com/o/r/runs/check'})
	})

	it('treats a cancelled or skipped required check as a failure', () => {
		expect(evaluateRequiredChecks(['check'], [run('check', 'completed', 'cancelled')]).verdict).toBe('failed')
		expect(evaluateRequiredChecks(['check'], [run('check', 'completed', 'skipped')]).verdict).toBe('failed')
	})

	it('judges a re-run by its latest attempt', () => {
		const failedThenPassed = [run('check', 'completed', 'failure', '2026-10-21T10:00:00Z'), run('check', 'completed', 'success', '2026-10-21T10:30:00Z')]
		expect(evaluateRequiredChecks(['check'], failedThenPassed).verdict).toBe('passed')
		expect(evaluateRequiredChecks(['check'], [...failedThenPassed].reverse()).verdict).toBe('passed')
	})

	it('waits on a re-run that has not started yet', () => {
		const rerun = {...run('check', 'queued'), started_at: null}
		expect(evaluateRequiredChecks(['check'], [run('check', 'completed', 'failure'), rerun]).verdict).toBe('pending')
	})

	it('ignores check runs that are not required', () => {
		expect(evaluateRequiredChecks(['check'], [run('check', 'completed', 'success'), run('Fixture product E2E (1/4)', 'completed', 'failure')]).verdict).toBe('passed')
	})
})

describe('waitForRequiredChecks', () => {
	function harness(polls: CheckRun[][]) {
		let clock = 0
		let poll = 0
		const lines: string[] = []
		return {
			lines,
			deps: {
				fetchCheckRuns: async () => polls[Math.min(poll++, polls.length - 1)] ?? [],
				sleep: async (ms: number) => {
					clock += ms
				},
				now: () => clock,
				log: (line: string) => lines.push(line)
			},
			polls: () => poll
		}
	}

	it('polls until every required check passed, reporting progress', async () => {
		const h = harness([[run('check', 'in_progress')], [run('check', 'in_progress')], [run('check', 'completed', 'success')]])

		const result = await waitForRequiredChecks({contexts: ['check'], timeoutMs: 60 * 60_000, intervalMs: 30_000, ...h.deps})

		expect(result.verdict).toBe('passed')
		expect(h.polls()).toBe(3)
		expect(h.lines.filter(line => line.includes('Waiting on 1 of 1 required check'))).toHaveLength(2)
		expect(h.lines.at(-1)).toBe('✓ check')
	})

	it('stops at the first failed check without waiting for the rest', async () => {
		const h = harness([[run('check', 'completed', 'failure'), run('Dev smoke gate', 'in_progress')]])

		const result = await waitForRequiredChecks({contexts: ['check', 'Dev smoke gate'], timeoutMs: 60 * 60_000, intervalMs: 30_000, ...h.deps})

		expect(result.verdict).toBe('failed')
		expect(h.polls()).toBe(1)
	})

	it('gives up at the time limit while a check is still running', async () => {
		const h = harness([[run('check', 'in_progress')]])

		const result = await waitForRequiredChecks({contexts: ['check'], timeoutMs: 5 * 60_000, intervalMs: 30_000, ...h.deps})

		expect(result.verdict).toBe('timeout')
		expect(h.polls()).toBe(11)
	})

	it('looks once and does not wait when the time limit is zero', async () => {
		const h = harness([[run('check', 'queued')]])

		const result = await waitForRequiredChecks({contexts: ['check'], timeoutMs: 0, intervalMs: 30_000, ...h.deps})

		expect(result.verdict).toBe('timeout')
		expect(h.polls()).toBe(1)
	})

	it('keeps waiting through a failed lookup', async () => {
		let calls = 0
		const lines: string[] = []
		const result = await waitForRequiredChecks({
			contexts: ['check'],
			timeoutMs: 60 * 60_000,
			intervalMs: 30_000,
			fetchCheckRuns: async () => {
				calls++
				if (calls === 1) throw new Error('HTTP 502')
				return [run('check', 'completed', 'success')]
			},
			sleep: async () => {},
			now: () => 0,
			log: line => lines.push(line)
		})

		expect(result.verdict).toBe('passed')
		expect(lines.some(line => line.includes('HTTP 502'))).toBe(true)
	})
})

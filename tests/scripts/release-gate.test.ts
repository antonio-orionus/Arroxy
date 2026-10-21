import {describe, expect, it} from 'vite-plus/test'
import {evaluateRequiredChecks, findReleaseCommit, pushOfCommit, waitForRequiredChecks, type CheckRun, type RepoActivity} from '../../scripts/releaseGate.js'

// GitHub numbers check runs in creation order, so a later attempt has a higher id.
function run(name: string, status: string, conclusion: string | null = null, id = 1): CheckRun {
	return {id, name, status, conclusion, html_url: `https://github.com/o/r/runs/${name.replaceAll(' ', '-')}`}
}

describe('findReleaseCommit', () => {
	const log = [
		{sha: 'c3', subject: 'fix(queue): later work merged after the release commit (#471)'},
		{sha: 'c2', subject: 'release: 0.6.3'},
		{sha: 'c1', subject: 'release: 0.6.2'}
	]

	it('finds the release commit for the version, whatever merged after it', () => {
		expect(findReleaseCommit(log, '0.6.3')).toEqual({kind: 'found', sha: 'c2', superseded: []})
	})

	it('accepts a release commit that came through a squash-merged pull request', () => {
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0.6.4 (#480)'}], '0.6.4')).toEqual({kind: 'found', sha: 'c9', superseded: []})
	})

	it('does not match another version that shares a prefix', () => {
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0.6.30'}], '0.6.3')).toEqual({kind: 'missing'})
		expect(findReleaseCommit([{sha: 'c9', subject: 'release: 0x6x3'}], '0.6.3')).toEqual({kind: 'missing'})
	})

	it('reports a version that has no release commit', () => {
		expect(findReleaseCommit(log, '0.6.4')).toEqual({kind: 'missing'})
	})

	// A release commit whose checks failed is redone with a new `release: X`
	// commit on top of the fix; the version is not tagged until one passes.
	it('takes the newest of several release commits for one version', () => {
		expect(findReleaseCommit([{sha: 'c4', subject: 'release: 0.6.3'}, ...log, {sha: 'c0', subject: 'release: 0.6.3 (#470)'}], '0.6.3')).toEqual({kind: 'found', sha: 'c4', superseded: ['c2', 'c0']})
	})
})

describe('pushOfCommit', () => {
	// A linear history c1 <- c2 <- c3 <- c4, as `git merge-base --is-ancestor`
	// sees it: null for a commit git does not know.
	const order = ['c1', 'c2', 'c3', 'c4']
	const isAncestor = (ancestor: string, descendant: string): boolean | null => (order.includes(ancestor) && order.includes(descendant) ? order.indexOf(ancestor) <= order.indexOf(descendant) : null)
	const push = (before: string, after: string, activity_type = 'push'): RepoActivity => ({before, after, activity_type})

	it('finds a commit that was the head of its own push', () => {
		expect(pushOfCommit([push('c2', 'c4'), push('c1', 'c2')], 'c2', isAncestor)).toEqual({kind: 'head'})
		expect(pushOfCommit([push('c1', 'c2', 'pr_merge')], 'c2', isAncestor)).toEqual({kind: 'head'})
	})

	it('finds a commit pushed under later commits, which GitHub runs no push workflows on', () => {
		expect(pushOfCommit([push('c3', 'c4'), push('c1', 'c3')], 'c2', isAncestor)).toEqual({kind: 'buried', head: 'c3'})
		expect(pushOfCommit([push('0000000', 'c3', 'branch_creation')], 'c2', isAncestor)).toEqual({kind: 'buried', head: 'c3'})
	})

	it('does not blame a later push whose range starts at or after the commit', () => {
		expect(pushOfCommit([push('c2', 'c4')], 'c2', isAncestor)).toEqual({kind: 'unknown'})
		expect(pushOfCommit([push('c3', 'c4')], 'c2', isAncestor)).toEqual({kind: 'unknown'})
	})

	it('cannot tell when no recorded push carried the commit, or git does not know a push', () => {
		expect(pushOfCommit([], 'c2', isAncestor)).toEqual({kind: 'unknown'})
		expect(pushOfCommit([push('gone', 'c4')], 'c2', isAncestor)).toEqual({kind: 'unknown'})
		expect(pushOfCommit([push('c1', 'gone')], 'c2', isAncestor)).toEqual({kind: 'unknown'})
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
		const failedThenPassed = [run('check', 'completed', 'failure', 1), run('check', 'completed', 'success', 2)]
		expect(evaluateRequiredChecks(['check'], failedThenPassed).verdict).toBe('passed')
		expect(evaluateRequiredChecks(['check'], [...failedThenPassed].reverse()).verdict).toBe('passed')
	})

	it('waits on a re-run that has not finished yet', () => {
		expect(evaluateRequiredChecks(['check'], [run('check', 'completed', 'failure', 1), run('check', 'queued', null, 2)]).verdict).toBe('pending')
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

	it('says the lookup failed, not that checks are running, when it never succeeded', async () => {
		const result = await waitForRequiredChecks({contexts: ['check'], timeoutMs: 0, intervalMs: 30_000, fetchCheckRuns: () => Promise.reject(new Error('HTTP 403: rate limit exceeded')), sleep: async () => {}, now: () => 0, log: () => {}})

		expect(result).toMatchObject({verdict: 'timeout', lookupError: 'HTTP 403: rate limit exceeded'})
	})

	it('clears an earlier lookup failure once a poll succeeds', async () => {
		let calls = 0
		const fetchCheckRuns = () => (++calls === 1 ? Promise.reject(new Error('HTTP 502')) : Promise.resolve([run('check', 'in_progress')]))
		let clock = 0
		const result = await waitForRequiredChecks({
			contexts: ['check'],
			timeoutMs: 30_000,
			intervalMs: 30_000,
			fetchCheckRuns,
			sleep: async ms => {
				clock += ms
			},
			now: () => clock,
			log: () => {}
		})

		expect(result).toMatchObject({verdict: 'timeout', lookupError: null})
	})
})

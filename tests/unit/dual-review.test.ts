import {describe, expect, it} from 'vite-plus/test'

import {groupCandidates, parseChangedRanges, parseReviewOutput, parseVerdicts, renderReport, resolveGroups, toCandidates, verifierFor, type Candidate, type Finding} from '../../scripts/dual-review/core.js'

const ROOT = '/repo'

function finding(overrides: Partial<Finding> = {}): Finding {
	return {title: 'Drop the stale job', body: 'When the queue restarts, the job is lost.', file: 'src/main/queue.ts', lineStart: 10, lineEnd: 12, severity: 'P2', confidence: 0.8, introduced: true, ...overrides}
}

function candidates(engine: 'claude' | 'codex', lane: string, ...findings: Finding[]): Candidate[] {
	return toCandidates(engine, lane, findings)
}

describe('parseReviewOutput', () => {
	it('accepts a review and makes file paths repo-relative', () => {
		const out = parseReviewOutput({findings: [finding({file: '/repo/src/main/queue.ts'}), finding({file: './src/a.ts'}), finding({file: 'src\\b.ts'})]}, ROOT)
		expect(out.map(f => f.file)).toEqual(['src/main/queue.ts', 'src/a.ts', 'src/b.ts'])
	})

	it('clamps confidence and orders a reversed line range', () => {
		const [out] = parseReviewOutput({findings: [finding({confidence: 4, lineStart: 20, lineEnd: 5})]}, ROOT)
		expect(out).toMatchObject({confidence: 1, lineStart: 5, lineEnd: 20})
	})

	it('rejects a review missing required fields', () => {
		expect(() => parseReviewOutput({findings: [{title: 'x'}]}, ROOT)).toThrow()
		expect(() => parseReviewOutput('not json', ROOT)).toThrow()
	})
})

describe('parseChangedRanges', () => {
	const diff = [
		'diff --git a/src/a.ts b/src/a.ts',
		'--- a/src/a.ts',
		'+++ b/src/a.ts',
		'@@ -10,2 +12,3 @@ function x() {',
		'@@ -40 +44,0 @@',
		'diff --git a/src/old.ts b/src/new.ts',
		'--- a/src/old.ts',
		'+++ b/src/new.ts',
		'@@ -1 +1 @@',
		'diff --git a/src/gone.ts b/src/gone.ts',
		'--- a/src/gone.ts',
		'+++ /dev/null',
		'@@ -1,3 +0,0 @@'
	].join('\n')

	it('maps each new-side file to its changed line ranges', () => {
		const ranges = parseChangedRanges(diff)
		expect(ranges.get('src/a.ts')).toEqual([
			[12, 14],
			[44, 44]
		])
		expect(ranges.get('src/new.ts')).toEqual([[1, 1]])
		expect(ranges.has('src/gone.ts')).toBe(false)
	})
})

describe('groupCandidates', () => {
	it('merges Claude and Codex findings on overlapping lines into one agreed group', () => {
		const groups = groupCandidates([...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding({lineStart: 13, lineEnd: 14, severity: 'P1'}))])
		expect(groups).toHaveLength(1)
		expect(groups[0]?.engines).toEqual(['claude', 'codex'])
		expect(groups[0]?.lead.severity).toBe('P1')
		expect(verifierFor(groups[0])).toBeNull()
	})

	it('keeps findings apart when they are in different files or far apart', () => {
		const groups = groupCandidates([...candidates('codex', 'review', finding(), finding({lineStart: 200, lineEnd: 201}), finding({file: 'src/other.ts'}))])
		expect(groups).toHaveLength(3)
	})

	it('dedupes two Claude lanes reporting the same spot without calling it agreement', () => {
		const groups = groupCandidates([...candidates('claude', 'failures', finding()), ...candidates('claude', 'tests', finding({lineStart: 11, lineEnd: 11}))])
		expect(groups).toHaveLength(1)
		expect(groups[0]?.engines).toEqual(['claude'])
		expect(verifierFor(groups[0])).toBe('codex')
	})

	it('sends a Codex-only finding to Claude for checking', () => {
		const [group] = groupCandidates(candidates('codex', 'review', finding()))
		expect(verifierFor(group)).toBe('claude')
	})
})

describe('resolveGroups', () => {
	const changed = new Map([['src/main/queue.ts', [[10, 12] as const]]])

	it('confirms agreed groups without a verdict and marks introduced bugs for fixing', () => {
		const groups = groupCandidates([...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding())])
		const [resolved] = resolveGroups(groups, new Map(), changed)
		expect(resolved).toMatchObject({status: 'confirmed', agreed: true, verifiedBy: null, action: 'fix'})
	})

	it('applies the other tool’s verdict and drops refuted findings from the action list', () => {
		const groups = groupCandidates([...candidates('claude', 'tests', finding()), ...candidates('codex', 'review', finding({file: 'src/x.ts'}))])
		const verdicts = parseVerdicts({
			verdicts: [
				{id: groups[0].id, verdict: 'refuted', reason: 'The guard on line 9 returns early.', introduced: true},
				{id: groups[1].id, verdict: 'confirmed', reason: 'Traced it.', introduced: true}
			]
		})
		const resolved = resolveGroups(groups, verdicts, changed)
		expect(resolved.map(r => [r.status, r.action, r.verifiedBy])).toEqual([
			['refuted', null, 'codex'],
			['confirmed', 'fix', 'claude']
		])
	})

	it('treats a group the verifier skipped as uncertain', () => {
		const groups = groupCandidates(candidates('claude', 'tests', finding()))
		expect(resolveGroups(groups, new Map(), changed)[0]?.status).toBe('uncertain')
	})

	it('sends a pre-existing bug outside the changed lines to the backlog, and keeps one inside them', () => {
		const groups = groupCandidates([...candidates('codex', 'review', finding({introduced: false}), finding({introduced: false, lineStart: 300, lineEnd: 301})), ...candidates('claude', 'tests', finding({introduced: false}), finding({introduced: false, lineStart: 300, lineEnd: 301}))])
		expect(resolveGroups(groups, new Map(), changed).map(r => r.action)).toEqual(['fix', 'backlog'])
	})
})

describe('renderReport', () => {
	it('lists what to fix, the backlog, the refuted findings and any reviewer that failed', () => {
		const groups = groupCandidates([...candidates('codex', 'review', finding(), finding({file: 'src/far.ts', introduced: false})), ...candidates('claude', 'regressions', finding(), finding({file: 'src/far.ts', introduced: false}), finding({file: 'src/wrong.ts'}))])
		const verdicts = parseVerdicts({verdicts: [{id: groups[2].id, verdict: 'refuted', reason: 'No such path.', introduced: true}]})
		const report = renderReport({base: 'abc1234', head: 'def5678', resolved: resolveGroups(groups, verdicts, new Map()), failures: ['claude:tests exited with 1']})
		expect(report).toContain('## Fix in this change (1)')
		expect(report).toContain('## Backlog (1)')
		expect(report).toContain('## Refuted (1)')
		expect(report).toContain('No such path.')
		expect(report).toContain('claude:tests exited with 1')
	})
})

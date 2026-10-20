import {describe, expect, it} from 'vite-plus/test'

import {needsAction, parseChangedRanges, parseReviewOutput, parseVerdicts, renderReport, resolveCandidates, reviewJsonSchema, toCandidates, verdictJsonSchema, verifierFor, type Candidate, type Finding} from '../../scripts/dual-review/core.js'

const ROOT = '/repo'

function finding(overrides: Partial<Finding> = {}): Finding {
	return {title: 'Drop the stale job', body: 'When the queue restarts, the job is lost.', file: 'src/main/queue.ts', lineStart: 10, lineEnd: 12, severity: 'P2', confidence: 0.8, introduced: true, ...overrides}
}

function candidates(engine: 'claude' | 'codex', lane: string, ...findings: Finding[]): Candidate[] {
	return toCandidates(engine, lane, findings)
}

const verdict = (id: string, v: 'confirmed' | 'refuted' | 'uncertain', introduced = true) => ({id, verdict: v, reason: `${v} because of the code`, introduced})

describe('parseReviewOutput', () => {
	it('accepts a review and makes file paths repo-relative', () => {
		const out = parseReviewOutput({findings: [finding({file: '/repo/src/main/queue.ts'}), finding({file: './src/a.ts'}), finding({file: 'src\\b.ts'})]}, ROOT)
		expect(out.map(f => f.file)).toEqual(['src/main/queue.ts', 'src/a.ts', 'src/b.ts'])
	})

	it('normalizes Windows absolute paths whatever the drive letter case', () => {
		const out = parseReviewOutput({findings: [finding({file: 'C:\\repo\\src\\a.ts'}), finding({file: 'c:\\repo\\src\\b.ts'})]}, 'C:\\repo')
		expect(out.map(f => f.file)).toEqual(['src/a.ts', 'src/b.ts'])
	})

	it('strips a priority tag the reviewer put in the title', () => {
		const [out] = parseReviewOutput({findings: [finding({title: '[P2] Keep the job'})]}, ROOT)
		expect(out?.title).toBe('Keep the job')
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

describe('JSON schemas', () => {
	// The Claude CLI rejects a draft-2020-12 $schema reference, and Codex's strict
	// structured output rejects bounds keywords.
	it.each([
		['review', reviewJsonSchema],
		['verdict', verdictJsonSchema]
	])('the %s schema carries no $schema reference or bounds, and closes every object', (_name, schema) => {
		const text = JSON.stringify(schema)
		expect(schema).not.toHaveProperty('$schema')
		expect(text).not.toMatch(/"(minLength|maxLength|minimum|maximum|minItems)"/)
		expect(text.match(/"type":"object"/g)?.length).toBe(text.match(/"additionalProperties":false/g)?.length)
	})
})

describe('parseVerdicts', () => {
	it('keeps only verdicts for the reports this verifier was given', () => {
		const verdicts = parseVerdicts({verdicts: [verdict('a', 'confirmed'), verdict('b', 'refuted')]}, ['a'])
		expect([...verdicts.keys()]).toEqual(['a'])
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
		'@@ -1,3 +0,0 @@',
		'--- a/src/my file.ts\t',
		'+++ b/src/my file.ts\t',
		'@@ -1 +1 @@',
		'--- "a/src/quoted.ts"',
		'+++ "b/src/quoted.ts"',
		'@@ -2 +2 @@'
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

	it('drops the tab git appends to names with spaces and unquotes quoted names', () => {
		const ranges = parseChangedRanges(diff)
		expect(ranges.get('src/my file.ts')).toEqual([[1, 1]])
		expect(ranges.get('src/quoted.ts')).toEqual([[2, 2]])
	})
})

describe('verifierFor', () => {
	it('skips the check when the other tool reported overlapping lines', () => {
		const all = [...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding({lineStart: 12, lineEnd: 14}))]
		expect(all.map(c => verifierFor(c, all))).toEqual([null, null])
	})

	it('has the other tool check a report that only sits near the other tool’s report', () => {
		const all = [...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding({lineStart: 14, lineEnd: 15}))]
		expect(all.map(c => verifierFor(c, all))).toEqual(['claude', 'codex'])
	})

	it('does not count two Claude lanes as agreement', () => {
		const all = [...candidates('claude', 'failures', finding()), ...candidates('claude', 'tests', finding())]
		expect(all.map(c => verifierFor(c, all))).toEqual(['codex', 'codex'])
	})

	it('checks an uncorroborated report even when a corroborated one sits right next to it', () => {
		const all = [...candidates('codex', 'review', finding(), finding({title: 'Another bug', lineStart: 13, lineEnd: 13, severity: 'P1'})), ...candidates('claude', 'regressions', finding())]
		expect(all.map(c => verifierFor(c, all))).toEqual([null, 'claude', null])
	})
})

describe('resolveCandidates', () => {
	const changed = new Map([['src/main/queue.ts', [[10, 12] as const]]])

	it('confirms corroborated reports without a verdict and marks introduced bugs for fixing', () => {
		const all = [...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding())]
		expect(resolveCandidates(all, new Map(), changed)[0]).toMatchObject({status: 'confirmed', corroborated: true, verifiedBy: null, action: 'fix'})
	})

	it('applies each report’s own verdict, so a refuted report leaves the action list and its neighbour stays', () => {
		const all = candidates('codex', 'review', finding({severity: 'P1'}), finding({title: 'Real bug', lineStart: 12, lineEnd: 12}))
		const ids = all.map(c => c.id)
		const verdicts = parseVerdicts({verdicts: [verdict(ids[0], 'refuted'), verdict(ids[1], 'confirmed')]}, ids)
		expect(resolveCandidates(all, verdicts, changed).map(r => [r.title, r.status, r.action, r.verifiedBy])).toEqual([
			['Drop the stale job', 'refuted', null, 'claude'],
			['Real bug', 'confirmed', 'fix', 'claude']
		])
	})

	it('treats a report the verifier skipped as uncertain', () => {
		expect(resolveCandidates(candidates('claude', 'tests', finding()), new Map(), changed)[0]?.status).toBe('uncertain')
	})

	it('lets the verifier’s view of who introduced the bug decide fix or backlog', () => {
		const all = candidates('claude', 'tests', finding({introduced: true, lineStart: 300, lineEnd: 301}))
		const ids = all.map(c => c.id)
		const verdicts = parseVerdicts({verdicts: [verdict(ids[0], 'confirmed', false)]}, ids)
		expect(resolveCandidates(all, verdicts, changed)[0]).toMatchObject({introduced: false, action: 'backlog'})
	})

	it('sends a pre-existing bug outside the changed lines to the backlog, and keeps one inside them', () => {
		const all = [...candidates('codex', 'review', finding({introduced: false}), finding({introduced: false, lineStart: 300, lineEnd: 301})), ...candidates('claude', 'tests', finding({introduced: false}), finding({introduced: false, lineStart: 300, lineEnd: 301}))]
		expect(resolveCandidates(all, new Map(), changed).map(r => r.action)).toEqual(['fix', 'backlog', 'fix', 'backlog'])
	})
})

describe('needsAction', () => {
	const changed = new Map<string, [number, number][]>()

	it('is true for a bug to fix or an uncertain report', () => {
		expect(needsAction(resolveCandidates([...candidates('codex', 'review', finding()), ...candidates('claude', 'tests', finding())], new Map(), changed))).toBe(true)
		expect(needsAction(resolveCandidates(candidates('codex', 'review', finding()), new Map(), changed))).toBe(true)
	})

	it('is false when every report is refuted or belongs in the backlog', () => {
		expect(needsAction(resolveCandidates([...candidates('codex', 'review', finding({introduced: false})), ...candidates('claude', 'tests', finding({introduced: false}))], new Map(), changed))).toBe(false)
	})
})

describe('renderReport', () => {
	it('groups duplicates and lists fixes, backlog, uncertain and refuted reports with any failed reviewer', () => {
		const all = [...candidates('codex', 'review', finding(), finding({file: 'src/far.ts', introduced: false})), ...candidates('claude', 'regressions', finding(), finding({file: 'src/far.ts', introduced: false}), finding({file: 'src/wrong.ts'}), finding({file: 'src/maybe.ts'}))]
		const wrong = all[4].id
		const resolved = resolveCandidates(all, parseVerdicts({verdicts: [verdict(wrong, 'refuted')]}, [wrong]), new Map())
		const report = renderReport({base: 'abc1234', head: 'def5678', resolved, failures: ['claude review-claude-tests exited with 1']})
		expect(report).toContain('## Fix in this change (1)')
		expect(report).toContain('## Backlog (1)')
		expect(report).toContain('## Uncertain: read the code and decide (1)')
		expect(report).toContain('## Refuted (1)')
		expect(report).toContain('refuted because of the code')
		expect(report).toContain('claude review-claude-tests exited with 1')
		expect(report.match(/src\/main\/queue\.ts/g)).toHaveLength(1)
	})
})

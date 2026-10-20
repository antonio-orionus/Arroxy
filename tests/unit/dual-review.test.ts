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
	// Overlapping lines do not prove two tools made the same claim, so agreement
	// never skips the check; it is only noted in the report.
	it('always sends a report to the other tool, even when both tools flagged the same lines', () => {
		const all = [...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding()), ...candidates('claude', 'tests', finding())]
		expect(all.map(c => verifierFor(c))).toEqual(['claude', 'codex', 'codex'])
	})
})

describe('resolveCandidates', () => {
	const changed = new Map([['src/main/queue.ts', [[10, 12] as const]]])
	const resolve = (all: Candidate[], verdicts: ReturnType<typeof verdict>[]) =>
		resolveCandidates(
			all,
			parseVerdicts(
				{verdicts},
				all.map(c => c.id)
			),
			changed
		)

	it('notes when the other tool flagged overlapping lines but still uses the verdict', () => {
		const all = [...candidates('codex', 'review', finding()), ...candidates('claude', 'regressions', finding())]
		expect(resolve(all, [verdict(all[0].id, 'refuted'), verdict(all[1].id, 'confirmed')]).map(r => [r.status, r.corroborated, r.verifiedBy, r.action])).toEqual([
			['refuted', true, 'claude', null],
			['confirmed', true, 'codex', 'fix']
		])
	})

	it('applies each report’s own verdict, so a refuted report leaves the action list and its neighbour stays', () => {
		const all = candidates('codex', 'review', finding({severity: 'P1'}), finding({title: 'Real bug', lineStart: 12, lineEnd: 12}))
		expect(resolve(all, [verdict(all[0].id, 'refuted'), verdict(all[1].id, 'confirmed')]).map(r => [r.title, r.status, r.action])).toEqual([
			['Drop the stale job', 'refuted', null],
			['Real bug', 'confirmed', 'fix']
		])
	})

	it('treats a report the verifier skipped as uncertain', () => {
		expect(resolve(candidates('claude', 'tests', finding()), [])[0]?.status).toBe('uncertain')
	})

	it('lets the verifier’s view of who introduced the bug decide fix or backlog', () => {
		const all = candidates('claude', 'tests', finding({introduced: true, lineStart: 300, lineEnd: 301}))
		expect(resolve(all, [verdict(all[0].id, 'confirmed', false)])[0]).toMatchObject({introduced: false, action: 'backlog'})
	})

	it('keeps a pre-existing bug inside the changed lines in this change and sends one outside them to the backlog', () => {
		const all = candidates('codex', 'review', finding(), finding({lineStart: 300, lineEnd: 301}))
		expect(
			resolve(
				all,
				all.map(c => verdict(c.id, 'confirmed', false))
			).map(r => r.action)
		).toEqual(['fix', 'backlog'])
	})
})

describe('needsAction', () => {
	const changed = new Map<string, [number, number][]>()
	const resolveOne = (v: 'confirmed' | 'refuted' | 'uncertain', introduced: boolean) => {
		const all = candidates('codex', 'review', finding())
		return resolveCandidates(all, parseVerdicts({verdicts: [verdict(all[0].id, v, introduced)]}, [all[0].id]), changed)
	}

	it('is true for a bug to fix or an uncertain report', () => {
		expect(needsAction(resolveOne('confirmed', true))).toBe(true)
		expect(needsAction(resolveOne('uncertain', false))).toBe(true)
	})

	it('is false when every report is refuted or belongs in the backlog', () => {
		expect(needsAction(resolveOne('confirmed', false))).toBe(false)
		expect(needsAction(resolveOne('refuted', true))).toBe(false)
	})
})

describe('renderReport', () => {
	it('lists every report in full under fixes, backlog, uncertain and refuted, with any failed reviewer', () => {
		const all = [...candidates('codex', 'review', finding(), finding({file: 'src/far.ts'})), ...candidates('claude', 'regressions', finding({title: 'A different bug', body: 'Cancel leaves a temp file.'}), finding({file: 'src/wrong.ts'}), finding({file: 'src/maybe.ts'}))]
		const [codexQueue, codexFar, claudeQueue, claudeWrong] = all.map(c => c.id)
		const verdicts = parseVerdicts(
			{verdicts: [verdict(codexQueue, 'confirmed'), verdict(codexFar, 'confirmed', false), verdict(claudeQueue, 'confirmed'), verdict(claudeWrong, 'refuted')]},
			all.map(c => c.id)
		)
		const report = renderReport({base: 'abc1234', head: 'def5678', resolved: resolveCandidates(all, verdicts, new Map()), failures: ['claude review-claude-tests exited with 1']})
		expect(report).toContain('## Fix in this change (2)')
		expect(report).toContain('Cancel leaves a temp file.')
		expect(report).toContain('also flagged by claude:regressions')
		expect(report).toContain('## Backlog (1)')
		expect(report).toContain('## Uncertain: read the code and decide (1)')
		expect(report).toContain('## Refuted (1)')
		expect(report).toContain('refuted because of the code')
		expect(report).toContain('claude review-claude-tests exited with 1')
	})
})

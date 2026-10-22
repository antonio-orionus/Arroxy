import {describe, expect, it} from 'vite-plus/test'
import {flakyAnnotations, flakySummary, flakyTests, parseE2eReport} from '../../scripts/e2eFlakyReport.js'

const passed = {status: 'passed', retry: 0}
const WORKSPACE = '/work'
const failed = (retry: number) => ({status: 'failed', retry})

// The shape Playwright's JSON reporter writes: a suite per file, describe
// blocks as nested suites, a spec per test() and one test per project.
const report = {
	config: {rootDir: '/work/tests/e2e'},
	stats: {expected: 2, unexpected: 1, flaky: 2, skipped: 0},
	suites: [
		{
			title: 'fixture-queue.spec.ts',
			file: 'fixture-queue.spec.ts',
			specs: [
				{title: 'pauses and resumes', file: 'fixture-queue.spec.ts', line: 12, tests: [{status: 'flaky', results: [failed(0), {...passed, retry: 1}]}]},
				{title: 'cancels', file: 'fixture-queue.spec.ts', line: 40, tests: [{status: 'expected', results: [passed]}]}
			],
			suites: [{title: 'restart', file: 'fixture-queue.spec.ts', specs: [{title: 'resumes after restart', file: 'fixture-queue.spec.ts', line: 80, tests: [{status: 'flaky', results: [failed(0), {...passed, retry: 1}]}]}]}]
		},
		{
			title: 'fixture-paste.spec.ts',
			file: 'fixture-paste.spec.ts',
			specs: [
				{title: 'reads a pasted link', file: 'fixture-paste.spec.ts', line: 5, tests: [{status: 'unexpected', results: [failed(0), failed(1)]}]},
				{title: 'reads a dropped link', file: 'fixture-paste.spec.ts', line: 30, tests: [{status: 'expected', results: [passed]}]}
			]
		}
	]
}

describe('e2e flaky report', () => {
	// Playwright writes spec files relative to the test directory; annotations
	// and the summary need them relative to the workspace.
	it('lists only the tests that failed and then passed on retry, with their describe path', () => {
		expect(flakyTests(parseE2eReport(report), WORKSPACE)).toEqual([
			{file: 'tests/e2e/fixture-queue.spec.ts', line: 12, title: 'pauses and resumes', attempts: 2},
			{file: 'tests/e2e/fixture-queue.spec.ts', line: 80, title: 'restart › resumes after restart', attempts: 2}
		])
	})

	it('writes the flaky tests into a job summary section', () => {
		const summary = flakySummary(flakyTests(parseE2eReport(report), WORKSPACE))
		expect(summary).toContain('2 flaky tests')
		expect(summary).toContain('| `tests/e2e/fixture-queue.spec.ts:12` | pauses and resumes | 2 |')
		expect(summary).toContain('| `tests/e2e/fixture-queue.spec.ts:80` | restart › resumes after restart | 2 |')
	})

	it('writes nothing when no test was flaky', () => {
		const clean = {...report, stats: {flaky: 0}, suites: [report.suites[1]]}
		expect(flakySummary(flakyTests(parseE2eReport(clean), WORKSPACE))).toBe('')
		expect(flakyAnnotations(flakyTests(parseE2eReport(clean), WORKSPACE))).toEqual([])
	})

	it('keeps a title from breaking the summary table', () => {
		const summary = flakySummary([{file: 'tests/e2e/a.spec.ts', line: 1, title: 'a | b', attempts: 2}])
		expect(summary).toContain('| a \\| b |')
	})

	it('raises a warning annotation on each flaky test, escaped as GitHub workflow commands require', () => {
		expect(flakyAnnotations([{file: 'tests/e2e/a.spec.ts', line: 3, title: 'pastes 50%, then\nresumes', attempts: 2}])).toEqual(['::warning file=tests/e2e/a.spec.ts,line=3,title=Flaky test::pastes 50%25, then%0Aresumes failed, then passed on retry (2 attempts)'])
	})

	it('rejects a file that is not a Playwright JSON report', () => {
		expect(() => parseE2eReport({suites: 'none'})).toThrow()
	})
})

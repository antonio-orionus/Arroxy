// Which fixture E2E tests were flaky, read from Playwright's JSON report, and
// how the E2E Fixtures workflow reports them. Kept free of I/O so it can be
// tested; scripts/e2e-flaky-summary.ts reads the report and writes the job
// summary.
//
// A pull request run retries a failed test once (playwright.config.ts). A test
// that then passes no longer fails the run, so without this report it would
// pass unnoticed.

import path from 'node:path'
import {z} from 'zod'

// Only the fields read below; Playwright's JSONReport carries many more.
const testSchema = z.object({status: z.string(), results: z.array(z.unknown())})
const specSchema = z.object({title: z.string(), file: z.string(), line: z.number(), tests: z.array(testSchema)})

interface ReportSuite {
	title: string
	specs: z.infer<typeof specSchema>[]
	suites?: ReportSuite[]
}

const suiteSchema: z.ZodType<ReportSuite> = z.lazy(() => z.object({title: z.string(), specs: z.array(specSchema), suites: z.array(suiteSchema).optional()}))

const reportSchema = z.object({config: z.object({rootDir: z.string()}), suites: z.array(suiteSchema)})
export type E2eReport = z.infer<typeof reportSchema>

export const parseE2eReport = (json: unknown): E2eReport => reportSchema.parse(json)

export interface FlakyTest {
	/** Workspace-relative, with forward slashes, as GitHub annotations want. */
	file: string
	line: number
	/** Describe blocks and the test's own title, joined as Playwright prints them. */
	title: string
	attempts: number
}

// Playwright names a spec's file relative to the test directory (rootDir); a
// file-level suite's title is that file name, so only nested suites are
// describe blocks.
export function flakyTests(report: E2eReport, workspace: string): FlakyTest[] {
	const collect = (suite: ReportSuite, describes: string[]): FlakyTest[] => [
		...suite.specs.flatMap(spec => spec.tests.filter(test => test.status === 'flaky').map(test => ({file: path.relative(workspace, path.resolve(report.config.rootDir, spec.file)).replaceAll('\\', '/'), line: spec.line, title: [...describes, spec.title].join(' › '), attempts: test.results.length}))),
		...(suite.suites ?? []).flatMap(child => collect(child, [...describes, child.title]))
	]
	return report.suites.flatMap(fileSuite => collect(fileSuite, []))
}

const tableCell = (text: string): string => text.replaceAll('|', '\\|').replaceAll(/\s*\n\s*/g, ' ')

/** A job summary section in Markdown, or '' when no test was flaky. */
export function flakySummary(tests: readonly FlakyTest[]): string {
	if (tests.length === 0) return ''
	return [
		`### ${tests.length} flaky ${tests.length === 1 ? 'test' : 'tests'}`,
		'',
		'Each failed, then passed on retry, so the run still passed. Fix each one or open an issue for it: a flaky test can hide a real bug.',
		'',
		'| Test | Title | Attempts |',
		'| --- | --- | --- |',
		...tests.map(test => `| \`${test.file}:${test.line}\` | ${tableCell(test.title)} | ${test.attempts} |`),
		''
	].join('\n')
}

// GitHub workflow commands: https://docs.github.com/actions/reference/workflow-commands-for-github-actions
const commandData = (text: string): string => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
const commandProperty = (text: string): string => commandData(text).replaceAll(':', '%3A').replaceAll(',', '%2C')

/** One `::warning` workflow command per flaky test, shown on the run and the pull request. */
export const flakyAnnotations = (tests: readonly FlakyTest[]): string[] => tests.map(test => `::warning file=${commandProperty(test.file)},line=${test.line},title=Flaky test::${commandData(test.title)} failed, then passed on retry (${test.attempts} attempts)`)

#!/usr/bin/env bun
// Reports the fixture E2E tests that passed only on retry: a warning annotation
// on each, and a table in the job summary ($GITHUB_STEP_SUMMARY; stdout when
// unset). The E2E Fixtures workflow runs it after every suite run.
//
//   bun scripts/e2e-flaky-summary.ts playwright-report/e2e-report.json
//
// A missing report means the run stopped before Playwright finished (a failed
// build, say); that step has already failed, so this one only says so.

import {appendFileSync, existsSync, readFileSync} from 'node:fs'
import {flakyAnnotations, flakySummary, flakyTests, parseE2eReport} from './e2eFlakyReport.js'

const reportPath = process.argv[2]
if (reportPath === undefined) {
	console.error('usage: bun scripts/e2e-flaky-summary.ts <playwright-json-report>')
	process.exit(1)
}

if (!existsSync(reportPath)) {
	console.log(`No E2E report at ${reportPath}: the run stopped before Playwright finished.`)
	process.exit(0)
}

const tests = flakyTests(parseE2eReport(JSON.parse(readFileSync(reportPath, 'utf8'))), process.cwd())
for (const line of flakyAnnotations(tests)) console.log(line)

const summary = flakySummary(tests)
const summaryFile = process.env.GITHUB_STEP_SUMMARY
if (summary === '') console.log('No flaky tests.')
else if (summaryFile) appendFileSync(summaryFile, `${summary}\n`)
else console.log(summary)

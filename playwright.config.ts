import {defineConfig, type PlaywrightTestConfig} from '@playwright/test'

// Each fixture test launches a real Electron app, so a worker costs far more
// than a browser context. Four keeps a laptop and a CI runner responsive while
// still cutting wall time several-fold; the suite is I/O-bound on downloads and
// app startup rather than CPU-bound.
const WORKERS = 4

// Outside test-results/, so a green CI run still uploads no Playwright
// artifacts; CI checks out fresh, so no report outlives its run there.
export const E2E_REPORT_FILE = 'playwright-report/e2e-report.json'

// ARROXY_E2E_RUN says which run this is; the E2E Fixtures workflow sets it.
//   ci       pull requests and pushes: a failed test is retried once, and one
//            that passes on retry is listed as flaky in the job summary
//            (scripts/e2e-flaky-summary.ts reads the JSON report)
//   nightly  the scheduled run on main: no retries, so a flaky test fails it
//   unset    a local run: no retries
export function e2eRunSettings(run: string | undefined): Pick<PlaywrightTestConfig, 'retries' | 'reporter'> {
	switch (run) {
		case undefined:
			return {retries: 0, reporter: [['list']]}
		case 'ci':
			return {retries: 1, reporter: [['list'], ['json', {outputFile: E2E_REPORT_FILE}]]}
		case 'nightly':
			return {retries: 0, reporter: [['list'], ['json', {outputFile: E2E_REPORT_FILE}]]}
		default:
			throw new Error(`ARROXY_E2E_RUN is ${JSON.stringify(run)}; use ci, nightly, or leave it unset for a local run`)
	}
}

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 60_000,
	// Warms the shared runtime cache before any worker exists. Parallelism is
	// only safe because of this — see tests/e2e/globalSetup.ts.
	globalSetup: './tests/e2e/globalSetup.ts',
	fullyParallel: true,
	workers: WORKERS,
	...e2eRunSettings(process.env.ARROXY_E2E_RUN)
})

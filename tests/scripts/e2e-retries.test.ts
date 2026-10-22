// Fixture E2E retries a failed test once on pull requests and pushes, where a
// test that passes on retry is reported as flaky in the job summary; the
// nightly run on main retries nothing, so a flaky test fails it; a local run
// retries nothing either. ARROXY_E2E_RUN says which run this is (issue #554).

import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'
import {E2E_REPORT_FILE, e2eRunSettings} from '../../playwright.config.js'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown, what: string): Record<string, unknown> {
	if (!isRecord(value)) throw new Error(`${what} is not a mapping`)
	return value
}

const loadWorkflow = (file: string): Record<string, unknown> => record(yaml.load(readFileSync(`.github/workflows/${file}`, 'utf8')), file)

const stepsOf = (job: Record<string, unknown>): Record<string, unknown>[] => (Array.isArray(job.steps) ? job.steps.map((step: unknown) => record(step, 'a step')) : [])

describe('e2eRunSettings', () => {
	it('retries a failed test once in CI and writes the JSON report the flaky summary reads', () => {
		expect(e2eRunSettings('ci')).toEqual({retries: 1, reporter: [['list'], ['json', {outputFile: E2E_REPORT_FILE}]]})
	})

	it('retries nothing in the nightly run, so a flaky test fails it', () => {
		expect(e2eRunSettings('nightly')).toEqual({retries: 0, reporter: [['list'], ['json', {outputFile: E2E_REPORT_FILE}]]})
	})

	it('retries nothing in a local run', () => {
		expect(e2eRunSettings(undefined)).toEqual({retries: 0, reporter: [['list']]})
	})

	it('refuses a run it does not know rather than guessing its retries', () => {
		expect(() => e2eRunSettings('CI')).toThrow(/ARROXY_E2E_RUN/)
	})
})

describe('E2E Fixtures workflow', () => {
	const workflow = loadWorkflow('e2e-fixtures.yml')
	const jobs = record(workflow.jobs, 'jobs')
	const suiteJobs = ['fixtures', 'windows-path-limit']

	it('lets a caller choose the run, and runs as CI by default', () => {
		const call = record(record(record(workflow.on, 'on').workflow_call, 'workflow_call').inputs, 'workflow_call inputs')
		expect(call.run).toEqual({description: expect.any(String), type: 'string', required: true})
	})

	it.each(suiteJobs)('%s sets ARROXY_E2E_RUN on its suite run and summarizes flaky tests even after a failure', name => {
		const steps = stepsOf(record(jobs[name], name))
		const suiteStep = steps.find(step => typeof step.run === 'string' && step.run.startsWith('bun run test:e2e:fixtures:ci'))
		expect(record(suiteStep?.env, `${name} suite step env`).ARROXY_E2E_RUN).toBe("${{ inputs.run || 'ci' }}")
		const summary = steps.find(step => typeof step.run === 'string' && step.run.startsWith('bun scripts/e2e-flaky-summary.ts'))
		expect(summary?.if).toBe('always()')
		expect(summary?.run).toBe(`bun scripts/e2e-flaky-summary.ts ${E2E_REPORT_FILE}`)
	})
})

describe('E2E Fixtures Nightly workflow', () => {
	const workflow = loadWorkflow('e2e-fixtures-nightly.yml')

	it('runs the whole suite on main every night with no retries', () => {
		const on = record(workflow.on, 'on')
		expect(on.schedule).toEqual([{cron: expect.any(String)}])
		const jobs = record(workflow.jobs, 'jobs')
		expect(Object.keys(jobs).toSorted()).toEqual(['nightly', 'notify'])
		const nightly = record(jobs.nightly, 'nightly')
		expect(nightly.uses).toBe('./.github/workflows/e2e-fixtures.yml')
		expect(nightly.with).toEqual({run: 'nightly'})
	})

	// Reported the way Startup Nightly reports: one open issue labelled
	// e2e-nightly, commented on while the nightly keeps failing and closed once
	// it passes.
	describe('notify job', () => {
		const notify = record(record(workflow.jobs, 'jobs').notify, 'notify')
		const steps = stepsOf(notify)

		it('runs after the suite whatever its result, and alone may write issues', () => {
			expect(notify.needs).toBe('nightly')
			expect(notify.if).toBe('always()')
			expect(notify.permissions).toEqual({issues: 'write'})
			expect(workflow.permissions).toEqual({})
		})

		it('serializes the list-then-write issue flow and never cancels it', () => {
			expect(notify.concurrency).toEqual({group: 'e2e-fixtures-nightly-notify', 'cancel-in-progress': false})
		})

		it('closes the e2e-nightly issue on success', () => {
			const close = steps.find(step => step.if === "needs.nightly.result == 'success'")
			expect(close?.run).toContain('gh issue list --label e2e-nightly --state open')
			expect(close?.run).toContain('gh issue close')
		})

		it('comments on the open e2e-nightly issue on failure, or opens one', () => {
			const report = steps.find(step => step.if === "needs.nightly.result == 'failure'")
			expect(report?.run).toContain('gh issue list --label e2e-nightly --state open')
			expect(report?.run).toContain('gh issue comment')
			expect(report?.run).toContain('gh issue create --title "Fixture E2E nightly is failing" --label e2e-nightly')
			expect(report?.run).toContain('$RUN_URL')
			expect(report?.run).toContain('dev-docs/fixture-e2e.md')
		})
	})

	// Its checks are named "<job> / E2E fixtures gate", never the bare context
	// branch protection requires, and main-health does not wake on it: a flaky
	// test failing the nightly turns no main commit red and blocks no release.
	it('reports under its own name, outside the required checks', () => {
		expect(workflow.name).not.toBe('E2E Fixtures')
		const health = record(loadWorkflow('main-health.yml').on, 'on')
		expect(record(health.workflow_run, 'workflow_run').workflows).not.toContain(workflow.name)
	})
})

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
		const jobs = Object.values(record(workflow.jobs, 'jobs')).map(job => record(job, 'a job'))
		expect(jobs).toHaveLength(1)
		expect(jobs[0]?.uses).toBe('./.github/workflows/e2e-fixtures.yml')
		expect(jobs[0]?.with).toEqual({run: 'nightly'})
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

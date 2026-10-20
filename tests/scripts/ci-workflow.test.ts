// The CI workflow runs the same gate as `bun run check`, split across runners:
// one job for every gate but the unit tests, the unit tests in shards on Linux
// and Windows, and a `check` job that branch protection requires and that
// passes only when every part passed.

import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown, what: string): Record<string, unknown> {
	if (!isRecord(value)) throw new Error(`${what} is not a mapping`)
	return value
}

const doc = record(yaml.load(readFileSync('.github/workflows/ci.yml', 'utf8')), 'ci.yml')
const jobs = record(doc.jobs, 'jobs')

function runs(jobName: string): string[] {
	const steps = record(jobs[jobName], jobName).steps
	if (!Array.isArray(steps)) throw new Error(`${jobName} has no steps`)
	return steps.filter(isRecord).flatMap(step => (typeof step.run === 'string' ? [step.run] : []))
}

function shards(jobName: string): string[] {
	const matrix = record(record(record(jobs[jobName], jobName).strategy, `${jobName}.strategy`).matrix, `${jobName}.strategy.matrix`)
	return Array.isArray(matrix.shard) ? matrix.shard.map(String) : []
}

describe('CI workflow', () => {
	it('runs every gate of `bun run check` but the unit tests in one job', () => {
		const gates = record(jobs.gates, 'gates')
		expect(runs('gates')).toContain('bun run check')
		expect(record(gates.env, 'gates.env').CHECK_TESTS_SEPARATELY).toBe('1')
	})

	it('runs the whole unit test suite in shards, on Linux and on Windows', () => {
		for (const job of ['test', 'test-windows']) {
			const list = shards(job)
			expect(list.length).toBeGreaterThan(1)
			expect(list).toEqual(list.map((_, index) => `${index + 1}/${list.length}`))
			expect(runs(job)).toContain('bun run test --shard=${{ matrix.shard }}')
		}
		expect(record(jobs['test-windows'], 'test-windows')['runs-on']).toBe('windows-latest')
	})

	it('passes `check`, the required context, only when every part passed', () => {
		const check = record(jobs.check, 'check')
		expect(check.name).toBe('check')
		expect(check.if).toBe('always()')
		expect(check.needs).toEqual(['gates', 'test', 'test-windows'])
		expect(runs('check').join('\n')).toContain('all(. == "success")')
	})

	it('keeps every other job off the required context name', () => {
		const names = Object.entries(jobs).map(([id, job]) => (isRecord(job) && typeof job.name === 'string' ? job.name : id))
		expect(names.filter(name => name === 'check')).toHaveLength(1)
	})
})

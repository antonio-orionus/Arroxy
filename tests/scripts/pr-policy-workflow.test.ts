// The PR policy workflow runs scripts/check-pr-policy.ts on every pull request,
// re-runs it when the PR body changes, and holds the translation sync PR to the
// release completeness gate.

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

const doc = record(yaml.load(readFileSync('.github/workflows/pr-policy.yml', 'utf8')), 'pr-policy.yml')
// js-yaml reads the `on:` key as the boolean true.
const triggers = record(doc.on ?? doc.true, 'on')
const job = record(record(doc.jobs, 'jobs')['pr-policy'], 'pr-policy')
const steps = Array.isArray(job.steps) ? job.steps.filter(isRecord) : []
const step = (name: string): Record<string, unknown> =>
	record(
		steps.find(candidate => candidate.name === name),
		name
	)

describe('PR policy workflow', () => {
	it('runs on every pull request, and again when its body or title is edited', () => {
		const pullRequest = record(triggers.pull_request, 'pull_request')
		expect(pullRequest.types).toEqual(expect.arrayContaining(['opened', 'synchronize', 'reopened', 'edited']))
		expect(pullRequest.paths).toBeUndefined()
		expect(pullRequest['paths-ignore']).toBeUndefined()
		expect(job.if).toBeUndefined()
		expect(job.name).toBe('pr-policy')
	})

	it('checks out the merge commit with full history, so the checker comes from the base and the merge base is there', () => {
		const checkout = record(steps[0]?.with, 'checkout.with')
		expect(checkout['fetch-depth']).toBe(0)
		expect(checkout.ref).toBeUndefined()
	})

	it('passes the PR text through the environment, not the command line', () => {
		const policy = step('Check the pull request')
		expect(policy.run).toBe('bun scripts/check-pr-policy.ts "$BASE_SHA" "$HEAD_SHA"')
		const env = record(policy.env, 'env')
		expect(env.PR_BODY).toBe('${{ github.event.pull_request.body }}')
		expect(env.BASE_SHA).toBe('${{ github.event.pull_request.base.sha }}')
	})

	it('runs the translation completeness gate on the sync PR, even after a policy failure', () => {
		const sync = step('Check the translation sync is complete')
		expect(sync.run).toBe('bun run check:i18n:complete')
		expect(sync.if).toBe("${{ !cancelled() && steps.policy.outputs.translation_sync == 'true' }}")
	})
})

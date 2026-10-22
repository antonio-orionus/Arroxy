// The issue policy workflow runs scripts/check-issue-policy.ts on every issue a
// maintainer files or edits, and marks one that breaks the policy with the
// needs-triage label instead of failing a check nobody sees.

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

const doc = record(yaml.load(readFileSync('.github/workflows/issue-policy.yml', 'utf8')), 'issue-policy.yml')
// js-yaml reads the `on:` key as the boolean true.
const triggers = record(doc.on ?? doc.true, 'on')
const job = record(record(doc.jobs, 'jobs')['issue-policy'], 'issue-policy')
const steps = Array.isArray(job.steps) ? job.steps.filter(isRecord) : []
const step = (name: string): Record<string, unknown> =>
	record(
		steps.find(candidate => candidate.name === name),
		name
	)

describe('issue policy workflow', () => {
	it('runs when an issue is opened, edited, reopened or relabelled', () => {
		const issues = record(triggers.issues, 'issues')
		expect(issues.types).toEqual(expect.arrayContaining(['opened', 'edited', 'reopened', 'labeled', 'unlabeled']))
		expect(Object.keys(triggers)).toEqual(['issues'])
	})

	it('runs one check at a time per issue and never cancels one half-way', () => {
		expect(record(doc.concurrency, 'concurrency')).toEqual({group: '${{ github.workflow }}-${{ github.event.issue.number }}', 'cancel-in-progress': false})
	})

	it('can label and comment on issues, and nothing more', () => {
		expect(record(doc.permissions, 'permissions')).toEqual({contents: 'read', issues: 'write'})
	})

	it('checks out without persisting credentials', () => {
		expect(record(steps[0]?.with, 'checkout.with')['persist-credentials']).toBe(false)
	})

	it('reads the current title, body, labels and state in one lookup that fails the job when it fails', () => {
		const read = step('Read the issue as it is now')
		expect(read.run).toBe('gh issue view "$NUMBER" --json title,body,labels,state > "$RUNNER_TEMP/issue.json"')
		expect(read.shell).toBeUndefined()
	})

	it('checks that snapshot, never the text or labels of the event payload', () => {
		const check = step('Check the issue')
		expect(check.run).toBe('bun scripts/check-issue-policy.ts')
		const env = record(check.env, 'env')
		expect(env.ISSUE_FILE).toBe('${{ runner.temp }}/issue.json')
		expect(env.ISSUE_AUTHOR_ASSOCIATION).toBe('${{ github.event.issue.author_association }}')
		const workflow = readFileSync('.github/workflows/issue-policy.yml', 'utf8')
		expect(workflow).not.toContain('github.event.issue.title')
		expect(workflow).not.toContain('github.event.issue.body')
	})

	it('adds needs-triage with the report on a failing issue, once', () => {
		const flag = step('Flag the issue')
		expect(flag.if).toBe("${{ steps.check.outputs.verdict == 'fail' && steps.check.outputs.flagged == 'false' }}")
		expect(String(flag.run)).toContain('--add-label needs-triage')
		expect(String(flag.run)).toContain('gh issue comment')
	})

	it('posts the report before adding the label, so a failed comment leaves the issue unflagged for the next run', () => {
		const run = String(step('Flag the issue').run)
		expect(run.indexOf('gh issue comment')).toBeLessThan(run.indexOf('--add-label needs-triage'))
	})

	it('removes needs-triage once the issue passes', () => {
		const clear = step('Clear the flag')
		expect(clear.if).toBe("${{ steps.check.outputs.verdict == 'pass' && steps.check.outputs.flagged == 'true' }}")
		expect(String(clear.run)).toContain('--remove-label needs-triage')
	})

	it('never reads the labels from the event payload', () => {
		expect(readFileSync('.github/workflows/issue-policy.yml', 'utf8')).not.toContain('github.event.issue.labels')
	})
})

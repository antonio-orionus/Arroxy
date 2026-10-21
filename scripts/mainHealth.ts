// Decisions behind .github/workflows/main-health.yml, kept free of GitHub I/O so
// they can be tested: is `main` red, green or still running, and what to do
// with the one "main is red" issue. scripts/main-health.ts does the I/O.

import {evaluateRequiredChecks, type CheckRun, type CheckState} from './releaseGate.js'

// The checks branch protection requires on main (dev-docs/ci-cd-strategy.md,
// "Branch protection contract") and the workflow that reports each. The
// workflow token cannot read branch protection, so the list lives here; a test
// holds it equal to the doc and to the workflows.
export const MAIN_REQUIRED_CHECKS = [
	{context: 'check', workflow: 'CI'},
	{context: 'FFmpeg remux gate', workflow: 'FFmpeg Remux Matrix'},
	{context: 'E2E fixtures gate', workflow: 'E2E Fixtures'},
	{context: 'Cold start gate', workflow: 'E2E Cold Start'},
	{context: 'Windows installer gate', workflow: 'Windows Installer'},
	{context: 'Dev smoke gate', workflow: 'Dev Smoke'}
] as const

export const MAIN_HEALTH_TITLE = 'main is red'
export const MAIN_HEALTH_LABEL = 'main-red'

export type FailingCheck = CheckState & {workflow: string}
export type MainHealth = {kind: 'red'; failing: FailingCheck[]} | {kind: 'green'} | {kind: 'unsettled'; waiting: CheckState[]}

// Conclusions that say the code is broken. A cancelled or skipped check says
// nothing either way (someone stopped it), so it neither opens nor closes the issue.
const RED_CONCLUSIONS = new Set(['failure', 'timed_out', 'startup_failure'])

// A check run links to its job at .../actions/runs/<run id>/job/<job id>.
export function workflowRunIdOf(url: string | null): number | null {
	const id = url === null ? undefined : /\/actions\/runs\/(\d+)\//.exec(url)?.[1]
	return id === undefined ? null : Number(id)
}

// cancelledWorkflowRuns: workflow runs whose latest attempt was cancelled. Each
// gate job runs with always(), so cancelling its run fails the gate on its
// cancelled needs; that failure is no verdict on the code.
export function mainHealth(runs: readonly CheckRun[], cancelledWorkflowRuns: ReadonlySet<number> = new Set()): MainHealth {
	const contexts = MAIN_REQUIRED_CHECKS.map(check => check.context)
	const checks = evaluateRequiredChecks(contexts, runs).checks.map(check => {
		const runId = workflowRunIdOf(check.url)
		return check.state === 'failed' && runId !== null && cancelledWorkflowRuns.has(runId) ? {...check, detail: 'workflow run cancelled'} : check
	})
	const failing = MAIN_REQUIRED_CHECKS.flatMap(({context, workflow}) => {
		const check = checks.find(c => c.context === context)
		return check?.state === 'failed' && RED_CONCLUSIONS.has(check.detail) ? [{...check, workflow}] : []
	})
	if (failing.length > 0) return {kind: 'red', failing}
	if (checks.every(check => check.state === 'passed')) return {kind: 'green'}
	return {kind: 'unsettled', waiting: checks.filter(check => check.state !== 'passed')}
}

export interface CommitInfo {
	sha: string
	subject: string
	// GitHub login when the commit links to an account, else the git author name.
	author: string
	url: string
}

export interface OpenIssue {
	number: number
	// The issue body and every comment, to find what was already reported.
	texts: string[]
}

export type IssueAction = {kind: 'none'; reason: string} | {kind: 'open'; title: string; body: string} | {kind: 'comment'; issue: number; body: string} | {kind: 'close'; issue: number; body: string}

// A squash-merged pull request appends ` (#N)` to the subject; a direct push has none.
const PR_SUFFIX = / \(#(\d+)\)$/

const shortSha = (sha: string): string => sha.slice(0, 7)

// One report per commit and set of failing checks: six workflows finish per
// push, and each wakes the job.
const marker = (sha: string, failing: readonly FailingCheck[]): string => `<!-- main-health sha=${sha} failing=${failing.map(check => check.context).join('|')} -->`

function redReport(failing: readonly FailingCheck[], commit: CommitInfo, repoUrl: string): string {
	const pr = PR_SUFFIX.exec(commit.subject)?.[1]
	const origin = pr === undefined ? `by @${commit.author}, pushed straight to \`main\`` : `by @${commit.author}, from ${repoUrl}/pull/${pr}`
	return [
		`Required checks failed on \`main\` at [\`${shortSha(commit.sha)}\`](${commit.url}): ${commit.subject}`,
		'',
		`Commit ${origin}.`,
		'',
		'| Workflow | Check | Result |',
		'| --- | --- | --- |',
		...failing.map(check => `| ${check.workflow} | ${check.url === null ? check.context : `[${check.context}](${check.url})`} | ${check.detail} |`),
		'',
		'Every open pull request inherits this failure and its auto-merge stalls. Fix or revert it on `main`, or re-run the check if it was flaky. This issue closes itself once every required check passes on a later `main` commit.',
		'',
		marker(commit.sha, failing)
	].join('\n')
}

export function decideIssueAction(health: MainHealth, issue: OpenIssue | null, commit: CommitInfo, repoUrl: string): IssueAction {
	if (health.kind === 'unsettled') return {kind: 'none', reason: `waiting on ${health.waiting.map(check => `${check.context} (${check.detail})`).join(', ')}`}
	if (health.kind === 'green') {
		if (issue === null) return {kind: 'none', reason: 'main is green and no issue is open'}
		return {kind: 'close', issue: issue.number, body: `\`main\` is green again: every required check passed on [\`${shortSha(commit.sha)}\`](${commit.url}): ${commit.subject}`}
	}
	const body = redReport(health.failing, commit, repoUrl)
	if (issue === null) return {kind: 'open', title: MAIN_HEALTH_TITLE, body}
	if (issue.texts.some(text => text.includes(marker(commit.sha, health.failing)))) return {kind: 'none', reason: `already reported on #${issue.number}`}
	return {kind: 'comment', issue: issue.number, body}
}

// Decisions behind the stable release gate in scripts/release.sh, kept free of
// git and GitHub I/O so they can be tested: which commit is the release commit,
// and whether its required checks passed, failed or are still running.
// scripts/release-gate.ts does the I/O.

import {z} from 'zod'

export interface CommitLine {
	sha: string
	subject: string
}

export type ReleaseCommitLookup = {kind: 'found'; sha: string} | {kind: 'missing'} | {kind: 'ambiguous'; shas: string[]}

// The release commit is the `release: X` commit that carries the version bump
// and the changelog. Pushed straight to main its subject is exactly that; a
// squash-merged pull request appends ` (#N)`.
const RELEASE_SUBJECT = /^release: (\S+?)(?: \(#\d+\))?$/

export function findReleaseCommit(commits: readonly CommitLine[], version: string): ReleaseCommitLookup {
	const shas = commits.filter(commit => RELEASE_SUBJECT.exec(commit.subject)?.[1] === version).map(commit => commit.sha)
	if (shas.length === 0) return {kind: 'missing'}
	const [sha] = shas
	return shas.length === 1 && sha !== undefined ? {kind: 'found', sha} : {kind: 'ambiguous', shas}
}

export const checkRunSchema = z.object({name: z.string(), status: z.string(), conclusion: z.string().nullable(), started_at: z.string().nullable(), html_url: z.string().nullable()})
export type CheckRun = z.infer<typeof checkRunSchema>
export const checkRunsResponseSchema = z.object({check_runs: z.array(checkRunSchema)})

export interface CheckState {
	context: string
	state: 'passed' | 'pending' | 'failed'
	detail: string
	url: string | null
}
export type ChecksVerdict = 'passed' | 'pending' | 'failed'

// A re-run that has not started yet has no start time and is newer than every
// attempt that has.
const startedAt = (run: CheckRun): string => run.started_at ?? '\uffff'

function latestRun(runs: readonly CheckRun[], context: string): CheckRun | undefined {
	return runs.filter(run => run.name === context).reduce<CheckRun | undefined>((latest, run) => (latest === undefined || startedAt(run) >= startedAt(latest) ? run : latest), undefined)
}

function checkState(context: string, run: CheckRun | undefined): CheckState {
	if (run === undefined) return {context, state: 'pending', detail: 'not started', url: null}
	if (run.status !== 'completed') return {context, state: 'pending', detail: run.status.replaceAll('_', ' '), url: run.html_url}
	return {context, state: run.conclusion === 'success' ? 'passed' : 'failed', detail: run.conclusion ?? 'no conclusion', url: run.html_url}
}

// Only success passes. A cancelled or skipped required check left the commit
// without a verdict, so it refuses like a failure: re-run it.
export function evaluateRequiredChecks(contexts: readonly string[], runs: readonly CheckRun[]): {verdict: ChecksVerdict; checks: CheckState[]} {
	const checks = contexts.map(context => checkState(context, latestRun(runs, context)))
	const verdict: ChecksVerdict = checks.some(check => check.state === 'failed') ? 'failed' : checks.some(check => check.state === 'pending') ? 'pending' : 'passed'
	return {verdict, checks}
}

export interface WaitOptions {
	contexts: readonly string[]
	timeoutMs: number
	intervalMs: number
	fetchCheckRuns: () => Promise<CheckRun[]>
	sleep: (ms: number) => Promise<void>
	now: () => number
	log: (line: string) => void
}

const duration = (ms: number): string => `${Math.floor(ms / 60_000)}m${String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')}s`

// Polls until every required check passed or one failed, for at most timeoutMs.
// A zero limit looks once. A lookup that fails (a GitHub hiccup) is reported and
// retried on the next poll, within the same limit.
export async function waitForRequiredChecks(options: WaitOptions): Promise<{verdict: 'passed' | 'failed' | 'timeout'; checks: CheckState[]}> {
	const {contexts, timeoutMs, intervalMs, fetchCheckRuns, sleep, now, log} = options
	const start = now()
	const reported = new Set<string>()
	let checks: CheckState[] = contexts.map(context => checkState(context, undefined))

	for (;;) {
		try {
			const result = evaluateRequiredChecks(contexts, await fetchCheckRuns())
			checks = result.checks
			for (const check of checks) {
				if (check.state === 'passed' && !reported.has(check.context)) {
					reported.add(check.context)
					log(`✓ ${check.context}`)
				}
			}
			if (result.verdict !== 'pending') return {verdict: result.verdict, checks}
			const pending = checks.filter(check => check.state === 'pending')
			log(`… Waiting on ${pending.length} of ${contexts.length} required check(s), ${duration(now() - start)} of ${duration(timeoutMs)}: ${pending.map(check => `${check.context} (${check.detail})`).join(', ')}`)
		} catch (error) {
			log(`… Could not read check runs (${error instanceof Error ? error.message : String(error)}); retrying.`)
		}

		const remaining = start + timeoutMs - now()
		if (remaining <= 0) return {verdict: 'timeout', checks}
		await sleep(Math.min(intervalMs, remaining))
	}
}

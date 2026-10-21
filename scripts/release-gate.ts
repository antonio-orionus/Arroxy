#!/usr/bin/env bun
// Git and GitHub side of the stable release gate; scripts/release.sh calls it.
//
//   bun scripts/release-gate.ts release-commit --version 0.6.3 --ref origin/main
//     Prints the sha of the `release: 0.6.3` commit on that ref, after checking
//     that its package.json carries the version.
//   bun scripts/release-gate.ts checks --commit <sha> --timeout-minutes 60
//     Waits until every check that branch protection requires on main passed on
//     that commit. Exits 1 on a failed check or at the time limit.
//
// Progress and errors go to stderr; stdout carries only the release commit.

import {spawnSync} from 'node:child_process'
import {parseArgs} from 'node:util'
import {z} from 'zod'
import {checkRunsResponseSchema, findReleaseCommit, waitForRequiredChecks, type CheckRun, type CheckState} from './releaseGate.js'

const POLL_INTERVAL_MS = 30_000

class GateError extends Error {}

function exec(cmd: string, args: string[]): string {
	const result = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
	if (result.error) throw new GateError(`could not run ${cmd}: ${result.error.message}`)
	if (result.status !== 0) throw new GateError(`${cmd} ${args.join(' ')} failed: ${result.stderr.trim()}`)
	return result.stdout
}

const ghJson = (path: string): unknown => JSON.parse(exec('gh', ['api', path]))

function releaseCommit(version: string, ref: string): string {
	const log = exec('git', ['log', '--format=%H%x09%s', ref])
		.split('\n')
		.flatMap(line => {
			const tab = line.indexOf('\t')
			return tab > 0 ? [{sha: line.slice(0, tab), subject: line.slice(tab + 1)}] : []
		})
	const lookup = findReleaseCommit(log, version)
	if (lookup.kind === 'missing') throw new GateError(`no 'release: ${version}' commit on ${ref}. Commit the version bump and changelog as 'release: ${version}' and push it to main first.`)
	if (lookup.kind === 'ambiguous') throw new GateError(`${lookup.shas.length} commits on ${ref} are titled 'release: ${version}' (${lookup.shas.join(', ')}); bump to a new version instead.`)

	const tagged = z.object({version: z.string()}).parse(JSON.parse(exec('git', ['show', `${lookup.sha}:package.json`]))).version
	if (tagged !== version) throw new GateError(`release commit ${lookup.sha} has package.json version '${tagged}', not '${version}'.`)
	return lookup.sha
}

function describeCheck(check: CheckState): string {
	return `  ${check.context}: ${check.detail}${check.url ? `\n     ${check.url}` : ''}`
}

async function checks(commit: string, timeoutMinutes: number): Promise<number> {
	exec('gh', ['auth', 'status'])
	const repo = exec('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner']).trim()
	let contexts: string[]
	try {
		contexts = z.object({contexts: z.array(z.string())}).parse(ghJson(`repos/${repo}/branches/main/protection/required_status_checks`)).contexts
	} catch (error) {
		throw new GateError(`could not read the required status checks of main from branch protection (${error instanceof Error ? error.message : String(error)}).`)
	}
	if (contexts.length === 0) throw new GateError('main has no required status checks configured; refusing to cut an unguarded stable release.')

	// Synchronous gh calls; a throw is caught by the poll loop like a rejection.
	const fetchCheckRuns = (): Promise<CheckRun[]> => Promise.resolve(contexts.flatMap(context => checkRunsResponseSchema.parse(ghJson(`repos/${repo}/commits/${commit}/check-runs?check_name=${encodeURIComponent(context)}&filter=all&per_page=100`)).check_runs))

	console.error(`Verifying required checks on release commit ${commit}...`)
	const result = await waitForRequiredChecks({contexts, timeoutMs: timeoutMinutes * 60_000, intervalMs: POLL_INTERVAL_MS, fetchCheckRuns, sleep: ms => new Promise(resolve => setTimeout(resolve, ms)), now: () => Date.now(), log: line => console.error(line)})

	if (result.verdict === 'passed') return 0
	if (result.verdict === 'failed') {
		console.error(`ERR: a required check did not pass on ${commit}; fix it on main and cut a new release commit, or re-run a flaky or cancelled check:`)
		for (const check of result.checks.filter(c => c.state === 'failed')) console.error(describeCheck(check))
		return 1
	}
	if (result.lookupError !== null) {
		console.error(`ERR: could not read the check runs of ${commit} from GitHub: ${result.lookupError}`)
		return 1
	}
	const pending = result.checks.filter(check => check.state === 'pending')
	console.error(timeoutMinutes === 0 ? `ERR: required checks are still running on ${commit}:` : `ERR: timed out after ${timeoutMinutes} min; required checks still running on ${commit}:`)
	for (const check of pending) console.error(describeCheck(check))
	console.error(`     Watch them with 'gh run list --commit ${commit}', then run the release again (RELEASE_CHECKS_TIMEOUT_MINUTES sets the limit).`)
	return 1
}

async function main(argv: string[]): Promise<number> {
	const [command, ...rest] = argv
	const {values} = parseArgs({args: rest, options: {version: {type: 'string'}, ref: {type: 'string'}, commit: {type: 'string'}, 'timeout-minutes': {type: 'string'}}})
	if (command === 'release-commit' && values.version && values.ref) {
		console.log(releaseCommit(values.version, values.ref))
		return 0
	}
	if (command === 'checks' && values.commit) {
		const timeout = Number(values['timeout-minutes'] ?? '60')
		if (!Number.isFinite(timeout) || timeout < 0) throw new GateError(`invalid --timeout-minutes '${values['timeout-minutes']}'`)
		return checks(values.commit, timeout)
	}
	console.error('usage: release-gate.ts release-commit --version X --ref REF | checks --commit SHA [--timeout-minutes N]')
	return 2
}

try {
	process.exitCode = await main(process.argv.slice(2))
} catch (error) {
	console.error(`ERR: ${error instanceof Error ? error.message : String(error)}`)
	process.exitCode = 1
}

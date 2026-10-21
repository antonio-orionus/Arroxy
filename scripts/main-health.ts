#!/usr/bin/env bun
// GitHub side of .github/workflows/main-health.yml: reads the required checks
// on the tip of `main` and opens, updates or closes the one "main is red" issue.
//
//   bun scripts/main-health.ts                  act on the tip of main
//   bun scripts/main-health.ts --dry-run        print the action instead of taking it
//   bun scripts/main-health.ts --dry-run --sha <sha>
//                                               judge a past commit instead (validation)
//
// It always judges the tip, never the commit whose run woke it: a late run of
// an older commit must not reopen an issue a newer green commit closed, and a
// run that only finished late cannot close one the newer tip still fails.

import {spawnSync} from 'node:child_process'
import {parseArgs} from 'node:util'
import {decideIssueAction, MAIN_HEALTH_LABEL, MAIN_REQUIRED_CHECKS, mainHealth, parseBodies, parseCheckRuns, parseCommit, parseIssueNumbers, parseWorkflowRunConclusion, workflowRunIdOf, type CheckRun, type IssueAction, type OpenIssue} from './mainHealth.js'

class HealthError extends Error {}

function gh(args: string[], input?: string): string {
	const result = spawnSync('gh', args, {encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024})
	if (result.error) throw new HealthError(`could not run gh: ${result.error.message}`)
	if (result.status !== 0) throw new HealthError(`gh ${args.join(' ')} failed: ${result.stderr.trim()}`)
	return result.stdout
}

const ghJson = (path: string): unknown => JSON.parse(gh(['api', path]))
// --slurp wraps every page in one outer array.
const ghPages = (path: string): unknown => JSON.parse(gh(['api', '--paginate', '--slurp', path]))

function readCheckRuns(repo: string, sha: string): CheckRun[] {
	return MAIN_REQUIRED_CHECKS.flatMap(({context}) => parseCheckRuns(ghJson(`repos/${repo}/commits/${sha}/check-runs?check_name=${encodeURIComponent(context)}&filter=all&per_page=100`)))
}

// Only the workflow runs behind a failed check matter; a passing one needs no lookup.
function readCancelledWorkflowRuns(repo: string, runs: readonly CheckRun[]): Set<number> {
	const ids = new Set(runs.filter(run => run.status === 'completed' && run.conclusion !== 'success').flatMap(run => workflowRunIdOf(run.html_url) ?? []))
	return new Set([...ids].filter(id => parseWorkflowRunConclusion(ghJson(`repos/${repo}/actions/runs/${id}`)) === 'cancelled'))
}

// The oldest open issue with the label is the one; the workflow never opens a second.
function readOpenIssue(repo: string): OpenIssue | null {
	const [number] = parseIssueNumbers(ghPages(`repos/${repo}/issues?labels=${MAIN_HEALTH_LABEL}&state=open&sort=created&direction=asc&per_page=100`))
	if (number === undefined) return null
	const body = parseBodies([[ghJson(`repos/${repo}/issues/${number}`)]])
	return {number, texts: [...body, ...parseBodies(ghPages(`repos/${repo}/issues/${number}/comments?per_page=100`))]}
}

function apply(repo: string, action: IssueAction): void {
	switch (action.kind) {
		case 'none':
			return
		case 'open':
			gh(['label', 'create', MAIN_HEALTH_LABEL, '--repo', repo, '--force', '--color', 'B60205', '--description', 'A required check failed on main'])
			console.log(gh(['issue', 'create', '--repo', repo, '--title', action.title, '--label', MAIN_HEALTH_LABEL, '--body-file', '-'], action.body).trim())
			return
		case 'comment':
			gh(['issue', 'comment', String(action.issue), '--repo', repo, '--body-file', '-'], action.body)
			return
		case 'close':
			gh(['issue', 'comment', String(action.issue), '--repo', repo, '--body-file', '-'], action.body)
			gh(['issue', 'close', String(action.issue), '--repo', repo])
			return
		default: {
			const unreachable: never = action
			throw new HealthError(`unknown action ${JSON.stringify(unreachable)}`)
		}
	}
}

function main(argv: string[]): number {
	const {values} = parseArgs({args: argv, options: {'dry-run': {type: 'boolean', default: false}, sha: {type: 'string'}}})
	if (values.sha !== undefined && !values['dry-run']) throw new HealthError('--sha judges a past commit and is only allowed with --dry-run')
	const repo = process.env.GITHUB_REPOSITORY ?? gh(['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner']).trim()
	const repoUrl = `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${repo}`

	const commit = parseCommit(ghJson(`repos/${repo}/commits/${values.sha ?? 'heads/main'}`))
	const runs = readCheckRuns(repo, commit.sha)
	const health = mainHealth(runs, readCancelledWorkflowRuns(repo, runs))
	const action = decideIssueAction(health, readOpenIssue(repo), commit, repoUrl)

	console.log(`main at ${commit.sha.slice(0, 7)} is ${health.kind}; action: ${action.kind}${action.kind === 'none' ? ` (${action.reason})` : action.kind === 'open' ? '' : ` #${action.issue}`}`)
	if (values['dry-run']) {
		if (action.kind !== 'none') console.log(`\n${action.body}`)
		return 0
	}
	apply(repo, action)
	return 0
}

try {
	process.exitCode = main(process.argv.slice(2))
} catch (error) {
	console.error(`ERR: ${error instanceof Error ? error.message : String(error)}`)
	process.exitCode = 1
}

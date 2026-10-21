// Checks a pull request against the PR policy in prPolicy.ts. Runs from the
// repo root, in the PR policy workflow, with the full history fetched:
//
//   PR_TITLE=… PR_BODY=… PR_BASE_REF=main DEFAULT_BRANCH=main \
//     bun scripts/check-pr-policy.ts <base-sha> <head-sha>
//
// The diff is the PR's own, from the merge base; the commits are those the
// base does not have. Writes `translation_sync=true|false` to $GITHUB_OUTPUT.

import {spawnSync} from 'node:child_process'
import {appendFileSync} from 'node:fs'
import {checkPullRequest, type Commit, OPT_OUT_KEYS, parseNameStatus} from './prPolicy.js'

const CHANGELOG = 'CHANGELOG.md'

function git(...args: string[]): string {
	const result = spawnSync('git', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
	if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.error?.message ?? result.stderr.trim()}`)
	return result.stdout
}

// A file the commit does not have reads as empty.
const fileAt = (commit: string, path: string): string => spawnSync('git', ['show', `${commit}:${path}`], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}).stdout ?? ''

function packageVersionAt(commit: string): string {
	const parsed: unknown = JSON.parse(fileAt(commit, 'package.json') || '{}')
	const version = typeof parsed === 'object' && parsed !== null && 'version' in parsed ? parsed.version : undefined
	return typeof version === 'string' ? version : ''
}

function commitsBetween(base: string, head: string): Commit[] {
	return git('log', '--format=%H%x00%B%x1e', `${base}..${head}`)
		.split('\u001e')
		.map(entry => entry.replace(/^\n/, ''))
		.filter(entry => entry.includes('\0'))
		.map(entry => {
			const [sha = '', message = ''] = entry.split('\0')
			return {sha, message}
		})
}

const [base, head] = process.argv.slice(2)
if (base === undefined || head === undefined) {
	console.error('Usage: bun scripts/check-pr-policy.ts <base-sha> <head-sha>')
	process.exit(2)
}

const mergeBase = git('merge-base', base, head).trim()
const files = parseNameStatus(git('diff', '--name-status', '--no-renames', '-z', mergeBase, head))
const result = checkPullRequest({
	title: process.env.PR_TITLE ?? '',
	body: process.env.PR_BODY ?? '',
	baseRef: process.env.PR_BASE_REF ?? '',
	defaultBranch: process.env.DEFAULT_BRANCH ?? 'main',
	files,
	commits: commitsBetween(base, head),
	changelog: files.some(file => file.path === CHANGELOG) ? {base: fileAt(mergeBase, CHANGELOG), head: fileAt(head, CHANGELOG), releasedVersion: packageVersionAt(mergeBase)} : null
})

if (process.env.GITHUB_OUTPUT !== undefined) appendFileSync(process.env.GITHUB_OUTPUT, `translation_sync=${result.translationSync}\n`)
const annotate = process.env.GITHUB_ACTIONS === 'true'
for (const {rule, reason} of result.waived) console.log(annotate ? `::notice title=PR policy: ${rule} waived::${reason}` : `${rule} waived: ${reason}`)
for (const {rule, message} of result.failures) console.log(annotate ? `::error title=PR policy: ${rule}::${message}` : `${rule}: ${message}`)
if (result.failures.length > 0) {
	console.log(`\n${result.failures.length} PR policy rule(s) failed. Fix the PR, or add the opt-out line it names to the PR body (keys: ${Object.values(OPT_OUT_KEYS).join(', ')}); editing the body re-runs this check.`)
	process.exit(1)
}
console.log(`PR policy passed: ${files.length} changed file(s) checked${result.translationSync ? '; this is the translation sync, so check:i18n:complete runs next' : ''}.`)

// Pre-commit gate for fallout a staged change causes in files that are *not*
// staged. lint-staged only lints staged files, so narrowing a type in one file
// can leave now-redundant casts (or real type errors) in its untouched callers
// and tests, and the commit still passes. This runs whole-repo type-aware lint
// and tsc (~5 s together) whenever TypeScript is staged, and blocks only on
// findings in files the commit fully determines. Bypass with --no-verify.

import {spawn, spawnSync} from 'node:child_process'
import {checkerFailure, partitionFindings, parseOxlintUnix, parseTscOutput, stagedTypeScriptPaths, type CheckerRun, type Finding} from './commitFallout.js'

function git(args: string[]): string[] {
	const result = spawnSync('git', args, {encoding: 'utf8'})
	if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`)
	return result.stdout.split('\n').filter(Boolean)
}

// Resolves with combined output whatever the exit code: a failing linter is
// the expected case, and its findings are what gets parsed.
function run(cmd: string, args: string[]): Promise<CheckerRun> {
	return new Promise(resolve => {
		const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})
		let output = ''
		child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()))
		child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))
		child.on('error', err => resolve({exitCode: null, launchError: err.message, output}))
		child.on('close', exitCode => resolve({exitCode, launchError: null, output}))
	})
}

function print(label: string, findings: readonly Finding[]): void {
	console.error(label)
	for (const f of findings) console.error(`  ${f.file}:${f.location}  [${f.tool}] ${f.message}`)
}

const staged = stagedTypeScriptPaths(git(['diff', '--cached', '--name-status']).join('\n'))
if (staged.length === 0) process.exit(0)

const filesWithOtherChanges = new Set([...git(['diff', '--name-only']), ...git(['ls-files', '--others', '--exclude-standard'])])
const [lintRun, tscRun] = await Promise.all([run('bunx', ['oxlint', '--type-aware', '-f', 'unix', '.']), run('bunx', ['tsc', '--noEmit', '--pretty', 'false'])])
const lintFindings = parseOxlintUnix(lintRun.output)
const tscFindings = parseTscOutput(tscRun.output)
const failures = [checkerFailure('oxlint', lintRun, lintFindings), checkerFailure('tsc', tscRun, tscFindings)].filter((failure): failure is string => failure !== null)
if (failures.length > 0) {
	console.error(`commit fallout: a checker did not run, so the commit is not verified (bypass with --no-verify):\n${failures.join('\n')}`)
	process.exit(1)
}
const {blocking, ignored} = partitionFindings([...lintFindings, ...tscFindings], filesWithOtherChanges)

if (ignored.length > 0) console.error(`commit fallout: ${ignored.length} finding(s) in files with other uncommitted changes were not held against this commit.`)
if (blocking.length > 0) {
	print(`commit fallout: this commit leaves ${blocking.length} lint/type finding(s), possibly in files it does not touch:`, blocking)
	process.exit(1)
}

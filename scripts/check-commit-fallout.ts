// Pre-commit gate for fallout a staged change causes in files that are *not*
// staged. lint-staged only lints staged files, so narrowing a type in one file
// can leave now-redundant casts (or real type errors) in its untouched callers
// and tests, and the commit still passes. This runs whole-repo type-aware lint
// and tsc (~5 s together) whenever TypeScript is staged, and blocks only on
// findings in files the commit fully determines. Bypass with --no-verify.

import {spawn, spawnSync} from 'node:child_process'
import {partitionFindings, parseOxlintUnix, parseTscOutput, type Finding} from './commitFallout.js'

const TS_FILE = /\.(?:ts|tsx|cts|mts)$/

function git(args: string[]): string[] {
	const result = spawnSync('git', args, {encoding: 'utf8'})
	if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`)
	return result.stdout.split('\n').filter(Boolean)
}

// Resolves with combined output whatever the exit code: a failing linter is
// the expected case, and its findings are what gets parsed.
function run(cmd: string, args: string[]): Promise<string> {
	return new Promise(resolve => {
		const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})
		let output = ''
		child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()))
		child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()))
		child.on('error', err => resolve(`${output}\n${err.message}`))
		child.on('close', () => resolve(output))
	})
}

function print(label: string, findings: readonly Finding[]): void {
	console.error(label)
	for (const f of findings) console.error(`  ${f.file}:${f.location}  [${f.tool}] ${f.message}`)
}

const staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).filter(file => TS_FILE.test(file))
if (staged.length === 0) process.exit(0)

const filesWithOtherChanges = new Set([...git(['diff', '--name-only']), ...git(['ls-files', '--others', '--exclude-standard'])])
const [lintOut, tscOut] = await Promise.all([run('bunx', ['oxlint', '--type-aware', '-f', 'unix', '.']), run('bunx', ['tsc', '--noEmit', '--pretty', 'false'])])
const {blocking, ignored} = partitionFindings([...parseOxlintUnix(lintOut), ...parseTscOutput(tscOut)], filesWithOtherChanges)

if (ignored.length > 0) console.error(`commit fallout: ${ignored.length} finding(s) in files with other uncommitted changes were not held against this commit.`)
if (blocking.length > 0) {
	print(`commit fallout: this commit leaves ${blocking.length} lint/type finding(s), possibly in files it does not touch:`, blocking)
	process.exit(1)
}

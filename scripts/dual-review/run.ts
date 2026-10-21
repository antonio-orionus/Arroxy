// Local dual review: Claude (four focused lanes) and Codex (one whole-change
// pass) review the same diff in parallel through their own CLIs, on the logged-in
// subscriptions, with no API keys. Each tool then checks every finding the other
// one reported. Writes report.md and report.json and prints the report.
//
//   bun run review:dual [--base <ref>] [--light] [--out <dir>]
//
// --base defaults to origin/main; pass the previous review's head to review only
// the commits since. --light runs Codex alone (Claude still checks its findings),
// for mechanical changes and fix rounds.
//
// When Codex cannot run (usage limit, not logged in, not installed) it is
// skipped and the report says so: --light then runs one whole-change Claude
// reviewer, and every finding is checked in a second Claude pass instead of by
// Codex. Exits 1 when something in this change must be fixed or decided
// (backlog entries alone do not count), 2 when a reviewer failed, so coverage is
// partial, or when no reviewer completed at all. A run that exits 0 or 1 records
// the commit it reviewed, for `bun run review:check-head`.

import {spawn, spawnSync} from 'node:child_process'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {
	classifyCodexFailure,
	coverageSummary,
	needsAction,
	parseChangedRanges,
	parseReviewOutput,
	parseVerdicts,
	renderReport,
	resolveCandidates,
	reviewJsonSchema,
	toCandidates,
	verdictJsonSchema,
	verifierFor,
	type Candidate,
	type Checked,
	type CodexUnavailability,
	type Coverage,
	type Engine,
	type OutputJsonSchema
} from './core.js'
import {gitIn} from '../pushGuard.js'
import {CLAUDE_LANES, WHOLE_CHANGE_LANE, reviewPrompt, verifyPrompt, type Lane, type ReviewScope} from './prompts.js'
import {recordReviewed, reviewedSnapshot} from './reviewedState.js'

const TIMEOUT_MS = 30 * 60 * 1000
const LEARNINGS_FILE = '.agents/memory/review-learnings.md'

// Read-only tools only; the permission mode makes anything else a denial
// instead of a prompt nobody is there to answer.
const CLAUDE_TOOLS = ['Read', 'Grep', 'Glob', 'Bash(git diff:*)', 'Bash(git log:*)', 'Bash(git show:*)', 'Bash(git blame:*)', 'mcp__codegraph__codegraph_explore']

function git(args: string[]): string {
	const result = spawnSync('git', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
	if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`)
	return result.stdout.trim()
}

interface ProcessResult {
	ok: boolean
	stdout: string
	stderr: string
	// The spawn error code (ENOENT for a missing binary), when the process never started.
	spawnCode: string | undefined
	detail: string
}

function runProcess(cmd: string, args: string[], logFile: string): Promise<ProcessResult> {
	return new Promise(resolve => {
		const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		const timer = setTimeout(() => child.kill('SIGTERM'), TIMEOUT_MS)
		// Decoding per stream, not per chunk, keeps a multi-byte character split
		// across two chunks intact.
		child.stdout.setEncoding('utf8')
		child.stderr.setEncoding('utf8')
		child.stdout.on('data', (chunk: string) => (stdout += chunk))
		child.stderr.on('data', (chunk: string) => (stderr += chunk))
		let done = false
		const finish = (ok: boolean, detail: string, spawnCode?: string): void => {
			if (done) return
			done = true
			clearTimeout(timer)
			void writeFile(logFile, `${stdout}\n--- stderr ---\n${stderr}`).finally(() => resolve({ok, stdout, stderr, spawnCode, detail}))
		}
		child.on('error', err => finish(false, `could not start: ${err.message}`, 'code' in err && typeof err.code === 'string' ? err.code : undefined))
		// Bun can report a failed spawn as `close` with the negated errno before (or
		// without) the `error` event; node reports it as `error` only.
		child.on('close', (code, signal) => finish(code === 0, code === 0 ? '' : `exited with ${code ?? signal}; see ${logFile}`, code !== null && code < 0 ? errnoName(-code) : undefined))
	})
}

const errnoName = (errno: number): string | undefined => Object.entries(os.constants.errno).find(([, value]) => value === errno)?.[0]

class AgentError extends Error {}

// Codex cannot be used at all right now; not a reviewer failure, because Claude stands in.
class CodexUnavailableError extends AgentError {
	constructor(readonly unavailability: CodexUnavailability) {
		super(`codex unavailable: ${unavailability.reason}: ${unavailability.detail}`)
	}
}

async function runCodex(prompt: string, schema: OutputJsonSchema, outDir: string, name: string): Promise<string> {
	const schemaFile = path.join(outDir, `${name}.schema.json`)
	const resultFile = path.join(outDir, `${name}.json`)
	await writeFile(schemaFile, JSON.stringify(schema))
	const result = await runProcess('codex', ['exec', '--sandbox', 'read-only', '--output-schema', schemaFile, '--output-last-message', resultFile, prompt], path.join(outDir, `${name}.log`))
	if (!result.ok) {
		const unavailable = classifyCodexFailure(`${result.stderr}\n${result.stdout}`, result.spawnCode)
		throw unavailable ? new CodexUnavailableError(unavailable) : new AgentError(`codex ${name} ${result.detail}`)
	}
	return readFile(resultFile, 'utf8')
}

async function runClaude(prompt: string, schema: OutputJsonSchema, outDir: string, name: string): Promise<string> {
	const args = ['-p', '--output-format', 'json', '--json-schema', JSON.stringify(schema), '--permission-mode', 'default', '--allowedTools', ...CLAUDE_TOOLS, '--disallowedTools', 'Edit', 'Write', 'NotebookEdit', '--', prompt]
	const result = await runProcess('claude', args, path.join(outDir, `${name}.log`))
	if (!result.ok) throw new AgentError(`claude ${name} ${result.detail}`)
	const envelope: unknown = JSON.parse(result.stdout)
	if (typeof envelope !== 'object' || envelope === null || !('structured_output' in envelope)) throw new Error('no structured_output in the response envelope')
	return JSON.stringify(envelope.structured_output)
}

const describeError = (err: unknown): string => (err instanceof Error ? err.message : String(err))

// Runs one agent and parses its answer, so every failure — the process, the
// envelope, or a reply that breaks the schema — names the agent and its log.
async function runAgent<T>(engine: Engine, prompt: string, schema: OutputJsonSchema, outDir: string, name: string, parse: (value: unknown) => T): Promise<T> {
	try {
		const text = await (engine === 'codex' ? runCodex : runClaude)(prompt, schema, outDir, name)
		const value: unknown = JSON.parse(text)
		return parse(value)
	} catch (err) {
		if (err instanceof AgentError) throw err
		throw new AgentError(`${engine} ${name} returned an unusable answer (${describeError(err).split('\n')[0]}); see ${path.join(outDir, `${name}.log`)}`)
	}
}

async function review(engine: Engine, lane: Lane, scope: ReviewScope, outDir: string, repoRoot: string): Promise<Candidate[]> {
	const findings = await runAgent(engine, reviewPrompt(scope, lane), reviewJsonSchema, outDir, `review-${engine}-${lane.id}`, value => parseReviewOutput(value, repoRoot))
	return toCandidates(engine, lane.id, findings)
}

// `author` is the tool that reported them; the same tool checking them is the
// Codex-unavailable self-check.
async function verify(engine: Engine, author: Engine, reports: readonly Candidate[], scope: ReviewScope, outDir: string): Promise<Map<string, Checked>> {
	if (reports.length === 0) return new Map()
	const ids = reports.map(r => r.id)
	const payload = reports.map(r => ({id: r.id, title: r.title, body: r.body, file: r.file, lineStart: r.lineStart, lineEnd: r.lineEnd, severity: r.severity}))
	const name = engine === author ? `verify-${engine}-self` : `verify-${engine}`
	const verdicts = await runAgent(engine, verifyPrompt(scope, JSON.stringify(payload, null, 2), engine === author), verdictJsonSchema, outDir, name, value => parseVerdicts(value, ids))
	return new Map([...verdicts].map(([id, verdict]) => [id, {verdict, by: engine}]))
}

// A missing learnings file is fine; any other read error must not silently
// drop the rules every reviewer is meant to follow.
async function readLearnings(repoRoot: string): Promise<string> {
	try {
		const text = await readFile(path.join(repoRoot, LEARNINGS_FILE), 'utf8')
		return text.replace(/^---\n[\s\S]*?\n---\n/, '')
	} catch (err) {
		if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return ''
		throw err
	}
}

async function main(): Promise<number> {
	const {values} = parseArgs({options: {base: {type: 'string', default: 'origin/main'}, light: {type: 'boolean', default: false}, out: {type: 'string'}}})
	const repoRoot = git(['rev-parse', '--show-toplevel'])
	// Resolved once: every reviewer and the review record name this commit, even
	// if HEAD moves while the review runs.
	const headSha = git(['rev-parse', '--verify', 'HEAD^{commit}'])
	const head = git(['rev-parse', '--short', headSha])
	const mergeBase = git(['merge-base', values.base, headSha]).slice(0, 12)
	const files = git(['diff', '--stat=200', `${mergeBase}...${headSha}`])
	if (files === '') {
		console.error(`dual review: nothing to review between ${values.base} and HEAD.`)
		return 2
	}
	// `review:check-head` measures against origin/main, so without it there is nothing to record.
	const reviewed = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'origin/main'], {stdio: 'ignore'}).status === 0 ? reviewedSnapshot(gitIn(repoRoot), 'origin/main', headSha) : null
	const outDir = path.resolve(repoRoot, values.out ?? path.join('.tmp', 'dual-review', `${head}-${Date.now()}`))
	await mkdir(outDir, {recursive: true})
	const scope: ReviewScope = {mergeBase, head, commits: git(['log', '--format=- %h %s%n%w(0,2,2)%b', `${mergeBase}..${headSha}`]), files, learnings: await readLearnings(repoRoot)}
	const changed = parseChangedRanges(git(['-c', 'core.quotePath=false', 'diff', '-U0', '--no-color', '--no-ext-diff', `${mergeBase}...${headSha}`]))

	const failures: string[] = []
	const codex: {skipped: CodexUnavailability | null} = {skipped: null}
	// A Codex call that finds Codex unusable ends its use for the rest of the run.
	const noteSkip = (err: unknown): boolean => {
		if (!(err instanceof CodexUnavailableError)) return false
		codex.skipped ??= err.unavailability
		return true
	}

	const ran: string[] = []
	const runReviewers = async (reviewers: readonly (readonly [Engine, Lane])[]): Promise<Candidate[]> => {
		console.error(`dual review: ${reviewers.map(([e, l]) => `${e}:${l.id}`).join(', ')} on ${mergeBase}..${head}; logs in ${outDir}`)
		const settled = await Promise.allSettled(reviewers.map(([engine, lane]) => review(engine, lane, scope, outDir, repoRoot)))
		return settled.flatMap((r, i) => {
			if (r.status === 'fulfilled') return (ran.push(`${reviewers[i][0]}:${reviewers[i][1].id}`), r.value)
			if (!noteSkip(r.reason)) failures.push(describeError(r.reason))
			return []
		})
	}

	const first: (readonly [Engine, Lane])[] = [['codex', WHOLE_CHANGE_LANE], ...(values.light ? [] : CLAUDE_LANES.map(lane => ['claude', lane] as const))]
	const all = await runReviewers(first)
	if (codex.skipped && values.light) {
		console.error(`dual review: Codex is unavailable (${codex.skipped.reason}); a single Claude reviewer takes its place`)
		all.push(...(await runReviewers([['claude', WHOLE_CHANGE_LANE]])))
	}

	const checks = new Map<string, Checked>()
	const check = async (author: Engine, reports: readonly Candidate[]): Promise<void> => {
		const engine = verifierFor(reports[0], codex.skipped === null)
		try {
			for (const [id, c] of await verify(engine, author, reports, scope, outDir)) checks.set(id, c)
		} catch (err) {
			// Codex ran out between the review and the check: Claude checks in its place.
			if (engine === 'codex' && noteSkip(err)) return check(author, reports)
			failures.push(describeError(err))
		}
	}
	const byAuthor = (engine: Engine): Candidate[] => all.filter(c => c.engine === engine)
	console.error(`dual review: ${all.length} findings; ${byAuthor('claude').length} by Claude and ${byAuthor('codex').length} by Codex go to checking`)
	await Promise.all((['claude', 'codex'] as const).filter(author => byAuthor(author).length > 0).map(author => check(author, byAuthor(author))))

	const coverage: Coverage = {reviewers: ran, verifiers: [...new Set([...checks.values()].map(c => c.by))], codexSkipped: codex.skipped}
	if (ran.length === 0 && failures.length === 0) failures.push('no reviewer completed')

	const resolved = resolveCandidates(all, checks, changed)
	const report = renderReport({base: mergeBase, head, resolved, failures, coverage})
	await writeFile(path.join(outDir, 'report.md'), report)
	await writeFile(path.join(outDir, 'report.json'), JSON.stringify({base: mergeBase, head, failures, coverage, resolved}, null, '\t'))
	console.log(report)
	console.error(`dual review: ${coverageSummary(coverage)}`)
	console.error(`dual review: report at ${path.join(outDir, 'report.md')}`)
	if (failures.length > 0) return 2
	// A complete review, whatever it found, is what `review:check-head` lets land
	// push: the commit the reviewers were given, not whatever HEAD is now.
	if (reviewed === null) console.error('dual review: no origin/main, so this review is not recorded for review:check-head')
	else {
		await recordReviewed(gitIn(repoRoot), reviewed)
		if (git(['rev-parse', 'HEAD']) !== headSha) console.error(`dual review: HEAD moved while the review ran; recorded ${head} as reviewed, and the commits after it still need a review`)
	}
	return needsAction(resolved) ? 1 : 0
}

process.exitCode = await main()

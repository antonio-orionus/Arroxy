// Local dual review: Claude (four focused lanes) and Codex (one whole-change
// pass) review the same diff in parallel through their own CLIs, on the logged-in
// subscriptions, with no API keys. Each tool then checks the findings only the
// other one reported. Writes report.md and report.json and prints the report.
//
//   bun run review:dual [--base <ref>] [--light] [--out <dir>]
//
// --base defaults to origin/main; pass the previous review's head to review only
// the commits since. --light runs Codex alone (Claude still checks its findings),
// for mechanical changes and fix rounds. Exits 1 when something must be fixed or
// decided, 2 when a reviewer failed and coverage is partial.

import {spawn, spawnSync} from 'node:child_process'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {groupCandidates, parseChangedRanges, parseReviewOutput, parseVerdicts, renderReport, resolveGroups, reviewJsonSchema, toCandidates, verdictJsonSchema, verifierFor, type Candidate, type Engine, type FindingGroup, type OutputJsonSchema, type Verdict} from './core.js'
import {CLAUDE_LANES, CODEX_LANE, reviewPrompt, verifyPrompt, type Lane, type ReviewScope} from './prompts.js'

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
	detail: string
}

function runProcess(cmd: string, args: string[], logFile: string): Promise<ProcessResult> {
	return new Promise(resolve => {
		const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		const timer = setTimeout(() => child.kill('SIGTERM'), TIMEOUT_MS)
		child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
		child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
		const finish = (ok: boolean, detail: string): void => {
			clearTimeout(timer)
			void writeFile(logFile, `${stdout}\n--- stderr ---\n${stderr}`).finally(() => resolve({ok, stdout, detail}))
		}
		child.on('error', err => finish(false, `could not start: ${err.message}`))
		child.on('close', (code, signal) => finish(code === 0, code === 0 ? '' : `exited with ${code ?? signal}; see ${logFile}`))
	})
}

class AgentError extends Error {}

async function runCodex(prompt: string, schema: OutputJsonSchema, outDir: string, name: string): Promise<unknown> {
	const schemaFile = path.join(outDir, `${name}.schema.json`)
	const resultFile = path.join(outDir, `${name}.json`)
	await writeFile(schemaFile, JSON.stringify(schema))
	const result = await runProcess('codex', ['exec', '--sandbox', 'read-only', '--output-schema', schemaFile, '--output-last-message', resultFile, prompt], path.join(outDir, `${name}.log`))
	if (!result.ok) throw new AgentError(`codex ${name} ${result.detail}`)
	const parsed: unknown = JSON.parse(await readFile(resultFile, 'utf8'))
	return parsed
}

async function runClaude(prompt: string, schema: OutputJsonSchema, outDir: string, name: string): Promise<unknown> {
	const args = ['-p', '--output-format', 'json', '--json-schema', JSON.stringify(schema), '--permission-mode', 'default', '--allowedTools', ...CLAUDE_TOOLS, '--disallowedTools', 'Edit', 'Write', 'NotebookEdit', '--', prompt]
	const result = await runProcess('claude', args, path.join(outDir, `${name}.log`))
	if (!result.ok) throw new AgentError(`claude ${name} ${result.detail}`)
	const envelope: unknown = JSON.parse(result.stdout)
	if (typeof envelope !== 'object' || envelope === null || !('structured_output' in envelope)) throw new AgentError(`claude ${name} returned no structured output; see ${name}.log`)
	return envelope.structured_output
}

const runAgent = (engine: Engine, prompt: string, schema: OutputJsonSchema, outDir: string, name: string): Promise<unknown> => (engine === 'codex' ? runCodex : runClaude)(prompt, schema, outDir, name)

const describeError = (err: unknown): string => (err instanceof Error ? err.message : String(err))

async function review(engine: Engine, lane: Lane, scope: ReviewScope, outDir: string, repoRoot: string): Promise<Candidate[]> {
	const raw = await runAgent(engine, reviewPrompt(scope, lane), reviewJsonSchema, outDir, `review-${engine}-${lane.id}`)
	return toCandidates(engine, lane.id, parseReviewOutput(raw, repoRoot))
}

async function verify(engine: Engine, groups: readonly FindingGroup[], scope: ReviewScope, outDir: string): Promise<Map<string, Verdict>> {
	if (groups.length === 0) return new Map()
	const payload = groups.map(g => ({id: g.id, title: g.lead.title, body: g.lead.body, file: g.lead.file, lineStart: g.lead.lineStart, lineEnd: g.lead.lineEnd, severity: g.lead.severity}))
	return parseVerdicts(await runAgent(engine, verifyPrompt(scope, JSON.stringify(payload, null, 2)), verdictJsonSchema, outDir, `verify-${engine}`))
}

async function readLearnings(repoRoot: string): Promise<string> {
	const text = await readFile(path.join(repoRoot, LEARNINGS_FILE), 'utf8').catch(() => '')
	return text.replace(/^---\n[\s\S]*?\n---\n/, '')
}

async function main(): Promise<number> {
	const {values} = parseArgs({options: {base: {type: 'string', default: 'origin/main'}, light: {type: 'boolean', default: false}, out: {type: 'string'}}})
	const repoRoot = git(['rev-parse', '--show-toplevel'])
	const head = git(['rev-parse', '--short', 'HEAD'])
	const mergeBase = git(['merge-base', values.base, 'HEAD']).slice(0, 12)
	const files = git(['diff', '--stat=200', `${mergeBase}...HEAD`])
	if (files === '') {
		console.error(`dual review: nothing to review between ${values.base} and HEAD.`)
		return 2
	}
	const outDir = path.resolve(repoRoot, values.out ?? path.join('.tmp', 'dual-review', `${head}-${Date.now()}`))
	await mkdir(outDir, {recursive: true})
	const scope: ReviewScope = {mergeBase, head, commits: git(['log', '--format=- %h %s%n%w(0,2,2)%b', `${mergeBase}..HEAD`]), files, learnings: await readLearnings(repoRoot)}
	const changed = parseChangedRanges(git(['diff', '-U0', '--no-color', '--no-ext-diff', `${mergeBase}...HEAD`]))

	const reviewers: [Engine, Lane][] = [['codex', CODEX_LANE], ...(values.light ? [] : CLAUDE_LANES.map((lane): [Engine, Lane] => ['claude', lane]))]
	console.error(`dual review: ${reviewers.map(([e, l]) => `${e}:${l.id}`).join(', ')} on ${mergeBase}..${head}; logs in ${outDir}`)
	const failures: string[] = []
	const reviews = await Promise.allSettled(reviewers.map(([engine, lane]) => review(engine, lane, scope, outDir, repoRoot)))
	const all = reviews.flatMap(r => (r.status === 'fulfilled' ? r.value : (failures.push(describeError(r.reason)), [])))

	const groups = groupCandidates(all)
	const byVerifier = (engine: Engine): FindingGroup[] => groups.filter(g => verifierFor(g) === engine)
	console.error(`dual review: ${all.length} findings in ${groups.length} groups; cross-checking`)
	const checks = await Promise.allSettled((['codex', 'claude'] as const).map(engine => verify(engine, byVerifier(engine), scope, outDir)))
	const verdicts = new Map(checks.flatMap(c => (c.status === 'fulfilled' ? [...c.value] : (failures.push(describeError(c.reason)), []))))

	const resolved = resolveGroups(groups, verdicts, changed)
	const report = renderReport({base: mergeBase, head, resolved, failures})
	await writeFile(path.join(outDir, 'report.md'), report)
	await writeFile(path.join(outDir, 'report.json'), JSON.stringify({base: mergeBase, head, failures, resolved}, null, '\t'))
	console.log(report)
	console.error(`dual review: report at ${path.join(outDir, 'report.md')}`)
	if (failures.length > 0) return 2
	return resolved.some(r => r.status !== 'refuted') ? 1 : 0
}

process.exitCode = await main()

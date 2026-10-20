// Pure half of the dual review: parse what each reviewer returns, merge findings
// that point at the same code, decide which tool checks which finding, and sort
// the result into "fix in this change" and "backlog". run.ts does the I/O.

import path from 'node:path'
import {z} from 'zod'

const SEVERITIES = ['P0', 'P1', 'P2', 'P3'] as const

// The wire schemas carry no bounds (`minLength`, integer limits): Codex's strict
// structured output rejects some JSON Schema keywords, so values are checked and
// normalized after parsing instead.
const findingSchema = z.strictObject({title: z.string(), body: z.string(), file: z.string(), lineStart: z.number(), lineEnd: z.number(), severity: z.enum(SEVERITIES), confidence: z.number(), introduced: z.boolean()})

const reviewOutputSchema = z.strictObject({findings: z.array(findingSchema)})

const verdictSchema = z.strictObject({id: z.string(), verdict: z.enum(['confirmed', 'refuted', 'uncertain']), reason: z.string(), introduced: z.boolean()})

const verdictOutputSchema = z.strictObject({verdicts: z.array(verdictSchema)})

export type Finding = z.infer<typeof findingSchema>
export type Verdict = z.infer<typeof verdictSchema>
export type Engine = 'claude' | 'codex'

export type OutputJsonSchema = z.core.JSONSchema.BaseSchema

// The Claude CLI rejects the draft-2020-12 `$schema` reference zod emits.
function wireSchema(schema: z.ZodType): OutputJsonSchema {
	const {$schema: _dialect, ...rest} = z.toJSONSchema(schema)
	return rest
}

export const reviewJsonSchema = wireSchema(reviewOutputSchema)
export const verdictJsonSchema = wireSchema(verdictOutputSchema)

const toSlashes = (file: string): string => file.replaceAll('\\', '/')

function repoRelative(file: string, repoRoot: string): string {
	const slashed = toSlashes(file)
	if (/^[A-Za-z]:\//.test(slashed)) return toSlashes(path.win32.relative(repoRoot, file))
	const relative = path.posix.isAbsolute(slashed) ? path.posix.relative(toSlashes(repoRoot), slashed) : slashed
	return relative.replace(/^\.\//, '')
}

// Codex habitually tags titles "[P2] ..."; severity already has its own field.
const PRIORITY_TAG = /^\s*\[P[0-3]\]\s*/

// A finding without a title or a file cannot be checked or acted on, so it is dropped.
export function parseReviewOutput(value: unknown, repoRoot: string): Finding[] {
	return reviewOutputSchema
		.parse(value)
		.findings.filter(f => f.title.trim() !== '' && f.file.trim() !== '')
		.map(f => {
			const [a, b] = [Math.round(f.lineStart), Math.round(f.lineEnd)]
			return {...f, title: f.title.replace(PRIORITY_TAG, ''), file: repoRelative(f.file, repoRoot), lineStart: Math.max(1, Math.min(a, b)), lineEnd: Math.max(1, a, b), confidence: Math.min(1, Math.max(0, f.confidence))}
		})
}

// A verifier may only judge the groups it was given; anything else it returns
// would overwrite the other verifier's verdict.
export function parseVerdicts(value: unknown, assignedIds: readonly string[]): Map<string, Verdict> {
	const assigned = new Set(assignedIds)
	return new Map(
		verdictOutputSchema
			.parse(value)
			.verdicts.filter(v => assigned.has(v.id))
			.map(v => [v.id, v])
	)
}

export type LineRange = readonly [start: number, end: number]
export type ChangedRanges = ReadonlyMap<string, readonly LineRange[]>

const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/

// Reads `git diff -U0`. A pure deletion (`+N,0`) still marks line N, the spot
// where the removed code used to sit, since a finding about the removal points there.
export function parseChangedRanges(diff: string): Map<string, LineRange[]> {
	const ranges = new Map<string, LineRange[]>()
	let current: LineRange[] | null = null
	for (const line of diff.split(/\r?\n/)) {
		if (line.startsWith('+++ ')) {
			// Git appends a tab to names containing spaces and quotes names with
			// special characters (core.quotePath=false keeps non-ASCII unquoted).
			const target = line
				.slice(4)
				.replace(/\t$/, '')
				.replace(/^"(.*)"$/, '$1')
			current = target === '/dev/null' ? null : []
			if (current) ranges.set(target.replace(/^b\//, ''), current)
			continue
		}
		const hunk = HUNK.exec(line)
		if (!hunk || !current) continue
		const start = Number(hunk[1])
		const count = hunk[2] === undefined ? 1 : Number(hunk[2])
		current.push([start, start + Math.max(count, 1) - 1])
	}
	return ranges
}

export interface Candidate extends Finding {
	id: string
	engine: Engine
	lane: string
}

export function toCandidates(engine: Engine, lane: string, findings: readonly Finding[]): Candidate[] {
	return findings.map((f, i) => ({...f, id: `${engine}-${lane}-${i + 1}`, engine, lane}))
}

// Pre-existing bugs this close to a changed line still count as in the change.
const LINE_SLACK = 3

const overlap = (a: Finding, b: Finding): boolean => a.file === b.file && a.lineStart <= b.lineEnd && b.lineStart <= a.lineEnd

const rank = (f: Finding): number => SEVERITIES.indexOf(f.severity) - f.confidence

// Each tool checks every report of the other, one by one: a model re-reading
// its own claim tends to share the blind spot that produced it. Both tools
// flagging the same lines is not a shortcut: overlapping locations do not prove
// they made the same claim. With Codex unavailable Claude checks its own
// reports in a fresh pass, the weaker substitute the report says it is.
export function verifierFor(c: Candidate, codexAvailable: boolean): Engine {
	return c.engine === 'claude' && codexAvailable ? 'codex' : 'claude'
}

export interface Checked {
	verdict: Verdict
	by: Engine
}

// Why Codex took no part. `missing` and `auth` come from the first failed run;
// anything else a failed Codex run prints is a real reviewer failure.
export type CodexUnavailableReason = 'usage-limit' | 'auth' | 'missing'

export interface CodexUnavailability {
	reason: CodexUnavailableReason
	detail: string
}

const CODEX_UNAVAILABLE: readonly (readonly [CodexUnavailableReason, RegExp])[] = [
	['usage-limit', /usage limit|exceeded your (?:current )?quota|insufficient[_ ]quota/i],
	['auth', /not logged in|codex login|unauthori[sz]ed|authentication (?:failed|required|error)|sign in|log in/i]
]

// Reads what a failed `codex exec` printed. Only Codex's own "ERROR:" lines
// count: the rest of the output echoes the prompt (commit messages, diffs) and
// MCP transport noise, either of which can mention a usage limit or a login.
export function classifyCodexFailure(output: string, spawnErrorCode?: string): CodexUnavailability | null {
	if (spawnErrorCode === 'ENOENT') return {reason: 'missing', detail: 'the codex binary was not found on PATH'}
	const errors = output.split(/\r?\n/).flatMap(l => (l.startsWith('ERROR:') ? [l.slice('ERROR:'.length).trim()] : []))
	for (const [reason, pattern] of CODEX_UNAVAILABLE) {
		const line = errors.find(l => pattern.test(l))
		if (line !== undefined) return {reason, detail: line}
	}
	return null
}

const UNAVAILABLE_LABEL: Record<CodexUnavailableReason, string> = {'usage-limit': 'usage limit', auth: 'not logged in', missing: 'not installed'}

// Who actually reviewed and checked the change, for the report and the PR body.
export interface Coverage {
	reviewers: readonly string[]
	verifiers: readonly Engine[]
	codexSkipped: CodexUnavailability | null
}

export function coverageSummary({reviewers, verifiers, codexSkipped}: Coverage): string {
	const skipped = codexSkipped ? `Codex skipped (${UNAVAILABLE_LABEL[codexSkipped.reason]}: ${codexSkipped.detail}). ` : ''
	if (reviewers.length === 0) return `${skipped}No reviewer completed, so nothing reviewed this change.`
	const checkers = verifiers.length === 0 ? 'no findings needed checking' : codexSkipped ? 'findings checked in a second Claude pass, not by Codex, so a blind spot the first pass had may remain' : `findings cross-checked by ${verifiers.join(' and ')}`
	return `${skipped}Reviewed by ${reviewers.join(', ')}; ${checkers}.`
}

export type Status = Verdict['verdict']
export type Action = 'fix' | 'backlog'

export interface ResolvedCandidate extends Candidate {
	status: Status
	reason: string
	// null: no verdict came back.
	verifiedBy: Engine | null
	action: Action | null
	// Reviewers of the other tool that flagged overlapping lines; shown, never trusted.
	alsoFlaggedBy: string[]
	corroborated: boolean
}

const touchesChange = (f: Finding, changed: ChangedRanges): boolean => (changed.get(f.file) ?? []).some(([start, end]) => f.lineStart <= end + LINE_SLACK && start <= f.lineEnd + LINE_SLACK)

// A bug the change introduced, or one sitting in the lines it changed, belongs
// to this change; anything else is a pre-existing bug for the backlog.
export function resolveCandidates(all: readonly Candidate[], checks: ReadonlyMap<string, Checked>, changed: ChangedRanges): ResolvedCandidate[] {
	return all.map(c => {
		const check = checks.get(c.id)
		const verdict = check?.verdict
		const status: Status = verdict?.verdict ?? 'uncertain'
		const introduced = verdict?.introduced ?? c.introduced
		const action: Action | null = status === 'refuted' ? null : introduced || touchesChange(c, changed) ? 'fix' : 'backlog'
		const alsoFlaggedBy = [...new Set(all.filter(o => o.engine !== c.engine && overlap(o, c)).map(o => `${o.engine}:${o.lane}`))]
		return {...c, introduced, status, reason: verdict?.reason ?? 'The verifier returned no verdict.', verifiedBy: check?.by ?? null, action, alsoFlaggedBy, corroborated: alsoFlaggedBy.length > 0}
	})
}

// Backlog entries are reported but do not block: they are not this change's to fix.
export const needsAction = (resolved: readonly ResolvedCandidate[]): boolean => resolved.some(r => r.status === 'uncertain' || (r.status === 'confirmed' && r.action === 'fix'))

// Every report is listed in full: grouping nearby reports would hide a second,
// different defect behind the first one's text.
function renderEntry(r: ResolvedCandidate): string {
	const where = `${r.file}:${r.lineStart}${r.lineEnd === r.lineStart ? '' : `-${r.lineEnd}`}`
	const also = r.alsoFlaggedBy.length === 0 ? '' : `; also flagged by ${r.alsoFlaggedBy.join(', ')}`
	const by = r.verifiedBy === null ? 'not checked' : r.verifiedBy === r.engine ? `${r.status} by a second ${r.engine} pass` : `${r.status} by ${r.verifiedBy}`
	return [`- **[${r.severity}] ${r.title}** — \`${where}\` (${r.engine}:${r.lane}; ${by}${also})`, `  ${r.body.replaceAll('\n', '\n  ')}`, `  _Check:_ ${r.reason}`].join('\n')
}

function section(title: string, entries: readonly ResolvedCandidate[]): string {
	const sorted = [...entries].sort((a, b) => a.file.localeCompare(b.file) || a.lineStart - b.lineStart || rank(a) - rank(b))
	return [`## ${title} (${entries.length})`, '', ...(sorted.length === 0 ? ['None.'] : sorted.map(renderEntry)), ''].join('\n')
}

export interface ReportInput {
	base: string
	head: string
	resolved: readonly ResolvedCandidate[]
	failures: readonly string[]
	coverage: Coverage
}

export function renderReport({base, head, resolved, failures, coverage}: ReportInput): string {
	const confirmed = resolved.filter(r => r.status === 'confirmed')
	return [
		`# Dual review of ${base}..${head}`,
		'',
		`**Review coverage:** ${coverageSummary(coverage)}`,
		'',
		failures.length === 0 ? 'Every reviewer that ran finished.' : `**Incomplete: some reviewers failed, so coverage is partial.**\n\n${failures.map(f => `- ${f}`).join('\n')}`,
		'',
		section(
			'Fix in this change',
			confirmed.filter(r => r.action === 'fix')
		),
		section(
			'Backlog',
			confirmed.filter(r => r.action === 'backlog')
		),
		section(
			'Uncertain: read the code and decide',
			resolved.filter(r => r.status === 'uncertain')
		),
		section(
			'Refuted',
			resolved.filter(r => r.status === 'refuted')
		)
	].join('\n')
}

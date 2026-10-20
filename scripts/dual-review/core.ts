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

// Findings this close are treated as one spot when the report groups
// duplicates: two reviewers rarely pick the same first line for the same bug.
const LINE_SLACK = 3

const near = (a: Finding, b: Finding): boolean => a.file === b.file && a.lineStart <= b.lineEnd + LINE_SLACK && b.lineStart <= a.lineEnd + LINE_SLACK

const overlap = (a: Finding, b: Finding): boolean => a.file === b.file && a.lineStart <= b.lineEnd && b.lineStart <= a.lineEnd

const rank = (f: Finding): number => SEVERITIES.indexOf(f.severity) - f.confidence

// Location is a weak proxy for "the same bug", so a report counts as
// corroborated only when the other tool pointed at overlapping lines.
const isCorroborated = (c: Candidate, all: readonly Candidate[]): boolean => all.some(o => o.engine !== c.engine && overlap(o, c))

// Each tool checks the other's reports, one by one: a model re-reading its own
// claim tends to share the blind spot that produced it, and checking reports
// individually keeps a refuted claim from hiding a real neighbour. Reports both
// tools reached on their own skip the check.
export function verifierFor(c: Candidate, all: readonly Candidate[]): Engine | null {
	if (isCorroborated(c, all)) return null
	return c.engine === 'claude' ? 'codex' : 'claude'
}

export type Status = Verdict['verdict']
export type Action = 'fix' | 'backlog'

export interface ResolvedCandidate extends Candidate {
	status: Status
	corroborated: boolean
	reason: string | null
	verifiedBy: Engine | null
	action: Action | null
}

const touchesChange = (f: Finding, changed: ChangedRanges): boolean => (changed.get(f.file) ?? []).some(([start, end]) => f.lineStart <= end + LINE_SLACK && start <= f.lineEnd + LINE_SLACK)

// A bug the change introduced, or one sitting in the lines it changed, belongs
// to this change; anything else is a pre-existing bug for the backlog.
export function resolveCandidates(all: readonly Candidate[], verdicts: ReadonlyMap<string, Verdict>, changed: ChangedRanges): ResolvedCandidate[] {
	return all.map(c => {
		const verifiedBy = verifierFor(c, all)
		const verdict = verifiedBy === null ? undefined : verdicts.get(c.id)
		const status: Status = verifiedBy === null ? 'confirmed' : (verdict?.verdict ?? 'uncertain')
		const introduced = verdict?.introduced ?? c.introduced
		const action: Action | null = status === 'refuted' ? null : introduced || touchesChange(c, changed) ? 'fix' : 'backlog'
		const reason = verdict?.reason ?? (verifiedBy === null ? null : 'The verifier returned no verdict.')
		return {...c, introduced, status, corroborated: verifiedBy === null, reason, verifiedBy, action}
	})
}

// Backlog entries are reported but do not block: they are not this change's to fix.
export const needsAction = (resolved: readonly ResolvedCandidate[]): boolean => resolved.some(r => r.status === 'uncertain' || (r.status === 'confirmed' && r.action === 'fix'))

// Duplicates are grouped only for reading; every report keeps its own verdict.
function cluster(entries: readonly ResolvedCandidate[]): ResolvedCandidate[][] {
	const clusters: ResolvedCandidate[][] = []
	for (const entry of entries) {
		const matching = clusters.filter(c => c.some(member => near(member, entry)))
		const [first, ...rest] = matching
		if (!first) {
			clusters.push([entry])
			continue
		}
		first.push(entry)
		for (const other of rest) {
			first.push(...other)
			clusters.splice(clusters.indexOf(other), 1)
		}
	}
	return clusters.map(c => [...c].sort((a, b) => rank(a) - rank(b)))
}

const checkLabel = (r: ResolvedCandidate): string => (r.corroborated ? 'found by both tools' : `${r.status} by ${r.verifiedBy ?? 'nobody'}`)

function renderEntry([lead, ...others]: ResolvedCandidate[]): string {
	if (!lead) return ''
	const where = `${lead.file}:${lead.lineStart}${lead.lineEnd === lead.lineStart ? '' : `-${lead.lineEnd}`}`
	const lines = [`- **[${lead.severity}] ${lead.title}** — \`${where}\` (${lead.engine}:${lead.lane}; ${checkLabel(lead)})`, `  ${lead.body.replaceAll('\n', '\n  ')}`]
	if (lead.reason) lines.push(`  _Check:_ ${lead.reason}`)
	for (const other of others) lines.push(`  _Also (${other.engine}:${other.lane}; ${checkLabel(other)}):_ ${other.title === lead.title ? 'same finding' : other.title}`)
	return lines.join('\n')
}

function section(title: string, entries: readonly ResolvedCandidate[]): string {
	const groups = cluster(entries).sort((a, b) => rank(a[0]) - rank(b[0]))
	return [`## ${title} (${groups.length})`, '', ...(groups.length === 0 ? ['None.'] : groups.map(renderEntry)), ''].join('\n')
}

export interface ReportInput {
	base: string
	head: string
	resolved: readonly ResolvedCandidate[]
	failures: readonly string[]
}

export function renderReport({base, head, resolved, failures}: ReportInput): string {
	const confirmed = resolved.filter(r => r.status === 'confirmed')
	return [
		`# Dual review of ${base}..${head}`,
		'',
		failures.length === 0 ? 'Every reviewer finished.' : `**Incomplete: some reviewers failed, so coverage is partial.**\n\n${failures.map(f => `- ${f}`).join('\n')}`,
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

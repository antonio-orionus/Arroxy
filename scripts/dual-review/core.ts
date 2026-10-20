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

export const reviewJsonSchema: OutputJsonSchema = z.toJSONSchema(reviewOutputSchema)
export const verdictJsonSchema: OutputJsonSchema = z.toJSONSchema(verdictOutputSchema)

function repoRelative(file: string, repoRoot: string): string {
	const slashed = file.replaceAll('\\', '/')
	const relative = path.posix.isAbsolute(slashed) ? path.posix.relative(repoRoot.replaceAll('\\', '/'), slashed) : slashed
	return relative.replace(/^\.\//, '')
}

// A finding without a title or a file cannot be checked or acted on, so it is dropped.
export function parseReviewOutput(value: unknown, repoRoot: string): Finding[] {
	return reviewOutputSchema
		.parse(value)
		.findings.filter(f => f.title.trim() !== '' && f.file.trim() !== '')
		.map(f => {
			const [a, b] = [Math.round(f.lineStart), Math.round(f.lineEnd)]
			return {...f, file: repoRelative(f.file, repoRoot), lineStart: Math.max(1, Math.min(a, b)), lineEnd: Math.max(1, a, b), confidence: Math.min(1, Math.max(0, f.confidence))}
		})
}

export function parseVerdicts(value: unknown): Map<string, Verdict> {
	return new Map(verdictOutputSchema.parse(value).verdicts.map(v => [v.id, v]))
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
			const target = line.slice(4)
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

export interface FindingGroup {
	id: string
	lead: Candidate
	members: Candidate[]
	engines: Engine[]
}

// Findings this close are treated as one spot: two reviewers rarely pick the
// same first line for the same bug.
const LINE_SLACK = 3

const near = (a: Finding, b: Finding): boolean => a.file === b.file && a.lineStart <= b.lineEnd + LINE_SLACK && b.lineStart <= a.lineEnd + LINE_SLACK

const rank = (f: Finding): number => SEVERITIES.indexOf(f.severity) - f.confidence

// Groups keep the order their first member arrived in, so the report is stable.
export function groupCandidates(all: readonly Candidate[]): FindingGroup[] {
	const clusters: Candidate[][] = []
	for (const candidate of all) {
		const matching = clusters.filter(cluster => cluster.some(member => near(member, candidate)))
		const [first, ...rest] = matching
		if (!first) {
			clusters.push([candidate])
			continue
		}
		first.push(candidate)
		for (const other of rest) {
			first.push(...other)
			clusters.splice(clusters.indexOf(other), 1)
		}
	}
	return clusters.map((members, i) => {
		const lead = members.reduce((best, m) => (rank(m) < rank(best) ? m : best))
		const engines = [...new Set(members.map(m => m.engine))].sort()
		return {id: `g${i + 1}`, lead, members, engines}
	})
}

// Each tool checks the other's findings: a model re-reading its own claim tends
// to share the blind spot that produced it. Findings both tools reached on their
// own skip the check.
export function verifierFor(group: FindingGroup): Engine | null {
	if (group.engines.length > 1) return null
	return group.engines[0] === 'claude' ? 'codex' : 'claude'
}

export type Status = 'confirmed' | 'refuted' | 'uncertain'
export type Action = 'fix' | 'backlog'

export interface ResolvedFinding {
	group: FindingGroup
	status: Status
	agreed: boolean
	reason: string | null
	introduced: boolean
	verifiedBy: Engine | null
	action: Action | null
}

const touchesChange = (f: Finding, changed: ChangedRanges): boolean => (changed.get(f.file) ?? []).some(([start, end]) => f.lineStart <= end + LINE_SLACK && start <= f.lineEnd + LINE_SLACK)

// A bug the change introduced, or one sitting in the lines it changed, belongs
// to this change; anything else is a pre-existing bug for the backlog.
export function resolveGroups(groups: readonly FindingGroup[], verdicts: ReadonlyMap<string, Verdict>, changed: ChangedRanges): ResolvedFinding[] {
	return groups.map(group => {
		const verifiedBy = verifierFor(group)
		const verdict = verifiedBy === null ? undefined : verdicts.get(group.id)
		const status: Status = verifiedBy === null ? 'confirmed' : (verdict?.verdict ?? 'uncertain')
		const introduced = verdict?.introduced ?? group.members.some(m => m.introduced)
		const action: Action | null = status === 'refuted' ? null : introduced || touchesChange(group.lead, changed) ? 'fix' : 'backlog'
		return {group, status, agreed: verifiedBy === null, reason: verdict?.reason ?? (verifiedBy === null ? null : 'The verifier returned no verdict.'), introduced, verifiedBy, action}
	})
}

function renderEntry(r: ResolvedFinding): string {
	const {lead, members} = r.group
	const where = `${lead.file}:${lead.lineStart}${lead.lineEnd === lead.lineStart ? '' : `-${lead.lineEnd}`}`
	const sources = [...new Set(members.map(m => `${m.engine}:${m.lane}`))].join(', ')
	const check = r.agreed ? 'found by both tools' : `${r.status} by ${r.verifiedBy ?? 'nobody'}`
	const lines = [`- **[${lead.severity}] ${lead.title}** — \`${where}\` (${r.group.id}; ${sources}; ${check})`, `  ${lead.body.replaceAll('\n', '\n  ')}`]
	if (r.reason) lines.push(`  _Check:_ ${r.reason}`)
	const others = members.filter(m => m !== lead && m.title !== lead.title)
	for (const other of others) lines.push(`  _Also reported (${other.engine}:${other.lane}):_ ${other.title}`)
	return lines.join('\n')
}

function section(title: string, entries: readonly ResolvedFinding[]): string {
	const sorted = [...entries].sort((a, b) => rank(a.group.lead) - rank(b.group.lead))
	return [`## ${title} (${entries.length})`, '', ...(sorted.length === 0 ? ['None.'] : sorted.map(renderEntry)), ''].join('\n')
}

export interface ReportInput {
	base: string
	head: string
	resolved: readonly ResolvedFinding[]
	failures: readonly string[]
}

export function renderReport({base, head, resolved, failures}: ReportInput): string {
	const confirmed = resolved.filter(r => r.status === 'confirmed')
	const uncertain = resolved.filter(r => r.status === 'uncertain')
	const parts = [
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
		section('Uncertain: read the code and decide', uncertain),
		section(
			'Refuted',
			resolved.filter(r => r.status === 'refuted')
		)
	]
	return parts.join('\n')
}

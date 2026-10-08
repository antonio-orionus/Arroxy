#!/usr/bin/env bun
// Vulnerability gate for the dependency graph.
//
// Blocks on advisories in the PRODUCTION dependency tree (what the packaged app
// ships) at or above a severity threshold (default: high). Advisories that only
// exist in build and test tooling are listed but never block: a gate that is
// permanently red over tooling teaches everyone to ignore it, which is how a
// shipped CLI's whole dependency tree once went unnoticed.
//
// An advisory that cannot be fixed yet can be accepted in
// scripts/deps-vuln-accepted.json with a written reason and an expiry date.
// Acceptances expire (and block again) so they cannot quietly become permanent.
import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {z} from 'zod'

const SEVERITIES = ['info', 'low', 'moderate', 'high', 'critical'] as const
const severitySchema = z.enum(SEVERITIES)
type Severity = z.infer<typeof severitySchema>

const advisorySchema = z.object({id: z.number(), url: z.string(), title: z.string(), severity: severitySchema, vulnerable_versions: z.string().optional()})
export const auditReportSchema = z.record(z.string(), z.array(advisorySchema))
export type AuditReport = z.infer<typeof auditReportSchema>

// Date.parse normalizes impossible dates (2026-02-30 becomes 2 March), so a real
// calendar date is one that survives a round trip through the parsed UTC date.
const isoDateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
	.refine(value => {
		const time = Date.parse(`${value}T00:00:00Z`)
		return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
	}, 'not a real calendar date')
const acceptedAdvisorySchema = z.object({id: z.string().min(1), package: z.string().min(1), reason: z.string().min(1), expires: isoDateSchema})
export const acceptedAdvisoriesSchema = z.array(acceptedAdvisorySchema)
export type AcceptedAdvisory = z.infer<typeof acceptedAdvisorySchema>

export interface Finding {
	pkg: string
	id: string
	severity: Severity
	title: string
	url: string
	vulnerableVersions?: string
}

export interface Evaluation {
	/** Production findings that fail the gate. */
	blocking: Finding[]
	/** Production findings let through by an unexpired acceptance. */
	accepted: Finding[]
	/** Acceptances past their expiry whose advisory is still present. */
	expired: AcceptedAdvisory[]
	/** Acceptances that match no production finding any more; remove them. */
	unused: AcceptedAdvisory[]
	/** Findings that exist only in build and test tooling. Never block. */
	devOnly: Finding[]
}

export function advisoryId(advisory: {url: string}): string {
	return /GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}/i.exec(advisory.url)?.[0] ?? advisory.url
}

function findings(report: AuditReport): Finding[] {
	return Object.entries(report).flatMap(([pkg, list]) => list.map(advisory => ({pkg, id: advisoryId(advisory), severity: advisory.severity, title: advisory.title, url: advisory.url, vulnerableVersions: advisory.vulnerable_versions})))
}

function rank(severity: Severity): number {
	return SEVERITIES.indexOf(severity)
}

const keyOf = (item: {pkg: string; id: string}): string => `${item.pkg}\u0000${item.id}`

export function evaluateAudit(input: {prod: AuditReport; all: AuditReport; threshold: Severity; accepted: readonly AcceptedAdvisory[]; today: string}): Evaluation {
	const {threshold, accepted, today} = input
	const atThreshold = (finding: Finding): boolean => rank(finding.severity) >= rank(threshold)
	const prodFindings = findings(input.prod).filter(atThreshold)
	const prodKeys = new Set(findings(input.prod).map(keyOf))
	const acceptedByKey = new Map(accepted.map(entry => [keyOf({pkg: entry.package, id: entry.id}), entry]))

	const blocking: Finding[] = []
	const passed: Finding[] = []
	const expired: AcceptedAdvisory[] = []
	for (const finding of prodFindings) {
		const entry = acceptedByKey.get(keyOf(finding))
		if (entry && entry.expires >= today) passed.push(finding)
		else {
			blocking.push(finding)
			if (entry) expired.push(entry)
		}
	}

	const prodHitKeys = new Set(prodFindings.map(keyOf))
	const unused = accepted.filter(entry => !prodHitKeys.has(keyOf({pkg: entry.package, id: entry.id})))
	const devOnly = findings(input.all)
		.filter(atThreshold)
		.filter(finding => !prodKeys.has(keyOf(finding)))
	return {blocking, accepted: passed, expired, unused, devOnly}
}

export interface AuditProcessResult {
	status: number | null
	stdout: string
	stderr: string
	error?: Error | undefined
}

// `bun audit --json` prints a JSON object on stdout in every case where the audit
// actually ran: `{}` with exit 0 for a clean tree, a report with exit 1 when it
// finds advisories. A failed audit (no lockfile, registry unreachable) prints
// nothing on stdout and an error on stderr, also with exit 1. The exit code alone
// cannot tell those apart, so the presence of a report is what counts, and its
// absence is always a failure. Reading it as "clean" would let the gate pass
// without having checked anything.
export function parseAuditOutput(result: AuditProcessResult): AuditReport {
	if (result.error) throw new Error(`could not run bun audit: ${result.error.message}`)
	const start = result.stdout.indexOf('{')
	if (start < 0) {
		const detail = result.stderr.trim() || `exit status ${String(result.status)}`
		throw new Error(`bun audit produced no audit report (${detail})`)
	}
	return auditReportSchema.parse(JSON.parse(result.stdout.slice(start)))
}

function runAudit(args: string[]): AuditReport {
	const result = spawnSync('bun', ['audit', ...args, '--json'], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
	return parseAuditOutput({status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error})
}

function loadAccepted(): AcceptedAdvisory[] {
	const path = join(dirname(fileURLToPath(import.meta.url)), 'deps-vuln-accepted.json')
	return acceptedAdvisoriesSchema.parse(JSON.parse(readFileSync(path, 'utf8')))
}

function describe(finding: Finding): string {
	return `  [${finding.severity}] ${finding.pkg}  ${finding.title}\n      ${finding.url}${finding.vulnerableVersions ? `  (${finding.vulnerableVersions})` : ''}`
}

function parseThreshold(args: readonly string[]): Severity {
	const index = args.indexOf('--threshold')
	if (index < 0) return 'high'
	const parsed = severitySchema.safeParse(args[index + 1])
	if (!parsed.success) throw new Error(`bad --threshold: ${String(args[index + 1])}. valid: ${SEVERITIES.join('|')}`)
	return parsed.data
}

function main(args: readonly string[]): number {
	const threshold = parseThreshold(args)
	const today = new Date().toISOString().slice(0, 10)
	const accepted = loadAccepted()
	const result = evaluateAudit({prod: runAudit(['--prod']), all: runAudit([]), threshold, accepted, today})

	for (const finding of result.accepted) {
		const entry = accepted.find(item => item.id === finding.id && item.package === finding.pkg)
		console.log(`[deps:vuln] accepted until ${entry?.expires ?? '?'}: ${finding.pkg} ${finding.id}\n  ${entry?.reason ?? ''}`)
	}
	for (const entry of result.unused) console.warn(`[deps:vuln] acceptance no longer matches anything, remove it from scripts/deps-vuln-accepted.json: ${entry.package} ${entry.id}`)
	if (result.devOnly.length > 0) {
		const byPackage = new Map<string, number>()
		for (const finding of result.devOnly) byPackage.set(finding.pkg, (byPackage.get(finding.pkg) ?? 0) + 1)
		console.log(`[deps:vuln] ${result.devOnly.length} advisory(ies) at "${threshold}" or higher in build/test tooling only (not shipped, not blocking):`)
		for (const [pkg, count] of [...byPackage].sort(([a], [b]) => a.localeCompare(b))) console.log(`  ${pkg} (${count})`)
	}

	if (result.blocking.length === 0) {
		console.log(`[deps:vuln] OK — no production advisories at "${threshold}" or higher`)
		return 0
	}
	console.error(`[deps:vuln] FAIL — ${result.blocking.length} production advisory(ies) at "${threshold}" or higher:`)
	for (const finding of result.blocking) console.error(describe(finding))
	for (const entry of result.expired) console.error(`  (acceptance for ${entry.package} ${entry.id} expired ${entry.expires}: ${entry.reason})`)
	console.error('\nFix: bump or replace the vulnerable package, move build-only packages to devDependencies, then re-run.')
	return 1
}

const isCli = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isCli) {
	try {
		process.exitCode = main(process.argv.slice(2))
	} catch (error) {
		console.error(`[deps:vuln] ${error instanceof Error ? error.message : String(error)}`)
		process.exitCode = 2
	}
}

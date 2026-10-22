import {z} from 'zod'
import type {BinaryManifestSource} from '@shared/schemas.js'
import {DEPENDENCY_IDS, type DependencyDiagnostic, type DependencyId} from '@shared/types.js'

// Warmup report: what an install says about one warmup that had to fetch a
// managed binary (ADR 0021). It goes to its own Counterscale site on the
// heartbeat's collector, so the heartbeat keeps its slots and its meaning (one
// hit per install per day). Every value is a coarse bucket with no spaces or
// reserved characters; nothing identifies the install.
export const WARMUP_REPORT_SITE_ID = 'arroxy-warmup'
const HIT_HOST = 'https://desktop.arroxy'
const SEND_TIMEOUT_MS = 5_000

// `first`: nothing managed was on disk when the warmup began; `update`: something was.
export const warmupReportKindSchema = z.enum(['first', 'update'])
export type WarmupReportKind = z.infer<typeof warmupReportKindSchema>
export const warmupReportStageSchema = z.enum(['started', 'ok', 'failed', 'stopped', 'quit'])
export type WarmupReportStage = z.infer<typeof warmupReportStageSchema>

export interface WarmupReportContext {
	appVersion: string
	platform: NodeJS.Platform
	arch: string
	osLocale: string
}

export interface WarmupReport {
	kind: WarmupReportKind
	stage: WarmupReportStage
	attempt: number
	manifestSource: BinaryManifestSource | 'unknown'
	// Outcomes only: time since `started`, the first failure, download speed.
	elapsedMs?: number
	failure?: string
	throughput?: string
}

// Counterscale's /collect query, as its server tracker sends it.
export type WarmupReportHit = Record<'sid' | 'h' | 'p' | 'r' | 'us' | 'um' | 'uc' | 'ut' | 'uco' | 'ht', string>

const SECOND = 1_000
const MINUTE = 60 * SECOND

export function durationBucket(ms: number): string {
	if (ms < 10 * SECOND) return '0-10s'
	if (ms < 30 * SECOND) return '10-30s'
	if (ms < 2 * MINUTE) return '30s-2m'
	if (ms < 5 * MINUTE) return '2-5m'
	if (ms < 15 * MINUTE) return '5-15m'
	return '15m-plus'
}

// Below this much data or time a speed says more about the timer than the link.
const MIN_MEASURED_BYTES = 256 * 1024
const MIN_MEASURED_MS = 250

export function throughputBucket(bytes: number, ms: number): string {
	if (bytes < MIN_MEASURED_BYTES || ms < MIN_MEASURED_MS) return 'unknown'
	const mbps = (bytes * 8) / (ms * 1_000)
	if (mbps < 0.5) return '0-0.5mbps'
	if (mbps < 2) return '0.5-2mbps'
	if (mbps < 10) return '2-10mbps'
	return '10mbps-plus'
}

export function attemptLabel(attempt: number): string {
	return attempt >= 3 ? 'a3-plus' : `a${Math.max(1, attempt)}`
}

// The first managed download that failed, even if a fallback then worked, else
// the first blocking failure; `none` when nothing failed.
export function firstFailure(dependencies: Record<DependencyId, DependencyDiagnostic>): string {
	for (const id of DEPENDENCY_IDS) {
		const failed = dependencies[id].attempts.find(attempt => attempt.failure && (attempt.source.kind === 'managed' || attempt.source.kind === 'managedCache'))
		if (failed?.failure) return `${id}:${failed.failure.kind}`
	}
	for (const id of DEPENDENCY_IDS) {
		const failure = dependencies[id].failure
		if (failure) return `${id}:${failure.kind}`
	}
	return 'none'
}

export function buildWarmupReportHit(report: WarmupReport, context: WarmupReportContext): WarmupReportHit {
	return {
		sid: WARMUP_REPORT_SITE_ID,
		h: HIT_HOST,
		p: `/${context.appVersion}/${report.kind}/${attemptLabel(report.attempt)}/${report.stage}`,
		r: report.elapsedMs === undefined ? '' : durationBucket(report.elapsedMs),
		us: context.osLocale,
		um: `${context.platform}-${context.arch}`,
		uc: report.manifestSource,
		ut: report.failure ?? '',
		uco: report.throughput ?? '',
		// Hit type 1: every report counts as its own visit, as the heartbeat's do.
		ht: '1'
	}
}

// One GET with the hit as its query. True only when the collector answered 2xx;
// it never throws, so a report can never break a warmup.
export async function sendWarmupReport(collectorUrl: string, hit: WarmupReportHit, {fetchImpl = fetch, timeoutMs = SEND_TIMEOUT_MS}: {fetchImpl?: (url: string, init: RequestInit) => Promise<Response>; timeoutMs?: number} = {}): Promise<boolean> {
	const url = `${collectorUrl}?${new URLSearchParams(hit).toString()}`
	try {
		const response = await fetchImpl(url, {method: 'GET', signal: AbortSignal.timeout(timeoutMs)})
		return response.ok
	} catch {
		return false
	}
}

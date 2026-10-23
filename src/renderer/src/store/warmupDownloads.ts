import type {DependencyId, WarmupProgressEvent} from '@shared/types.js'

// What a user sees during setup is two things, not three binaries: the
// download engine (yt-dlp) and the media tools (ffmpeg + ffprobe, which arrive
// together in one package).
export type SetupToolGroup = 'engine' | 'media'

export const SETUP_GROUP_OF: Record<DependencyId, SetupToolGroup> = {'yt-dlp': 'engine', ffmpeg: 'media', ffprobe: 'media'}

export const SETUP_GROUP_NAMES: Record<SetupToolGroup, string> = {engine: 'yt-dlp', media: 'FFmpeg'}

interface DownloadRecord {
	downloaded: number
	total: number
	finished: boolean
}

// The warmup store keeps only each binary's latest event, so a binary that has
// moved on to probing no longer carries its byte counts. The ledger remembers
// every download seen during this setup run: without it, yt-dlp's 18 MB would
// drop out of the total the moment it finished and the bar would jump back.
export type DownloadLedger = Partial<Record<DependencyId, DownloadRecord>>

function updateDownloadLedger(ledger: DownloadLedger, progress: Partial<Record<DependencyId, WarmupProgressEvent>> | null): DownloadLedger {
	let next = ledger
	for (const event of Object.values(progress ?? {})) {
		if (!event) continue
		const previous = next[event.binary]
		const record = recordFor(previous, event)
		if (record === previous) continue
		next = {...next, [event.binary]: record}
	}
	return next
}

function recordFor(previous: DownloadRecord | undefined, event: WarmupProgressEvent): DownloadRecord | undefined {
	if (event.phase === 'downloading') {
		// A finished record belongs to an earlier attempt (Retry setup starts a
		// new one), so it must not hold the new download's bytes at 100%.
		const running = previous && !previous.finished ? previous : undefined
		const total = event.totalBytes ?? running?.total ?? 0
		const downloaded = Math.max(event.bytesDownloaded ?? 0, running?.downloaded ?? 0)
		if (running && running.total === total && running.downloaded === downloaded) return running
		return {downloaded, total, finished: false}
	}
	// Any later phase means this binary's download is over.
	if (previous && !previous.finished && event.phase !== 'starting') return {downloaded: previous.total, total: previous.total, finished: true}
	return previous
}

// 'connecting' until the first byte arrives: an unreachable server can hold a
// download at zero for a minute, and calling that 'downloading' is a claim the
// screen cannot back up.
export type SetupStage = 'connecting' | 'downloading' | 'unpacking' | 'checking'

export interface SetupProgress {
	downloaded: number
	total: number
	// 0–100, or null before any download reports its size.
	percent: number | null
	stage: SetupStage
	// The groups that downloaded anything during this run, in display order.
	groups: SetupToolGroup[]
	// The groups whose download is still running.
	downloading: SetupToolGroup[]
	// The groups being unpacked after their download.
	unpacking: SetupToolGroup[]
}

const GROUP_ORDER: readonly SetupToolGroup[] = ['engine', 'media']

// Null while nothing has downloaded: a warm start that only verifies the tools
// must not flash the setup screen.
export function summarizeSetup(ledger: DownloadLedger, progress: Partial<Record<DependencyId, WarmupProgressEvent>> | null): SetupProgress | null {
	const records = Object.entries(ledger) as Array<[DependencyId, DownloadRecord]>
	if (records.length === 0) return null
	const downloaded = records.reduce((sum, [, record]) => sum + Math.min(record.downloaded, record.total || record.downloaded), 0)
	const total = records.reduce((sum, [, record]) => sum + record.total, 0)
	const groups = GROUP_ORDER.filter(group => records.some(([id]) => SETUP_GROUP_OF[id] === group))
	const downloading = GROUP_ORDER.filter(group => records.some(([id, record]) => SETUP_GROUP_OF[id] === group && !record.finished))
	const events = Object.values(progress ?? {}).filter((event): event is WarmupProgressEvent => event !== undefined)
	// A running download with no size yet would make the others' bytes read as
	// the whole job, so the bar waits until every running download is sized.
	const unsized = records.some(([, record]) => !record.finished && record.total === 0)
	const runningBytes = records.reduce((sum, [, record]) => sum + (record.finished ? 0 : record.downloaded), 0)
	const unpacking = GROUP_ORDER.filter(group => events.some(event => event.phase === 'extracting' && SETUP_GROUP_OF[event.binary] === group))
	const stage: SetupStage = downloading.length > 0 ? (runningBytes > 0 ? 'downloading' : 'connecting') : unpacking.length > 0 ? 'unpacking' : 'checking'
	return {downloaded, total, percent: total > 0 && !unsized ? Math.min(100, (downloaded / total) * 100) : null, stage, groups, downloading, unpacking}
}

export interface RateSample {
	at: number
	bytes: number
}

const RATE_WINDOW_MS = 8000
// A rate measured over less than this swings too much to promise a time.
const MIN_RATE_SPAN_MS = 3000

export function addRateSample(samples: RateSample[], sample: RateSample): RateSample[] {
	const last = samples.at(-1)
	if (last && last.bytes === sample.bytes) return samples
	return [...samples.filter(entry => sample.at - entry.at <= RATE_WINDOW_MS), sample]
}

// Bytes per second over the recent window, or null until the rate is stable.
export function downloadRate(samples: readonly RateSample[]): number | null {
	const first = samples[0]
	const last = samples.at(-1)
	if (!first || !last) return null
	const span = last.at - first.at
	if (span < MIN_RATE_SPAN_MS) return null
	return ((last.bytes - first.bytes) / span) * 1000
}

// Seconds left at the recent download rate, or null until the rate is stable.
export function estimateSecondsLeft(samples: readonly RateSample[], remainingBytes: number): number | null {
	const rate = downloadRate(samples)
	if (rate === null || rate <= 0 || remainingBytes <= 0) return null
	return Math.ceil(remainingBytes / rate)
}

// What the store keeps about this run's downloads, updated as each progress
// event arrives (where reading the clock is allowed), so the splash can render
// the totals and the time left without any state of its own.
export interface WarmupDownloads {
	ledger: DownloadLedger
	samples: RateSample[]
}

export const EMPTY_WARMUP_DOWNLOADS: WarmupDownloads = {ledger: {}, samples: []}

export function trackWarmupDownloads(previous: WarmupDownloads, progress: Partial<Record<DependencyId, WarmupProgressEvent>>, at: number): WarmupDownloads {
	const ledger = updateDownloadLedger(previous.ledger, progress)
	const setup = summarizeSetup(ledger, progress)
	const samples = setup?.stage === 'downloading' || setup?.stage === 'connecting' ? addRateSample(previous.samples, {at, bytes: setup.downloaded}) : previous.samples
	return ledger === previous.ledger && samples === previous.samples ? previous : {ledger, samples}
}

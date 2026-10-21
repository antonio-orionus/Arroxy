import {readFile, rm, writeFile} from 'node:fs/promises'
import {isAbsolute, join} from 'node:path'
import {z} from 'zod'
import {ytDlpSubtitleTrackSchema, type YtDlpSubtitleTrack} from 'yt-dlp-bridge/info'
import type {CallerOutput, CallerSubtitlesWorkflowInput} from 'yt-dlp-bridge'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {STATUS_KEY, type SubtitleFormat} from '@shared/schemas.js'
import type {Site} from '@shared/sites/index.js'
import {planSubtitleTracks, type SubtitleMaps, type SubtitlePlan} from '@shared/subtitleTracks.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {logger} from '../subtitlePostProcess.js'
import type {SubtitleEmbedTrack} from '../subtitleEmbedArgs.js'
import type {PhaseContext, PhaseOutcome} from './types.js'

const rawSubtitleMapSchema = z.record(z.string(), z.array(ytDlpSubtitleTrackSchema)).nullish()
const infoSubtitlesSchema = z.object({title: z.string().nullish(), subtitles: rawSubtitleMapSchema, automatic_captions: rawSubtitleMapSchema}).loose()

type RawSubtitleMap = Record<string, YtDlpSubtitleTrack[]>

// A video's complete subtitle lists, read from an info-json the fetch then
// loads (`--load-info-json`), so the stored URLs are reused and the video is
// not extracted again.
export interface SubtitleLists {
	infoJsonPath: string
	subtitles: RawSubtitleMap
	automaticCaptions: RawSubtitleMap
	title: string | null
}

function parseSubtitleLists(text: string, infoJsonPath: string): SubtitleLists | null {
	let json: unknown
	try {
		json = JSON.parse(text)
	} catch {
		return null
	}
	const parsed = infoSubtitlesSchema.safeParse(json)
	if (!parsed.success) return null
	const title = parsed.data.title?.trim()
	return {infoJsonPath, subtitles: parsed.data.subtitles ?? {}, automaticCaptions: parsed.data.automatic_captions ?? {}, title: title === undefined || title === '' ? null : title}
}

// The lists from the first readable info-json at hand (the media run's, then
// the probe's), on a site whose info-json lists every track whether or not
// subtitles were asked for (YouTube). Elsewhere a plain run leaves the lists
// empty, so null: the phase lists them with a run of its own.
export async function eagerSubtitleLists(infoJsonPaths: readonly (string | undefined)[], site: Site): Promise<SubtitleLists | null> {
	if (!site.probeListsSubtitleTracks) return null
	for (const path of infoJsonPaths) {
		if (path === undefined) continue
		const text = await readFile(path, 'utf8').catch(() => null)
		const lists = text === null ? null : parseSubtitleLists(text, path)
		if (lists) return lists
	}
	return null
}

const LISTING_FILE_NAME = '_arroxy.subtitles.info.json'
const REPORT_FILE_NAME = '_arroxy.subtitles.report.json'

export type SavedListing = {kind: 'saved'; lists: SubtitleLists} | {kind: 'not-info-json'} | {kind: 'unwritable'; raw: string}

// A subtitle listing's stdout, saved in the job's temp folder for the fetch
// to load. A write the disk refuses (full, or the folder gone) is returned,
// not thrown: what it costs the job is the phase's call (ADR 0002).
export async function saveSubtitleListing(stdout: string, tempDir: string): Promise<SavedListing> {
	const path = join(tempDir, LISTING_FILE_NAME)
	const lists = parseSubtitleLists(stdout, path)
	if (!lists) return {kind: 'not-info-json'}
	return writeFile(path, stdout, 'utf8').then(
		(): SavedListing => ({kind: 'saved', lists}),
		(err: unknown): SavedListing => ({kind: 'unwritable', raw: `${path}: ${err instanceof Error ? err.message : String(err)}`})
	)
}

export function subtitleReportFile(tempDir: string): string {
	return join(tempDir, REPORT_FILE_NAME)
}

// yt-dlp appends to the report, so one left by an earlier attempt would answer
// for this run. False when it is still there: the run must not trust it.
export async function clearSubtitleReport(tempDir: string, jobId: string): Promise<boolean> {
	return rm(subtitleReportFile(tempDir), {force: true}).then(
		() => true,
		(err: unknown) => {
			logger.warn('an earlier subtitle report could not be removed', {jobId, code: err instanceof Error && 'code' in err ? err.code : undefined, message: err instanceof Error ? err.message : String(err)})
			return false
		}
	)
}

// The job's request planned over the video's lists, by the rule the Format
// screen previews with.
export function planSubtitleRun(subtitles: SubtitleOptions, lists: SubtitleLists, opts: {site: Site; jobId: string}): SubtitlePlan {
	const maps: SubtitleMaps = {subtitles: sanitizeSubtitleMap(lists.subtitles, {isAutomaticCaptions: false, site: opts.site}), automaticCaptions: sanitizeSubtitleMap(lists.automaticCaptions, {isAutomaticCaptions: true, site: opts.site})}
	const plan = planSubtitleTracks(subtitles.request, maps)
	logger.info('subtitle tracks planned', {jobId: opts.jobId, request: subtitles.request, tracks: plan.tracks.map(track => track.requestKey), missing: plan.missing})
	return plan
}

// What a job ends as when its video lacks requested languages (ADR 0016),
// decided once for both subtitle phases, from the plan alone: an empty list
// of written files proves nothing (inline captions and files already present
// write none). `before`: nothing to fetch, the phase ends here. `after`: the
// outcome once the planned tracks are in. A subtitles-only job with none of
// its languages leaves nothing usable, so it fails hard (never retried
// automatically); a job with media keeps the video and says which languages
// it lacks.
export interface MissingSubtitles {
	before?: PhaseOutcome
	after?: PhaseOutcome
}

export function missingSubtitles(plan: SubtitlePlan, job: {subtitlesOnly: boolean}): MissingSubtitles {
	const {missing, tracks} = plan
	// A queue row saved with no tracks at all asks for nothing.
	if (tracks.length === 0 && missing.length === 0) return {before: {kind: 'completed'}}
	if (missing.length === 0) return {}
	const params = {languageCodes: missing.join(',')}
	if (tracks.length === 0) {
		if (job.subtitlesOnly) return {before: {kind: 'hard-failed', error: {kind: 'noSubtitles', raw: `No subtitles in the requested languages: ${missing.join(', ')}`, languageCodes: [...missing]}}}
		return {before: {kind: 'soft-failed', status: STATUS_KEY.subtitleLanguagesMissing, params}}
	}
	return {after: {kind: 'soft-failed', status: job.subtitlesOnly ? STATUS_KEY.subtitleLanguagesMissingOthersSaved : STATUS_KEY.subtitleLanguagesMissing, params}}
}

// Ends a phase that has nothing to fetch; a hard failure says why on the row.
export function endWithoutFetching(ctx: PhaseContext, outcome: PhaseOutcome): PhaseOutcome {
	if (outcome.kind === 'hard-failed') ctx.emitStatus('error', STATUS_KEY.noSubtitles, {languageCodes: (outcome.error.languageCodes ?? []).join(',')}, outcome.error)
	return outcome
}

// The yt-dlp run that fetches the planned tracks from the lists' info-json
// and reports what it wrote.
export function subtitleFetchRequest(plan: SubtitlePlan, opts: {url: string; output: CallerOutput; format: SubtitleFormat; lists: SubtitleLists; tempDir: string}): CallerSubtitlesWorkflowInput {
	return {kind: 'subtitles', url: opts.url, output: {...opts.output, report: {subtitles: subtitleReportFile(opts.tempDir)}}, subtitles: {tracks: plan.tracks.map(track => ({key: track.requestKey, auto: track.auto})), format: opts.format}, loadInfoJsonPath: opts.lists.infoJsonPath}
}

// yt-dlp's `requested_subtitles`, one JSON line per video: each track key it
// wrote, with the file (relative to the run's folder, which it runs in).
// `--convert-subs` replaces the entry, so the path names the converted file
// and the track's name is gone (see `subtitleEmbedTracks`).
const reportedTrackSchema = z.object({filepath: z.string().min(1).nullish()}).loose()
const reportSchema = z.record(z.string(), reportedTrackSchema).nullable()

export interface ReportedSubtitle {
	key: string
	path: string
}

export async function readSubtitleReport(file: string, outputDir: string, jobId: string): Promise<ReportedSubtitle[]> {
	const text = await readFile(file, 'utf8').catch(() => null)
	const line = text?.split(/\r?\n/).findLast(entry => entry.trim().length > 0)
	if (line === undefined) {
		logger.warn('subtitle report missing or empty', {jobId, missing: text === null})
		return []
	}
	let json: unknown
	try {
		json = JSON.parse(line)
	} catch {
		logger.warn('subtitle report is not JSON', {jobId, line: line.slice(0, 200)})
		return []
	}
	const parsed = reportSchema.safeParse(json)
	if (!parsed.success) logger.warn('subtitle report has an unexpected shape', {jobId, issue: parsed.error.issues[0]?.message})
	if (!parsed.success || parsed.data === null) return []
	return Object.entries(parsed.data).flatMap(([key, track]) => {
		if (!track.filepath) return []
		return [{key, path: isAbsolute(track.filepath) ? track.filepath : join(outputDir, track.filepath)}]
	})
}

function plannedTrackFor(plan: SubtitlePlan, key: string): SubtitlePlan['tracks'][number] | undefined {
	return plan.tracks.find(track => track.requestKey === key)
}

// The files of the plan's automatic captions: rolling-cue dedupe is for those
// alone, and an uploaded track is left as its author wrote it.
export function automaticCaptionPaths(reported: readonly ReportedSubtitle[], plan: SubtitlePlan): string[] {
	return reported.filter(entry => plannedTrackFor(plan, entry.key)?.auto === true).map(entry => entry.path)
}

// A YouTube automatic caption keeps its `-orig` key only beside a manual track
// in the same language. ffmpeg writes a language tag verbatim, and "en-orig"
// is no ISO 639-2 code, so it is tagged with its base language and titled
// apart from the manual track.
const ORIGINAL_CAPTION_TITLE = 'Auto-generated'

// The format of a track that `--sub-format <format>/best` picks: the last one
// in that format, else the last one (yt-dlp's `process_subtitles`).
function pickedFormat(formats: readonly YtDlpSubtitleTrack[], format: string): YtDlpSubtitleTrack | undefined {
	return formats.findLast(f => f.ext === format) ?? formats.at(-1)
}

// The name yt-dlp gave a planned track: its entry under the requested key, in
// the list of its kind, in the format the run fetched.
function trackName(lists: SubtitleLists, track: {requestKey: string; auto: boolean}, format: string): string | undefined {
	const map = track.auto ? lists.automaticCaptions : lists.subtitles
	const formats = Object.hasOwn(map, track.requestKey) ? map[track.requestKey] : undefined
	const name = formats ? pickedFormat(formats, format)?.name?.trim() : undefined
	return name === undefined || name === '' ? undefined : name
}

// Each written file as the mux embeds it: the language of the planned track
// yt-dlp wrote it for, and the name yt-dlp's own EmbedSubtitle would give it.
export function subtitleEmbedTracks(reported: readonly ReportedSubtitle[], plan: SubtitlePlan, opts: {lists: SubtitleLists; format: string}): SubtitleEmbedTrack[] {
	return reported.map(entry => {
		const planned = plannedTrackFor(plan, entry.key)
		if (!planned) return {path: entry.path, lang: 'und'}
		const name = trackName(opts.lists, planned, opts.format)
		const named = name ? {name} : {}
		const besideManual = planned.auto && plan.tracks.some(track => !track.auto && track.requestKey === planned.language)
		return {path: entry.path, lang: planned.language, ...named, ...(besideManual ? {title: ORIGINAL_CAPTION_TITLE} : {})}
	})
}

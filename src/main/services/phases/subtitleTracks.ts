import {readFile} from 'node:fs/promises'
import {z} from 'zod'
import {ytDlpSubtitleTrackSchema, type YtDlpSubtitleTrack} from 'yt-dlp-bridge/info'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import {STATUS_KEY, type SubtitleFormat} from '@shared/schemas.js'
import type {Site} from '@shared/sites/index.js'
import {ytDlpSubtitleKey, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'
import {detectSubtitleLang, subtitleTrackKey} from '@shared/subtitlePath.js'
import {baseLanguage, fetchedTrackFormats, planSubtitleTracks, sourceFetchFlags, subtitleFetchFlags, type PickedTrack, type SubtitleMaps, type SubtitlePlan} from '@shared/subtitleTracks.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {logger} from '../subtitlePostProcess.js'
import type {SubtitleEmbedTrack} from '../subtitleEmbedArgs.js'
import type {PhaseContext, PhaseOutcome} from './types.js'

const rawSubtitleMapSchema = z.record(z.string(), z.array(ytDlpSubtitleTrackSchema)).nullish()
const infoSubtitlesSchema = z.object({subtitles: rawSubtitleMapSchema, automatic_captions: rawSubtitleMapSchema}).loose()

type RawSubtitleMap = Record<string, YtDlpSubtitleTrack[]>
interface RawSubtitleMaps {
	subtitles: RawSubtitleMap
	automaticCaptions: RawSubtitleMap
}

async function readRawSubtitleMaps(path: string): Promise<RawSubtitleMaps | null> {
	const text = await readFile(path, 'utf8').catch(() => null)
	if (text === null) return null
	let json: unknown
	try {
		json = JSON.parse(text)
	} catch {
		return null
	}
	const parsed = infoSubtitlesSchema.safeParse(json)
	if (!parsed.success) return null
	return {subtitles: parsed.data.subtitles ?? {}, automaticCaptions: parsed.data.automatic_captions ?? {}}
}

async function firstRawSubtitleMaps(infoJsonPaths: readonly (string | undefined)[]): Promise<RawSubtitleMaps | null> {
	for (const path of infoJsonPaths) {
		if (path === undefined) continue
		const maps = await readRawSubtitleMaps(path)
		if (maps) return maps
	}
	return null
}

// What a subtitle phase asks yt-dlp for. A plan names the video's exact
// tracks; without a list of them (no info-json at hand, or a site whose
// info-json lists subtitles only when asked to write them, which phase 1
// never is), a languages request goes as a pattern of its codes.
export type SubtitleRun = {kind: 'plan'; plan: SubtitlePlan; fetch: SubtitleFetch} | {kind: 'pattern'; languages: string[]; fetch: SubtitleFetch}
interface SubtitleFetch {
	manual: boolean
	auto: boolean
}

function sanitizedMaps(raw: RawSubtitleMaps, site: Site): SubtitleMaps {
	return {subtitles: sanitizeSubtitleMap(raw.subtitles, {isAutomaticCaptions: false, site}), automaticCaptions: sanitizeSubtitleMap(raw.automaticCaptions, {isAutomaticCaptions: true, site})}
}

// The Format screen's picks with no list at hand. Whether the video has an
// uploaded track under an `-orig` caption's bare key is unknown, so it is
// assumed to: the caption keeps its own key whenever manual tracks are
// fetched, and never comes back as the uploaded track.
function picksAsMaps(tracks: readonly PickedTrack[]): SubtitleMaps {
	const manual = tracks.filter(track => !track.auto).map(track => track.key)
	const bareTwins = tracks.filter(track => track.auto).map(track => baseLanguage(track.key))
	return {subtitles: Object.fromEntries([...manual, ...bareTwins].map(key => [key, true])), automaticCaptions: {}}
}

// The one step both subtitle phases start with: the job's request planned
// over the video's lists from the first readable info-json, by the rule the
// Format screen uses.
export async function resolveSubtitlePlan(subtitles: SubtitleOptions, opts: {infoJsonPaths: readonly (string | undefined)[]; site: Site; jobId: string}): Promise<SubtitleRun> {
	const {request} = subtitles
	const raw = opts.site.probeListsSubtitleTracks ? await firstRawSubtitleMaps(opts.infoJsonPaths) : null
	if (!raw && request.kind === 'languages') {
		if (opts.site.probeListsSubtitleTracks) logger.warn('subtitle tracks unresolved — no info-json; yt-dlp matches the language codes', {jobId: opts.jobId, languages: request.languages})
		return {kind: 'pattern', languages: [...request.languages], fetch: sourceFetchFlags(request.source)}
	}
	const maps = raw ? sanitizedMaps(raw, opts.site) : picksAsMaps(request.kind === 'tracks' ? request.tracks : [])
	const plan = planSubtitleTracks(request, maps)
	logger.info(raw ? 'subtitle tracks resolved from info-json' : 'subtitle tracks taken from the picks — no info-json', {jobId: opts.jobId, request, tracks: plan.tracks.map(track => track.requestKey), missing: plan.missing})
	return {kind: 'plan', plan, fetch: subtitleFetchFlags(plan)}
}

// What a job ends as when its video lacks requested languages (ADR 0016),
// decided once for both subtitle phases and only from a plan: a pattern run
// cannot know, and an empty list of written files proves nothing (inline
// captions and files already present write none). `before`: nothing to fetch,
// the phase ends here. `after`: the outcome once the planned tracks are in.
// A subtitles-only job with none of its languages leaves nothing usable, so it
// fails hard (never retried automatically); a job with media keeps the video
// and says which languages it lacks.
export interface MissingSubtitles {
	before?: PhaseOutcome
	after?: PhaseOutcome
}

export function missingSubtitles(run: SubtitleRun, job: {subtitlesOnly: boolean}): MissingSubtitles {
	if (run.kind === 'pattern') return {}
	const {missing, tracks} = run.plan
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

// The subtitles input of a yt-dlp subtitle run.
export function subtitleRunRequest(run: SubtitleRun, format: SubtitleFormat): {languages: string[]; format: SubtitleFormat; writeAuto: boolean; autoOnly?: true} {
	const languages = run.kind === 'plan' ? [...new Set(run.plan.tracks.map(track => track.requestKey))].map(ytDlpSubtitleKey) : run.languages.map(ytDlpSubtitleLanguageSelector)
	return {languages, format, writeAuto: run.fetch.auto, ...(run.fetch.auto && !run.fetch.manual ? {autoOnly: true} : {})}
}

// The format of a track that `--sub-format <format>/best` picks: the last one
// in that format, else the last one (yt-dlp's `process_subtitles`).
function pickedFormat(formats: readonly YtDlpSubtitleTrack[], format: string): YtDlpSubtitleTrack | undefined {
	return formats.findLast(f => f.ext === format) ?? formats.at(-1)
}

// The name yt-dlp's EmbedSubtitle writes for each track key a subtitle run can
// write: its `requested_subtitles` entry, which yt-dlp takes from the manual
// tracks first, then from the automatic captions, from the raw maps (a
// YouTube key the wizard never offers is still one yt-dlp may write). Keyed
// by track key, as yt-dlp names the files. Empty when no info-json is
// readable, or on a site whose info-json lists no subtitles until asked for.
export async function readSubtitleTrackNames(opts: {fetch: SubtitleFetch; format: string; infoJsonPaths: readonly (string | undefined)[]}): Promise<ReadonlyMap<string, string>> {
	const raw = await firstRawSubtitleMaps(opts.infoJsonPaths)
	const names = new Map<string, string>()
	if (!raw) return names
	for (const key of new Set([...Object.keys(raw.subtitles), ...Object.keys(raw.automaticCaptions)])) {
		const formats = fetchedTrackFormats(key, raw, opts.fetch)
		const name = formats && pickedFormat(formats, opts.format)?.name?.trim()
		if (name) names.set(key, name)
	}
	return names
}

// A YouTube automatic caption keeps its `-orig` key only beside a manual track
// in the same language. ffmpeg writes a language tag verbatim, and "en-orig"
// is no ISO 639-2 code, so it is tagged with its base language and titled
// apart from the manual track.
const ORIGINAL_CAPTION_TITLE = 'Auto-generated'

// Each written file as the mux embeds it: its language and title from the
// planned track yt-dlp wrote it for, matched by the key in its name. A pattern
// run has no plan; its files are matched to the requested codes, and a file
// none matches is embedded as "und".
export function subtitleEmbedTracks(paths: readonly string[], run: SubtitleRun, names: ReadonlyMap<string, string>): SubtitleEmbedTrack[] {
	return paths.map(path => {
		const key = subtitleTrackKey(path)
		const name = key === null ? undefined : names.get(key)
		const named = name ? {name} : {}
		if (run.kind === 'pattern') return {path, lang: detectSubtitleLang(path, run.languages) ?? 'und', ...named}
		const planned = key === null ? undefined : run.plan.tracks.find(track => track.requestKey.toLowerCase() === key.toLowerCase())
		if (!planned) return {path, lang: 'und', ...named}
		const besideManual = planned.auto && run.plan.tracks.some(track => !track.auto && track.requestKey === planned.language)
		return {path, lang: planned.language, ...named, ...(besideManual ? {title: ORIGINAL_CAPTION_TITLE} : {})}
	})
}

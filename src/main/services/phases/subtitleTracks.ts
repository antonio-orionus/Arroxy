import {readFile} from 'node:fs/promises'
import {z} from 'zod'
import {ytDlpSubtitleTrackSchema, type YtDlpSubtitleTrack} from 'yt-dlp-bridge/info'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import type {Site} from '@shared/sites/index.js'
import {withSubtitleTracks} from '@shared/subtitleLanguages.js'
import {fetchedTrackFormats} from '@shared/subtitleTracks.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {logger} from '../subtitlePostProcess.js'

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

// A job that still carries language codes (a playlist entry is queued before
// its video is known) gets this video's exact tracks from the first readable
// info-json, by the rule the Format screen uses. With none at hand, or on a
// site whose info-json lists subtitles only when asked to write them (phase 1
// never is), the codes stay and yt-dlp matches them as a pattern.
export async function resolveSubtitleTracks(subtitles: SubtitleOptions, opts: {infoJsonPaths: readonly (string | undefined)[]; site: Site; jobId: string}): Promise<SubtitleOptions> {
	if (!subtitles.languagesAreCodes || !opts.site.probeListsSubtitleTracks) return subtitles
	const raw = await firstRawSubtitleMaps(opts.infoJsonPaths)
	if (!raw) {
		logger.warn('subtitle tracks unresolved — no info-json; yt-dlp matches the language codes', {jobId: opts.jobId, languages: subtitles.languages})
		return subtitles
	}
	const maps = {subtitles: sanitizeSubtitleMap(raw.subtitles, {isAutomaticCaptions: false, site: opts.site}), automaticCaptions: sanitizeSubtitleMap(raw.automaticCaptions, {isAutomaticCaptions: true, site: opts.site})}
	const exact = withSubtitleTracks(subtitles, maps)
	logger.info('subtitle tracks resolved from info-json', {jobId: opts.jobId, languages: subtitles.languages, tracks: exact.languages})
	return exact
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
export async function readSubtitleTrackNames(subtitles: Pick<SubtitleOptions, 'format' | 'writeAuto' | 'autoOnly'>, opts: {infoJsonPaths: readonly (string | undefined)[]}): Promise<ReadonlyMap<string, string>> {
	const raw = await firstRawSubtitleMaps(opts.infoJsonPaths)
	const names = new Map<string, string>()
	if (!raw) return names
	const fetch = {manual: subtitles.autoOnly !== true, auto: subtitles.writeAuto || subtitles.autoOnly === true}
	for (const key of new Set([...Object.keys(raw.subtitles), ...Object.keys(raw.automaticCaptions)])) {
		const formats = fetchedTrackFormats(key, raw, fetch)
		const name = formats && pickedFormat(formats, subtitles.format)?.name?.trim()
		if (name) names.set(key, name)
	}
	return names
}

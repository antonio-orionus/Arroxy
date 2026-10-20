import {readFile} from 'node:fs/promises'
import {z} from 'zod'
import {ytDlpSubtitleTrackSchema} from 'yt-dlp-bridge/info'
import type {SubtitleOptions} from '@shared/preparedJob.js'
import type {Site} from '@shared/sites/index.js'
import {withSubtitleTracks} from '@shared/subtitleLanguages.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {logger} from '../subtitlePostProcess.js'

const rawSubtitleMapSchema = z.record(z.string(), z.array(ytDlpSubtitleTrackSchema)).nullish()
const infoSubtitlesSchema = z.object({subtitles: rawSubtitleMapSchema, automatic_captions: rawSubtitleMapSchema}).loose()

async function readSubtitleMaps(path: string, site: Site): Promise<Parameters<typeof withSubtitleTracks>[1] | null> {
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
	return {subtitles: sanitizeSubtitleMap(parsed.data.subtitles ?? undefined, {isAutomaticCaptions: false, site}), automaticCaptions: sanitizeSubtitleMap(parsed.data.automatic_captions ?? undefined, {isAutomaticCaptions: true, site})}
}

// A job that still carries language codes (a playlist entry is queued before
// its video is known) gets this video's exact tracks from the first readable
// info-json, by the rule the Format screen uses. With none at hand, or on a
// site whose info-json lists subtitles only when asked to write them (phase 1
// never is), the codes stay and yt-dlp matches them as a pattern.
export async function resolveSubtitleTracks(subtitles: SubtitleOptions, opts: {infoJsonPaths: readonly (string | undefined)[]; site: Site; jobId: string}): Promise<SubtitleOptions> {
	if (!subtitles.languagesAreCodes || !opts.site.probeListsSubtitleTracks) return subtitles
	for (const path of opts.infoJsonPaths) {
		if (path === undefined) continue
		const maps = await readSubtitleMaps(path, opts.site)
		if (!maps) continue
		const exact = withSubtitleTracks(subtitles, maps)
		logger.info('subtitle tracks resolved from info-json', {jobId: opts.jobId, languages: subtitles.languages, tracks: exact.languages})
		return exact
	}
	logger.warn('subtitle tracks unresolved — no info-json; yt-dlp matches the language codes', {jobId: opts.jobId, languages: subtitles.languages})
	return subtitles
}

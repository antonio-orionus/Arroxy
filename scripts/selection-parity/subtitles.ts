// Subtitle tracks for the selection parity check: the tracks a job's subtitle
// phase plans (`planSubtitleRun`, the rule the Format screen previews with)
// against the ones yt-dlp fetches for the argv that phase sends
// (`subtitleFetchRequest` through the bridge), over every recorded probe with
// subtitles and a few constructed lists. Requests: each language a list offers
// and a few it may not, under every subtitle source, and the tracks picked on
// the Format screen one by one and all together.
//
// The fixtures keep no subtitle URLs, so each track gets one that says which
// track it is, built the way yt-dlp's YouTube extractor builds them
// (`process_language` in extractor/youtube/_video.py): an original-language
// caption has the same URL under `<lang>-orig` and `<lang>`, every other
// automatic key is a translation (`tlang`). A track yt-dlp fetches is the
// planned one when its URL is.

import log from 'electron-log/main.js'
import {planWorkflow} from 'yt-dlp-bridge'
import {infoDictSchema, type YtDlpSubtitleTrack} from 'yt-dlp-bridge/info'
import {planSubtitleRun, subtitleFetchRequest, type SubtitleLists} from '../../src/main/services/phases/subtitleTracks.js'
import type {SubtitleOptions} from '../../src/shared/preparedJob.js'
import {downloadProfileSubtitleSourceSchema} from '../../src/shared/schemas.js'
import {siteForJob, type Site} from '../../src/shared/sites/index.js'
import {baseLanguage, pickedTrack, type SubtitleRequest} from '../../src/shared/subtitleTracks.js'
import {sanitizeSubtitleMap} from '../../src/shared/ytdlp/subtitleMap.js'
import {CONSTRUCTED_SUBTITLES} from './constructedSubtitles.js'

// The phase logs every plan; hundreds of cases would bury the check's report.
log.transports.console.level = false

type RawMap = Record<string, YtDlpSubtitleTrack[]>

interface SubtitleVideo {
	id: string
	site: Site
	url: string
	extractor: string
	extractorKey: string
	subtitles: RawMap
	automaticCaptions: RawMap
}

export interface SubtitleCase {
	video: string
	label: string
	argv: string[]
	// Each key the run asks for, with the URL of the track planned under it.
	expected: Record<string, string>
}

// Languages asked for on every video, beside the ones it lists: common ones,
// a second spelling (`he` for YouTube's `iw`) and one no list has.
const EXTRA_LANGUAGES = ['en', 'de', 'ja', 'pt', 'zh', 'es', 'he', 'xx']

const TRACK_HOST = 'https://parity.invalid/subtitles'

// The URL that names a track, the same for every format of it.
function trackUrl(video: SubtitleVideo, key: string, auto: boolean): string {
	if (!auto) return `${TRACK_HOST}/manual?lang=${encodeURIComponent(key)}`
	if (!video.site.autoCaptionRequiresOrigSuffix) return `${TRACK_HOST}/auto?lang=${encodeURIComponent(key)}`
	const original = baseLanguage(key)
	if (original !== key || Object.hasOwn(video.automaticCaptions, `${key}-orig`)) return `${TRACK_HOST}/asr?lang=${encodeURIComponent(original)}`
	const spoken = Object.keys(video.automaticCaptions).find(candidate => candidate.endsWith('-orig'))
	return `${TRACK_HOST}/asr?lang=${encodeURIComponent(spoken ? baseLanguage(spoken) : 'und')}&tlang=${encodeURIComponent(key)}`
}

// The track a fetched format belongs to: its URL without the format.
function trackOf(formatUrl: string): string {
	const url = new URL(formatUrl)
	url.searchParams.delete('fmt')
	return url.toString()
}

function withUrls(video: SubtitleVideo, map: RawMap, auto: boolean): RawMap {
	return Object.fromEntries(Object.entries(map).map(([key, formats]) => [key, formats.map(format => ({...format, url: `${trackUrl(video, key, auto)}&fmt=${format.ext ?? ''}`}))]))
}

// The info dict yt-dlp loads: the video's identity and subtitle lists, and one
// format so that format selection, which subtitle choice never reads, passes.
function infoDict(video: SubtitleVideo): unknown {
	return {
		_type: 'video',
		id: video.id,
		title: video.id,
		extractor: video.extractor,
		extractor_key: video.extractorKey,
		webpage_url: video.url,
		formats: [{format_id: 'parity', url: 'https://parity.invalid/media', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}],
		subtitles: withUrls(video, video.subtitles, false),
		automatic_captions: withUrls(video, video.automaticCaptions, true)
	}
}

function recordedVideo(id: string, fixture: unknown): SubtitleVideo | null {
	if (typeof fixture !== 'object' || fixture === null || !('info' in fixture)) throw new Error(`${id}: fixture has no info dict`)
	const info = infoDictSchema.parse(fixture.info)
	if (info._type !== 'video') return null
	const subtitles = info.subtitles ?? {}
	const automaticCaptions = info.automatic_captions ?? {}
	if (Object.keys(subtitles).length === 0 && Object.keys(automaticCaptions).length === 0) return null
	const url = info.webpage_url ?? ''
	return {id, site: siteForJob(info.extractor, url), url, extractor: info.extractor ?? '', extractorKey: info.extractor_key ?? '', subtitles, automaticCaptions}
}

// The video's lists as the subtitle phase reads them: the probe's info-json on
// YouTube, a listing run elsewhere; either holds these maps.
function listsOf(video: SubtitleVideo): SubtitleLists {
	return {infoJsonPath: `/parity/${video.id}.info.json`, subtitles: video.subtitles, automaticCaptions: video.automaticCaptions, title: video.id}
}

function requests(video: SubtitleVideo): {label: string; request: SubtitleRequest}[] {
	const subtitles = sanitizeSubtitleMap(video.subtitles, {isAutomaticCaptions: false, site: video.site})
	const automaticCaptions = sanitizeSubtitleMap(video.automaticCaptions, {isAutomaticCaptions: true, site: video.site})
	const listed = [...Object.keys(subtitles), ...Object.keys(automaticCaptions).filter(key => !Object.hasOwn(subtitles, key))]
	const primary = (key: string): string => baseLanguage(key).split('-')[0]?.toLowerCase() ?? key
	const codes = [...new Set([...listed.map(baseLanguage), ...listed.map(primary), ...EXTRA_LANGUAGES])]
	const languageSets = [...codes.map(code => [code]), codes.slice(0, 3)]
	const byLanguages = languageSets.flatMap(languages => downloadProfileSubtitleSourceSchema.options.map(source => ({label: `${source} ${languages.join('+')}`, request: {kind: 'languages' as const, languages, source}})))
	// Picked on the Format screen: a key the uploaded tracks hold is that track.
	const picks = [...listed.map(key => [key]), ...(listed.length > 1 ? [listed] : [])]
	const byTracks = picks.map(keys => ({label: `picked ${keys.join('+')}`, request: {kind: 'tracks' as const, tracks: keys.map(key => pickedTrack(key, {subtitles}))}}))
	return [...byLanguages, ...byTracks]
}

export function subtitleCases(recorded: readonly {id: string; fixture: unknown}[]): {videos: Record<string, unknown>; cases: SubtitleCase[]} {
	const constructed = Object.entries(CONSTRUCTED_SUBTITLES).map(([id, list]): SubtitleVideo => ({id, site: siteForJob(list.extractor, list.url), ...list}))
	const videos = [...recorded.flatMap(({id, fixture}) => recordedVideo(id, fixture) ?? []), ...constructed]
	const cases = videos.flatMap(video => {
		const lists = listsOf(video)
		return requests(video).flatMap(({label, request}) => {
			const options: SubtitleOptions = {request, mode: 'sidecar', format: 'srt'}
			const plan = planSubtitleRun(options, lists, {site: video.site, jobId: 'parity'})
			// Nothing planned: the phase ends without running yt-dlp.
			if (plan.tracks.length === 0) return []
			const {args} = planWorkflow(subtitleFetchRequest(plan, {url: video.url, output: {directory: '/parity'}, format: options.format, lists, tempDir: '/parity/.tmp'}))
			const expected: Record<string, string> = {}
			for (const track of plan.tracks) {
				const planned = trackOf(trackUrl(video, track.key, track.auto))
				// Two planned tracks under one key: yt-dlp fetches one of them.
				expected[track.requestKey] = track.requestKey in expected && expected[track.requestKey] !== planned ? `${expected[track.requestKey]} and ${planned}` : planned
			}
			return [{video: video.id, label, argv: args, expected}]
		})
	})
	return {videos: Object.fromEntries(videos.map(video => [video.id, infoDict(video)])), cases}
}

const describe = (tracks: Record<string, string>): string =>
	Object.entries(tracks)
		.map(([key, url]) => `${key}=${url.replaceAll(`${TRACK_HOST}/`, '')}`)
		.sort()
		.join(', ') || 'nothing'

// One line per case where yt-dlp fetches other tracks than the plan names.
export function subtitleDifference(testCase: SubtitleCase, answer: unknown): string | null {
	if (typeof answer !== 'object' || answer === null) return `${testCase.video} · ${testCase.label}: the oracle gave no answer`
	if ('error' in answer) return `${testCase.video} · ${testCase.label}: yt-dlp refused it, ${String(answer.error)}`
	const raw = 'tracks' in answer && typeof answer.tracks === 'object' && answer.tracks !== null ? answer.tracks : {}
	const fetched = Object.fromEntries(Object.entries(raw).map(([key, url]) => [key, typeof url === 'string' ? trackOf(url) : String(url)]))
	const app = describe(testCase.expected)
	const ytDlp = describe(fetched)
	return app === ytDlp ? null : `${testCase.video} · ${testCase.label}: app ${app}, yt-dlp ${ytDlp}  (${subtitleFlags(testCase.argv)})`
}

function subtitleFlags(argv: readonly string[]): string {
	const langs = argv[argv.indexOf('--sub-langs') + 1] ?? ''
	return [argv.includes('--write-subs') ? '--write-subs' : null, argv.includes('--write-auto-subs') ? '--write-auto-subs' : null, `--sub-langs ${langs}`].filter(Boolean).join(' ')
}

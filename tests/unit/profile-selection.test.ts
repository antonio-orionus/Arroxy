import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {resolveProfileSelection, videoHeight} from '@shared/profileSelection.js'
import {mapFormats} from '@shared/ytdlp/formatMapping.js'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {formatSelectionSource} from '@shared/ytdlp/selectableFormat.js'
import type {DownloadProfile, FormatOption, SubtitleMap} from '@shared/types.js'

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}

function withMedia(id: string, media: DownloadProfile['media']): DownloadProfile {
	return {...builtin(id), media}
}

function withSubtitles(profile: DownloadProfile, subtitles: Partial<DownloadProfile['subtitles']>): DownloadProfile {
	return {...profile, subtitles: {...profile.subtitles, enabled: true, ...subtitles}}
}

function video(formatId: string, resolution: string, extra: Partial<FormatOption> = {}): FormatOption {
	return {formatId, label: resolution, ext: 'webm', resolution, fps: 30, isVideoOnly: true, isAudioOnly: false, ...extra}
}

function audio(formatId: string, extra: Partial<FormatOption> = {}): FormatOption {
	return {formatId, label: formatId, ext: 'm4a', resolution: 'audio only', abr: 128, audioCodec: 'mp4a.40.2', isVideoOnly: false, isAudioOnly: true, ...extra}
}

// Already in probe order: video best-first, then audio by bitrate.
const YOUTUBE: FormatOption[] = [
	video('401', '3840x2160', {videoCodec: 'av01.0.12M.08'}),
	video('400', '2560x1440', {videoCodec: 'av01.0.12M.08'}),
	video('399', '1920x1080', {videoCodec: 'av01.0.08M.08', ext: 'mp4'}),
	video('137', '1920x1080', {videoCodec: 'avc1.640028', ext: 'mp4'}),
	video('247', '1280x720', {videoCodec: 'vp9'}),
	video('136', '1280x720', {videoCodec: 'avc1.4d401f', ext: 'mp4'}),
	video('244', '854x480', {videoCodec: 'vp9'}),
	video('135', '854x480', {videoCodec: 'avc1.4d401e', ext: 'mp4'}),
	audio('251', {ext: 'webm', audioCodec: 'opus', abr: 160}),
	audio('140', {abr: 130}),
	audio('139', {abr: 48})
]

const NO_SUBS: SubtitleMap = {}

function resolve(profile: DownloadProfile, formats: FormatOption[] = YOUTUBE, extra: Partial<Parameters<typeof resolveProfileSelection>[0]> = {}) {
	return resolveProfileSelection({profile, formats, selection: selectionSourceFromOptions(formats), subtitles: NO_SUBS, automaticCaptions: NO_SUBS, isAudioOnlySource: false, nativeAudioPreference: 'compatible', ...extra})
}

// A probe as yt-dlp returns it: its formats (best last, as yt-dlp lists them)
// and its extractor's own sort, read the way the app reads a real probe.
function resolveRaw(profile: DownloadProfile, raw: readonly Record<string, unknown>[], sortFields: readonly string[] = YOUTUBE_SORT_FIELDS) {
	const formats = mapFormats(raw.map(format => ({...format})))
	return resolveProfileSelection({profile, formats, selection: formatSelectionSource({formats: raw}, sortFields), subtitles: NO_SUBS, automaticCaptions: NO_SUBS, isAudioOnlySource: false, nativeAudioPreference: 'compatible'})
}

// YouTube's `_format_sort_fields`.
const YOUTUBE_SORT_FIELDS = ['quality', 'res', 'fps', 'hdr:12', 'source', 'vcodec', 'channels', 'acodec', 'lang', 'proto']

describe('videoHeight', () => {
	it('reads WxH, NNNp and labels with extras', () => {
		expect(videoHeight('1920x1080')).toBe(1080)
		expect(videoHeight('1080x1920')).toBe(1080)
		expect(videoHeight('720p')).toBe(720)
		expect(videoHeight('2160p HDR')).toBe(2160)
		expect(videoHeight('audio only')).toBe(0)
	})
})

describe('resolveProfileSelection: video tiers', () => {
	it('best takes the first video stream and the preferred native audio', () => {
		const result = resolve(builtin('best-quality'))
		expect(result.media).toEqual({kind: 'video', videoFormatId: '401', audioSelection: {kind: 'native', formatId: '251'}})
		expect(result.notices).toEqual([])
	})

	it('a tier takes the best stream at or below it', () => {
		expect(resolve(builtin('balanced')).media.videoFormatId).toBe('247')
		expect(resolve(builtin('hd-1080')).media.videoFormatId).toBe('399')
		expect(resolve(builtin('best-1440')).media.videoFormatId).toBe('400')
	})

	it('falls back to the smallest stream above the tier, with a notice', () => {
		const result = resolve(builtin('low-144'))
		expect(result.media.videoFormatId).toBe('244')
		expect(result.notices).toEqual([{kind: 'video-tier-fallback', wanted: '144', picked: 480}])
	})

	it('notes when the video tops out below the tier', () => {
		const result = resolve(
			builtin('best-2160'),
			YOUTUBE.filter(f => f.isAudioOnly || videoHeight(f.resolution) <= 720)
		)
		expect(result.media.videoFormatId).toBe('247')
		expect(result.notices).toEqual([{kind: 'video-tier-fallback', wanted: '2160', picked: 720}])
	})

	it('mp4 profiles prefer H.264 at the tier, like yt-dlp vcodec:h264 sorting', () => {
		expect(resolve(builtin('mp4-1080')).media.videoFormatId).toBe('137')
		expect(resolve(builtin('mp4-720')).media.videoFormatId).toBe('136')
		expect(resolve(builtin('mp4-720')).notices).toEqual([])
	})

	it('mp4 profiles fall back to any codec with a notice when there is no H.264', () => {
		const formats = YOUTUBE.filter(f => f.isAudioOnly || !f.videoCodec?.startsWith('avc1'))
		const result = resolve(builtin('mp4-720'), formats)
		expect(result.media.videoFormatId).toBe('247')
		expect(result.notices).toEqual([{kind: 'mp4-unavailable'}])
	})

	it('m4a-audio profiles prefer m4a among the source-preferred tracks', () => {
		expect(resolve(builtin('mp4-720')).media.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})

	it('video-only profiles pick no audio', () => {
		const result = resolve(withMedia('balanced', {kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto'}))
		expect(result.media).toEqual({kind: 'video', videoFormatId: '247', audioSelection: {kind: 'none'}})
	})

	it('keeps the built-in audio of a muxed stream instead of adding a second track', () => {
		const formats = [video('22', '1280x720', {isVideoOnly: false, ext: 'mp4'}), audio('140')]
		expect(resolve(builtin('balanced'), formats).media.audioSelection).toEqual({kind: 'none'})
	})

	it('honours the surround preference', () => {
		const formats = [...YOUTUBE, audio('328', {audioCodec: 'ec-3', abr: 384})]
		expect(resolve(builtin('balanced'), formats, {nativeAudioPreference: 'surround'}).media.audioSelection).toEqual({kind: 'native', formatId: '328'})
		expect(resolve(builtin('balanced'), formats, {nativeAudioPreference: 'compatible'}).media.audioSelection).toEqual({kind: 'native', formatId: '251'})
	})
})

describe('resolveProfileSelection: audio and subtitles-only media', () => {
	it('audio best picks the preferred native track', () => {
		expect(resolve(builtin('audio-only')).media).toEqual({kind: 'audio', videoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}})
	})

	it('converting profiles map to convert selections with the profile bitrate', () => {
		expect(resolve(withMedia('audio-only', {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 320}})).media.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320})
		expect(resolve(withMedia('audio-only', {kind: 'audio-only', audio: {format: 'opus'}})).media.audioSelection).toEqual({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192})
		expect(resolve(withMedia('audio-only', {kind: 'audio-only', audio: {format: 'wav'}})).media.audioSelection).toEqual({kind: 'convert-lossless', target: 'wav'})
	})

	// The same file Quick Download gives: the combined file's audio, as it is.
	it('audio best on a muxed-only source extracts its audio as is', () => {
		const formats = [video('18', '640x360', {isVideoOnly: false, ext: 'mp4'})]
		expect(resolve(builtin('audio-only'), formats).media.audioSelection).toEqual({kind: 'extract', formatId: '18'})
	})

	it('subtitles-only selects no media', () => {
		expect(resolve(builtin('subtitles-only')).media).toEqual({kind: 'subtitles', videoFormatId: '', audioSelection: {kind: 'none'}})
	})

	it('an audio-only source switches a video profile to audio, with a notice', () => {
		const formats = [audio('251', {ext: 'webm', audioCodec: 'opus', abr: 160}), audio('140')]
		const result = resolve(builtin('balanced'), formats, {isAudioOnlySource: true})
		expect(result.media).toEqual({kind: 'audio', videoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}})
		expect(result.notices).toEqual([{kind: 'no-video'}])
	})
})

describe('resolveProfileSelection: subtitles', () => {
	const manual: SubtitleMap = {en: [{ext: 'vtt'}], 'pt-BR': [{ext: 'vtt'}], 'de-en': [{ext: 'vtt'}]}
	const auto: SubtitleMap = {'en-orig': [{ext: 'vtt'}], 'ja-orig': [{ext: 'vtt'}]}

	it('selects nothing when the profile has subtitles off', () => {
		expect(resolve(builtin('balanced'), YOUTUBE, {subtitles: manual}).subtitleLanguages).toEqual([])
	})

	it('manual-first takes manual tracks, regional variants included, then auto', () => {
		const profile = withSubtitles(builtin('balanced'), {languages: ['en', 'pt', 'ja', 'de'], source: 'manual-first'})
		const result = resolve(profile, YOUTUBE, {subtitles: manual, automaticCaptions: auto})
		expect(result.subtitleLanguages).toEqual(['en', 'pt-BR', 'ja-orig'])
		expect(result.notices).toEqual([{kind: 'subtitle-languages-missing', languages: ['de']}])
	})

	it('manual-only ignores auto-captions and auto-only ignores manual tracks', () => {
		const manualOnly = withSubtitles(builtin('balanced'), {languages: ['en', 'ja'], source: 'manual-only'})
		expect(resolve(manualOnly, YOUTUBE, {subtitles: manual, automaticCaptions: auto}).subtitleLanguages).toEqual(['en'])
		const autoOnly = withSubtitles(builtin('balanced'), {languages: ['en'], source: 'auto-only'})
		expect(resolve(autoOnly, YOUTUBE, {subtitles: manual, automaticCaptions: auto}).subtitleLanguages).toEqual(['en-orig'])
	})

	it('reports every language when the video has no subtitles', () => {
		const result = resolve(builtin('subtitles-only'))
		expect(result.subtitleLanguages).toEqual([])
		expect(result.notices).toEqual([{kind: 'subtitle-languages-missing', languages: ['en']}])
	})
})

// yt-dlp formats as a YouTube probe lists them.
function rawVideo(formatId: string, height: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {format_id: formatId, ext: 'mp4', width: Math.round((height * 16) / 9), height, resolution: `${Math.round((height * 16) / 9)}x${height}`, fps: 30, vcodec: 'avc1.640028', acodec: 'none', dynamic_range: 'SDR', protocol: 'https', source_preference: -1, ...extra}
}

function rawAudio(formatId: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
	return {format_id: formatId, ext: 'm4a', resolution: 'audio only', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129, audio_channels: 2, protocol: 'https', source_preference: -1, ...extra}
}

describe('resolveProfileSelection: parity with the profile path yt-dlp sort', () => {
	it('prefers the better codec at the same resolution and fps, like yt-dlp vcodec sorting', () => {
		const raw = [rawVideo('137', 1080, {filesize: 900}), rawVideo('399', 1080, {vcodec: 'av01.0.08M.08', filesize: 500}), rawAudio('140')]
		expect(resolveRaw(builtin('best-quality'), raw).media.videoFormatId).toBe('399')
		expect(resolveRaw(builtin('hd-1080'), raw).media.videoFormatId).toBe('399')
	})

	it('takes the stream the site prefers as a source before the better codec, like YouTube source before vcodec', () => {
		// YouTube's Premium VP9 (616) gets source_preference +100 over the AV1 copy.
		const raw = [rawVideo('399', 1080, {vcodec: 'av01.0.08M.08', filesize: 53}), rawVideo('616', 1080, {vcodec: 'vp09.00.40.08', source_preference: 99, filesize: 204}), rawAudio('140')]
		expect(resolveRaw(builtin('best-quality'), raw).media.videoFormatId).toBe('616')
		expect(resolveRaw(builtin('hd-1080'), raw).media.videoFormatId).toBe('616')
		// Where the extractor's sort doesn't rank the source first, the codec decides.
		expect(resolveRaw(builtin('best-quality'), raw, []).media.videoFormatId).toBe('399')
	})

	it('reads a missing source preference as yt-dlp default -1, so the codec still decides', () => {
		const raw = [rawVideo('137', 1080), rawVideo('399', 1080, {vcodec: 'av01.0.08M.08', source_preference: undefined}), rawAudio('140')]
		expect(resolveRaw(builtin('best-quality'), raw).media.videoFormatId).toBe('399')
	})

	it('fps and HDR still outrank the source preference, as in yt-dlp', () => {
		const raw = [rawVideo('616', 1080, {vcodec: 'vp09.00.40.08', source_preference: 99}), rawVideo('399', 1080, {vcodec: 'av01.0.08M.08', fps: 60}), rawAudio('140')]
		expect(resolveRaw(builtin('best-quality'), raw).media.videoFormatId).toBe('399')
	})

	it('reads vp9 and vp09.00 as one codec, as yt-dlp does, so the copies tie on it', () => {
		// The HLS copy (609) has no size; the direct download (247) wins on YouTube's protocol rank.
		const raw = [rawVideo('609', 720, {vcodec: 'vp09.00.31.08', protocol: 'm3u8_native', tbr: 1679}), rawVideo('247', 720, {vcodec: 'vp9', ext: 'webm', filesize: 500}), rawAudio('140')]
		expect(resolveRaw(builtin('balanced'), raw).media.videoFormatId).toBe('247')
	})

	it('Smart TV breaks ties among H.264 streams by source preference too', () => {
		const raw = [rawVideo('137', 1080, {source_preference: -21, filesize: 900}), rawVideo('137-hls', 1080, {filesize: 500}), rawAudio('140')]
		expect(resolveRaw(builtin('mp4-1080'), raw).media.videoFormatId).toBe('137-hls')
	})

	it('MP4 profiles put the MP4 container before resolution, like vcodec:h264,ext:mp4,res', () => {
		const formats = [video('mov', '1920x1080', {videoCodec: 'avc1.640028', ext: 'mov'}), video('136', '1280x720', {videoCodec: 'avc1.4d401f', ext: 'mp4'}), audio('140')]
		const result = resolve(builtin('mp4-1080'), formats)
		expect(result.media.videoFormatId).toBe('136')
	})

	it('video-only and MP4 profiles take a separate video stream over a muxed one, like bestvideo', () => {
		const formats = [video('22', '1920x1080', {videoCodec: 'avc1.640028', ext: 'mp4', isVideoOnly: false}), video('136', '1280x720', {videoCodec: 'avc1.4d401f', ext: 'mp4'}), audio('140')]
		expect(resolve(withMedia('hd-1080', {kind: 'video-only', goal: 'best-picture', tier: '1080', fileType: 'auto'}), formats).media).toEqual({kind: 'video', videoFormatId: '136', audioSelection: {kind: 'none'}})
		expect(resolve(builtin('mp4-1080'), formats).media.videoFormatId).toBe('136')
		// A plain profile may take the muxed stream (bestvideo* includes it).
		expect(resolve(builtin('hd-1080'), formats).media).toEqual({kind: 'video', videoFormatId: '22', audioSelection: {kind: 'none'}})
	})

	it('falls back to a muxed stream when there is no separate video', () => {
		const formats = [video('22', '1280x720', {videoCodec: 'avc1.640028', ext: 'mp4', isVideoOnly: false}), audio('140')]
		expect(resolve(withMedia('balanced', {kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto'}), formats).media.videoFormatId).toBe('22')
	})

	it('M4A audio profiles take AAC over Dolby even with the surround preference', () => {
		const formats = [...YOUTUBE, audio('328', {audioCodec: 'ec-3', abr: 384})]
		expect(resolve(builtin('mp4-720'), formats, {nativeAudioPreference: 'surround'}).media.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})
})

describe('resolveProfileSelection: subtitle precedence per track', () => {
	it('manual-first keeps an auto-generated regional variant the manual tracks lack', () => {
		const profile = withSubtitles(builtin('balanced'), {languages: ['en'], source: 'manual-first'})
		const result = resolve(profile, YOUTUBE, {subtitles: {'en-US': [{ext: 'vtt'}]}, automaticCaptions: {'en-GB': [{ext: 'vtt'}], 'en-US': [{ext: 'vtt'}]}})
		expect(result.subtitleLanguages).toEqual(['en-US', 'en-GB'])
	})
})

describe('resolveProfileSelection: selection order and file type', () => {
	it('returns the order that made the pick, for the Why this one tip', () => {
		const smartTv = resolve(builtin('mp4-720')).order
		expect(smartTv?.goal).toBe('smart-tv')
		expect(smartTv?.video.map(rank => rank.kind)).toEqual(['site-preference', 'original', 'h264', 'mp4-streams', 'resolution', 'fps', 'hdr', 'codec', 'size'])
		expect(resolve(builtin('balanced')).order?.audio).toEqual([{kind: 'native'}])
		expect(resolve(builtin('audio-only')).order).toBeNull()
		expect(resolve(builtin('subtitles-only')).order).toBeNull()
	})

	it('takes the direct download over its HLS copy on YouTube, like yt-dlp proto before size', () => {
		// The HLS copy has no size from the site; its peak bitrate would make an estimate larger.
		const raw = [rawVideo('270', 1080, {protocol: 'm3u8_native', tbr: 3292, manifest_url: 'https://manifest.invalid/'}), rawVideo('137', 1080, {filesize: 500}), rawAudio('140')]
		expect(resolveRaw(builtin('mp4-1080'), raw).media.videoFormatId).toBe('137')
		expect(resolveRaw(builtin('best-quality'), raw).media.videoFormatId).toBe('137')
	})

	// X/Twitter's extractor sorts `proto:m3u8`: HLS first, so "direct downloads first" would be wrong there.
	it('names the protocol rank only where the extractor ranks direct downloads first', () => {
		const raw = [rawVideo('137', 1080), rawAudio('140')]
		expect(resolveRaw(builtin('best-quality'), raw, ['res', 'proto:m3u8']).order?.video.map(rank => rank.kind)).not.toContain('protocol')
	})

	// A site may leave out the video codec of an audio stream; the Format screen
	// lists it as audio, and yt-dlp downloads it as it is.
	it('keeps a native audio pick whose stream names no video codec', () => {
		const raw = [{format_id: 'aac', ext: 'm4a', resolution: 'audio only', acodec: 'mp4a.40.2', abr: 128, protocol: 'https'}]
		expect(resolveRaw(builtin('audio-only'), raw, []).media.audioSelection).toEqual({kind: 'native', formatId: 'aac'})
	})

	it('names the source and protocol ranks only where the extractor sorts by them', () => {
		const raw = [rawVideo('137', 1080), rawAudio('140')]
		const youtube = resolveRaw(builtin('best-quality'), raw).order?.video.map(rank => rank.kind)
		expect(youtube).toContain('source')
		expect(youtube).toContain('protocol')
		const generic = resolveRaw(builtin('best-quality'), raw, []).order?.video.map(rank => rank.kind)
		expect(generic).not.toContain('source')
		expect(generic).not.toContain('protocol')
	})

	it('names the profile native audio choice as its own source', () => {
		const profile = withMedia('balanced', {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'auto', audio: {native: {kind: 'custom', preference: 'surround'}}})
		expect(resolve(profile).order?.nativeAudio).toEqual({preference: 'surround', source: 'profile'})
		expect(resolve(builtin('balanced')).order?.nativeAudio).toEqual({preference: 'compatible', source: 'settings'})
	})

	it('a profile saved as MP4 takes AAC audio even when Opus ranks first', () => {
		const profile = withMedia('balanced', {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'mp4', audio: {native: {kind: 'default'}}})
		expect(resolve(profile).media.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})

	it('a profile saved as WebM takes Opus audio', () => {
		const profile = withMedia('balanced', {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'webm', audio: {native: {kind: 'default'}}})
		expect(resolve(profile, YOUTUBE, {nativeAudioPreference: 'compatible'}).media.audioSelection).toEqual({kind: 'native', formatId: '251'})
	})

	it('Smart TV keeps taking a separate stream and AAC audio, whatever the native preference', () => {
		const result = resolve(builtin('mp4-1080'), YOUTUBE, {nativeAudioPreference: 'surround'})
		expect(result.media.videoFormatId).toBe('137')
		expect(result.media.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})

	it('a video-only profile picks no audio and has no native audio order', () => {
		const result = resolve(withMedia('balanced', {kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto'}))
		expect(result.media.audioSelection).toEqual({kind: 'none'})
		expect(result.order?.nativeAudio).toBeNull()
	})
})

describe('resolveProfileSelection: SDR or HDR first', () => {
	const HDR_FORMATS: FormatOption[] = [
		video('h2160', '3840x2160', {videoCodec: 'vp09.02.51.10', dynamicRange: 'HDR10', ext: 'webm'}),
		video('s2160', '3840x2160', {videoCodec: 'vp09.00.51.08', ext: 'webm'}),
		video('h1080', '1920x1080', {videoCodec: 'av01.0.09M.10', dynamicRange: 'HDR10', ext: 'mp4'}),
		video('s1080', '1920x1080', {videoCodec: 'avc1.64002a', ext: 'mp4'}),
		video('h720', '1280x720', {videoCodec: 'vp09.02.31.10', dynamicRange: 'HDR10'}),
		audio('140')
	]
	const best = (tier: '2160' | '1080' | '720' | 'best', extra: Partial<Extract<DownloadProfile['media'], {kind: 'video-audio'}>> = {}) => withMedia('balanced', {kind: 'video-audio', goal: 'best-picture', tier, fileType: 'auto', audio: {native: {kind: 'default'}}, ...extra})

	it('takes the SDR stream at the height by default', () => {
		expect(resolve(best('best'), HDR_FORMATS).media.videoFormatId).toBe('s2160')
		expect(resolve(best('1080'), HDR_FORMATS).media.videoFormatId).toBe('s1080')
	})

	it('takes the HDR stream first when the app setting is HDR, like yt-dlp does', () => {
		expect(resolve(best('best'), HDR_FORMATS, {hdrPreference: 'hdr'}).media.videoFormatId).toBe('h2160')
		expect(resolve(best('1080'), HDR_FORMATS, {hdrPreference: 'hdr'}).media.videoFormatId).toBe('h1080')
	})

	it('never gives up a height to avoid HDR: a height only offered as HDR is taken', () => {
		expect(resolve(best('720'), HDR_FORMATS).media.videoFormatId).toBe('h720')
		const noSdr2160 = HDR_FORMATS.filter(f => f.formatId !== 's2160')
		expect(resolve(best('best'), noSdr2160).media.videoFormatId).toBe('h2160')
	})

	it('lets a profile override the app setting, and the order says where the choice came from', () => {
		const hdrProfile = best('1080', {hdr: {kind: 'custom', preference: 'hdr'}})
		const result = resolve(hdrProfile, HDR_FORMATS, {hdrPreference: 'sdr'})
		expect(result.media.videoFormatId).toBe('h1080')
		expect(result.order?.hdr).toEqual({preference: 'hdr', source: 'profile'})

		const sdrProfile = best('1080', {hdr: {kind: 'custom', preference: 'sdr'}})
		expect(resolve(sdrProfile, HDR_FORMATS, {hdrPreference: 'hdr'}).media.videoFormatId).toBe('s1080')
		expect(resolve(best('1080'), HDR_FORMATS, {hdrPreference: 'hdr'}).order?.hdr).toEqual({preference: 'hdr', source: 'settings'})
	})

	it('says the choice came from the screen when the app setting is Auto', () => {
		const result = resolve(best('1080'), HDR_FORMATS, {hdrPreference: {preference: 'hdr', source: 'display'}})
		expect(result.media.videoFormatId).toBe('h1080')
		expect(result.order?.hdr).toEqual({preference: 'hdr', source: 'display'})
	})

	it('Smart TV keeps taking H.264 first; SDR only breaks ties after it', () => {
		const smartTv = withMedia('balanced', {kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(resolve(smartTv, HDR_FORMATS).media.videoFormatId).toBe('s1080')
	})
})

import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {resolveProfileSelection, videoHeight} from '@shared/profileSelection.js'
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
	return resolveProfileSelection({profile, formats, subtitles: NO_SUBS, automaticCaptions: NO_SUBS, isAudioOnlySource: false, nativeAudioPreference: 'compatible', ...extra})
}

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

	it('audio best on a muxed-only source converts to mp3 at 192', () => {
		const formats = [video('18', '640x360', {isVideoOnly: false, ext: 'mp4'})]
		expect(resolve(builtin('audio-only'), formats).media.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
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

describe('resolveProfileSelection: parity with the profile path yt-dlp sort', () => {
	it('prefers the better codec at the same resolution and fps, like yt-dlp vcodec sorting', () => {
		const formats = [video('137', '1920x1080', {videoCodec: 'avc1.640028', ext: 'mp4', filesize: 900}), video('399', '1920x1080', {videoCodec: 'av01.0.08M.08', ext: 'mp4', filesize: 500}), audio('140')]
		expect(resolve(builtin('best-quality'), formats).media.videoFormatId).toBe('399')
		expect(resolve(builtin('hd-1080'), formats).media.videoFormatId).toBe('399')
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
		expect(smartTv?.video.map(rank => rank.kind)).toEqual(['h264', 'mp4-streams', 'resolution', 'fps', 'hdr', 'codec', 'size'])
		expect(resolve(builtin('balanced')).order?.audio).toEqual([{kind: 'native'}])
		expect(resolve(builtin('audio-only')).order).toBeNull()
		expect(resolve(builtin('subtitles-only')).order).toBeNull()
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

	it('Smart TV keeps taking H.264 first; SDR only breaks ties after it', () => {
		const smartTv = withMedia('balanced', {kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(resolve(smartTv, HDR_FORMATS).media.videoFormatId).toBe('s1080')
	})
})

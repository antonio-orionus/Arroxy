import type {FormatOption, PlaylistEntry, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, VideoProbeResult} from '@shared/types.js'
import type {AudioTrackQuality, YtDlpErrorKind} from '@shared/schemas.js'
import {isProbeSourceId, probeSourceResult} from '../probeSources/index.js'

interface ScenarioLike {
	id: string
}

interface ProbeUrlParams {
	playlistCount: number | null
	probeErrorKind: YtDlpErrorKind | null
}

export function shouldMockEmptyPlaylistScopeReload(scenario: ScenarioLike, playlistMode: ProbePlaylistMode | undefined, playlistScope: PlaylistScope | undefined): boolean {
	return scenario.id === 'playlist-scope-empty-reload' && playlistMode === 'playlist' && playlistScope !== undefined && playlistScope.items.kind !== 'app-limit'
}

export function buildProbeResult(scenario: ScenarioLike, params?: ProbeUrlParams): ProbeResult | null {
	if (params?.playlistCount !== null && params?.playlistCount !== undefined) {
		return playlistProbe(params.playlistCount)
	}
	switch (scenario.id) {
		case 'single-normal':
			return normalVideoProbe()
		case 'playlist-normal':
		case 'playlist-scope-empty-reload':
			return playlistProbe(12, {fullThumbnails: true})
		case 'playlist-no-thumbnails':
			return playlistProbe(100, {thumbnails: false})
		case 'playlist-long-titles':
			return playlistProbe(100, {longTitles: true})
		case 'playlist-nested':
			return nestedPlaylistProbe()
		case 'playlist-hydration':
			return bilibiliHydrationProbe()
		case 'probe-audio-only':
			return audioOnlyProbe()
		case 'probe-audio-multilingual':
			return audioMultilingualProbe()
		case 'probe-audio-surround':
			return audioSurroundProbe()
		case 'probe-audio-stereo':
			return audioStereoProbe()
		case 'probe-with-subtitles':
		case 'single-review-subtitles':
		case 'single-subtitles-kind':
			return videoWithSubtitlesProbe()
		case 'single-profile-misfit':
			return lowResVideoProbe()
		case 'single-codec-mix':
			return codecMixVideoProbe()
		case 'single-part':
			return partVideoProbe()
		case 'single-8k-hdr':
			return eightKHdrVideoProbe()
		case 'probe-no-formats':
			return noFormatsProbe()
		case 'probe-rate-limited':
			return normalVideoProbe({degraded: {reasons: ['rateLimit']}})
		case 'probe-live-stream':
			return liveStreamProbe()
		default: {
			const source = scenario.id.startsWith('source-') ? scenario.id.slice('source-'.length) : ''
			return isProbeSourceId(source) ? probeSourceResult(source) : null
		}
	}
}

const PROBE_ERROR_RAW: Partial<Record<YtDlpErrorKind, string>> = {
	botBlock: "ERROR: [youtube] x: Sign in to confirm you're not a bot. Use --cookies-from-browser ...",
	ipBlock: 'ERROR: [youtube] x: Unable to download webpage: HTTP Error 429: Too Many Requests',
	rateLimit: 'ERROR: unable to download video data: HTTP Error 429: Too Many Requests',
	ageRestricted: 'ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm your age.',
	unavailable: 'ERROR: [youtube] dQw4w9WgXcQ: Video unavailable.',
	geoBlocked: 'ERROR: [youtube] dQw4w9WgXcQ: The uploader has not made this video available in your country.',
	drmProtected: 'ERROR: [youtube] dQw4w9WgXcQ: This video is DRM-protected.',
	loginRequired: 'ERROR: [youtube] dQw4w9WgXcQ: This video is only available to registered users.',
	outOfDiskSpace: 'ERROR: [Errno 28] No space left on device',
	chunkTransferFailure: 'ERROR: unable to download video data: <urlopen error [Errno 104] Connection reset by peer>',
	postprocessFailure: 'ERROR: ffmpeg exited with code 1',
	unsupportedUrl: 'ERROR: Unsupported URL: https://example.com/unsupported',
	parse: 'ERROR: Unable to extract video data',
	network: 'ERROR: unable to download video data: <urlopen error [Errno -2] Name or service not known>',
	unknown: 'ERROR: Something went wrong (unknown error)'
}

export function buildProbeErrorForKind(kind: YtDlpErrorKind): ProbeError {
	const raw = PROBE_ERROR_RAW[kind] ?? `ERROR: ${kind} error (mock)`
	return {kind: 'ytdlp', error: {kind, raw}}
}

const NORMAL_VIDEO_FORMATS = [
	{formatId: '313', label: '2160p | webm | 30fps | 2.2 GB', ext: 'webm', resolution: '2160p', fps: 30, filesize: 2_400_000_000, videoCodec: 'vp09.00.51.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '271', label: '1440p | webm | 30fps | 906.2 MB', ext: 'webm', resolution: '1440p', fps: 30, filesize: 950_000_000, videoCodec: 'vp09.00.40.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
	{formatId: '248', label: '1080p | webm | 30fps | 400.5 MB', ext: 'webm', resolution: '1080p', fps: 30, filesize: 420_000_000, videoCodec: 'vp09.00.40.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, videoCodec: 'avc1.4d401f', isVideoOnly: true, isAudioOnly: false},
	{formatId: '247', label: '720p | webm | 30fps | 171.7 MB', ext: 'webm', resolution: '720p', fps: 30, filesize: 180_000_000, videoCodec: 'vp09.00.31.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '135', label: '480p | mp4 | 30fps | 104.9 MB', ext: 'mp4', resolution: '480p', fps: 30, filesize: 110_000_000, videoCodec: 'avc1.4d401e', isVideoOnly: true, isAudioOnly: false},
	{formatId: '134', label: '360p | mp4 | 30fps | 62.0 MB', ext: 'mp4', resolution: '360p', fps: 30, filesize: 65_000_000, videoCodec: 'avc1.4d401e', isVideoOnly: true, isAudioOnly: false},
	{formatId: '251', label: 'webm · Opus · 132 kbps · 5.0 MB', ext: 'webm', resolution: 'audio only', abr: 132, filesize: 5_200_000, audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true},
	{formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, filesize: 5_000_000, audioCodec: 'mp4a.40.2', isVideoOnly: false, isAudioOnly: true},
	{formatId: '249', label: 'webm · Opus · 50 kbps · 2.0 MB', ext: 'webm', resolution: 'audio only', abr: 50, filesize: 2_000_000, audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true},
	{formatId: '139', label: 'm4a · AAC · 48 kbps · 1.8 MB', ext: 'm4a', resolution: 'audio only', abr: 48, filesize: 1_900_000, audioCodec: 'mp4a.40.5', isVideoOnly: false, isAudioOnly: true}
] as const

// A full-range ladder for the format-step screenshots: SDR and HDR10 side by side
// at the top resolutions, SDR only below, so both range columns have content.
const SHOWCASE_VIDEO_FORMATS: readonly FormatOption[] = [
	{formatId: '313', label: '2160p | webm | VP9', ext: 'webm', resolution: '2160p', fps: 30, filesize: 2_400_000_000, videoCodec: 'vp09.00.51.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '701', label: '2160p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '2160p', fps: 30, dynamicRange: 'HDR10', filesize: 1_100_000_000, videoCodec: 'av01.0.12M.10', isVideoOnly: true, isAudioOnly: false},
	{formatId: '271', label: '1440p | webm | VP9', ext: 'webm', resolution: '1440p', fps: 30, filesize: 950_000_000, videoCodec: 'vp09.00.40.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '700', label: '1440p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '1440p', fps: 30, dynamicRange: 'HDR10', filesize: 668_500_000, videoCodec: 'av01.0.12M.10', isVideoOnly: true, isAudioOnly: false},
	{formatId: '137', label: '1080p | mp4 | H.264', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
	{formatId: '699', label: '1080p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '1080p', fps: 30, dynamicRange: 'HDR10', filesize: 235_900_000, videoCodec: 'av01.0.09M.10', isVideoOnly: true, isAudioOnly: false},
	{formatId: '247', label: '720p | webm | VP9', ext: 'webm', resolution: '720p', fps: 30, filesize: 180_000_000, videoCodec: 'vp09.00.31.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '698', label: '720p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '720p', fps: 30, dynamicRange: 'HDR10', filesize: 120_000_000, videoCodec: 'av01.0.08M.10', isVideoOnly: true, isAudioOnly: false},
	{formatId: '135', label: '480p | mp4 | H.264', ext: 'mp4', resolution: '480p', fps: 30, filesize: 110_000_000, videoCodec: 'avc1.4d401e', isVideoOnly: true, isAudioOnly: false},
	{formatId: '134', label: '360p | mp4 | H.264', ext: 'mp4', resolution: '360p', fps: 30, filesize: 65_000_000, videoCodec: 'avc1.4d401e', isVideoOnly: true, isAudioOnly: false}
]

// Dolby 5.1 next to the usual stereo streams.
const SHOWCASE_SURROUND_AUDIO_FORMATS: readonly FormatOption[] = [
	{formatId: '328', label: 'm4a · ec-3 · 6ch · 384 kbps · 49.2 MB', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ec-3', audioChannels: 6, audioTrackQuality: 'high', filesize: 49_200_000, isVideoOnly: false, isAudioOnly: true},
	{formatId: '380', label: 'm4a · ac-3 · 6ch · 384 kbps · 49.2 MB', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ac-3', audioChannels: 6, audioTrackQuality: 'high', filesize: 49_200_000, isVideoOnly: false, isAudioOnly: true},
	{formatId: '140-drc', label: 'm4a · AAC · DRC · 129 kbps · 16.6 MB', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', isDrc: true, audioTrackQuality: 'medium', filesize: 16_600_000, isVideoOnly: false, isAudioOnly: true},
	{formatId: '140', label: 'm4a · AAC · 129 kbps · 16.6 MB', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', audioTrackQuality: 'medium', filesize: 16_600_000, isVideoOnly: false, isAudioOnly: true},
	{formatId: '251', label: 'webm · Opus · 122 kbps · 15.6 MB', ext: 'webm', resolution: 'audio only', abr: 122, audioCodec: 'opus', audioTrackQuality: 'medium', filesize: 15_600_000, isVideoOnly: false, isAudioOnly: true}
]

interface SpokenTrack {
	id: string
	code: string
	label: string
}

// The dubbed languages after the original, in the order a YouTube video lists them.
const SHOWCASE_DUBS: readonly SpokenTrack[] = [
	{id: '2', code: 'es', label: 'Spanish (Latin America)'},
	{id: '3', code: 'fr', label: 'French'},
	{id: '4', code: 'de', label: 'German'},
	{id: '5', code: 'ja', label: 'Japanese'},
	{id: '6', code: 'pt', label: 'Portuguese (Brazil)'},
	{id: '7', code: 'hi', label: 'Hindi'}
]

function spokenTrackFormats(track: SpokenTrack): FormatOption[] {
	const common = {resolution: 'audio only', audioLanguage: track.code, audioTrackLabel: track.label, isVideoOnly: false, isAudioOnly: true} as const
	return [
		{...common, formatId: `140-${track.id}`, label: `${track.label} · m4a · AAC · 130 kbps · 16.6 MB`, ext: 'm4a', abr: 130, audioCodec: 'mp4a.40.2', audioTrackQuality: 'medium' satisfies AudioTrackQuality, filesize: 16_600_000},
		{...common, formatId: `249-${track.id}`, label: `${track.label} · webm · Opus · 69 kbps · 8.8 MB`, ext: 'webm', abr: 69, audioCodec: 'opus', audioTrackQuality: 'low' satisfies AudioTrackQuality, filesize: 8_800_000}
	]
}

export function normalVideoProbe(options: {webpageUrl?: string; degraded?: VideoProbeResult['degraded']} = {}): VideoProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: options.webpageUrl ?? 'https://www.youtube.com/watch?v=mock-normal',
		isAudioOnlySource: false,
		isLive: false,
		hasDrm: false,
		duration: 60 * 60 * 24,
		title: 'Mock Video - Lo-fi Hip Hop Radio 24/7',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		...(options.degraded ? {degraded: options.degraded} : {}),
		formats: [...NORMAL_VIDEO_FORMATS],
		subtitles: {en: [{ext: 'vtt', name: 'English'}], es: [{ext: 'vtt', name: 'Espanol'}]},
		automaticCaptions: {'en-orig': [{ext: 'vtt', name: 'English (auto)'}]}
	}
}

// A 25-minute talk with chapters, for the Part of video panel.
function partVideoProbe(): VideoProbeResult {
	const chapters = [
		{title: 'Intro', startSeconds: 0, endSeconds: 95},
		{title: 'Why clips matter', startSeconds: 95, endSeconds: 352},
		{title: 'Keyframes and exact cuts', startSeconds: 352, endSeconds: 760},
		{title: 'Live demo', startSeconds: 760, endSeconds: 1240},
		{title: '', startSeconds: 1240, endSeconds: 1415},
		{title: 'Questions', startSeconds: 1415, endSeconds: 1502}
	]
	return {...normalVideoProbe({webpageUrl: 'https://www.youtube.com/watch?v=mock-part'}), duration: 1502, title: 'Mock Talk - Cutting video without re-encoding', chapters, formats: [...SHOWCASE_VIDEO_FORMATS, ...SHOWCASE_SURROUND_AUDIO_FORMATS]}
}

// An 8K HDR upload at 60 fps the way YouTube lists it: AV1 up to 4320p, VP9 up to
// 2160p, both in HDR10 and SDR, H.264 up to 1080p, and 30 fps below 720p.
function eightKHdrVideoProbe(): VideoProbeResult {
	const video = (formatId: string, height: number, codec: 'AV1' | 'VP9' | 'H.264', range: 'HDR10' | null, filesize: number): FormatOption => {
		const width = Math.round((height * 16) / 9)
		const fps = height >= 720 ? 60 : 30
		const videoCodec = codec === 'AV1' ? (range ? 'av01.0.17M.10' : 'av01.0.17M.08') : codec === 'VP9' ? (range ? 'vp09.02.51.10' : 'vp09.00.51.08') : 'avc1.64002a'
		const ext = codec === 'VP9' ? 'webm' : 'mp4'
		return {formatId, label: [`${height}p${fps}`, ext, codec, range].filter(Boolean).join(' | '), ext, resolution: `${width}x${height}`, width, height, fps, ...(range ? {dynamicRange: range} : {}), videoCodec, filesize, isVideoOnly: true, isAudioOnly: false}
	}
	return {
		...normalVideoProbe({webpageUrl: 'https://www.youtube.com/watch?v=mock-8k-hdr'}),
		duration: 312,
		// Not a "Mock" title, so showcase screenshots keep it: the chips leave 60 fps unsaid, since nearly every stream has it.
		title: 'Coral Reef Life in 8K HDR 60fps',
		formats: [
			video('702', 4320, 'AV1', 'HDR10', 2_050_000_000),
			video('571', 4320, 'AV1', null, 1_720_000_000),
			video('701', 2160, 'AV1', 'HDR10', 820_000_000),
			video('337', 2160, 'VP9', 'HDR10', 1_090_000_000),
			video('401', 2160, 'AV1', null, 700_000_000),
			video('315', 2160, 'VP9', null, 950_000_000),
			video('700', 1440, 'AV1', 'HDR10', 420_000_000),
			video('336', 1440, 'VP9', 'HDR10', 560_000_000),
			video('400', 1440, 'AV1', null, 360_000_000),
			video('308', 1440, 'VP9', null, 480_000_000),
			video('699', 1080, 'AV1', 'HDR10', 210_000_000),
			video('335', 1080, 'VP9', 'HDR10', 280_000_000),
			video('399', 1080, 'AV1', null, 180_000_000),
			video('303', 1080, 'VP9', null, 240_000_000),
			video('299', 1080, 'H.264', null, 310_000_000),
			video('698', 720, 'AV1', 'HDR10', 110_000_000),
			video('334', 720, 'VP9', 'HDR10', 150_000_000),
			video('398', 720, 'AV1', null, 95_000_000),
			video('302', 720, 'VP9', null, 125_000_000),
			video('298', 720, 'H.264', null, 160_000_000),
			video('397', 480, 'AV1', null, 40_000_000),
			video('244', 480, 'VP9', null, 50_000_000),
			video('135', 480, 'H.264', null, 62_000_000),
			...SHOWCASE_SURROUND_AUDIO_FORMATS
		]
	}
}

function audioOnlyProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'soundcloud',
		extractorKey: 'SoundCloud',
		webpageUrl: 'https://soundcloud.com/mock/track',
		isAudioOnlySource: true,
		isLive: false,
		hasDrm: false,
		duration: 214,
		title: 'Mock SoundCloud Track - audio-only source',
		thumbnail: 'https://i1.sndcdn.com/artworks-mock.jpg',
		subtitles: {},
		automaticCaptions: {},
		formats: [
			{formatId: 'http_mp3-128', label: 'mp3 · 128 kbps · 3.4 MB', ext: 'mp3', resolution: 'audio only', abr: 128, filesize: 3_500_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: 'http_opus-64', label: 'opus · 64 kbps · 1.7 MB', ext: 'opus', resolution: 'audio only', abr: 64, filesize: 1_700_000, isVideoOnly: false, isAudioOnly: true}
		]
	}
}

function audioMultilingualProbe(): ProbeResult {
	return {
		...normalVideoProbe({webpageUrl: 'https://www.youtube.com/watch?v=mock-audio-multilingual'}),
		title: 'Mock Video - Multilingual Audio Tracks',
		formats: [
			...SHOWCASE_VIDEO_FORMATS,
			// The original track also comes in Dolby 5.1, as on a dubbed YouTube trailer; the dubs are stereo only.
			{
				formatId: '328-1',
				label: 'English original (default) · m4a · ec-3 · 6ch · 384 kbps · 49.2 MB',
				ext: 'm4a',
				resolution: 'audio only',
				abr: 384,
				audioCodec: 'ec-3',
				audioChannels: 6,
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				audioTrackQuality: 'high',
				isDefaultAudio: true,
				isOriginalAudio: true,
				filesize: 49_200_000,
				isVideoOnly: false,
				isAudioOnly: true
			},
			{
				formatId: '140-1',
				label: 'English original (default) · m4a · AAC · 130 kbps · 16.6 MB',
				ext: 'm4a',
				resolution: 'audio only',
				abr: 130,
				audioCodec: 'mp4a.40.2',
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				audioTrackQuality: 'medium',
				isDefaultAudio: true,
				isOriginalAudio: true,
				filesize: 16_600_000,
				isVideoOnly: false,
				isAudioOnly: true
			},
			{
				formatId: '140-1-drc',
				label: 'English original (default) · m4a · AAC · DRC · 130 kbps · 16.6 MB',
				ext: 'm4a',
				resolution: 'audio only',
				abr: 130,
				audioCodec: 'mp4a.40.2',
				isDrc: true,
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				audioTrackQuality: 'medium',
				isDefaultAudio: true,
				isOriginalAudio: true,
				filesize: 16_600_000,
				isVideoOnly: false,
				isAudioOnly: true
			},
			{
				formatId: '251-1',
				label: 'English original (default) · webm · Opus · 122 kbps · 15.6 MB',
				ext: 'webm',
				resolution: 'audio only',
				abr: 122,
				audioCodec: 'opus',
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				audioTrackQuality: 'medium',
				isDefaultAudio: true,
				isOriginalAudio: true,
				filesize: 15_600_000,
				isVideoOnly: false,
				isAudioOnly: true
			},
			...SHOWCASE_DUBS.flatMap(spokenTrackFormats)
		]
	}
}

function audioSurroundProbe(): ProbeResult {
	return {...normalVideoProbe({webpageUrl: 'https://www.youtube.com/watch?v=mock-audio-surround'}), title: 'Mock Video - Surround Audio Available', formats: [...SHOWCASE_VIDEO_FORMATS, ...SHOWCASE_SURROUND_AUDIO_FORMATS]}
}

function audioStereoProbe(): ProbeResult {
	return {
		...normalVideoProbe({webpageUrl: 'https://www.youtube.com/watch?v=mock-audio-stereo'}),
		title: 'Mock Video - Stereo Audio Only',
		formats: [
			{formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', audioTrackQuality: 'medium', filesize: 5_000_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '251', label: 'webm · Opus · 122 kbps · 4.6 MB', ext: 'webm', resolution: 'audio only', abr: 122, audioCodec: 'opus', audioTrackQuality: 'medium', filesize: 4_800_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '139', label: 'm4a · AAC · 49 kbps · 1.8 MB', ext: 'm4a', resolution: 'audio only', abr: 49, audioCodec: 'mp4a.40.5', audioTrackQuality: 'low', filesize: 1_900_000, isVideoOnly: false, isAudioOnly: true}
		]
	}
}

function videoWithSubtitlesProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: 'https://www.youtube.com/watch?v=subtitles',
		isAudioOnlySource: false,
		isLive: false,
		hasDrm: false,
		duration: 1845,
		title: 'Mock Video - Multi-Language Subtitles',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		// Named as yt-dlp names YouTube's tracks. Of the automatic captions only the
		// original-language one survives the probe's cleanup, so only it is listed.
		subtitles: {
			en: [{ext: 'vtt', name: 'English'}],
			es: [{ext: 'vtt', name: 'Spanish'}],
			fr: [{ext: 'vtt', name: 'French'}],
			de: [{ext: 'vtt', name: 'German'}],
			'pt-BR': [{ext: 'vtt', name: 'Portuguese (Brazil)'}],
			ja: [{ext: 'vtt', name: 'Japanese'}],
			ko: [{ext: 'vtt', name: 'Korean'}],
			'zh-Hans': [{ext: 'vtt', name: 'Chinese (Simplified)'}],
			ar: [{ext: 'vtt', name: 'Arabic'}]
		},
		automaticCaptions: {'en-orig': [{ext: 'vtt', name: 'English (Original)'}]},
		formats: [...SHOWCASE_VIDEO_FORMATS, ...SHOWCASE_SURROUND_AUDIO_FORMATS]
	}
}

// An old upload: nothing above 480p and no subtitles, so a Full HD profile with
// English subtitles can't be honoured and the Format screen says so.
function lowResVideoProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: 'https://www.youtube.com/watch?v=lowres',
		isAudioOnlySource: false,
		isLive: false,
		hasDrm: false,
		duration: 291,
		title: 'Mock Video - Live at the Old Harbour, 2009',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		subtitles: {},
		automaticCaptions: {},
		formats: [
			{formatId: '135', label: '480p | mp4 | 30fps', ext: 'mp4', resolution: '854x480', fps: 30, videoCodec: 'avc1.4d401e', filesize: 38_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '134', label: '360p | mp4 | 30fps', ext: 'mp4', resolution: '640x360', fps: 30, videoCodec: 'avc1.4d401e', filesize: 22_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '140', label: 'm4a · AAC · 128 kbps', ext: 'm4a', resolution: 'audio only', abr: 128, audioCodec: 'mp4a.40.2', filesize: 4_400_000, isVideoOnly: false, isAudioOnly: true}
		]
	}
}

// A 4K HDR upload the way YouTube lists it: the same height offered as AV1 in
// MP4 and as VP9 in WebM, HDR and SDR side by side, and Opus and AAC audio with
// and without DRC. Shows the codec in each row, the Profile tip and Saves as.
function codecMixVideoProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: 'https://www.youtube.com/watch?v=codecmix',
		isAudioOnlySource: false,
		isLive: false,
		hasDrm: false,
		duration: 352,
		title: 'Mock Video - 4K HDR Demo (AV1, VP9 and H.264)',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		subtitles: {},
		automaticCaptions: {},
		formats: [
			{formatId: '701', label: '2160p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '3840x2160', fps: 60, dynamicRange: 'HDR10', videoCodec: 'av01.0.12M.10', filesize: 1_100_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '315', label: '2160p | webm | VP9', ext: 'webm', resolution: '3840x2160', fps: 60, videoCodec: 'vp09.00.51.08', filesize: 545_400_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '700', label: '1440p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '2560x1440', fps: 60, dynamicRange: 'HDR10', videoCodec: 'av01.0.12M.10', filesize: 668_500_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '308', label: '1440p | webm | VP9', ext: 'webm', resolution: '2560x1440', fps: 60, videoCodec: 'vp09.00.40.08', filesize: 280_400_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '699', label: '1080p | mp4 | AV1 | HDR10', ext: 'mp4', resolution: '1920x1080', fps: 60, dynamicRange: 'HDR10', videoCodec: 'av01.0.09M.10', filesize: 235_900_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '299', label: '1080p | mp4 | H.264', ext: 'mp4', resolution: '1920x1080', fps: 60, videoCodec: 'avc1.64002a', filesize: 150_800_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '298', label: '720p | mp4 | H.264', ext: 'mp4', resolution: '1280x720', fps: 60, videoCodec: 'avc1.4d4020', filesize: 86_900_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '135', label: '480p | mp4 | H.264', ext: 'mp4', resolution: '854x480', fps: 30, videoCodec: 'avc1.4d401e', filesize: 31_400_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '251-drc', label: 'webm · Opus · DRC · 134 kbps · 5.6 MB', ext: 'webm', resolution: 'audio only', abr: 134, audioCodec: 'opus', isDrc: true, audioTrackQuality: 'high', filesize: 5_600_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '251', label: 'webm · Opus · 134 kbps · 5.6 MB', ext: 'webm', resolution: 'audio only', abr: 134, audioCodec: 'opus', audioTrackQuality: 'high', filesize: 5_600_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140-drc', label: 'm4a · AAC · DRC · 129 kbps · 5.4 MB', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', isDrc: true, audioTrackQuality: 'medium', filesize: 5_400_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140', label: 'm4a · AAC · 129 kbps · 5.4 MB', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', audioTrackQuality: 'medium', filesize: 5_400_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '249', label: 'webm · Opus · 68 kbps · 2.9 MB', ext: 'webm', resolution: 'audio only', abr: 68, audioCodec: 'opus', audioTrackQuality: 'low', filesize: 2_900_000, isVideoOnly: false, isAudioOnly: true}
		]
	}
}

function noFormatsProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: 'https://www.youtube.com/watch?v=noformats',
		isAudioOnlySource: false,
		isLive: false,
		hasDrm: false,
		duration: 300,
		title: 'Mock Video - No Formats Available',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		subtitles: {},
		automaticCaptions: {},
		formats: []
	}
}

function liveStreamProbe(): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: 'https://www.youtube.com/watch?v=livestream',
		isAudioOnlySource: false,
		isLive: true,
		hasDrm: false,
		title: 'Mock Live Stream - 24/7 Radio',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
		subtitles: {},
		automaticCaptions: {},
		formats: [
			{formatId: '95', label: '1080p | mp4 | HLS', ext: 'mp4', resolution: '1080p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false},
			{formatId: '94', label: '720p | mp4 | HLS', ext: 'mp4', resolution: '720p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false},
			{formatId: '92', label: '480p | mp4 | HLS', ext: 'mp4', resolution: '480p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false}
		]
	}
}

// A result whose rows are themselves playlists/channels/albums — what a channel's
// Playlists tab or a YouTube Music shelf returns. Kept visible so the picker
// isn't empty, but not downloadable: the URL addresses a whole set while a queue
// item carries one filename. Mixed with real videos so both states are on screen.
function nestedPlaylistProbe(): ProbeResult {
	const base = playlistProbe(3) as Extract<ProbeResult, {kind: 'playlist'}>
	const containers: PlaylistEntry[] = [
		{id: 'nested1', url: 'https://www.youtube.com/playlist?list=PLmockGreatestHits', title: 'Greatest Hits (1998-2012)', thumbnail: '', playlistIndex: 4, videoId: 'VLPLmockGreatestHits', isContainer: true},
		{id: 'nested2', url: 'https://music.youtube.com/browse/MPREb_mockalbum', title: 'Some Album', thumbnail: '', playlistIndex: 5, videoId: 'MPREb_mockalbum', isContainer: true},
		{id: 'nested3', url: 'https://www.youtube.com/channel/UCmockchannelidaaaaaaaa', title: 'Channel · UCmockchannelidaaaaaaaa', thumbnail: '', playlistIndex: 6, videoId: 'UCmockchannelidaaaaaaaa', isContainer: true}
	]
	return {...base, playlistTitle: 'Mock Channel Playlists Tab', entries: [...base.entries, ...containers]}
}

export function playlistProbe(count: number, options: {thumbnails?: boolean; fullThumbnails?: boolean; longTitles?: boolean; webpageUrl?: string} = {}): ProbeResult {
	const entries: PlaylistEntry[] = Array.from({length: count}, (_, i) => {
		const number = i + 1
		const title = options.longTitles
			? `Mock playlist item ${number} - an intentionally long title with extra metadata, brackets, episode numbers, and enough words to pressure every row layout`
			: `Mock playlist item ${number} - ${i % 3 === 0 ? 'a longer title that should ellipsize gracefully when the row is narrow' : 'short title'}`
		return {id: `mock${number}`, url: `https://www.youtube.com/watch?v=mock${number}`, title, thumbnail: options.thumbnails === false ? '' : options.fullThumbnails === true || i % 5 !== 0 ? 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg' : '', duration: 90 + i * 47, playlistIndex: number, videoId: `mockid${number}`}
	})

	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: options.webpageUrl ?? 'https://example.com/mock-playlist', isAudioOnlySource: false, isMultiVideo: false, playlistId: 'PLmock_browser', playlistTitle: 'Mock Browser Playlist', entries}
}

// Bilibili-style series for the playlist-hydration scenario. Flat entries
// carry no title/id/dates — exactly what yt-dlp --flat-playlist yields for
// Bilibili series — so the picker hydrates every row in the background.
// Upload instants are deliberately shuffled against API order (p1 and p4 even
// share a calendar day) so the upload-date sort visibly reorders rows.
const BILIBILI_HYDRATION_BVID = 'BV1mockhydration'

const epochSeconds = (month: number, day: number, hour: number, minute: number): number => Math.floor(Date.UTC(2026, month - 1, day, hour, minute) / 1000)

const BILIBILI_HYDRATION_PARTS: Record<number, {title: string; uploadDate: string; timestamp: number; duration: number}> = {
	1: {title: 'Mock合集 p01 春物语 OP', uploadDate: '20260803', timestamp: epochSeconds(8, 3, 10, 0), duration: 91},
	2: {title: 'Mock合集 p02 夏夜祭典', uploadDate: '20260801', timestamp: epochSeconds(8, 1, 22, 15), duration: 98},
	3: {title: 'Mock合集 p03 秋风物语', uploadDate: '20260730', timestamp: epochSeconds(7, 30, 8, 0), duration: 134},
	4: {title: 'Mock合集 p04 冬之终章', uploadDate: '20260803', timestamp: epochSeconds(8, 3, 14, 30), duration: 187},
	6: {title: 'Mock合集 p06 番外篇', uploadDate: '20260802', timestamp: epochSeconds(8, 2, 9, 45), duration: 246},
	8: {title: 'Mock合集 p08 完结纪念', uploadDate: '20260804', timestamp: epochSeconds(8, 4, 0, 5), duration: 305}
}

function bilibiliHydrationProbe(): ProbeResult {
	const entries: PlaylistEntry[] = Array.from({length: 8}, (_, i) => {
		const part = i + 1
		const url = `https://www.bilibili.com/video/${BILIBILI_HYDRATION_BVID}?p=${part}`
		return {id: `${part}::${url}`, url, title: `Untitled · #${part}`, thumbnail: '', playlistIndex: part, videoId: null, titleIsPlaceholder: true as const}
	})
	return {kind: 'playlist', extractor: 'bilibili', extractorKey: 'BiliBili', webpageUrl: `https://www.bilibili.com/video/${BILIBILI_HYDRATION_BVID}`, isAudioOnlySource: false, isMultiVideo: false, playlistId: BILIBILI_HYDRATION_BVID, playlistTitle: 'Mock UP主的系列合集', entries}
}

// Per-item hydration data for the scenario above. Returns null for p5 to
// simulate a hydration failure, and dateless data for p7 so the sort-last
// path renders. Returns null for foreign URLs so the mock only answers its own.
export function bilibiliHydrationVideo(url: string): VideoProbeResult | null {
	let part: number | null = null
	try {
		const parsed = new URL(url)
		if (parsed.hostname.replace(/^www\./, '') !== 'bilibili.com') return null
		const bvid = parsed.pathname.split('/').filter(Boolean).pop() ?? ''
		if (bvid !== BILIBILI_HYDRATION_BVID) return null
		const raw = Number(parsed.searchParams.get('p'))
		part = Number.isInteger(raw) && raw >= 1 && raw <= 8 ? raw : null
	} catch {
		return null
	}
	if (part === null || part === 5) return null
	if (part === 7) {
		return {...normalVideoProbe({webpageUrl: url}), extractor: 'bilibili', extractorKey: 'BiliBili', title: 'Mock合集 p07 未知日期特辑', thumbnail: `https://picsum.photos/seed/bilihydration-p7/160/90`, duration: 172, videoId: `${BILIBILI_HYDRATION_BVID}_p7`, uploader: 'Mock UP主', subtitles: {}, automaticCaptions: {}}
	}
	const datum = BILIBILI_HYDRATION_PARTS[part]
	if (!datum) return null
	return {
		...normalVideoProbe({webpageUrl: url}),
		extractor: 'bilibili',
		extractorKey: 'BiliBili',
		title: datum.title,
		thumbnail: `https://picsum.photos/seed/bilihydration-p${part}/160/90`,
		duration: datum.duration,
		videoId: `${BILIBILI_HYDRATION_BVID}_p${part}`,
		uploader: 'Mock UP主',
		uploadDate: datum.uploadDate,
		timestamp: datum.timestamp,
		subtitles: {},
		automaticCaptions: {}
	}
}

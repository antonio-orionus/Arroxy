import type {ProbeResult} from '@shared/types.js'

// The fixed answer of a mock-backend probe: a YouTube video with three formats and a few subtitle tracks.
export function buildMockProbeResult(url: string): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: url,
		isAudioOnlySource: false,
		formats: [
			{formatId: '137', label: '1080p | mp4 | 30fps', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false},
			{formatId: '18', label: '360p | mp4 | 30fps', ext: 'mp4', resolution: '360p', fps: 30, filesize: 150_000_000, isVideoOnly: false, isAudioOnly: false}
		],
		title: 'Mock Video Title',
		thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
		duration: 212,
		subtitles: {en: [{ext: 'vtt', name: 'English'}], es: [{ext: 'vtt'}]},
		automaticCaptions: {de: [{ext: 'vtt'}], ja: [{ext: 'vtt', name: '日本語'}]},
		isLive: false,
		hasDrm: false
	}
}

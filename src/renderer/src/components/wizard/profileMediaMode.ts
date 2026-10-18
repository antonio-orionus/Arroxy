import type {DownloadProfileMediaMode} from '../../store/wizard/downloadProfileDraft.js'

// Whether a download type includes a video stream, which is what the Video
// panel and SponsorBlock apply to.
export function mediaModeHasVideo(mediaMode: DownloadProfileMediaMode): boolean {
	return mediaMode === 'video-audio' || mediaMode === 'video-only'
}

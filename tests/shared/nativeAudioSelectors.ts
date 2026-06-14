const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"

const COMPATIBLE_BEST_AUDIO_SELECTOR = `bestaudio[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']${NON_DRC_AUDIO_FILTERS}/bestaudio`
export const COMPATIBLE_AUDIO_ONLY_SELECTOR = `${COMPATIBLE_BEST_AUDIO_SELECTOR}/best`
export const COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR = pairWithCompatibleNativeAudio('bestvideo*', 'bestvideo*+bestaudio/best')
export const COMPATIBLE_MP4_VIDEO_AUDIO_SELECTOR = pairWithCompatibleNativeAudio('bestvideo', 'bestvideo+bestaudio/best[ext=mp4]/best')

function pairWithCompatibleNativeAudio(videoSelector: string, fallback: string): string {
	return COMPATIBLE_BEST_AUDIO_SELECTOR.split('/')
		.map(audioSelector => `${videoSelector}+${audioSelector}`)
		.concat(fallback)
		.join('/')
}

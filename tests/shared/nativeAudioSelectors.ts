const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_CODEC_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
const SOURCE_DEFAULT_AUDIO_FILTER = '[language_preference>0]'
const SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~=?'(?i)\\boriginal\\b']"

function sourcePreferredAudioWith(...filters: string[]): string[] {
	return [SOURCE_DEFAULT_AUDIO_FILTER, SOURCE_ORIGINAL_AUDIO_FILTER].map(sourceFilter => `bestaudio${sourceFilter}${filters.join('')}`)
}

const COMPATIBLE_BEST_AUDIO_SELECTOR = [
	`bestaudio${SOURCE_DEFAULT_AUDIO_FILTER}${COMPATIBLE_AUDIO_CODEC_FILTER}${NON_DRC_AUDIO_FILTERS}`,
	`bestaudio${SOURCE_ORIGINAL_AUDIO_FILTER}${COMPATIBLE_AUDIO_CODEC_FILTER}${NON_DRC_AUDIO_FILTERS}`,
	`bestaudio${SOURCE_DEFAULT_AUDIO_FILTER}${COMPATIBLE_AUDIO_CODEC_FILTER}`,
	`bestaudio${SOURCE_ORIGINAL_AUDIO_FILTER}${COMPATIBLE_AUDIO_CODEC_FILTER}`,
	`bestaudio${SOURCE_DEFAULT_AUDIO_FILTER}${NON_DRC_AUDIO_FILTERS}`,
	`bestaudio${SOURCE_ORIGINAL_AUDIO_FILTER}${NON_DRC_AUDIO_FILTERS}`,
	`bestaudio${SOURCE_DEFAULT_AUDIO_FILTER}`,
	`bestaudio${SOURCE_ORIGINAL_AUDIO_FILTER}`,
	`bestaudio${COMPATIBLE_AUDIO_CODEC_FILTER}${NON_DRC_AUDIO_FILTERS}`,
	`bestaudio${COMPATIBLE_AUDIO_CODEC_FILTER}`,
	`bestaudio${NON_DRC_AUDIO_FILTERS}`,
	'bestaudio'
].join('/')
export const COMPATIBLE_AUDIO_ONLY_SELECTOR = `${COMPATIBLE_BEST_AUDIO_SELECTOR}/best`
export const COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR = pairWithCompatibleNativeAudio('bestvideo*', 'bestvideo*+bestaudio/best')
export const COMPATIBLE_MP4_VIDEO_AUDIO_SELECTOR = pairWithCompatibleNativeAudio('bestvideo', 'bestvideo+bestaudio/best[ext=mp4]/best')
export const SOURCE_PREFERRED_BEST_AUDIO_SELECTOR = [...sourcePreferredAudioWith(NON_DRC_AUDIO_FILTERS), ...sourcePreferredAudioWith(), `bestaudio${NON_DRC_AUDIO_FILTERS}`, 'bestaudio', 'best'].join('/')

function pairWithCompatibleNativeAudio(videoSelector: string, fallback: string): string {
	return COMPATIBLE_BEST_AUDIO_SELECTOR.split('/')
		.map(audioSelector => `${videoSelector}+${audioSelector}`)
		.concat(fallback)
		.join('/')
}

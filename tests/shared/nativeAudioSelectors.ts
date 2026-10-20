const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_CODEC_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
const SOURCE_DEFAULT_AUDIO_FILTER = '[language_preference>0]'
const SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~='(?i)\\boriginal\\b']"
// yt-dlp-bridge's conversion selector (packages/yt-dlp-bridge) still writes the
// "original" filter with `?`, which also matches a stream with no note.
const BRIDGE_SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~=?'(?i)\\boriginal\\b']"

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
function bridgeSourcePreferredAudioWith(...filters: string[]): string[] {
	return [SOURCE_DEFAULT_AUDIO_FILTER, BRIDGE_SOURCE_ORIGINAL_AUDIO_FILTER].map(sourceFilter => `bestaudio${sourceFilter}${filters.join('')}`)
}
export const SOURCE_PREFERRED_BEST_AUDIO_SELECTOR = [...bridgeSourcePreferredAudioWith(NON_DRC_AUDIO_FILTERS), ...bridgeSourcePreferredAudioWith(), `bestaudio${NON_DRC_AUDIO_FILTERS}`, 'bestaudio', 'best'].join('/')

function pairWithCompatibleNativeAudio(videoSelector: string, fallback: string): string {
	return COMPATIBLE_BEST_AUDIO_SELECTOR.split('/')
		.map(audioSelector => `${videoSelector}+${audioSelector}`)
		.concat(fallback)
		.join('/')
}

// A profile skips AI-upscaled streams ("-sr") by default: the selector tries
// every video alternative without them first, then the plain selector.
export function skippingAiUpscaled(selector: string): string {
	return `${selector.replaceAll(/bestvideo(\*?)/g, 'bestvideo$1[format_id!$=-sr]')}/${selector}`
}

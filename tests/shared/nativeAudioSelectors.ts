const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_CODEC_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
const SOURCE_DEFAULT_AUDIO_FILTER = '[language_preference>0]'
const SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~='(?i)\\boriginal\\b']"

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

// The bridge's conversion source: the target codec's stream (copied, not
// re-encoded) first, per track and DRC tier.
const CONVERSION_CODEC_FILTERS: Readonly<Record<string, string>> = {mp3: "[acodec~='(?i)^mp3$']", m4a: "[acodec~='(?i)^(?:aac|mp4a)']", opus: "[acodec~='(?i)^opus$']"}
export function audioConversionSourceSelector(target: string): string {
	const codecFilter = CONVERSION_CODEC_FILTERS[target]
	const codecFilters = [...(codecFilter ? [codecFilter] : []), COMPATIBLE_AUDIO_CODEC_FILTER, '']
	const streamFilters = [NON_DRC_AUDIO_FILTERS, ''].flatMap(drc => codecFilters.map(codec => `${codec}${drc}`))
	return [...[SOURCE_DEFAULT_AUDIO_FILTER, SOURCE_ORIGINAL_AUDIO_FILTER, ''].flatMap(track => streamFilters.map(filters => `bestaudio${track}${filters}`)), 'best'].join('/')
}

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

import type {SponsorBlockMode, SubtitleMode} from './schemas.js'
import type {EmbedOptions} from './preparedJob.js'

// Containers that support --embed-thumbnail per yt-dlp.
// Source: "Supported filetypes for thumbnail embedding are: mp3, mkv/mka, ogg/opus/flac, m4a/mp4/m4v/mov"
const THUMBNAIL_EMBED_SUPPORTED = new Set(['mp3', 'mkv', 'mka', 'ogg', 'opus', 'flac', 'm4a', 'mp4', 'm4v', 'mov'])

export type ConflictCode = 'thumbnailEmbedNotSupported' | 'subtitleEmbedNoMedia' | 'subtitleEmbedAudioOnly' | 'embedOptionsNoMedia' | 'sponsorBlockNoMedia'

export interface SanitizeConflict {
	code: ConflictCode
}

export interface SanitizeInput {
	isSubtitleOnly: boolean
	hasVideoTrack: boolean
	/** Output container extension resolved from format selection, e.g. 'webm', 'mp4', 'mkv', 'mp3'. */
	resolvedOutputContainer: string
	subtitleMode: SubtitleMode
	subtitleLanguages: string[]
	embed: EmbedOptions
	sponsorBlockMode: SponsorBlockMode
}

export interface SanitizeOverrides {
	embed: EmbedOptions
	subtitleMode: SubtitleMode
	sponsorBlockMode: SponsorBlockMode
}

export interface SanitizeResult {
	overrides: SanitizeOverrides
	conflicts: SanitizeConflict[]
}

export function sanitizeJobOptions(input: SanitizeInput): SanitizeResult {
	const {isSubtitleOnly, hasVideoTrack, resolvedOutputContainer, subtitleMode, subtitleLanguages, embed, sponsorBlockMode} = input
	const conflicts: SanitizeConflict[] = []

	let {thumbnail, chapters, metadata} = embed
	let outSubtitleMode = subtitleMode
	let outSponsorBlockMode = sponsorBlockMode

	if (isSubtitleOnly) {
		if (thumbnail || chapters || metadata) {
			conflicts.push({code: 'embedOptionsNoMedia'})
			thumbnail = false
			chapters = false
			metadata = false
		}
		if (outSponsorBlockMode === 'remove') {
			conflicts.push({code: 'sponsorBlockNoMedia'})
			outSponsorBlockMode = 'off'
		}
		if (subtitleMode === 'embed') {
			conflicts.push({code: 'subtitleEmbedNoMedia'})
			outSubtitleMode = 'sidecar'
		}
	} else {
		if (thumbnail && !THUMBNAIL_EMBED_SUPPORTED.has(resolvedOutputContainer)) {
			conflicts.push({code: 'thumbnailEmbedNotSupported'})
			thumbnail = false
		}
		if (!hasVideoTrack && subtitleMode === 'embed' && subtitleLanguages.length > 0) {
			conflicts.push({code: 'subtitleEmbedAudioOnly'})
			outSubtitleMode = 'sidecar'
		}
	}

	return {overrides: {embed: {...embed, thumbnail, chapters, metadata}, subtitleMode: outSubtitleMode, sponsorBlockMode: outSponsorBlockMode}, conflicts}
}

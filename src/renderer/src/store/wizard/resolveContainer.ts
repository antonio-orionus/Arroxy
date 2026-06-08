import type {AudioSelection, Preset, SubtitleMode} from '@shared/schemas.js'
import type {FormatOption} from '@shared/types.js'

/**
 * Resolves the expected output file container extension from wizard format selection.
 * Passed as `resolvedOutputContainer` to sanitizeJobOptions in @shared/sanitizeJobOptions.
 *
 * Rules mirror yt-dlp's container selection logic:
 * - subtitle-only → no media container
 * - audio convert → target format ('mp3', 'm4a', 'opus', 'wav')
 * - audio-only native → format's own ext (often 'webm' for YouTube opus)
 * - video + subtitle embed → mkv (forced by --merge-output-format mkv)
 * - video + same-container audio → that container
 * - video + mixed-container audio → mkv (yt-dlp default merge)
 */
export function resolveOutputContainer(selectedVideoFormatId: string, audioSelection: AudioSelection, subtitleMode: SubtitleMode, wizardFormats: FormatOption[], activePreset: Preset | null): string {
	if (activePreset === 'subtitle-only') return 'subtitle-only'

	if (audioSelection.kind === 'convert-lossless') return 'wav'
	if (audioSelection.kind === 'convert-lossy') return audioSelection.target

	if (selectedVideoFormatId === '') {
		if (audioSelection.kind === 'native') {
			const fmt = wizardFormats.find(f => f.formatId === audioSelection.formatId)
			return fmt?.ext ?? 'unknown'
		}
		return 'unknown'
	}

	// Video track present — subtitle embed forces mkv
	if (subtitleMode === 'embed') return 'mkv'

	const videoFmt = wizardFormats.find(f => f.formatId === selectedVideoFormatId)
	const audioFmt = audioSelection.kind === 'native' ? wizardFormats.find(f => f.formatId === audioSelection.formatId) : null

	const videoExt = videoFmt?.ext
	const audioExt = audioFmt?.ext

	if (!videoExt) return 'unknown'

	if (videoExt === 'webm' && (!audioExt || audioExt === 'webm')) return 'webm'
	if (videoExt === 'mp4' && (!audioExt || audioExt === 'm4a' || audioExt === 'mp4')) return 'mp4'
	return 'mkv'
}

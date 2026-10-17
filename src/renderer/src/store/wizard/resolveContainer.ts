import type {AudioSelection, SubtitleMode, VideoFileType, WizardMediaKind} from '@shared/schemas.js'
import {fileTypeFits} from '@shared/fileTypeFit.js'
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
 * - video + a chosen file type → that type (WebM only when the streams fit,
 *   else the MKV fallback the remux rule names)
 * - video + same-container audio → that container, except a WebM merge that
 *   embeds a thumbnail, which yt-dlp switches to mkv to hold the cover art
 * - video + mixed-container audio → mkv (yt-dlp default merge)
 */
export function resolveOutputContainer(selectedVideoFormatId: string, audioSelection: AudioSelection, subtitleMode: SubtitleMode, wizardFormats: FormatOption[], mediaKind: WizardMediaKind, embedThumbnail = false, fileType: VideoFileType = 'auto'): string {
	if (mediaKind === 'subtitles') return 'subtitle-only'

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
	if (fileType === 'webm') return fileTypeFits('webm', videoFmt, audioFmt ?? undefined) ? 'webm' : 'mkv'
	if (fileType !== 'auto') return fileType

	if (videoExt === 'webm' && !audioExt) return 'webm'
	if (videoExt === 'webm' && audioExt === 'webm') return embedThumbnail ? 'mkv' : 'webm'
	if (videoExt === 'mp4' && (!audioExt || audioExt === 'm4a' || audioExt === 'mp4')) return 'mp4'
	return 'mkv'
}

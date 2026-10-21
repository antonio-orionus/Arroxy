import type {AudioSelection, SubtitleMode, VideoFileType, WizardMediaKind} from '@shared/schemas.js'
import {audioConversionOutcome} from 'yt-dlp-bridge/audio-conversion'
import {fileTypeFits, mp4Caveat, type Mp4Caveat, type QuickTimeHost} from '@shared/fileTypeFit.js'
import {EXTRACTED_AUDIO_CONTAINER} from '@shared/thumbnailEmbed.js'
import {compatibleExt} from '@shared/ytdlp/compatibleExt.js'
import type {FormatOption} from '@shared/types.js'
import type {AppState} from '../types.js'

/**
 * Resolves the expected output file container extension from wizard format selection.
 * Passed as `resolvedOutputContainer` to sanitizeJobOptions in @shared/sanitizeJobOptions.
 *
 * Rules mirror yt-dlp's container selection logic:
 * - subtitle-only → no media container
 * - audio convert → target format ('mp3', 'm4a', 'opus', 'wav')
 * - audio mode native or keep as-is → `--audio-format best`'s container
 *   (a WebM's Opus lands as .opus); for a stream naming no codec, the
 *   extracted-audio container yt-dlp names at download
 * - audio-only native beside no video pick → format's own ext
 * - video + subtitle embed → mkv (forced by --merge-output-format mkv)
 * - video + a chosen file type → that type (WebM only when the streams fit,
 *   else the MKV fallback the remux rule names)
 * - video alone → its own file
 * - video + audio → the container yt-dlp's merger picks (`compatibleExt`),
 *   except a WebM merge that embeds a thumbnail, which yt-dlp switches to mkv
 *   to hold the cover art
 */
export function resolveOutputContainer(selectedVideoFormatId: string, audioSelection: AudioSelection, subtitleMode: SubtitleMode, wizardFormats: FormatOption[], mediaKind: WizardMediaKind, embedThumbnail = false, fileType: VideoFileType = 'auto'): string {
	if (mediaKind === 'subtitles') return 'subtitle-only'

	if (audioSelection.kind === 'convert-lossless') return 'wav'
	if (audioSelection.kind === 'convert-lossy') return audioSelection.target
	// Audio mode extracts with `--audio-format best`: the codec's own container
	// (a WebM's Opus lands as .opus), keep as-is that of its combined file. A
	// stream naming no codec is named at download, never as its .mp4 or .webm.
	if (mediaKind === 'audio' && (audioSelection.kind === 'native' || audioSelection.kind === 'extract')) {
		// Keep as-is that names no file leaves the pick to yt-dlp: no guess from the list's order.
		const named = audioSelection.formatId
		const source = named === undefined ? undefined : wizardFormats.find(f => f.formatId === named)
		if (!source) return 'unknown'
		return audioConversionOutcome('best', {ext: source.ext, acodec: source.audioCodec})?.ext ?? EXTRACTED_AUDIO_CONTAINER
	}

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

	// One stream (video only, or video with its own sound): its own file, unmerged.
	if (!audioFmt || !audioExt) return videoExt
	// Merged: the container yt-dlp's merger picks, by codec first (AV1 or VP9
	// with Opus is WebM, whatever the video's own file was).
	const merged = compatibleExt({vcodecs: [videoFmt.videoCodec], acodecs: [audioFmt.audioCodec], vexts: [videoExt], aexts: [audioExt]})
	return merged === 'webm' && embedThumbnail ? 'mkv' : merged
}

// The video codec that makes an MP4 risky to play in QuickTime on this host
// (VP9 or AV1), when this download ends as an MP4; null otherwise, and always
// null when embedded subtitles turn the file into an MKV.
export function mp4CaveatCodec(state: Pick<AppState, 'wizardMediaKind' | 'selectedVideoFormatId' | 'audioSelection' | 'wizardSubtitleMode' | 'wizardFormats' | 'wizardEmbedThumbnail' | 'wizardFileType'>, host: QuickTimeHost): Mp4Caveat | null {
	if (state.wizardMediaKind !== 'video' || state.selectedVideoFormatId === '') return null
	const container = resolveOutputContainer(state.selectedVideoFormatId, state.audioSelection, state.wizardSubtitleMode, state.wizardFormats, state.wizardMediaKind, state.wizardEmbedThumbnail, state.wizardFileType)
	if (container !== 'mp4') return null
	return mp4Caveat(
		state.wizardFormats.find(f => f.formatId === state.selectedVideoFormatId),
		host
	)
}

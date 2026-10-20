import {describe, expect, it} from 'vite-plus/test'
import {canEmbedThumbnail, mediaIntentSpec} from '@shared/mediaIntent.js'
import {VIDEO_FILE_TYPES, type MediaIntent, type VideoFileType, type VideoGoal} from '@shared/schemas.js'
import {canHoldEmbeddedThumbnail} from '@shared/thumbnailEmbed.js'

const GOALS: readonly VideoGoal[] = ['best-picture', 'smart-tv']

function videoIntent(kind: 'video-audio' | 'video-only', goal: VideoGoal, fileType: VideoFileType): MediaIntent {
	const video = {goal, tier: '1080' as const, fileType}
	return kind === 'video-audio' ? {kind, ...video, audio: {native: {kind: 'default'}}} : {kind, ...video}
}

// yt-dlp's EmbedThumbnailPP: "Supported filetypes for thumbnail embedding are:
// mp3, mkv/mka, ogg/opus/flac, m4a/mp4/m4v/mov".
describe('containers that hold an embedded thumbnail', () => {
	it('are the ones yt-dlp embeds into', () => {
		for (const ext of ['mp3', 'mkv', 'mka', 'ogg', 'opus', 'flac', 'm4a', 'mp4', 'm4v', 'mov']) expect(canHoldEmbeddedThumbnail(ext), ext).toBe(true)
		for (const ext of ['webm', 'wav', 'flv', '3gp', 'unknown']) expect(canHoldEmbeddedThumbnail(ext), ext).toBe(false)
	})
})

describe('canEmbedThumbnail decides by the container the download ends in', () => {
	it('embeds into video without audio saved as MP4 or MKV', () => {
		for (const goal of GOALS) {
			for (const fileType of ['mp4', 'mkv'] as const) {
				expect(canEmbedThumbnail(mediaIntentSpec(videoIntent('video-only', goal, fileType))), `${goal}/${fileType}`).toBe(true)
			}
		}
	})

	it('leaves out video without audio whose container is the stream the site serves', () => {
		// A lone stream is not merged, so `--merge-output-format` never applies:
		// it may be a WebM, which yt-dlp only switches to MKV for a merge.
		for (const goal of GOALS) expect(canEmbedThumbnail(mediaIntentSpec(videoIntent('video-only', goal, 'auto'))), goal).toBe(false)
	})

	it('never embeds into a file kept as WebM, with or without audio', () => {
		for (const kind of ['video-audio', 'video-only'] as const) expect(canEmbedThumbnail(mediaIntentSpec(videoIntent(kind, 'best-picture', 'webm'))), kind).toBe(false)
	})

	it('embeds into every video with audio not kept as WebM', () => {
		// Auto merges into MP4 or MKV: yt-dlp writes a WebM merge as MKV to hold the cover.
		for (const goal of GOALS) {
			for (const fileType of VIDEO_FILE_TYPES) {
				if (fileType === 'webm') continue
				expect(canEmbedThumbnail(mediaIntentSpec(videoIntent('video-audio', goal, fileType))), `${goal}/${fileType}`).toBe(true)
			}
		}
	})

	it('embeds into converted audio except WAV, and not into audio kept in its own container', () => {
		const audio = (format: 'mp3' | 'm4a' | 'opus' | 'wav' | 'best'): MediaIntent => ({kind: 'audio-only', audio: {format}})
		for (const format of ['mp3', 'm4a', 'opus'] as const) expect(canEmbedThumbnail(mediaIntentSpec(audio(format))), format).toBe(true)
		for (const format of ['wav', 'best'] as const) expect(canEmbedThumbnail(mediaIntentSpec(audio(format))), format).toBe(false)
	})
})

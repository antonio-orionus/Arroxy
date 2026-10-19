import {describe, expect, it} from 'vite-plus/test'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import type {MediaIntent, PlaylistSelection} from '@shared/schemas.js'
import {COMPATIBLE_AUDIO_ONLY_SELECTOR, COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR, skippingAiUpscaled} from '../shared/nativeAudioSelectors.js'

function specFor(selection: PlaylistSelection) {
	const intent = playlistSelectionToMediaIntent(selection)
	if (!intent) throw new Error('media selection expected')
	return mediaIntentSpec(intent)
}

describe('mediaIntentSpec', () => {
	describe('video · best codec', () => {
		it('tier=best → uncapped bestvideo* selector, SDR-first sort (resolution and fps named first), no merge', () => {
			const spec = specFor({kind: 'video', tier: 'best', codec: 'best'})
			expect(spec.formatSelector).toBe(skippingAiUpscaled(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR))
			expect(spec.formatSort).toBe('res,fps,hdr:sdr')
			expect(spec.mergeOutputFormat).toBeUndefined()
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
		})

		it.each(['2160', '1440', '1080', '720', '480', '360', '240', '144'] as const)('tier=%s uses yt-dlp resolution sort instead of a hard height filter', tier => {
			const spec = specFor({kind: 'video', tier, codec: 'best'})
			expect(spec.formatSelector).toBe(skippingAiUpscaled(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR))
			expect(spec.formatSelector).not.toContain('height<=')
			expect(spec.formatSort).toBe(`res:${tier},fps,hdr:sdr`)
			expect(spec.mergeOutputFormat).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
		})
	})

	describe('video · mp4 codec', () => {
		it.each(['1080', '720', '480', '360'] as const)('tier=%s → no-fail selector + compatibility-first sort + mp4 merge', tier => {
			const spec = specFor({kind: 'video', tier, codec: 'mp4'})
			expect(spec.formatSelector).not.toContain('height<=')
			// Do not use bv*: on YouTube, old combined 360p MP4 can outrank 1080p
			// video-only H.264 when compatibility fields sort first.
			expect(spec.formatSelector).not.toContain('bv*')
			expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'))
			expect(spec.formatSort).toBe(`vcodec:h264,ext:mp4,res:${tier},fps,hdr:sdr,acodec:m4a`)
			expect(spec.mergeOutputFormat).toBe('mp4')
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
		})
	})

	describe('video profile audio preference', () => {
		it('a Best picture profile saved as MP4 pairs AAC audio and remuxes to MP4', () => {
			const intent: MediaIntent = {kind: 'video-audio', goal: 'best-picture', tier: '1440', fileType: 'mp4', audio: {native: {kind: 'default'}}}
			const spec = mediaIntentSpec(intent)

			expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best'))
			expect(spec.formatSort).toBe('res:1440,fps,hdr:sdr,acodec:m4a')
			expect(spec.mergeOutputFormat).toBe('mp4')
			expect(spec.remuxVideo).toBe('mp4')
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
			expect(spec.producesAudio).toBe(true)
		})

		it('Smart TV always pairs AAC audio, whatever the native audio choice', () => {
			const intent: MediaIntent = {kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}}
			const spec = mediaIntentSpec(intent)

			expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'))
			expect(spec.formatSort).toBe('vcodec:h264,ext:mp4,res:1080,fps,hdr:sdr,acodec:m4a')
			expect(spec.mergeOutputFormat).toBe('mp4')
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
			expect(spec.producesAudio).toBe(true)
		})
	})

	describe('audio', () => {
		it('format=best → bestaudio selector, no convert', () => {
			const spec = specFor({kind: 'audio', format: 'best'})
			expect(spec.formatSelector).toBe(COMPATIBLE_AUDIO_ONLY_SELECTOR)
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.formatSort).toBeUndefined()
			expect(spec.producesVideo).toBe(false)
		})

		it.each(['mp3', 'm4a', 'opus'] as const)('format=%s with explicit bitrate → audioConvert', format => {
			const spec = specFor({kind: 'audio', format, bitrateKbps: 256})
			expect(spec.audioConvert).toEqual({target: format, bitrateKbps: 256})
			expect(spec.formatSelector).toBeUndefined()
			expect(spec.producesVideo).toBe(false)
		})

		it('format=mp3 without bitrateKbps → defaults to 192', () => {
			const s: PlaylistSelection = {kind: 'audio', format: 'mp3'}
			const spec = specFor(s)
			expect(spec.audioConvert).toEqual({target: 'mp3', bitrateKbps: 192})
		})
	})
})

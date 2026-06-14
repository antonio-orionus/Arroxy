import {describe, expect, it} from 'vitest'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import type {MediaIntent, PlaylistSelection} from '@shared/schemas.js'
import {COMPATIBLE_AUDIO_ONLY_SELECTOR, COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR, COMPATIBLE_MP4_VIDEO_AUDIO_SELECTOR} from '../shared/nativeAudioSelectors.js'

function specFor(selection: PlaylistSelection) {
	return mediaIntentSpec(playlistSelectionToMediaIntent(selection))
}

describe('mediaIntentSpec', () => {
	describe('video · best codec', () => {
		it('tier=best → uncapped bestvideo* selector, no sort, no merge', () => {
			const spec = specFor({kind: 'video', tier: 'best', codec: 'best'})
			expect(spec.formatSelector).toBe(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR)
			expect(spec.formatSort).toBeUndefined()
			expect(spec.mergeOutputFormat).toBeUndefined()
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
		})

		it.each(['2160', '1440', '1080', '720', '480', '360'] as const)('tier=%s uses yt-dlp resolution sort instead of a hard height filter', tier => {
			const spec = specFor({kind: 'video', tier, codec: 'best'})
			expect(spec.formatSelector).toBe(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR)
			expect(spec.formatSelector).not.toContain('height<=')
			expect(spec.formatSort).toBe(`res:${tier},fps`)
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
			expect(spec.formatSelector).toBe('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')
			expect(spec.formatSort).toBe(`vcodec:h264,ext:mp4,res:${tier},fps,acodec:m4a`)
			expect(spec.mergeOutputFormat).toBe('mp4')
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
		})
	})

	describe('video profile audio preference', () => {
		it('best codec can prefer native M4A audio without forcing MP4 video', () => {
			const intent: MediaIntent = {kind: 'video-audio', codec: 'best', tiers: ['1440'], audio: {format: 'm4a'}}
			const spec = mediaIntentSpec(intent)

			expect(spec.formatSelector).toBe('bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best')
			expect(spec.formatSort).toBe('res:1440,fps,acodec:m4a')
			expect(spec.mergeOutputFormat).toBeUndefined()
			expect(spec.audioConvert).toBeUndefined()
			expect(spec.producesVideo).toBe(true)
			expect(spec.producesAudio).toBe(true)
		})

		it('MP4 video can keep best native audio when the profile does not prefer M4A', () => {
			const intent: MediaIntent = {kind: 'video-audio', codec: 'mp4', tiers: ['1080'], audio: {format: 'best'}}
			const spec = mediaIntentSpec(intent)

			expect(spec.formatSelector).toBe(COMPATIBLE_MP4_VIDEO_AUDIO_SELECTOR)
			expect(spec.formatSort).toBe('vcodec:h264,ext:mp4,res:1080,fps')
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

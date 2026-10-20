import {describe, expect, it} from 'vite-plus/test'
import {audioTrackLabel, audioTrackQuality, isAudioTrackQuality, isDefaultAudio, isOriginalAudio} from '@shared/audioTrackMeta.js'

describe('audio track metadata helpers', () => {
	it('recognizes the closed audio track quality set', () => {
		expect(isAudioTrackQuality('low')).toBe(true)
		expect(isAudioTrackQuality('medium')).toBe(true)
		expect(isAudioTrackQuality('high')).toBe(true)
		expect(isAudioTrackQuality('default')).toBe(false)
	})

	it('extracts quality from comma-separated format notes', () => {
		expect(audioTrackQuality({format_note: 'English original, HIGH'})).toBe('high')
		expect(audioTrackQuality({format_note: 'medium, DRC'})).toBe('medium')
		expect(audioTrackQuality({format_note: 'English original'})).toBeUndefined()
	})

	it('uses language as the label when the first note only names quality', () => {
		expect(audioTrackLabel({language: 'en', format_note: 'high, original'})).toBe('en')
		expect(audioTrackLabel({language: 'ja'})).toBe('ja')
	})

	it('uses the first non-quality note as the label', () => {
		expect(audioTrackLabel({language: 'en', format_note: 'English original (default), high'})).toBe('English original (default)')
	})

	// yt-dlp's format_note is free text: without a language it names no track (VK's "DASH audio", "Audio, low").
	it('reads no track from a note when the format has no language', () => {
		expect(audioTrackLabel({format_note: 'DASH audio'})).toBeUndefined()
		expect(audioTrackLabel({format_note: 'Audio, low'})).toBeUndefined()
	})

	it('detects default and original audio markers', () => {
		expect(isDefaultAudio({language_preference: 10})).toBe(true)
		expect(isDefaultAudio({format_note: 'English default'})).toBe(true)
		expect(isDefaultAudio({language_preference: 0, format_note: 'English'})).toBe(false)
		expect(isOriginalAudio({format_note: 'English original'})).toBe(true)
		expect(isOriginalAudio({format_note: 'English dubbed'})).toBe(false)
	})
})

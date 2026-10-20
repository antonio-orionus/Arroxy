import {skippingAiUpscaled} from '../shared/nativeAudioSelectors.js'
import {describe, expect, it} from 'vite-plus/test'
import {mediaIntentSpec} from '@shared/mediaIntent.js'
import type {MediaIntent} from '@shared/schemas.js'

const BEST_VIDEO: MediaIntent = {kind: 'video-audio', goal: 'best-picture', tier: 'best', fileType: 'auto', audio: {native: {kind: 'default'}}}
const BEST_AUDIO: MediaIntent = {kind: 'audio-only', audio: {format: 'best'}}
const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_CODEC_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
const SOURCE_DEFAULT_AUDIO_FILTER = '[language_preference>0]'
const SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~=?'(?i)\\boriginal\\b']"
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

describe('mediaIntentSpec native audio preference', () => {
	it('compatible native audio selector prefers source default or original non-DRC audio first', () => {
		const spec = mediaIntentSpec(BEST_VIDEO, 'compatible')

		expect(spec.formatSelector).toContain("bestaudio[language_preference>0][acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']")
		expect(spec.formatSelector).toContain("bestaudio[format_note~=?'(?i)\\boriginal\\b'][acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']")
		expect(spec.formatSelector).toContain("bestaudio[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']")
		expect(spec.formatSelector).toContain("[format_note!~=?'(?i)\\bdrc\\b']")
		expect(spec.formatSelector?.endsWith('/bestvideo*+bestaudio/best')).toBe(true)
	})

	it('audio-only best native selector prefers source default or original non-DRC audio first', () => {
		const spec = mediaIntentSpec(BEST_AUDIO, 'compatible')

		expect(spec.formatSelector).toBe(`${COMPATIBLE_BEST_AUDIO_SELECTOR}/best`)
	})

	it('surround best-native selectors prefer ec-3 before ac-3', () => {
		const spec = mediaIntentSpec(BEST_AUDIO, 'surround')

		expect(spec.formatSelector?.split('/').slice(0, 4)).toEqual([
			"bestaudio[language_preference>0][acodec~=?'^(?:e-?ac-?3|ec-3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']",
			"bestaudio[format_note~=?'(?i)\\boriginal\\b'][acodec~=?'^(?:e-?ac-?3|ec-3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']",
			"bestaudio[language_preference>0][acodec~=?'^(?:ac-?3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']",
			"bestaudio[format_note~=?'(?i)\\boriginal\\b'][acodec~=?'^(?:ac-?3)$'][format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
		])
	})

	it('explicit m4a/aac selectors stay unchanged', () => {
		const spec = mediaIntentSpec({kind: 'video-audio', goal: 'best-picture', tier: 'best', fileType: 'mp4', audio: {native: {kind: 'default'}}}, 'surround')

		expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best'))
		expect(spec.formatSort).toBe('res,fps,hdr:sdr,acodec:m4a')
	})

	// TikTok, Twitch clips and Archive offer only streams with sound: `bestvideo`
	// alone found nothing there and the download failed.
	it('falls back to a stream with sound for a video-only profile; the audio comes off after the download', () => {
		const spec = mediaIntentSpec({kind: 'video-only', goal: 'best-picture', tier: 'best', fileType: 'auto'}, 'compatible')
		expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo/bestvideo*'))
		expect(spec.producesAudio).toBe(false)
	})
})

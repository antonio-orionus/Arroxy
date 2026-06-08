import {describe, expect, it} from 'vitest'
import {resolveOutputContainer} from '@renderer/store/wizard/resolveContainer.js'
import type {AudioSelection, Preset, SubtitleMode} from '@shared/schemas.js'
import type {FormatOption} from '@shared/types.js'

function fmt(formatId: string, ext: string, isVideoOnly = false, isAudioOnly = false): FormatOption {
	return {formatId, ext, label: formatId, resolution: '1080p', isVideoOnly, isAudioOnly}
}

const WEBM_VIDEO = fmt('137', 'webm', true, false)
const WEBM_AUDIO = fmt('251', 'webm', false, true)
const MP4_VIDEO = fmt('298', 'mp4', true, false)
const M4A_AUDIO = fmt('140', 'm4a', false, true)
const OGG_AUDIO = fmt('172', 'ogg', false, true)
const FORMATS = [WEBM_VIDEO, WEBM_AUDIO, MP4_VIDEO, M4A_AUDIO, OGG_AUDIO]

const NONE: AudioSelection = {kind: 'none'}
const sidecar: SubtitleMode = 'sidecar'
const embed: SubtitleMode = 'embed'

describe('resolveOutputContainer', () => {
	describe('subtitle-only preset', () => {
		it('returns "subtitle-only" regardless of audio/video selection', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, 'subtitle-only')).toBe('subtitle-only')
		})
	})

	describe('audio convert', () => {
		it('convert-lossless → wav', () => {
			const audio: AudioSelection = {kind: 'convert-lossless', target: 'wav'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('wav')
		})

		it('convert-lossy mp3 → mp3', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('mp3')
		})

		it('convert-lossy m4a → m4a', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'm4a', bitrateKbps: 256}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('m4a')
		})

		it('convert-lossy opus → opus', () => {
			const audio: AudioSelection = {kind: 'convert-lossy', target: 'opus', bitrateKbps: 128}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('opus')
		})
	})

	describe('audio-only (no video track)', () => {
		it('native audio → format ext', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('webm')
		})

		it('native audio m4a → m4a', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('m4a')
		})

		it('unknown audio formatId → "unknown"', () => {
			const audio: AudioSelection = {kind: 'native', formatId: 'nonexistent'}
			expect(resolveOutputContainer('', audio, sidecar, FORMATS, null)).toBe('unknown')
		})

		it('no video no audio → "unknown"', () => {
			expect(resolveOutputContainer('', NONE, sidecar, FORMATS, null)).toBe('unknown')
		})
	})

	describe('video present', () => {
		it('subtitle embed forces mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, embed, FORMATS, null)).toBe('mkv')
		})

		it('video + matching webm audio → webm', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, null)).toBe('webm')
		})

		it('webm video + no audio → webm', () => {
			expect(resolveOutputContainer('137', NONE, sidecar, FORMATS, null)).toBe('webm')
		})

		it('mp4 video + m4a audio → mp4', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('298', audio, sidecar, FORMATS, null)).toBe('mp4')
		})

		it('mp4 video + no audio → mp4', () => {
			expect(resolveOutputContainer('298', NONE, sidecar, FORMATS, null)).toBe('mp4')
		})

		it('mp4 video + mp4 audio → mp4', () => {
			const mp4Audio = fmt('399', 'mp4', false, true)
			const audio: AudioSelection = {kind: 'native', formatId: '399'}
			expect(resolveOutputContainer('298', audio, sidecar, [MP4_VIDEO, mp4Audio], null)).toBe('mp4')
		})

		it('mp4 video + ogg audio (mixed containers) → mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '172'}
			expect(resolveOutputContainer('298', audio, sidecar, FORMATS, null)).toBe('mkv')
		})

		it('webm video + m4a audio (mixed containers) → mkv', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '140'}
			expect(resolveOutputContainer('137', audio, sidecar, FORMATS, null)).toBe('mkv')
		})

		it('unknown video formatId → "unknown"', () => {
			expect(resolveOutputContainer('nonexistent', NONE, sidecar, FORMATS, null)).toBe('unknown')
		})
	})

	describe('preset does not override non-subtitle-only', () => {
		it('null preset follows normal rules', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			const result = resolveOutputContainer('137', audio, sidecar, FORMATS, null)
			expect(result).toBe('webm')
		})

		it('non-subtitle-only preset follows normal rules', () => {
			const audio: AudioSelection = {kind: 'native', formatId: '251'}
			const presets: (Preset | null)[] = ['best-quality', 'audio-only', 'balanced', 'small-file']
			for (const preset of presets) {
				expect(resolveOutputContainer('137', audio, sidecar, FORMATS, preset)).toBe('webm')
			}
		})
	})
})

import {describe, expect, it} from 'vitest'
import {selectView} from '@renderer/store/formatSelectionView.js'
import type {FormatOption} from '@shared/types.js'
import type {AudioSelection} from '@renderer/store/types.js'

const SEPARATE_FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p mp4 video-only', ext: 'mp4', resolution: '1080p', isVideoOnly: true, isAudioOnly: false},
	{formatId: '136', label: '720p mp4 video-only', ext: 'mp4', resolution: '720p', isVideoOnly: true, isAudioOnly: false},
	{formatId: '140', label: 'm4a audio', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true},
	{formatId: '251', label: 'opus audio', ext: 'webm', resolution: 'audio only', abr: 160, isVideoOnly: false, isAudioOnly: true}
]

const MUXED_FORMATS: FormatOption[] = [
	{formatId: '1080p', label: '1080p muxed', ext: 'mp4', resolution: '1080p', isVideoOnly: false, isAudioOnly: false},
	{formatId: '720p', label: '720p muxed', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false},
	{formatId: '480p', label: '480p muxed', ext: 'mp4', resolution: '480p', isVideoOnly: false, isAudioOnly: false}
]

const NONE_AUDIO: AudioSelection = {kind: 'none'}

describe('selectView — convert gating', () => {
	it('separable audio + video selected → convertDisabled (yt-dlp -x mutex)', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, activePreset: null, wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.convertDisabled).toBe(true)
		expect(view.audio.convertTooltipKey).toBe('wizard.formats.convert.requiresAudioOnly')
	})

	it('separable audio + no video (audio-only) → convert enabled', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, activePreset: 'audio-only', wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.convertDisabled).toBe(false)
		expect(view.audio.convertTooltipKey).toBeNull()
	})

	it('muxed-only source + video selected → convert enabled (post-download -x extracts audio)', () => {
		const view = selectView({selectedVideoFormatId: '1080p', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, activePreset: 'best-quality', wizardFormats: MUXED_FORMATS})
		expect(view.audio.convertDisabled).toBe(false)
		expect(view.audio.convertTooltipKey).toBeNull()
	})

	it('muxed-only source + audio-only mode → convert enabled', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, activePreset: 'audio-only', wizardFormats: MUXED_FORMATS})
		expect(view.audio.convertDisabled).toBe(false)
	})

	it('muxed video selected → selectedVideoIsMuxed flag drives "Keep as-is" label', () => {
		const view = selectView({selectedVideoFormatId: '1080p', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, activePreset: 'best-quality', wizardFormats: MUXED_FORMATS})
		expect(view.audio.selectedVideoIsMuxed).toBe(true)
	})

	it('video-only selected (separable streams) → selectedVideoIsMuxed false', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, activePreset: null, wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.selectedVideoIsMuxed).toBe(false)
	})

	it('subtitle-only preset → mode reflects subtitle-only', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, activePreset: 'subtitle-only', wizardFormats: SEPARATE_FORMATS})
		expect(view.mode).toBe('subtitle-only')
		expect(view.video.disabled).toBe(true)
		expect(view.canContinue).toBe(true)
	})
})

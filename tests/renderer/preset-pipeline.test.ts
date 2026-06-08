import {describe, it, expect} from 'vitest'
import {applyPreset} from '@renderer/store/wizard/formatPicker.js'
import {buildFormatId, buildAudioConvertPayload} from '@renderer/store/helpers.js'
import {strategyFor} from '@main/services/phases/index.js'
import {prepareJob} from '@shared/prepareJob.js'
import type {AudioSelection} from '@renderer/store/types.js'
import type {FormatOption, Preset} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'

const MOCK_FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p mp4', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 100_000_000},
	{formatId: '136', label: '720p mp4', ext: 'mp4', resolution: '720p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 50_000_000},
	{formatId: '135', label: '480p mp4', ext: 'mp4', resolution: '480p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 20_000_000},
	{formatId: '251', label: 'opus 160k', ext: 'webm', resolution: 'audio', isVideoOnly: false, isAudioOnly: true, abr: 160},
	{formatId: '140', label: 'm4a 128k', ext: 'm4a', resolution: 'audio', isVideoOnly: false, isAudioOnly: true, abr: 128}
]

const PRESETS: Preset[] = ['best-quality', 'balanced', 'small-file', 'audio-only', 'subtitle-only']

const EMBED_OFF = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}

// Mirrors what queueSlice.buildStartInput would produce, minus URL/output bookkeeping.
function pipelineToPreparedJob(preset: Preset, audioSelection: AudioSelection, videoFormatId: string, subs: string[]): PreparedJob {
	return prepareJob({
		mode: 'single',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		formatId: buildFormatId(videoFormatId, audioSelection),
		audioConvert: buildAudioConvertPayload(audioSelection),
		activePreset: preset,
		sponsorBlockMode: 'off',
		sponsorBlockCategories: [],
		embed: EMBED_OFF,
		subtitles: subs.length > 0 ? {languages: subs, mode: 'sidecar', format: 'srt', writeAuto: false} : undefined
	})
}

describe('preset pipeline → strategy', () => {
	it.each(PRESETS)('%s preset: applyPreset → strategy is consistent with presetProducesMedia', preset => {
		const {videoFormatId, audioSelection} = applyPreset(preset, MOCK_FORMATS)
		// subtitle-only preset requires at least one subtitle language in prepareJob
		const subsForPreset = preset === 'subtitle-only' ? ['en'] : []
		const inputNoSubs = pipelineToPreparedJob(preset, audioSelection, videoFormatId, subsForPreset)
		const inputWithSubs = pipelineToPreparedJob(preset, audioSelection, videoFormatId, ['en', 'ja'])

		if (preset === 'subtitle-only') {
			expect(strategyFor(inputNoSubs)).toBe('subtitle-only')
			expect(strategyFor(inputWithSubs)).toBe('subtitle-only')
		} else {
			// Media-producing presets must NEVER route to subtitle-only.
			expect(strategyFor(inputNoSubs)).not.toBe('subtitle-only')
			expect(strategyFor(inputWithSubs)).not.toBe('subtitle-only')
		}
	})

	// Production repro: user picks audio-only preset, then switches to m4a@192
	// convert (custom selection that overrides the preset's native pick), then
	// ticks 2 subtitles. Pre-fix: strategy=subtitle-only → no audio file written.
	it('production repro: audio-only preset + m4a@192 convert + 2 subs → video+sidecar', () => {
		const audioSelection: AudioSelection = {kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192}
		const job = pipelineToPreparedJob('audio-only', audioSelection, '', ['en-j3PyPqV-e1s', 'en-orig'])

		expect(job.kind).toBe('audio-convert')
		expect(job.kind === 'audio-convert' ? job.audioConvert : undefined).toEqual({target: 'm4a', bitrateKbps: 192})
		expect(strategyFor(job)).toBe('video+sidecar')
	})

	it('subtitle-only preset never produces media intent', () => {
		const {videoFormatId, audioSelection} = applyPreset('subtitle-only', MOCK_FORMATS)
		expect(videoFormatId).toBe('')
		expect(audioSelection.kind).toBe('none')
		expect(buildFormatId(videoFormatId, audioSelection)).toBeUndefined()
		expect(buildAudioConvertPayload(audioSelection)).toBeUndefined()
	})

	it('audio-only preset picks best native audio when audio formats exist', () => {
		const {videoFormatId, audioSelection} = applyPreset('audio-only', MOCK_FORMATS)
		expect(videoFormatId).toBe('')
		expect(audioSelection).toEqual({kind: 'native', formatId: '251'})
		const job = pipelineToPreparedJob('audio-only', audioSelection, videoFormatId, [])
		expect(job.kind === 'single-format' ? job.formatId : undefined).toBe('251')
		expect(strategyFor(job)).toBe('video')
	})

	it('audio-only preset with no native audio formats (muxed-only source): defaults to mp3 convert', () => {
		const formatsNoAudio = MOCK_FORMATS.filter(f => !f.isAudioOnly)
		const {videoFormatId, audioSelection} = applyPreset('audio-only', formatsNoAudio)
		expect(videoFormatId).toBe('')
		expect(audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
		expect(buildFormatId(videoFormatId, audioSelection)).toBeUndefined()
		expect(buildAudioConvertPayload(audioSelection)).toEqual({target: 'mp3', bitrateKbps: 192})
	})
})

describe('audio convert variants — full coverage', () => {
	const convertSelections: AudioSelection[] = [
		{kind: 'convert-lossless', target: 'wav'},
		{kind: 'convert-lossy', target: 'mp3', bitrateKbps: 128},
		{kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192},
		{kind: 'convert-lossy', target: 'mp3', bitrateKbps: 256},
		{kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320},
		{kind: 'convert-lossy', target: 'm4a', bitrateKbps: 128},
		{kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192},
		{kind: 'convert-lossy', target: 'm4a', bitrateKbps: 256},
		{kind: 'convert-lossy', target: 'opus', bitrateKbps: 128},
		{kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}
	]

	it.each(convertSelections)('convert $kind/$target@$bitrateKbps → audioConvert payload set, formatId undefined', sel => {
		expect(buildFormatId('', sel)).toBeUndefined()
		expect(buildAudioConvertPayload(sel)).toBeDefined()
	})

	it.each(convertSelections)('convert $kind/$target@$bitrateKbps + audio-only preset + subs → video+sidecar', sel => {
		const job = pipelineToPreparedJob('audio-only', sel, '', ['en'])
		expect(strategyFor(job)).toBe('video+sidecar')
	})
})

// @vitest-environment jsdom
import {describe, expect, it} from 'vitest'
import {applyPreset, restoreFormatSelection, restoreSubtitleSelection} from '@renderer/store/wizard/formatPicker.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, FormatOption, SinglePrefs} from '@shared/types.js'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p mp4', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true, isAudioOnly: false},
	{formatId: '22', label: '720p mp4', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false},
	{formatId: '140', label: 'm4a 128kbps', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true},
	{formatId: '251', label: 'opus 160kbps', ext: 'opus', resolution: 'audio only', abr: 160, isVideoOnly: false, isAudioOnly: true}
]

const DOLBY_FIRST_FORMATS: FormatOption[] = [
	{formatId: '337', label: '2160p hdr', ext: 'webm', resolution: '2160p HDR', fps: 30, isVideoOnly: true, isAudioOnly: false},
	{formatId: '380', label: 'm4a ac-3 384kbps', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ac-3', isVideoOnly: false, isAudioOnly: true},
	{formatId: '328', label: 'm4a ec-3 384kbps', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ec-3', isVideoOnly: false, isAudioOnly: true},
	{formatId: '251', label: 'opus 143kbps', ext: 'webm', resolution: 'audio only', abr: 143, audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true},
	{formatId: '140', label: 'm4a 130kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', isVideoOnly: false, isAudioOnly: true}
]

function settingsWith(single: SinglePrefs): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, rememberLastOutputDir: false, uiZoom: 1, uiTheme: 'system', language: 'en', commonPaths: {downloads: null, music: null, videos: null, desktop: null, documents: null, pictures: null, home: null}, clipboardWatchEnabled: false}, single, playlist: base.playlist}
}

describe('restoreFormatSelection — audio persistence', () => {
	it('with no prefs, falls back to best-quality preset (m4a wins as bestAudio)', () => {
		const result = restoreFormatSelection(FORMATS, null)
		expect(result.preset).toBe('best-quality')
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(result.videoFormatId).toBe('137')
	})

	it('restores persisted convert-lossy(mp3, 192) verbatim', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastVideoResolution: 'audio-only', lastAudioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}}))
		expect(result.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
		expect(result.videoFormatId).toBe('')
	})

	it('restores persisted convert-lossless(wav)', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastPreset: 'audio-only', lastAudioSelection: {kind: 'convert-lossless', target: 'wav'}}))
		expect(result.audioSelection).toEqual({kind: 'convert-lossless', target: 'wav'})
	})

	it('restores native audio when persisted formatId is present in current formats', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastVideoResolution: '1080p', lastAudioSelection: {kind: 'native', formatId: '251'}}))
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '251'})
		expect(result.videoFormatId).toBe('137')
	})

	it('falls back to bestAudio when persisted native formatId is missing', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastVideoResolution: '1080p', lastAudioSelection: {kind: 'native', formatId: '999'}}))
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})

	it('defaults to Opus when Dolby formats are ordered first by bitrate', () => {
		const result = restoreFormatSelection(DOLBY_FIRST_FORMATS, null)
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '251'})
		expect(result.videoFormatId).toBe('337')
	})

	it('surround preference defaults to ec-3 when Dolby formats are available', () => {
		const settings = settingsWith({lastPreset: 'best-quality'})
		settings.common.nativeAudioPreference = 'surround'

		const result = restoreFormatSelection(DOLBY_FIRST_FORMATS, settings)

		expect(result.audioSelection).toEqual({kind: 'native', formatId: '328'})
		expect(result.videoFormatId).toBe('337')
	})

	it('falls back to Opus when a persisted native audio id is missing and Dolby is ordered first', () => {
		const result = restoreFormatSelection(DOLBY_FIRST_FORMATS, settingsWith({lastVideoResolution: '2160p HDR', lastAudioSelection: {kind: 'native', formatId: '999'}}))
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '251'})
	})

	it('does not restore a persisted Dolby audio id as the automatic default when Opus is available', () => {
		const result = restoreFormatSelection(DOLBY_FIRST_FORMATS, settingsWith({lastPreset: 'best-quality', lastVideoResolution: '2160p HDR', lastAudioSelection: {kind: 'native', formatId: '328'}}))
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '251'})
	})

	it("persisted convert audio overrides preset's default native audio", () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastPreset: 'audio-only', lastAudioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 256}}))
		expect(result.preset).toBe('audio-only')
		expect(result.videoFormatId).toBe('')
		expect(result.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 256})
	})

	it("persisted 'none' upgrades to first native audio when new source has separable audio", () => {
		// `none` from a previous probe is ambiguous: could mean "user picked
		// video-only" OR "previous source was muxed-only and we serialized the
		// keep-as-is default as none". The latter is far more common, and
		// silently downloading a video-only file is a worse failure mode than
		// re-picking native audio. So when separable audio exists we auto-upgrade.
		const result = restoreFormatSelection(FORMATS, settingsWith({lastPreset: 'best-quality', lastAudioSelection: {kind: 'none'}}))
		expect(result.audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(result.videoFormatId).toBe('137')
	})

	it("persisted 'none' carries through when new source is also muxed-only", () => {
		const muxedFormats = [
			{formatId: '1080p', label: '1080p muxed', ext: 'mp4', resolution: '1080p', isVideoOnly: false, isAudioOnly: false},
			{formatId: '720p', label: '720p muxed', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false}
		]
		const result = restoreFormatSelection(muxedFormats, settingsWith({lastPreset: 'best-quality', lastAudioSelection: {kind: 'none'}}))
		expect(result.audioSelection).toEqual({kind: 'none'})
	})
})

const MUXED_FORMATS: FormatOption[] = [
	{formatId: '1080p', label: '1080p muxed', ext: 'mp4', resolution: '1080p', isVideoOnly: false, isAudioOnly: false},
	{formatId: '720p', label: '720p muxed', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false},
	{formatId: '480p', label: '480p muxed', ext: 'mp4', resolution: '480p', isVideoOnly: false, isAudioOnly: false}
]

describe('applyPreset — muxed-source default audio', () => {
	// Twitch HLS, PornHub progressive, etc — every video format is muxed (audio
	// embedded in the same stream). Pairing those with a separate native audio
	// pick double-tracks the audio. Default for muxed sources must be `none`
	// (= "Keep as-is"), letting the embedded audio stay.

	it("best-quality + muxed-only → audio.kind === 'none'", () => {
		const r = applyPreset('best-quality', MUXED_FORMATS)
		expect(r.audioSelection.kind).toBe('none')
		expect(r.videoFormatId).toBe('1080p')
	})

	it("balanced + muxed-only → audio.kind === 'none'", () => {
		const r = applyPreset('balanced', MUXED_FORMATS)
		expect(r.audioSelection.kind).toBe('none')
	})

	it("small-file + muxed-only → audio.kind === 'none'", () => {
		const r = applyPreset('small-file', MUXED_FORMATS)
		expect(r.audioSelection.kind).toBe('none')
		expect(r.videoFormatId).toBe('480p')
	})

	it('best-quality + separable audio → picks bestAudio native', () => {
		const r = applyPreset('best-quality', FORMATS)
		expect(r.audioSelection).toEqual({kind: 'native', formatId: '140'})
	})

	it('audio-only preset picks native audio when available; falls back to mp3 convert on muxed-only source', () => {
		const r1 = applyPreset('audio-only', FORMATS)
		expect(r1.audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(r1.videoFormatId).toBe('')
		// Muxed-only source has no separable audio → default to convert-lossy/mp3
		// so the audio-only mode always has a valid (non-disabled) option selected.
		const r2 = applyPreset('audio-only', MUXED_FORMATS)
		expect(r2.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
	})

	it('audio-only preset skips Dolby for the default but keeps it available when it is the only native audio', () => {
		const r1 = applyPreset('audio-only', DOLBY_FIRST_FORMATS)
		expect(r1.audioSelection).toEqual({kind: 'native', formatId: '251'})
		const rSurround = applyPreset('audio-only', DOLBY_FIRST_FORMATS, 'surround')
		expect(rSurround.audioSelection).toEqual({kind: 'native', formatId: '328'})

		const dolbyOnlyFormats = DOLBY_FIRST_FORMATS.filter(format => !format.isAudioOnly || format.audioCodec === 'ac-3' || format.audioCodec === 'ec-3')
		const r2 = applyPreset('audio-only', dolbyOnlyFormats)
		expect(r2.audioSelection).toEqual({kind: 'native', formatId: '380'})
	})
})

describe('reviveAudio — convert-* selections carry verbatim across source types', () => {
	it('convert-lossy carries through verbatim when source has separable audio', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastAudioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 256}, lastPreset: 'audio-only'}))
		expect(result.audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 256})
	})

	it('convert-lossy carries through verbatim on muxed-only source', () => {
		const result = restoreFormatSelection(MUXED_FORMATS, settingsWith({lastAudioSelection: {kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}, lastPreset: 'audio-only'}))
		expect(result.audioSelection).toEqual({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192})
	})

	it('convert-lossless (wav) carries through verbatim', () => {
		const result = restoreFormatSelection(FORMATS, settingsWith({lastAudioSelection: {kind: 'convert-lossless', target: 'wav'}, lastPreset: 'audio-only'}))
		expect(result.audioSelection).toEqual({kind: 'convert-lossless', target: 'wav'})
	})
})

describe('restoreSubtitleSelection', () => {
	const SUBTITLES = {en: [{ext: 'vtt'}], es: [{ext: 'vtt'}]}
	const AUTO_CAPTIONS = {'de-orig': [{ext: 'vtt'}]}

	it('returns empty languages when no settings', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, null)
		expect(result.languages).toEqual([])
	})

	it('returns only languages that are available in subtitles or auto-captions', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, settingsWith({lastSubtitleLanguages: ['en', 'fr']}))
		expect(result.languages).toEqual(['en'])
	})

	it('preserves order from persisted languages, filtered to available', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, settingsWith({lastSubtitleLanguages: ['es', 'en']}))
		expect(result.languages).toEqual(['es', 'en'])
	})

	it('picks up languages from auto-captions pool', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, settingsWith({lastSubtitleLanguages: ['de-orig']}))
		expect(result.languages).toEqual(['de-orig'])
	})

	it('returns empty when persisted languages are all unavailable', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, settingsWith({lastSubtitleLanguages: ['ja', 'zh']}))
		expect(result.languages).toEqual([])
	})

	it('returns empty when subtitles and automaticCaptions are both undefined', () => {
		const result = restoreSubtitleSelection(undefined, undefined, settingsWith({lastSubtitleLanguages: ['en']}))
		expect(result.languages).toEqual([])
	})

	it('returns empty when persisted list is empty', () => {
		const result = restoreSubtitleSelection(SUBTITLES, AUTO_CAPTIONS, settingsWith({lastSubtitleLanguages: []}))
		expect(result.languages).toEqual([])
	})
})

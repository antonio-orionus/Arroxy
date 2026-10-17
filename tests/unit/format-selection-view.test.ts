import {describe, expect, it} from 'vite-plus/test'
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

describe('selectView — media kinds', () => {
	it('video with separable audio offers no conversions: they belong to Audio', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.convertTargets).toEqual([])
		expect(view.audio.bitrateStrip.hidden).toBe(true)
		expect(view.audio.audioExtOptions).toEqual(['m4a', 'webm'])
		expect(view.canDownload).toBe(true)
	})

	it('audio offers conversions and the bitrate strip', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.convertTargets).toContain('mp3')
		expect(view.audio.bitrateStrip.hidden).toBe(false)
		expect(view.mode).toBe('audio-only')
		expect(view.canDownload).toBe(false)
	})

	it('a muxed-only source keeps conversions with a video pick (post-download -x extracts audio)', () => {
		const view = selectView({selectedVideoFormatId: '1080p', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: MUXED_FORMATS})
		expect(view.audio.convertTargets).toContain('mp3')
		expect(view.audio.selectedVideoIsMuxed).toBe(true)
	})

	it('video-only selected (separable streams) → selectedVideoIsMuxed false', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: SEPARATE_FORMATS})
		expect(view.audio.selectedVideoIsMuxed).toBe(false)
	})

	it('subtitles mode disables the video column and is always downloadable here', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'subtitles', wizardFormats: SEPARATE_FORMATS})
		expect(view.mode).toBe('subtitle-only')
		expect(view.video.disabled).toBe(true)
		expect(view.canDownload).toBe(true)
		expect(view.selectedFilesize).toBeUndefined()
	})

	it('totals the video and its native audio track', () => {
		const formats = SEPARATE_FORMATS.map(f => ({...f, filesize: f.formatId === '137' ? 1000 : f.formatId === '140' ? 200 : 50}))
		expect(selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats}).selectedFilesize).toBe(1200)
		expect(selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats}).selectedFilesize).toBe(200)
		expect(selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: SEPARATE_FORMATS}).selectedFilesize).toBeUndefined()
	})

	it('shows the picked stream as its resolution row even when another stream leads that group', () => {
		const formats: FormatOption[] = [
			{formatId: '399', label: 'av1', ext: 'mp4', resolution: '1080p', fps: 60, videoCodec: 'av01.0.09M.08', isVideoOnly: true, isAudioOnly: false},
			{formatId: '137', label: 'h264', ext: 'mp4', resolution: '1080p', fps: 30, videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
			{formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats, profilePick: {videoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}}})
		expect(view.video.rows.map(row => row.formatId)).toEqual(['137'])
		expect(view.video.rows[0]?.isProfilePick).toBe(true)
		expect(view.currentResolutionLabel).toBe('1080p')
	})

	it('tags the streams the profile picked', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '251'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: SEPARATE_FORMATS, profilePick: {videoFormatId: '136', audioSelection: {kind: 'native', formatId: '140'}}})
		expect(view.video.rows.filter(row => row.isProfilePick).map(row => row.formatId)).toEqual(['136'])
		expect(view.audio.nativeRows.filter(row => row.isProfilePick).map(row => row.formatId)).toEqual(['140'])
	})

	it('returns filtered video rows and filter options from one derived view', () => {
		const formats: FormatOption[] = [
			{formatId: '137', label: '1080p mp4 video-only', ext: 'mp4', resolution: '1080p', fps: 30, dynamicRange: 'HDR', filesize: 100, isVideoOnly: true, isAudioOnly: false},
			{formatId: '248', label: '1080p webm video-only', ext: 'webm', resolution: '1080p', fps: 60, filesize: 50, isVideoOnly: true, isAudioOnly: false},
			{formatId: '140', label: 'm4a audio', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true}
		]

		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats, filters: {videoExt: 'mp4', dynamicRange: 'HDR', audioExt: null}})

		expect(view.video.extOptions).toEqual(['mp4', 'webm'])
		expect(view.video.dynamicRangeOptions).toEqual(['HDR', 'SDR'])
		// No "Audio only" row: the Video / Audio / Subtitles switch owns that choice.
		expect(view.video.rows).toEqual([expect.objectContaining({formatId: '137', resolution: '1080p', meta: 'mp4 · 30fps · HDR · 100 B', barWidth: 100})])
	})

	it('returns filtered audio rows and convert targets from one derived view', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, lastConvertBitrate: 128, mediaKind: 'audio', wizardFormats: SEPARATE_FORMATS, filters: {videoExt: null, dynamicRange: null, audioExt: 'webm'}})
		const unfiltered = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, lastConvertBitrate: 128, mediaKind: 'audio', wizardFormats: SEPARATE_FORMATS})

		expect(view.audio.audioExtOptions).toContain('webm')
		expect(unfiltered.audio.convertTargets).toContain('mp3')
		expect(view.audio.convertTargets).toEqual([])
		expect(view.audio.nativeRows).toEqual([expect.objectContaining({formatId: '251', ext: 'webm'})])
		expect(view.audio.bitrateStrip.value).toBe(192)
	})

	it('puts audio track language in the native row title and keeps codec details in meta', () => {
		const formats: FormatOption[] = [
			{
				formatId: '140-drc',
				label: 'English original (default) · m4a · AAC · DRC · 130 kbps',
				ext: 'm4a',
				resolution: 'audio only',
				abr: 130,
				audioCodec: 'mp4a.40.2',
				isDrc: true,
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				isDefaultAudio: true,
				isOriginalAudio: true,
				isVideoOnly: false,
				isAudioOnly: true
			},
			{formatId: '140-0', label: 'Klingon · m4a · AAC · 130 kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioLanguage: 'tlh', audioTrackLabel: 'Klingon', isVideoOnly: false, isAudioOnly: true}
		]

		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140-drc'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows).toEqual([expect.objectContaining({formatId: '140-drc', title: 'English original (default)', quality: null, meta: 'm4a · AAC · DRC · 130 kbps'}), expect.objectContaining({formatId: '140-0', title: 'Klingon', quality: null, meta: 'm4a · AAC · 130 kbps'})])
	})

	it('keeps same-container same-bitrate language variants visually distinct', () => {
		const formats: FormatOption[] = [
			{formatId: '140-1', label: 'English original (default) · m4a · AAC · 130 kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioLanguage: 'en', audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140-0', label: 'Klingon · m4a · AAC · 130 kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioLanguage: 'tlh', audioTrackLabel: 'Klingon', isVideoOnly: false, isAudioOnly: true}
		]

		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140-1'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows.map(row => `${row.title} | ${row.meta}`)).toEqual(['English original (default) | m4a · AAC · 130 kbps', 'Klingon | m4a · AAC · 130 kbps'])
	})

	it('keeps language label, codec metadata, and quality tier separate', () => {
		const formats: FormatOption[] = [
			{
				formatId: '140-1',
				label: 'English original (default) · m4a · AAC · 130 kbps',
				ext: 'm4a',
				resolution: 'audio only',
				abr: 130,
				audioCodec: 'mp4a.40.2',
				audioLanguage: 'en',
				audioTrackLabel: 'English original (default)',
				audioTrackQuality: 'medium',
				isDefaultAudio: true,
				isOriginalAudio: true,
				isVideoOnly: false,
				isAudioOnly: true
			},
			{formatId: '251', label: 'webm · Opus · 122 kbps', ext: 'webm', resolution: 'audio only', abr: 122, audioCodec: 'opus', audioTrackQuality: 'low', isVideoOnly: false, isAudioOnly: true}
		]

		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140-1'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows).toEqual([expect.objectContaining({formatId: '140-1', title: 'English original (default)', quality: 'medium', meta: 'm4a · AAC · 130 kbps'}), expect.objectContaining({formatId: '251', title: '', quality: 'low', meta: 'webm · Opus · 122 kbps'})])
	})
})

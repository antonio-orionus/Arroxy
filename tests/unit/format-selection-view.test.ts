import {describe, expect, it} from 'vite-plus/test'
import {listedAudioFormats, selectView} from '@renderer/store/formatSelectionView.js'
import {buildAudioConvertPayload, buildFormatId} from '@renderer/store/helpers.js'
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

	it('scales every size to the part and marks them as estimates', () => {
		const formats = SEPARATE_FORMATS.map(f => ({...f, filesize: f.formatId === '137' ? 1_000_000 : f.formatId === '140' ? 200_000 : 50_000, label: f.formatId === '140' ? 'm4a audio · 195.3 KiB' : f.label}))
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats, videoPart: {part: {startSeconds: 0, endSeconds: 25, exactCut: false}, durationSeconds: 100}})
		expect(view.selectedFilesize).toBe(300_000)
		expect(view.sizesScaledToPart).toBe(true)
		expect(view.video.rows.find(row => row.formatId === '137')).toMatchObject({filesize: 250_000, size: '~244.1 KiB'})
		expect(view.audio.nativeRows.find(row => row.formatId === '140')?.size).toBe('~48.8 KiB')
	})

	it('lists every codec of a height, and the picked stream stands for its codec even when another leads it', () => {
		const formats: FormatOption[] = [
			{formatId: '399', label: 'av1', ext: 'mp4', resolution: '1080p', fps: 60, videoCodec: 'av01.0.09M.08', isVideoOnly: true, isAudioOnly: false},
			{formatId: '299', label: 'h264 60', ext: 'mp4', resolution: '1080p', fps: 60, videoCodec: 'avc1.64002a', isVideoOnly: true, isAudioOnly: false},
			{formatId: '137', label: 'h264', ext: 'mp4', resolution: '1080p', fps: 30, videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
			{formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats, profilePick: {videoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}}})
		expect(view.video.rows.map(row => row.formatId)).toEqual(['399', '137'])
		expect(view.video.rows.find(row => row.formatId === '137')?.isProfilePick).toBe(true)
		expect(view.currentResolutionLabel).toBe('1080p')
	})

	it("says each video stream's bitrate, and nothing when the site gives none", () => {
		const formats = SEPARATE_FORMATS.map(f => (f.formatId === '137' ? {...f, tbr: 2645.9} : f))
		const view = selectView({selectedVideoFormatId: '137', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats, language: 'de'})
		expect(view.video.rows.find(row => row.formatId === '137')?.bitrate).toBe('Bitrate 2,6 Mbps')
		expect(view.video.rows.find(row => row.formatId === '136')?.bitrate).toBeNull()
	})

	it('hints only the facts a video chip leaves out: file type, an untagged frame rate, bitrate', () => {
		const formats: FormatOption[] = [
			{formatId: '399', label: 'av1', ext: 'mp4', resolution: '1080p', fps: 30, videoCodec: 'av01.0.09M.08', tbr: 2645.9, filesize: 1000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '298', label: 'h264 60', ext: 'mp4', resolution: '720p', fps: 60, videoCodec: 'avc1.4d4020', isVideoOnly: true, isAudioOnly: false},
			{formatId: '136', label: 'h264', ext: 'mp4', resolution: '720p', fps: 30, videoCodec: 'avc1.4d401f', isVideoOnly: true, isAudioOnly: false},
			{formatId: 'hls', label: 'unknown codec', ext: 'mp4', resolution: '480p', fps: 30, isVideoOnly: true, isAudioOnly: false}
		]
		const rows = selectView({selectedVideoFormatId: '399', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats}).video.rows
		const hint = (id: string): string | null | undefined => rows.find(row => row.formatId === id)?.hint
		expect(hint('399')).toBe('mp4 · 30 fps · Bitrate 2.6 Mbps')
		expect(hint('298')).toBe('mp4')
		// The chip already says the file type when the site names no codec.
		expect(hint('hls')).toBe('30 fps')
	})

	// Combined files a site gives no resolution or codec for: distinct files keep
	// a line each, named the site's way (Facebook's sd and hd), the bigger first;
	// the same file listed twice (Instagram's three copies) stays one chip.
	it('keeps distinct size-only files apart and names them the site’s way', () => {
		const bare = (formatId: string, filesize: number | undefined): FormatOption => ({formatId, label: 'mp4', ext: 'mp4', resolution: '', isVideoOnly: false, isAudioOnly: false, ...(filesize === undefined ? {} : {filesize})})
		const lines = (formats: FormatOption[]): string[] => selectView({selectedVideoFormatId: formats[0].formatId, audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats}).video.lines.map(line => `${line.name}: ${line.variants.map(row => row.formatId).join(',')}`)
		expect(lines([bare('sd', 3_576_134), bare('hd', 16_344_300)])).toEqual(['HD: hd', 'SD: sd'])
		expect(lines([bare('1', 6_512_066), bare('2', 6_512_066), bare('3', 6_512_066)])).toEqual(['Unknown resolution: 1'])
		expect(lines([bare('a', 100), bare('b', 900)])).toEqual(['Unknown resolution: b', 'Unknown resolution: a'])
		// Without sizes, nothing tells them apart: one chip, as before.
		expect(lines([bare('x', undefined), bare('y', undefined)])).toEqual(['Unknown resolution: x'])
	})

	it('tags the streams the profile picked', () => {
		const view = selectView({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '251'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: SEPARATE_FORMATS, profilePick: {videoFormatId: '136', audioSelection: {kind: 'native', formatId: '140'}}})
		expect(view.video.rows.filter(row => row.isProfilePick).map(row => row.formatId)).toEqual(['136'])
		expect(view.audio.nativeRows.filter(row => row.isProfilePick).map(row => row.formatId)).toEqual(['140'])
	})

	it('puts audio track language in the native row track and keeps codec details in their own fields', () => {
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

		expect(view.audio.nativeRows).toEqual([
			expect.objectContaining({formatId: '140-drc', track: 'English original (default)', quality: null, ext: 'm4a', codec: 'AAC', bitrate: '130 kbps', details: ['DRC']}),
			expect.objectContaining({formatId: '140-0', track: 'Klingon', quality: null, ext: 'm4a', codec: 'AAC', bitrate: '130 kbps', details: []})
		])
	})

	it('keeps same-container same-bitrate language variants visually distinct', () => {
		const formats: FormatOption[] = [
			{formatId: '140-1', label: 'English original (default) · m4a · AAC · 130 kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioLanguage: 'en', audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140-0', label: 'Klingon · m4a · AAC · 130 kbps', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioLanguage: 'tlh', audioTrackLabel: 'Klingon', isVideoOnly: false, isAudioOnly: true}
		]

		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140-1'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows.map(row => `${row.track} | ${row.ext} ${row.codec} ${row.bitrate}`)).toEqual(['English original (default) | m4a AAC 130 kbps', 'Klingon | m4a AAC 130 kbps'])
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

		expect(view.audio.nativeRows).toEqual([expect.objectContaining({formatId: '140-1', track: 'English original (default)', quality: 'medium', ext: 'm4a', codec: 'AAC', bitrate: '130 kbps'}), expect.objectContaining({formatId: '251', track: '', quality: 'low', ext: 'webm', codec: 'Opus', bitrate: '122 kbps'})])
	})

	it('lists what sets a track apart beyond codec and bitrate: DRC, channel layout, an unusual sample rate', () => {
		const formats: FormatOption[] = [
			{formatId: '380', label: 'm4a · Dolby', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ec-3', audioChannels: 6, sampleRateHz: 48_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '139-drc', label: 'm4a · AAC', ext: 'm4a', resolution: 'audio only', abr: 49, audioCodec: 'mp4a.40.5', audioChannels: 2, sampleRateHz: 22_050, isDrc: true, isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '380'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows.map(row => [row.codec, row.details])).toEqual([
			['Dolby', ['E-AC-3', '5.1']],
			['AAC', ['DRC', '22.05 kHz']]
		])
	})

	it('puts Dolby Digital Plus before Dolby Digital at the same bitrate', () => {
		const formats: FormatOption[] = [
			{formatId: '328', label: 'ac-3', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ac-3', audioChannels: 6, isVideoOnly: false, isAudioOnly: true},
			{formatId: '380', label: 'ec-3', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ec-3', audioChannels: 6, isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '380'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows.map(row => [row.formatId, row.chipTags])).toEqual([
			['380', ['E-AC-3', '5.1']],
			['328', ['AC-3', '5.1']]
		])
	})

	it('groups audio into one line per codec, each chip a bitrate with what else sets it apart', () => {
		const formats: FormatOption[] = [
			{formatId: '251-drc', label: 'opus drc', ext: 'webm', resolution: 'audio only', abr: 134, audioCodec: 'opus', isDrc: true, filesize: 5_300_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', abr: 134, audioCodec: 'opus', filesize: 5_300_000, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140', label: 'aac', ext: 'm4a', resolution: 'audio only', abr: 129, audioCodec: 'mp4a.40.2', isVideoOnly: false, isAudioOnly: true},
			{formatId: '250', label: 'opus small', ext: 'webm', resolution: 'audio only', abr: 68, audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.lines.map(line => [line.name, line.variants.map(row => [row.formatId, row.chipLabel, row.chipTags, row.twinId])])).toEqual([
			[
				'Opus',
				[
					['251-drc', '134 kbps', [], '251'],
					['251', '134 kbps', [], '251-drc'],
					['250', '68 kbps', [], null]
				]
			],
			['AAC', [['140', '129 kbps', [], null]]]
		])
		expect(view.audio.hasDrcTwins).toBe(true)
		expect(view.audio.sourceKbps).toBe(134)
	})

	it('keeps one line per codec across tracks and lists the tracks to pick from', () => {
		const formats: FormatOption[] = [
			{formatId: '140-1', label: 'English · m4a', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioTrackLabel: 'English original (default)', isDrc: true, isVideoOnly: false, isAudioOnly: true},
			{formatId: '251-1', label: 'English · webm', ext: 'webm', resolution: 'audio only', abr: 122, audioCodec: 'opus', audioTrackLabel: 'English original (default)', isVideoOnly: false, isAudioOnly: true},
			{formatId: '140-0', label: 'Klingon · m4a', ext: 'm4a', resolution: 'audio only', abr: 130, audioCodec: 'mp4a.40.2', audioTrackLabel: 'Klingon', isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140-1'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.tracks).toEqual(['English original (default)', 'Klingon'])
		// A DRC stream with no plain twin on its own track keeps its tag.
		expect(view.audio.lines.map(line => [line.name, line.variants.map(row => [row.track, row.chipLabel, row.chipTags])])).toEqual([
			[
				'AAC',
				[
					['English original (default)', '130 kbps', ['DRC']],
					['Klingon', '130 kbps', []]
				]
			],
			['Opus', [['English original (default)', '122 kbps', []]]]
		])
	})

	it('offers no track picker when the streams name one track or none', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: SEPARATE_FORMATS})

		expect(view.audio.tracks).toEqual([])
	})

	it('names a line after the file type when the codec is unknown', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: SEPARATE_FORMATS})

		expect(view.audio.lines.map(line => [line.name, line.variants.map(row => row.chipLabel)])).toEqual([
			['M4A', ['128 kbps']],
			['WEBM', ['160 kbps']]
		])
	})

	it('opens on the default language when the default stream is a copy the list folds away', () => {
		const stream = (formatId: string, track: string, extra: Partial<FormatOption> = {}): FormatOption => ({formatId, label: formatId, ext: 'mp4', resolution: 'audio only', audioTrackLabel: track, audioTrackQuality: 'high', isVideoOnly: false, isAudioOnly: true, ...extra})
		const formats = [stream('es', 'Spanish'), stream('akfire-en', 'English', {isDefaultAudio: true}), stream('fastly-en', 'English', {isDefaultAudio: true})]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.nativeRows.map(row => row.formatId)).toEqual(['es', 'fastly-en'])
		expect(view.audio.defaultTrack).toBe('English')
	})

	// Vimeo names neither codec nor bitrate, only a low or high grade.
	it('names a stream by its quality grade when the site gives no bitrate, best first', () => {
		const formats: FormatOption[] = [
			{formatId: 'hls-audio-low', label: 'English · mp4', ext: 'mp4', resolution: 'audio only', audioLanguage: 'en', audioTrackLabel: 'English', audioTrackQuality: 'low', quality: 0, isVideoOnly: false, isAudioOnly: true},
			{formatId: 'hls-audio-high', label: 'English · mp4', ext: 'mp4', resolution: 'audio only', audioLanguage: 'en', audioTrackLabel: 'English', audioTrackQuality: 'high', quality: 2, isVideoOnly: false, isAudioOnly: true}
		]
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: 'hls-audio-high'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})

		expect(view.audio.lines.map(line => [line.name, line.variants.map(row => [row.formatId, row.chipLabel])])).toEqual([
			[
				'MP4',
				[
					['hls-audio-high', 'High quality'],
					['hls-audio-low', 'Low quality']
				]
			]
		])
	})
})

describe('selectView — video rows', () => {
	const CODEC_FORMATS: FormatOption[] = [
		{formatId: '401', label: '2160p av1', ext: 'mp4', resolution: '3840x2160', fps: 60, dynamicRange: 'HDR10', filesize: 1_100_000_000, videoCodec: 'av01.0.12M.10', isVideoOnly: true, isAudioOnly: false},
		{formatId: '313', label: '2160p vp9', ext: 'webm', resolution: '3840x2160', fps: 60, videoCodec: 'vp09.00.51.08', isVideoOnly: true, isAudioOnly: false},
		{formatId: '135', label: '480p', ext: 'mp4', resolution: '854x480', fps: 30, isVideoOnly: true, isAudioOnly: false}
	]

	const view = (): ReturnType<typeof selectView> => selectView({selectedVideoFormatId: '401', audioSelection: NONE_AUDIO, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: CODEC_FORMATS})

	it('groups streams into one line per resolution, best first, named the way people say it', () => {
		expect(view().video.lines.map(line => [line.name, line.alias, line.variants.map(row => row.formatId)])).toEqual([
			['2160p', '4K', ['401', '313']],
			['480p', null, ['135']]
		])
	})

	it('keeps each stream as fields, so the chip and its spoken name can say every fact', () => {
		expect(view().video.rows.map(row => [row.ext, row.codec, row.fps, row.dynamicRange, row.size])).toEqual([
			['mp4', 'AV1', 60, 'HDR10', '1.0 GiB'],
			['webm', 'VP9', 60, null, null],
			['mp4', null, 30, null, null]
		])
	})

	it('names a chip by its codec, or by its file type when the codec is unknown', () => {
		expect(view().video.rows.map(row => row.chipLabel)).toEqual(['AV1', 'VP9', 'mp4'])
	})

	it('tags a chip only with a frame rate other than the one most streams have', () => {
		expect(view().video.rows.map(row => row.chipTags)).toEqual([[], [], ['30 fps']])
	})

	it('puts each stream in its dynamic range column, HDR before SDR', () => {
		expect(view().video.rows.map(row => row.range)).toEqual(['HDR10', 'SDR', 'SDR'])
		expect(view().video.ranges).toEqual(['HDR10', 'SDR'])
	})
})

describe('selectView — one chip per codec', () => {
	const video = (formatId: string, resolution: string, ext: string, videoCodec: string | undefined, isVideoOnly = true): FormatOption => ({formatId, label: formatId, ext, resolution, ...(videoCodec ? {videoCodec} : {}), isVideoOnly, isAudioOnly: false})
	const view = (formats: FormatOption[]) => selectView({selectedVideoFormatId: formats[0].formatId, audioSelection: {kind: 'none'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: formats}).video

	it('gives each codec its own column, in the same order on every line', () => {
		const {columns, lines} = view([video('248', '1080p', 'webm', 'vp9'), video('137', '1080p', 'mp4', 'avc1.640028'), video('135', '480p', 'mp4', 'avc1.4d401e')])
		expect(columns).toEqual([
			{range: 'SDR', codec: 'VP9'},
			{range: 'SDR', codec: 'H.264'}
		])
		expect(lines.map(line => [line.name, line.variants.map(row => row.codec)])).toEqual([
			['1080p', ['VP9', 'H.264']],
			['480p', ['H.264']]
		])
	})

	it('folds a stream with no codec name into a named one at its height, so it is never a choice of its own', () => {
		const {lines} = view([video('dash-240', '320x240', 'mp4', 'avc1.64000D'), video('url240', '320x240', 'mp4', undefined, false)])
		expect(lines[0].variants.map(row => row.formatId)).toEqual(['dash-240'])
	})

	// Vimeo lists each stream once per CDN, identical down to yt-dlp's rank: the
	// chip is the copy yt-dlp takes (listed last), unless the other is picked.
	it('shows the copy yt-dlp would take of identical streams from several CDNs', () => {
		const copies = [video('hls-akfire-2644', '1280x720', 'mp4', 'avc1.64001F'), video('hls-fastly-2644', '1280x720', 'mp4', 'avc1.64001F')]
		const chipOf = (selected: string): string[] => selectView({selectedVideoFormatId: selected, audioSelection: {kind: 'none'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: copies}).video.rows.map(row => row.formatId)
		expect(chipOf('')).toEqual(['hls-fastly-2644'])
		expect(chipOf('hls-akfire-2644')).toEqual(['hls-akfire-2644'])
	})

	it('puts streams with no codec name in one shared column, labelled by file type', () => {
		const {columns, lines} = view([video('2', '1280x720', 'avi', undefined, false), video('1', '640x360', 'mp4', undefined, false)])
		expect(columns).toEqual([{range: 'SDR', codec: null}])
		expect(lines.map(line => line.variants[0].chipLabel)).toEqual(['avi', 'mp4'])
	})
})

describe('buildFormatId — conversions', () => {
	it("names the chosen language's stream for a conversion, and nothing when the default track converts", () => {
		expect(buildFormatId('', {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192, sourceFormatId: '251-es'})).toBe('251-es')
		expect(buildFormatId('', {kind: 'convert-lossless', target: 'wav'})).toBeUndefined()
	})
})

describe('listedAudioFormats', () => {
	const audio = (formatId: string, extra: Partial<FormatOption> = {}): FormatOption => ({formatId, label: formatId, ext: 'mp4', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, ...extra})

	it('lists an unnamed-codec copy only where its language has no named track, or when it is picked', () => {
		const formats = [audio('234'), audio('140', {audioCodec: 'mp4a.40.2', ext: 'm4a'}), audio('234-de', {audioLanguage: 'de'}), audio('140-en', {audioCodec: 'mp4a.40.2', audioLanguage: 'en'})]
		expect(listedAudioFormats(formats, [null]).map(f => f.formatId)).toEqual(['140', '234-de', '140-en'])
		expect(listedAudioFormats(formats, ['234']).map(f => f.formatId)).toEqual(['234', '140', '234-de', '140-en'])
	})

	// Vimeo lists each stream once per CDN, identical down to yt-dlp's rank: one
	// chip each, the copy yt-dlp ranks best (listed last), unless the other is picked.
	it('lists copies of one stream from several CDNs once', () => {
		const copy = (cdn: string, grade: 'low' | 'high'): FormatOption => audio(`hls-${cdn}-audio-${grade}-English`, {audioLanguage: 'en', audioTrackLabel: 'English', audioTrackQuality: grade, quality: grade === 'high' ? 2 : 0})
		const formats = [copy('akfire', 'low'), copy('fastly', 'low'), copy('akfire', 'high'), copy('fastly', 'high')]
		expect(listedAudioFormats(formats, [null]).map(f => f.formatId)).toEqual(['hls-fastly-audio-low-English', 'hls-fastly-audio-high-English'])
		expect(listedAudioFormats(formats, ['hls-akfire-audio-high-English']).map(f => f.formatId)).toEqual(['hls-fastly-audio-low-English', 'hls-akfire-audio-high-English'])
	})

	it('keeps streams apart when anything the chip shows differs', () => {
		const formats = [audio('a', {abr: 128}), audio('b', {abr: 128, filesize: 1_000}), audio('c', {abr: 128, isDrc: true}), audio('d', {abr: 128, audioLanguage: 'de'}), audio('e', {abr: 128})]
		expect(listedAudioFormats(formats, [null]).map(f => f.formatId)).toEqual(['b', 'c', 'd', 'e'])
	})
})

// Audio mode extracts what it downloads: `-x --audio-format best`, the same
// as an Audio only profile's Quick Download.
describe('buildAudioConvertPayload — audio mode', () => {
	it('extracts a native pick, and keep as-is, as they are', () => {
		expect(buildAudioConvertPayload({kind: 'native', formatId: '251'}, 'audio')).toEqual({target: 'best'})
		expect(buildAudioConvertPayload({kind: 'extract'}, 'audio')).toEqual({target: 'best'})
		expect(buildFormatId('', {kind: 'extract'})).toBeUndefined()
		expect(buildFormatId('', {kind: 'extract', formatId: '18'})).toBe('18')
	})

	it('leaves a native pick beside a video alone', () => {
		expect(buildAudioConvertPayload({kind: 'native', formatId: '251'}, 'video')).toBeUndefined()
		expect(buildAudioConvertPayload({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, 'audio')).toEqual({target: 'mp3', bitrateKbps: 192})
	})
})

describe('selectView — audio mode on a site with only combined files', () => {
	const combined: FormatOption = {formatId: '18', label: '360p', ext: 'mp4', resolution: '640x360', isVideoOnly: false, isAudioOnly: false, audioCodec: 'mp4a.40.2'}

	it('offers keep as-is, and can download with it', () => {
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'extract'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: [combined]})
		expect(view.audio.extractOffered).toBe(true)
		expect(view.canDownload).toBe(true)
	})

	it('does not offer it where the site has its own audio streams', () => {
		const audio: FormatOption = {formatId: '140', label: '140', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true}
		expect(selectView({selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '140'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: [combined, audio]}).audio.extractOffered).toBe(false)
		expect(selectView({selectedVideoFormatId: '18', audioSelection: {kind: 'none'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: [combined]}).audio.extractOffered).toBe(false)
	})
})

// A conversion's named stream stays listed even when it is a folded copy, so
// the audio column can show its language.
describe('selectView — a conversion source that is a folded copy', () => {
	it('keeps it listed', () => {
		const copy: FormatOption = {formatId: '234', label: '234', ext: 'mp4', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, audioLanguage: 'en'}
		const named: FormatOption = {formatId: '140', label: '140', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, audioCodec: 'mp4a.40.2', audioLanguage: 'en'}
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192, sourceFormatId: '234'}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: [copy, named]})
		expect(view.audio.nativeRows.map(row => row.formatId)).toContain('234')
	})
})

describe('selectView — the stream an unnamed conversion converts', () => {
	it('stays listed even as a folded copy', () => {
		const copy: FormatOption = {formatId: '234', label: '234', ext: 'mp4', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, audioLanguage: 'en', isDefaultAudio: true, abr: 128}
		const drc: FormatOption = {formatId: '140-drc', label: '140-drc', ext: 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, audioCodec: 'mp4a.40.2', audioLanguage: 'en', isDefaultAudio: true, isDrc: true, abr: 129}
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: [copy, drc]})
		expect(view.audio.nativeRows.map(row => row.formatId)).toContain('234')
	})
})

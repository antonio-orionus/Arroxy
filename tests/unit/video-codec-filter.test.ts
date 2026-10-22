import {describe, expect, it} from 'vite-plus/test'
import {codecFilterPick} from '@renderer/store/videoCodecFilter.js'
import type {FormatOption} from '@shared/types.js'

const video = (formatId: string, height: number, videoCodec: string, dynamicRange?: string): FormatOption => ({formatId, label: formatId, ext: 'mp4', resolution: `${Math.round((height * 16) / 9)}x${height}`, videoCodec, ...(dynamicRange ? {dynamicRange} : {}), isVideoOnly: true, isAudioOnly: false})

// Best first, as the probe lists them.
const FORMATS: FormatOption[] = [
	video('av1-4320-hdr', 4320, 'av01.0.17M.10', 'HDR10'),
	video('av1-2160-hdr', 2160, 'av01.0.12M.10', 'HDR10'),
	video('vp9-2160-hdr', 2160, 'vp09.02.51.10', 'HDR10'),
	video('av1-2160', 2160, 'av01.0.12M.08'),
	video('vp9-2160', 2160, 'vp09.00.51.08'),
	video('vp9-1080', 1080, 'vp09.00.40.08'),
	video('h264-1080', 1080, 'avc1.640028'),
	{formatId: 'opus', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true}
]

describe('codecFilterPick', () => {
	it('keeps the pick when it is already of the shown codec, or the filter shows every codec', () => {
		expect(codecFilterPick(FORMATS, 'av1-2160', 'AV1')).toBeNull()
		expect(codecFilterPick(FORMATS, 'av1-2160', 'all')).toBeNull()
	})

	it('takes the same height and range in the shown codec', () => {
		expect(codecFilterPick(FORMATS, 'av1-2160-hdr', 'VP9')).toBe('vp9-2160-hdr')
		expect(codecFilterPick(FORMATS, 'av1-2160', 'VP9')).toBe('vp9-2160')
	})

	it('takes the same height in another range before another height in the same range', () => {
		const formats = [video('av1-2160-hdr', 2160, 'av01.0.12M.10', 'HDR10'), video('vp9-2160', 2160, 'vp09.00.51.08'), video('vp9-1440-hdr', 1440, 'vp09.02.50.10', 'HDR10')]
		expect(codecFilterPick(formats, 'av1-2160-hdr', 'VP9')).toBe('vp9-2160')
	})

	it('takes the nearest height when the codec has none at the picked one', () => {
		expect(codecFilterPick(FORMATS, 'vp9-1080', 'AV1')).toBe('av1-2160')
		expect(codecFilterPick(FORMATS, 'vp9-2160-hdr', 'H.264')).toBe('h264-1080')
	})

	it('takes the nearest height that has the codec, the taller on a tie', () => {
		expect(codecFilterPick(FORMATS, 'av1-4320-hdr', 'VP9')).toBe('vp9-2160-hdr')
		expect(codecFilterPick(FORMATS, 'av1-4320-hdr', 'H.264')).toBe('h264-1080')
	})

	// The list shows no filter with one named codec, so nothing moves.
	it('leaves the pick alone when the video names only one codec', () => {
		const formats = [video('vp9-720', 720, 'vp09.00.31.08'), {...video('plain-1080', 1080, ''), videoCodec: undefined}]
		expect(codecFilterPick(formats, 'plain-1080', 'VP9')).toBeNull()
	})

	// The grid keeps the profile's pick visible: a muxed VP9 copy of a height wins its chip over the silent one.
	it('takes a chip the grid draws when it keeps the profile’s pick', () => {
		const muxed: FormatOption = {...video('vp9-1080-muxed', 1080, 'vp09.00.40.08'), isVideoOnly: false, audioCodec: 'opus'}
		const formats = [muxed, video('vp9-1080', 1080, 'vp09.00.40.08'), video('av1-1080', 1080, 'av01.0.08M.08')]
		expect(codecFilterPick(formats, 'av1-1080', 'VP9', ['vp9-1080-muxed'])).toBe('vp9-1080-muxed')
	})

	it('leaves the pick alone when the video has no stream of the codec, or nothing is picked', () => {
		expect(codecFilterPick(FORMATS, 'av1-2160', 'HEVC')).toBeNull()
		expect(codecFilterPick(FORMATS, '', 'VP9')).toBeNull()
	})
})

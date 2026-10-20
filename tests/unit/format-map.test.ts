import {describe, expect, it} from 'vite-plus/test'
import {mapFormats} from '@shared/ytdlp/formatMapping.js'

describe('mapFormats', () => {
	it('returns raw format_id without composing audio selector', () => {
		const mapped = mapFormats([
			{format_id: '18', resolution: '360p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac'},
			{format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac'},
			{format_id: '137', resolution: '1080p', ext: 'mp4', vcodec: 'avc1', acodec: 'none'}
		])

		expect(mapped).toHaveLength(3)
		expect(mapped[0].formatId).toBe('137')
		expect(mapped[0].isVideoOnly).toBe(true)
		expect(mapped[0].label).not.toContain('bestaudio')
		expect(mapped[1].formatId).toBe('22')
		expect(mapped[1].isVideoOnly).toBe(false)
		expect(mapped[2].formatId).toBe('18')
		expect(mapped[2].isVideoOnly).toBe(false)
	})

	it('keeps the channel count and sample rate of an audio stream as data, not only in its label', () => {
		const mapped = mapFormats([
			{format_id: '380', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'ac-3', audio_channels: 6, asr: 48_000},
			{format_id: '139', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.5', asr: 22_050},
			{format_id: '137', resolution: '1920x1080', ext: 'mp4', vcodec: 'avc1.640028', acodec: 'none'}
		])
		expect(mapped.find(f => f.formatId === '380')).toEqual(expect.objectContaining({audioChannels: 6, sampleRateHz: 48_000}))
		expect(mapped.find(f => f.formatId === '139')?.sampleRateHz).toBe(22_050)
		expect(mapped.find(f => f.formatId === '139')?.audioChannels).toBeUndefined()
		expect(mapped.find(f => f.formatId === '137')).not.toHaveProperty('audioChannels')
	})

	it('keeps the video codec on video streams so MP4 profiles can prefer H.264', () => {
		const mapped = mapFormats([
			{format_id: '137', resolution: '1920x1080', ext: 'mp4', vcodec: 'avc1.640028', acodec: 'none'},
			{format_id: '140', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2'}
		])
		expect(mapped.find(f => f.formatId === '137')?.videoCodec).toBe('avc1.640028')
		expect(mapped.find(f => f.formatId === '140')?.videoCodec).toBeUndefined()
	})

	it('keeps the bitrate of a video stream, or of a muxed stream as a whole', () => {
		const mapped = mapFormats([
			{format_id: '137', resolution: '1920x1080', ext: 'mp4', vcodec: 'avc1.640028', acodec: 'none', tbr: 2645.9, vbr: 2645.9},
			{format_id: '18', resolution: '640x360', ext: 'mp4', vcodec: 'avc1.42001E', acodec: 'mp4a.40.2', tbr: 501.5},
			{format_id: '136', resolution: '1280x720', ext: 'mp4', vcodec: 'avc1.4d401f', acodec: 'none', vbr: 1200},
			{format_id: '135', resolution: '854x480', ext: 'mp4', vcodec: 'avc1.4d401e', acodec: 'none'}
		])
		expect(mapped.find(f => f.formatId === '137')?.tbr).toBe(2645.9)
		expect(mapped.find(f => f.formatId === '18')?.tbr).toBe(501.5)
		expect(mapped.find(f => f.formatId === '136')?.tbr).toBe(1200)
		expect(mapped.find(f => f.formatId === '135')).not.toHaveProperty('tbr')
	})

	it('includes audio-only formats (vcodec === none) with isAudioOnly flag', () => {
		const mapped = mapFormats([
			{format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac'},
			{format_id: '140', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a'}
		])

		expect(mapped).toHaveLength(2)
		const audioOnly = mapped.find(f => f.formatId === '140')
		expect(audioOnly?.isAudioOnly).toBe(true)
		expect(audioOnly?.isVideoOnly).toBe(false)
	})

	it('includes YouTube Dolby audio-only codecs without filtering them out', () => {
		const mapped = mapFormats([
			{format_id: '328', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'ec-3', abr: 384},
			{format_id: '380', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'ac-3', abr: 384},
			{format_id: '251', resolution: 'audio only', ext: 'webm', vcodec: 'none', acodec: 'opus', abr: 143}
		])

		expect(mapped.map(format => format.formatId).sort()).toEqual(['251', '328', '380'])
		expect(mapped.map(format => format.formatId)).toEqual(['328', '380', '251'])
		expect(mapped.find(format => format.formatId === '328')?.label).toContain('ec-3')
		expect(mapped.find(format => format.formatId === '328')?.audioCodec).toBe('ec-3')
		expect(mapped.find(format => format.formatId === '380')?.label).toContain('ac-3')
		expect(mapped.find(format => format.formatId === '380')?.audioCodec).toBe('ac-3')
	})

	it('disambiguates DRC variants and non-stereo audio in labels', () => {
		const mapped = mapFormats([
			{format_id: '140-drc', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129.6, format_note: 'medium, DRC', audio_channels: 2, asr: 44100},
			{format_id: '140', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129.6, format_note: 'medium', audio_channels: 2, asr: 44100},
			{format_id: '139', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.5', abr: 48.9, format_note: 'low', audio_channels: 2, asr: 22050},
			{format_id: '380', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'ac-3', abr: 384.1, format_note: 'high', audio_channels: 6, asr: 48000}
		])

		expect(mapped.find(format => format.formatId === '140-drc')?.label).toContain('DRC')
		expect(mapped.find(format => format.formatId === '140-drc')?.isDrc).toBe(true)
		expect(mapped.find(format => format.formatId === '140')?.label).not.toContain('DRC')
		expect(mapped.find(format => format.formatId === '140')?.isDrc).toBe(false)
		expect(mapped.find(format => format.formatId === '140')?.label).not.toContain('2ch')
		expect(mapped.find(format => format.formatId === '140')?.label).not.toContain('44.1 kHz')
		expect(mapped.find(format => format.formatId === '139')?.label).toContain('22.05 kHz')
		expect(mapped.find(format => format.formatId === '380')?.label).toContain('5.1')
		expect(mapped.find(format => format.formatId === '380')?.label).not.toContain('48 kHz')
	})

	it('preserves source audio language metadata for display and selection', () => {
		const mapped = mapFormats([
			{format_id: '140-drc', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129.6, language: 'en', language_preference: 10, format_note: 'English original (default), medium, DRC'},
			{format_id: '140-1', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129.5, language: 'en', language_preference: 10, format_note: 'English original (default), medium'},
			{format_id: '140-0', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 129.5, language: 'tlh', language_preference: -1, format_note: 'Klingon, medium'}
		])

		expect(mapped.find(format => format.formatId === '140-drc')).toEqual(expect.objectContaining({audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true, isDrc: true}))
		expect(mapped.find(format => format.formatId === '140-1')).toEqual(expect.objectContaining({audioTrackLabel: 'English original (default)', audioTrackQuality: 'medium', isDefaultAudio: true, isOriginalAudio: true, isDrc: false}))
		expect(mapped.find(format => format.formatId === '140-0')).toEqual(expect.objectContaining({audioLanguage: 'tlh', audioTrackLabel: 'Klingon', audioTrackQuality: 'medium', isDefaultAudio: false, isOriginalAudio: false}))
	})

	it('keeps quality metadata separate when format_note contains only quality', () => {
		const mapped = mapFormats([
			{format_id: '380', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'ac-3', abr: 384.1, format_note: 'high', audio_channels: 6},
			{format_id: '251', resolution: 'audio only', ext: 'webm', vcodec: 'none', acodec: 'opus', abr: 122.4, format_note: 'medium'},
			{format_id: '139', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.5', abr: 48.9, format_note: 'low'}
		])

		const high = mapped.find(format => format.formatId === '380')
		const medium = mapped.find(format => format.formatId === '251')
		const low = mapped.find(format => format.formatId === '139')

		expect(high).toEqual(expect.objectContaining({audioTrackQuality: 'high', label: 'm4a · ac-3 · 5.1 · 384 kbps'}))
		expect(medium).toEqual(expect.objectContaining({audioTrackQuality: 'medium', label: 'webm · Opus · 122 kbps'}))
		expect(low).toEqual(expect.objectContaining({audioTrackQuality: 'low', label: 'm4a · AAC · 49 kbps'}))
		expect(high).not.toHaveProperty('audioTrackLabel')
		expect(medium).not.toHaveProperty('audioTrackLabel')
		expect(low).not.toHaveProperty('audioTrackLabel')
	})

	it('sorts by resolution descending then filesize descending', () => {
		const mapped = mapFormats([
			{format_id: '18', resolution: '360p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', filesize: 10000},
			{format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', filesize: 50000},
			{format_id: '137', resolution: '1080p', ext: 'mp4', vcodec: 'avc1', acodec: 'none', filesize: 90000}
		])

		expect(mapped[0].resolution).toBe('1080p')
		expect(mapped[1].resolution).toBe('720p')
		expect(mapped[2].resolution).toBe('360p')
	})
})

// Shaped like yt-dlp's own notes (its YouTube extractor's `format_note` parts).
describe('mapFormats — stream markers', () => {
	const video = (format_id: string, extra: Record<string, unknown> = {}) => ({format_id, ext: 'mp4', resolution: '1920x1080', width: 1920, height: 1080, vcodec: 'avc1.640028', acodec: 'none', ...extra})
	const audio = (format_id: string, extra: Record<string, unknown> = {}) => ({format_id, ext: 'm4a', resolution: 'audio only', vcodec: 'none', acodec: 'mp4a.40.2', abr: 128, ...extra})
	const markersOf = (formats: Record<string, unknown>[]) => Object.fromEntries(mapFormats(formats).map(f => [f.formatId, f.markers ?? []]))

	it('reads each marker from the notes yt-dlp writes', () => {
		expect(
			markersOf([
				video('137-sr', {format_note: '1080p, AI-upscaled'}),
				video('137-d', {format_note: '1080p, DAMAGED', preference: -10}),
				video('616', {format_note: 'Premium'}),
				video('download', {format_note: 'watermarked', acodec: 'aac'}),
				audio('140-desc', {language: 'en-desc', format_note: 'English descriptive, medium'}),
				audio('140-amb', {format_note: 'medium, ambisonics_5_1'})
			])
		).toEqual({'137-sr': ['ai-upscaled'], '137-d': ['damaged'], 616: ['enhanced-bitrate'], download: ['watermarked'], '140-desc': ['audio-description'], '140-amb': ['spatial-audio']})
	})

	it('carries an AI dub noted on one copy to every copy of that language, and 360° to every video stream', () => {
		const markers = markersOf([audio('233-0', {language: 'es-US', format_note: 'es-US - dubbed-auto'}), audio('140-0', {language: 'es-US', format_note: 'Spanish (US), medium'}), audio('140-2', {language: 'en-US', format_note: 'English original (default)'}), video('137', {format_note: '1080s, equi'}), video('609')])
		expect(markers['140-0']).toEqual(['ai-dubbed'])
		expect(markers['140-2']).toEqual([])
		expect(markers['609']).toEqual(['vr'])
	})

	it('keeps the site preference and drops streams yt-dlp cannot download for DRM', () => {
		const formats = mapFormats([video('ok', {preference: -1}), video('drm', {has_drm: true})])
		expect(formats.map(f => [f.formatId, f.preference])).toEqual([['ok', -1]])
	})
})

describe('mapFormats — sizes and names the site leaves out', () => {
	// yt-dlp counts a missing codec as unknown, not as none: VK's HLS audio names
	// none, and yt-dlp merges it in. Only a stream that says it has neither is no media.
	it('keeps an audio stream whose codec the site does not name, and drops one with neither track', () => {
		const formats = mapFormats([
			{format_id: 'hls_fmp4-12_0-Audio', ext: 'mp4', resolution: 'audio only', vcodec: 'none', protocol: 'm3u8_native'},
			{format_id: 'nothing', ext: 'mp4', vcodec: 'none', acodec: 'none'}
		])
		expect(formats.map(f => [f.formatId, f.isAudioOnly])).toEqual([['hls_fmp4-12_0-Audio', true]])
	})

	it("shows the site's size, else one asked of its server, else an estimate from the bitrate", () => {
		const sizes = Object.fromEntries(
			mapFormats(
				[
					{format_id: 'reported', ext: 'mp4', resolution: '1280x720', vcodec: 'avc1', acodec: 'none', tbr: 2958, filesize: 9000},
					{format_id: 'approx', ext: 'mp4', resolution: '1280x720', vcodec: 'avc1', acodec: 'none', filesize_approx: 8000},
					{format_id: 'looked-up', ext: 'mp4', resolution: '1280x720', vcodec: 'avc1', acodec: 'none', tbr: 1000},
					{format_id: 'estimated', ext: 'mp4', resolution: '1280x720', vcodec: 'avc1', acodec: 'none', tbr: 2958}
				],
				{durationSeconds: 540, lookedUpSizes: new Map([['looked-up', 7_000]])}
			).map(f => [f.formatId, f.filesize])
		)
		expect(sizes).toEqual({reported: 9000, approx: 8000, 'looked-up': 7000, estimated: Math.round((2958 * 1000 * 540) / 8)})
	})

	it('estimates a size from the bitrate and duration when the site gives none', () => {
		const [format] = mapFormats([{format_id: 'hls-2958', ext: 'mp4', resolution: '1280x720', vcodec: 'avc1', acodec: 'mp4a.40.2', tbr: 2958}], {durationSeconds: 540})
		expect(format.filesize).toBe(Math.round((2958 * 1000 * 540) / 8))
	})

	it('names no resolution rather than yt-dlp\'s "unknown" or a note like "watermarked"', () => {
		const formats = mapFormats([
			{format_id: '0', ext: 'mp4', resolution: 'unknown', vcodec: 'h264', acodec: 'aac'},
			{format_id: 'download', ext: 'mp4', format_note: 'watermarked', vcodec: 'h264', acodec: 'aac'},
			{format_id: 'sized', ext: 'mp4', width: 576, height: 1024, vcodec: 'h264', acodec: 'aac'}
		])
		expect(Object.fromEntries(formats.map(f => [f.formatId, f.resolution]))).toEqual({0: '', download: '', sized: '576x1024'})
	})
})

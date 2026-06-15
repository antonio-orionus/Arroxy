import {describe, expect, it} from 'vitest'
import {mapFormats} from '@main/services/ProbeService.js'

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
		expect(mapped.find(format => format.formatId === '380')?.label).toContain('6ch')
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

		expect(high).toEqual(expect.objectContaining({audioTrackQuality: 'high', label: 'm4a · ac-3 · 6ch · 384 kbps'}))
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

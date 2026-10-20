import {describe, expect, it} from 'vite-plus/test'
import {conversionSource, selectedConversionSource} from '@shared/audioConversionSource.js'
import type {FormatOption} from '@shared/types.js'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'

function stream(formatId: string, audioCodec: string | undefined, abr: number | undefined, extra: Partial<FormatOption> = {}): FormatOption {
	return {formatId, label: formatId, ext: audioCodec === 'opus' ? 'webm' : 'm4a', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, ...(audioCodec ? {audioCodec} : {}), ...(abr === undefined ? {} : {abr}), ...extra}
}

const from = (...options: FormatOption[]): ReturnType<typeof selectionSourceFromOptions> => selectionSourceFromOptions(options)
const drc = {isDrc: true}

// YouTube's usual audio: Opus and AAC at two bitrates, each with a DRC twin.
const YOUTUBE = from(stream('251', 'opus', 130), stream('140', 'mp4a.40.2', 129), stream('250', 'opus', 70), stream('139', 'mp4a.40.5', 48), stream('251-drc', 'opus', 131, drc), stream('140-drc', 'mp4a.40.2', 129, drc))

// The bridge's own `-f` for the conversion, through the app's port of yt-dlp's selection.
describe('conversionSource', () => {
	it('copies the stream already in the target codec', () => {
		expect(conversionSource(YOUTUBE, 'm4a')).toEqual({formatId: '140', copies: true, kbps: 129})
		expect(conversionSource(YOUTUBE, 'opus')).toEqual({formatId: '251', copies: true, kbps: 130})
	})

	it("re-encodes yt-dlp's best non-DRC stream when none is in the target codec", () => {
		expect(conversionSource(YOUTUBE, 'mp3')).toEqual({formatId: '251', copies: false, kbps: 130})
		expect(conversionSource(YOUTUBE, 'wav')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	it('re-encodes the best stream rather than copy one below 96 kbps', () => {
		expect(conversionSource(from(stream('139', 'mp4a.40.5', 48), stream('251', 'opus', 130)), 'm4a')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	it('takes a DRC stereo stream before Dolby surround', () => {
		expect(conversionSource(from(stream('328', 'ec-3', 384), stream('251-drc', 'opus', 104, drc)), 'opus')).toEqual({formatId: '251-drc', copies: true, kbps: 104})
	})

	// The DRC switch on: the user wants the loudness-evened master.
	it('takes a DRC stream first when DRC is asked for', () => {
		const pool = from(stream('251-drc', 'opus', 133, drc), stream('140', 'mp4a.40.2', 129))
		expect(conversionSource(pool, 'opus', {preferDrc: true})).toEqual({formatId: '251-drc', copies: true, kbps: 133})
		expect(conversionSource(pool, 'opus')).toEqual({formatId: '140', copies: false, kbps: 129})
	})

	it("takes the source's default track before a dub, even one in the target codec", () => {
		const pool = from(stream('251-de', 'opus', 156), stream('140-en', 'mp4a.40.2', 129, {isDefaultAudio: true}), stream('251-en', 'opus', 113, {isDefaultAudio: true}))
		expect(conversionSource(pool, 'opus')).toEqual({formatId: '251-en', copies: true, kbps: 113})
	})

	it("narrows to one language's streams", () => {
		const pool = from(stream('251-de', 'opus', 156), stream('140-de', 'mp4a.40.2', 129), stream('251-en', 'opus', 113, {isDefaultAudio: true}))
		expect(conversionSource(pool, 'm4a', {formatIds: new Set(['251-de', '140-de'])})).toEqual({formatId: '140-de', copies: true, kbps: 129})
	})

	// The chain ends in `best`: a site with only combined files converts one of them.
	it('converts a combined file where the site has no audio stream of its own', () => {
		const combined: FormatOption = {formatId: '18', label: '360p', ext: 'mp4', resolution: '640x360', isVideoOnly: false, isAudioOnly: false, audioCodec: 'mp4a.40.2'}
		expect(conversionSource(from(combined), 'm4a')).toEqual({formatId: '18', copies: true, kbps: undefined})
	})

	it('has no source without formats', () => {
		expect(conversionSource(from(), 'opus')).toBeUndefined()
	})
})

// With several languages the wizard names the stream to convert.
describe('selectedConversionSource', () => {
	it('describes the named stream: copied when it is in the target codec, re-encoded when not', () => {
		expect(selectedConversionSource(YOUTUBE, 'm4a', '139')).toEqual({formatId: '139', copies: true, kbps: 48})
		expect(selectedConversionSource(YOUTUBE, 'm4a', '251')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	it("falls back to yt-dlp's pick without a named stream, or when it isn't in the probe", () => {
		expect(selectedConversionSource(YOUTUBE, 'opus', undefined)).toEqual({formatId: '251', copies: true, kbps: 130})
		expect(selectedConversionSource(YOUTUBE, 'opus', 'gone')).toEqual({formatId: '251', copies: true, kbps: 130})
	})
})

import {describe, expect, it} from 'vite-plus/test'
import {conversionSource, selectedConversionSource, type ConversionCandidate} from '@shared/audioConversionSource.js'

function stream(formatId: string, acodec: string | undefined, kbps: number | undefined, isDrc = false, extra: Partial<ConversionCandidate> = {}): ConversionCandidate {
	return {formatId, acodec, kbps, isDrc, ...extra}
}

// YouTube's usual audio: Opus and AAC at two bitrates, each with a DRC twin.
const YOUTUBE = [stream('251', 'opus', 130), stream('140', 'mp4a.40.2', 129), stream('250', 'opus', 70), stream('139', 'mp4a.40.5', 48), stream('251-drc', 'opus', 131, true), stream('140-drc', 'mp4a.40.2', 129, true)]

describe('conversionSource', () => {
	it('copies the best stream already in the target codec', () => {
		expect(conversionSource(YOUTUBE, 'm4a')).toEqual({formatId: '140', copies: true, kbps: 129})
		expect(conversionSource(YOUTUBE, 'opus')).toEqual({formatId: '251', copies: true, kbps: 130})
	})

	it('re-encodes the best non-DRC stream when none is in the target codec', () => {
		expect(conversionSource(YOUTUBE, 'mp3')).toEqual({formatId: '251', copies: false, kbps: 130})
		expect(conversionSource(YOUTUBE, 'wav')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	// The pool a DRC switch leaves: only the DRC streams of a track.
	it('copies a DRC stream in the target codec when the pool has only DRC streams', () => {
		expect(conversionSource([stream('251-drc', 'opus', 131, true), stream('140-drc', 'mp4a.40.2', 129, true)], 'm4a')).toEqual({formatId: '140-drc', copies: true, kbps: 129})
	})

	it('re-encodes a non-DRC stream before copying a DRC one', () => {
		expect(conversionSource([stream('251', 'opus', 130), stream('140-drc', 'mp4a.40.2', 129, true)], 'm4a')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	// yt-dlp's sorter ranks the codec before the bitrate: Opus 251 over AAC 140.
	it('re-encodes the stream yt-dlp ranks first: codec, then bitrate', () => {
		expect(conversionSource([stream('140', 'mp4a.40.2', 129.5), stream('251', 'opus', 126), stream('250', 'opus', 70)], 'mp3')?.formatId).toBe('251')
	})

	// The DRC switch on: the user wants the loudness-evened master.
	it('takes a DRC stream first when DRC is asked for', () => {
		const pool = [stream('251-drc', 'opus', 133, true), stream('140', 'mp4a.40.2', 129)]
		expect(conversionSource(pool, 'opus', {preferDrc: true})).toEqual({formatId: '251-drc', copies: true, kbps: 133})
		expect(conversionSource(pool, 'm4a', {preferDrc: true})).toEqual({formatId: '251-drc', copies: false, kbps: 133})
		expect(conversionSource(pool, 'opus')).toEqual({formatId: '140', copies: false, kbps: 129})
	})

	// The bridge tries the default track, then the original, then any, as
	// `[language_preference>0]` and `[format_note~=original]`.
	it("takes the source's default track before a dub, even one in the target codec", () => {
		const pool = [stream('251-de', 'opus', 156), stream('140-en', 'mp4a.40.2', 129, false, {track: 'default'}), stream('251-en', 'opus', 113, false, {track: 'default'})]
		expect(conversionSource(pool, 'opus')).toEqual({formatId: '251-en', copies: true, kbps: 113})
		expect(conversionSource([stream('251-de', 'opus', 156), stream('140-en', 'mp4a.40.2', 129, false, {track: 'original'})], 'opus')).toEqual({formatId: '140-en', copies: false, kbps: 129})
	})

	// yt-dlp's sorter: quality, then channels, then codec, then bitrate.
	it("ranks by the site's quality before the codec", () => {
		const pool = [stream('250', 'opus', 70, false, {quality: 2}), stream('140', 'mp4a.40.2', 129, false, {quality: 3})]
		expect(conversionSource(pool, 'mp3')?.formatId).toBe('140')
		expect(conversionSource([stream('251', 'opus', 130, false, {quality: 3}), stream('140', 'mp4a.40.2', 129, false, {quality: 3})], 'mp3')?.formatId).toBe('251')
	})

	it('passes over Dolby surround for a stereo stream', () => {
		expect(conversionSource([stream('328', 'ec-3', 384), stream('380', 'ac-3', 384), stream('251', 'opus', 104)], 'mp3')?.formatId).toBe('251')
		expect(conversionSource([stream('328', 'ec-3', 384)], 'mp3')).toEqual({formatId: '328', copies: false, kbps: 384})
	})

	it('treats a stream with no codec named as a re-encode', () => {
		expect(conversionSource([stream('hls-1', undefined, 128)], 'm4a')).toEqual({formatId: 'hls-1', copies: false, kbps: 128})
	})

	it('has no source without audio streams', () => {
		expect(conversionSource([], 'opus')).toBeUndefined()
	})
})

// With several languages the wizard names the stream to convert.
describe('selectedConversionSource', () => {
	it('describes the named stream: copied when it is in the target codec, re-encoded when not', () => {
		expect(selectedConversionSource(YOUTUBE, 'm4a', '139')).toEqual({formatId: '139', copies: true, kbps: 48})
		expect(selectedConversionSource(YOUTUBE, 'm4a', '251')).toEqual({formatId: '251', copies: false, kbps: 130})
	})

	it("falls back to the source chain without a named stream, or when it isn't in the probe", () => {
		expect(selectedConversionSource(YOUTUBE, 'opus', undefined)).toEqual({formatId: '251', copies: true, kbps: 130})
		expect(selectedConversionSource(YOUTUBE, 'opus', 'gone')).toEqual({formatId: '251', copies: true, kbps: 130})
	})
})

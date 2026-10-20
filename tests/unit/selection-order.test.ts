import {describe, expect, it} from 'vite-plus/test'
import {canEmbedThumbnail, mediaIntentSpec} from '@shared/mediaIntent.js'
import {containerArgsFor, effectiveFileType, effectiveNativeAudio, fileTypeAllowed, formatSortFor, selectionOrder} from '@shared/selectionOrder.js'
import {mediaIntentSchema, type MediaIntent, type NativeAudioPreference, type VideoMediaIntent} from '@shared/schemas.js'
import {readFileSync} from 'node:fs'
import {skippingAiUpscaled} from '../shared/nativeAudioSelectors.js'

// Recorded from the code before the selection order existed: every profile
// media combination and the yt-dlp spec it produced. Reading each old intent
// through the schema's upgrade must give the same yt-dlp arguments, except for
// the two combinations the new model folds away (see below).
interface LegacyCase {
	intent: {kind: string; codec?: string; tiers?: string[]; audio?: {format: string}}
	pref: NativeAudioPreference
	spec: Record<string, unknown>
}

const CASES = JSON.parse(readFileSync(new URL('../fixtures/selection-order/legacy-media-intent-specs.json', import.meta.url), 'utf8')) as LegacyCase[]

function withoutNewFields(spec: Record<string, unknown>): Record<string, unknown> {
	const {fileType: _fileType, ...rest} = spec
	return rest
}

// New since the recording: AI-upscaled streams ("-sr") are skipped first, then
// the recorded selector runs unchanged as the fallback.
function withSkippedAiUpscaled(spec: Record<string, unknown>): Record<string, unknown> {
	const selector = spec.formatSelector
	return typeof selector === 'string' && selector.includes('bestvideo') ? {...spec, formatSelector: skippingAiUpscaled(selector)} : spec
}

// New since the recording: video without audio falls back to a stream with
// sound on a site that has no video-only stream (its audio is dropped later).
function withVideoOnlyFallback(spec: Record<string, unknown>): Record<string, unknown> {
	return spec.formatSelector === 'bestvideo' ? {...spec, formatSelector: 'bestvideo/bestvideo*'} : spec
}

describe('selection order parity with the recorded yt-dlp specs', () => {
	it('covers every recorded combination', () => {
		expect(CASES.length).toBe(138)
	})

	for (const legacyCase of CASES) {
		const {intent, pref} = legacyCase
		const label = `${intent.kind} ${intent.codec ?? ''} ${intent.tiers?.[0] ?? ''} ${intent.audio?.format ?? ''} ${pref}`
		// Smart TV now always pairs AAC (it used to allow native audio), and a
		// native-codec profile with AAC now saves as MP4 to keep that AAC.
		const folded = intent.kind === 'video-audio' && ((intent.codec === 'mp4' && intent.audio?.format === 'best') || (intent.codec === 'best' && intent.audio?.format === 'm4a'))
		if (folded) continue
		it(`matches ${label}`, () => {
			const upgraded = mediaIntentSchema.parse(intent)
			expect(withoutNewFields({...mediaIntentSpec(upgraded, pref, 'hdr')})).toEqual(withSkippedAiUpscaled(withVideoOnlyFallback(legacyCase.spec)))
		})
	}

	it('reads an old Smart TV profile with native audio as Smart TV with AAC', () => {
		const upgraded = mediaIntentSchema.parse({kind: 'video-audio', goal: 'smart-tv', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(upgraded).toEqual({kind: 'video-audio', goal: 'smart-tv', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}})
		const recordedAac = CASES.find(c => c.intent.codec === 'mp4' && c.intent.tiers?.[0] === '720' && c.intent.audio?.format === 'm4a' && c.pref === 'compatible')
		expect(mediaIntentSpec(upgraded, 'compatible', 'hdr')).toEqual(withSkippedAiUpscaled({...recordedAac?.spec, fileType: 'auto'}))
	})

	it('reads an old native profile with AAC audio as Best picture saved as MP4', () => {
		const upgraded = mediaIntentSchema.parse({kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'mp4', audio: {native: {kind: 'default'}}})
		expect(upgraded).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'mp4', audio: {native: {kind: 'default'}}})
		const spec = mediaIntentSpec(upgraded, 'compatible', 'hdr')
		expect(spec.formatSelector).toBe(skippingAiUpscaled('bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best'))
		expect(spec.formatSort).toBe('res:1080,fps,acodec:m4a')
		expect(spec.mergeOutputFormat).toBe('mp4')
		expect(spec.remuxVideo).toBe('mp4')
	})

	it('leaves the new shape alone', () => {
		const intent: MediaIntent = {kind: 'video-only', goal: 'smart-tv', tier: '480', fileType: 'mkv'}
		expect(mediaIntentSchema.parse(intent)).toEqual(intent)
	})
})

function video(goal: VideoMediaIntent['goal'], fileType: VideoMediaIntent['fileType'], tier: VideoMediaIntent['tier'] = '1080'): Extract<VideoMediaIntent, {kind: 'video-audio'}> {
	return {kind: 'video-audio', goal, tier, fileType, audio: {native: {kind: 'default'}}}
}

describe('selectionOrder', () => {
	it('ranks resolution first for Best picture and H.264 first for Smart TV', () => {
		expect(selectionOrder(video('best-picture', 'auto'), 'compatible').video.map(rank => rank.kind)).toEqual(['site-preference', 'original', 'resolution', 'fps', 'hdr', 'source', 'codec', 'size'])
		expect(selectionOrder(video('smart-tv', 'auto'), 'compatible').video.map(rank => rank.kind)).toEqual(['site-preference', 'original', 'h264', 'mp4-streams', 'resolution', 'fps', 'hdr', 'source', 'codec', 'size'])
		expect(selectionOrder({...video('best-picture', 'auto'), aiUpscaled: 'allow'}, 'compatible').video.map(rank => rank.kind)).toEqual(['site-preference', 'resolution', 'fps', 'hdr', 'source', 'codec', 'size'])
	})

	it('picks the audio rank from goal and file type', () => {
		expect(selectionOrder(video('smart-tv', 'mkv'), 'compatible').audio).toEqual([{kind: 'aac', because: 'smart-tv'}])
		expect(selectionOrder(video('best-picture', 'mp4'), 'compatible').audio).toEqual([{kind: 'aac', because: 'file-type'}])
		expect(selectionOrder(video('best-picture', 'webm'), 'compatible').audio).toEqual([{kind: 'opus'}])
		const mkv = selectionOrder(video('best-picture', 'mkv'), 'surround')
		expect(mkv.audio).toEqual([{kind: 'native'}])
		expect(mkv.nativeAudio).toEqual({preference: 'surround', source: 'settings'})
	})

	it('has no audio rank for a video-only download', () => {
		const order = selectionOrder({kind: 'video-only', goal: 'best-picture', tier: 'best', fileType: 'auto'}, 'compatible')
		expect(order.audio).toBeNull()
		expect(order.nativeAudio).toBeNull()
	})

	it('uses the profile native audio choice over the global one', () => {
		const intent = {...video('best-picture', 'auto'), audio: {native: {kind: 'custom' as const, preference: 'surround' as const}}}
		expect(selectionOrder(intent, 'compatible').nativeAudio).toEqual({preference: 'surround', source: 'profile'})
		expect(effectiveNativeAudio({kind: 'default'}, 'surround')).toEqual({preference: 'surround', source: 'settings'})
	})

	it('never keeps Smart TV as WebM', () => {
		expect(fileTypeAllowed('smart-tv', 'webm')).toBe(false)
		expect(effectiveFileType('smart-tv', 'webm')).toBe('auto')
		expect(selectionOrder(video('smart-tv', 'webm'), 'compatible').fileType).toBe('auto')
	})

	it('derives the sort for the new combinations', () => {
		expect(formatSortFor(selectionOrder(video('best-picture', 'webm'), 'compatible'))).toBe('res:1080,fps,hdr:sdr,acodec:opus')
		expect(formatSortFor(selectionOrder(video('best-picture', 'mkv', 'best'), 'compatible'))).toBe('res,fps,hdr:sdr')
		expect(formatSortFor(selectionOrder(video('smart-tv', 'mkv', '720'), 'compatible'))).toBe('vcodec:h264,ext:mp4,res:720,fps,hdr:sdr,acodec:m4a')
	})
})

describe('container args', () => {
	it('remuxes to the chosen file type, WebM falling back to MKV', () => {
		expect(containerArgsFor({goal: 'best-picture', fileType: 'mp4'})).toEqual({mergeOutputFormat: 'mp4', remuxVideo: 'mp4'})
		expect(containerArgsFor({goal: 'smart-tv', fileType: 'mkv'})).toEqual({mergeOutputFormat: 'mkv', remuxVideo: 'mkv'})
		expect(containerArgsFor({goal: 'best-picture', fileType: 'webm'})).toEqual({mergeOutputFormat: 'webm/mkv', remuxVideo: 'webm>webm/mkv'})
	})

	it('keeps Auto as it was: Smart TV merges into MP4, Best picture passes nothing', () => {
		expect(containerArgsFor({goal: 'smart-tv', fileType: 'auto'})).toEqual({mergeOutputFormat: 'mp4'})
		expect(containerArgsFor({goal: 'best-picture', fileType: 'auto'})).toEqual({})
	})

	it('never embeds a thumbnail into a file kept as WebM', () => {
		expect(canEmbedThumbnail(mediaIntentSpec(video('best-picture', 'webm'), 'compatible'))).toBe(false)
		expect(canEmbedThumbnail(mediaIntentSpec(video('best-picture', 'mkv'), 'compatible'))).toBe(true)
	})
})

describe('HDR preference', () => {
	it('defaults to SDR first, and names resolution and fps before hdr so it never trades height for SDR', () => {
		expect(formatSortFor(selectionOrder(video('best-picture', 'auto', 'best'), 'compatible'))).toBe('res,fps,hdr:sdr')
		expect(formatSortFor(selectionOrder(video('best-picture', 'auto', '1080'), 'compatible'))).toBe('res:1080,fps,hdr:sdr')
		expect(formatSortFor(selectionOrder(video('smart-tv', 'auto', '720'), 'compatible'))).toBe('vcodec:h264,ext:mp4,res:720,fps,hdr:sdr,acodec:m4a')
	})

	it("leaves yt-dlp's own order, HDR first, when the app setting is HDR", () => {
		expect(formatSortFor(selectionOrder(video('best-picture', 'auto', 'best'), 'compatible', 'hdr'))).toBeUndefined()
		expect(formatSortFor(selectionOrder(video('best-picture', 'auto', '1080'), 'compatible', 'hdr'))).toBe('res:1080,fps')
	})

	it('lets a profile override the app setting either way', () => {
		const sdrProfile = {...video('best-picture', 'auto', '1080'), hdr: {kind: 'custom' as const, preference: 'sdr' as const}}
		const hdrProfile = {...video('best-picture', 'auto', '1080'), hdr: {kind: 'custom' as const, preference: 'hdr' as const}}

		expect(selectionOrder(sdrProfile, 'compatible', 'hdr').hdr).toEqual({preference: 'sdr', source: 'profile'})
		expect(formatSortFor(selectionOrder(sdrProfile, 'compatible', 'hdr'))).toBe('res:1080,fps,hdr:sdr')
		expect(selectionOrder(hdrProfile, 'compatible', 'sdr').hdr).toEqual({preference: 'hdr', source: 'profile'})
		expect(formatSortFor(selectionOrder(hdrProfile, 'compatible', 'sdr'))).toBe('res:1080,fps')
	})

	it('follows the app setting when the profile says nothing, and says so', () => {
		expect(selectionOrder(video('best-picture', 'auto'), 'compatible', 'hdr').hdr).toEqual({preference: 'hdr', source: 'settings'})
		expect(selectionOrder({...video('best-picture', 'auto'), hdr: {kind: 'default'}}, 'compatible', 'sdr').hdr).toEqual({preference: 'sdr', source: 'settings'})
	})

	it('applies to a video-only profile too', () => {
		expect(formatSortFor(selectionOrder({kind: 'video-only', goal: 'best-picture', tier: '1440', fileType: 'auto'}, 'compatible'))).toBe('res:1440,fps,hdr:sdr')
	})

	it('survives parsing: a stored profile choice stays, an absent one reads as the app setting', () => {
		const stored = {kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto', hdr: {kind: 'custom', preference: 'hdr'}}
		expect(mediaIntentSchema.parse(stored)).toEqual(stored)
		expect(mediaIntentSchema.parse({kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto'})).not.toHaveProperty('hdr')
	})
})

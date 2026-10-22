import {describe, expect, it} from 'vite-plus/test'
import {prepareJob, type PrepareJobInput} from '@shared/prepareJob.js'
import {preparedJobSchema, type EmbedOptions} from '@shared/preparedJob.js'
import {COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR, skippingAiUpscaled} from '../shared/nativeAudioSelectors.js'
import {h264First} from '../shared/smartTvSelectors.js'
import {tierBounded, tierRes} from '../shared/tierSelectors.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const EMBED_ALL: EmbedOptions = {chapters: true, metadata: true, thumbnail: true, description: true, thumbnailSidecar: true}

const BASE: Pick<PrepareJobInput, 'extractor' | 'extractorKey' | 'sponsorBlockMode' | 'sponsorBlockCategories' | 'embed'> = {extractor: 'youtube', extractorKey: 'Youtube', sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: EMBED_OFF}

describe('prepareJob', () => {
	describe('single-format kind', () => {
		it('builds with formatId + custom preset', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '137+140', filenameTemplate: '{title} [{id}]'})
			expect(job).toEqual({kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+140', filenameTemplate: '{title} [{id}]', subtitles: undefined, sponsorBlock: {mode: 'off'}, embed: EMBED_OFF, expectedBytes: undefined})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('keeps the expected size', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', expectedBytes: 1234})
			expect(job.kind).toBe('single-format')
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.expectedBytes).toBe(1234)
		})

		it('attaches subtitles when languages non-empty', () => {
			const job = prepareJob({
				...BASE,
				mode: 'single',
				formatId: '22',
				subtitles: {
					request: {
						kind: 'tracks',
						tracks: [
							{key: 'en', auto: false},
							{key: 'ja', auto: false}
						]
					},
					mode: 'sidecar',
					format: 'srt'
				}
			})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.subtitles).toEqual({
				request: {
					kind: 'tracks',
					tracks: [
						{key: 'en', auto: false},
						{key: 'ja', auto: false}
					]
				},
				mode: 'sidecar',
				format: 'srt'
			})
		})

		it('drops empty subtitles bundle', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', subtitles: {request: {kind: 'tracks', tracks: []}, mode: 'sidecar', format: 'srt'}})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.subtitles).toBeUndefined()
		})
	})

	describe('part of video', () => {
		const PART = {startSeconds: 220, endSeconds: 435, exactCut: false}

		it('keeps the part on a single-format job and drops SponsorBlock for it', () => {
			const job = prepareJob({...BASE, sponsorBlockMode: 'remove', sponsorBlockCategories: ['sponsor'], mode: 'single', formatId: '22', videoPart: PART})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.videoPart).toEqual(PART)
			expect(job.sponsorBlock).toEqual({mode: 'off'})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('keeps the part on an audio-convert job', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'mp3', bitrateKbps: 192}, videoPart: {...PART, exactCut: true}})
			if (job.kind !== 'audio-convert') throw new Error('unreachable')
			expect(job.videoPart).toEqual({...PART, exactCut: true})
		})

		it('never puts a part on a subtitles-only job', () => {
			const job = prepareJob({...BASE, mode: 'single', subtitleOnly: true, subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: false}]}, mode: 'sidecar', format: 'srt'}, videoPart: PART})
			expect(job).not.toHaveProperty('videoPart')
		})

		it('rejects a persisted part whose start is not before its end', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', videoPart: PART})
			expect(preparedJobSchema.safeParse({...job, videoPart: {startSeconds: 435, endSeconds: 220, exactCut: false}}).success).toBe(false)
		})
	})

	describe('audio-convert kind', () => {
		it('carries the stream to convert, when one audio language of several was chosen', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'mp3', bitrateKbps: 192}, formatId: '251-es'})
			if (job.kind !== 'audio-convert') throw new Error('unreachable')
			expect(job.formatId).toBe('251-es')
			expect(preparedJobSchema.parse(job)).toEqual(job)
		})

		it('builds when audioConvert present and formatId absent', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'mp3', bitrateKbps: 192}, filenameTemplate: '{title} [{id}]'})
			expect(job).toEqual({kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: {target: 'mp3', bitrateKbps: 192}, filenameTemplate: '{title} [{id}]', subtitles: undefined, sponsorBlock: {mode: 'off'}, embed: EMBED_OFF})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('handles wav (lossless) target', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'wav'}})
			if (job.kind !== 'audio-convert') throw new Error('unreachable')
			expect(job.audioConvert).toEqual({target: 'wav'})
		})
	})

	describe('subtitle-only kind', () => {
		it('triggers via the Subtitles kind', () => {
			const job = prepareJob({...BASE, mode: 'single', subtitleOnly: true, subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: false}]}, mode: 'sidecar', format: 'srt'}, filenameTemplate: '{title} [{id}]'})
			expect(job).toEqual({kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', filenameTemplate: '{title} [{id}]', subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: false}]}, mode: 'sidecar', format: 'srt'}})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('triggers via implicit "subs only, no media" intent', () => {
			const job = prepareJob({...BASE, mode: 'single', subtitles: {request: {kind: 'tracks', tracks: [{key: 'en', auto: true}]}, mode: 'sidecar', format: 'srt'}})
			expect(job.kind).toBe('subtitle-only')
		})

		it('throws when subtitle-only is requested without subtitles or with no language codes', () => {
			expect(() => prepareJob({...BASE, mode: 'single', subtitleOnly: true})).toThrow(/subtitle-only/)
			expect(() => prepareJob({...BASE, mode: 'single', subtitleOnly: true, subtitles: {request: {kind: 'languages', languages: [], source: 'manual-only'}, mode: 'sidecar', format: 'srt'}})).toThrow(/subtitle-only/)
		})

		it('rejects a subtitle-only job whose track request is empty', () => {
			expect(() => prepareJob({...BASE, mode: 'single', subtitleOnly: true, subtitles: {request: {kind: 'tracks', tracks: []}, mode: 'sidecar', format: 'srt'}})).toThrow(/subtitle-only/)
		})
	})

	describe('ranged-format kind', () => {
		it('builds video intent with formatSelector', () => {
			const sel = {kind: 'video' as const, tier: '1080' as const, codec: 'best' as const}
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: sel, filenameTemplate: '01 - {title}', embed: EMBED_ALL})
			expect(job).toEqual({
				kind: 'ranged-format',
				extractor: 'youtube',
				extractorKey: 'Youtube',
				intent: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}},
				formatSelector: skippingAiUpscaled(tierBounded(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR, '1080')),
				formatSort: `${tierRes('1080')},fps,hdr:sdr`,
				mergeOutputFormat: undefined,
				audioConvert: undefined,
				filenameTemplate: '01 - {title}',
				subtitles: undefined,
				sponsorBlock: {mode: 'off'},
				embed: EMBED_ALL
			})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('builds audio lossy preset with audioConvert', () => {
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'audio', format: 'mp3', bitrateKbps: 192}, filenameTemplate: '01 - {title}'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual({kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})
			expect(job.audioConvert).toEqual({target: 'mp3', bitrateKbps: 192})
			expect(job.formatSelector).toBeUndefined()
		})

		it('mp4 codec takes H.264 first and merges to mp4', () => {
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'video', tier: '720', codec: 'mp4'}, filenameTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.formatSelector).toBe(skippingAiUpscaled(tierBounded(h264First('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'), '720')))
			expect(job.mergeOutputFormat).toBe('mp4')
		})

		it('preserves media intent (regression: was lost as "custom")', () => {
			const sel = {kind: 'video' as const, tier: '720' as const, codec: 'best' as const}
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: sel, filenameTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}})
		})

		it('accepts profile media intent directly', () => {
			const intent = {kind: 'video-only' as const, goal: 'smart-tv' as const, tier: '1080' as const, fileType: 'auto' as const}
			const job = prepareJob({...BASE, mode: 'playlist', mediaIntent: intent, filenameTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual(intent)
			expect(job.formatSelector).toBe(skippingAiUpscaled(tierBounded(h264First('bestvideo/bestvideo*/best'), '1080')))
			expect(job.formatSort).toBe(`${tierRes('1080')},fps,hdr:sdr`)
		})

		// yt-dlp remuxes a merged WebM to MKV for cover art, but a single native
		// stream (video-only, "best" audio) fails postprocessing and WAV has no slot.
		it('keeps thumbnail embedding for merged video and lossy audio conversions', () => {
			const intents = [
				{kind: 'video-audio' as const, goal: 'best-picture' as const, tier: '1080' as const, fileType: 'auto' as const, audio: {native: {kind: 'default' as const}}},
				{kind: 'video-audio' as const, goal: 'smart-tv' as const, tier: '720' as const, fileType: 'auto' as const, audio: {native: {kind: 'default' as const}}},
				{kind: 'audio-only' as const, audio: {format: 'mp3' as const, bitrateKbps: 192 as const}},
				{kind: 'audio-only' as const, audio: {format: 'm4a' as const, bitrateKbps: 192 as const}},
				{kind: 'audio-only' as const, audio: {format: 'opus' as const, bitrateKbps: 128 as const}}
			]
			for (const mediaIntent of intents) {
				const job = prepareJob({...BASE, mode: 'playlist', mediaIntent, filenameTemplate: 't.ext', embed: EMBED_ALL})
				if (job.kind !== 'ranged-format') throw new Error('unreachable')
				expect(job.embed, mediaIntent.kind).toEqual(EMBED_ALL)
			}
		})

		it('drops thumbnail embedding where the output cannot hold cover art', () => {
			const intents = [
				{kind: 'video-only' as const, goal: 'best-picture' as const, tier: '1080' as const, fileType: 'auto' as const},
				{kind: 'video-only' as const, goal: 'smart-tv' as const, tier: '1080' as const, fileType: 'auto' as const},
				{kind: 'audio-only' as const, audio: {format: 'best' as const}},
				{kind: 'audio-only' as const, audio: {format: 'wav' as const}}
			]
			for (const mediaIntent of intents) {
				const job = prepareJob({...BASE, mode: 'playlist', mediaIntent, filenameTemplate: 't.ext', embed: EMBED_ALL})
				if (job.kind !== 'ranged-format') throw new Error('unreachable')
				expect(job.embed, JSON.stringify(mediaIntent)).toEqual({...EMBED_ALL, thumbnail: false})
			}
		})

		it('throws when ranged mode missing media intent', () => {
			expect(() => prepareJob({...BASE, mode: 'playlist', filenameTemplate: 't.ext'})).toThrow(/mediaIntent/)
		})

		it('throws when playlist mode missing filenameTemplate', () => {
			expect(() => prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}})).toThrow(/filenameTemplate/)
		})
	})

	describe('SponsorBlock options', () => {
		it('collapses to {mode:off} when categories empty', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', sponsorBlockMode: 'mark', sponsorBlockCategories: []})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.sponsorBlock).toEqual({mode: 'off'})
		})

		it('collapses to {mode:off} when mode is off, even with categories', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', sponsorBlockMode: 'off', sponsorBlockCategories: ['sponsor', 'intro']})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.sponsorBlock).toEqual({mode: 'off'})
		})

		it('passes through mark + categories', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', sponsorBlockMode: 'mark', sponsorBlockCategories: ['sponsor', 'selfpromo']})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.sponsorBlock).toEqual({mode: 'mark', categories: ['sponsor', 'selfpromo']})
		})
	})

	describe('errors', () => {
		it('throws when single-format requested with no formatId and no audioConvert', () => {
			expect(() => prepareJob({...BASE, mode: 'single'})).toThrow(/formatId/)
		})
	})
})

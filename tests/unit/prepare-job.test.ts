import {describe, expect, it} from 'vitest'
import {prepareJob, type PrepareJobInput} from '@shared/prepareJob.js'
import {preparedJobSchema, type EmbedOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const EMBED_ALL: EmbedOptions = {chapters: true, metadata: true, thumbnail: true, description: true, thumbnailSidecar: true}

const BASE: Pick<PrepareJobInput, 'extractor' | 'extractorKey' | 'sponsorBlockMode' | 'sponsorBlockCategories' | 'embed'> = {extractor: 'youtube', extractorKey: 'Youtube', sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: EMBED_OFF}

describe('prepareJob', () => {
	describe('single-format kind', () => {
		it('builds with formatId + custom preset', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '137+140', activePreset: null, outputTemplate: '%(title).200B [%(id)s].%(ext)s'})
			expect(job).toEqual({kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+140', preset: 'custom', outputTemplate: '%(title).200B [%(id)s].%(ext)s', subtitles: undefined, sponsorBlock: {mode: 'off'}, embed: EMBED_OFF, expectedBytes: undefined})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('preserves activePreset when set', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', activePreset: 'best-quality', expectedBytes: 1234})
			expect(job.kind).toBe('single-format')
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.preset).toBe('best-quality')
			expect(job.expectedBytes).toBe(1234)
		})

		it('attaches subtitles when languages non-empty', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', activePreset: null, subtitles: {languages: ['en', 'ja'], mode: 'sidecar', format: 'srt', writeAuto: false}})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.subtitles).toEqual({languages: ['en', 'ja'], mode: 'sidecar', format: 'srt', writeAuto: false})
		})

		it('drops empty subtitles bundle', () => {
			const job = prepareJob({...BASE, mode: 'single', formatId: '22', activePreset: null, subtitles: {languages: [], mode: 'sidecar', format: 'srt', writeAuto: false}})
			if (job.kind !== 'single-format') throw new Error('unreachable')
			expect(job.subtitles).toBeUndefined()
		})
	})

	describe('audio-convert kind', () => {
		it('builds when audioConvert present and formatId absent', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'mp3', bitrateKbps: 192}, activePreset: 'audio-only', outputTemplate: '%(title).200B [%(id)s].%(ext)s'})
			expect(job).toEqual({kind: 'audio-convert', extractor: 'youtube', extractorKey: 'Youtube', audioConvert: {target: 'mp3', bitrateKbps: 192}, preset: 'audio-only', outputTemplate: '%(title).200B [%(id)s].%(ext)s', subtitles: undefined, sponsorBlock: {mode: 'off'}, embed: EMBED_OFF})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('handles wav (lossless) target', () => {
			const job = prepareJob({...BASE, mode: 'single', audioConvert: {target: 'wav'}, activePreset: null})
			if (job.kind !== 'audio-convert') throw new Error('unreachable')
			expect(job.audioConvert).toEqual({target: 'wav'})
		})
	})

	describe('subtitle-only kind', () => {
		it('triggers via activePreset', () => {
			const job = prepareJob({...BASE, mode: 'single', activePreset: 'subtitle-only', subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}, outputTemplate: '%(title).200B [%(id)s].%(ext)s'})
			expect(job).toEqual({kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', outputTemplate: '%(title).200B [%(id)s].%(ext)s', subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: false}})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('triggers via implicit "subs only, no media" intent', () => {
			const job = prepareJob({...BASE, mode: 'single', activePreset: null, subtitles: {languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: true}})
			expect(job.kind).toBe('subtitle-only')
		})

		it('throws when subtitle-only requested with empty languages', () => {
			expect(() => prepareJob({...BASE, mode: 'single', activePreset: 'subtitle-only', subtitles: {languages: [], mode: 'sidecar', format: 'srt', writeAuto: false}})).toThrow(/subtitle-only/)
		})
	})

	describe('ranged-format kind', () => {
		it('builds video intent with formatSelector', () => {
			const sel = {kind: 'video' as const, tier: '1080' as const, codec: 'best' as const}
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: sel, outputTemplate: '01 - %(title)s.%(ext)s', embed: EMBED_ALL})
			expect(job).toEqual({
				kind: 'ranged-format',
				extractor: 'youtube',
				extractorKey: 'Youtube',
				intent: {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}},
				formatSelector: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
				formatSort: undefined,
				mergeOutputFormat: undefined,
				audioConvert: undefined,
				outputTemplate: '01 - %(title)s.%(ext)s',
				subtitles: undefined,
				sponsorBlock: {mode: 'off'},
				embed: EMBED_ALL
			})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('builds audio lossy preset with audioConvert', () => {
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'audio', format: 'mp3', bitrateKbps: 192}, outputTemplate: '01 - %(title)s.%(ext)s'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual({kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})
			expect(job.audioConvert).toEqual({target: 'mp3', bitrateKbps: 192})
			expect(job.formatSelector).toBeUndefined()
		})

		it('mp4 codec emits formatSort + mergeOutputFormat', () => {
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'video', tier: '720', codec: 'mp4'}, outputTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.formatSort).toContain('vcodec:h264')
			expect(job.mergeOutputFormat).toBe('mp4')
		})

		it('preserves media intent (regression: was lost as "custom")', () => {
			const sel = {kind: 'video' as const, tier: '720' as const, codec: 'best' as const}
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: sel, outputTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual({kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}})
		})

		it('accepts profile media intent directly', () => {
			const intent = {kind: 'video-only' as const, codec: 'mp4' as const, tiers: ['1080' as const, '720' as const]}
			const job = prepareJob({...BASE, mode: 'playlist', mediaIntent: intent, outputTemplate: 't.ext'})
			if (job.kind !== 'ranged-format') throw new Error('unreachable')
			expect(job.intent).toEqual(intent)
			expect(job.formatSelector).toContain('height<=1080')
			expect(job.formatSort).toContain('vcodec:h264')
		})

		it('throws when ranged mode missing media intent', () => {
			expect(() => prepareJob({...BASE, mode: 'playlist', outputTemplate: 't.ext'})).toThrow(/mediaIntent/)
		})

		it('throws when playlist mode missing outputTemplate', () => {
			expect(() => prepareJob({...BASE, mode: 'playlist', playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}})).toThrow(/outputTemplate/)
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
			expect(() => prepareJob({...BASE, mode: 'single', activePreset: null})).toThrow(/formatId/)
		})
	})
})

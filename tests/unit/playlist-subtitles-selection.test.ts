import {describe, expect, it} from 'vitest'
import {DEFAULT_PLAYLIST_SUBTITLE_SELECTION, MAX_SUBTITLE_LANGUAGES, playlistSelectionSchema, type PlaylistSelection} from '@shared/schemas.js'
import {playlistSelectionProducesVideo, playlistSelectionToMediaIntent, playlistSubtitleOptions} from '@shared/mediaIntent.js'
import {prepareJob, type PrepareJobInput} from '@shared/prepareJob.js'
import {preparedJobSchema} from '@shared/preparedJob.js'
import {buildWizardStepGraph, visibleWizardSteps, type WizardStepGraphInput} from '@renderer/store/wizard/wizardStepGraph.js'

const SUBS: PlaylistSelection = {kind: 'subtitles', languages: ['en', 'pl'], source: 'manual-first', mode: 'sidecar', format: 'srt'}

describe('playlist subtitles selection', () => {
	describe('schema', () => {
		it('accepts a subtitles-only batch selection', () => {
			expect(playlistSelectionSchema.safeParse(SUBS).success).toBe(true)
			expect(playlistSelectionSchema.safeParse(DEFAULT_PLAYLIST_SUBTITLE_SELECTION).success).toBe(true)
		})

		it('rejects embed delivery — there is no media to embed into', () => {
			expect(playlistSelectionSchema.safeParse({...SUBS, mode: 'embed'}).success).toBe(false)
		})

		it('caps the language list', () => {
			const languages = Array.from({length: MAX_SUBTITLE_LANGUAGES + 1}, (_, i) => `l${i}`)
			expect(playlistSelectionSchema.safeParse({...SUBS, languages}).success).toBe(false)
		})
	})

	describe('media intent', () => {
		it('has no media intent and produces no video', () => {
			expect(playlistSelectionToMediaIntent(SUBS)).toBeNull()
			expect(playlistSelectionProducesVideo(SUBS)).toBe(false)
			expect(playlistSelectionProducesVideo({kind: 'video', tier: 'best', codec: 'best'})).toBe(true)
			expect(playlistSelectionProducesVideo({kind: 'audio', format: 'best'})).toBe(false)
		})

		it('marks auto-only selections so only automatic captions are requested', () => {
			expect(playlistSubtitleOptions({...SUBS, source: 'auto-only'})).toEqual({languages: ['en', 'pl'], mode: 'sidecar', format: 'srt', writeAuto: true, autoOnly: true, includeRegionalVariants: true})
			expect(playlistSubtitleOptions({...SUBS, source: 'manual-first'})).not.toHaveProperty('autoOnly')
			expect(playlistSubtitleOptions({...SUBS, source: 'manual-only'})).not.toHaveProperty('autoOnly')
		})

		it('maps the selection to job subtitle options', () => {
			expect(playlistSubtitleOptions(SUBS)).toEqual({languages: ['en', 'pl'], mode: 'sidecar', format: 'srt', writeAuto: true, includeRegionalVariants: true})
			expect(playlistSubtitleOptions({...SUBS, source: 'manual-only', mode: 'subfolder', format: 'vtt'})).toEqual({languages: ['en', 'pl'], mode: 'subfolder', format: 'vtt', writeAuto: false, includeRegionalVariants: true})
		})
	})

	describe('prepareJob', () => {
		const BASE: Pick<PrepareJobInput, 'extractor' | 'extractorKey' | 'sponsorBlockMode' | 'sponsorBlockCategories' | 'embed'> = {
			extractor: 'youtube',
			extractorKey: 'Youtube',
			sponsorBlockMode: 'off',
			sponsorBlockCategories: [],
			embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false}
		}

		it('builds a subtitle-only job for a subtitles batch selection', () => {
			const job = prepareJob({...BASE, mode: 'playlist', playlistSelection: SUBS, filenameTemplate: '{title} [{id}]'})
			expect(job).toEqual({kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', filenameTemplate: '{title} [{id}]', subtitles: {languages: ['en', 'pl'], mode: 'sidecar', format: 'srt', writeAuto: true, includeRegionalVariants: true}})
			expect(preparedJobSchema.safeParse(job).success).toBe(true)
		})

		it('refuses an empty language list', () => {
			expect(() => prepareJob({...BASE, mode: 'playlist', playlistSelection: {...SUBS, languages: []}, filenameTemplate: 't'})).toThrow(/subtitle-only/)
		})
	})

	describe('wizard step graph', () => {
		function state(overrides: Partial<WizardStepGraphInput> = {}): WizardStepGraphInput {
			return {wizardStep: 'playlistPresets', activePreset: null, wizardMode: 'bulk', playlistSelection: SUBS, wizardExtractor: 'youtube', wizardSubtitles: {}, wizardAutomaticCaptions: {}, wizardSubtitleSkipped: false, multiProfileMode: false, ...overrides}
		}

		it('skips SponsorBlock and output for a subtitles batch', () => {
			expect(visibleWizardSteps(buildWizardStepGraph(state()))).toEqual(['url', 'playlistItems', 'playlistPresets', 'folder', 'confirm'])
			expect(visibleWizardSteps(buildWizardStepGraph(state({wizardMode: 'playlist'})))).toEqual(['url', 'playlistItems', 'playlistPresets', 'folder', 'confirm'])
		})
	})
})

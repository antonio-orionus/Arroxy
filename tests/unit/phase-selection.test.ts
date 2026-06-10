import {describe, expect, it} from 'vitest'
import {phasesFor} from '@main/services/phases/index.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {StartDownloadInput} from '@shared/types.js'

const URL = 'https://www.youtube.com/watch?v=test'
const FORMAT_ID = 'bv+ba'
const LANGS = ['en', 'ja']
const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}

function input(job: PreparedJob): StartDownloadInput {
	return {url: URL, outputDir: '/tmp', job}
}

// phasesFor always prepends a PreflightPhase, so counts below include it.
// Kinds are checked starting at index 1.

describe('phasesFor — strategy selection', () => {
	it('no formatId + langs → preflight + subtitle-only', () => {
		const job: PreparedJob = {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: LANGS, mode: 'sidecar', format: 'srt', writeAuto: false}}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('subtitle-only')
	})

	it('formatId + no langs → preflight + video (single VideoPhase embed=false)', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
	})

	it('formatId + langs + mode=sidecar → preflight + video + sidecar-subs', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: LANGS, mode: 'sidecar', format: 'srt', writeAuto: false}}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(3)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
		expect(phases[2].kind).toBe('sidecar-subs')
	})

	it('formatId + langs + mode=embed + writeAutoSubs=false → preflight + video + sidecar-subs mux', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: LANGS, mode: 'embed', format: 'vtt', writeAuto: false}}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(3)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
		expect(phases[2].kind).toBe('sidecar-subs')
	})

	it('formatId + langs + mode=embed + writeAutoSubs=true → preflight + video + sidecar-subs', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: LANGS, mode: 'embed', format: 'vtt', writeAuto: true}}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(3)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
		expect(phases[2].kind).toBe('sidecar-subs')
	})

	it('empty subtitleLanguages → preflight + video (treated as no-subs regardless of mode)', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
	})

	it('mode=embed but no langs → preflight + video (mode is moot when nothing to embed)', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
	})

	it('no formatId + no langs → preflight + video (subtitle-only needs langs)', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
	})

	it('no formatId + empty langs → preflight + video (empty langs is same as no langs)', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(2)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
	})

	it('formatId + langs + mode=subfolder → preflight + video + sidecar-subs', () => {
		const job: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: FORMAT_ID, preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF, subtitles: {languages: LANGS, mode: 'subfolder', format: 'srt', writeAuto: false}}
		const phases = phasesFor(input(job))
		expect(phases).toHaveLength(3)
		expect(phases[0].kind).toBe('preflight')
		expect(phases[1].kind).toBe('video')
		expect(phases[2].kind).toBe('sidecar-subs')
	})
})

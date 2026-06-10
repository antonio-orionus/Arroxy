import {describe, expect, it} from 'vitest'
import {buildWizardStepGraph, nextWizardStep, visibleWizardSteps, WIZARD_STEPS, type VisibleWizardStep, type WizardStepGraphInput} from '@renderer/store/wizard/wizardStepGraph.js'

// Step gating predicates are pure — exercise them directly without spinning
// up the wizard. Covers Cycle 10 (subtitle empty-pool skip) plus regression
// guards on the SponsorBlock YT-only gate and playlist-mode subtitle skip.

type TestContext = Omit<WizardStepGraphInput, 'wizardStep' | 'wizardSubtitles' | 'wizardAutomaticCaptions' | 'wizardSubtitleSkipped'> & {hasSubtitles: boolean; wizardSubtitleSkipped?: boolean}

const baseCtx: TestContext = {activePreset: null, wizardMode: 'single', playlistSelection: null, wizardExtractor: '', hasSubtitles: false}

function graph(ctx: TestContext, wizardStep: VisibleWizardStep = 'url') {
	return buildWizardStepGraph({
		activePreset: ctx.activePreset,
		wizardMode: ctx.wizardMode,
		playlistSelection: ctx.playlistSelection,
		wizardExtractor: ctx.wizardExtractor,
		wizardSubtitleSkipped: ctx.wizardSubtitleSkipped ?? false,
		wizardStep,
		wizardSubtitles: ctx.hasSubtitles ? {en: [{ext: 'vtt'}]} : {},
		wizardAutomaticCaptions: {}
	})
}

function shouldSkip(step: VisibleWizardStep, ctx: TestContext): boolean {
	return !visibleWizardSteps(graph(ctx)).includes(step)
}

describe('subtitles step gating', () => {
	it('hidden when single mode + no subtitles in either pool', () => {
		expect(shouldSkip('subtitles', {...baseCtx, hasSubtitles: false})).toBe(true)
	})

	it('shown when single mode + subtitles available', () => {
		expect(shouldSkip('subtitles', {...baseCtx, hasSubtitles: true})).toBe(false)
	})

	it('hidden in playlist mode after preset chosen (preset auto-runs subs)', () => {
		expect(shouldSkip('subtitles', {...baseCtx, wizardMode: 'playlist', playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}, hasSubtitles: true})).toBe(true)
	})

	it('shown in playlist mode pre-preset (user can still pick languages)', () => {
		expect(shouldSkip('subtitles', {...baseCtx, wizardMode: 'playlist', playlistSelection: null, hasSubtitles: true})).toBe(false)
	})
})

describe('sponsorblock step gating — YouTube-only', () => {
	it('hidden when extractor is empty (pre-probe)', () => {
		expect(shouldSkip('sponsorblock', baseCtx)).toBe(true)
	})

	it.each(['vimeo', 'pornhub', 'twitch', 'bandcamp'])('hidden for non-YT extractor: %s', extractor => {
		expect(shouldSkip('sponsorblock', {...baseCtx, wizardExtractor: extractor})).toBe(true)
	})

	it('shown for YouTube extractor on a video preset', () => {
		expect(shouldSkip('sponsorblock', {...baseCtx, wizardExtractor: 'youtube', activePreset: 'best-quality'})).toBe(false)
	})

	it('hidden for YouTube extractor on audio-only preset (no video to mark)', () => {
		expect(shouldSkip('sponsorblock', {...baseCtx, wizardExtractor: 'youtube', activePreset: 'audio-only'})).toBe(true)
	})
})

const baseNavCtx: Required<TestContext> = {activePreset: null, wizardMode: 'single', playlistSelection: null, wizardExtractor: '', hasSubtitles: false, wizardSubtitleSkipped: false}

function walkStep(current: VisibleWizardStep, ctx: TestContext, dir: 'forward' | 'backward'): VisibleWizardStep | null {
	return nextWizardStep(graph(ctx, current), dir)
}

describe('WizardStepGraph traversal', () => {
	it('single mode: forward from url skips playlist steps to formats', () => {
		expect(walkStep('url', baseNavCtx, 'forward')).toBe('formats')
	})

	it('bulk mode: forward from url enters the batch item picker', () => {
		expect(walkStep('url', {...baseNavCtx, wizardMode: 'bulk'}, 'forward')).toBe('playlistItems')
	})

	it('bulk mode: skips single format selection after items are confirmed', () => {
		const ctx: TestContext = {...baseNavCtx, wizardMode: 'bulk', playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}}
		expect(walkStep('playlistPresets', ctx, 'forward')).toBe('output')
	})

	it('bulk mode: backward from playlistItems returns url', () => {
		expect(walkStep('playlistItems', {...baseNavCtx, wizardMode: 'bulk'}, 'backward')).toBe('url')
	})

	it('forward from formats skips subtitles when wizardSubtitleSkipped is true', () => {
		const ctx = {...baseNavCtx, wizardSubtitleSkipped: true}
		const result = walkStep('formats', ctx, 'forward')
		expect(result).not.toBe('subtitles')
	})

	it('forward from formats stops at subtitles when hasSubtitles is true', () => {
		const ctx = {...baseNavCtx, hasSubtitles: true}
		expect(walkStep('formats', ctx, 'forward')).toBe('subtitles')
	})

	it('backward from formats returns url', () => {
		expect(walkStep('formats', baseNavCtx, 'backward')).toBe('url')
	})
})

describe('WizardStepGraph coverage', () => {
	it('STEPS sequence is the 9-step ordered list', () => {
		expect(WIZARD_STEPS).toEqual(['url', 'playlistItems', 'playlistPresets', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'])
	})

	it('every entry in WIZARD_STEPS can be considered by the graph', () => {
		for (const step of WIZARD_STEPS) {
			expect(typeof shouldSkip(step, baseCtx)).toBe('boolean')
		}
	})
})

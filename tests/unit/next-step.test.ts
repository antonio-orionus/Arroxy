import {describe, expect, it} from 'vitest'
import {nextStep, type NavContext} from '@renderer/components/wizard/nextStep.js'

function ctx(overrides: Partial<NavContext> = {}): NavContext {
	return {activePreset: null, wizardMode: 'single', playlistSelection: null, wizardExtractor: 'youtube', hasSubtitles: true, wizardSubtitleSkipped: false, ...overrides}
}

describe('nextStep — forward', () => {
	it('url → playlistItems when playlist mode', () => {
		expect(nextStep('url', ctx({wizardMode: 'playlist'}), 'forward')).toBe('playlistItems')
	})

	it('url → formats when single mode', () => {
		expect(nextStep('url', ctx({wizardMode: 'single'}), 'forward')).toBe('formats')
	})

	it('formats → subtitles when subtitles available', () => {
		expect(nextStep('formats', ctx({hasSubtitles: true}), 'forward')).toBe('subtitles')
	})

	it('formats → sponsorblock when no subtitles available', () => {
		expect(nextStep('formats', ctx({hasSubtitles: false}), 'forward')).toBe('sponsorblock')
	})

	it('formats → output when subtitleSkipped (re-entry from skip)', () => {
		// SponsorBlock applies only to YouTube; skipping it for non-YouTube too.
		expect(nextStep('formats', ctx({wizardSubtitleSkipped: true, wizardExtractor: 'vimeo'}), 'forward')).toBe('output')
	})

	it('subtitles → sponsorblock on YouTube', () => {
		expect(nextStep('subtitles', ctx({wizardExtractor: 'youtube'}), 'forward')).toBe('sponsorblock')
	})

	it('subtitles → output on non-YouTube (sponsorblock hidden)', () => {
		expect(nextStep('subtitles', ctx({wizardExtractor: 'vimeo'}), 'forward')).toBe('output')
	})

	it('audio-only preset hides sponsorblock', () => {
		expect(nextStep('subtitles', ctx({activePreset: 'audio-only'}), 'forward')).toBe('output')
	})

	it('subtitle-only preset hides sponsorblock and output', () => {
		expect(nextStep('subtitles', ctx({activePreset: 'subtitle-only'}), 'forward')).toBe('folder')
	})

	it('returns null at confirm boundary', () => {
		expect(nextStep('confirm', ctx(), 'forward')).toBeNull()
	})
})

describe('nextStep — backward', () => {
	it('formats → url', () => {
		expect(nextStep('formats', ctx(), 'backward')).toBe('url')
	})

	it('confirm → folder', () => {
		expect(nextStep('confirm', ctx(), 'backward')).toBe('folder')
	})

	it('output → subtitles when subtitles available + not skipped', () => {
		expect(nextStep('output', ctx({hasSubtitles: true, wizardSubtitleSkipped: false, wizardExtractor: 'vimeo'}), 'backward')).toBe('subtitles')
	})

	it('output → formats when subtitles skipped', () => {
		expect(nextStep('output', ctx({wizardSubtitleSkipped: true, wizardExtractor: 'vimeo'}), 'backward')).toBe('formats')
	})

	it('folder → output for video presets', () => {
		expect(nextStep('folder', ctx({activePreset: 'best-quality'}), 'backward')).toBe('output')
	})

	it('folder → output for audio-only presets', () => {
		expect(nextStep('folder', ctx({activePreset: 'audio-only'}), 'backward')).toBe('output')
	})

	it('returns null at url boundary', () => {
		expect(nextStep('url', ctx(), 'backward')).toBeNull()
	})
})

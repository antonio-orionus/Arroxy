import {describe, expect, it} from 'vite-plus/test'
import {create} from 'zustand'
import type {AppState} from '@renderer/store/types.js'
import {singleDownloadBlocker} from '@renderer/store/wizard/singleDownloadReadiness.js'
import {createVideoPartSlice, partUnavailableReason, wizardVideoPart} from '@renderer/store/wizard/videoPart.js'

const READY: Parameters<typeof singleDownloadBlocker>[0] = {
	wizardMediaKind: 'video',
	selectedVideoFormatId: '22',
	audioSelection: {kind: 'none'},
	wizardSubtitleLanguages: [],
	wizardOutputDir: '/downloads',
	wizardSubfolderEnabled: false,
	wizardSubfolderName: '',
	wizardFilenameTemplate: '{title} [{id}]',
	wizardDuration: 600,
	wizardPart: null
}

function store(overrides: Partial<AppState> = {}) {
	return create<AppState>()((set, get) => ({...READY, ...createVideoPartSlice(set, get), ...overrides}) as AppState)
}

describe('part of video in the wizard', () => {
	it('opens on the whole length and closes back to the whole video', () => {
		const s = store()
		s.getState().setWizardPartEnabled(true)
		expect(s.getState().wizardPart).toEqual({start: '0:00', end: '10:00', exactCut: false})
		s.getState().setWizardPartStart('3:40')
		s.getState().setWizardPartEnd('7:15')
		s.getState().setWizardPartExactCut(true)
		expect(wizardVideoPart(s.getState())).toEqual({startSeconds: 220, endSeconds: 435, exactCut: true})
		s.getState().setWizardPartEnabled(false)
		expect(s.getState().wizardPart).toBeNull()
		expect(wizardVideoPart(s.getState())).toBeNull()
	})

	it('sets both ends from a chapter, keeping the exact-cut choice', () => {
		const s = store({wizardPart: {start: '0:00', end: '10:00', exactCut: true}})
		s.getState().setWizardPartRange(60, 125)
		expect(s.getState().wizardPart).toEqual({start: '1:00', end: '2:05', exactCut: true})
	})

	it("uses the link's start only when asked, keeping an end that still follows it", () => {
		const s = store({wizardUrlStartSeconds: 232})
		expect(s.getState().wizardPart).toBeNull()
		s.getState().useUrlStartForPart()
		expect(s.getState().wizardPart).toEqual({start: '3:52', end: '10:00', exactCut: false})
		s.getState().setWizardPartRange(0, 100)
		s.getState().useUrlStartForPart()
		expect(s.getState().wizardPart).toEqual({start: '3:52', end: '10:00', exactCut: false})
	})

	it('is unavailable in Subtitles mode and without a known length', () => {
		expect(partUnavailableReason({wizardMediaKind: 'subtitles', wizardDuration: 600})).toBe('subtitles')
		expect(partUnavailableReason({wizardMediaKind: 'video', wizardDuration: undefined})).toBe('noDuration')
		expect(partUnavailableReason({wizardMediaKind: 'audio', wizardDuration: 600})).toBeNull()
		expect(wizardVideoPart({wizardMediaKind: 'subtitles', wizardDuration: 600, wizardPart: {start: '0', end: '10', exactCut: false}})).toBeNull()
	})

	it('blocks Download while the range is invalid', () => {
		expect(singleDownloadBlocker({...READY, wizardPart: {start: '5:00', end: '4:00', exactCut: false}})).toBe('part')
		expect(singleDownloadBlocker({...READY, wizardPart: {start: '5:00', end: '11:00', exactCut: false}})).toBe('part')
		expect(singleDownloadBlocker({...READY, wizardPart: {start: '4:00', end: '5:00', exactCut: false}})).toBeNull()
		// Subtitles mode ignores a leftover part.
		expect(singleDownloadBlocker({...READY, wizardMediaKind: 'subtitles', wizardSubtitleLanguages: ['en'], wizardPart: {start: '5:00', end: '4:00', exactCut: false}})).toBeNull()
	})
})

// @vitest-environment jsdom
import {act, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {PlaylistSelection} from '@shared/types.js'
import {StepOutput} from '@renderer/components/wizard/StepOutput.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'

function renderBatch(playlistSelection: PlaylistSelection): void {
	act(() => useAppStore.setState({...RESET_WIZARD_STATE, wizardMode: 'playlist', playlistSelection}))
	render(<StepOutput />)
}

describe('StepOutput', () => {
	beforeEach(() => {
		act(() => useAppStore.setState({...RESET_WIZARD_STATE}))
	})

	it('offers thumbnail embedding for a batch whose files can hold cover art', () => {
		renderBatch({kind: 'audio', format: 'mp3', bitrateKbps: 192})
		expect(screen.getByTestId('embed-thumbnail-toggle')).toBeInTheDocument()
	})

	// "Best" audio keeps the source's own file where it is already a common
	// audio one (WAV, AIFF, WMA), which yt-dlp cannot embed into, so it offers no cover.
	it('hides thumbnail embedding for a batch whose files cannot hold cover art', () => {
		renderBatch({kind: 'audio', format: 'best'})
		expect(screen.queryByTestId('embed-thumbnail-toggle')).not.toBeInTheDocument()
		expect(screen.getByTestId('write-thumbnail-toggle')).toBeInTheDocument()
	})

	it('keeps the switch in single-video mode, where the review step warns per format', () => {
		act(() => useAppStore.setState({...RESET_WIZARD_STATE, wizardMode: 'single'}))
		render(<StepOutput />)
		expect(screen.getByTestId('embed-thumbnail-toggle')).toBeInTheDocument()
	})

	// Playlist files are found by `[<id>]` before the extension: an {id} elsewhere can't be matched.
	it('turns .m3u off with its reason when the template has {id} but not the [{id}] ending', () => {
		// Settings in the store report the intake window context to main.
		window.appApi = {intake: {setWindowContext: vi.fn().mockResolvedValue({ok: true, data: undefined})}} as unknown as typeof window.appApi
		act(() => useAppStore.setState({...RESET_WIZARD_STATE, wizardMode: 'playlist', settings: buildAppSettings({filenameTemplate: '{id} - {title}'})}))
		render(<StepOutput />)
		expect(screen.getByTestId('write-m3u-toggle')).toHaveAttribute('data-disabled')
		expect(screen.getByText("Unavailable because your filename template either doesn't end with [{id}] or sorts downloads into folders.")).toBeInTheDocument()
	})
})

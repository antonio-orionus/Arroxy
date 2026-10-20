// @vitest-environment jsdom
import {act, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vite-plus/test'
import type {PlaylistSelection} from '@shared/types.js'
import {StepOutput} from '@renderer/components/wizard/StepOutput.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'

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

	// "Best" audio is extracted into its codec's own file (.opus, .m4a), which holds a cover.
	it('offers thumbnail embedding for a best-audio batch', () => {
		renderBatch({kind: 'audio', format: 'best'})
		expect(screen.getByTestId('embed-thumbnail-toggle')).toBeInTheDocument()
	})

	it('keeps the switch in single-video mode, where the review step warns per format', () => {
		act(() => useAppStore.setState({...RESET_WIZARD_STATE, wizardMode: 'single'}))
		render(<StepOutput />)
		expect(screen.getByTestId('embed-thumbnail-toggle')).toBeInTheDocument()
	})
})

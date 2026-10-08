// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vitest'
import type {PlaylistSelection} from '@shared/schemas.js'
import {StepPlaylistPresets} from '@renderer/components/wizard/StepPlaylistPresets.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

const SUBS: PlaylistSelection = {kind: 'subtitles', languages: ['pl'], source: 'manual-first', mode: 'sidecar', format: 'srt'}

function setSelection(playlistSelection: PlaylistSelection | null): void {
	useAppStore.setState({playlistSelection, selectedPlaylistItemIds: ['b1', 'b2'], wizardMode: 'bulk', wizardStep: 'playlistPresets'} as never)
}

beforeEach(() => {
	setSelection({kind: 'video', tier: 'best', codec: 'best'})
})

describe('StepPlaylistPresets · subtitles batch', () => {
	it('offers a Subtitles type next to Video and Audio', () => {
		render(<StepPlaylistPresets />)

		expect(screen.getByRole('button', {name: 'Subtitles'})).toHaveAttribute('aria-pressed', 'false')
	})

	it('switches the batch to subtitles-only seeded with the UI language', async () => {
		render(<StepPlaylistPresets />)

		fireEvent.click(screen.getByRole('button', {name: 'Subtitles'}))

		await waitFor(() => expect(useAppStore.getState().playlistSelection).toEqual({kind: 'subtitles', languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'}))
		expect(screen.getByTestId('playlist-subtitle-languages')).toHaveTextContent('English')
		expect(screen.getByText('Only subtitle files are saved for each video — no video or audio is downloaded.')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled()
	})

	it('blocks continuing until at least one language is chosen', async () => {
		setSelection({...SUBS, languages: []})
		render(<StepPlaylistPresets />)

		expect(screen.getByText('Choose at least one language to continue.')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled()
		expect(screen.getByRole('button', {name: 'Skip to confirm'})).toBeDisabled()

		// Base UI only opens the list for input events that carry an `inputType`.
		fireEvent.input(screen.getByLabelText('Languages'), {target: {value: 'polish'}, inputType: 'insertText'})
		fireEvent.click(await screen.findByTestId('playlist-subtitle-language-option-pl'))

		await waitFor(() => expect(useAppStore.getState().playlistSelection).toMatchObject({kind: 'subtitles', languages: ['pl']}))
		expect(screen.queryByText('Choose at least one language to continue.')).not.toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled()
	})

	it('updates source, delivery, and format in the store', async () => {
		setSelection(SUBS)
		render(<StepPlaylistPresets />)

		fireEvent.click(screen.getByRole('button', {name: 'Auto-generated only'}))
		fireEvent.click(screen.getByRole('button', {name: 'subtitles/ subfolder'}))
		fireEvent.click(screen.getByRole('button', {name: 'VTT'}))

		await waitFor(() => expect(useAppStore.getState().playlistSelection).toEqual({...SUBS, source: 'auto-only', mode: 'subfolder', format: 'vtt'}))
	})

	it('keeps the subtitle choices when switching to another type and back', async () => {
		setSelection({...SUBS, languages: ['pl', 'de'], format: 'vtt'})
		render(<StepPlaylistPresets />)

		fireEvent.click(screen.getByRole('button', {name: 'Audio'}))
		await waitFor(() => expect(useAppStore.getState().playlistSelection).toEqual({kind: 'audio', format: 'best'}))

		fireEvent.click(screen.getByRole('button', {name: 'Subtitles'}))
		await waitFor(() => expect(useAppStore.getState().playlistSelection).toEqual({...SUBS, languages: ['pl', 'de'], format: 'vtt'}))
	})
})

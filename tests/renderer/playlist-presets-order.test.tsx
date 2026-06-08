// @vitest-environment jsdom
import {render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vitest'
import {DEFAULT_PLAYLIST_SELECTION} from '@shared/schemas.js'
import {StepPlaylistPresets} from '@renderer/components/wizard/StepPlaylistPresets.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

beforeEach(() => {
	useAppStore.setState({playlistSelection: {kind: 'video', tier: 'best', codec: 'best'}, selectedPlaylistItemIds: ['p1'], wizardMode: 'playlist', wizardStep: 'playlistPresets'} as never)
})

describe('StepPlaylistPresets', () => {
	it('uses brand styling for the active video/audio tab', () => {
		render(<StepPlaylistPresets />)

		expect(screen.getByRole('button', {name: 'Video'})).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', {name: 'Audio'})).toHaveAttribute('aria-pressed', 'false')
	})

	it('renders video quality tiers from highest to lowest', () => {
		render(<StepPlaylistPresets />)

		const qualityList = screen.getAllByRole('list').find(list => within(list).queryByText('Up to 360p') !== null)
		const expectedTierTitles = ['Best quality', 'Up to 4K', 'Up to 1440p', 'Up to 1080p', 'Up to 720p', 'Up to 480p', 'Up to 360p']

		expect(qualityList).toBeDefined()
		expect(
			within(qualityList!)
				.getAllByRole('button')
				.map(button => expectedTierTitles.find(title => within(button).queryByText(title) !== null))
		).toEqual(expectedTierTitles)
	})

	it('commits the displayed default playlist preset so the footer actions are enabled', async () => {
		useAppStore.setState({playlistSelection: null} as never)

		render(<StepPlaylistPresets />)

		await waitFor(() => expect(useAppStore.getState().playlistSelection).toEqual(DEFAULT_PLAYLIST_SELECTION))
		expect(screen.getByRole('button', {name: 'Continue'})).toBeEnabled()
		expect(screen.getByRole('button', {name: 'Skip to confirm'})).toBeEnabled()
	})
})

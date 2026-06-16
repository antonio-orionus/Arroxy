// @vitest-environment jsdom
import {fireEvent, render, screen, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {App} from '@renderer/App.js'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

describe('DownloadProfilesHome action rows', () => {
	beforeEach(() => {
		window.history.replaceState(null, '', '/')
		window.appApi = buildMockAppApi()
		window.platform = 'linux'
		useAppStore.setState({initialized: true, initializing: false, settings: defaultAppSettings('/tmp'), wizardStep: 'url', wizardUrl: '', formatsLoading: false, quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadQueueIds: [], queue: []})
		vi.clearAllMocks()
	})

	it('keeps secondary actions compact instead of stretching across wide panels', () => {
		render(
			<TooltipProvider>
				<StepUrlInput />
			</TooltipProvider>
		)

		const actionRows = screen.getByTestId('profiles-action-rows')

		expect(actionRows).toHaveClass('w-full')
		expect(actionRows).toHaveClass('lg:grid-cols-[repeat(2,minmax(0,35rem))]')
		expect(actionRows).toHaveClass('lg:justify-start')
	})

	it('keeps static supported-site proof out of the main URL workflow', () => {
		render(
			<TooltipProvider>
				<StepUrlInput />
			</TooltipProvider>
		)

		expect(screen.queryByTestId('url-capabilities')).not.toBeInTheDocument()
		expect(screen.queryByText('2000+ sites')).not.toBeInTheDocument()
	})

	it('uses the mascot as dynamic URL-panel guidance instead of a separate helper block', () => {
		render(
			<TooltipProvider>
				<StepUrlInput />
			</TooltipProvider>
		)

		const panel = screen.getByTestId('profiles-download-panel')

		expect(within(panel).getByTestId('profiles-mascot-header')).toBeInTheDocument()
		expect(within(panel).getByTestId('profiles-mascot-copy')).toHaveTextContent('Drop a link and let Arroxy pull it ✨')
		expect(within(panel).queryByText('Paste a video, playlist, channel, or search URL to get started.')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-mascot-help')).not.toBeInTheDocument()
	})
})

describe('About capabilities', () => {
	beforeEach(() => {
		window.history.replaceState(null, '', '/')
		window.appApi = buildMockAppApi()
		window.appVersion = '1.2.3'
		window.platform = 'linux'
		useAppStore.setState({initialized: true, initializing: false, settings: defaultAppSettings('/tmp'), wizardStep: 'url', wizardUrl: '', formatsLoading: false, quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadQueueIds: [], queue: [], aboutDialogOpen: false})
		vi.clearAllMocks()
	})

	it('moves the static supported-site proof into the About dialog', async () => {
		render(<App />)

		fireEvent.click(await screen.findByTestId('btn-about'))

		const about = await screen.findByTestId('about-dialog')
		const capabilities = within(about).getByTestId('about-capabilities')

		expect(within(capabilities).getByText('YouTube')).toBeVisible()
		expect(within(capabilities).getByText('2000+ sites')).toBeVisible()
		expect(within(capabilities).getByTestId('source-capability-site-logo-vimeo')).toBeInTheDocument()
		expect(within(capabilities).getByTestId('source-capability-any-site-tip')).toHaveAccessibleName('2000+ sites: Videos, Video playlists, Music playlists, Audio only, Subtitles')
	})
})

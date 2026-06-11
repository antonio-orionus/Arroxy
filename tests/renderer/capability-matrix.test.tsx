// @vitest-environment jsdom
import {render, screen, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {DownloadMascotHelpCard, MascotCapabilityMatrix} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

describe('MascotCapabilityMatrix', () => {
	it('keeps detailed capability chips out of the default view while exposing them through tip triggers', () => {
		render(
			<TooltipProvider>
				<MascotCapabilityMatrix />
			</TooltipProvider>
		)

		const matrix = screen.getByTestId('url-capabilities')

		expect(within(matrix).getByText('YouTube')).toBeVisible()
		expect(within(matrix).getByText('2000+ sites')).toBeVisible()
		expect(within(matrix).queryByText('Always available')).not.toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-youtube-mark')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-vimeo')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-twitch')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-tiktok')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-soundcloud')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-instagram')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-facebook')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-reddit')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-dailymotion')).toBeInTheDocument()
		expect(within(matrix).getByTestId('url-capability-site-logo-bilibili')).toBeInTheDocument()
		expect(within(matrix).queryByText('Videos')).not.toBeInTheDocument()
		expect(within(matrix).queryByText('Audio only')).not.toBeInTheDocument()

		expect(within(matrix).getByTestId('url-capability-youtube-tip')).toHaveAccessibleName('YouTube: Videos, Channels, Playlists, Shorts, Music, Podcasts')
		expect(within(matrix).getByTestId('url-capability-any-site-tip')).toHaveAccessibleName('2000+ sites: Videos, Video playlists, Music playlists, Audio only, Subtitles')
		expect(within(matrix).queryByTestId('url-capability-always-tip')).not.toBeInTheDocument()
	})
})

describe('DownloadMascotHelpCard', () => {
	it('stops stretching into a full-width empty band on extra-wide screens', () => {
		render(<DownloadMascotHelpCard help={{key: 'idle', title: 'Tip', body: 'Drop a link', points: ['Quick uses the active profile', 'Interactive reviews first'], image: ''}} />)

		const card = screen.getByTestId('profiles-mascot-help')

		expect(card).toHaveClass('w-full')
		expect(card).toHaveClass('xl:w-fit')
		expect(card).toHaveClass('xl:max-w-[64rem]')
		expect(card).toHaveClass('xl:self-start')
	})
})

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
})

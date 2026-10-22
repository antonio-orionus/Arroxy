// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {FitNotices} from '@renderer/components/wizard/format/FitNotices.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

beforeEach(() => {
	useAppStore.setState({wizardFitNotices: [], wizardFileTypeReset: null})
})

describe('FitNotices', () => {
	// The video may have larger rows than the profile's tier; the pick is the
	// closest below the tier, not the largest the video has (#657).
	it('never says the video tops out at a pick below the tier', () => {
		useAppStore.setState({wizardFitNotices: [{kind: 'video-tier-fallback', wanted: '480', picked: 360}]})
		render(<FitNotices />)
		const notice = screen.getByTestId('fit-notice-video-tier-fallback')
		expect(notice).toHaveTextContent('Your profile asks for 480p. This video has no 480p, so 360p, the closest below, is selected.')
		expect(notice).not.toHaveTextContent('only goes up to')
	})

	it('says when nothing is that small', () => {
		useAppStore.setState({wizardFitNotices: [{kind: 'video-tier-fallback', wanted: '240', picked: 480}]})
		render(<FitNotices />)
		expect(screen.getByTestId('fit-notice-video-tier-fallback')).toHaveTextContent('Your profile asks for 240p. This video has nothing that small, so 480p is selected.')
	})
})

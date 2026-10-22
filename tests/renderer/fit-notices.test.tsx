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
	it('says a tier was passed over for its codec or for being AI-upscaled', () => {
		useAppStore.setState({wizardFitNotices: [{kind: 'video-tier-fallback', wanted: '480', picked: 720, passedOver: 'h264'}]})
		const {unmount} = render(<FitNotices />)
		expect(screen.getByTestId('fit-notice-video-tier-fallback')).toHaveTextContent('Your profile asks for 480p in H.264. This video has 480p only in other codecs, so 720p in H.264 is selected.')
		unmount()
		useAppStore.setState({wizardFitNotices: [{kind: 'video-tier-fallback', wanted: '720', picked: 480, passedOver: 'ai-upscaled'}]})
		render(<FitNotices />)
		expect(screen.getByTestId('fit-notice-video-tier-fallback')).toHaveTextContent("Your profile asks for 720p. This video's 720p is AI-upscaled, so the original 480p is selected.")
	})
	it('says a tier did not fit the profile when no one reason explains it', () => {
		useAppStore.setState({wizardFitNotices: [{kind: 'video-tier-fallback', wanted: '720', picked: 480, passedOver: 'profile'}]})
		render(<FitNotices />)
		expect(screen.getByTestId('fit-notice-video-tier-fallback')).toHaveTextContent("Your profile asks for 720p. This video's 720p doesn't fit the rest of your profile, so 480p is selected.")
	})
})

// @vitest-environment jsdom
import {fireEvent, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {UrlStartOffer, VideoPartPanel, VideoPartSwitch} from '@renderer/components/wizard/format/VideoPartControls.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'

const CHAPTERS = [
	{title: 'Intro', startSeconds: 0, endSeconds: 60},
	{title: 'Main', startSeconds: 60, endSeconds: 400},
	{title: '', startSeconds: 400, endSeconds: 600}
]

function renderPart(): void {
	render(
		<>
			<VideoPartSwitch />
			<UrlStartOffer />
			<VideoPartPanel />
		</>
	)
}

beforeEach(() => {
	useAppStore.setState({settings: defaultAppSettings('/downloads'), wizardMediaKind: 'video', wizardDuration: 600, wizardChapters: CHAPTERS, wizardUrlStartSeconds: null, wizardPart: null})
})

describe('Part of video on the Format screen', () => {
	it('starts on the whole video and opens the range on Part', () => {
		renderPart()
		expect(screen.queryByTestId('video-part-panel')).toBeNull()

		fireEvent.click(screen.getByTestId('video-part-part'))

		expect(screen.getByTestId('video-part-start')).toHaveValue('0:00')
		expect(screen.getByTestId('video-part-end')).toHaveValue('10:00')
		expect(screen.getByTestId('video-part-connections-note')).toBeInTheDocument()
		expect(screen.getByTestId('video-part-exact-cut')).not.toBeChecked()
	})

	it('sets both ends from a chapter chip and names untitled chapters', () => {
		useAppStore.setState({wizardPart: {start: '0:00', end: '10:00', exactCut: false}})
		renderPart()

		fireEvent.click(screen.getByTestId('video-part-chapter-1'))

		expect(useAppStore.getState().wizardPart).toEqual({start: '1:00', end: '6:40', exactCut: false})
		expect(screen.getByTestId('video-part-chapter-2')).toHaveTextContent('Chapter 3')
	})

	it('says what is wrong with a range that cannot be downloaded', () => {
		useAppStore.setState({wizardPart: {start: '0:00', end: '10:00', exactCut: false}})
		renderPart()

		fireEvent.change(screen.getByTestId('video-part-end'), {target: {value: '12:00'}})

		expect(screen.getByTestId('video-part-error')).toHaveTextContent('The video ends at 10:00.')
		expect(screen.getByTestId('video-part-end')).toHaveAttribute('aria-invalid', 'true')
	})

	it("offers the link's start time without applying it", () => {
		useAppStore.setState({wizardUrlStartSeconds: 232})
		renderPart()
		expect(useAppStore.getState().wizardPart).toBeNull()

		fireEvent.click(screen.getByTestId('video-part-use-url-start'))

		expect(useAppStore.getState().wizardPart).toEqual({start: '3:52', end: '10:00', exactCut: false})
		expect(screen.queryByTestId('video-part-url-start')).toBeNull()
	})

	it('is switched off in Subtitles mode', () => {
		useAppStore.setState({wizardMediaKind: 'subtitles', wizardPart: {start: '0:00', end: '1:00', exactCut: false}, wizardUrlStartSeconds: 232})
		renderPart()

		expect(screen.getByTestId('video-part-whole')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('video-part-part')).toBeDisabled()
		expect(screen.queryByTestId('video-part-panel')).toBeNull()
		expect(screen.queryByTestId('video-part-url-start')).toBeNull()
	})
})

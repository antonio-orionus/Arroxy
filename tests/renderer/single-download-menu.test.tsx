import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {SingleDownloadActions} from '@renderer/components/wizard/SingleDownloadActions.js'
import {hasOpenOverlay} from '@renderer/components/shared/isTypingTarget.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

const addToQueue = vi.fn()
const addAndDownloadImmediately = vi.fn()

beforeEach(() => {
	addToQueue.mockReset().mockResolvedValue(undefined)
	addAndDownloadImmediately.mockReset().mockResolvedValue(undefined)
	useAppStore.setState({
		wizardMediaKind: 'video',
		selectedVideoFormatId: '22',
		audioSelection: {kind: 'none'},
		wizardSubtitleLanguages: [],
		wizardOutputDir: '/downloads',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		wizardFilenameTemplate: '{title}',
		wizardPart: null,
		isSubmittingToQueue: false,
		addToQueue,
		addAndDownloadImmediately
	})
})

// The chevron beside Download is a real menu: arrow keys reach its item,
// Escape closes it and hands focus back, and window shortcuts see it as open.
describe('Download split menu', () => {
	it('opens from the keyboard onto its item, and Escape returns focus to the chevron', async () => {
		render(<SingleDownloadActions />)
		const trigger = screen.getByTestId('btn-download-menu')
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

		trigger.focus()
		fireEvent.keyDown(trigger, {key: 'ArrowDown'})
		const menu = await screen.findByRole('menu')
		expect(hasOpenOverlay()).toBe(true)
		const item = screen.getByRole('menuitem', {name: 'Add to queue without starting'})
		await waitFor(() => expect(item).toHaveFocus())

		fireEvent.keyDown(menu, {key: 'Escape'})
		await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
		expect(hasOpenOverlay()).toBe(false)
		await waitFor(() => expect(trigger).toHaveFocus())
		expect(addToQueue).not.toHaveBeenCalled()
	})

	it('adds to the queue without starting the download, and closes', async () => {
		render(<SingleDownloadActions />)

		fireEvent.click(screen.getByTestId('btn-download-menu'))
		fireEvent.click(await screen.findByRole('menuitem', {name: 'Add to queue without starting'}))

		expect(addToQueue).toHaveBeenCalledOnce()
		expect(addAndDownloadImmediately).not.toHaveBeenCalled()
		await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
	})

	it('cannot open while Download is blocked', () => {
		useAppStore.setState({wizardOutputDir: ''})
		render(<SingleDownloadActions />)

		const trigger = screen.getByTestId('btn-download-menu')
		expect(trigger).toBeDisabled()
		fireEvent.click(trigger)
		expect(screen.queryByRole('menu')).toBeNull()
	})
})

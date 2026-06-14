import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '../shared/fixtures.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {useWhatsNewDialog} from '@renderer/components/system/useWhatsNewDialog.js'
import {WhatsNewDialog} from '@renderer/components/system/WhatsNewDialog.js'

const CHANGELOG = `# Changelog

## 1.2.0

This release makes updates easier to understand.

## Highlights

### Update Notes

- Shows a What's New popup after updating.

---

## 1.1.0

Older notes.
`

function Harness() {
	const state = useWhatsNewDialog(CHANGELOG)
	return <WhatsNewDialog open={state.open} notes={state.notes} onClose={state.close} onOpenFullNotes={state.openFullNotes} />
}

describe('useWhatsNewDialog', () => {
	beforeEach(() => {
		window.appVersion = '1.2.0'
		const settings = {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, launchCount: 3, lastReleaseNotesVersionShown: '1.1.0'}}
		const updatedSettings = {...settings, common: {...settings.common, lastReleaseNotesVersionShown: '1.2.0'}}
		window.appApi = {settings: {update: vi.fn().mockResolvedValue(ok(updatedSettings))}, shell: {openExternal: vi.fn().mockResolvedValue(ok({opened: true}))}} as never
		useAppStore.setState({initialized: true, initializing: false, splashDismissed: true, settings})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('opens for an unseen newer app version and persists the version after close', async () => {
		render(<Harness />)

		expect(await screen.findByTestId('whats-new-dialog')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Continue'}))

		await waitFor(() => {
			expect(window.appApi.settings.update).toHaveBeenCalledWith({common: {lastReleaseNotesVersionShown: '1.2.0'}})
		})
		expect(screen.queryByTestId('whats-new-dialog')).not.toBeInTheDocument()
	})

	it('opens the matching release page from the full-notes action', async () => {
		render(<Harness />)

		fireEvent.click(await screen.findByRole('button', {name: 'Full release notes ↗'}))

		expect(window.appApi.shell.openExternal).toHaveBeenCalledWith('https://github.com/antonio-orionus/Arroxy/releases/tag/v1.2.0')
	})
})

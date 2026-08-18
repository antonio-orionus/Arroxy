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

### Playlists

- Adds per-item profiles.

---

## 1.0.0

Ancient notes.

### Beginnings

- The first release.
`

function Harness() {
	const state = useWhatsNewDialog(CHANGELOG)
	return <WhatsNewDialog open={state.open} digest={state.digest} onClose={state.close} onOpenFullNotes={state.openFullNotes} />
}

function setSettings(lastReleaseNotesVersionShown: string | undefined): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({initialized: true, initializing: false, splashDismissed: true, settings: {...base, common: {...base.common, launchCount: 3, lastReleaseNotesVersionShown}}})
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

	it('shows every release the user skipped, not just the newest', async () => {
		window.appVersion = '1.2.0'
		setSettings('1.0.0')
		render(<Harness />)

		expect(await screen.findByTestId('whats-new-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('whats-new-release-1.2.0')).toBeInTheDocument()
		expect(screen.getByTestId('whats-new-release-1.1.0')).toBeInTheDocument()
		expect(screen.getByText('Adds per-item profiles.')).toBeInTheDocument()
		// 1.0.0 is what they already saw, so it stays out.
		expect(screen.queryByTestId('whats-new-release-1.0.0')).not.toBeInTheDocument()
	})

	it('shows only the newest release when the previous one was already seen', async () => {
		window.appVersion = '1.2.0'
		setSettings('1.1.0')
		render(<Harness />)

		expect(await screen.findByTestId('whats-new-release-1.2.0')).toBeInTheDocument()
		expect(screen.queryByTestId('whats-new-release-1.1.0')).not.toBeInTheDocument()
	})

	it('opens the matching release page from the full-notes action', async () => {
		render(<Harness />)

		fireEvent.click(await screen.findByRole('button', {name: 'Full release notes ↗'}))

		expect(window.appApi.shell.openExternal).toHaveBeenCalledWith('https://github.com/antonio-orionus/Arroxy/releases/tag/v1.2.0')
	})
})

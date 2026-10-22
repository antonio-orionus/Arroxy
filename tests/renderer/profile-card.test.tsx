// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {allDownloadProfiles, BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {ContextMenu, ContextMenuContent, ContextMenuTrigger} from '@renderer/components/ui/context-menu.js'
import {ProfilesManageTab} from '@renderer/components/wizard/DownloadProfilesManageTab.js'
import {ProfilePickerContextItems, ProfilePickerInline, type ProfilePickerLayout} from '@renderer/components/wizard/ProfilePicker.js'
import {profilePickerOptions} from '@renderer/components/wizard/profilePickerOptions.js'

// One profile card draws a profile wherever it is picked: the Profiles tab, the
// picker's grid and list, and the right-click menu. Each must say where the
// profile comes from (Built-in, Custom, Modified) and whether it is Hidden.

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`No built-in profile ${id}`)
	return profile
}

const BALANCED = builtin('balanced')
const MODIFIED_BALANCED: DownloadProfile = {...BALANCED, subtitles: {...BALANCED.subtitles, enabled: true, languages: ['en']}}
const PODCAST: DownloadProfile = {...builtin('audio-only'), id: 'podcast', name: 'Podcast MP3', icon: 'podcast'}
const LECTURES: DownloadProfile = {...builtin('balanced'), id: 'lectures', name: 'Lectures 720p', icon: 'classes', enabled: false}

// Balanced is modified and active, Podcast is custom, Lectures is custom and
// hidden, Full HD is a plain built-in and QHD a hidden built-in.
const PREFS: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'balanced'}, custom: [PODCAST, LECTURES], overrides: [MODIFIED_BALANCED], enabledOverrides: {'best-1440': false}, order: ['balanced', 'podcast', 'hd-1080', 'lectures', 'best-1440']}
const SAVED = allDownloadProfiles(PREFS)
const saved = (id: string): DownloadProfile => {
	const profile = SAVED.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`No saved profile ${id}`)
	return profile
}

const BADGES = ['Built-in', 'Custom', 'Modified', 'Hidden'] as const

// The badges a card shows, in order.
function badgesOf(card: HTMLElement): string[] {
	return [...card.querySelectorAll('[data-slot="badge"]')].map(badge => badge.textContent ?? '').filter(text => (BADGES as readonly string[]).includes(text))
}

const EXPECTED_BADGES: Record<string, string[]> = {balanced: ['Modified'], podcast: ['Custom'], 'hd-1080': ['Built-in'], lectures: ['Custom', 'Hidden'], 'best-1440': ['Built-in', 'Hidden']}

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('profile card on the Profiles tab', () => {
	function renderTab(onPick = vi.fn()): ReturnType<typeof vi.fn> {
		render(<ProfilesManageTab activeProfile={saved('balanced')} profiles={SAVED} profilesPrefs={PREFS} onEdit={vi.fn()} onMove={vi.fn()} onPick={onPick} onRemove={vi.fn()} onToggleEnabled={vi.fn()} />)
		return onPick
	}

	it('badges each profile by where it comes from, and Hidden when turned off', () => {
		renderTab()
		for (const [id, badges] of Object.entries(EXPECTED_BADGES)) expect(badgesOf(screen.getByTestId(`profiles-manage-card-${id}`)), id).toEqual(badges)
	})

	it('checks the active profile only', () => {
		renderTab()
		expect(screen.getByTestId('profiles-manage-card-balanced')).toHaveAttribute('data-active', 'true')
		expect(screen.getByTestId('profiles-manage-card-balanced-picker')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('profiles-manage-card-balanced-check')).toHaveClass('opacity-100')
		expect(screen.getByTestId('profiles-manage-card-podcast')).not.toHaveAttribute('data-active')
		expect(screen.getByTestId('profiles-manage-card-podcast-picker')).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByTestId('profiles-manage-card-podcast-check')).toHaveClass('opacity-0')
	})

	it('picks an enabled profile', () => {
		const onPick = renderTab()
		fireEvent.click(screen.getByTestId('profiles-manage-card-podcast-picker'))
		expect(onPick).toHaveBeenCalledExactlyOnceWith(saved('podcast'))
	})

	it('keeps a hidden profile from being picked until it is turned back on', () => {
		const onPick = renderTab()
		const pick = screen.getByTestId('profiles-manage-card-lectures-picker')
		expect(pick).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId('profiles-manage-card-lectures')).toHaveAttribute('data-disabled-profile', 'true')
		fireEvent.click(pick)
		fireEvent.click(screen.getByTestId('profiles-manage-card-best-1440-picker'))
		expect(onPick).not.toHaveBeenCalled()
	})

	it('describes the format to screen readers, not in the name', () => {
		renderTab()
		const pick = screen.getByTestId('profiles-manage-card-podcast-picker')
		const description = pick.getAttribute('aria-description') ?? ''
		expect(description).not.toBe('')
		expect(pick).toHaveAccessibleDescription(description)
		expect(pick).toHaveAccessibleName(/^Podcast MP3/)
		expect(pick.textContent).not.toContain(description)
	})
})

describe.each<ProfilePickerLayout>(['grid', 'list'])('profile card in the picker (%s)', layout => {
	// Rows that use the hidden Lectures profile, as a playlist row can: it shows first.
	const options = profilePickerOptions(PREFS, {current: saved('balanced'), inUse: [saved('lectures')]})

	function renderPicker(onPickProfile = vi.fn()): ReturnType<typeof vi.fn> {
		render(<ProfilePickerInline options={options} layout={layout} editProfile={null} onPickProfile={onPickProfile} onEditProfile={vi.fn()} onNewProfile={vi.fn()} testIdPrefix="kit" />)
		return onPickProfile
	}
	const option = (id: string): HTMLElement => screen.getByTestId(`kit-profile-option-${id}`)

	it('badges each option as the Profiles tab does', () => {
		renderPicker()
		for (const id of ['balanced', 'podcast', 'hd-1080', 'lectures']) expect(badgesOf(option(id)), id).toEqual(EXPECTED_BADGES[id])
		// A hidden profile nothing uses stays out of the picker.
		expect(screen.queryByTestId('kit-profile-option-best-1440')).toBeNull()
	})

	it('checks the current profile only', () => {
		renderPicker()
		const pressed = within(screen.getByTestId('kit-profile-menu-grid'))
			.getAllByRole('button')
			.filter(button => button.getAttribute('aria-pressed') === 'true')
		expect(pressed).toEqual([option('balanced')])
		expect(option('balanced')).toHaveAttribute('data-selected')
		expect(option('podcast')).not.toHaveAttribute('data-selected')
	})

	it('picks any option, a hidden one in use included', () => {
		const onPick = renderPicker()
		fireEvent.click(option('podcast'))
		fireEvent.click(option('lectures'))
		expect(onPick.mock.calls).toEqual([[{kind: 'custom', id: 'podcast'}], [{kind: 'custom', id: 'lectures'}]])
	})
})

describe('profile card in the right-click menu', () => {
	it('labels each item with the same name and badges, the menu checking the current one', async () => {
		const options = profilePickerOptions(PREFS, {current: saved('lectures'), inUse: [saved('lectures')]})
		const onPick = vi.fn()
		render(
			<ContextMenu>
				<ContextMenuTrigger data-testid="menu-target">rows</ContextMenuTrigger>
				<ContextMenuContent>
					<ProfilePickerContextItems options={options} label="Assign profile" onPick={onPick} />
				</ContextMenuContent>
			</ContextMenu>
		)
		fireEvent.contextMenu(screen.getByTestId('menu-target'))

		const items = await screen.findAllByRole('menuitemradio')
		const byName = (name: string): HTMLElement => {
			const item = items.find(candidate => candidate.textContent?.startsWith(name))
			if (!item) throw new Error(`No menu item ${name}`)
			return item
		}
		expect(badgesOf(byName('Lectures 720p'))).toEqual(['Custom', 'Hidden'])
		expect(badgesOf(byName('Balanced 720p'))).toEqual(['Modified'])
		expect(badgesOf(byName('Podcast MP3'))).toEqual(['Custom'])
		expect(badgesOf(byName('Full HD 1080p'))).toEqual(['Built-in'])
		expect(items.filter(item => item.getAttribute('aria-checked') === 'true')).toEqual([byName('Lectures 720p')])

		fireEvent.click(byName('Podcast MP3'))
		expect(onPick).toHaveBeenCalledExactlyOnceWith({kind: 'custom', id: 'podcast'})
	})
})

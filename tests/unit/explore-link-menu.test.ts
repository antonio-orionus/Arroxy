// @vitest-environment node
import type {MenuItemConstructorOptions} from 'electron'
import {describe, expect, it, vi} from 'vite-plus/test'
import {exploreLinkMenuTemplate, type ExploreLinkMenuDeps} from '@main/services/explore/exploreLinkMenu.js'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import type {ExploreLinkAction} from '@shared/exploreSchemas.js'
import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import {englishProfileName} from '../shared/profileNames.js'

// Right-clicking a link in the Explore page: the bar's Download, profile
// switch and Interactive, for the link instead of the page. Only links the
// download flow can take get them; any other web link can only be copied.

const WATCH = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function harness(prefs?: DownloadProfilesPrefs) {
	const sent: ExploreLinkAction[] = []
	const copy = vi.fn<(text: string) => void>()
	const deps: ExploreLinkMenuDeps = {profiles: () => prefs, lang: () => 'en', send: action => sent.push(action), copy}
	return {deps, sent, copy}
}

function item(template: MenuItemConstructorOptions[] | null, label: string): MenuItemConstructorOptions {
	const found = template?.find(entry => entry.label === label)
	if (!found) throw new Error(`no menu item "${label}" in ${JSON.stringify(template?.map(entry => entry.label ?? entry.type))}`)
	return found
}

function click(entry: MenuItemConstructorOptions): void {
	if (!entry.click) throw new Error(`"${entry.label}" has no click`)
	// Electron passes the item, the window and the event; the menu reads none of them.
	entry.click({} as never, undefined, {})
}

function submenu(entry: MenuItemConstructorOptions): MenuItemConstructorOptions[] {
	if (!Array.isArray(entry.submenu)) throw new Error(`"${entry.label}" has no submenu`)
	return entry.submenu
}

function customProfile(name: string, enabled = true): DownloadProfile {
	const base = resolveActiveDownloadProfile(undefined).profile
	return {...base, id: `custom-${name}`, name, enabled}
}

describe('Explore link menu', () => {
	it('offers no menu without a web link (plain page, image, text)', () => {
		const {deps} = harness()
		expect(exploreLinkMenuTemplate('', deps)).toBeNull()
		expect(exploreLinkMenuTemplate('javascript:alert(1)', deps)).toBeNull()
		expect(exploreLinkMenuTemplate('not a url', deps)).toBeNull()
	})

	it('only copies a link the download flow cannot take', () => {
		const {deps, copy, sent} = harness()
		const searchLink = 'https://www.youtube.com/results?search_query=cats'
		const template = exploreLinkMenuTemplate(searchLink, deps)

		expect(template?.map(entry => entry.label)).toEqual(['Copy link'])
		click(item(template, 'Copy link'))
		expect(copy).toHaveBeenCalledWith(searchLink)
		expect(sent).toEqual([])
	})

	it('lays out a video link like the bar: Download, Download with, Interactive, Copy link', () => {
		const {deps} = harness()
		const active = resolveActiveDownloadProfile(undefined).profile
		const template = exploreLinkMenuTemplate(WATCH, deps)

		expect(template?.map(entry => entry.label ?? entry.type)).toEqual([`Download · ${englishProfileName(active)}`, 'Download with', 'separator', 'Interactive Download: choose format, subtitles and more…', 'separator', 'Copy link'])
	})

	it('Download sends the link with the active profile', () => {
		const {deps, sent} = harness()
		const active = resolveActiveDownloadProfile(undefined).profile
		click(item(exploreLinkMenuTemplate(WATCH, deps), `Download · ${englishProfileName(active)}`))

		expect(sent).toEqual([{kind: 'download', url: WATCH}])
	})

	it('Download sends a show link as the playlist it is', () => {
		const {deps, sent} = harness()
		const active = resolveActiveDownloadProfile(undefined).profile
		click(item(exploreLinkMenuTemplate('https://www.youtube.com/show/VLPL1?sbp=abc', deps), `Download · ${englishProfileName(active)}`))

		expect(sent).toEqual([{kind: 'download', url: 'https://www.youtube.com/playlist?list=PL1'}])
	})

	it('Download with lists every enabled profile by name and marks the active one', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Podcasts'), customProfile('Hidden', false)]}
		const {deps} = harness(prefs)
		const profiles = submenu(item(exploreLinkMenuTemplate(WATCH, deps), 'Download with'))

		expect(profiles.map(entry => entry.label)).toEqual(enabledDownloadProfiles(prefs).map(englishProfileName))
		expect(profiles.map(entry => entry.label)).toContain('Podcasts')
		expect(profiles.map(entry => entry.label)).not.toContain('Hidden')
		const checked = profiles.filter(entry => entry.checked === true).map(entry => entry.label)
		expect(checked).toEqual([englishProfileName(resolveActiveDownloadProfile(prefs).profile)])
	})

	it('Download with follows the saved profile order, like every in-app picker', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Podcasts')], order: ['custom-Podcasts', 'audio-only']}
		const {deps} = harness(prefs)
		const profiles = submenu(item(exploreLinkMenuTemplate(WATCH, deps), 'Download with'))

		expect(profiles.slice(0, 2).map(entry => entry.label)).toEqual(['Podcasts', 'Audio only'])
		expect(profiles.every(entry => entry.type === 'radio')).toBe(true)
	})

	it('a pick in Download with sends the link with that profile', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Podcasts')]}
		const {deps, sent} = harness(prefs)
		const profiles = submenu(item(exploreLinkMenuTemplate(WATCH, deps), 'Download with'))

		click(item(profiles, 'Audio only'))
		click(item(profiles, 'Podcasts'))

		expect(sent).toEqual([
			{kind: 'download', url: WATCH, profile: {kind: 'builtin', id: 'audio-only'}},
			{kind: 'download', url: WATCH, profile: {kind: 'custom', id: 'custom-Podcasts'}}
		])
	})

	it('Interactive opens the step-by-step flow for the link', () => {
		const {deps, sent} = harness()
		click(item(exploreLinkMenuTemplate(WATCH, deps), 'Interactive Download: choose format, subtitles and more…'))

		expect(sent).toEqual([{kind: 'interactive', url: WATCH}])
	})

	it('sends the cleaned link and copies the link as the page had it', () => {
		const {deps, sent, copy} = harness()
		const shared = `${WATCH}&si=tracking123`
		const template = exploreLinkMenuTemplate(shared, deps)

		click(item(template, 'Interactive Download: choose format, subtitles and more…'))
		click(item(template, 'Copy link'))

		expect(sent).toEqual([{kind: 'interactive', url: WATCH}])
		expect(copy).toHaveBeenCalledWith(shared)
	})

	// A pick over the length the IPC schema takes would be dropped on the way to the renderer.
	it('only copies a link too long for a download pick', () => {
		const {deps} = harness()
		const long = `${WATCH}&list=${'x'.repeat(EXPLORE_ADDRESS_MAX)}`

		expect(exploreLinkMenuTemplate(long, deps)?.map(entry => entry.label)).toEqual(['Copy link'])
	})

	it('offers playlists and channels as well as videos', () => {
		const {deps} = harness()
		for (const link of ['https://www.youtube.com/playlist?list=PL1234567890', 'https://www.youtube.com/@somechannel']) {
			expect(exploreLinkMenuTemplate(link, deps)?.map(entry => entry.label)).toContain('Download with')
		}
	})

	// Electron reads `&` as a mnemonic marker on Windows and Linux.
	it('keeps an ampersand in a profile name as written', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Talks & Q&A')]}
		const {deps} = harness(prefs)
		const profiles = submenu(item(exploreLinkMenuTemplate(WATCH, deps), 'Download with'))

		expect(profiles.map(entry => entry.label)).toContain('Talks && Q&&A')
	})
})

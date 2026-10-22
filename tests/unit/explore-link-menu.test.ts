// @vitest-environment node
import type {MenuItemConstructorOptions} from 'electron'
import {describe, expect, it, vi} from 'vite-plus/test'
import {exploreLinkMenuTemplate, type ExploreLinkMenuDeps} from '@main/services/explore/exploreLinkMenu.js'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {exploreLinkActionSchema, type ExploreLinkAction} from '@shared/exploreSchemas.js'
import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import {englishProfileName} from '../shared/profileNames.js'

// Right-clicking a link in the Explore page: the bar's Download, profile
// switch and Interactive, for the link instead of the page. Only links the
// download flow can take get them; any other web link can only be copied.

const WATCH = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function harness(prefs?: DownloadProfilesPrefs, limit = 100) {
	const sent: ExploreLinkAction[] = []
	const copy = vi.fn<(text: string) => void>()
	const deps: ExploreLinkMenuDeps = {profiles: () => prefs, lang: () => 'en', playlistLimit: () => limit, send: action => sent.push(action), copy}
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

		expect(template?.map(entry => entry.label ?? entry.type)).toEqual([`Download · ${englishProfileName(active)}`, 'Download with', 'separator', 'Interactive Download…', 'separator', 'Copy link'])
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
		click(item(exploreLinkMenuTemplate(WATCH, deps), 'Interactive Download…'))

		expect(sent).toEqual([{kind: 'interactive', url: WATCH}])
	})

	it('sends the cleaned link and copies the link as the page had it', () => {
		const {deps, sent, copy} = harness()
		const shared = `${WATCH}&si=tracking123`
		const template = exploreLinkMenuTemplate(shared, deps)

		click(item(template, 'Interactive Download…'))
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

// A link to a video inside a list: this video's two items, then the list's
// two one-move answers in a submenu, then Interactive, then Copy link.
describe('Explore link menu on a video in a list', () => {
	const IN_PLAYLIST = `${WATCH}&list=PL1234567890&index=2`
	const IN_MIX = `${WATCH}&list=RDdQw4w9WgXcQ&start_radio=1`
	const labels = (template: MenuItemConstructorOptions[] | null): string[] => template?.map(entry => entry.label ?? entry.type ?? '') ?? []

	it.each([
		[IN_PLAYLIST, 'From this playlist'],
		[IN_MIX, 'From this Mix'],
		[`${WATCH}&list=RDCLAK5uy_x`, 'From this playlist'],
		[`https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=OLAK5uy_x`, 'From this album'],
		[`${WATCH}&list=UUx`, 'From this channel’s uploads'],
		[`${WATCH}&list=WL`, 'From Watch later'],
		[`${WATCH}&list=LL`, 'From your liked videos']
	])('lays out %s: this video, then %s, then Interactive, then Copy link', (link, fromList) => {
		const {deps} = harness()
		const active = englishProfileName(resolveActiveDownloadProfile(undefined).profile)
		const template = exploreLinkMenuTemplate(link, deps)

		expect(labels(template)).toEqual([`Download this video · ${active}`, 'This video with', 'separator', fromList, 'separator', 'Interactive Download…', 'separator', 'Copy link'])
		expect(labels(submenu(item(template, fromList)))).toEqual(['Download in the background', 'Download the first 100'])
	})

	it('names the load limit in Download the first N', () => {
		const {deps} = harness(undefined, 250)
		expect(labels(submenu(item(exploreLinkMenuTemplate(IN_PLAYLIST, deps), 'From this playlist')))).toContain('Download the first 250')
	})

	it('Download this video sends the video alone, with the active profile', () => {
		const {deps, sent} = harness()
		const active = englishProfileName(resolveActiveDownloadProfile(undefined).profile)
		click(item(exploreLinkMenuTemplate(IN_MIX, deps), `Download this video · ${active}`))

		expect(sent).toEqual([{kind: 'download-video', url: IN_MIX}])
	})

	it('a pick in This video with sends the video with that profile', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Podcasts')]}
		const {deps, sent} = harness(prefs)
		const profiles = submenu(item(exploreLinkMenuTemplate(IN_PLAYLIST, deps), 'This video with'))

		expect(profiles.map(entry => entry.label)).toEqual(enabledDownloadProfiles(prefs).map(englishProfileName))
		expect(profiles.filter(entry => entry.checked === true).map(entry => entry.label)).toEqual([englishProfileName(resolveActiveDownloadProfile(prefs).profile)])
		click(item(profiles, 'Podcasts'))

		expect(sent).toEqual([{kind: 'download-video', url: IN_PLAYLIST, profile: {kind: 'custom', id: 'custom-Podcasts'}}])
	})

	it('each list answer sends its own action; the first N is read when it runs', () => {
		const {deps, sent} = harness()
		const answers = submenu(item(exploreLinkMenuTemplate(IN_PLAYLIST, deps), 'From this playlist'))

		click(item(answers, 'Download in the background'))
		click(item(answers, 'Download the first 100'))

		expect(sent).toEqual([
			{kind: 'list', url: IN_PLAYLIST, answer: 'background'},
			{kind: 'list', url: IN_PLAYLIST, answer: 'first'}
		])
	})

	// As on the URL tab: Interactive asks how many to load (or the video alone) before loading anything.
	it('Interactive Download… sends the link to Interactive, which asks before loading', () => {
		const {deps, sent} = harness()
		click(item(exploreLinkMenuTemplate(IN_PLAYLIST, deps), 'Interactive Download…'))

		expect(sent).toEqual([{kind: 'interactive', url: IN_PLAYLIST}])
	})

	it('offers no plain Download on such a link', () => {
		const {deps} = harness()
		expect(labels(exploreLinkMenuTemplate(IN_PLAYLIST, deps))).not.toContain('Download with')
	})

	it('keeps an ampersand in the profile name of Download this video as written', () => {
		const prefs: DownloadProfilesPrefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [customProfile('Talks & Q&A')], active: {kind: 'custom', id: 'custom-Talks & Q&A'}}
		const {deps} = harness(prefs)
		expect(labels(exploreLinkMenuTemplate(IN_PLAYLIST, deps))[0]).toBe('Download this video · Talks && Q&&A')
	})
})

describe('exploreLinkActionSchema', () => {
	it.each<ExploreLinkAction>([
		{kind: 'download', url: WATCH},
		{kind: 'download', url: WATCH, profile: {kind: 'builtin', id: 'audio-only'}},
		{kind: 'download-video', url: WATCH},
		{kind: 'download-video', url: WATCH, profile: {kind: 'custom', id: 'custom-x'}},
		{kind: 'list', url: WATCH, answer: 'background'},
		{kind: 'list', url: WATCH, answer: 'first'},
		{kind: 'interactive', url: WATCH}
	])('accepts %o', action => {
		expect(exploreLinkActionSchema.safeParse(action).success).toBe(true)
	})

	it.each([
		{kind: 'list', url: WATCH, answer: 'all'},
		{kind: 'list', url: WATCH, answer: 'pick'},
		{kind: 'list', url: WATCH},
		{kind: 'list', url: WATCH, answer: 'first', count: 5},
		{kind: 'download-video', url: WATCH, playlistMode: 'video'},
		{kind: 'interactive', url: WATCH, profile: {kind: 'builtin', id: 'audio-only'}},
		{kind: 'video', url: WATCH}
	])('rejects %o', action => {
		expect(exploreLinkActionSchema.safeParse(action).success).toBe(false)
	})
})

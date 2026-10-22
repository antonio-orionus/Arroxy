import type {MenuItemConstructorOptions} from 'electron'
import {mainT} from '@main/i18n.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import {downloadProfileRefFor, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {ListKind} from '@shared/schemas.js'
import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs, ExploreLinkAction} from '@shared/types.js'
import {videoListKind} from '@shared/urlIntent.js'

export interface ExploreLinkMenuDeps {
	profiles: () => DownloadProfilesPrefs | undefined
	lang: () => SupportedLang
	// The playlist load limit, named in "Download the first N" (the pick reads it again when it runs).
	playlistLimit: () => number
	// To the renderer, which runs a pick as the bar's controls would.
	send: (action: ExploreLinkAction) => void
	copy: (text: string) => void
}

// The right-clicked link as a web address, or null for none (a plain spot,
// an image, text) and for any other scheme.
function webLink(raw: string): string | null {
	if (raw === '') return null
	try {
		const url = new URL(raw)
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
	} catch {
		return null
	}
}

// What the list's submenu is called, per kind (spec §3.4); spelled out so the unused-key check sees each key.
const FROM_LIST_KEY = {playlist: 'explore.linkMenu.fromList.playlist', mix: 'explore.linkMenu.fromList.mix', album: 'explore.linkMenu.fromList.album', uploads: 'explore.linkMenu.fromList.uploads', 'watch-later': 'explore.linkMenu.fromList.watchLater', liked: 'explore.linkMenu.fromList.liked'} as const satisfies Record<
	ListKind,
	string
>

// The background answer names the list: a native menu has no hint on Windows or Linux.
const BACKGROUND_KEY = {
	playlist: 'explore.linkMenu.background.playlist',
	mix: 'explore.linkMenu.background.mix',
	album: 'explore.linkMenu.background.album',
	uploads: 'explore.linkMenu.background.uploads',
	'watch-later': 'explore.linkMenu.background.watchLater',
	liked: 'explore.linkMenu.background.liked'
} as const satisfies Record<ListKind, string>

// Electron reads `&` as a mnemonic marker on Windows and Linux.
function menuText(text: string): string {
	return text.replaceAll('&', '&&')
}

// The Explore page's link menu: for a link the download flow can take, the
// bar's controls for that link (Download with the active profile, a profile
// pick that becomes the active profile, Interactive) and Copy link; for any
// other web link only Copy link; with no link, no menu (null). A link to a
// video in a list gets this video's items, then the list's one-move answers in
// a submenu (a native menu holds no number picker: the count is the load
// limit), then Interactive, which asks how many to load as the URL tab does.
export function exploreLinkMenuTemplate(linkURL: string, deps: ExploreLinkMenuDeps): MenuItemConstructorOptions[] | null {
	const link = webLink(linkURL)
	if (link === null) return null
	const lang = deps.lang()
	const copy: MenuItemConstructorOptions = {label: mainT(lang, 'explore.linkMenu.copyLink'), click: () => deps.copy(link)}
	const url = cleanUrl(link)
	// Longer than a pick may carry (exploreLinkActionSchema): it would be dropped on the way.
	if (url.length > EXPLORE_ADDRESS_MAX || !isExploreGrabbable(url)) return [copy]
	const prefs = deps.profiles()
	const active = resolveActiveDownloadProfile(prefs)
	const nameOf = (profile: DownloadProfile): string => downloadProfileName(profile, key => mainT(lang, key))
	const listKind = videoListKind(url)
	const interactive: MenuItemConstructorOptions = {label: mainT(lang, 'explore.linkMenu.interactive'), click: () => deps.send({kind: 'interactive', url})}
	// The in-app pickers' rule (saved order, current one marked) with the OS's own
	// marker: radio items. The active profile is never hidden, so none is tagged.
	const profiles = (pick: (profile: DownloadProfileRef) => ExploreLinkAction): MenuItemConstructorOptions[] =>
		enabledDownloadProfiles(prefs).map((profile): MenuItemConstructorOptions => {
			const ref = downloadProfileRefFor(profile, prefs)
			return {label: menuText(nameOf(profile)), type: 'radio', checked: ref.kind === active.ref.kind && ref.id === active.ref.id, click: () => deps.send(pick(ref))}
		})
	if (listKind) {
		const answers: MenuItemConstructorOptions[] = [
			{label: mainT(lang, BACKGROUND_KEY[listKind]), click: () => deps.send({kind: 'list', url, answer: 'background'})},
			{label: mainT(lang, 'explore.linkMenu.downloadFirst', {count: deps.playlistLimit()}), click: () => deps.send({kind: 'list', url, answer: 'first'})}
		]
		return [
			{label: menuText(mainT(lang, 'explore.linkMenu.downloadThisVideo', {profileName: nameOf(active.profile)})), click: () => deps.send({kind: 'download-video', url})},
			{label: mainT(lang, 'explore.linkMenu.thisVideoWith'), submenu: profiles(profile => ({kind: 'download-video', url, profile}))},
			{type: 'separator'},
			{label: mainT(lang, FROM_LIST_KEY[listKind]), submenu: answers},
			{type: 'separator'},
			interactive,
			{type: 'separator'},
			copy
		]
	}
	return [
		{label: menuText(mainT(lang, 'explore.toolbar.downloadWithProfile', {profileName: nameOf(active.profile)})), click: () => deps.send({kind: 'download', url})},
		{label: mainT(lang, 'explore.linkMenu.downloadWith'), submenu: profiles(profile => ({kind: 'download', url, profile}))},
		{type: 'separator'},
		interactive,
		{type: 'separator'},
		copy
	]
}

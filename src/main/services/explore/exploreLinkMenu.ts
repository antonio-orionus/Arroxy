import type {MenuItemConstructorOptions} from 'electron'
import {mainT} from '@main/i18n.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import {downloadProfileRefFor, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import type {DownloadProfile, DownloadProfilesPrefs, ExploreLinkAction} from '@shared/types.js'

export interface ExploreLinkMenuDeps {
	profiles: () => DownloadProfilesPrefs | undefined
	lang: () => SupportedLang
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

// Electron reads `&` as a mnemonic marker on Windows and Linux.
function menuText(text: string): string {
	return text.replaceAll('&', '&&')
}

// The Explore page's link menu: for a link the download flow can take, the
// bar's controls for that link (Download with the active profile, a profile
// pick that becomes the active profile, Interactive) and Copy link; for any
// other web link only Copy link; with no link, no menu (null).
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
	// The in-app pickers' rule (saved order, current one marked) with the OS's own
	// marker: radio items. The active profile is never hidden, so none is tagged.
	const profiles = enabledDownloadProfiles(prefs).map((profile): MenuItemConstructorOptions => {
		const ref = downloadProfileRefFor(profile, prefs)
		return {label: menuText(nameOf(profile)), type: 'radio', checked: ref.kind === active.ref.kind && ref.id === active.ref.id, click: () => deps.send({kind: 'download', url, profile: ref})}
	})
	return [
		{label: menuText(mainT(lang, 'explore.toolbar.downloadWithProfile', {profileName: nameOf(active.profile)})), click: () => deps.send({kind: 'download', url})},
		{label: mainT(lang, 'explore.linkMenu.downloadWith'), submenu: profiles},
		{type: 'separator'},
		{label: mainT(lang, 'explore.toolbar.interactiveHint'), click: () => deps.send({kind: 'interactive', url})},
		{type: 'separator'},
		copy
	]
}

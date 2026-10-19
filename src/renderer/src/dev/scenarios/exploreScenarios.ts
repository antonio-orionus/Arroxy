import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {AppSettings, ExploreViewState} from '@shared/types.js'

interface ScenarioLike {
	id: string
}

// The ad blocker is off by default; only `explore-adblock-on` and `explore-adblock-unavailable` turn it on.
const BLANK_VIEW: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}

const SAMPLE_PAGE: ExploreViewState = {...BLANK_VIEW, url: 'https://www.youtube.com/@sample-travel-films/videos', title: 'Sample page', canGoBack: true, signedIn: true}

// What the native Explore view would report for each Explore scenario. Every
// other scenario leaves the view blank.
export function buildExploreView(scenario: ScenarioLike): ExploreViewState {
	switch (scenario.id) {
		case 'explore-browsing':
		case 'explore-long-profile':
		case 'explore-address-refused':
			return SAMPLE_PAGE
		case 'explore-nudge':
			return {...SAMPLE_PAGE, signedIn: false}
		case 'explore-adblock-on':
			return {...SAMPLE_PAGE, adBlock: 'on'}
		case 'explore-adblock-unavailable':
			return {...SAMPLE_PAGE, adBlock: 'unavailable'}
		case 'explore-proxy-error':
			return {...BLANK_VIEW, url: 'https://www.youtube.com/', title: 'Sample page', error: 'proxy'}
		default:
			return BLANK_VIEW
	}
}

type CommonPatch = Partial<AppSettings['common']>

// Explore settings each Explore scenario starts from; `{}` for any other scenario.
export function exploreSettingsPatch(scenario: ScenarioLike): CommonPatch {
	switch (scenario.id) {
		case 'explore-notice':
			return {exploreEnabled: true, exploreNoticeSeen: false, cookiesMode: 'off', exploreModeAutoSwitched: false}
		case 'explore-browsing':
		case 'explore-long-profile':
		case 'explore-address-refused':
		case 'explore-proxy-error':
			return {exploreEnabled: true, exploreNoticeSeen: true, cookiesMode: 'explore', exploreModeAutoSwitched: true}
		case 'explore-adblock-unavailable':
		case 'explore-adblock-on':
			return {exploreEnabled: true, exploreNoticeSeen: true, cookiesMode: 'explore', exploreModeAutoSwitched: true, exploreAdBlock: true}
		case 'explore-nudge':
			// First open already happened, so the mode is left alone and only the nudge shows.
			return {exploreEnabled: true, exploreNoticeSeen: true, cookiesMode: 'file', exploreModeAutoSwitched: true, exploreModeNudgeDismissedFor: undefined}
		default:
			return {}
	}
}

// A custom profile with a long name, made active: the Download split's label at its widest.
const LONG_NAME_PROFILE_ID = 'custom-long-name'

// Profile prefs each Explore scenario starts from; `{}` keeps the defaults.
export function exploreProfilesPatch(scenario: ScenarioLike): Partial<AppSettings['profiles']> {
	if (scenario.id !== 'explore-long-profile') return {}
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'hd-1080')
	if (!base) return {}
	return {custom: [{...base, id: LONG_NAME_PROFILE_ID, name: 'Smart TV MP4 Full HD 1080p with English subtitles and chapters'}], active: {kind: 'custom', id: LONG_NAME_PROFILE_ID}}
}

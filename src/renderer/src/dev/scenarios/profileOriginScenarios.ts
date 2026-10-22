import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {AppSettings, DownloadProfile, DownloadProfileRef} from '@shared/types.js'

interface ScenarioLike {
	id: string
}

// Scenarios whose saved profiles carry every badge a profile card shows:
// Built-in, Custom, Modified and Hidden.
const PROFILE_ORIGIN_SCENARIO_IDS = ['profiles-manage-origins', 'profiles-picker-origins', 'playlist-profile-origins'] as const

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`No built-in profile ${id}`)
	return profile
}

const PODCAST_ID = 'origins-podcast'
const LECTURES_ID = 'origins-lectures'

const balanced = builtin('balanced')
// Balanced 720p with English subtitles turned on: a modified built-in, and the active profile.
const MODIFIED_BALANCED: DownloadProfile = {...balanced, subtitles: {...balanced.subtitles, enabled: true, languages: ['en']}}
const PODCAST: DownloadProfile = {...builtin('audio-only'), id: PODCAST_ID, name: 'Podcast MP3', icon: 'podcast', media: {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 128}}}
// A custom profile turned off: Hidden on the Profiles tab, and first in a picker for rows that still use it.
const LECTURES: DownloadProfile = {...builtin('balanced'), id: LECTURES_ID, name: 'Lectures 720p', icon: 'classes', enabled: false}

const ORIGINS_MODIFIED_REF: DownloadProfileRef = {kind: 'builtin', id: 'balanced'}
export const ORIGINS_CUSTOM_REF: DownloadProfileRef = {kind: 'custom', id: PODCAST_ID}
export const ORIGINS_HIDDEN_REF: DownloadProfileRef = {kind: 'custom', id: LECTURES_ID}

function isProfileOriginScenario(scenario: ScenarioLike): boolean {
	return (PROFILE_ORIGIN_SCENARIO_IDS as readonly string[]).includes(scenario.id)
}

// Profile prefs each origin scenario starts from; `{}` keeps the defaults.
export function profileOriginsPatch(scenario: ScenarioLike): Partial<AppSettings['profiles']> {
	if (!isProfileOriginScenario(scenario)) return {}
	return {
		active: ORIGINS_MODIFIED_REF,
		custom: [PODCAST, LECTURES],
		overrides: [MODIFIED_BALANCED],
		// Low data 240p stays off by default; QHD 1440p is a built-in turned off.
		enabledOverrides: {'best-1440': false},
		order: ['balanced', PODCAST_ID, 'hd-1080', 'best-quality', LECTURES_ID, 'best-1440']
	}
}

import {describe, expect, it} from 'vite-plus/test'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {DownloadProfile} from '@shared/types.js'
import {playlistBaselineProfile} from '@renderer/store/wizard/reviewedRowProfile.js'
import {projectProbeStart} from '@renderer/store/wizard/probeResultProjection.js'
import type {AppState} from '@renderer/store/types.js'

// A row's Review starts from the profile the row was placed with (#665).

const settings = defaultAppSettings('/downloads')
function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}
const custom: DownloadProfile = {...builtin('audio-only'), id: 'custom-1', name: 'My audio', enabled: false}

describe('playlistBaselineProfile', () => {
	it("takes the reviewed row's profile, else the active one", () => {
		expect(playlistBaselineProfile({settings, reviewPinnedProfile: {ref: {kind: 'builtin', id: 'audio-only'}, outputContext: {}}}).profile.id).toBe('audio-only')
		expect(playlistBaselineProfile({settings, reviewPinnedProfile: null}).ref).toEqual(settings.profiles.active)
	})

	it('falls back to the active profile when the pinned one was hidden since, as main does', () => {
		const withHidden = {...settings, profiles: {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [custom]}}
		expect(playlistBaselineProfile({settings: withHidden, reviewPinnedProfile: {ref: {kind: 'custom', id: 'custom-1'}, outputContext: {}}}).ref).toEqual(withHidden.profiles.active)
	})
})

describe('a reload of the same list', () => {
	it('keeps multi-profile mode, as a new list does not', () => {
		const state = {multiProfileMode: true, wizardStep: 'playlistItems', settings} as unknown as AppState
		expect(projectProbeStart(state, 'https://www.youtube.com/playlist?list=PL1', 'playlist', true).patch.multiProfileMode).toBe(true)
		expect(projectProbeStart(state, 'https://www.youtube.com/playlist?list=PL1', 'playlist').patch.multiProfileMode).toBe(false)
	})
})

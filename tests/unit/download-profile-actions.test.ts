import {describe, expect, it} from 'vite-plus/test'
import {buildDownloadProfileActionModel} from '@renderer/components/wizard/downloadProfileActions.js'
import {BUILTIN_DOWNLOAD_PROFILES, setDownloadProfileEnabled} from '@shared/downloadProfiles.js'
import type {DownloadProfilesPrefs} from '@shared/types.js'

describe('download profile action model', () => {
	it('projects the active profile, menu options, refs, and labels in one place', () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}

		const model = buildDownloadProfileActionModel(prefs)

		expect(model.activeProfile.id).toBe('audio-only')
		expect(model.options).toHaveLength(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.enabled).length)
		expect(model.options.find(option => option.profile.id === 'audio-only')).toMatchObject({current: true, ref: {kind: 'builtin', id: 'audio-only'}})
	})

	it("marks a download's own profile instead of the app's active one, listing it first when it is turned off", () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		const low = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'low-240')
		if (!balanced || !low) throw new Error('expected built-in profiles')

		const model = buildDownloadProfileActionModel(prefs, balanced)
		expect(model.activeProfile.id).toBe('balanced')
		expect(model.options.filter(option => option.current).map(option => option.profile.id)).toEqual(['balanced'])

		const turnedOff = buildDownloadProfileActionModel(prefs, low)
		expect(turnedOff.options[0]).toMatchObject({current: true, hidden: true, profile: {id: 'low-240'}})
	})

	it('hides disabled low-data profiles until they are enabled', () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}
		expect(buildDownloadProfileActionModel(prefs).options.some(option => option.profile.id === 'low-240')).toBe(false)

		const enabled = setDownloadProfileEnabled(prefs, 'low-240', true)
		expect(buildDownloadProfileActionModel(enabled).options.some(option => option.profile.id === 'low-240')).toBe(true)
	})
})

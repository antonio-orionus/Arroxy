import {describe, expect, it} from 'vitest'
import {buildDownloadProfileActionModel, quickProfileSummary} from '@renderer/components/wizard/downloadProfileActions.js'
import {BUILTIN_DOWNLOAD_PROFILES, setDownloadProfileEnabled} from '@shared/downloadProfiles.js'
import type {DownloadProfilesPrefs} from '@shared/types.js'

describe('download profile action model', () => {
	it('projects the active profile, menu options, refs, labels, and summaries in one place', () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}

		const model = buildDownloadProfileActionModel(prefs)

		expect(model.activeProfile.id).toBe('audio-only')
		expect(model.activeSummary).toBe('best audio')
		expect(model.options).toHaveLength(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.enabled).length)
		expect(model.options.find(option => option.profile.id === 'audio-only')).toMatchObject({active: true, ref: {kind: 'builtin', id: 'audio-only'}})
		expect(model.options.every(option => option.label.length > 0)).toBe(true)
	})

	it('hides disabled low-data profiles until they are enabled', () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}
		expect(buildDownloadProfileActionModel(prefs).options.some(option => option.profile.id === 'low-240')).toBe(false)

		const enabled = setDownloadProfileEnabled(prefs, 'low-240', true)
		expect(buildDownloadProfileActionModel(enabled).options.some(option => option.profile.id === 'low-240')).toBe(true)
	})

	it('summarizes profile media intent for compact controls', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		const small = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
		if (!balanced || !small) throw new Error('expected built-in profiles')

		expect(quickProfileSummary(balanced)).toBe('720p · best audio')
		expect(quickProfileSummary(small)).toBe('480p · best audio')
	})

	it('uses the default bitrate for lossy audio profile summaries with no explicit bitrate', () => {
		expect(quickProfileSummary({...BUILTIN_DOWNLOAD_PROFILES[0], media: {kind: 'audio-only', audio: {format: 'mp3'}}})).toBe('MP3 192K')
	})
})

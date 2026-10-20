import {createInstance} from 'i18next'
import {describe, expect, it} from 'vite-plus/test'
import {buildDownloadProfileActionModel, quickProfileSummary} from '@renderer/components/wizard/downloadProfileActions.js'
import {BUILTIN_DOWNLOAD_PROFILES, setDownloadProfileEnabled} from '@shared/downloadProfiles.js'
import {i18next} from '@shared/i18n/index.js'
import type {DownloadProfilesPrefs} from '@shared/types.js'

describe('download profile action model', () => {
	it('projects the active profile, menu options, refs, and labels in one place', () => {
		const prefs: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'audio-only'}, overrides: [], custom: [], enabledOverrides: {}}

		const model = buildDownloadProfileActionModel(prefs)

		expect(model.activeProfile.id).toBe('audio-only')
		expect(model.options).toHaveLength(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.enabled).length)
		expect(model.options.find(option => option.profile.id === 'audio-only')).toMatchObject({current: true, ref: {kind: 'builtin', id: 'audio-only'}})
		expect(model.options.every(option => option.label.length > 0)).toBe(true)
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

	it('summarizes profile media intent for compact controls', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		const small = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
		if (!balanced || !small) throw new Error('expected built-in profiles')

		expect(quickProfileSummary(balanced, i18next.t)).toBe('720p · best audio')
		expect(quickProfileSummary(small, i18next.t)).toBe('480p · best audio')
		expect(quickProfileSummary({...balanced, media: {kind: 'video-only', goal: 'best-picture', tier: 'best', fileType: 'auto'}}, i18next.t)).toBe('best video · no audio')
		expect(quickProfileSummary({...balanced, media: {kind: 'audio-only', audio: {format: 'best'}}}, i18next.t)).toBe('best audio')
	})

	it('words the summary from the catalog it is given', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		if (!balanced) throw new Error('expected built-in profiles')
		const catalog = createInstance()
		await catalog.init({lng: 'xx', resources: {xx: {translation: {wizard: {url: {profile: {summary: {bestAudio: 'beste Tonspur', noAudio: 'ohne Ton'}}}}}}}})

		expect(quickProfileSummary(balanced, catalog.t)).toBe('720p · beste Tonspur')
		expect(quickProfileSummary({...balanced, media: {kind: 'video-only', goal: 'best-picture', tier: '480', fileType: 'auto'}}, catalog.t)).toBe('480p · ohne Ton')
	})

	it('uses the default bitrate for lossy audio profile summaries with no explicit bitrate', () => {
		expect(quickProfileSummary({...BUILTIN_DOWNLOAD_PROFILES[0], media: {kind: 'audio-only', audio: {format: 'mp3'}}}, i18next.t)).toBe('MP3 192K')
	})
})

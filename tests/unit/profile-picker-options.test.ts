import {describe, expect, it} from 'vite-plus/test'
import {profilePickerOptions} from '@renderer/components/wizard/profilePickerOptions.js'
import {playlistProfileMenuModel} from '@renderer/components/wizard/playlistProfileMenu.js'
import {allDownloadProfiles, BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`expected built-in ${id}`)
	return profile
}

const PODCAST: DownloadProfile = {...builtin('audio-only'), id: 'podcast', name: 'Podcast'}
const LECTURES: DownloadProfile = {...builtin('balanced'), id: 'lectures', name: 'Lectures', enabled: false}

// Two built-ins hidden, one custom profile hidden, and a saved order that moves the custom ones up.
const PREFS: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'balanced'}, custom: [PODCAST, LECTURES], overrides: [], enabledOverrides: {'best-2160': false, 'best-1440': false}, order: ['podcast', 'balanced', 'lectures', 'hd-1080']}

function saved(id: string): DownloadProfile {
	const profile = allDownloadProfiles(PREFS).find(candidate => candidate.id === id)
	if (!profile) throw new Error(`expected saved profile ${id}`)
	return profile
}

const ids = (options: readonly {profile: DownloadProfile}[]): string[] => options.map(option => option.profile.id)
const enabledIds = allDownloadProfiles(PREFS)
	.filter(profile => profile.enabled)
	.map(profile => profile.id)

describe('profilePickerOptions', () => {
	it('lists the enabled profiles in the saved order and marks the current one', () => {
		const options = profilePickerOptions(PREFS, {current: saved('balanced')})

		expect(ids(options)).toEqual(enabledIds)
		expect(ids(options).slice(0, 3)).toEqual(['podcast', 'balanced', 'hd-1080'])
		expect(options.filter(option => option.current).map(option => option.profile.id)).toEqual(['balanced'])
		expect(options.every(option => !option.hidden)).toBe(true)
	})

	it('marks nothing without a current profile', () => {
		expect(profilePickerOptions(PREFS, {current: null}).some(option => option.current)).toBe(false)
	})

	it('shows a hidden current profile first, tagged hidden', () => {
		const options = profilePickerOptions(PREFS, {current: saved('best-1440')})

		expect(ids(options)).toEqual(['best-1440', ...enabledIds])
		expect(options[0]).toMatchObject({current: true, hidden: true, ref: {kind: 'builtin', id: 'best-1440'}})
	})

	it('shows hidden profiles in use first, in the saved order, without marking them', () => {
		const options = profilePickerOptions(PREFS, {current: null, inUse: [saved('best-1440'), saved('lectures'), saved('hd-1080')]})

		expect(ids(options)).toEqual(['lectures', 'best-1440', ...enabledIds])
		expect(options.slice(0, 2).every(option => option.hidden && !option.current)).toBe(true)
		expect(options[0]?.ref).toEqual({kind: 'custom', id: 'lectures'})
	})

	it('still shows a current profile deleted since it was picked, first', () => {
		const deleted: DownloadProfile = {...PODCAST, id: 'deleted', name: 'Deleted'}
		const options = profilePickerOptions(PREFS, {current: deleted})

		expect(ids(options)).toEqual(['deleted', ...enabledIds])
		expect(options[0]).toMatchObject({current: true, hidden: true})
	})
})

describe('playlistProfileMenuModel', () => {
	it('marks and edits the profile every target row shares', () => {
		const menu = playlistProfileMenuModel(PREFS, [saved('podcast'), saved('podcast')])

		expect(menu.sharedProfile?.id).toBe('podcast')
		expect(menu.options.filter(option => option.current).map(option => option.profile.id)).toEqual(['podcast'])
	})

	it('marks nothing for rows on different profiles, and still offers their hidden profile first', () => {
		const menu = playlistProfileMenuModel(PREFS, [saved('lectures'), saved('balanced')])

		expect(menu.sharedProfile).toBeNull()
		expect(menu.options.some(option => option.current)).toBe(false)
		expect(ids(menu.options)).toEqual(['lectures', ...enabledIds])
	})

	it('marks a hidden profile the rows share', () => {
		const menu = playlistProfileMenuModel(PREFS, [saved('lectures')])

		expect(menu.options[0]).toMatchObject({current: true, hidden: true, profile: {id: 'lectures'}})
	})
})

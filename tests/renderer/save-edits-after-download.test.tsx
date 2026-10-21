// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {setNotificationSink, type NotificationActions, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {fail, ok} from '@shared/result.js'
import {DOWNLOAD_PROFILE_NAME_MAX, updateSettingsSchema} from '@shared/schemas.js'
import type {DownloadProfile} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// After a download whose settings differ from its profile, a toast offers to
// save them as a new profile. Clicking it saves the profile and says so only
// when the settings write went through.

const WATCH_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

const notices: {level: NotificationLevel; message: string; id: string; actions?: NotificationActions}[] = []

function hd1080(): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === 'hd-1080')
	if (!profile) throw new Error('no builtin hd-1080')
	return profile
}

beforeEach(() => {
	const api = buildMockAppApi()
	// Main validates every settings write against the schema and fails the ones it rejects.
	vi.mocked(api.settings.update).mockImplementation(patch => {
		const settings = useAppStore.getState().settings
		return Promise.resolve(updateSettingsSchema.safeParse(patch).success && settings ? ok(settings) : fail({code: 'unknown', message: 'invalid settings'}))
	})
	window.appApi = api
	notices.length = 0
	setNotificationSink((level, message, id, actions) => notices.push({level, message, id, actions}))
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue: []})
})

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
})

// Queues a download started from `profile` with a change the profile lacks, then clicks Save edits.
async function downloadWithEditsAndSave(profile: DownloadProfile): Promise<void> {
	useAppStore.getState().setWizardUrl(WATCH_URL)
	await useAppStore.getState().submitUrl()
	expect(useAppStore.getState().wizardStep).toBe('formats')
	useAppStore.setState(profilePatch(profile, useAppStore.getState()))
	useAppStore.setState({wizardWriteThumbnail: true})

	await useAppStore.getState().addToQueue()

	const offer = notices.find(notice => notice.id === 'save-edits')
	expect(offer?.actions).toBeDefined()
	offer?.actions?.[0].onClick()
	await vi.waitFor(() => expect(notices.some(notice => notice.id === 'profile-saved' || notice.id === 'settings-save')).toBe(true))
}

function savedCustomProfiles(): DownloadProfile[] {
	return useAppStore.getState().settings?.profiles.custom ?? []
}

describe('Save edits after a download', () => {
	it('saves the edits of a profile whose name is near the length limit', async () => {
		const longName = 'p'.repeat(75)

		await downloadWithEditsAndSave({...hd1080(), id: 'custom-long', name: longName})

		expect(notices.filter(notice => notice.level === 'error')).toEqual([])
		expect(notices.find(notice => notice.id === 'profile-saved')?.level).toBe('info')
		const saved = savedCustomProfiles().find(profile => profile.name?.endsWith('(edited)'))
		expect(saved?.name?.length).toBeLessThanOrEqual(DOWNLOAD_PROFILE_NAME_MAX)
	})

	it('does not say the profile was saved when the settings write fails', async () => {
		vi.mocked(window.appApi.settings.update).mockResolvedValue(fail({code: 'unknown', message: 'disk full'}))

		await downloadWithEditsAndSave(hd1080())

		expect(notices.find(notice => notice.id === 'settings-save')?.level).toBe('error')
		expect(notices.filter(notice => notice.id === 'profile-saved')).toEqual([])
		expect(savedCustomProfiles()).toEqual([])
	})
})

import {useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {classifyBulkUrlKind} from '@shared/bulkUrls.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {allDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {useAppStore} from './useAppStore.js'

export type DownloadInputType = 'Single URL' | 'Playlist URL' | 'Channel URL' | 'Search URL' | 'URL' | 'Unsupported URL' | 'Unknown URL'

export interface DownloadHomeView {
	activeProfile: DownloadProfile
	cookiesConfigDialogIssue: ReturnType<typeof useAppStore.getState>['cookiesConfigDialogIssue']
	dismissCookiesConfigDialog: ReturnType<typeof useAppStore.getState>['dismissCookiesConfigDialog']
	hasActiveDownloads: boolean
	hasInput: boolean
	inputType: DownloadInputType | null
	openCookiesSettings: ReturnType<typeof useAppStore.getState>['openCookiesSettings']
	profiles: DownloadProfile[]
	profilesPrefs: DownloadProfilesPrefs | undefined
	quickDownload: ReturnType<typeof useAppStore.getState>['quickDownload']
	quickDownloadError: ReturnType<typeof useAppStore.getState>['quickDownloadError']
	quickDownloadStatus: ReturnType<typeof useAppStore.getState>['quickDownloadStatus']
	quickPreparing: boolean
	removeDownloadProfile: ReturnType<typeof useAppStore.getState>['removeDownloadProfile']
	saveDownloadProfile: ReturnType<typeof useAppStore.getState>['saveDownloadProfile']
	setActiveDownloadProfile: ReturnType<typeof useAppStore.getState>['setActiveDownloadProfile']
	setWizardUrl: ReturnType<typeof useAppStore.getState>['setWizardUrl']
	submitUrl: ReturnType<typeof useAppStore.getState>['submitUrl']
	urlReady: boolean
	wizardUrl: string
}

function detectUrlType(value: string): DownloadInputType | null {
	const trimmed = value.trim()
	if (!trimmed) return null
	try {
		const cleaned = cleanUrl(trimmed)
		const url = new URL(cleaned)
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'Unsupported URL'
		if (!url.hostname.trim()) return 'Unsupported URL'
		const kind = classifyBulkUrlKind(cleaned)
		if (kind === 'single') return 'Single URL'
		if (kind === 'playlist') return 'Playlist URL'
		if (kind === 'channel') return 'Channel URL'
		if (kind === 'search') return 'Search URL'
		return 'URL'
	} catch {
		return 'Unknown URL'
	}
}

export function useDownloadHomeView(): DownloadHomeView {
	const state = useAppStore(
		useShallow(s => ({
			cookiesConfigDialogIssue: s.cookiesConfigDialogIssue,
			dismissCookiesConfigDialog: s.dismissCookiesConfigDialog,
			hasActiveDownloads: s.queue.some(item => item.status === 'running'),
			openCookiesSettings: s.openCookiesSettings,
			profilesPrefs: s.settings?.profiles,
			quickDownload: s.quickDownload,
			quickDownloadError: s.quickDownloadError,
			quickDownloadStatus: s.quickDownloadStatus,
			removeDownloadProfile: s.removeDownloadProfile,
			saveDownloadProfile: s.saveDownloadProfile,
			setActiveDownloadProfile: s.setActiveDownloadProfile,
			setWizardUrl: s.setWizardUrl,
			submitUrl: s.submitUrl,
			wizardUrl: s.wizardUrl
		}))
	)
	const profiles = useMemo(() => allDownloadProfiles(state.profilesPrefs), [state.profilesPrefs])
	const activeProfile = useMemo(() => resolveActiveDownloadProfile(state.profilesPrefs).profile, [state.profilesPrefs])
	const inputType = useMemo(() => detectUrlType(state.wizardUrl), [state.wizardUrl])
	const hasInput = state.wizardUrl.trim().length > 0
	const quickPreparing = state.quickDownloadStatus === 'preparing'

	return {...state, activeProfile, hasInput, inputType, profiles, quickPreparing, urlReady: inputType !== null && inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'}
}

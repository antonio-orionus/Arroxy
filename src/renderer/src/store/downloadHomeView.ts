import {useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {cleanUrl} from '@shared/cleanUrl.js'
import {allDownloadProfiles, resolveActiveDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import {classifyUrlIntent, urlIntentHomeLabel} from '@shared/urlIntent.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {useAppStore} from './useAppStore.js'

export type DownloadInputType = 'Single URL' | 'Playlist URL' | 'Channel URL' | 'Search URL' | 'Mixed URL' | 'URL' | 'Unsupported URL' | 'Unknown URL'
export type ActiveProfileDestinationDetailKey = 'wizard.url.profile.destinationDetail.global' | 'wizard.url.profile.destinationDetail.globalSubfolder' | 'wizard.url.profile.destinationDetail.override' | 'wizard.url.profile.destinationDetail.overrideSubfolder'

export interface DownloadHomeView {
	activeProfileDestination: string
	activeProfileDestinationDetailKey: ActiveProfileDestinationDetailKey
	activeProfile: DownloadProfile
	chooseWizardFolder: ReturnType<typeof useAppStore.getState>['chooseWizardFolder']
	commonPaths: ReturnType<typeof useAppStore.getState>['commonPaths']
	cookiesConfigDialogIssue: ReturnType<typeof useAppStore.getState>['cookiesConfigDialogIssue']
	dismissCookiesConfigDialog: ReturnType<typeof useAppStore.getState>['dismissCookiesConfigDialog']
	globalDestinationRoot: string
	hasActiveDownloads: boolean
	hasInput: boolean
	inputType: DownloadInputType | null
	openCookiesSettings: ReturnType<typeof useAppStore.getState>['openCookiesSettings']
	profiles: DownloadProfile[]
	profilesPrefs: DownloadProfilesPrefs | undefined
	quickDownload: ReturnType<typeof useAppStore.getState>['quickDownload']
	moveDownloadProfile: ReturnType<typeof useAppStore.getState>['moveDownloadProfile']
	removeDownloadProfile: ReturnType<typeof useAppStore.getState>['removeDownloadProfile']
	saveDownloadProfile: ReturnType<typeof useAppStore.getState>['saveDownloadProfile']
	setActiveDownloadProfile: ReturnType<typeof useAppStore.getState>['setActiveDownloadProfile']
	setDownloadProfileEnabled: ReturnType<typeof useAppStore.getState>['setDownloadProfileEnabled']
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
		return urlIntentHomeLabel(classifyUrlIntent(cleaned))
	} catch {
		return 'Unknown URL'
	}
}

function activeProfileDestinationDetailKey(profile: DownloadProfile): ActiveProfileDestinationDetailKey {
	if (profile.output.kind === 'fixed') return profile.subfolder.enabled ? 'wizard.url.profile.destinationDetail.overrideSubfolder' : 'wizard.url.profile.destinationDetail.override'
	return profile.subfolder.enabled ? 'wizard.url.profile.destinationDetail.globalSubfolder' : 'wizard.url.profile.destinationDetail.global'
}

export function useDownloadHomeView(): DownloadHomeView {
	const state = useAppStore(
		useShallow(s => ({
			cookiesConfigDialogIssue: s.cookiesConfigDialogIssue,
			dismissCookiesConfigDialog: s.dismissCookiesConfigDialog,
			hasActiveDownloads: s.queue.some(item => item.status === 'running'),
			openCookiesSettings: s.openCookiesSettings,
			commonSettings: s.settings?.common,
			chooseWizardFolder: s.chooseWizardFolder,
			profilesPrefs: s.settings?.profiles,
			quickDownload: s.quickDownload,
			moveDownloadProfile: s.moveDownloadProfile,
			removeDownloadProfile: s.removeDownloadProfile,
			saveDownloadProfile: s.saveDownloadProfile,
			setActiveDownloadProfile: s.setActiveDownloadProfile,
			setDownloadProfileEnabled: s.setDownloadProfileEnabled,
			setWizardUrl: s.setWizardUrl,
			submitUrl: s.submitUrl,
			wizardOutputDir: s.wizardOutputDir,
			wizardUrl: s.wizardUrl
		}))
	)
	const profiles = useMemo(() => allDownloadProfiles(state.profilesPrefs), [state.profilesPrefs])
	const activeProfile = useMemo(() => resolveActiveDownloadProfile(state.profilesPrefs).profile, [state.profilesPrefs])
	const commonSettings = state.commonSettings
	const activeProfileDestination = useMemo(() => {
		try {
			const outputDir = resolveDownloadProfileOutputDir(activeProfile, {currentOutputDir: state.wizardOutputDir ?? '', defaultOutputDir: commonSettings?.defaultOutputDir ?? ''})
			return formatHomeRelativePath(outputDir, commonSettings?.commonPaths)
		} catch {
			return ''
		}
	}, [activeProfile, commonSettings, state.wizardOutputDir])
	const globalDestinationRoot = state.wizardOutputDir?.trim() ? state.wizardOutputDir : (commonSettings?.defaultOutputDir ?? '')
	const inputType = useMemo(() => detectUrlType(state.wizardUrl), [state.wizardUrl])
	const hasInput = state.wizardUrl.trim().length > 0

	return {
		...state,
		activeProfile,
		activeProfileDestination,
		activeProfileDestinationDetailKey: activeProfileDestinationDetailKey(activeProfile),
		commonPaths: commonSettings?.commonPaths,
		globalDestinationRoot,
		hasInput,
		inputType,
		profiles,
		urlReady: inputType !== null && inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'
	}
}

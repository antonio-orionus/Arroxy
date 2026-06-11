import {useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {cleanUrl} from '@shared/cleanUrl.js'
import {allDownloadProfiles, resolveActiveDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import {classifyUrlIntent, urlIntentHomeLabel} from '@shared/urlIntent.js'
import type {DownloadProfile, DownloadProfilesPrefs, ProbeError} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {useAppStore} from './useAppStore.js'
import {buildProbeErrorExperience, type ProbeErrorExperience} from './wizard/probeErrorExperience.js'
import type {QuickDownloadFailure, QuickDownloadFailureMessageKey} from './wizard/quickDownloadFeedback.js'

export type DownloadInputType = 'Single URL' | 'Playlist URL' | 'Channel URL' | 'Search URL' | 'Mixed URL' | 'URL' | 'Unsupported URL' | 'Unknown URL'
export type QuickDownloadFailureMessage = {kind: 'i18n'; key: QuickDownloadFailureMessageKey} | {kind: 'text'; text: string} | {kind: 'probe'; error: ProbeError} | {kind: 'bulk-probe'; error: ProbeError}

export interface DownloadHomeView {
	activeProfileDestination: string
	activeProfileDestinationDetail: string
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
	quickDownloadFailure: QuickDownloadFailure | null
	quickDownloadFailureMessage: QuickDownloadFailureMessage | null
	quickDownloadProbeExperience: ProbeErrorExperience | null
	quickDownloadProgressFailed: ReturnType<typeof useAppStore.getState>['quickDownloadProgressFailed']
	quickDownloadStatus: ReturnType<typeof useAppStore.getState>['quickDownloadStatus']
	quickPreparing: boolean
	removeDownloadProfile: ReturnType<typeof useAppStore.getState>['removeDownloadProfile']
	retryQuickDownloadFailure: ReturnType<typeof useAppStore.getState>['retryQuickDownloadFailure']
	retryQuickDownloadWithCookies: ReturnType<typeof useAppStore.getState>['retryQuickDownloadWithCookies']
	saveDownloadProfile: ReturnType<typeof useAppStore.getState>['saveDownloadProfile']
	setActiveDownloadProfile: ReturnType<typeof useAppStore.getState>['setActiveDownloadProfile']
	setWizardUrl: ReturnType<typeof useAppStore.getState>['setWizardUrl']
	submitUrl: ReturnType<typeof useAppStore.getState>['submitUrl']
	urlReady: boolean
	wizardUrl: string
}

function quickDownloadProbeFailure(failure: QuickDownloadFailure | null): ProbeError | null {
	return failure?.kind === 'probe' || failure?.kind === 'bulk-probe' ? failure.error : null
}

function quickDownloadFailureMessage(failure: QuickDownloadFailure | null): QuickDownloadFailureMessage | null {
	if (!failure) return null
	if (failure.kind === 'probe') return {kind: 'probe', error: failure.error}
	if (failure.kind === 'bulk-probe') return {kind: 'bulk-probe', error: failure.error}
	if (failure.kind === 'prepare') return {kind: 'i18n', key: failure.messageKey}
	return {kind: 'text', text: failure.message}
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

function activeProfileDestinationDetail(profile: DownloadProfile): string {
	const source = profile.output.kind === 'fixed' ? 'profile override' : 'global destination'
	return profile.subfolder.enabled ? `Using ${source} + profile subfolder` : `Using ${source}`
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
			quickDownloadFailure: s.quickDownloadFailure,
			quickDownloadProgressFailed: s.quickDownloadProgressFailed,
			quickDownloadStatus: s.quickDownloadStatus,
			removeDownloadProfile: s.removeDownloadProfile,
			retryQuickDownloadFailure: s.retryQuickDownloadFailure,
			retryQuickDownloadWithCookies: s.retryQuickDownloadWithCookies,
			saveDownloadProfile: s.saveDownloadProfile,
			setActiveDownloadProfile: s.setActiveDownloadProfile,
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
	const currentGlobalDestinationRoot = state.wizardOutputDir?.trim() ?? ''
	const globalDestinationRoot = currentGlobalDestinationRoot.length > 0 ? currentGlobalDestinationRoot : (commonSettings?.defaultOutputDir ?? '')
	const inputType = useMemo(() => detectUrlType(state.wizardUrl), [state.wizardUrl])
	const quickDownloadFailureText = useMemo(() => quickDownloadFailureMessage(state.quickDownloadFailure), [state.quickDownloadFailure])
	const quickDownloadProbeFailureError = useMemo(() => quickDownloadProbeFailure(state.quickDownloadFailure), [state.quickDownloadFailure])
	const quickDownloadProbeExperience = useMemo(() => (quickDownloadProbeFailureError ? buildProbeErrorExperience({error: quickDownloadProbeFailureError, commonSettings}) : null), [quickDownloadProbeFailureError, commonSettings])
	const hasInput = state.wizardUrl.trim().length > 0
	const quickPreparing = state.quickDownloadStatus === 'preparing'

	return {
		...state,
		activeProfile,
		activeProfileDestination,
		activeProfileDestinationDetail: activeProfileDestinationDetail(activeProfile),
		commonPaths: commonSettings?.commonPaths,
		globalDestinationRoot,
		hasInput,
		inputType,
		profiles,
		quickDownloadFailureMessage: quickDownloadFailureText,
		quickDownloadProbeExperience,
		quickPreparing,
		urlReady: inputType !== null && inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'
	}
}

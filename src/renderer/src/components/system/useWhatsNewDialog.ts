import {useMemo, useState} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {releaseNotesForVersion, shouldShowWhatsNew, type ReleaseNotes} from '@shared/releaseNotes.js'
import {useAppStore} from '../../store/useAppStore.js'

interface UseWhatsNewDialogOptions {
	startupReady?: boolean
}

export interface WhatsNewDialogState {
	open: boolean
	notes: ReleaseNotes | null
	close: () => void
	openFullNotes: () => void
}

export function useWhatsNewDialog(changelog: string, options: UseWhatsNewDialogOptions = {}): WhatsNewDialogState {
	const startupReady = options.startupReady ?? true
	const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
	const {initialized, settings, markReleaseNotesShown} = useAppStore(useShallow(state => ({initialized: state.initialized, settings: state.settings, markReleaseNotesShown: state.markReleaseNotesShown})))
	const appVersion = window.appVersion
	const notes = useMemo(() => releaseNotesForVersion(changelog, appVersion), [appVersion, changelog])
	const eligible = initialized && settings && startupReady ? shouldShowWhatsNew({appVersion, lastShownVersion: settings.common.lastReleaseNotesVersionShown, launchCount: settings.common.launchCount, notes}) : false
	const dialogOpen = eligible && notes?.version !== dismissedVersion

	function close(): void {
		if (!notes) return
		setDismissedVersion(notes.version)
		void markReleaseNotesShown(notes.version)
	}

	function openFullNotes(): void {
		if (!notes) return
		void window.appApi.shell.openExternal(`https://github.com/antonio-orionus/Arroxy/releases/tag/v${notes.version}`)
	}

	return {open: dialogOpen, notes, close, openFullNotes}
}

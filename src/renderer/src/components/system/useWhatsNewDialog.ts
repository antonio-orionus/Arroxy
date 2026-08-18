import {useMemo, useState} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {releaseNotesSince, shouldShowWhatsNew, type ReleaseNotesDigest} from '@shared/releaseNotes.js'
import {useAppStore} from '../../store/useAppStore.js'

const RELEASES_URL = 'https://github.com/antonio-orionus/Arroxy/releases'

interface UseWhatsNewDialogOptions {
	startupReady?: boolean
}

export interface WhatsNewDialogState {
	open: boolean
	digest: ReleaseNotesDigest | null
	close: () => void
	openFullNotes: () => void
}

export function useWhatsNewDialog(changelog: string, options: UseWhatsNewDialogOptions = {}): WhatsNewDialogState {
	const startupReady = options.startupReady ?? true
	const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
	const {initialized, settings, markReleaseNotesShown} = useAppStore(useShallow(state => ({initialized: state.initialized, settings: state.settings, markReleaseNotesShown: state.markReleaseNotesShown})))
	const appVersion = window.appVersion
	// Optional-chained rather than read through `settings`: callers can hold a
	// partially-populated store before startup finishes, and this hook runs on
	// every App render — including those.
	const common = settings?.common
	const lastShownVersion = common?.lastReleaseNotesVersionShown
	const digest = useMemo(() => releaseNotesSince(changelog, {appVersion, lastShownVersion}), [appVersion, changelog, lastShownVersion])
	const eligible = initialized && common && startupReady ? shouldShowWhatsNew({appVersion, lastShownVersion, launchCount: common.launchCount, notes: digest}) : false
	const dialogOpen = eligible && digest?.version !== dismissedVersion

	function close(): void {
		if (!digest) return
		setDismissedVersion(digest.version)
		void markReleaseNotesShown(digest.version)
	}

	function openFullNotes(): void {
		if (!digest) return
		void window.appApi.shell.openExternal(`${RELEASES_URL}/tag/v${digest.version}`)
	}

	return {open: dialogOpen, digest, close, openFullNotes}
}

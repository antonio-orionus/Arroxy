import {useState} from 'react'
import {useAppStore} from '../../store/useAppStore.js'
import type {AppState} from '../../store/types.js'
import {resolvePlaylistDir} from '../../store/wizard/playlistDir.js'
import {notify} from '@renderer/lib/notify.js'

export interface PlaylistFolderSync {
	scanState: AppState['syncScanState']
	// Effective folder the playlist's files land in (and where the scan looks).
	syncDir: string
	foundCount: number
	dismissed: boolean
	dismiss: () => void
	apply: () => void
	changeFolder: () => void
}

// Owns the folder-sync alert state for the playlist step. Called from the step
// itself rather than the alert, so dismissing survives the list unmounting
// while a reload is in flight.
export function usePlaylistFolderSync(): PlaylistFolderSync {
	const scanState = useAppStore(s => s.syncScanState)
	const foundCount = useAppStore(s => s.syncedDownloadedIds.length)
	const scanDownloadedInFolder = useAppStore(s => s.scanDownloadedInFolder)
	const applyFolderSync = useAppStore(s => s.applyFolderSync)
	const setPlaylistFolder = useAppStore(s => s.setPlaylistFolder)
	// The same resolver the queue builder + scan use, so display == download == scan.
	const syncDir = useAppStore(resolvePlaylistDir)
	// Lets the user dismiss the sync alert (or hide it after applying) without
	// re-running the scan. Reset implicitly whenever a new scan completes.
	const [dismissed, setDismissed] = useState(false)

	function changeFolder(): void {
		// Open at the current playlist dir; the pick becomes base+subfolder via
		// setPlaylistFolder (single SSOT), then we rescan the new location. State
		// only changes after a successful pick + folder write, so a rejected dialog
		// or failed settings persist can't leave the sync UI inconsistent.
		void (async () => {
			try {
				const res = await window.appApi.dialog.chooseFolder(syncDir || undefined)
				if (!res.ok || !res.data.path) return
				await setPlaylistFolder(res.data.path)
				setDismissed(false)
				void scanDownloadedInFolder()
			} catch (error) {
				notify.folderSelectFailed(error)
			}
		})()
	}

	function apply(): void {
		applyFolderSync()
		setDismissed(true)
	}

	return {scanState, syncDir, foundCount, dismissed, dismiss: () => setDismissed(true), apply, changeFolder}
}

import {useEffect} from 'react'
import {hasOpenOverlay, isTypingTarget} from '../shared/isTypingTarget.js'

// Window-scoped so Delete works no matter which row or control currently
// holds focus, matching the profiles step's shortcut listener. Backspace is
// deliberately NOT bound here: it's a common "go back" reflex, and this
// listener has no visible affordance warning the user it deletes rows
// instead (unlike the row context-menu item, whose label states the
// count). hasOpenOverlay() guards the playlist-scope and probe-limit
// dialogs/selects this step can open on top of itself — without it, Delete
// pressed while one of those owns focus silently removes the selected rows
// behind it (isTypingTarget alone doesn't see a dialog's buttons or a
// select's listbox as "typing").
export function usePlaylistDeleteShortcut(selectedPlaylistItemIds: string[], removePlaylistItems: (ids: string[]) => void): void {
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent): void {
			if (isTypingTarget(event.target)) return
			if (hasOpenOverlay()) return
			if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
			if (event.key !== 'Delete') return
			if (selectedPlaylistItemIds.length === 0) return
			event.preventDefault()
			removePlaylistItems(selectedPlaylistItemIds)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [selectedPlaylistItemIds, removePlaylistItems])
}

// Live state for the playlist-profiles table's cells. The column definitions
// are static (see playlistProfileColumns.tsx) and read this instead.

import {createContext, use} from 'react'
import type {DownloadProfile, PlaylistEntry} from '@shared/types.js'
import type {PlaylistProfileRowMenuHandle} from './PlaylistProfileRowMenu.js'

export type PlaylistSelectAllState = 'all' | 'some' | 'none'

export interface PlaylistProfileColumnsContextValue {
	hasAnyThumbnail: boolean
	liveLabel: string
	resolveProfile: (entry: PlaylistEntry) => DownloadProfile
	selectedIds: ReadonlySet<string>
	selectAllState: PlaylistSelectAllState
	onToggleAll: () => void
	onToggleRow: (id: string) => void
	rowMenu: PlaylistProfileRowMenuHandle
}

export const PlaylistProfileColumnsContext = createContext<PlaylistProfileColumnsContextValue | null>(null)

export function usePlaylistProfileColumnsContext(): PlaylistProfileColumnsContextValue {
	const value = use(PlaylistProfileColumnsContext)
	if (!value) throw new Error('playlist profile columns rendered outside PlaylistProfileColumnsContext')
	return value
}

// Columns for the playlist-profiles table: title (thumbnail + title, mirrors
// StepPlaylistItems' row), assigned profile (icon + name, resolved per row by
// the caller), and duration. Kept separate from StepPlaylistProfiles so the
// step component stays about wiring, not cell markup.

import {useMemo, type ReactNode} from 'react'
import {createColumnHelper, type ColumnDef} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import type {DownloadProfile, PlaylistEntry} from '@shared/types.js'
import {formatEntryDuration} from '@renderer/lib/formatDuration.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'

const columnHelper = createColumnHelper<PlaylistEntry>()

export interface UsePlaylistProfileColumnsParams {
	t: TFunction
	hasAnyThumbnail: boolean
	liveLabel: string
	resolveProfile: (entry: PlaylistEntry) => DownloadProfile
}

export function usePlaylistProfileColumns({t, hasAnyThumbnail, liveLabel, resolveProfile}: UsePlaylistProfileColumnsParams): ColumnDef<PlaylistEntry>[] {
	return useMemo(
		() => [
			columnHelper.accessor('title', {
				header: () => t('queue.table.title'),
				cell: info => {
					const entry = info.row.original
					return (
						<div className="flex min-w-0 items-center gap-2">
							{hasAnyThumbnail ? entry.thumbnail ? <img src={entry.thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="h-8 w-[56px] shrink-0 rounded-sm object-cover" loading="lazy" /> : <div className="h-8 w-[56px] shrink-0 rounded-sm bg-muted" /> : null}
							<span className="min-w-0 flex-1 truncate text-sm">{entry.title}</span>
						</div>
					)
				}
			}),
			columnHelper.display({
				id: 'profile',
				header: () => t('wizard.playlistProfiles.columnProfile'),
				cell: (info): ReactNode => {
					const entry = info.row.original
					const profile = resolveProfile(entry)
					const Icon = PROFILE_ICONS[profile.icon]
					return (
						<div className="flex min-w-0 items-center gap-1.5" data-testid={`profile-cell-${entry.id}`}>
							<Icon size={13} className="shrink-0 text-[var(--brand)]" aria-hidden />
							<span className="min-w-0 truncate text-[12px] text-foreground">{profile.name}</span>
						</div>
					)
				}
			}),
			columnHelper.accessor('duration', {header: () => t('wizard.playlistProfiles.columnDuration'), cell: info => <span className="block truncate text-xs text-muted-foreground">{formatEntryDuration(info.getValue(), liveLabel)}</span>})
		],
		[hasAnyThumbnail, liveLabel, resolveProfile, t]
	)
}

// Columns for the playlist-profiles table: title (thumbnail + title, mirrors
// StepPlaylistItems' row), assigned profile (icon + name, resolved per row by
// the caller), and duration. Kept separate from StepPlaylistProfiles so the
// step component stays about wiring, not cell markup.

import {useMemo, type MouseEvent, type ReactNode} from 'react'
import {createColumnHelper, type ColumnDef} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import {PenLine} from 'lucide-react'
import type {DownloadProfile, PlaylistEntry} from '@shared/types.js'
import {formatEntryDuration} from '@renderer/lib/formatDuration.js'
import {Button} from '../ui/button.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'

const columnHelper = createColumnHelper<PlaylistEntry>()

export interface UsePlaylistProfileColumnsParams {
	t: TFunction
	hasAnyThumbnail: boolean
	liveLabel: string
	resolveProfile: (entry: PlaylistEntry) => DownloadProfile
	onEditProfile: (profile: DownloadProfile) => void
}

export function usePlaylistProfileColumns({t, hasAnyThumbnail, liveLabel, resolveProfile, onEditProfile}: UsePlaylistProfileColumnsParams): ColumnDef<PlaylistEntry>[] {
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
					// Never toggles row selection — stopPropagation runs first so the
					// row's onClick (SelectableVirtualTable) can never also fire from
					// the same click. Mirrors PlaylistProfileActionBar's row pencil.
					function editProfile(event: MouseEvent<HTMLButtonElement>): void {
						event.stopPropagation()
						onEditProfile(profile)
					}
					return (
						<div className="flex min-w-0 items-center gap-1.5" data-testid={`profile-cell-${entry.id}`}>
							<Icon size={13} className="shrink-0 text-[var(--brand)]" aria-hidden />
							{/* Not `flex-1`: the name box must shrink to its text so the edit
							pencil sits beside the profile it edits rather than being pushed
							to the far edge of the column, next to Duration. */}
							<span className="min-w-0 shrink truncate text-[12px] text-foreground">{profile.name}</span>
							{/* Hidden by default, revealed on row hover or when tabbed to
							directly — a hover-only control would be unreachable by
							keyboard. Width is always reserved (opacity, not display) so
							hover never shifts the row layout. */}
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								aria-label={t('wizard.playlistProfiles.editProfile', {name: profile.name})}
								data-testid={`edit-row-profile-${entry.id}`}
								className="shrink-0 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 focus-visible:opacity-100"
								onClick={editProfile}
							>
								<PenLine size={11} aria-hidden />
							</Button>
						</div>
					)
				}
			}),
			columnHelper.accessor('duration', {header: () => t('wizard.playlistProfiles.columnDuration'), cell: info => <span className="block truncate text-xs text-muted-foreground">{formatEntryDuration(info.getValue(), liveLabel)}</span>})
		],
		[hasAnyThumbnail, liveLabel, onEditProfile, resolveProfile, t]
	)
}

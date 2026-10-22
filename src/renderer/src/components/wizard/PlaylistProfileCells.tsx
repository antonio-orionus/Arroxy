// Header and cell components for the playlist-profiles table. They read live
// state from PlaylistProfileColumnsContext so the column definitions that
// mount them never change.

import type {ReactNode, SyntheticEvent} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown} from 'lucide-react'
import type {PlaylistEntry} from '@shared/types.js'
import {formatEntryDuration} from '@renderer/lib/formatDuration.js'
import {Button} from '../ui/button.js'
import {Checkbox} from '../ui/checkbox.js'
import {Hint} from '../shared/Hint.js'
import {PopoverTrigger} from '../ui/popover.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {usePlaylistProfileColumnsContext} from './playlistProfileColumnsContext.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'

// Controls inside a row act on their own: a click or a drag starting on them
// must not also reach the row's select-on-click and drag-to-select handlers.
function stopRowGesture(event: SyntheticEvent): void {
	event.stopPropagation()
}

export function SelectAllHeader(): ReactNode {
	const {t} = useTranslation()
	const {selectAllState, onToggleAll} = usePlaylistProfileColumnsContext()
	return <Checkbox checked={selectAllState === 'all'} indeterminate={selectAllState === 'some'} onCheckedChange={onToggleAll} aria-label={t('wizard.playlist.selectAll')} data-testid="playlist-profile-select-all" />
}

export function SelectRowCell({entry}: {entry: PlaylistEntry}): ReactNode {
	const {selectedIds, onToggleRow} = usePlaylistProfileColumnsContext()
	return <Checkbox checked={selectedIds.has(entry.id)} onCheckedChange={() => onToggleRow(entry.id)} onClick={stopRowGesture} onPointerDown={stopRowGesture} aria-label={entry.title} data-testid={`select-row-${entry.id}`} />
}

export function TitleCell({entry}: {entry: PlaylistEntry}): ReactNode {
	const {hasAnyThumbnail} = usePlaylistProfileColumnsContext()
	return (
		<div className="flex min-w-0 items-center gap-2">
			{hasAnyThumbnail ? entry.thumbnail ? <img src={entry.thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="h-8 w-[56px] shrink-0 rounded-sm object-cover" loading="lazy" /> : <div className="h-8 w-[56px] shrink-0 rounded-sm bg-muted" /> : null}
			<span className="min-w-0 flex-1 truncate text-sm">{entry.title}</span>
		</div>
	)
}

// One of many detached triggers for the step's single row menu; the row id
// is the payload that tells the menu which rows it acts on.
export function ProfileCell({entry}: {entry: PlaylistEntry}): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const {resolveProfile, rowMenu} = usePlaylistProfileColumnsContext()
	const profile = resolveProfile(entry)
	const Icon = PROFILE_ICONS[profile.icon]
	return (
		<PopoverTrigger
			handle={rowMenu}
			payload={entry.id}
			onClick={stopRowGesture}
			onPointerDown={stopRowGesture}
			render={
				<Button type="button" variant="ghost" size="xs" className="max-w-full justify-start" aria-label={t('wizard.url.profile.switchAria', {profileName: nameOf(profile)})} data-testid={`profile-cell-${entry.id}`}>
					<Icon className="text-primary" aria-hidden />
					<span className="min-w-0 truncate text-foreground">{nameOf(profile)}</span>
					<ChevronDown className="text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180" aria-hidden />
				</Button>
			}
		/>
	)
}

export function DurationCell({duration}: {duration: PlaylistEntry['duration']}): ReactNode {
	const {liveLabel} = usePlaylistProfileColumnsContext()
	return <span className="block truncate text-xs text-muted-foreground">{formatEntryDuration(duration, liveLabel)}</span>
}

// A label too long for its column (some translations) ends in an ellipsis,
// and its hint shows the whole label.
export function ColumnHeader({labelKey}: {labelKey: 'queue.table.title' | 'wizard.playlistProfiles.columnProfile' | 'wizard.playlistProfiles.columnDuration'}): ReactNode {
	const {t} = useTranslation()
	const label = t(labelKey)
	return (
		<Hint label={label} reveal>
			<span className="block truncate" data-testid="playlist-profile-column-label">
				{label}
			</span>
		</Hint>
	)
}

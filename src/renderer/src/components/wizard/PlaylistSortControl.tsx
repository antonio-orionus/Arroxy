import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {PLAYLIST_SORT_MODES, playlistSortModeSchema} from '@shared/schemas.js'
import type {PlaylistSortMode} from '@shared/types.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'

interface PlaylistSortControlProps {
	value: PlaylistSortMode
	onChange: (mode: PlaylistSortMode) => void
	/** True once hydration has settled and at least one sortable row carries a timestamp. */
	canSortByUpload: boolean
	/** True while placeholder hydration is still filling timestamps in. */
	isFetching: boolean
	disabled?: boolean
}

// Exhaustive by type, so a fourth sort mode is a compile error here rather than
// silently falling through to the "newest first" label.
const SORT_MODE_LABEL_KEYS = {api: 'wizard.playlist.sortApi', 'upload-asc': 'wizard.playlist.sortUploadAsc', 'upload-desc': 'wizard.playlist.sortUploadDesc'} as const satisfies Record<PlaylistSortMode, string>

function isSortMode(value: string | undefined): value is PlaylistSortMode {
	return playlistSortModeSchema.safeParse(value).success
}

export function PlaylistSortControl({value, onChange, canSortByUpload, isFetching, disabled = false}: PlaylistSortControlProps): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-xs text-muted-foreground">{t('wizard.playlist.sortLabel')}</span>
			<ToggleGroup
				variant="outline"
				value={[value]}
				onValueChange={vals => {
					if (isSortMode(vals[0])) onChange(vals[0])
				}}
				spacing={1}
				className="flex flex-wrap gap-1"
				aria-label={t('wizard.playlist.sortLabel')}
				data-testid="playlist-sort-control"
			>
				{PLAYLIST_SORT_MODES.map(mode => {
					const uploadMode = mode !== 'api'
					const key = SORT_MODE_LABEL_KEYS[mode]
					return (
						<ToggleGroupItem key={mode} value={mode} disabled={disabled || (uploadMode && !canSortByUpload)} className="px-3 text-[12px]" data-testid={`playlist-sort-${mode}`}>
							{t(key)}
						</ToggleGroupItem>
					)
				})}
			</ToggleGroup>
			{isFetching ? <span className="text-xs text-muted-foreground">{t('wizard.playlist.sortFetchingDates')}</span> : null}
		</div>
	)
}

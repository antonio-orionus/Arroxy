import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {PLAYLIST_SORT_MODES, playlistSortModeSchema} from '@shared/schemas.js'
import type {PlaylistSortMode} from '@shared/types.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'

interface PlaylistSortControlProps {
	value: PlaylistSortMode
	onChange: (mode: PlaylistSortMode) => void
	/** True once at least one row carries a timestamp. Upload-time options stay disabled until then. */
	hasTimestamps: boolean
	/** True while placeholder hydration is still filling timestamps in. */
	isFetching: boolean
	disabled?: boolean
}

function isSortMode(value: string | undefined): value is PlaylistSortMode {
	return playlistSortModeSchema.safeParse(value).success
}

export function PlaylistSortControl({value, onChange, hasTimestamps, isFetching, disabled = false}: PlaylistSortControlProps): ReactNode {
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
					const key = mode === 'api' ? 'wizard.playlist.sortApi' : mode === 'upload-asc' ? 'wizard.playlist.sortUploadAsc' : 'wizard.playlist.sortUploadDesc'
					return (
						<ToggleGroupItem key={mode} value={mode} disabled={disabled || (uploadMode && !hasTimestamps)} className="px-3 text-[12px]" data-testid={`playlist-sort-${mode}`}>
							{t(key)}
						</ToggleGroupItem>
					)
				})}
			</ToggleGroup>
			{!hasTimestamps && isFetching ? <span className="text-xs text-muted-foreground">{t('wizard.playlist.sortFetchingDates')}</span> : null}
		</div>
	)
}

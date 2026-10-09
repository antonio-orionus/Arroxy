// The queue's STATUS_FILTERS + queueStatusFilterCount pattern, repurposed to
// filter playlist rows by their assigned profile. Chips only narrow which
// rows the table shows — clicking one never changes an assignment.

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'
import type {PlaylistProfileFilter} from './playlistProfileTableState.js'

interface PlaylistProfileFilterChipsProps {
	options: DownloadProfileActionOption[]
	counts: Map<string, number>
	totalCount: number
	filter: PlaylistProfileFilter
	onFilterChange: (filter: PlaylistProfileFilter) => void
}

export function PlaylistProfileFilterChips({options, counts, totalCount, filter, onFilterChange}: PlaylistProfileFilterChipsProps): ReactNode {
	const {t} = useTranslation()
	const assignedOptions = options.filter(option => (counts.get(option.profile.id) ?? 0) > 0)
	return (
		<ToggleGroup
			size="xs"
			variant="outline"
			spacing={1}
			value={[filter]}
			onValueChange={value => {
				if (value[0]) onFilterChange(value[0])
			}}
			className="max-w-full gap-1 overflow-x-auto"
			aria-label={t('wizard.playlistProfiles.filtersLabel')}
			data-testid="playlist-profile-filters"
		>
			<ToggleGroupItem value="all" shape="chip" className="uppercase" data-testid="filter-profile-all">
				{t('wizard.playlistProfiles.filterChip', {name: t('queue.filterAll'), count: totalCount})}
			</ToggleGroupItem>
			{assignedOptions.map(option => (
				<ToggleGroupItem key={option.profile.id} value={option.profile.id} shape="chip" className="uppercase" data-testid={`filter-profile-${option.profile.id}`}>
					{t('wizard.playlistProfiles.filterChip', {name: option.profile.name, count: counts.get(option.profile.id) ?? 0})}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	)
}

// The queue's STATUS_FILTERS + queueStatusFilterCount pattern, repurposed to
// filter playlist rows by their assigned profile. Chips only narrow which
// rows the table shows — clicking one never changes an assignment.

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {cn} from '@renderer/lib/utils.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'
import type {PlaylistProfileFilter} from './playlistProfileTableState.js'

interface PlaylistProfileFilterChipsProps {
	options: DownloadProfileActionOption[]
	counts: Map<string, number>
	totalCount: number
	filter: PlaylistProfileFilter
	onFilterChange: (filter: PlaylistProfileFilter) => void
}

function FilterChip({active, text, testId, onClick}: {active: boolean; text: string; testId: string; onClick: () => void}): ReactNode {
	return (
		<button
			type="button"
			data-testid={testId}
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				active ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_var(--brand-glow)]' : 'bg-muted/25 text-muted-foreground hover:bg-accent hover:text-foreground'
			)}
		>
			{text}
		</button>
	)
}

export function PlaylistProfileFilterChips({options, counts, totalCount, filter, onFilterChange}: PlaylistProfileFilterChipsProps): ReactNode {
	const {t} = useTranslation()
	const assignedOptions = options.filter(option => (counts.get(option.profile.id) ?? 0) > 0)
	return (
		<div className="flex max-w-full gap-1 overflow-x-auto" aria-label={t('wizard.playlistProfiles.filtersLabel')} data-testid="playlist-profile-filters">
			<FilterChip active={filter === 'all'} text={t('wizard.playlistProfiles.filterChip', {name: t('queue.filterAll'), count: totalCount})} testId="filter-profile-all" onClick={() => onFilterChange('all')} />
			{assignedOptions.map(option => (
				<FilterChip key={option.profile.id} active={filter === option.profile.id} text={t('wizard.playlistProfiles.filterChip', {name: option.profile.name, count: counts.get(option.profile.id) ?? 0})} testId={`filter-profile-${option.profile.id}`} onClick={() => onFilterChange(option.profile.id)} />
			))}
		</div>
	)
}

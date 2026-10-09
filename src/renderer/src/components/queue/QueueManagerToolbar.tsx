import type {ReactNode} from 'react'
import type {Column} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import {Columns3, Inbox, Pause, Play, Trash2, X} from 'lucide-react'
import type {QueueItem} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Checkbox} from '../ui/checkbox.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {QueueActionButton, TooltipIconButton} from './QueueManagerButtons.js'
import {COLUMN_LABEL_KEYS, SELECTED_ACTIONS, STATUS_FILTERS, actionButtonDisabled, queueStatusFilterCount, type QueueSelectedAction} from './queueManagerActions.js'
import type {QueueStatusFilter} from './queueManagerState.js'
import type {QueueTableColumnId} from './queueTablePreferences.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {IconTile} from '../shared/IconTile.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'

interface QueueManagerToolbarProps {
	t: TFunction
	queue: QueueItem[]
	selectedItems: QueueItem[]
	selectedCount: number
	filter: QueueStatusFilter
	columns: Column<QueueItem, unknown>[]
	onFilterChange: (filter: QueueStatusFilter) => void
	onSelectedAction: (action: QueueSelectedAction) => void
	schedulerPaused: boolean
	onPauseAll: () => void
	onResumeAll: () => void
	onCancelAll: () => void
	onClearCompleted: () => void
}

export function QueueManagerToolbar({t, queue, selectedItems, selectedCount, filter, columns, onFilterChange, onSelectedAction, schedulerPaused, onPauseAll, onResumeAll, onCancelAll, onClearCompleted}: QueueManagerToolbarProps): ReactNode {
	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<IconTile>
						<Inbox />
					</IconTile>
					<div className="min-w-0">
						<h2 className="text-headline">{t('queue.header')}</h2>
						<p className="text-xs text-muted-foreground" data-testid="queue-selection-summary">
							{t('queue.selectionSummary', {selected: selectedCount, total: queue.length})}
						</p>
					</div>
				</div>
				<div className={cn('flex flex-wrap items-center justify-end gap-1 rounded-xl border border-border/70 bg-background/25 p-1.5 transition-opacity', selectedCount === 0 && 'opacity-55')} data-testid="queue-selected-actions">
					<ButtonGroup className="flex-wrap justify-end" aria-label={t('queue.selectedActionsLabel')}>
						{SELECTED_ACTIONS.map(action => (
							<QueueActionButton key={action.id} action={action} disabled={actionButtonDisabled(action.id, selectedItems)} onClick={() => onSelectedAction(action.id)} />
						))}
					</ButtonGroup>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-2 py-3">
				<ToggleGroup
					size="xs"
					variant="outline"
					spacing={1}
					value={[filter]}
					onValueChange={value => {
						const next = STATUS_FILTERS.find(statusFilter => statusFilter.id === value[0])
						if (next) onFilterChange(next.id)
					}}
					className="max-w-full gap-1 overflow-x-auto"
					aria-label={t('queue.filtersLabel')}
				>
					{STATUS_FILTERS.map(statusFilter => (
						<ToggleGroupItem key={statusFilter.id} value={statusFilter.id} shape="chip" className="uppercase" data-testid={`queue-filter-${statusFilter.id}`}>
							{t(statusFilter.labelKey)}
							<span className="font-mono opacity-70">{queueStatusFilterCount(statusFilter.id, queue)}</span>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<div className="flex flex-wrap items-center gap-2">
					<Popover>
						<PopoverTrigger
							render={
								<Button type="button" variant="ghost" size="icon-sm" aria-label={t('queue.table.columns')} title={t('queue.table.columns')}>
									<Columns3 size={13} aria-hidden />
								</Button>
							}
						/>
						<PopoverContent className="w-48 gap-1.5 p-2" align="end">
							{columns.map(column => {
								const columnId = column.id as QueueTableColumnId
								const checkboxId = `queue-column-${column.id}`
								return (
									<label key={column.id} htmlFor={checkboxId} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-xs', column.getCanHide() ? 'cursor-pointer hover:bg-muted/60' : 'cursor-not-allowed text-muted-foreground')}>
										<Checkbox id={checkboxId} checked={column.getIsVisible()} disabled={!column.getCanHide()} onCheckedChange={value => column.toggleVisibility(value === true)} />
										{t(COLUMN_LABEL_KEYS[columnId])}
									</label>
								)
							})}
						</PopoverContent>
					</Popover>
					<ButtonGroup className="flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-background/25 px-1 py-0.5" aria-label={t('queue.globalActionsLabel')}>
						<SectionLabel render={<span />} className="px-1">
							{t('queue.globalActionsLabel')}
						</SectionLabel>
						<TooltipIconButton Icon={Pause} label={t('queue.pauseAllTitle')} testId="btn-pause-all" disabled={schedulerPaused} onClick={onPauseAll} />
						<TooltipIconButton Icon={Play} label={t('queue.resumeAllTitle')} testId="btn-resume-first" onClick={onResumeAll} />
						<TooltipIconButton Icon={X} label={t('queue.cancelAllTitle')} onClick={onCancelAll} />
						<TooltipIconButton Icon={Trash2} label={t('queue.clearTitle')} testId="btn-clear-completed" onClick={onClearCompleted} />
					</ButtonGroup>
				</div>
			</div>
		</>
	)
}

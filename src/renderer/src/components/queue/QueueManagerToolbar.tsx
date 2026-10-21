import type {ReactNode} from 'react'
import type {Column} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import {Columns3, Inbox, Pause, Play, RotateCcw, Trash2, X} from 'lucide-react'
import type {QueueItem} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Label} from '../ui/label.js'
import {Separator} from '../ui/separator.js'
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from '../ui/dropdown-menu.js'
import {Switch} from '../ui/switch.js'
import {QueueActionButton, TooltipIconButton} from './QueueManagerButtons.js'
import {COLUMN_LABEL_KEYS, SELECTED_ACTIONS, STATUS_FILTERS, actionButtonDisabled, queueStatusFilterCount, type QueueSelectedAction} from './queueManagerActions.js'
import type {QueueStatusFilter} from './queueManagerState.js'
import type {QueueTableColumnId} from './queueTablePreferences.js'
import type {QueueTableFeatures} from './queueTableFeatures.js'
import {Hint} from '../shared/Hint.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {IconTile} from '../shared/IconTile.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'

interface QueueManagerToolbarProps {
	t: TFunction
	queue: QueueItem[]
	selectedItems: QueueItem[]
	selectedCount: number
	filter: QueueStatusFilter
	columns: Column<QueueTableFeatures, QueueItem, unknown>[]
	onFilterChange: (filter: QueueStatusFilter) => void
	onSelectedAction: (action: QueueSelectedAction) => void
	schedulerPaused: boolean
	onPauseAll: () => void
	onResumeAll: () => void
	onCancelAll: () => void
	onClearCompleted: () => void
	autoRemoveCompleted: boolean
	onAutoRemoveCompletedChange: (enabled: boolean) => void
	onResetColumns: () => void
}

export function QueueManagerToolbar({t, queue, selectedItems, selectedCount, filter, columns, onFilterChange, onSelectedAction, schedulerPaused, onPauseAll, onResumeAll, onCancelAll, onClearCompleted, autoRemoveCompleted, onAutoRemoveCompletedChange, onResetColumns}: QueueManagerToolbarProps): ReactNode {
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
					<Separator orientation="vertical" className="mx-1 h-6" />
					<Hint label={t('queue.autoRemoveCompleted.hint')}>
						<Label htmlFor="queue-auto-remove-completed" className="cursor-pointer gap-1.5 text-caption font-normal text-muted-foreground">
							<Switch id="queue-auto-remove-completed" size="sm" checked={autoRemoveCompleted} onCheckedChange={onAutoRemoveCompletedChange} data-testid="queue-auto-remove-toggle" />
							{t('queue.autoRemoveCompleted.label')}
						</Label>
					</Hint>
				</div>
				<div className={cn('flex flex-wrap items-center justify-end gap-1 rounded-xl border border-border/70 bg-background/25 p-1.5 transition-opacity', selectedCount === 0 && 'opacity-55')} data-testid="queue-selected-actions">
					<ButtonGroup className="flex-wrap items-center justify-end" aria-label={t('queue.selectedActionsLabel')}>
						<SectionLabel render={<span />} className="px-1">
							{t('queue.selectedActionsLabel')}
						</SectionLabel>
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
					className="max-w-full flex-wrap gap-1"
					aria-label={t('queue.filtersLabel')}
				>
					{STATUS_FILTERS.map(statusFilter => {
						// An empty status has no chip: All always shows, and so does the chip
						// in use, so a filter that empties out does not vanish under the user.
						// No chip shows a "0".
						const count = queueStatusFilterCount(statusFilter.id, queue)
						if (count === 0 && statusFilter.id !== 'all' && statusFilter.id !== filter) return null
						return (
							<ToggleGroupItem key={statusFilter.id} value={statusFilter.id} shape="chip" className="uppercase" data-testid={`queue-filter-${statusFilter.id}`}>
								{t(statusFilter.labelKey)}
								{count > 0 ? <span className="font-mono opacity-70">{count}</span> : null}
							</ToggleGroupItem>
						)
					})}
				</ToggleGroup>
				<div className="flex flex-wrap items-center gap-2">
					<DropdownMenu>
						<Hint label={t('queue.table.columns')}>
							<DropdownMenuTrigger
								render={
									<Button type="button" variant="ghost" size="icon-sm" aria-label={t('queue.table.columns')} data-testid="queue-columns-menu">
										<Columns3 size={13} aria-hidden />
									</Button>
								}
							/>
						</Hint>
						<DropdownMenuContent className="w-48" align="end">
							{columns.map(column => (
								<DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} disabled={!column.getCanHide()} onCheckedChange={checked => column.toggleVisibility(checked)} className="text-xs" data-testid={`queue-column-${column.id}`}>
									{t(COLUMN_LABEL_KEYS[column.id as QueueTableColumnId])}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={onResetColumns} className="text-xs" data-testid="queue-columns-reset">
								<RotateCcw aria-hidden />
								{t('queue.table.resetColumns')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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

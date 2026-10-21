import {ChevronsUp, Copy, FolderOpen, MapPin, Pause, Play, RotateCcw, Trash2, X} from 'lucide-react'
import type {ComponentType} from 'react'
import type {TFunction} from 'i18next'
import {queueItemStatusSchema} from '@shared/schemas.js'
import type {QueueItem, QueueItemStatus, QueueSelectionAction} from '@shared/types.js'
import {canApplyQueueActionToItem, isNeverStartedPendingItem, type QueueOutputTargetAction} from '@shared/queueActions.js'
import type {QueueTableColumnId} from './queueTablePreferences.js'
import type {QueueStatusFilter} from './queueManagerState.js'

export type QueueSelectedAction = QueueSelectionAction | QueueOutputTargetAction | 'copy-link' | 'open-destination-folder'

export interface QueueActionDefinition {
	id: QueueSelectedAction
	labelKey: 'queue.item.pause' | 'queue.item.resume' | 'queue.item.pullNow' | 'queue.item.cancel' | 'queue.item.retry' | 'queue.item.setLocation' | 'share.copyLink' | 'queue.item.openDestinationFolder' | 'queue.item.remove'
	Icon: ComponentType<{size?: number; 'aria-hidden'?: boolean; 'data-icon'?: string}>
	destructive?: boolean
}

export const SELECTED_ACTIONS: QueueActionDefinition[] = [
	{id: 'pause', labelKey: 'queue.item.pause', Icon: Pause},
	{id: 'resume', labelKey: 'queue.item.resume', Icon: Play},
	{id: 'pull-now', labelKey: 'queue.item.pullNow', Icon: ChevronsUp},
	{id: 'cancel', labelKey: 'queue.item.cancel', Icon: X, destructive: true},
	{id: 'retry', labelKey: 'queue.item.retry', Icon: RotateCcw},
	{id: 'change-output-target', labelKey: 'queue.item.setLocation', Icon: MapPin},
	{id: 'copy-link', labelKey: 'share.copyLink', Icon: Copy},
	{id: 'open-destination-folder', labelKey: 'queue.item.openDestinationFolder', Icon: FolderOpen},
	{id: 'remove', labelKey: 'queue.item.remove', Icon: Trash2, destructive: true}
]

type QueueStatusLabelKey = 'queue.item.statusProbing' | 'queue.item.statusNeedsChoice' | 'queue.item.statusPending' | 'queue.item.statusRunning' | 'queue.item.statusHeld' | 'queue.item.statusPaused' | 'queue.item.statusDone' | 'queue.item.statusError' | 'queue.item.statusCancelled'

export const QUEUE_STATUS_LABEL_KEYS: Record<QueueItemStatus, QueueStatusLabelKey> = {
	probing: 'queue.item.statusProbing',
	'needs-choice': 'queue.item.statusNeedsChoice',
	pending: 'queue.item.statusPending',
	running: 'queue.item.statusRunning',
	'paused-held': 'queue.item.statusHeld',
	'paused-active': 'queue.item.statusPaused',
	done: 'queue.item.statusDone',
	error: 'queue.item.statusError',
	cancelled: 'queue.item.statusCancelled'
}

// One chip per status, in lifecycle order, so the counts always add up to All.
export const STATUS_FILTERS: {id: QueueStatusFilter; labelKey: 'queue.filterAll' | QueueStatusLabelKey}[] = [{id: 'all', labelKey: 'queue.filterAll'}, ...queueItemStatusSchema.options.map(status => ({id: status, labelKey: QUEUE_STATUS_LABEL_KEYS[status]}))]

export const COLUMN_LABEL_KEYS: Record<QueueTableColumnId, 'queue.table.title' | 'queue.table.status' | 'queue.table.progress' | 'queue.table.format' | 'queue.table.outputTarget' | 'queue.table.artifacts' | 'queue.table.size' | 'queue.table.added' | 'queue.table.finished'> = {
	title: 'queue.table.title',
	status: 'queue.table.status',
	progressPercent: 'queue.table.progress',
	formatLabel: 'queue.table.format',
	outputDir: 'queue.table.outputTarget',
	artifacts: 'queue.table.artifacts',
	fileSize: 'queue.table.size',
	addedAt: 'queue.table.added',
	finishedAt: 'queue.table.finished'
}

function canApplySelectedAction(action: QueueSelectedAction, item: QueueItem): boolean {
	if (action === 'copy-link') return item.url.trim().length > 0
	if (action === 'open-destination-folder') return item.outputDir.trim().length > 0
	return canApplyQueueActionToItem(action, item)
}

export function actionButtonDisabled(action: QueueSelectedAction, selectedItems: QueueItem[]): boolean {
	if (selectedItems.length === 0) return true
	if (action === 'change-output-target') return !selectedItems.every(isNeverStartedPendingItem)
	return !selectedItems.some(item => canApplySelectedAction(action, item))
}

export function actionDisabledTooltip(action: QueueSelectedAction, disabled: boolean, t: TFunction): string | undefined {
	return action === 'change-output-target' && disabled ? t('queue.item.setLocationHint') : undefined
}

export function queueStatusFilterCount(filter: QueueStatusFilter, queue: QueueItem[]): number {
	return filter === 'all' ? queue.length : queue.filter(item => item.status === filter).length
}

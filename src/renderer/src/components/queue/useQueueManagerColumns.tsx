import {useMemo, type ReactNode} from 'react'
import {createColumnHelper} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import {Ban, Captions, CheckCircle2, ChevronDown, Clock, Loader2, Pause, PauseCircle, XCircle} from 'lucide-react'
import type {QueueItem, QueueItemStatus} from '@shared/types.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'
import {cn} from '@renderer/lib/utils.js'
import {formatLocalizedError, formatStatus} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Progress} from '../ui/progress.js'

const STATUS_META: Record<QueueItemStatus, {className: string; icon: ReactNode; labelKey: 'queue.item.statusPending' | 'queue.item.statusRunning' | 'queue.item.statusHeld' | 'queue.item.statusPaused' | 'queue.item.statusDone' | 'queue.item.statusError' | 'queue.item.statusCancelled'}> = {
	pending: {className: 'text-muted-foreground', icon: <Clock size={12} aria-hidden />, labelKey: 'queue.item.statusPending'},
	running: {className: 'text-[var(--brand)]', icon: <Loader2 size={12} className="animate-spin" aria-hidden />, labelKey: 'queue.item.statusRunning'},
	'paused-held': {className: 'text-[var(--color-status-paused)]', icon: <PauseCircle size={12} aria-hidden />, labelKey: 'queue.item.statusHeld'},
	'paused-active': {className: 'text-[var(--color-status-paused)]', icon: <Pause size={12} aria-hidden />, labelKey: 'queue.item.statusPaused'},
	done: {className: 'text-[var(--color-status-done)]', icon: <CheckCircle2 size={12} aria-hidden />, labelKey: 'queue.item.statusDone'},
	error: {className: 'text-[var(--color-status-error)]', icon: <XCircle size={12} aria-hidden />, labelKey: 'queue.item.statusError'},
	cancelled: {className: 'text-muted-foreground', icon: <Ban size={12} aria-hidden />, labelKey: 'queue.item.statusCancelled'}
}

const columnHelper = createColumnHelper<QueueItem>()
type QueueManagerColumn = ReturnType<typeof columnHelper.accessor>

function formatQueueDate(value: string | null, t: TFunction): string {
	if (!value) return t('queue.table.notAvailable')
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return t('queue.table.notAvailable')
	return date.toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})
}

function sortableHeader(label: string, column: {getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void}, t: TFunction): ReactNode {
	const sorted = column.getIsSorted()
	return (
		<button type="button" aria-label={t('queue.table.sortBy', {label})} className="inline-flex items-center gap-1 rounded-md text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => column.toggleSorting(sorted === 'asc')}>
			{label}
			<ChevronDown size={11} className={cn('transition-transform opacity-60', sorted === 'asc' && 'rotate-180', !sorted && 'opacity-25')} aria-hidden />
		</button>
	)
}

function statusText(item: QueueItem, t: TFunction): string {
	return t(STATUS_META[item.status].labelKey)
}

function rowStatusDetail(item: QueueItem, t: TFunction): string {
	if (item.status === 'error') return formatLocalizedError(item.error) || t('queue.item.defaultError')
	if (item.status === 'running' || item.status === 'paused-active') return item.progressDetail ?? formatStatus(item.lastStatus)
	if (item.status === 'done' && item.lastStatus?.key === 'subtitlesFailed') return formatStatus(item.lastStatus)
	return ''
}

export function useQueueManagerColumns({expandedIds, onToggleExpanded, t}: {expandedIds: ReadonlySet<string>; onToggleExpanded: (itemId: string) => void; t: TFunction}): QueueManagerColumn[] {
	return useMemo(
		() =>
			[
				columnHelper.accessor('title', {
					header: ({column}) => sortableHeader(t('queue.table.title'), column, t),
					enableHiding: false,
					cell: info => {
						const item = info.row.original
						return (
							<div className="flex min-w-0 items-center gap-2">
								<div className="size-11 shrink-0 overflow-hidden rounded-md bg-secondary">{item.thumbnail ? <img src={item.thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="size-full object-cover" /> : <div className="thumb-shimmer size-full" aria-hidden />}</div>
								<div className="min-w-0">
									<p className="truncate text-[13px] font-semibold text-foreground" data-testid="queue-title">
										{item.title}
									</p>
									<p className="truncate text-[11px] text-[var(--text-subtle)]">{item.url}</p>
								</div>
							</div>
						)
					}
				}),
				columnHelper.accessor('status', {
					header: ({column}) => sortableHeader(t('queue.table.status'), column, t),
					enableHiding: false,
					cell: info => {
						const item = info.row.original
						const meta = STATUS_META[item.status]
						const detail = rowStatusDetail(item, t)
						return (
							<div className="flex min-w-[8rem] flex-col gap-1">
								<Badge variant="secondary" className={cn('w-fit gap-1 text-[10px] font-semibold uppercase tracking-wider', meta.className)}>
									{meta.icon}
									{statusText(item, t)}
								</Badge>
								{detail ? (
									<span
										data-testid={item.status === 'error' ? 'queue-error-msg' : item.status === 'done' && item.lastStatus?.key === 'subtitlesFailed' ? 'queue-subs-warning' : undefined}
										className={cn('max-w-48 truncate text-[11px]', item.status === 'error' ? 'text-[var(--color-status-error)]' : 'text-[var(--text-subtle)]')}
										title={detail}
									>
										{detail}
									</span>
								) : null}
							</div>
						)
					}
				}),
				columnHelper.accessor('progressPercent', {
					header: ({column}) => sortableHeader(t('queue.table.progress'), column, t),
					cell: info => {
						const item = info.row.original
						return (
							<div className="min-w-24 max-w-32">
								<div className="font-mono text-[12px] text-muted-foreground">{Math.round(item.progressPercent)}%</div>
								<Progress value={item.progressPercent} className="mt-1 gap-0 [&_[data-slot=progress-track]]:h-[3px]" />
							</div>
						)
					}
				}),
				columnHelper.accessor('formatLabel', {
					header: ({column}) => sortableHeader(t('queue.table.format'), column, t),
					cell: info => (
						<span className="block truncate text-[12px] text-muted-foreground" title={info.getValue()}>
							{info.getValue()}
						</span>
					)
				}),
				columnHelper.accessor('outputDir', {
					header: ({column}) => sortableHeader(t('queue.table.outputTarget'), column, t),
					cell: info => (
						<span className="block max-w-56 truncate font-mono text-[11px] text-muted-foreground" title={info.getValue()}>
							{info.getValue()}
						</span>
					)
				}),
				columnHelper.accessor('artifacts', {
					header: ({column}) => sortableHeader(t('queue.table.artifacts'), column, t),
					sortingFn: (rowA, rowB) => visibleQueueArtifacts(rowA.original.artifacts).length - visibleQueueArtifacts(rowB.original.artifacts).length,
					cell: info => {
						const item = info.row.original
						const count = visibleQueueArtifacts(item.artifacts).length
						const expanded = expandedIds.has(item.id)
						return (
							<Button
								type="button"
								variant="ghost"
								size="xs"
								disabled={count === 0}
								aria-expanded={expanded}
								aria-label={t(expanded ? 'queue.table.hideArtifactsFor' : 'queue.table.showArtifactsFor', {title: item.title})}
								onClick={event => {
									event.stopPropagation()
									onToggleExpanded(item.id)
								}}
								className="h-7 gap-1 px-2 text-[11px]"
							>
								<Captions size={12} aria-hidden />
								{count}
								<ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden />
							</Button>
						)
					}
				}),
				columnHelper.accessor('addedAt', {header: ({column}) => sortableHeader(t('queue.table.added'), column, t), cell: info => <span className="block truncate text-[11px] text-muted-foreground">{formatQueueDate(info.getValue(), t)}</span>}),
				columnHelper.accessor('finishedAt', {header: ({column}) => sortableHeader(t('queue.table.finished'), column, t), cell: info => <span className="block truncate text-[11px] text-muted-foreground">{formatQueueDate(info.getValue(), t)}</span>})
			] as QueueManagerColumn[],
		[expandedIds, onToggleExpanded, t]
	)
}

import {useMemo, type ReactNode} from 'react'
import {createColumnHelper, type ColumnDef} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import {AlertTriangle, Ban, Captions, CheckCircle2, ChevronDown, CircleHelp, Clock, Loader2, Pause, PauseCircle, X, XCircle} from 'lucide-react'
import type {StatusKey} from '@shared/schemas.js'
import type {QueueItem, QueueItemStatus} from '@shared/types.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'
import {compactSize} from '@shared/format.js'
import {i18next} from '@shared/i18n/index.js'
import {cn} from '@renderer/lib/utils.js'
import {formatLocalizedError, formatStatus} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import type {QueueTableFeatures} from './queueTableFeatures.js'
import {queueItemFilesMissing, queueItemSizeBytes} from './queueFileSize.js'
import {Hint} from '../shared/Hint.js'
import {QueueDateCell} from './QueueDateCell.js'
import {QueueProgressCell} from './QueueProgressCell.js'
import {QueueMetadataCell} from './QueueMetadataCell.js'

const STATUS_META: Record<
	QueueItemStatus,
	{
		variant: 'secondary' | 'info' | 'warning' | 'success' | 'destructive'
		icon: ReactNode
		labelKey: 'queue.item.statusProbing' | 'queue.item.statusNeedsChoice' | 'queue.item.statusPending' | 'queue.item.statusRunning' | 'queue.item.statusHeld' | 'queue.item.statusPaused' | 'queue.item.statusDone' | 'queue.item.statusError' | 'queue.item.statusCancelled'
	}
> = {
	probing: {variant: 'secondary', icon: <Loader2 size={12} className="animate-spin" aria-hidden />, labelKey: 'queue.item.statusProbing'},
	'needs-choice': {variant: 'warning', icon: <CircleHelp size={12} aria-hidden />, labelKey: 'queue.item.statusNeedsChoice'},
	pending: {variant: 'secondary', icon: <Clock size={12} aria-hidden />, labelKey: 'queue.item.statusPending'},
	running: {variant: 'info', icon: <Loader2 size={12} className="animate-spin" aria-hidden />, labelKey: 'queue.item.statusRunning'},
	'paused-held': {variant: 'warning', icon: <PauseCircle size={12} aria-hidden />, labelKey: 'queue.item.statusHeld'},
	'paused-active': {variant: 'warning', icon: <Pause size={12} aria-hidden />, labelKey: 'queue.item.statusPaused'},
	done: {variant: 'success', icon: <CheckCircle2 size={12} aria-hidden />, labelKey: 'queue.item.statusDone'},
	error: {variant: 'destructive', icon: <XCircle size={12} aria-hidden />, labelKey: 'queue.item.statusError'},
	cancelled: {variant: 'secondary', icon: <Ban size={12} aria-hidden />, labelKey: 'queue.item.statusCancelled'}
}

const columnHelper = createColumnHelper<QueueTableFeatures, QueueItem>()

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
	if (item.status === 'error') {
		const message = formatLocalizedError(item.error) || t('queue.item.defaultError')
		// A scheduled auto-retry otherwise reads as a dead failure. Say that
		// Arroxy is going to act, so the user does not retry it by hand.
		return item.retryAt ? `${message} — ${t('queue.item.retryingSoon', {attempt: item.retryCount})}` : message
	}
	if (item.status === 'running' || item.status === 'paused-active') return item.progressDetail ?? formatStatus(item.lastStatus)
	const notice = doneNotice(item)
	if (notice) return notice.label(item, t)
	return ''
}

interface DoneNotice {
	testId: string
	// Rows are a fixed single line, so a long notice gets a short label and
	// keeps its full explanation (the part the user can act on) in the tooltip.
	label: (item: QueueItem, t: TFunction) => string
}

const heightParam = (item: QueueItem): string | number => item.lastStatus?.params?.height ?? ''

// A finished row still carries a notice when something about the result needs
// the user's attention; each kind keeps its own test id.
const DONE_NOTICES: Partial<Record<StatusKey, DoneNotice>> = {
	subtitlesFailed: {testId: 'queue-subs-warning', label: item => formatStatus(item.lastStatus)},
	noSubtitleTracks: {testId: 'queue-subs-warning', label: (_item, t) => t('queue.item.noSubtitleTracks')},
	qualityLimited: {testId: 'queue-quality-warning', label: (item, t) => t('queue.item.qualityLimited', {height: heightParam(item)})},
	qualityLimitedSubtitlesFailed: {testId: 'queue-quality-warning', label: (item, t) => t('queue.item.qualityLimitedSubtitlesFailed', {height: heightParam(item)})},
	audioKept: {testId: 'queue-audio-warning', label: (_item, t) => t('queue.item.audioKept')},
	audioKeptSubtitlesFailed: {testId: 'queue-audio-warning', label: (_item, t) => t('queue.item.audioKeptSubtitlesFailed')}
}

function doneNotice(item: QueueItem): DoneNotice | undefined {
	return item.status === 'done' && item.lastStatus ? DONE_NOTICES[item.lastStatus.key] : undefined
}

// `onCancelProbing`: a probing row's own Cancel, which aborts its probe and drops the row.
export function useQueueManagerColumns({expandedIds, onToggleExpanded, onCancelProbing, t}: {expandedIds: ReadonlySet<string>; onToggleExpanded: (itemId: string) => void; onCancelProbing: (itemId: string) => void; t: TFunction}): ColumnDef<QueueTableFeatures, QueueItem>[] {
	return useMemo(
		() =>
			columnHelper.columns([
				columnHelper.accessor('title', {
					header: ({column}) => sortableHeader(t('queue.table.title'), column, t),
					enableHiding: false,
					cell: info => {
						const item = info.row.original
						return (
							<div className="flex min-w-0 items-center gap-2">
								<div className="size-11 shrink-0 overflow-hidden rounded-md bg-secondary">{item.thumbnail ? <img src={item.thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="size-full object-cover" /> : <div className="thumb-shimmer size-full" aria-hidden />}</div>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-foreground" data-testid="queue-title">
										{item.title}
									</p>
									<p className="truncate text-caption text-subtle-foreground">{item.url}</p>
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
							<div className="flex min-w-0 flex-col gap-1">
								<div className="flex min-w-0 flex-nowrap items-center gap-1">
									{/* A status wider than its column wraps at a word boundary: shown whole, never cut. */}
									<Badge variant={meta.variant} size="sm" className="h-auto min-h-4.5 max-w-full min-w-0 shrink justify-start whitespace-normal py-0.5 text-start leading-tight uppercase tracking-wide">
										{meta.icon}
										<span data-slot="badge-label" className="min-w-0">
											{statusText(item, t)}
										</span>
									</Badge>
									{item.status === 'probing' ? (
										<Hint label={t('queue.item.cancel')}>
											<Button
												type="button"
												variant="ghost"
												size="icon-xs"
												aria-label={t('queue.item.cancel')}
												onClick={event => {
													event.stopPropagation()
													onCancelProbing(item.id)
												}}
												data-testid={`queue-cancel-probing-${item.id}`}
											>
												<X aria-hidden />
											</Button>
										</Hint>
									) : null}
								</div>
								{detail ? (
									<Hint label={doneNotice(item) ? formatStatus(item.lastStatus) : detail} reveal={!doneNotice(item)}>
										<span data-testid={item.status === 'error' ? 'queue-error-msg' : doneNotice(item)?.testId} className={cn('max-w-48 truncate text-caption', item.status === 'error' ? 'text-destructive' : doneNotice(item) ? 'text-warning' : 'text-subtle-foreground')}>
											{detail}
										</span>
									</Hint>
								) : null}
							</div>
						)
					}
				}),
				columnHelper.accessor('progressPercent', {header: ({column}) => sortableHeader(t('queue.table.progress'), column, t), cell: info => <QueueProgressCell value={info.getValue()} />}),
				columnHelper.accessor('formatLabel', {header: ({column}) => sortableHeader(t('queue.table.format'), column, t), cell: info => <QueueMetadataCell value={info.getValue()} className="block truncate text-xs text-muted-foreground" />}),
				columnHelper.accessor('outputDir', {header: ({column}) => sortableHeader(t('queue.table.outputTarget'), column, t), cell: info => <QueueMetadataCell value={info.getValue()} className="block max-w-56 truncate font-mono text-caption text-muted-foreground" />}),
				columnHelper.accessor('artifacts', {
					header: ({column}) => sortableHeader(t('queue.table.artifacts'), column, t),
					sortFn: (rowA, rowB) => visibleQueueArtifacts(rowA.original.artifacts).length - visibleQueueArtifacts(rowB.original.artifacts).length,
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
								className="h-7 gap-1 px-2 text-caption"
							>
								<Captions size={12} aria-hidden />
								{count}
								<ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden />
							</Button>
						)
					}
				}),
				columnHelper.accessor(row => queueItemSizeBytes(row.artifacts), {
					id: 'fileSize',
					header: ({column}) => sortableHeader(t('queue.table.size'), column, t),
					// Rows without a known size sort below the smallest file.
					sortFn: (rowA, rowB) => (rowA.getValue<number | null>('fileSize') ?? -1) - (rowB.getValue<number | null>('fileSize') ?? -1),
					cell: info => {
						const sizeBytes = info.getValue()
						if (sizeBytes === null && queueItemFilesMissing(info.row.original.artifacts)) {
							return (
								<span className="flex min-w-0 items-center gap-1 text-caption text-destructive">
									<AlertTriangle size={11} className="shrink-0" aria-hidden />
									<span className="truncate">{t('queue.artifact.missing')}</span>
								</span>
							)
						}
						return <span className="block truncate whitespace-nowrap font-mono text-caption text-muted-foreground">{sizeBytes === null ? t('queue.table.notAvailable') : compactSize(sizeBytes, i18next.language)}</span>
					}
				}),
				columnHelper.accessor('addedAt', {header: ({column}) => sortableHeader(t('queue.table.added'), column, t), cell: info => <QueueDateCell value={info.getValue()} t={t} />}),
				columnHelper.accessor('finishedAt', {header: ({column}) => sortableHeader(t('queue.table.finished'), column, t), cell: info => <QueueDateCell value={info.getValue()} t={t} />})
			]),
		[expandedIds, onCancelProbing, onToggleExpanded, t]
	)
}

import type {JSX, KeyboardEvent as ReactKeyboardEvent} from 'react'
import {useCallback, useMemo, useRef} from 'react'
import {useVirtualizer} from '@tanstack/react-virtual'
import {ChevronDown, Gauge, Inbox, Pause, Play, Share2, Trash2, X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {isHighValueDownload} from '@shared/queueItem.js'
import type {QueueItem} from '@shared/types.js'
import {useAppStore, formatStatus} from '../../store/useAppStore.js'
import {QueueItemCard} from '../queue/QueueItemCard.js'
import {QueueTipNudge} from '../queue/QueueTipNudge.js'
import {Badge} from '../ui/badge.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {LimitRatePicker} from '../shared/LimitRatePicker.js'
import {formatLimitRateLabel} from '../shared/limitRateFormat.js'

// Virtualization constants for the queue list.
// Two fixed tiers. The tall tier covers rows with an extra content line below
// the meta row: the progress block (running/paused-active), the error message,
// or the subtitles-failed warning. Other states (pending, paused-held, done,
// cancelled) render thumbnail + title + meta only. Error and subsFailed text
// are single-line truncate (QueueItemCard) so the slot never overflows.
const TALL_ROW_CONTENT = 76
const SHORT_ROW_CONTENT = 48
const ROW_GAP = 6
const TALL_ROW_STRIDE = TALL_ROW_CONTENT + ROW_GAP
const SHORT_ROW_STRIDE = SHORT_ROW_CONTENT + ROW_GAP
const ROW_OVERSCAN = 5

function rowStride(item: QueueItem): number {
	const s = item.status
	if (s === 'running' || s === 'paused-active') return TALL_ROW_STRIDE
	if (s === 'error') return TALL_ROW_STRIDE
	if (s === 'done' && item.lastStatus?.key === 'subtitlesFailed') return TALL_ROW_STRIDE
	return SHORT_ROW_STRIDE
}

export function SmartDrawer(): JSX.Element {
	const {t} = useTranslation()
	const queue = useAppStore(s => s.queue)
	const drawerOpen = useAppStore(s => s.drawerOpen)
	const setDrawerOpen = useAppStore(s => s.setDrawerOpen)
	const showQueueTip = useAppStore(s => s.showQueueTip)
	const dismissQueueTip = useAppStore(s => s.dismissQueueTip)
	const clearCompleted = useAppStore(s => s.clearCompleted)
	const pauseAll = useAppStore(s => s.pauseAll)
	const resumeAll = useAppStore(s => s.resumeAll)
	const cancelAll = useAppStore(s => s.cancelAll)
	const shareHighValueBannerDismissed = useAppStore(s => s.settings?.common?.shareHighValueBannerDismissed ?? false)
	const openShareDialog = useAppStore(s => s.openShareDialog)
	const setShareHighValueBannerDismissed = useAppStore(s => s.setShareHighValueBannerDismissed)
	const limitRateRaw = useAppStore(s => s.settings?.common?.limitRate)
	const limitRate = limitRateRaw && limitRateRaw.trim() !== '' ? limitRateRaw : undefined
	const setLimitRate = useAppStore(s => s.setLimitRate)

	// Single pass over queue: fold all derived flags + ordered split + active
	// aggregate into one walk. Previously 7 separate filter/some/reduce calls,
	// each iterating the full array on every queue update.
	const derived = useMemo(() => {
		const active: QueueItem[] = []
		const done: QueueItem[] = []
		const running: QueueItem[] = []
		let hasCompleted = false
		let hasPaused = false
		let hasInFlight = false
		let hasHighValueCompletion = false
		let progressSum = 0
		for (const i of queue) {
			const s = i.status
			const finished = s === 'done' || s === 'cancelled'
			if (finished) done.push(i)
			else active.push(i)
			if (s === 'running') {
				running.push(i)
				progressSum += i.progressPercent
			}
			if (s === 'done' || s === 'cancelled' || s === 'error') hasCompleted = true
			if (s === 'paused-active' || s === 'paused-held') hasPaused = true
			if (s === 'running' || s === 'paused-active' || s === 'paused-held' || s === 'pending') hasInFlight = true
			if (isHighValueDownload(i)) hasHighValueCompletion = true
		}
		const orderedQueue = active.concat(done)
		const activeCount = running.length
		const aggregatePercent = activeCount === 0 ? 0 : progressSum / activeCount
		return {orderedQueue, running, activeCount, hasCompleted, hasPaused, hasInFlight, hasHighValueCompletion, aggregatePercent}
	}, [queue])
	const {orderedQueue, running: activeItems, activeCount, hasCompleted, hasPaused, hasInFlight, hasHighValueCompletion, aggregatePercent} = derived
	const totalCount = queue.length
	const hasDownloading = activeCount > 0
	const headerProgress = activeCount === 1 ? activeItems[0].progressPercent : aggregatePercent
	const showShareBanner = hasHighValueCompletion && !shareHighValueBannerDismissed

	const scrollRef = useRef<HTMLDivElement>(null)
	const getScrollElement = useCallback(() => scrollRef.current, [])
	const estimateSize = useCallback((i: number) => rowStride(orderedQueue[i]), [orderedQueue])
	const getItemKey = useCallback((i: number) => orderedQueue[i].id, [orderedQueue])
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const rowVirtualizer = useVirtualizer({count: orderedQueue.length, getScrollElement, estimateSize, overscan: ROW_OVERSCAN, getItemKey})
	const virtualItems = rowVirtualizer.getVirtualItems()
	const totalListSize = rowVirtualizer.getTotalSize()

	let headerSummary: string | null = null
	if (activeCount === 1) {
		const item = activeItems[0]
		const detail = item.progressDetail ?? formatStatus(item.lastStatus)
		headerSummary = `${item.progressPercent.toFixed(0)}%${detail ? ` · ${detail}` : ''}`
	} else if (activeCount >= 2) {
		headerSummary = t('queue.activeCount', {count: activeCount, percent: aggregatePercent.toFixed(0)})
	} else if (totalCount === 0) {
		headerSummary = t('queue.noDownloads')
	}

	return (
		<section className="chrome-glass relative shrink-0 border-t border-border" data-testid="smart-drawer">
			<QueueTipNudge visible={showQueueTip} onDismiss={dismissQueueTip} />
			<div
				role="button"
				tabIndex={0}
				aria-expanded={drawerOpen}
				onClick={() => setDrawerOpen(!drawerOpen)}
				onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						setDrawerOpen(!drawerOpen)
					}
				}}
				className="relative flex h-9 w-full cursor-pointer items-center justify-between overflow-hidden px-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				data-testid="drawer-toggle"
				title={t('queue.toggleTitle')}
			>
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center text-muted-foreground" aria-label={t('queue.header')} title={t('queue.header')}>
						<Inbox size={14} />
						{totalCount > 0 && (
							<Badge variant="secondary" className="ms-1 text-[9px] font-mono h-4 px-1">
								{totalCount}
							</Badge>
						)}
					</span>
					{headerSummary && (
						<span className={`text-[12px] font-mono ${activeCount > 0 ? 'text-[var(--brand)]' : 'text-muted-foreground'}`} data-testid="drawer-header-summary">
							{headerSummary}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					{hasDownloading && (
						<button
							type="button"
							data-testid="btn-pause-all"
							onClick={e => {
								e.stopPropagation()
								void pauseAll()
							}}
							className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
							title={t('queue.pauseAllTitle')}
						>
							<Pause size={10} />
							{t('queue.pauseAll')}
						</button>
					)}
					{hasPaused && (
						<button
							type="button"
							data-testid="btn-resume-first"
							onClick={e => {
								e.stopPropagation()
								void resumeAll()
							}}
							className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
							title={t('queue.resumeAllTitle')}
						>
							<Play size={10} />
							{t('queue.resumeAll')}
						</button>
					)}
					{hasInFlight && (
						<button
							type="button"
							data-testid="btn-cancel-all"
							onClick={e => {
								e.stopPropagation()
								void cancelAll()
							}}
							className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
							title={t('queue.cancelAllTitle')}
						>
							<X size={10} />
							{t('queue.cancelAll')}
						</button>
					)}
					{hasCompleted && (
						<button
							type="button"
							data-testid="btn-clear-completed"
							onClick={e => {
								e.stopPropagation()
								void clearCompleted()
							}}
							className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
							title={t('queue.clearTitle')}
						>
							<Trash2 size={10} />
							{t('queue.clear')}
						</button>
					)}
					<Popover>
						<PopoverTrigger
							type="button"
							onClick={e => e.stopPropagation()}
							className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
							title={t('queue.limitRateTitle')}
							data-testid="btn-limit-rate"
						>
							<Gauge size={10} />
							{limitRate ? t('queue.limitRate', {value: formatLimitRateLabel(limitRate)}) : t('queue.limitRateOff')}
						</PopoverTrigger>
						<PopoverContent align="end" side="top" sideOffset={8} onClick={e => e.stopPropagation()} className="w-64">
							<div className="flex flex-col gap-1">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('wizard.url.limitRate.label')}</p>
								<p className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.limitRate.description')}</p>
							</div>
							<LimitRatePicker value={limitRate} onChange={v => void setLimitRate(v)} />
						</PopoverContent>
					</Popover>
					{totalCount > 0 && !drawerOpen && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" aria-hidden />}
					<span className={activeCount > 0 ? 'text-[var(--brand)]' : 'text-muted-foreground'}>
						<ChevronDown size={activeCount > 0 ? 14 : 12} strokeWidth={activeCount > 0 ? 2.5 : 2} className={`transition-all duration-300 ${drawerOpen ? '' : 'rotate-180'}`} />
					</span>
				</div>
				{activeCount > 0 && <div aria-hidden data-testid="drawer-header-progress" className="absolute bottom-0 start-0 h-[2px] transition-[width] duration-500" style={{width: `${headerProgress}%`, background: 'linear-gradient(90deg, var(--brand), var(--brand-hover))', boxShadow: '0 0 8px var(--brand-glow)'}} />}
			</div>

			<div className="drawer-body" style={{maxHeight: drawerOpen ? '16rem' : '0px'}} data-testid="drawer-body" aria-hidden={!drawerOpen}>
				{drawerOpen && showShareBanner && (
					<div className="bg-muted/40 border-b border-border flex items-stretch" data-testid="share-high-value-banner">
						<button type="button" onClick={() => openShareDialog('high-value-inline')} className="flex-1 flex items-center gap-2 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left cursor-pointer" data-testid="share-high-value-banner-action">
							<Share2 size={11} className="shrink-0 text-[var(--brand)]" />
							<span className="flex-1 truncate">{t('share.highValueBanner.body')}</span>
						</button>
						<button
							type="button"
							aria-label={t('share.highValueBanner.dismiss')}
							className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-7 inline-flex items-center justify-center cursor-pointer"
							onClick={() => void setShareHighValueBannerDismissed()}
							data-testid="share-high-value-banner-dismiss"
						>
							<X size={11} />
						</button>
					</div>
				)}
				{/* Virtualized list. Plain `overflow-y-auto` scroll container instead
            of `ScrollArea` because @tanstack/react-virtual needs a direct ref
            to the scroll element; ScrollArea wraps its viewport behind a
            shadow primitive that isn't reachable. Trade-off accepted: drawer
            uses the native scrollbar styled by the browser/OS, identical to
            the rest of the app within ~1px. */}
				{drawerOpen && (
					<div ref={scrollRef} className="h-64 overflow-y-auto px-3 pt-2 pb-3" data-testid="drawer-scroll">
						{queue.length === 0 ? (
							<div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
								<Inbox size={16} className="shrink-0" />
								<span>{t('queue.empty')}</span>
							</div>
						) : (
							<ul className="relative" style={{height: totalListSize}}>
								{virtualItems.map(vr => {
									const item = orderedQueue[vr.index]
									return (
										<li key={vr.key} className="absolute left-0 right-0" style={{top: vr.start, height: vr.size - ROW_GAP}}>
											<QueueItemCard item={item} />
										</li>
									)
								})}
							</ul>
						)}
					</div>
				)}
			</div>
		</section>
	)
}

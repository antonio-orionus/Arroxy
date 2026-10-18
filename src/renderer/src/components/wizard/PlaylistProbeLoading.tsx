import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {TFunction} from 'i18next'
import type {ProbeProgressEvent} from '@shared/types.js'
import {Badge} from '../ui/badge.js'
import {IconTile} from '../shared/IconTile.js'
import {Spinner} from '../ui/spinner.js'

interface ItemProgressCounts {
	loaded: number
	// Capped at the probe limit; null while the extractor hasn't reported a total.
	total: number | null
}

function itemProgressCounts(progress: ProbeProgressEvent | null, limit: number): ItemProgressCounts | null {
	if (progress?.phase !== 'items') return null
	const total = progress.total ? Math.min(progress.total, limit) : null
	return {loaded: Math.min(progress.loaded, total ?? progress.loaded), total}
}

function progressPercent(counts: ItemProgressCounts | null): number | null {
	if (!counts?.total) return null
	return Math.min(100, Math.max(0, Math.round((counts.loaded / counts.total) * 100)))
}

function probePhaseLabel(progress: ProbeProgressEvent | null, t: TFunction): string | null {
	if (!progress) return null
	return progress.phase === 'pages' ? t('wizard.playlist.loadingPhasePages') : t('wizard.playlist.loadingPhaseItems')
}

function probeProgressLabel(progress: ProbeProgressEvent | null, counts: ItemProgressCounts | null, t: TFunction): string | null {
	if (!progress) return null
	if (progress.phase === 'pages') return t('wizard.playlist.loadingPagesFound', {count: progress.loaded})
	return counts?.total ? `${counts.loaded} / ${counts.total}` : String(progress.loaded)
}

function probeLimitHint(progress: ProbeProgressEvent | null, limit: number, t: TFunction): string | null {
	const exceedsLimit = progress?.phase === 'items' && progress.total !== undefined && progress.total > limit
	return exceedsLimit ? t('wizard.playlist.loadingLimitHint', {count: limit}) : null
}

function PlaylistProbeLoadingStatus({loadingLabel, phaseLabel, progressLabel, progressValue, limitHint}: {loadingLabel: string; phaseLabel: string | null; progressLabel: string | null; progressValue: number | null; limitHint: string | null}): ReactNode {
	return (
		<div className="rounded-md border border-border-strong bg-card/40 px-3 py-2.5 text-sm" data-testid="playlist-probe-loading" aria-live="polite">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<IconTile size="sm">
						<Spinner />
					</IconTile>
					<div className="min-w-0">
						<p className="truncate font-medium text-foreground">{loadingLabel}</p>
						{phaseLabel ? <p className="truncate text-xs text-muted-foreground">{phaseLabel}</p> : null}
					</div>
				</div>
				{progressLabel ? (
					<Badge variant="info" className="shrink-0 font-mono tabular-nums" data-testid="playlist-probe-progress-count">
						{progressLabel}
					</Badge>
				) : null}
			</div>
			{progressValue !== null ? (
				<progress className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-secondary [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary" value={progressValue} max={100} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressValue} />
			) : (
				<div className="thumb-shimmer mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden />
			)}
			{limitHint ? <p className="mt-2 text-xs text-muted-foreground">{limitHint}</p> : null}
		</div>
	)
}

export function PlaylistProbeLoading({loadingLabel, progress, limit}: {loadingLabel: string; progress: ProbeProgressEvent | null; limit: number}): ReactNode {
	const {t} = useTranslation()
	const counts = itemProgressCounts(progress, limit)
	return <PlaylistProbeLoadingStatus loadingLabel={loadingLabel} phaseLabel={probePhaseLabel(progress, t)} progressLabel={probeProgressLabel(progress, counts, t)} progressValue={progressPercent(counts)} limitHint={probeLimitHint(progress, limit, t)} />
}

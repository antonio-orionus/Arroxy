import type {ReactNode} from 'react'
import {AlertTriangle} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import type {TFunction} from 'i18next'
import type {QueueArtifact, QueueItem} from '@shared/types.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'
import {Badge} from '../ui/badge.js'
import {TableCell, TableRow} from '../ui/table.js'

type QueueArtifactLabelKey = 'queue.artifact.media' | 'queue.artifact.subtitle' | 'queue.artifact.thumbnail' | 'queue.artifact.description' | 'queue.artifact.companion' | 'queue.artifact.unknown'

const ARTIFACT_KIND_LABELS = {media: 'queue.artifact.media', subtitle: 'queue.artifact.subtitle', thumbnail: 'queue.artifact.thumbnail', description: 'queue.artifact.description', companion: 'queue.artifact.companion', unknown: 'queue.artifact.unknown'} as const satisfies Record<
	QueueArtifact['kind'],
	QueueArtifactLabelKey
>

function artifactKindLabel(kind: QueueArtifact['kind'], t: TFunction): string {
	return t(ARTIFACT_KIND_LABELS[kind])
}

function formatArtifactSize(sizeBytes: number | undefined): string | null {
	if (sizeBytes === undefined) return null
	if (sizeBytes < 1024) return `${sizeBytes} B`
	const units = ['KiB', 'MiB', 'GiB']
	let value = sizeBytes / 1024
	let unit = units[0]
	for (const nextUnit of units.slice(1)) {
		if (value < 1024) break
		value /= 1024
		unit = nextUnit
	}
	return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`
}

export function QueueArtifactsRow({columnsLength, item}: {columnsLength: number; item: QueueItem}): ReactNode {
	const {t} = useTranslation()
	const artifacts = visibleQueueArtifacts(item.artifacts)
	return (
		<TableRow data-testid={`queue-artifacts-${item.id}`} className="bg-muted/20 hover:bg-muted/20">
			<TableCell colSpan={columnsLength} className="min-w-0 overflow-hidden whitespace-normal px-3 py-2">
				<div className="ms-8 grid min-w-0 max-w-full gap-1 overflow-hidden border-s border-[var(--border-strong)] ps-3 sm:ms-11">
					{artifacts.map(artifact => {
						const size = formatArtifactSize(artifact.sizeBytes)
						return (
							<div key={artifact.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-[12px] text-muted-foreground">
								<Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-[0.08em]">
									{artifactKindLabel(artifact.kind, t)}
								</Badge>
								<span className="block min-w-0 truncate font-mono text-foreground" title={artifact.path}>
									{artifact.fileName}
								</span>
								{size ? <span className="shrink-0 text-[var(--text-subtle)]">{size}</span> : null}
								{artifact.missing ? (
									<span className="inline-flex shrink-0 items-center gap-1 text-[var(--color-status-error)]">
										<AlertTriangle size={11} aria-hidden />
										{t('queue.artifact.missing')}
									</span>
								) : null}
							</div>
						)
					})}
				</div>
			</TableCell>
		</TableRow>
	)
}

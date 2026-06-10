import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {RadioOption} from '../../ui/radio-option.js'
import {ScrollArea} from '../../ui/scroll-area.js'
import {cn} from '@renderer/lib/utils.js'

interface VideoColumnProps {
	view: FormatSelectionView['video']
	selectedVideoFormatId: string
	videoExtFilter: string | null
	dynamicRangeFilter: string | null
	onVideoExtFilterChange: (value: string | null) => void
	onDynamicRangeFilterChange: (value: string | null) => void
	onSelect: (formatId: string) => void
}

export function VideoColumn({view, selectedVideoFormatId, videoExtFilter, dynamicRangeFilter, onVideoExtFilterChange, onDynamicRangeFilterChange, onSelect}: VideoColumnProps): ReactNode {
	const {t} = useTranslation()

	return (
		<div className="flex flex-col gap-0 h-full">
			<div className="flex items-center justify-between mb-[6px]">
				<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.video')}</p>
				<div className="flex items-center gap-[6px]">
					{view.dynamicRangeOptions.length > 1 && (
						<ToggleGroup value={dynamicRangeFilter ? [dynamicRangeFilter] : []} onValueChange={vals => onDynamicRangeFilterChange(vals[0] ?? null)} spacing={1} className="gap-[3px]">
							{view.dynamicRangeOptions.map(dr => (
								<ToggleGroupItem key={dr} value={dr} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
									{dr}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
					{view.extOptions.length > 1 && (
						<ToggleGroup value={videoExtFilter ? [videoExtFilter] : []} onValueChange={vals => onVideoExtFilterChange(vals[0] ?? null)} spacing={1} className="gap-[3px]">
							{view.extOptions.map(ext => (
								<ToggleGroupItem key={ext} value={ext} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
									{ext}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0">
				{view.rows.map(row => {
					const isChecked = selectedVideoFormatId === row.formatId
					return (
						<RadioOption key={row.formatId || 'audio-only'} checked={isChecked} disabled={view.disabled} onClick={() => onSelect(row.formatId)} label={row.resolution} labelClassName="min-w-[68px]">
							{
								<>
									{!row.isAudioOnly && (
										<div className="w-[32px] h-[2px] bg-accent rounded-full flex-shrink-0">
											<div className={cn('h-full rounded-full bg-[var(--brand)]', isChecked ? 'opacity-100' : 'opacity-25')} style={{width: row.barWidth > 0 ? `${row.barWidth}%` : '0%'}} />
										</div>
									)}
									{row.meta && (
										<span className="text-[13px] ml-auto whitespace-nowrap" style={{color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)'}}>
											{row.meta}
										</span>
									)}
								</>
							}
						</RadioOption>
					)
				})}
			</ScrollArea>
		</div>
	)
}

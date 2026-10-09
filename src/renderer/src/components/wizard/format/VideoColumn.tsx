import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {RadioGroup} from '../../ui/radio-group.js'
import {ChoiceRow} from '../../shared/ChoiceRow.js'
import {ScrollArea} from '../../ui/scroll-area.js'
import {SectionLabel} from '../../shared/SectionLabel.js'

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
			<div className="mb-1.5 flex items-center justify-between">
				<SectionLabel>{t('wizard.formats.video')}</SectionLabel>
				<div className="flex items-center gap-1.5">
					{view.dynamicRangeOptions.length > 1 && (
						<ToggleGroup size="xs" variant="outline" value={dynamicRangeFilter ? [dynamicRangeFilter] : []} onValueChange={vals => onDynamicRangeFilterChange(vals[0] ?? null)} spacing={1} className="flex-wrap justify-end gap-1">
							{view.dynamicRangeOptions.map(dr => (
								<ToggleGroupItem key={dr} value={dr} shape="chip">
									{dr}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
					{view.extOptions.length > 1 && (
						<ToggleGroup size="xs" variant="outline" value={videoExtFilter ? [videoExtFilter] : []} onValueChange={vals => onVideoExtFilterChange(vals[0] ?? null)} spacing={1} className="flex-wrap justify-end gap-1">
							{view.extOptions.map(ext => (
								<ToggleGroupItem key={ext} value={ext} shape="chip">
									{ext}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0">
				<RadioGroup value={selectedVideoFormatId} onValueChange={value => onSelect(String(value))} disabled={view.disabled} aria-label={t('wizard.formats.video')} className="gap-1">
					{view.rows.map(row => (
						<ChoiceRow key={row.formatId || 'audio-only'} id={`video-format-${row.formatId || 'audio-only'}`} value={row.formatId} label={row.resolution} meta={row.meta} disabled={view.disabled} />
					))}
				</RadioGroup>
			</ScrollArea>
		</div>
	)
}

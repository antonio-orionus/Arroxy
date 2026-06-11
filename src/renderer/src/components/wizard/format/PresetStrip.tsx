import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {Preset} from '@shared/types.js'
import {presetOptions} from '../../../store/useAppStore.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../../ui/tooltip.js'

interface PresetStripProps {
	activePreset: Preset | null
	onSelect: (p: Preset) => void
}

export function PresetStrip({activePreset, onSelect}: PresetStripProps): ReactNode {
	const {t} = useTranslation()
	const options = presetOptions()

	return (
		<div className="flex flex-col gap-1.5">
			<p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.quickPresets')}</p>
			<ToggleGroup
				value={activePreset ? [activePreset] : []}
				onValueChange={vals => {
					if (vals[0]) onSelect(vals[0] as Preset)
				}}
				spacing={2}
				className="grid grid-cols-5 gap-1.5 w-full"
			>
				{options.map(p => (
					<Tooltip key={p.value}>
						<TooltipTrigger
							render={props => (
								<ToggleGroupItem {...props} value={p.value} className="wizard-choice-tile flex h-auto w-full items-center justify-center rounded-[8px] px-2.5 py-1.5 transition-all">
									<span className="truncate text-[13px] font-semibold text-inherit">{p.label}</span>
								</ToggleGroupItem>
							)}
						/>
						<TooltipContent>{p.desc}</TooltipContent>
					</Tooltip>
				))}
			</ToggleGroup>
		</div>
	)
}

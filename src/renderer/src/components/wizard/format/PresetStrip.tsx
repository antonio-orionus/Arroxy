import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {Preset} from '@shared/types.js'
import {presetOptions} from '../../../store/useAppStore.js'
import {ToggleGroup} from '../../ui/toggle-group.js'
import {OptionCard} from '../../shared/OptionCard.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../../ui/tooltip.js'
import {SectionLabel} from '../../shared/SectionLabel.js'

interface PresetStripProps {
	activePreset: Preset | null
	onSelect: (p: Preset) => void
}

export function PresetStrip({activePreset, onSelect}: PresetStripProps): ReactNode {
	const {t} = useTranslation()
	const options = presetOptions()

	return (
		<div className="flex flex-col gap-1.5">
			<SectionLabel>{t('wizard.formats.quickPresets')}</SectionLabel>
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
						<TooltipTrigger render={props => <OptionCard {...props} value={p.value} title={p.label} align="center" className="w-full justify-center" />} />
						<TooltipContent>{p.desc}</TooltipContent>
					</Tooltip>
				))}
			</ToggleGroup>
		</div>
	)
}

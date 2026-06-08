import {useState, type ReactNode} from 'react'
import {Info} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {NETWORK_PACING_PRESET_VALUES} from '@shared/constants.js'
import {pacingConcurrentFragmentsSchema, pacingSleepSecondsSchema} from '@shared/schemas.js'
import type {NetworkPacingPreset} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '../ui/input-group.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'

const CUSTOM_FIELDS = [
	{key: 'pacingSleepRequests', labelKey: 'sleepRequests', unitKey: 'seconds', testId: 'pacing-sleep-requests'},
	{key: 'pacingSleepInterval', labelKey: 'sleepInterval', unitKey: 'seconds', testId: 'pacing-sleep-interval'},
	{key: 'pacingMaxSleepInterval', labelKey: 'maxSleepInterval', unitKey: 'seconds', testId: 'pacing-max-sleep-interval'},
	{key: 'pacingSleepSubtitles', labelKey: 'sleepSubtitles', unitKey: 'seconds', testId: 'pacing-sleep-subtitles'},
	{key: 'pacingConcurrentFragments', labelKey: 'concurrentFragments', unitKey: 'threads', testId: 'pacing-concurrent-fragments'}
] as const

const OFF_SUBTITLE_SLEEP_SECONDS = 3

function HelpTooltip({children, testId, label}: {children: ReactNode; testId: string; label: string}): ReactNode {
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={label} className="text-[var(--text-subtle)] hover:text-foreground" data-testid={testId}>
						<Info aria-hidden />
					</Button>
				)}
			/>
			<TooltipContent className="max-w-[18rem] leading-snug">{children}</TooltipContent>
		</Tooltip>
	)
}

function toDraft(value: number | undefined): string {
	return value === undefined ? '' : String(value)
}

function formatSeconds(value: number | undefined): string {
	if (value === undefined || value === 0) return '0s'
	return `${value}s`
}

function presetSummaryValues(preset: Exclude<NetworkPacingPreset, 'custom'>): {requests: string; downloads: string; subtitles: string; fragments: number} {
	const values = NETWORK_PACING_PRESET_VALUES[preset]
	const subtitleSleep = preset === 'off' ? OFF_SUBTITLE_SLEEP_SECONDS : values.sleepSubtitles
	return {requests: formatSeconds(values.sleepRequests), downloads: values.sleepInterval !== undefined && values.maxSleepInterval !== undefined ? `${values.sleepInterval}-${values.maxSleepInterval}s` : '0s', subtitles: formatSeconds(subtitleSleep), fragments: values.concurrentFragments ?? 1}
}

export function NetworkPacingSettings(): ReactNode {
	const {t} = useTranslation()
	const {settings, setNetworkPacingPreset, setPacingSleepRequests, setPacingSleepInterval, setPacingMaxSleepInterval, setPacingSleepSubtitles, setPacingConcurrentFragments} = useAppStore()
	const common = settings?.common
	const pacingPreset: NetworkPacingPreset = common?.networkPacingPreset ?? 'balanced'
	const [fieldDrafts, setFieldDrafts] = useState<Partial<Record<(typeof CUSTOM_FIELDS)[number]['key'], string>>>({})

	const FIELD_SETTERS = {pacingSleepRequests: setPacingSleepRequests, pacingSleepInterval: setPacingSleepInterval, pacingMaxSleepInterval: setPacingMaxSleepInterval, pacingSleepSubtitles: setPacingSleepSubtitles, pacingConcurrentFragments: setPacingConcurrentFragments} as const

	function onFieldChange(key: (typeof CUSTOM_FIELDS)[number]['key'], value: string): void {
		setFieldDrafts(prev => ({...prev, [key]: value}))
	}

	function onFieldBlur(key: (typeof CUSTOM_FIELDS)[number]['key']): void {
		const draft = fieldDrafts[key]
		if (draft === undefined) return
		const parsed = draft === '' ? 0 : Number(draft)
		const schema = key === 'pacingConcurrentFragments' ? pacingConcurrentFragmentsSchema : pacingSleepSecondsSchema
		if (!schema.safeParse(parsed).success) return
		setFieldDrafts(prev => {
			const next = {...prev}
			delete next[key]
			return next
		})
		void FIELD_SETTERS[key](parsed)
	}

	return (
		<Field className="gap-3" data-testid="network-pacing-section">
			<FieldContent className="gap-0.5">
				<FieldTitle id="network-pacing-heading" className="text-[13px] font-medium text-foreground">
					{t('wizard.url.networkPacing.heading')}
				</FieldTitle>
				<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.networkPacing.description')}</FieldDescription>
			</FieldContent>

			<div className="flex flex-col gap-1.5 rounded-md border border-[var(--border-strong)] bg-background/35 p-2.5">
				<div className="flex items-center gap-1">
					<span id="network-pacing-preset-label" className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
						{t('wizard.url.networkPacing.presetLabel')}
					</span>
					<HelpTooltip testId="network-pacing-tooltip" label={t('wizard.url.networkPacing.presetLabel')}>
						{t('wizard.url.networkPacing.tooltip')}
					</HelpTooltip>
				</div>
				<ToggleGroup
					variant="outline"
					value={[pacingPreset]}
					onValueChange={value => {
						if (value[0]) void setNetworkPacingPreset(value[0] as NetworkPacingPreset)
					}}
					spacing={1}
					className="grid w-full grid-cols-2 gap-1"
					aria-labelledby="network-pacing-preset-label"
				>
					{(['off', 'balanced', 'careful', 'custom'] as const).map(preset => (
						<Tooltip key={preset}>
							<TooltipTrigger
								render={props => (
									<ToggleGroupItem {...props} value={preset} className="h-7 justify-start px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
										{t(`wizard.url.networkPacing.presets.${preset}`)}
									</ToggleGroupItem>
								)}
							/>
							<TooltipContent className="max-w-[18rem] leading-snug" data-testid={`network-pacing-${preset}-tooltip`}>
								{t(`wizard.url.networkPacing.tooltips.${preset}`)}
							</TooltipContent>
						</Tooltip>
					))}
				</ToggleGroup>
				{pacingPreset !== 'custom' && (
					<p className="text-[11px] text-[var(--text-subtle)]" data-testid="network-pacing-summary">
						{t('wizard.url.networkPacing.summary', presetSummaryValues(pacingPreset))}
					</p>
				)}
			</div>

			{pacingPreset === 'custom' && (
				<FieldGroup className="grid grid-cols-2 gap-2 rounded-md border border-[var(--border-strong)] bg-background/35 p-2.5" data-testid="network-pacing-custom">
					{CUSTOM_FIELDS.map(field => (
						<Field key={field.key} className="gap-1">
							<FieldLabel htmlFor={field.testId} className="text-[11px] font-medium text-[var(--text-subtle)]">
								{t(`wizard.url.networkPacing.fields.${field.labelKey}`)}
							</FieldLabel>
							<InputGroup>
								<InputGroupInput
									id={field.testId}
									type="number"
									min={0}
									value={fieldDrafts[field.key] ?? toDraft(common?.[field.key])}
									onChange={e => onFieldChange(field.key, e.target.value)}
									onBlur={() => onFieldBlur(field.key)}
									placeholder={String(NETWORK_PACING_PRESET_VALUES.balanced[field.labelKey] ?? '')}
									className="text-[12px] font-mono"
									data-testid={field.testId}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupText className="text-[11px]">{t(`wizard.url.networkPacing.units.${field.unitKey}`)}</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
						</Field>
					))}
				</FieldGroup>
			)}
		</Field>
	)
}

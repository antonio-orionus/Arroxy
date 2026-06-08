import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle} from 'lucide-react'
import {limitRateSchema} from '@shared/schemas.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Input} from '../ui/input.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {LIMIT_RATE_PRESETS, formatLimitRateLabel, isLimitRatePreset} from './limitRateFormat.js'

interface Props {
	value: string | undefined
	onChange: (value: string | undefined) => void
}

export function LimitRatePicker({value, onChange}: Props): ReactNode {
	const {t} = useTranslation()
	// Inline warning so users don't expect an in-flight change to throttle
	// already-spawned yt-dlp processes. Pause + Resume re-spawns with new args.
	const hasActiveDownloads = useAppStore(s => s.queue.some(i => i.status === 'running' || i.status === 'paused-active'))
	const valueIsPreset = value === undefined || isLimitRatePreset(value)

	// Manual "editing custom" toggle. The picker is in custom mode either when
	// the user opened it (editingCustom=true) or when the stored value isn't a
	// preset (so the user can see/edit their existing custom value).
	const [editingCustom, setEditingCustom] = useState(false)
	const [customError, setCustomError] = useState(false)

	const customMode = editingCustom || !valueIsPreset
	const selectedToggleValue = customMode ? 'custom' : (value ?? 'off')
	const customInputKey = valueIsPreset ? 'preset' : (value ?? 'custom')
	const customInitialValue = valueIsPreset ? '' : (value ?? '')

	const pickPreset = (preset: string | undefined): void => {
		setEditingCustom(false)
		setCustomError(false)
		onChange(preset)
	}

	const handleCustomChange = (next: string): void => {
		const trimmed = next.trim()
		if (trimmed === '') {
			setCustomError(false)
			onChange(undefined)
			return
		}
		if (limitRateSchema.safeParse(trimmed).success) {
			setCustomError(false)
			onChange(trimmed)
		} else {
			setCustomError(true)
		}
	}

	return (
		<div className="flex flex-col gap-2" data-testid="limit-rate-picker">
			{hasActiveDownloads && (
				<Alert variant="warning" data-testid="limit-rate-active-warning">
					<AlertTriangle />
					<AlertDescription className="text-[11px]">{t('wizard.url.limitRate.activeWarning')}</AlertDescription>
				</Alert>
			)}
			<ToggleGroup
				value={[selectedToggleValue]}
				onValueChange={values => {
					const next = values[0]
					if (!next) return
					if (next === 'custom') {
						setEditingCustom(true)
						return
					}
					pickPreset(next === 'off' ? undefined : next)
				}}
				aria-label={t('wizard.url.limitRate.label')}
				spacing={1}
				className="grid w-full grid-cols-2 items-stretch"
			>
				<ToggleGroupItem value="off" className="h-7 justify-start px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] aria-pressed:shadow-[0_0_0_2px_var(--brand-dim)]">
					{t('wizard.url.limitRate.off')}
				</ToggleGroupItem>
				{LIMIT_RATE_PRESETS.map(preset => (
					<ToggleGroupItem key={preset} value={preset} className="h-7 justify-start px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] aria-pressed:shadow-[0_0_0_2px_var(--brand-dim)]">
						{formatLimitRateLabel(preset)}
					</ToggleGroupItem>
				))}
				<ToggleGroupItem value="custom" className="h-7 justify-start px-2 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] aria-pressed:shadow-[0_0_0_2px_var(--brand-dim)]">
					{t('wizard.url.limitRate.custom')}
				</ToggleGroupItem>
			</ToggleGroup>
			{customMode && (
				<div className="flex flex-col gap-1">
					<Input key={customInputKey} type="text" defaultValue={customInitialValue} onChange={e => handleCustomChange(e.target.value)} placeholder={t('wizard.url.limitRate.customPlaceholder')} className="h-8 text-[12px] font-mono" aria-invalid={customError} data-testid="limit-rate-custom-input" />
					{customError && (
						<p className="text-[11px] text-amber-500" data-testid="limit-rate-custom-error">
							{t('wizard.url.limitRate.invalid')}
						</p>
					)}
				</div>
			)}
		</div>
	)
}

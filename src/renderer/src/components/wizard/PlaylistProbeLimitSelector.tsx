import {useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {DEFAULT_PLAYLIST_PROBE_LIMIT, PLAYLIST_PROBE_LIMIT_PRESETS} from '@shared/constants.js'
import {PLAYLIST_PROBE_LIMIT_MAX, PLAYLIST_PROBE_LIMIT_MIN, playlistProbeLimitSchema} from '@shared/schemas.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Input} from '../ui/input.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'

interface Props {
	testId?: string
	className?: string
	disabled?: boolean
	showCurrent?: boolean
	onLimitChanged?: (limit: number) => void | Promise<void>
}

const CUSTOM_VALUE = 'custom'

function isPreset(value: number): boolean {
	return (PLAYLIST_PROBE_LIMIT_PRESETS as readonly number[]).includes(value)
}

export function PlaylistProbeLimitSelector({testId = 'playlist-probe-limit', className, disabled = false, showCurrent = true, onLimitChanged}: Props): ReactNode {
	const {t} = useTranslation()
	const {settings, setPlaylistProbeLimit} = useAppStore()
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const selectedValue = isPreset(playlistLimit) ? String(playlistLimit) : `custom:${playlistLimit}`
	const [selectOpen, setSelectOpen] = useState(false)
	const [customOpen, setCustomOpen] = useState(false)
	const [customDraft, setCustomDraft] = useState(String(playlistLimit))
	const [saving, setSaving] = useState(false)
	const pendingLimitRef = useRef<number | null>(null)
	const parsedCustom = Number(customDraft)
	const customInvalid = !playlistProbeLimitSchema.safeParse(parsedCustom).success

	function formatOptionLabel(count: number): string {
		return t('wizard.url.playlistProbeLimit.option', {count})
	}

	function formatSelectedLabel(value: unknown): string {
		if (typeof value !== 'string') return formatOptionLabel(playlistLimit)
		if (value.startsWith('custom:')) return t('wizard.url.playlistProbeLimit.customValue', {count: playlistLimit})
		if (value !== CUSTOM_VALUE) return formatOptionLabel(Number(value))
		return formatOptionLabel(playlistLimit)
	}

	function openCustomDialog(): void {
		setCustomDraft(String(playlistLimit))
		setCustomOpen(true)
	}

	function openCustomDialogAfterSelectClose(): void {
		setSelectOpen(false)
		window.setTimeout(openCustomDialog, 0)
	}

	async function persistLimit(nextLimit: number): Promise<void> {
		if (nextLimit === playlistLimit) return
		if (pendingLimitRef.current === nextLimit) return
		pendingLimitRef.current = nextLimit
		setSaving(true)
		try {
			await setPlaylistProbeLimit(nextLimit)
			const persistedLimit = resolvePlaylistProbeLimit(useAppStore.getState().settings?.common)
			if (persistedLimit === nextLimit) {
				await onLimitChanged?.(nextLimit)
			}
		} finally {
			pendingLimitRef.current = null
			setSaving(false)
		}
	}

	function handleValueChange(value: string | null): void {
		if (!value) return
		if (value === CUSTOM_VALUE) {
			openCustomDialogAfterSelectClose()
			return
		}
		const parsed = Number(value)
		if (playlistProbeLimitSchema.safeParse(parsed).success) {
			setSelectOpen(false)
			void persistLimit(parsed)
		}
	}

	async function saveCustom(): Promise<void> {
		if (customInvalid) return
		await persistLimit(parsedCustom)
		const persistedLimit = resolvePlaylistProbeLimit(useAppStore.getState().settings?.common)
		if (persistedLimit === parsedCustom) setCustomOpen(false)
	}

	return (
		<div className="flex flex-col gap-1">
			<Select value={selectedValue} onValueChange={handleValueChange} open={selectOpen} onOpenChange={setSelectOpen} disabled={disabled || saving}>
				<SelectTrigger size="sm" className={cn('min-w-36', className)} data-testid={`${testId}-trigger`} aria-label={t('wizard.url.playlistProbeLimit.label')}>
					<SelectValue>{value => formatSelectedLabel(value)}</SelectValue>
				</SelectTrigger>
				<SelectContent align="end">
					<SelectGroup>
						{PLAYLIST_PROBE_LIMIT_PRESETS.map(preset => (
							<SelectItem key={preset} value={String(preset)} onClick={() => handleValueChange(String(preset))} data-testid={`${testId}-option-${preset}`}>
								{formatOptionLabel(preset)}
							</SelectItem>
						))}
						<SelectItem value={CUSTOM_VALUE} onClick={() => handleValueChange(CUSTOM_VALUE)} data-testid={`${testId}-option-custom`}>
							{t('wizard.url.playlistProbeLimit.custom')}
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			{showCurrent && (
				<p className="text-[11px] text-[var(--text-subtle)]" data-testid={`${testId}-current`}>
					{t('wizard.url.playlistProbeLimit.current', {count: playlistLimit})}
				</p>
			)}

			<Dialog open={customOpen} onOpenChange={setCustomOpen}>
				<DialogContent data-testid={`${testId}-custom-dialog`}>
					<DialogHeader>
						<DialogTitle>{t('wizard.url.playlistProbeLimit.customDialogTitle')}</DialogTitle>
						<DialogDescription>{t('wizard.url.playlistProbeLimit.customDialogDescription', {min: PLAYLIST_PROBE_LIMIT_MIN, max: PLAYLIST_PROBE_LIMIT_MAX})}</DialogDescription>
					</DialogHeader>
					<Input type="number" min={PLAYLIST_PROBE_LIMIT_MIN} max={PLAYLIST_PROBE_LIMIT_MAX} value={customDraft} onChange={event => setCustomDraft(event.target.value)} placeholder={String(DEFAULT_PLAYLIST_PROBE_LIMIT)} aria-invalid={customInvalid} data-testid={`${testId}-custom-input`} className="font-mono" />
					{customInvalid && <p className="text-[11px] text-amber-500">{t('wizard.url.playlistProbeLimit.invalid')}</p>}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setCustomOpen(false)}>
							{t('wizard.url.playlistProbeLimit.customDialogCancel')}
						</Button>
						<Button type="button" onClick={() => void saveCustom()} disabled={customInvalid || saving} data-testid={`${testId}-custom-save`}>
							{t('wizard.url.playlistProbeLimit.customDialogSave')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

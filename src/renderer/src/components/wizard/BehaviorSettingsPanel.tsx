import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {FileArchive, FileText, Gauge} from 'lucide-react'
import {DEFAULTS, NORMAL_LANE_CAP, RECOMMENDED_AUTO_RETRY_ATTEMPTS, RECOMMENDED_DOWNLOAD_CONNECTIONS} from '@shared/constants.js'
import {AUTO_RETRY_ATTEMPTS_MAX, autoRetryAttemptsSchema, CONCURRENT_DOWNLOADS_MAX, concurrentDownloadsSchema, DOWNLOAD_CONNECTIONS_MAX, downloadConnectionsSchema, HDR_SETTINGS, NATIVE_AUDIO_PREFERENCES} from '@shared/schemas.js'
import {validateFilenameTemplate} from '@shared/filenameTemplate.js'
import {formatLimitRateLabel} from '@shared/limitRate.js'
import type {HdrSetting, NativeAudioPreference} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {LimitRatePicker} from '../shared/LimitRatePicker.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {SettingRow} from '../shared/SettingRow.js'
import {Panel} from '../shared/Panel.js'
import {FilenameTemplateField} from '../shared/FilenameTemplateField.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {NetworkPacingSettings} from './NetworkPacingSettings.js'

const NATIVE_AUDIO_LABEL_KEYS = {compatible: 'wizard.url.nativeAudioPreference.compatible', surround: 'wizard.url.nativeAudioPreference.surround'} as const satisfies Record<NativeAudioPreference, string>

const HDR_LABEL_KEYS = {auto: 'hdrPreference.auto', sdr: 'hdrPreference.sdr', hdr: 'hdrPreference.hdr'} as const satisfies Record<HdrSetting, string>

export function BehaviorSettingsPanel(): ReactNode {
	const {t} = useTranslation()
	return (
		<Panel title={t('wizard.url.settings.behaviorHeading')} description={t('wizard.url.settings.behaviorDescription')}>
			<FieldGroup className="gap-4">
				<LimitRateField />
				<DownloadTransferFields />
				<NetworkPacingSettings />
				<NativeAudioPreferenceField />
				<HdrPreferenceField />
				<FilenameTemplateSetting />
				<AppBehaviorFields />
			</FieldGroup>
		</Panel>
	)
}

// Shared shape for the two numeric transport settings. Keeps its own draft so
// typing is not fought by the persisted value; on blur an out-of-range entry
// reverts to what is stored rather than lingering as invalid text. An empty
// field commits `emptyValue`, which is how each setting spells "off"/default.
function NumericSettingRow({
	id,
	label,
	description,
	unit,
	value,
	emptyValue,
	placeholder,
	max,
	schema,
	onCommit,
	testId
}: {
	id: string
	label: string
	description: string
	unit: string
	value: number | undefined
	emptyValue: number
	placeholder: number
	max: number
	schema: {safeParse: (input: unknown) => {success: boolean}}
	onCommit: (value: number) => void
	testId: string
}): ReactNode {
	const [draft, setDraft] = useState<string | undefined>(undefined)

	function commit(): void {
		if (draft === undefined) return
		const parsed = draft.trim() === '' ? emptyValue : Number(draft)
		setDraft(undefined)
		if (!schema.safeParse(parsed).success) return
		if (parsed === (value ?? emptyValue)) return
		onCommit(parsed)
	}

	return (
		<SettingRow id={id} label={label} description={description} testId={`${testId}-row`}>
			<InputGroup className="w-40 shrink-0">
				<InputGroupInput type="number" min={0} max={max} value={draft ?? (value ? String(value) : '')} onChange={event => setDraft(event.target.value)} onBlur={() => commit()} placeholder={String(placeholder)} aria-labelledby={id} className="font-mono text-xs" data-testid={testId} />
				<InputGroupAddon align="inline-end">
					<InputGroupText className="text-caption">{unit}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</SettingRow>
	)
}

function LimitRateField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setLimitRate} = useAppStore()
	const common = settings?.common
	const limitRate = common?.limitRate?.trim() ? common.limitRate : undefined
	return (
		<Field orientation="horizontal" className="items-center justify-between gap-3">
			<FieldContent className="gap-0.5">
				<FieldTitle id="profiles-settings-speed-limit">{t('wizard.url.limitRate.label')}</FieldTitle>
				<FieldDescription>{t('wizard.url.limitRate.description')}</FieldDescription>
			</FieldContent>
			<Popover>
				<PopoverTrigger
					render={
						<Button type="button" variant="outline" size="sm" aria-labelledby="profiles-settings-speed-limit" data-testid="profiles-settings-limit-rate-trigger">
							<Gauge data-icon="inline-start" aria-hidden />
							{limitRate ? formatLimitRateLabel(limitRate) : t('wizard.url.limitRate.off')}
						</Button>
					}
				/>
				<PopoverContent align="end" sideOffset={8} className="w-64">
					<div className="flex flex-col gap-1">
						<SectionLabel>{t('wizard.url.limitRate.label')}</SectionLabel>
						<p className="text-caption text-subtle-foreground">{t('wizard.url.limitRate.activeWarning')}</p>
					</div>
					<LimitRatePicker value={limitRate} onChange={value => void setLimitRate(value)} />
				</PopoverContent>
			</Popover>
		</Field>
	)
}

function DownloadTransferFields(): ReactNode {
	const {t} = useTranslation()
	const {settings, setConcurrentDownloads, setAutoRetryAttempts, setAutoRemoveCompleted, setDownloadConnections} = useAppStore()
	const common = settings?.common
	return (
		<>
			<NumericSettingRow
				id="profiles-settings-concurrent-downloads"
				label={t('wizard.url.concurrentDownloads.label')}
				description={t('wizard.url.concurrentDownloads.description')}
				unit={t('wizard.url.concurrentDownloads.unit')}
				value={common?.concurrentDownloads}
				emptyValue={NORMAL_LANE_CAP}
				placeholder={NORMAL_LANE_CAP}
				max={CONCURRENT_DOWNLOADS_MAX}
				schema={concurrentDownloadsSchema}
				onCommit={value => void setConcurrentDownloads(value)}
				testId="concurrent-downloads-input"
			/>

			<NumericSettingRow
				id="profiles-settings-auto-retry"
				label={t('wizard.url.autoRetry.label')}
				description={t('wizard.url.autoRetry.description')}
				unit={t('wizard.url.autoRetry.unit')}
				value={common?.autoRetryAttempts}
				emptyValue={0}
				placeholder={RECOMMENDED_AUTO_RETRY_ATTEMPTS}
				max={AUTO_RETRY_ATTEMPTS_MAX}
				schema={autoRetryAttemptsSchema}
				onCommit={value => void setAutoRetryAttempts(value)}
				testId="auto-retry-input"
			/>

			<SettingSwitch
				id="profiles-settings-auto-remove-completed"
				label={t('wizard.url.autoRemoveCompleted.label')}
				description={t('wizard.url.autoRemoveCompleted.description')}
				checked={common?.autoRemoveCompleted ?? false}
				onCheckedChange={checked => void setAutoRemoveCompleted(checked)}
				testId="auto-remove-completed-switch"
			/>

			<NumericSettingRow
				id="profiles-settings-download-connections"
				label={t('wizard.url.downloadConnections.label')}
				description={t('wizard.url.downloadConnections.description')}
				unit={t('wizard.url.downloadConnections.unit')}
				value={common?.downloadConnections}
				emptyValue={0}
				placeholder={RECOMMENDED_DOWNLOAD_CONNECTIONS}
				max={DOWNLOAD_CONNECTIONS_MAX}
				schema={downloadConnectionsSchema}
				onCommit={value => void setDownloadConnections(value)}
				testId="download-connections-input"
			/>
		</>
	)
}

function NativeAudioPreferenceField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setNativeAudioPreference} = useAppStore()
	const nativeAudioPreference = settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	return (
		<Field className="gap-2" data-testid="native-audio-preference">
			<FieldContent className="gap-0.5">
				<FieldTitle id="profiles-settings-native-audio">{t('wizard.url.nativeAudioPreference.label')}</FieldTitle>
				<FieldDescription>{t('wizard.url.nativeAudioPreference.description')}</FieldDescription>
			</FieldContent>
			<ToggleGroup
				size="sm"
				variant="outline"
				value={[nativeAudioPreference]}
				onValueChange={value => {
					if (value[0]) void setNativeAudioPreference(value[0] as NativeAudioPreference)
				}}
				spacing={1}
				className="flex w-full flex-wrap gap-1"
				aria-labelledby="profiles-settings-native-audio"
			>
				{NATIVE_AUDIO_PREFERENCES.map(option => (
					<ToggleGroupItem key={option} value={option} data-testid={`native-audio-preference-${option}`}>
						{t(NATIVE_AUDIO_LABEL_KEYS[option])}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Field>
	)
}

function HdrPreferenceField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setHdrPreference} = useAppStore()
	const hdrPreference = settings?.common?.hdrPreference ?? DEFAULTS.hdrPreference
	return (
		<Field className="gap-2" data-testid="hdr-preference">
			<FieldContent className="gap-0.5">
				<FieldTitle id="profiles-settings-hdr">{t('hdrPreference.label')}</FieldTitle>
				<FieldDescription>{t('hdrPreference.description')}</FieldDescription>
			</FieldContent>
			<ToggleGroup
				size="sm"
				variant="outline"
				value={[hdrPreference]}
				onValueChange={value => {
					if (value[0]) void setHdrPreference(value[0] as HdrSetting)
				}}
				spacing={1}
				className="flex w-full flex-wrap gap-1"
				aria-labelledby="profiles-settings-hdr"
			>
				{HDR_SETTINGS.map(option => (
					<ToggleGroupItem key={option} value={option} data-testid={`hdr-preference-${option}`}>
						{t(HDR_LABEL_KEYS[option])}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Field>
	)
}

function FilenameTemplateSetting(): ReactNode {
	const {t} = useTranslation()
	const {settings, setFilenameTemplate} = useAppStore()
	const filenameTemplate = settings?.common?.filenameTemplate ?? DEFAULTS.filenameTemplate
	const filenameTemplateValidation = validateFilenameTemplate(filenameTemplate)
	const filenameTemplateError = filenameTemplateValidation.ok ? null : filenameTemplateValidation
	return <FilenameTemplateField value={filenameTemplate} onChange={value => void setFilenameTemplate(value)} error={filenameTemplateError} label={t('filenameTemplate.label')} description={t('filenameTemplate.description')} placeholder={DEFAULTS.filenameTemplate} testId="filename-template-input" />
}

function AppBehaviorFields(): ReactNode {
	const {t} = useTranslation()
	const {settings, setCloseBehavior, setAnalyticsEnabled, openLogs, saveDiagnostics} = useAppStore()
	const common = settings?.common
	return (
		<>
			{window.platform !== 'darwin' ? (
				<SettingSwitch id="profiles-settings-close-tray" label={t('wizard.url.closeToTray.toggle')} description={t('wizard.url.closeToTray.toggleDescription')} checked={common?.closeBehavior === 'tray'} onCheckedChange={checked => void setCloseBehavior(checked ? 'tray' : 'quit')} />
			) : null}

			<SettingSwitch id="profiles-settings-analytics" label={t('wizard.url.analytics.toggle')} description={t('wizard.url.analytics.toggleDescription')} checked={common?.analyticsEnabled ?? true} onCheckedChange={checked => void setAnalyticsEnabled(checked)} />

			<Field>
				<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => void openLogs()} data-testid="btn-logs">
					<FileText data-icon="inline-start" aria-hidden />
					{t('app.logs')}
				</Button>
			</Field>

			<Field>
				<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => void saveDiagnostics()} data-testid="btn-save-diagnostics">
					<FileArchive data-icon="inline-start" aria-hidden />
					{t('app.saveDiagnostics')}
				</Button>
				<FieldDescription>{t('app.saveDiagnosticsDescription')}</FieldDescription>
			</Field>
		</>
	)
}

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import type {DownloadProfileSubtitleSource, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import type {DownloadProfileDraft, DownloadProfileDraftAction} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {Panel} from '../shared/Panel.js'
import {SubtitleLanguagePicker} from './SubtitleLanguagePicker.js'
import {ProfileSelect} from './ProfileSelect.js'
import type {SelectOption} from './profileSelectOptions.js'

// Reuses the wizard's subtitle vocabulary — these are the same three delivery
// modes, and describing them differently in two screens invites confusion.
const SUBTITLE_DELIVERY_OPTIONS = [
	{value: 'sidecar', labelKey: 'wizard.subtitles.saveMode.sidecar'},
	{value: 'embed', labelKey: 'wizard.subtitles.saveMode.embed'},
	{value: 'subfolder', labelKey: 'wizard.subtitles.saveMode.subfolder'}
] as const satisfies readonly {value: SubtitleMode; labelKey: ParseKeys}[]

// Format names carry keys like everything else so option rendering has one
// code path; their translations are identical to the English by design.
const SUBTITLE_FORMAT_OPTIONS = [
	{value: 'srt', labelKey: 'wizard.profileEditor.subtitleFormat.srt'},
	{value: 'vtt', labelKey: 'wizard.profileEditor.subtitleFormat.vtt'},
	{value: 'ass', labelKey: 'wizard.profileEditor.subtitleFormat.ass'}
] as const satisfies readonly {value: SubtitleFormat; labelKey: ParseKeys}[]

const SUBTITLE_SOURCE_OPTIONS = [
	{value: 'manual-first', labelKey: 'wizard.profileEditor.subtitleSource.manualFirst'},
	{value: 'manual-only', labelKey: 'wizard.profileEditor.subtitleSource.manualOnly'},
	{value: 'auto-only', labelKey: 'wizard.profileEditor.subtitleSource.autoOnly'}
] as const satisfies readonly SelectOption<DownloadProfileSubtitleSource>[]

interface ProfileSubtitlesPanelProps {
	draft: DownloadProfileDraft
	subtitleLanguagesMissing: boolean
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Subtitles panel. A subtitles-only profile always
// downloads subtitles, so its switch is locked on.
export function ProfileSubtitlesPanel({draft, subtitleLanguagesMissing, onAction}: ProfileSubtitlesPanelProps): ReactNode {
	const {t} = useTranslation()
	const subtitlesOnly = draft.mediaMode === 'subtitles-only'
	const effectiveSubtitleEnabled = subtitlesOnly || draft.subtitleEnabled

	return (
		<Panel title={t('wizard.confirm.labelSubtitles')}>
			<FieldGroup className="gap-3">
				<SettingSwitch
					id="profile-subtitle-downloads"
					label={t('wizard.profileEditor.field.subtitleDownloads')}
					description={t('wizard.profileEditor.field.subtitleDownloadsDescription')}
					checked={effectiveSubtitleEnabled}
					disabled={subtitlesOnly}
					onCheckedChange={next => onAction({type: 'set-subtitle-enabled', subtitleEnabled: next})}
				/>

				{!effectiveSubtitleEnabled ? (
					<Alert variant="info" size="sm">
						<AlertDescription>{t('wizard.profileEditor.note.noSubtitles')}</AlertDescription>
					</Alert>
				) : (
					<div className="flex flex-col gap-3">
						<SubtitleLanguagesField subtitleLanguages={draft.subtitleLanguages} subtitlesOnly={subtitlesOnly} missing={subtitleLanguagesMissing} onAction={onAction} />

						<FieldGroup className="gap-3">
							<ProfileSelect label={t('wizard.profileEditor.field.source')} value={draft.subtitleSource} options={SUBTITLE_SOURCE_OPTIONS} onValueChange={next => onAction({type: 'set-subtitle-source', subtitleSource: next})} testId="profiles-editor-subtitle-source" />

							<SubtitleDeliveryField subtitleDelivery={draft.subtitleDelivery} onAction={onAction} />

							{draft.subtitleDelivery !== 'embed' ? <SubtitleFormatField subtitleFormat={draft.subtitleFormat} subtitleSource={draft.subtitleSource} onAction={onAction} /> : null}
						</FieldGroup>
					</div>
				)}
			</FieldGroup>
		</Panel>
	)
}

interface SubtitleLanguagesFieldProps {
	subtitleLanguages: string[]
	subtitlesOnly: boolean
	missing: boolean
	onAction: (action: DownloadProfileDraftAction) => void
}

function SubtitleLanguagesField({subtitleLanguages, subtitlesOnly, missing, onAction}: SubtitleLanguagesFieldProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Field className="gap-1.5" data-invalid={missing || undefined}>
			<FieldLabel htmlFor="profile-subtitle-languages">{t('wizard.profileEditor.field.languages')}</FieldLabel>
			<SubtitleLanguagePicker id="profile-subtitle-languages" value={subtitleLanguages} onValueChange={next => onAction({type: 'set-subtitle-languages', subtitleLanguages: next})} invalid={missing} describedBy={missing ? 'profile-subtitle-languages-error' : undefined} />
			{missing ? <FieldError id="profile-subtitle-languages-error">{t(subtitlesOnly ? 'wizard.profileEditor.note.subtitleLanguagesRequired' : 'wizard.profileEditor.note.subtitleLanguagesRequiredOrOff')}</FieldError> : null}
		</Field>
	)
}

interface SubtitleDeliveryFieldProps {
	subtitleDelivery: SubtitleMode
	onAction: (action: DownloadProfileDraftAction) => void
}

function SubtitleDeliveryField({subtitleDelivery, onAction}: SubtitleDeliveryFieldProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Field className="gap-1.5">
			<FieldTitle id="profile-subtitle-delivery">{t('wizard.profileEditor.field.delivery')}</FieldTitle>
			<ToggleGroup
				size="sm"
				variant="outline"
				aria-labelledby="profile-subtitle-delivery"
				value={[subtitleDelivery]}
				onValueChange={value => {
					if (value[0]) onAction({type: 'set-subtitle-delivery', subtitleDelivery: value[0] as SubtitleMode})
				}}
				className="grid w-full grid-cols-3"
			>
				{SUBTITLE_DELIVERY_OPTIONS.map(option => (
					<ToggleGroupItem key={option.value} value={option.value}>
						{t(option.labelKey)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			{subtitleDelivery === 'embed' ? <FieldDescription>{t('wizard.subtitles.embedNote')}</FieldDescription> : null}
		</Field>
	)
}

interface SubtitleFormatFieldProps {
	subtitleFormat: SubtitleFormat
	subtitleSource: DownloadProfileSubtitleSource
	onAction: (action: DownloadProfileDraftAction) => void
}

function SubtitleFormatField({subtitleFormat, subtitleSource, onAction}: SubtitleFormatFieldProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Field className="gap-1.5">
			<FieldTitle id="profile-subtitle-format">{t('queue.table.format')}</FieldTitle>
			<ToggleGroup
				size="sm"
				variant="outline"
				aria-labelledby="profile-subtitle-format"
				value={[subtitleFormat]}
				onValueChange={value => {
					if (value[0]) onAction({type: 'set-subtitle-format', subtitleFormat: value[0] as SubtitleFormat})
				}}
				className="grid w-full grid-cols-3"
			>
				{SUBTITLE_FORMAT_OPTIONS.map(option => (
					<ToggleGroupItem key={option.value} value={option.value}>
						{t(option.labelKey)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			{subtitleSource !== 'manual-only' && subtitleFormat === 'ass' ? <FieldDescription>{t('wizard.profileEditor.note.autoCaptionsSrt')}</FieldDescription> : null}
		</Field>
	)
}

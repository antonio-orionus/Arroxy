import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import {Captions, FileAudio, Film, Scissors, type LucideIcon} from 'lucide-react'
import type {DownloadProfileAudioFormat, HdrSetting, NativeAudioPreference} from '@shared/types.js'
import type {DownloadProfileAudioQuality, DownloadProfileDraft, DownloadProfileDraftAction, DownloadProfileMediaMode} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {FieldGroup} from '../ui/field.js'
import {ToggleGroup} from '../ui/toggle-group.js'
import {Panel} from '../shared/Panel.js'
import {OptionCard} from '../shared/OptionCard.js'
import {ProfileSelect} from './ProfileSelect.js'
import type {SelectOption} from './profileSelectOptions.js'
import {ProfileVideoPanel} from './ProfileVideoPanel.js'
import {mediaModeHasVideo} from './profileMediaMode.js'

const MEDIA_MODES = [
	{value: 'video-audio', labelKey: 'wizard.profileEditor.mediaMode.videoAudio.label', descriptionKey: 'wizard.profileEditor.mediaMode.videoAudio.description', icon: Film},
	{value: 'video-only', labelKey: 'wizard.profileEditor.mediaMode.videoOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.videoOnly.description', icon: Scissors},
	{value: 'audio-only', labelKey: 'wizard.profileEditor.mediaMode.audioOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.audioOnly.description', icon: FileAudio},
	{value: 'subtitles-only', labelKey: 'wizard.profileEditor.mediaMode.subtitlesOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.subtitlesOnly.description', icon: Captions}
] as const satisfies readonly {value: DownloadProfileMediaMode; labelKey: ParseKeys; descriptionKey: ParseKeys; icon: LucideIcon}[]

const AUDIO_FORMAT_OPTIONS = [
	{value: 'best', labelKey: 'wizard.profileEditor.audioFormat.best'},
	{value: 'mp3', labelKey: 'playlistPresets.audioFormat.mp3'},
	{value: 'm4a', labelKey: 'playlistPresets.audioFormat.m4a'},
	{value: 'opus', labelKey: 'playlistPresets.audioFormat.opus'},
	{value: 'wav', labelKey: 'wizard.profileEditor.audioFormat.wav'}
] as const satisfies readonly SelectOption<DownloadProfileAudioFormat>[]

const AUDIO_QUALITY_OPTIONS = [
	{value: 'best', labelKey: 'wizard.profileEditor.audioQuality.best'},
	{value: '320', labelKey: 'wizard.profileEditor.audioQuality.320'},
	{value: '192', labelKey: 'wizard.profileEditor.audioQuality.192'},
	{value: '128', labelKey: 'wizard.profileEditor.audioQuality.128'}
] as const satisfies readonly SelectOption<DownloadProfileAudioQuality>[]

interface ProfileDownloadTypePanelProps {
	mediaMode: DownloadProfileMediaMode
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Download type panel: video and audio, video only,
// audio only, or subtitles only.
export function ProfileDownloadTypePanel({mediaMode, onAction}: ProfileDownloadTypePanelProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Panel title={t('wizard.profileEditor.panel.downloadType.title')} description={t('wizard.profileEditor.panel.downloadType.description')}>
			<ToggleGroup
				variant="outline"
				value={[mediaMode]}
				onValueChange={value => {
					if (value[0]) onAction({type: 'set-media-mode', mediaMode: value[0] as DownloadProfileMediaMode})
				}}
				spacing={2}
				className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
			>
				{MEDIA_MODES.map(option => {
					const Icon = option.icon
					return <OptionCard key={option.value} value={option.value} align="center" icon={<Icon aria-hidden />} title={t(option.labelKey)} hint={t(option.descriptionKey)} className="justify-center py-3" />
				})}
			</ToggleGroup>
		</Panel>
	)
}

interface ProfileMediaPanelsProps {
	draft: DownloadProfileDraft
	globalNativeAudioPreference: NativeAudioPreference
	globalHdrSetting: HdrSetting
	onAction: (action: DownloadProfileDraftAction) => void
}

// The panels the chosen download type brings in: Video for the video types,
// Audio for audio only, and a note for subtitles only.
export function ProfileMediaPanels({draft, globalNativeAudioPreference, globalHdrSetting, onAction}: ProfileMediaPanelsProps): ReactNode {
	const {t} = useTranslation()
	const {mediaMode} = draft

	return (
		<>
			<div className="grid gap-3 sm:grid-cols-2">
				{mediaModeHasVideo(mediaMode) ? <ProfileVideoPanel draft={draft} globalNativeAudioPreference={globalNativeAudioPreference} globalHdrSetting={globalHdrSetting} onAction={onAction} /> : null}

				{mediaMode === 'audio-only' ? <ProfileAudioPanel audioFormat={draft.audioFormat} audioQuality={draft.audioQuality} onAction={onAction} /> : null}
			</div>

			{mediaMode === 'subtitles-only' ? (
				<Alert variant="info" size="sm">
					<AlertDescription>{t('wizard.profileEditor.note.subtitlesOnly')}</AlertDescription>
				</Alert>
			) : null}
		</>
	)
}

interface ProfileAudioPanelProps {
	audioFormat: DownloadProfileAudioFormat
	audioQuality: DownloadProfileAudioQuality
	onAction: (action: DownloadProfileDraftAction) => void
}

function ProfileAudioPanel({audioFormat, audioQuality, onAction}: ProfileAudioPanelProps): ReactNode {
	const {t} = useTranslation()
	const audioQualityDisabled = audioFormat === 'best' || audioFormat === 'wav'

	return (
		<Panel title={t('formatLabel.audioFallback')}>
			<FieldGroup className="gap-3">
				<ProfileSelect label={t('queue.table.format')} value={audioFormat} options={AUDIO_FORMAT_OPTIONS} onValueChange={next => onAction({type: 'set-audio-format', audioFormat: next})} testId="profiles-editor-audio-format" />
				<ProfileSelect label={t('wizard.profileEditor.field.quality')} value={audioQuality} options={AUDIO_QUALITY_OPTIONS} onValueChange={next => onAction({type: 'set-audio-quality', audioQuality: next})} testId="profiles-editor-audio-quality" disabled={audioQualityDisabled} />
			</FieldGroup>
		</Panel>
	)
}

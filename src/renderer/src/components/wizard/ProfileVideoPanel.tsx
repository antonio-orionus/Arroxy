import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import {ChevronDown, ListOrdered} from 'lucide-react'
import {AI_UPSCALED_CHOICES, HDR_PREFERENCES, PLAYLIST_VIDEO_TIERS, VIDEO_CODEC_PREFERENCES, VIDEO_FILE_TYPES, VIDEO_GOALS, type AiUpscaled} from '@shared/schemas.js'
import {videoCodecAllowed} from '@shared/selectionOrder.js'
import type {HdrSetting, NativeAudioPreference, PlaylistVideoTier, VideoFileType, VideoGoal} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {resolveAppHdr} from '@renderer/lib/displayHdr.js'
import {selectionOrderRows, selectionOrderSummary} from '@renderer/lib/selectionOrderRows.js'
import {draftSelectionOrder, SMART_TV_MP4_BLOCKED_TIERS, type DownloadProfileDraft, type DownloadProfileDraftAction, type DownloadProfileHdr, type DownloadProfileNativeAudio, type DownloadProfileVideoCodec} from '../../store/wizard/downloadProfileDraft.js'
import {Button} from '../ui/button.js'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../ui/collapsible.js'
import {FieldDescription, Field, FieldGroup, FieldTitle} from '../ui/field.js'
import {ToggleGroup} from '../ui/toggle-group.js'
import {OptionCard} from '../shared/OptionCard.js'
import {Panel} from '../shared/Panel.js'
import {ProfileSelect} from './ProfileSelect.js'
import type {SelectOption} from './profileSelectOptions.js'

// Each goal is a plain name, a technical tag and a tooltip with the reason and
// the catch (the Two-Audience Rule in DESIGN.md).
const GOAL_META = {
	'best-picture': {nameKey: 'wizard.profileEditor.goal.bestPicture.name', tagKey: 'wizard.profileEditor.goal.bestPicture.tag', descriptionKey: 'wizard.profileEditor.goal.bestPicture.description'},
	'smart-tv': {nameKey: 'wizard.profileEditor.goal.smartTv.name', tagKey: 'wizard.profileEditor.goal.smartTv.tag', descriptionKey: 'wizard.profileEditor.goal.smartTv.description'}
} as const satisfies Record<VideoGoal, {nameKey: ParseKeys; tagKey: ParseKeys; descriptionKey: ParseKeys}>

const FILE_TYPE_LABEL_KEYS = {auto: 'fileType.auto', mp4: 'fileType.mp4', mkv: 'fileType.mkv', webm: 'fileType.webm'} as const satisfies Record<VideoFileType, ParseKeys>
const FILE_TYPE_DESCRIPTION_KEYS = {auto: 'fileType.description.auto', mp4: 'fileType.description.mp4', mkv: 'fileType.description.mkv', webm: 'fileType.description.webm'} as const satisfies Record<VideoFileType, ParseKeys>

const AI_UPSCALED_LABEL_KEYS = {skip: 'aiUpscaled.skip', allow: 'aiUpscaled.allow'} as const satisfies Record<AiUpscaled, ParseKeys>
const VIDEO_CODEC_LABEL_KEYS = {auto: 'videoCodec.auto', vp9: 'videoCodec.vp9', h264: 'videoCodec.h264'} as const satisfies Record<DownloadProfileVideoCodec, ParseKeys>
const HDR_LABEL_KEYS = {auto: 'hdrPreference.auto', sdr: 'hdrPreference.sdr', hdr: 'hdrPreference.hdr'} as const satisfies Record<HdrSetting, ParseKeys>

const RESOLUTION_OPTIONS = PLAYLIST_VIDEO_TIERS.map(tier => ({value: tier, labelKey: `playlistPresets.tier.${tier}` as const})) satisfies readonly SelectOption<PlaylistVideoTier>[]
const SMART_TV_MP4_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS.filter(option => !SMART_TV_MP4_BLOCKED_TIERS.has(option.value))

interface ProfileVideoPanelProps {
	draft: DownloadProfileDraft
	// Stereo or surround from Settings, shown as what "Use app setting" means.
	globalNativeAudioPreference: NativeAudioPreference
	// The app's HDR setting (Auto, SDR or HDR), shown as what "Use app setting" means.
	globalHdrSetting: HdrSetting
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Video panel: what the video is for (goal), how tall,
// and, under Advanced, the file type and native audio override, followed by
// the order the profile picks streams by.
export function ProfileVideoPanel({draft, globalNativeAudioPreference, globalHdrSetting, onAction}: ProfileVideoPanelProps): ReactNode {
	const {t} = useTranslation()
	const {goal, resolution, fileType, nativeAudio, hdr, aiUpscaled, videoCodec, mediaMode} = draft
	const [advancedOpen, setAdvancedOpen] = useState(() => fileType !== 'auto' || nativeAudio !== 'default' || hdr !== 'default' || aiUpscaled !== 'skip' || videoCodec !== 'auto')
	const [orderOpen, setOrderOpen] = useState(false)
	const order = draftSelectionOrder(draft, globalNativeAudioPreference, resolveAppHdr(globalHdrSetting))
	const resolutionOptions = goal === 'smart-tv' ? SMART_TV_MP4_RESOLUTION_OPTIONS : RESOLUTION_OPTIONS
	// WebM can't hold H.264, so a file type and a codec that clash are never both offered.
	const fileTypeOptions: SelectOption<VideoFileType>[] = VIDEO_FILE_TYPES.map(value => ({value, labelKey: FILE_TYPE_LABEL_KEYS[value], disabled: value === 'webm' && (goal === 'smart-tv' || videoCodec === 'h264')}))
	const videoCodecOptions: SelectOption<DownloadProfileVideoCodec>[] = [{value: 'auto', labelKey: VIDEO_CODEC_LABEL_KEYS.auto}, ...VIDEO_CODEC_PREFERENCES.map(value => ({value, labelKey: VIDEO_CODEC_LABEL_KEYS[value], disabled: !videoCodecAllowed(goal, fileType, value)}))]
	const nativeAudioOptions: SelectOption<DownloadProfileNativeAudio>[] = [
		{value: 'default', labelKey: 'wizard.profileEditor.appSetting', labelValues: {value: t(`wizard.url.nativeAudioPreference.${globalNativeAudioPreference}`)}},
		{value: 'compatible', labelKey: 'wizard.url.nativeAudioPreference.compatible'},
		{value: 'surround', labelKey: 'wizard.url.nativeAudioPreference.surround'}
	]
	const hdrOptions: SelectOption<DownloadProfileHdr>[] = [{value: 'default', labelKey: 'wizard.profileEditor.appSetting', labelValues: {value: t(HDR_LABEL_KEYS[globalHdrSetting])}}, ...HDR_PREFERENCES.map(value => ({value, labelKey: HDR_LABEL_KEYS[value]}))]
	const fileTypeDescription = t(FILE_TYPE_DESCRIPTION_KEYS[fileType])
	const aiUpscaledOptions: SelectOption<AiUpscaled>[] = AI_UPSCALED_CHOICES.map(value => ({value, labelKey: AI_UPSCALED_LABEL_KEYS[value]}))

	return (
		<Panel title={t('playlistPresets.type.video')} className="sm:col-span-2">
			<FieldGroup className="gap-3">
				<Field className="gap-1.5">
					<FieldTitle id="profile-video-goal">{t('wizard.profileEditor.field.goal')}</FieldTitle>
					<ToggleGroup
						variant="outline"
						aria-labelledby="profile-video-goal"
						value={[goal]}
						onValueChange={value => {
							if (value[0]) onAction({type: 'set-goal', goal: value[0] as VideoGoal})
						}}
						spacing={2}
						className="grid w-full grid-cols-2 gap-2"
						data-testid="profiles-editor-video-goal"
					>
						{VIDEO_GOALS.map(option => (
							<OptionCard key={option} value={option} title={t(GOAL_META[option].nameKey)} meta={t(GOAL_META[option].tagKey)} hint={t(GOAL_META[option].descriptionKey)} data-testid={`profiles-editor-video-goal-${option}`} />
						))}
					</ToggleGroup>
					<FieldDescription>{t(GOAL_META[goal].descriptionKey)}</FieldDescription>
				</Field>
				<ProfileSelect label={t('wizard.profileEditor.field.resolution')} value={resolution} options={resolutionOptions} onValueChange={next => onAction({type: 'set-resolution', resolution: next})} testId="profiles-editor-video-resolution" />
				<Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="flex flex-col gap-2">
					<CollapsibleTrigger
						render={
							<Button type="button" variant="ghost" size="sm" className="justify-start gap-1.5 px-1" data-testid="profiles-editor-video-advanced-toggle">
								<ChevronDown className={cn('transition-transform', advancedOpen ? '' : '-rotate-90')} aria-hidden />
								{t('wizard.profileEditor.advanced')}
							</Button>
						}
					/>
					<CollapsibleContent>
						<FieldGroup className="gap-3" data-testid="profiles-editor-video-advanced">
							<div className="flex flex-col gap-1">
								<ProfileSelect label={t('wizard.profileEditor.field.fileType')} value={fileType} options={fileTypeOptions} onValueChange={next => onAction({type: 'set-file-type', fileType: next})} testId="profiles-editor-video-file-type" />
								<FieldDescription>{goal === 'smart-tv' ? `${fileTypeDescription} ${t('fileType.smartTvNoWebm')}` : fileTypeDescription}</FieldDescription>
							</div>
							<div className="flex flex-col gap-1">
								<ProfileSelect label={t('videoCodec.label')} value={videoCodec} options={videoCodecOptions} onValueChange={next => onAction({type: 'set-video-codec', videoCodec: next})} disabled={goal === 'smart-tv'} testId="profiles-editor-video-codec" />
								<FieldDescription>{goal === 'smart-tv' ? t('videoCodec.smartTv') : t('videoCodec.description')}</FieldDescription>
							</div>
							<div className="flex flex-col gap-1">
								<ProfileSelect label={t('hdrPreference.label')} value={hdr} options={hdrOptions} onValueChange={next => onAction({type: 'set-hdr', hdr: next})} testId="profiles-editor-hdr" />
								<FieldDescription>{t('hdrPreference.description')}</FieldDescription>
							</div>
							<div className="flex flex-col gap-1">
								<ProfileSelect label={t('aiUpscaled.label')} value={aiUpscaled} options={aiUpscaledOptions} onValueChange={next => onAction({type: 'set-ai-upscaled', aiUpscaled: next})} testId="profiles-editor-ai-upscaled" />
								<FieldDescription>{t('aiUpscaled.description')}</FieldDescription>
							</div>
							{mediaMode === 'video-audio' ? <ProfileSelect label={t('wizard.profileEditor.field.nativeAudio')} value={nativeAudio} options={nativeAudioOptions} onValueChange={next => onAction({type: 'set-native-audio', nativeAudio: next})} testId="profiles-editor-native-audio" /> : null}
						</FieldGroup>
					</CollapsibleContent>
				</Collapsible>
				{order ? (
					<Collapsible open={orderOpen} onOpenChange={setOrderOpen} className="flex flex-col gap-1.5" data-testid="profiles-editor-selection-order">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs text-subtle-foreground">{selectionOrderSummary(t, order)}</span>
							<CollapsibleTrigger
								render={
									<Button type="button" variant="ghost" size="xs" className="gap-1" data-testid="profiles-editor-selection-order-toggle">
										<ListOrdered aria-hidden />
										{t('selectionOrder.editorTitle')}
									</Button>
								}
							/>
						</div>
						<CollapsibleContent render={<ol className="flex flex-col gap-1 ps-4 text-xs" data-testid="profiles-editor-selection-order-list" />}>
							{selectionOrderRows(t, order).map(row => (
								<li key={`${row.label}-${row.reason}`}>
									<span className="font-medium text-foreground">{row.label}</span> <span className="text-subtle-foreground">· {row.reason}</span>
								</li>
							))}
						</CollapsibleContent>
					</Collapsible>
				) : null}
			</FieldGroup>
		</Panel>
	)
}

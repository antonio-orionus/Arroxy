import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import {ChevronDown, ListOrdered} from 'lucide-react'
import {PLAYLIST_VIDEO_TIERS, VIDEO_FILE_TYPES, VIDEO_GOALS} from '@shared/schemas.js'
import type {NativeAudioPreference, PlaylistVideoTier, VideoFileType, VideoGoal} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {selectionOrderRows, selectionOrderSummary} from '@renderer/lib/selectionOrderRows.js'
import {draftSelectionOrder, SMART_TV_MP4_BLOCKED_TIERS, type DownloadProfileDraft, type DownloadProfileDraftAction, type DownloadProfileNativeAudio} from '../../store/wizard/downloadProfileDraft.js'
import {Button} from '../ui/button.js'
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

const RESOLUTION_OPTIONS = PLAYLIST_VIDEO_TIERS.map(tier => ({value: tier, labelKey: `playlistPresets.tier.${tier}` as const})) satisfies readonly SelectOption<PlaylistVideoTier>[]
const SMART_TV_MP4_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS.filter(option => !SMART_TV_MP4_BLOCKED_TIERS.has(option.value))

interface ProfileVideoPanelProps {
	draft: DownloadProfileDraft
	// Stereo or surround from Settings, shown as what "Use app setting" means.
	globalNativeAudioPreference: NativeAudioPreference
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Video panel: what the video is for (goal), how tall,
// and, under Advanced, the file type and native audio override, followed by
// the order the profile picks streams by.
export function ProfileVideoPanel({draft, globalNativeAudioPreference, onAction}: ProfileVideoPanelProps): ReactNode {
	const {t} = useTranslation()
	const {goal, resolution, fileType, nativeAudio, mediaMode} = draft
	const [advancedOpen, setAdvancedOpen] = useState(() => fileType !== 'auto' || nativeAudio !== 'default')
	const [orderOpen, setOrderOpen] = useState(false)
	const order = draftSelectionOrder(draft, globalNativeAudioPreference)
	const resolutionOptions = goal === 'smart-tv' ? SMART_TV_MP4_RESOLUTION_OPTIONS : RESOLUTION_OPTIONS
	const fileTypeOptions: SelectOption<VideoFileType>[] = VIDEO_FILE_TYPES.map(value => ({value, labelKey: FILE_TYPE_LABEL_KEYS[value], disabled: goal === 'smart-tv' && value === 'webm'}))
	const nativeAudioOptions: SelectOption<DownloadProfileNativeAudio>[] = [
		{value: 'default', labelKey: 'wizard.profileEditor.nativeAudio.default', labelValues: {value: t(`wizard.url.nativeAudioPreference.${globalNativeAudioPreference}`)}},
		{value: 'compatible', labelKey: 'wizard.url.nativeAudioPreference.compatible'},
		{value: 'surround', labelKey: 'wizard.url.nativeAudioPreference.surround'}
	]
	const fileTypeDescription = t(FILE_TYPE_DESCRIPTION_KEYS[fileType])

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
				<div className="flex flex-col gap-2">
					<Button type="button" variant="ghost" size="sm" className="justify-start gap-1.5 px-1" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen(open => !open)} data-testid="profiles-editor-video-advanced-toggle">
						<ChevronDown className={cn('transition-transform', advancedOpen ? '' : '-rotate-90')} aria-hidden />
						{t('wizard.profileEditor.advanced')}
					</Button>
					{advancedOpen ? (
						<FieldGroup className="gap-3" data-testid="profiles-editor-video-advanced">
							<div className="flex flex-col gap-1">
								<ProfileSelect label={t('wizard.profileEditor.field.fileType')} value={fileType} options={fileTypeOptions} onValueChange={next => onAction({type: 'set-file-type', fileType: next})} testId="profiles-editor-video-file-type" />
								<FieldDescription>{goal === 'smart-tv' ? `${fileTypeDescription} ${t('fileType.smartTvNoWebm')}` : fileTypeDescription}</FieldDescription>
							</div>
							{mediaMode === 'video-audio' ? <ProfileSelect label={t('wizard.profileEditor.field.nativeAudio')} value={nativeAudio} options={nativeAudioOptions} onValueChange={next => onAction({type: 'set-native-audio', nativeAudio: next})} testId="profiles-editor-native-audio" /> : null}
						</FieldGroup>
					) : null}
				</div>
				{order ? (
					<div className="flex flex-col gap-1.5" data-testid="profiles-editor-selection-order">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs text-subtle-foreground">{selectionOrderSummary(t, order)}</span>
							<Button type="button" variant="ghost" size="xs" className="gap-1" aria-expanded={orderOpen} onClick={() => setOrderOpen(open => !open)} data-testid="profiles-editor-selection-order-toggle">
								<ListOrdered aria-hidden />
								{t('selectionOrder.editorTitle')}
							</Button>
						</div>
						{orderOpen ? (
							<ol className="flex flex-col gap-1 ps-4 text-xs" data-testid="profiles-editor-selection-order-list">
								{selectionOrderRows(t, order).map(row => (
									<li key={`${row.label}-${row.reason}`}>
										<span className="font-medium text-foreground">{row.label}</span> <span className="text-subtle-foreground">· {row.reason}</span>
									</li>
								))}
							</ol>
						) : null}
					</div>
				) : null}
			</FieldGroup>
		</Panel>
	)
}

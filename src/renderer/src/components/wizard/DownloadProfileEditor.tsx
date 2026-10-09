import {useId, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys, TFunction} from 'i18next'
import {Archive, BookOpen, Captions, ChevronDown, Clapperboard, Download, FileAudio, Film, Folder, FolderCog, Headphones, Music, RotateCcw, Scissors, SlidersHorizontal, type LucideIcon} from 'lucide-react'
import {DOWNLOAD_PROFILE_ICONS, PLAYLIST_VIDEO_TIERS} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {CommonSettings, DownloadProfile, DownloadProfileAudioFormat, DownloadProfileIcon, DownloadProfileSubtitleSource, PlaylistVideoCodec, PlaylistVideoTier, SponsorBlockMode, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import {effectiveOutputDir} from '@shared/subfolder.js'
import {cn, formatHomeRelativePath} from '@renderer/lib/utils.js'
import {
	createDownloadProfileDraft,
	defaultProfileSubfolderName,
	downloadProfileFromDraft,
	SMART_TV_MP4_BLOCKED_TIERS,
	type DownloadProfileAudioQuality,
	type DownloadProfileDraftAction,
	type DownloadProfileMediaMode,
	updateDownloadProfileDraft,
	validateDownloadProfileDraft
} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Checkbox} from '../ui/checkbox.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {ScrollArea} from '../ui/scroll-area.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {Panel} from '../shared/Panel.js'
import {OptionCard} from '../shared/OptionCard.js'
import {PanelSection} from '../shared/PanelSection.js'
import {SubtitleLanguagePicker} from './SubtitleLanguagePicker.js'
import {FilenameTemplateField} from '../shared/FilenameTemplateField.js'

interface SelectOption<T extends string> {
	value: T
	labelKey: ParseKeys
}

interface ResetProfileAction {
	enabled: boolean
	onReset: () => Promise<void> | void
}

interface DownloadProfileEditorProps {
	commonPaths?: CommonSettings['commonPaths']
	globalDestination?: string
	globalFilenameTemplate?: string
	initialProfile?: DownloadProfile | null
	onChangeGlobalDestination?: () => Promise<void> | void
	onOpenChange: (open: boolean) => void
	onSave?: (profile: DownloadProfile) => void | Promise<void>
	open: boolean
	resetProfile?: ResetProfileAction
}

const MEDIA_MODES = [
	{value: 'video-audio', labelKey: 'wizard.profileEditor.mediaMode.videoAudio.label', descriptionKey: 'wizard.profileEditor.mediaMode.videoAudio.description', icon: Film},
	{value: 'video-only', labelKey: 'wizard.profileEditor.mediaMode.videoOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.videoOnly.description', icon: Scissors},
	{value: 'audio-only', labelKey: 'wizard.profileEditor.mediaMode.audioOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.audioOnly.description', icon: FileAudio},
	{value: 'subtitles-only', labelKey: 'wizard.profileEditor.mediaMode.subtitlesOnly.label', descriptionKey: 'wizard.profileEditor.mediaMode.subtitlesOnly.description', icon: Captions}
] as const satisfies readonly {value: DownloadProfileMediaMode; labelKey: ParseKeys; descriptionKey: ParseKeys; icon: LucideIcon}[]

const PROFILE_ICON_META = {
	controls: {labelKey: 'wizard.profileEditor.icon.controls', icon: SlidersHorizontal},
	download: {labelKey: 'wizard.profileEditor.icon.download', icon: Download},
	video: {labelKey: 'wizard.profileEditor.icon.video', icon: Clapperboard},
	captions: {labelKey: 'wizard.profileEditor.icon.captions', icon: Captions},
	audio: {labelKey: 'wizard.profileEditor.icon.audio', icon: FileAudio},
	music: {labelKey: 'wizard.profileEditor.icon.music', icon: Music},
	podcast: {labelKey: 'wizard.profileEditor.icon.podcast', icon: Headphones},
	classes: {labelKey: 'wizard.profileEditor.icon.classes', icon: BookOpen},
	clip: {labelKey: 'wizard.profileEditor.icon.clip', icon: Scissors},
	archive: {labelKey: 'wizard.profileEditor.icon.archive', icon: Archive}
} as const satisfies Record<DownloadProfileIcon, {labelKey: ParseKeys; icon: LucideIcon}>

const PROFILE_ICON_OPTIONS = DOWNLOAD_PROFILE_ICONS.map(value => ({value, ...PROFILE_ICON_META[value]}))

function createProfileId(): string {
	if (typeof crypto !== 'undefined') {
		if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
		if (typeof crypto.getRandomValues === 'function') {
			const bytes = crypto.getRandomValues(new Uint8Array(16))
			bytes[6] = (bytes[6] & 0x0f) | 0x40
			bytes[8] = (bytes[8] & 0x3f) | 0x80
			const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0'))
			return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
		}
	}
	return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// Reuses the playlist preset vocabulary so the same codec choice reads the
// same way in the wizard and here.
const VIDEO_COMPATIBILITY_OPTIONS = [
	{value: 'best', labelKey: 'playlistPresets.videoFormat.best'},
	{value: 'mp4', labelKey: 'playlistPresets.videoFormat.mp4'}
] as const satisfies readonly SelectOption<PlaylistVideoCodec>[]

const RESOLUTION_OPTIONS = PLAYLIST_VIDEO_TIERS.map(tier => ({value: tier, labelKey: `playlistPresets.tier.${tier}` as const})) satisfies readonly SelectOption<PlaylistVideoTier>[]

const SMART_TV_MP4_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS.filter(option => !SMART_TV_MP4_BLOCKED_TIERS.has(option.value))

const AUDIO_FORMAT_OPTIONS = [
	{value: 'best', labelKey: 'wizard.profileEditor.audioFormat.best'},
	{value: 'mp3', labelKey: 'playlistPresets.audioFormat.mp3'},
	{value: 'm4a', labelKey: 'playlistPresets.audioFormat.m4a'},
	{value: 'opus', labelKey: 'playlistPresets.audioFormat.opus'},
	{value: 'wav', labelKey: 'wizard.profileEditor.audioFormat.wav'}
] as const satisfies readonly SelectOption<DownloadProfileAudioFormat>[]

const VIDEO_AUDIO_FORMAT_OPTIONS = [
	{value: 'best', labelKey: 'playlistPresets.videoFormat.best'},
	{value: 'm4a', labelKey: 'wizard.profileEditor.videoAudioFormat.m4a'}
] as const satisfies readonly SelectOption<Extract<DownloadProfileAudioFormat, 'best' | 'm4a'>>[]

const AUDIO_QUALITY_OPTIONS = [
	{value: 'best', labelKey: 'wizard.profileEditor.audioQuality.best'},
	{value: '320', labelKey: 'wizard.profileEditor.audioQuality.320'},
	{value: '192', labelKey: 'wizard.profileEditor.audioQuality.192'},
	{value: '128', labelKey: 'wizard.profileEditor.audioQuality.128'}
] as const satisfies readonly SelectOption<DownloadProfileAudioQuality>[]

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

// Every one of these already exists verbatim under wizard.output.*, so the
// editor reuses them rather than duplicating the copy.
const OUTPUT_OPTION_KEYS = {
	chapters: {labelKey: 'wizard.output.embedChapters.label', descriptionKey: 'wizard.output.embedChapters.description'},
	metadata: {labelKey: 'wizard.output.embedMetadata.label', descriptionKey: 'wizard.output.embedMetadata.description'},
	description: {labelKey: 'wizard.output.writeDescription.label', descriptionKey: 'wizard.output.writeDescription.description'},
	thumbnail: {labelKey: 'wizard.output.writeThumbnail.label', descriptionKey: 'wizard.output.writeThumbnail.description'}
} as const

const SPONSOR_BLOCK_OPTIONS = [
	{value: 'off', labelKey: 'wizard.sponsorblock.mode.off'},
	{value: 'mark', labelKey: 'wizard.sponsorblock.mode.mark'},
	{value: 'remove', labelKey: 'wizard.sponsorblock.mode.remove'}
] as const satisfies readonly SelectOption<SponsorBlockMode>[]

const SPONSOR_BLOCK_HINT_KEYS = {off: 'wizard.profileEditor.sponsorBlockHint.off', mark: 'wizard.profileEditor.sponsorBlockHint.mark', remove: 'wizard.profileEditor.sponsorBlockHint.remove'} as const satisfies Record<SponsorBlockMode, ParseKeys>

function optionLabel<T extends string>(t: TFunction, options: readonly SelectOption<T>[], value: unknown): string {
	const selected = options.find(option => option.value === value)
	if (selected) return t(selected.labelKey)
	return typeof value === 'string' ? value : ''
}

function ProfileSelect<T extends string>({label, value, options, onValueChange, testId, disabled = false}: {label: string; value: T; options: readonly SelectOption<T>[]; onValueChange: (value: T) => void; testId?: string; disabled?: boolean}): ReactNode {
	const {t} = useTranslation()
	const generatedId = useId()
	const triggerId = testId ? `${testId}-trigger` : generatedId

	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
			<Select
				value={value}
				onValueChange={next => {
					if (typeof next === 'string') onValueChange(next)
				}}
			>
				<SelectTrigger id={triggerId} className="w-full" data-testid={testId} disabled={disabled}>
					<SelectValue>{selected => optionLabel(t, options, selected)}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start">
					<SelectGroup>
						{options.map(option => (
							<SelectItem key={option.value} value={option.value} onClick={() => onValueChange(option.value)} data-testid={testId ? `${testId}-option-${option.value}` : undefined}>
								{t(option.labelKey)}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	)
}

function readablePath(path: string, commonPaths: CommonSettings['commonPaths']): string {
	const trimmed = path.trim()
	if (!trimmed) return 'Default downloads folder'
	return commonPaths ? formatHomeRelativePath(trimmed, commonPaths) : trimmed
}

function fallbackFinalPath(subfolderName: string): string {
	const trimmed = subfolderName.trim()
	return trimmed ? `Default downloads folder / ${trimmed}` : 'Default downloads folder'
}

// react-doctor-disable-next-line react-doctor/no-giant-component react-doctor/prefer-useReducer -- this dense profile form needs a focused decomposition outside the mechanical React Doctor cleanup
export function DownloadProfileEditor({commonPaths, globalDestination = '', globalFilenameTemplate = DEFAULTS.filenameTemplate, initialProfile = null, onChangeGlobalDestination, onOpenChange, onSave, open, resetProfile}: DownloadProfileEditorProps): ReactNode {
	const {t} = useTranslation()
	const [draft, setDraft] = useState(() => createDownloadProfileDraft(initialProfile))
	const [profileIconPickerOpen, setProfileIconPickerOpen] = useState(false)
	const [profileActionError, setProfileActionError] = useState<string | null>(null)
	const [destinationPickerError, setDestinationPickerError] = useState<string | null>(null)
	const [destinationOverrideOpen, setDestinationOverrideOpen] = useState(() => initialProfile?.output.kind === 'fixed')
	const {
		profileName,
		profileIcon,
		mediaMode,
		codec,
		resolution,
		audioFormat,
		audioQuality,
		subtitleEnabled,
		subtitleLanguages,
		subtitleSource,
		subtitleDelivery,
		subtitleFormat,
		destination,
		filenameTemplate,
		saveInsideSubfolder,
		subfolderName,
		embedMetadata,
		embedChapters,
		saveDescription,
		saveThumbnail,
		sponsorBlockMode
	} = draft
	const showVideo = mediaMode === 'video-audio' || mediaMode === 'video-only'
	const showAudio = mediaMode === 'video-audio' || mediaMode === 'audio-only'
	const subtitlesOnly = mediaMode === 'subtitles-only'
	const effectiveSubtitleEnabled = subtitlesOnly || subtitleEnabled
	const outputEnabledCount = [embedMetadata, embedChapters, saveDescription, saveThumbnail].filter(Boolean).length
	const SelectedProfileIcon = PROFILE_ICON_OPTIONS.find(option => option.value === profileIcon)?.icon ?? Captions
	const {subfolderInvalid, filenameTemplateError, subtitleLanguagesMissing} = validateDownloadProfileDraft(draft)
	const videoAudioFormat: Extract<DownloadProfileAudioFormat, 'best' | 'm4a'> = audioFormat === 'm4a' ? 'm4a' : 'best'
	const audioQualityDisabled = audioFormat === 'best' || audioFormat === 'wav'
	const videoResolutionOptions = codec === 'mp4' ? SMART_TV_MP4_RESOLUTION_OPTIONS : RESOLUTION_OPTIONS
	const destinationOverride = destination.trim()
	const hasDestinationOverride = destinationOverride.length > 0
	const showDestinationOverride = destinationOverrideOpen || hasDestinationOverride
	const globalDestinationRoot = globalDestination.trim()
	const destinationBase = destinationOverride || globalDestinationRoot
	const resolvedSubfolderName = saveInsideSubfolder ? subfolderName.trim() || defaultProfileSubfolderName(profileName) : ''
	const resolvedDestination = destinationBase ? effectiveOutputDir(destinationBase, saveInsideSubfolder, resolvedSubfolderName) : ''
	const resolvedDestinationLabel = resolvedDestination ? readablePath(resolvedDestination, commonPaths) : fallbackFinalPath(resolvedSubfolderName)

	function updateDraft(action: DownloadProfileDraftAction): void {
		setDraft(current => updateDownloadProfileDraft(current, action))
	}

	function changeDestination(nextDestination: string): void {
		setProfileActionError(null)
		setDestinationPickerError(null)
		setDestinationOverrideOpen(true)
		updateDraft({type: 'set-destination', destination: nextDestination})
	}

	function useGlobalDefaultDestination(): void {
		setProfileActionError(null)
		setDestinationPickerError(null)
		setDestinationOverrideOpen(false)
		updateDraft({type: 'set-destination', destination: ''})
	}

	function changeProfileName(nextName: string): void {
		updateDraft({type: 'set-profile-name', profileName: nextName})
	}

	function setProfileMediaMode(nextMode: DownloadProfileMediaMode): void {
		updateDraft({type: 'set-media-mode', mediaMode: nextMode})
	}

	function setProfileCodec(nextCodec: PlaylistVideoCodec): void {
		updateDraft({type: 'set-codec', codec: nextCodec})
	}

	async function chooseDestinationFolder(): Promise<void> {
		setProfileActionError(null)
		setDestinationPickerError(null)
		setDestinationOverrideOpen(true)
		try {
			const result = await window.appApi.dialog.chooseFolder(destination.trim() || undefined)
			if (!result.ok || !result.data.path) return
			updateDraft({type: 'set-destination', destination: result.data.path})
		} catch (error) {
			console.error('Failed to open destination folder picker', error)
			setDestinationPickerError('Could not open folder picker. Enter a path manually.')
		}
	}

	async function saveProfile(): Promise<void> {
		setProfileActionError(null)
		const now = new Date().toISOString()
		const profile = downloadProfileFromDraft(draft, now, createProfileId)
		try {
			await onSave?.(profile)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save profile settings', error)
			setProfileActionError(t('wizard.profileEditor.error.save'))
		}
	}

	async function changeGlobalDestination(): Promise<void> {
		if (!onChangeGlobalDestination) return
		setProfileActionError(null)
		try {
			await onChangeGlobalDestination()
		} catch (error) {
			console.error('Failed to change global destination', error)
			setProfileActionError(t('wizard.profileEditor.error.changeGlobalDestination'))
		}
	}

	async function resetProfileOverride(): Promise<void> {
		if (!resetProfile?.enabled) return
		setProfileActionError(null)
		try {
			await resetProfile.onReset()
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to reset profile settings', error)
			setProfileActionError(t('wizard.profileEditor.error.reset'))
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[58rem]" data-testid="profiles-editor-dialog">
				<DialogHeader>
					<DialogTitle>{t('wizard.profileEditor.dialogTitle')}</DialogTitle>
					<DialogDescription>{t('wizard.profileEditor.dialogDescription')}</DialogDescription>
				</DialogHeader>
				{profileActionError ? (
					<Alert variant="destructive" size="sm">
						<AlertDescription>{profileActionError}</AlertDescription>
					</Alert>
				) : null}
				<ScrollArea className="max-h-[min(78vh,46rem)]">
					<div className="grid gap-4 p-1 pr-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)]">
						<div className="flex flex-col gap-3">
							<Panel title={t('wizard.profileEditor.panel.identity.title')} description={t('wizard.profileEditor.panel.identity.description')}>
								<Field className="gap-1.5">
									<FieldLabel htmlFor="profile-name">{t('wizard.profileEditor.field.name')}</FieldLabel>
									<InputGroup className="h-10" aria-label={t('wizard.profileEditor.field.nameAndIcon')}>
										<Popover open={profileIconPickerOpen} onOpenChange={setProfileIconPickerOpen}>
											<InputGroupAddon align="inline-start" className="pl-1.5">
												<PopoverTrigger
													render={
														<InputGroupButton type="button" size="sm" className="h-8 w-14 justify-between px-2" aria-label={t('wizard.profileEditor.action.chooseIcon')} data-testid="profiles-editor-icon-trigger">
															<SelectedProfileIcon data-icon="inline-start" aria-hidden />
															<ChevronDown data-icon="inline-end" aria-hidden />
														</InputGroupButton>
													}
												/>
											</InputGroupAddon>
											<PopoverContent align="start" sideOffset={6} className="w-40" data-testid="profiles-editor-icon-menu">
												<ToggleGroup
													variant="outline"
													value={[profileIcon]}
													onValueChange={value => {
														const next = value[0] as DownloadProfileIcon | undefined
														if (!next) return
														updateDraft({type: 'set-profile-icon', profileIcon: next})
														setProfileIconPickerOpen(false)
													}}
													spacing={1}
													className="grid w-full grid-cols-3 gap-1.5"
													aria-label={t('wizard.profileEditor.field.icon')}
												>
													{PROFILE_ICON_OPTIONS.map(option => {
														const Icon = option.icon
														return (
															<ToggleGroupItem key={option.value} value={option.value} title={t(option.labelKey)} size="lg" data-testid={`profiles-editor-icon-${option.value}`}>
																<Icon aria-hidden />
																<span className="sr-only">{t(option.labelKey)}</span>
															</ToggleGroupItem>
														)
													})}
												</ToggleGroup>
											</PopoverContent>
										</Popover>
										<InputGroupInput id="profile-name" value={profileName} onChange={event => changeProfileName(event.target.value)} data-testid="profiles-editor-name" />
									</InputGroup>
								</Field>
							</Panel>

							<Panel title={t('wizard.profileEditor.panel.downloadType.title')} description={t('wizard.profileEditor.panel.downloadType.description')}>
								<ToggleGroup
									variant="outline"
									value={[mediaMode]}
									onValueChange={value => {
										if (value[0]) setProfileMediaMode(value[0] as DownloadProfileMediaMode)
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

							<div className="grid gap-3 sm:grid-cols-2">
								{showVideo ? (
									<Panel title={t('playlistPresets.type.video')}>
										<FieldGroup className="gap-3">
											<ProfileSelect label={t('wizard.profileEditor.field.compatibility')} value={codec} options={VIDEO_COMPATIBILITY_OPTIONS} onValueChange={setProfileCodec} testId="profiles-editor-video-codec" />
											<ProfileSelect label={t('wizard.profileEditor.field.resolution')} value={resolution} options={videoResolutionOptions} onValueChange={next => updateDraft({type: 'set-resolution', resolution: next})} testId="profiles-editor-video-resolution" />
										</FieldGroup>
									</Panel>
								) : null}

								{showAudio ? (
									<Panel title={t('formatLabel.audioFallback')}>
										<FieldGroup className="gap-3">
											{mediaMode === 'audio-only' ? (
												<>
													<ProfileSelect label={t('queue.table.format')} value={audioFormat} options={AUDIO_FORMAT_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-format', audioFormat: next})} testId="profiles-editor-audio-format" />
													<ProfileSelect label={t('wizard.profileEditor.field.quality')} value={audioQuality} options={AUDIO_QUALITY_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-quality', audioQuality: next})} testId="profiles-editor-audio-quality" disabled={audioQualityDisabled} />
												</>
											) : (
												<ProfileSelect label={t('queue.table.format')} value={videoAudioFormat} options={VIDEO_AUDIO_FORMAT_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-format', audioFormat: next})} testId="profiles-editor-audio-format" />
											)}
										</FieldGroup>
									</Panel>
								) : null}
							</div>

							{subtitlesOnly ? (
								<Alert variant="info" size="sm">
									<AlertDescription>{t('wizard.profileEditor.note.subtitlesOnly')}</AlertDescription>
								</Alert>
							) : null}

							<Panel title={t('wizard.confirm.labelSubtitles')}>
								<FieldGroup className="gap-3">
									<SettingSwitch
										id="profile-subtitle-downloads"
										label={t('wizard.profileEditor.field.subtitleDownloads')}
										description={t('wizard.profileEditor.field.subtitleDownloadsDescription')}
										checked={effectiveSubtitleEnabled}
										disabled={subtitlesOnly}
										onCheckedChange={next => updateDraft({type: 'set-subtitle-enabled', subtitleEnabled: next})}
									/>

									{!effectiveSubtitleEnabled ? (
										<Alert variant="info" size="sm">
											<AlertDescription>{t('wizard.profileEditor.note.noSubtitles')}</AlertDescription>
										</Alert>
									) : (
										<div className="flex flex-col gap-3">
											<Field className="gap-1.5" data-invalid={subtitleLanguagesMissing || undefined}>
												<FieldLabel htmlFor="profile-subtitle-languages">{t('wizard.profileEditor.field.languages')}</FieldLabel>
												<SubtitleLanguagePicker
													id="profile-subtitle-languages"
													value={subtitleLanguages}
													onValueChange={next => updateDraft({type: 'set-subtitle-languages', subtitleLanguages: next})}
													invalid={subtitleLanguagesMissing}
													describedBy={subtitleLanguagesMissing ? 'profile-subtitle-languages-error' : undefined}
												/>
												{subtitleLanguagesMissing ? <FieldError id="profile-subtitle-languages-error">{t(subtitlesOnly ? 'wizard.profileEditor.note.subtitleLanguagesRequired' : 'wizard.profileEditor.note.subtitleLanguagesRequiredOrOff')}</FieldError> : null}
											</Field>

											<FieldGroup className="gap-3">
												<ProfileSelect label={t('wizard.profileEditor.field.source')} value={subtitleSource} options={SUBTITLE_SOURCE_OPTIONS} onValueChange={next => updateDraft({type: 'set-subtitle-source', subtitleSource: next})} testId="profiles-editor-subtitle-source" />

												<Field className="gap-1.5">
													<FieldTitle id="profile-subtitle-delivery">{t('wizard.profileEditor.field.delivery')}</FieldTitle>
													<ToggleGroup
														size="sm"
														variant="outline"
														aria-labelledby="profile-subtitle-delivery"
														value={[subtitleDelivery]}
														onValueChange={value => {
															if (value[0]) updateDraft({type: 'set-subtitle-delivery', subtitleDelivery: value[0] as SubtitleMode})
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

												{subtitleDelivery !== 'embed' ? (
													<Field className="gap-1.5">
														<FieldTitle id="profile-subtitle-format">{t('queue.table.format')}</FieldTitle>
														<ToggleGroup
															size="sm"
															variant="outline"
															aria-labelledby="profile-subtitle-format"
															value={[subtitleFormat]}
															onValueChange={value => {
																if (value[0]) updateDraft({type: 'set-subtitle-format', subtitleFormat: value[0] as SubtitleFormat})
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
												) : null}
											</FieldGroup>
										</div>
									)}
								</FieldGroup>
							</Panel>
						</div>

						<Panel title={t('wizard.profileEditor.panel.advanced.title')} description={t('wizard.profileEditor.panel.advanced.description')} className="lg:self-start">
							<FieldGroup className="gap-3">
								<div className="grid gap-2" data-testid="profiles-editor-destination-policy">
									<div className={cn('rounded-lg border bg-background/25 p-3 transition-colors', hasDestinationOverride ? 'border-border' : 'border-[var(--brand)]/55 bg-[var(--brand-dim)]')} data-testid="profiles-editor-global-destination">
										<div className="min-w-0">
											<div className="flex min-w-0 items-center gap-2">
												<FolderCog className="size-4 shrink-0 text-[var(--brand)]" aria-hidden />
												<span className="text-[12px] font-semibold">{t('wizard.profileEditor.destination.global')}</span>
												<Badge variant={hasDestinationOverride ? 'outline' : 'secondary'}>{hasDestinationOverride ? 'Inherited' : 'Active'}</Badge>
											</div>
											<p className="mt-1 truncate font-mono text-[12px] text-[var(--text-subtle)]" title={globalDestinationRoot || undefined}>
												{readablePath(globalDestinationRoot, commonPaths)}
											</p>
										</div>
										<div className="mt-2 flex flex-wrap gap-2">
											<Button type="button" variant="outline" size="sm" aria-label={t('wizard.url.profile.changeGlobalDestination')} title={t('wizard.url.profile.changeGlobalDestination')} onClick={() => void changeGlobalDestination()} disabled={!onChangeGlobalDestination} className="shrink-0">
												<FolderCog data-icon="inline-start" aria-hidden />
												{t('wizard.profileEditor.action.changeGlobalShort')}
											</Button>
										</div>
									</div>

									<div className={cn('rounded-lg border bg-background/25 p-3 transition-colors', hasDestinationOverride ? 'border-[var(--brand)]/55 bg-[var(--brand-dim)]' : 'border-border')} data-testid="profiles-editor-profile-override">
										<div className="min-w-0">
											<div className="flex min-w-0 items-center gap-2">
												<Folder className="size-4 shrink-0 text-[var(--brand)]" aria-hidden />
												<span className="text-[12px] font-semibold">{t('wizard.profileEditor.destination.override')}</span>
												<Badge variant={hasDestinationOverride ? 'secondary' : 'outline'}>{hasDestinationOverride ? 'Overrides global' : showDestinationOverride ? 'Choose folder' : 'No override set'}</Badge>
											</div>
											<p className="mt-1 text-[11px] leading-snug text-[var(--text-subtle)]">{hasDestinationOverride ? 'This profile saves to its own root before the subfolder is added.' : 'No override set. This profile uses the global destination above.'}</p>
										</div>
										{!showDestinationOverride ? (
											<div className="mt-2 flex flex-wrap gap-2">
												<Button type="button" variant="outline" size="sm" aria-label={t('wizard.profileEditor.action.setOverride')} title={t('wizard.profileEditor.action.setOverride')} onClick={() => void chooseDestinationFolder()} className="shrink-0">
													<Folder data-icon="inline-start" aria-hidden />
													{t('wizard.profileEditor.action.setOverrideShort')}
												</Button>
											</div>
										) : null}

										{showDestinationOverride ? (
											<Field className="mt-3 gap-1.5">
												<FieldLabel htmlFor="profile-destination">{t('wizard.profileEditor.field.overridePath')}</FieldLabel>
												<InputGroup>
													<InputGroupInput id="profile-destination" value={destination} onChange={event => changeDestination(event.target.value)} placeholder={t('wizard.profileEditor.placeholder.folder')} className="font-mono text-[12px]" />
													<InputGroupAddon align="inline-end">
														<InputGroupButton type="button" size="icon-xs" aria-label={t('wizard.profileEditor.action.chooseFolder')} onClick={() => void chooseDestinationFolder()}>
															<Folder aria-hidden />
														</InputGroupButton>
													</InputGroupAddon>
												</InputGroup>
												<div className="flex flex-wrap items-center gap-2">
													<Button type="button" variant="ghost" size="xs" onClick={useGlobalDefaultDestination}>
														{t('wizard.profileEditor.action.useGlobalDefault')}
													</Button>
													{destinationPickerError ? <FieldError>{destinationPickerError}</FieldError> : null}
												</div>
											</Field>
										) : null}
									</div>

									<div className="rounded-lg border border-[var(--border-strong)] bg-background/35 px-3 py-2" data-testid="profiles-editor-final-destination">
										<p className="text-[11px] font-medium text-[var(--text-subtle)]">{t('wizard.profileEditor.destination.resolved')}</p>
										<p className="mt-1 truncate font-mono text-[12px] text-foreground" title={resolvedDestination || resolvedDestinationLabel}>
											{resolvedDestinationLabel}
										</p>
									</div>
								</div>

								<Field orientation="horizontal" className="items-center gap-2 text-[12px] text-[var(--text-subtle)]">
									<Checkbox id="profile-subfolder-enabled" checked={saveInsideSubfolder} onCheckedChange={checked => updateDraft({type: 'set-save-inside-subfolder', saveInsideSubfolder: checked === true})} />
									<FieldLabel htmlFor="profile-subfolder-enabled" size="sm">
										{t('wizard.folder.subfolder.toggle')}
									</FieldLabel>
								</Field>
								<Field className="gap-1.5 pl-7">
									<FieldLabel htmlFor="profile-subfolder-name">{t('wizard.profileEditor.field.subfolderName')}</FieldLabel>
									<InputGroup aria-label={t('wizard.profileEditor.field.subfolderName')}>
										<InputGroupInput
											id="profile-subfolder-name"
											value={subfolderName}
											onChange={event => updateDraft({type: 'set-subfolder-name', subfolderName: event.target.value})}
											disabled={!saveInsideSubfolder}
											placeholder={defaultProfileSubfolderName(profileName)}
											maxLength={64}
											aria-invalid={subfolderInvalid}
											data-testid="profiles-editor-subfolder-name"
										/>
									</InputGroup>
									{subfolderInvalid ? <FieldError>{t('wizard.folder.subfolder.invalid')}</FieldError> : null}
								</Field>

								<FilenameTemplateField
									value={filenameTemplate}
									onChange={value => updateDraft({type: 'set-filename-template', filenameTemplate: value})}
									error={filenameTemplateError}
									label={t('filenameTemplate.profileOverrideLabel')}
									description={t('filenameTemplate.profileOverrideDescription')}
									placeholder={globalFilenameTemplate}
									testId="profiles-editor-filename-template"
								/>

								<PanelSection title={t('wizard.profileEditor.panel.output.title')} action={<Badge variant="outline">{t('wizard.profileEditor.panel.output.enabledCount', {count: outputEnabledCount})}</Badge>}>
									<div className="grid gap-3">
										<SettingSwitch id="profile-output-metadata" label={t(OUTPUT_OPTION_KEYS.metadata.labelKey)} help={t(OUTPUT_OPTION_KEYS.metadata.descriptionKey)} checked={embedMetadata} onCheckedChange={next => updateDraft({type: 'set-embed-metadata', embedMetadata: next})} />
										<SettingSwitch id="profile-output-chapters" label={t(OUTPUT_OPTION_KEYS.chapters.labelKey)} help={t(OUTPUT_OPTION_KEYS.chapters.descriptionKey)} checked={embedChapters} onCheckedChange={next => updateDraft({type: 'set-embed-chapters', embedChapters: next})} />
										<SettingSwitch id="profile-output-description" label={t(OUTPUT_OPTION_KEYS.description.labelKey)} help={t(OUTPUT_OPTION_KEYS.description.descriptionKey)} checked={saveDescription} onCheckedChange={next => updateDraft({type: 'set-save-description', saveDescription: next})} />
										<SettingSwitch id="profile-output-thumbnail" label={t(OUTPUT_OPTION_KEYS.thumbnail.labelKey)} help={t(OUTPUT_OPTION_KEYS.thumbnail.descriptionKey)} checked={saveThumbnail} onCheckedChange={next => updateDraft({type: 'set-save-thumbnail', saveThumbnail: next})} />
									</div>
								</PanelSection>

								<PanelSection title={t('wizard.profileEditor.panel.sponsorBlock.title')} action={<Badge variant="outline">{showVideo ? optionLabel(t, SPONSOR_BLOCK_OPTIONS, sponsorBlockMode) : t('wizard.profileEditor.skipped')}</Badge>}>
									{showVideo ? (
										<ToggleGroup
											size="sm"
											variant="outline"
											value={[sponsorBlockMode]}
											onValueChange={value => {
												if (value[0]) updateDraft({type: 'set-sponsor-block-mode', sponsorBlockMode: value[0] as SponsorBlockMode})
											}}
											className="grid w-full grid-cols-3"
										>
											{SPONSOR_BLOCK_OPTIONS.map(option => (
												<ToggleGroupItem key={option.value} value={option.value} title={t(SPONSOR_BLOCK_HINT_KEYS[option.value])}>
													{t(option.labelKey)}
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									) : (
										<Alert variant="info" size="sm">
											<AlertDescription>{t('wizard.profileEditor.note.skippedForOutputType')}</AlertDescription>
										</Alert>
									)}
								</PanelSection>
							</FieldGroup>
						</Panel>
					</div>
				</ScrollArea>
				<DialogFooter className="sm:justify-between">
					<div className="flex min-w-0 flex-1">
						{resetProfile ? (
							<Button type="button" variant="ghost" onClick={() => void resetProfileOverride()} disabled={!resetProfile.enabled} title={resetProfile.enabled ? 'Restore the built-in profile settings' : 'This profile already uses built-in settings'}>
								<RotateCcw data-icon="inline-start" aria-hidden />
								{t('wizard.profileEditor.action.reset')}
							</Button>
						) : null}
					</div>
					<div className="flex flex-col-reverse gap-2 sm:flex-row">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							{t('common.cancel')}
						</Button>
						<Button variant="glow" type="button" onClick={() => void saveProfile()} disabled={subfolderInvalid || filenameTemplateError !== null || subtitleLanguagesMissing}>
							{t('wizard.profileEditor.action.save')}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

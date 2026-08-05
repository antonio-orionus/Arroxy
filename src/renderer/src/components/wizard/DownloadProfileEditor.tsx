import {useId, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys, TFunction} from 'i18next'
import {Archive, BookOpen, Captions, ChevronDown, Clapperboard, Download, FileAudio, Film, Folder, FolderCog, Headphones, Music, Plus, RotateCcw, Scissors, SlidersHorizontal, X, type LucideIcon} from 'lucide-react'
import {DOWNLOAD_PROFILE_ICONS} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {CommonSettings, DownloadProfile, DownloadProfileAudioFormat, DownloadProfileIcon, DownloadProfileSubtitleSource, PlaylistVideoCodec, PlaylistVideoTier, SponsorBlockMode, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import {effectiveOutputDir} from '@shared/subfolder.js'
import {cn, formatHomeRelativePath} from '@renderer/lib/utils.js'
import {createDownloadProfileDraft, defaultProfileSubfolderName, downloadProfileFromDraft, type DownloadProfileAudioQuality, type DownloadProfileDraftAction, type DownloadProfileMediaMode, updateDownloadProfileDraft, validateDownloadProfileDraft} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {Checkbox} from '../ui/checkbox.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {ScrollArea} from '../ui/scroll-area.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {ProfileSwitchRow} from './DownloadProfileSwitchRow.js'
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

const RESOLUTION_OPTIONS = [
	{value: 'best', labelKey: 'playlistPresets.tier.best'},
	{value: '2160', labelKey: 'playlistPresets.tier.2160'},
	{value: '1440', labelKey: 'playlistPresets.tier.1440'},
	{value: '1080', labelKey: 'playlistPresets.tier.1080'},
	{value: '720', labelKey: 'playlistPresets.tier.720'},
	{value: '480', labelKey: 'playlistPresets.tier.480'},
	{value: '360', labelKey: 'playlistPresets.tier.360'}
] as const satisfies readonly SelectOption<PlaylistVideoTier>[]

const SMART_TV_MP4_BLOCKED_RESOLUTIONS = new Set<PlaylistVideoTier>(['best', '2160', '1440'])
const SMART_TV_MP4_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS.filter(option => !SMART_TV_MP4_BLOCKED_RESOLUTIONS.has(option.value))

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

const SELECTABLE_TOGGLE_CLASS = 'flex-1 data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]'
const OUTPUT_MODE_CARD_CLASS =
	'h-auto min-h-[4.35rem] flex-col gap-1.5 whitespace-normal rounded-lg border border-[var(--border-strong)] px-2 py-2.5 text-center data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]'

function optionLabel<T extends string>(t: TFunction, options: readonly SelectOption<T>[], value: unknown): string {
	const selected = options.find(option => option.value === value)
	if (selected) return t(selected.labelKey)
	return typeof value === 'string' ? value : ''
}

function ProfilePanel({title, description, children, className}: {title: string; description?: string; children: ReactNode; className?: string}): ReactNode {
	return (
		<Card size="sm" className={cn('gap-3 rounded-lg border-[var(--border-strong)] bg-card/40 py-3', className)}>
			<CardHeader className="gap-1 px-3">
				<CardTitle className="text-sm font-semibold leading-tight">{title}</CardTitle>
				{description ? <CardDescription className="text-[12px] leading-snug text-[var(--text-subtle)]">{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="px-3">{children}</CardContent>
		</Card>
	)
}

function ProfileSelect<T extends string>({label, value, options, onValueChange, testId, disabled = false}: {label: string; value: T; options: readonly SelectOption<T>[]; onValueChange: (value: T) => void; testId?: string; disabled?: boolean}): ReactNode {
	const {t} = useTranslation()
	const generatedId = useId()
	const triggerId = testId ? `${testId}-trigger` : generatedId

	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor={triggerId} className="text-[12px] font-medium text-[var(--text-subtle)]">
				{label}
			</FieldLabel>
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
		subtitleLanguageDraft,
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
	const {subfolderInvalid, filenameTemplateError} = validateDownloadProfileDraft(draft)
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

	function addSubtitleLanguages(): void {
		updateDraft({type: 'add-subtitle-languages'})
	}

	function removeSubtitleLanguage(code: string): void {
		updateDraft({type: 'remove-subtitle-language', code})
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
					<Alert variant="destructive" className="py-2">
						<AlertDescription className="text-[12px]">{profileActionError}</AlertDescription>
					</Alert>
				) : null}
				<ScrollArea className="max-h-[min(78vh,46rem)]">
					<div className="grid gap-4 p-1 pr-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)]">
						<div className="flex flex-col gap-3">
							<ProfilePanel title={t('wizard.profileEditor.panel.identity.title')} description={t('wizard.profileEditor.panel.identity.description')}>
								<Field className="gap-1.5">
									<FieldLabel htmlFor="profile-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
										{t('wizard.profileEditor.field.name')}
									</FieldLabel>
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
															<ToggleGroupItem
																key={option.value}
																value={option.value}
																title={t(option.labelKey)}
																className="grid h-10 place-items-center rounded-lg border bg-background/25 p-0 text-[var(--text-subtle)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] hover:border-[var(--border-strong)] hover:text-foreground"
																data-testid={`profiles-editor-icon-${option.value}`}
															>
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
							</ProfilePanel>

							<ProfilePanel title={t('wizard.profileEditor.panel.downloadType.title')} description={t('wizard.profileEditor.panel.downloadType.description')}>
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
										return (
											<ToggleGroupItem key={option.value} value={option.value} className={OUTPUT_MODE_CARD_CLASS} title={t(option.descriptionKey)}>
												<Icon data-icon="inline-start" aria-hidden />
												<span className="text-[11px] font-semibold leading-tight">{t(option.labelKey)}</span>
											</ToggleGroupItem>
										)
									})}
								</ToggleGroup>
							</ProfilePanel>

							<div className="grid gap-3 sm:grid-cols-2">
								{showVideo ? (
									<ProfilePanel title={t('playlistPresets.type.video')}>
										<FieldGroup className="gap-3">
											<ProfileSelect label={t('wizard.profileEditor.field.compatibility')} value={codec} options={VIDEO_COMPATIBILITY_OPTIONS} onValueChange={setProfileCodec} testId="profiles-editor-video-codec" />
											<ProfileSelect label={t('wizard.profileEditor.field.resolution')} value={resolution} options={videoResolutionOptions} onValueChange={next => updateDraft({type: 'set-resolution', resolution: next})} testId="profiles-editor-video-resolution" />
										</FieldGroup>
									</ProfilePanel>
								) : null}

								{showAudio ? (
									<ProfilePanel title={t('formatLabel.audioFallback')}>
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
									</ProfilePanel>
								) : null}
							</div>

							{subtitlesOnly ? (
								<Alert variant="info" className="py-2 text-[12px]">
									<AlertDescription className="text-[12px]">{t('wizard.profileEditor.note.subtitlesOnly')}</AlertDescription>
								</Alert>
							) : null}

							<ProfilePanel title={t('wizard.confirm.labelSubtitles')}>
								<FieldGroup className="gap-3">
									<Field orientation="horizontal" className="items-start justify-between gap-3">
										<FieldContent className="gap-1">
											<FieldTitle id="profile-subtitle-downloads" className="text-[12px] font-medium text-[var(--text-subtle)]">
												{t('wizard.profileEditor.field.subtitleDownloads')}
											</FieldTitle>
											<FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Profiles request language codes; availability is resolved for each URL.</FieldDescription>
										</FieldContent>
										<ToggleGroup
											variant="outline"
											aria-labelledby="profile-subtitle-downloads"
											value={[effectiveSubtitleEnabled ? 'on' : 'off']}
											onValueChange={value => {
												const next = value[0]
												if (next === 'on') updateDraft({type: 'set-subtitle-enabled', subtitleEnabled: true})
												if (next === 'off' && !subtitlesOnly) updateDraft({type: 'set-subtitle-enabled', subtitleEnabled: false})
											}}
											className="grid w-36 shrink-0 grid-cols-2"
										>
											<ToggleGroupItem value="off" disabled={subtitlesOnly} className={SELECTABLE_TOGGLE_CLASS}>
												{t('wizard.sponsorblock.mode.off')}
											</ToggleGroupItem>
											<ToggleGroupItem value="on" className={SELECTABLE_TOGGLE_CLASS}>
												On
											</ToggleGroupItem>
										</ToggleGroup>
									</Field>

									{!effectiveSubtitleEnabled ? (
										<Alert variant="info" className="py-2 text-[12px]">
											<AlertDescription className="text-[12px]">{t('wizard.profileEditor.note.noSubtitles')}</AlertDescription>
										</Alert>
									) : (
										<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
											<Field className="gap-1.5">
												<FieldLabel htmlFor="profile-subtitle-language-draft" className="text-[12px] font-medium text-[var(--text-subtle)]">
													{t('wizard.profileEditor.field.languages')}
												</FieldLabel>
												<div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background/30 px-2 py-1">
													{subtitleLanguages.length > 0 ? (
														subtitleLanguages.map(code => (
															<Badge key={code} variant="secondary" className="h-6 gap-1 px-2 text-[11px] font-semibold">
																<span>{code}</span>
																<Button type="button" variant="ghost" size="icon-xs" onClick={() => removeSubtitleLanguage(code)} className="-me-1 size-4 rounded-full p-0" aria-label={`Remove ${code}`}>
																	<X data-icon="inline-start" aria-hidden />
																</Button>
															</Badge>
														))
													) : (
														<span className="px-1 text-[11px] italic text-[var(--text-subtle)]">{t('wizard.profileEditor.note.noLanguages')}</span>
													)}
												</div>
												<InputGroup aria-label={t('wizard.profileEditor.field.languageCodes')}>
													<InputGroupInput
														id="profile-subtitle-language-draft"
														value={subtitleLanguageDraft}
														onChange={event => updateDraft({type: 'set-subtitle-language-draft', subtitleLanguageDraft: event.target.value})}
														onKeyDown={event => {
															if (event.key !== 'Enter') return
															event.preventDefault()
															addSubtitleLanguages()
														}}
														placeholder="en, uk, pt-br"
														className="text-[12px]"
														aria-label={t('wizard.profileEditor.field.languageCodes')}
													/>
													<InputGroupAddon align="inline-end">
														<InputGroupButton type="button" className="text-[11px]" onClick={addSubtitleLanguages} disabled={subtitleLanguageDraft.trim().length === 0}>
															<Plus data-icon="inline-start" />
															{t('wizard.profileEditor.action.addLanguage')}
														</InputGroupButton>
													</InputGroupAddon>
												</InputGroup>
											</Field>

											<FieldGroup className="gap-3">
												<ProfileSelect label={t('wizard.profileEditor.field.source')} value={subtitleSource} options={SUBTITLE_SOURCE_OPTIONS} onValueChange={next => updateDraft({type: 'set-subtitle-source', subtitleSource: next})} testId="profiles-editor-subtitle-source" />

												<Field className="gap-1.5">
													<FieldTitle id="profile-subtitle-delivery" className="text-[12px] font-medium text-[var(--text-subtle)]">
														{t('wizard.profileEditor.field.delivery')}
													</FieldTitle>
													<ToggleGroup
														variant="outline"
														aria-labelledby="profile-subtitle-delivery"
														value={[subtitleDelivery]}
														onValueChange={value => {
															if (value[0]) updateDraft({type: 'set-subtitle-delivery', subtitleDelivery: value[0] as SubtitleMode})
														}}
														className="grid w-full grid-cols-3"
													>
														{SUBTITLE_DELIVERY_OPTIONS.map(option => (
															<ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS}>
																{t(option.labelKey)}
															</ToggleGroupItem>
														))}
													</ToggleGroup>
													{subtitleDelivery === 'embed' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">{t('wizard.subtitles.embedNote')}</FieldDescription> : null}
												</Field>

												{subtitleDelivery !== 'embed' ? (
													<Field className="gap-1.5">
														<FieldTitle id="profile-subtitle-format" className="text-[12px] font-medium text-[var(--text-subtle)]">
															{t('queue.table.format')}
														</FieldTitle>
														<ToggleGroup
															variant="outline"
															aria-labelledby="profile-subtitle-format"
															value={[subtitleFormat]}
															onValueChange={value => {
																if (value[0]) updateDraft({type: 'set-subtitle-format', subtitleFormat: value[0] as SubtitleFormat})
															}}
															className="grid w-full grid-cols-3"
														>
															{SUBTITLE_FORMAT_OPTIONS.map(option => (
																<ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS}>
																	{t(option.labelKey)}
																</ToggleGroupItem>
															))}
														</ToggleGroup>
														{subtitleSource !== 'manual-only' && subtitleFormat === 'ass' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">{t('wizard.profileEditor.note.autoCaptionsSrt')}</FieldDescription> : null}
													</Field>
												) : null}
											</FieldGroup>
										</div>
									)}
								</FieldGroup>
							</ProfilePanel>
						</div>

						<ProfilePanel title={t('wizard.profileEditor.panel.advanced.title')} description={t('wizard.profileEditor.panel.advanced.description')} className="lg:self-start">
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
												<FieldLabel htmlFor="profile-destination" className="text-[12px] font-medium text-[var(--text-subtle)]">
													{t('wizard.profileEditor.field.overridePath')}
												</FieldLabel>
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
													{destinationPickerError ? <FieldDescription className="text-[12px] text-destructive">{destinationPickerError}</FieldDescription> : null}
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
									<FieldLabel htmlFor="profile-subfolder-enabled" className="text-[12px] text-[var(--text-subtle)]">
										{t('wizard.folder.subfolder.toggle')}
									</FieldLabel>
								</Field>
								<Field className="gap-1.5 pl-7">
									<FieldLabel htmlFor="profile-subfolder-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
										{t('wizard.profileEditor.field.subfolderName')}
									</FieldLabel>
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
									{subfolderInvalid ? <FieldDescription className="text-[12px] text-destructive">Use a valid folder name without / \ : * ? &quot; &lt; &gt; |.</FieldDescription> : null}
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

								<Card size="sm" className="rounded-lg bg-background/25 px-3 py-3">
									<div className="mb-2 flex items-center justify-between gap-3">
										<h4 className="text-sm font-semibold">{t('wizard.profileEditor.panel.output.title')}</h4>
										<Badge variant="outline">{outputEnabledCount} enabled</Badge>
									</div>
									<div className="grid gap-2">
										<ProfileSwitchRow id="profile-output-metadata" label={t(OUTPUT_OPTION_KEYS.metadata.labelKey)} description={t(OUTPUT_OPTION_KEYS.metadata.descriptionKey)} checked={embedMetadata} onCheckedChange={next => updateDraft({type: 'set-embed-metadata', embedMetadata: next})} />
										<ProfileSwitchRow id="profile-output-chapters" label={t(OUTPUT_OPTION_KEYS.chapters.labelKey)} description={t(OUTPUT_OPTION_KEYS.chapters.descriptionKey)} checked={embedChapters} onCheckedChange={next => updateDraft({type: 'set-embed-chapters', embedChapters: next})} />
										<ProfileSwitchRow id="profile-output-description" label={t(OUTPUT_OPTION_KEYS.description.labelKey)} description={t(OUTPUT_OPTION_KEYS.description.descriptionKey)} checked={saveDescription} onCheckedChange={next => updateDraft({type: 'set-save-description', saveDescription: next})} />
										<ProfileSwitchRow id="profile-output-thumbnail" label={t(OUTPUT_OPTION_KEYS.thumbnail.labelKey)} description={t(OUTPUT_OPTION_KEYS.thumbnail.descriptionKey)} checked={saveThumbnail} onCheckedChange={next => updateDraft({type: 'set-save-thumbnail', saveThumbnail: next})} />
									</div>
								</Card>

								<Card size="sm" className="rounded-lg bg-background/25 px-3 py-3">
									<div className="mb-2 flex items-center justify-between gap-3">
										<h4 className="text-sm font-semibold">{t('wizard.profileEditor.panel.sponsorBlock.title')}</h4>
										<Badge variant="outline">{showVideo ? optionLabel(t, SPONSOR_BLOCK_OPTIONS, sponsorBlockMode) : t('wizard.profileEditor.skipped')}</Badge>
									</div>
									{showVideo ? (
										<ToggleGroup
											variant="outline"
											value={[sponsorBlockMode]}
											onValueChange={value => {
												if (value[0]) updateDraft({type: 'set-sponsor-block-mode', sponsorBlockMode: value[0] as SponsorBlockMode})
											}}
											className="grid w-full grid-cols-3"
										>
											{SPONSOR_BLOCK_OPTIONS.map(option => (
												<ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS} title={t(SPONSOR_BLOCK_HINT_KEYS[option.value])}>
													{t(option.labelKey)}
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									) : (
										<Alert variant="info" className="py-2 text-[12px]">
											<AlertDescription className="text-[12px]">{t('wizard.profileEditor.note.skippedForOutputType')}</AlertDescription>
										</Alert>
									)}
								</Card>
							</FieldGroup>
						</ProfilePanel>
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
						<Button type="button" onClick={() => void saveProfile()} disabled={subfolderInvalid || filenameTemplateError !== null} className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
							{t('wizard.profileEditor.action.save')}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

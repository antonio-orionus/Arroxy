import {useId, useState, type ReactNode} from 'react'
import {Archive, BookOpen, Captions, ChevronDown, Clapperboard, Download, FileAudio, Film, Folder, Headphones, Info, Music, Plus, Scissors, SlidersHorizontal, X, type LucideIcon} from 'lucide-react'
import {DOWNLOAD_PROFILE_ICONS} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileAudioFormat, DownloadProfileIcon, DownloadProfileSubtitleSource, PlaylistVideoCodec, PlaylistVideoTier, SponsorBlockMode, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {
	createDownloadProfileDraft,
	defaultProfileSubfolderName,
	downloadProfileFromDraft,
	type DownloadProfileAudioQuality,
	type DownloadProfileDraftAction,
	type DownloadProfileMediaMode,
	type DownloadProfilePlaylistCap,
	updateDownloadProfileDraft,
	validateDownloadProfileDraft
} from '../../store/wizard/downloadProfileDraft.js'
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
import {Switch} from '../ui/switch.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'

interface SelectOption<T extends string> {
	value: T
	label: string
}

const MEDIA_MODES: {value: DownloadProfileMediaMode; label: string; description: string; icon: LucideIcon}[] = [
	{value: 'video-audio', label: 'Video + audio', description: 'Normal video files', icon: Film},
	{value: 'video-only', label: 'Video, no audio', description: 'Silent video only', icon: Scissors},
	{value: 'audio-only', label: 'Audio only', description: 'Music or podcasts', icon: FileAudio},
	{value: 'subtitles-only', label: 'Subs only', description: 'Caption files only', icon: Captions}
]

const PROFILE_ICON_META: Record<DownloadProfileIcon, {label: string; icon: LucideIcon}> = {
	controls: {label: 'Controls', icon: SlidersHorizontal},
	download: {label: 'Download', icon: Download},
	video: {label: 'Video', icon: Clapperboard},
	captions: {label: 'Captions', icon: Captions},
	audio: {label: 'Audio', icon: FileAudio},
	music: {label: 'Music', icon: Music},
	podcast: {label: 'Podcast', icon: Headphones},
	classes: {label: 'Classes', icon: BookOpen},
	clip: {label: 'Clip', icon: Scissors},
	archive: {label: 'Archive', icon: Archive}
}

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

const VIDEO_COMPATIBILITY_OPTIONS: SelectOption<PlaylistVideoCodec>[] = [
	{value: 'best', label: 'Best native'},
	{value: 'mp4', label: 'Smart TV H.264 MP4'}
]

const RESOLUTION_OPTIONS: SelectOption<PlaylistVideoTier>[] = [
	{value: 'best', label: 'Best available'},
	{value: '2160', label: 'Up to 2160p'},
	{value: '1440', label: 'Up to 1440p'},
	{value: '1080', label: 'Up to 1080p'},
	{value: '720', label: 'Up to 720p'},
	{value: '480', label: 'Up to 480p'},
	{value: '360', label: 'Up to 360p'}
]

const SMART_TV_MP4_BLOCKED_RESOLUTIONS = new Set<PlaylistVideoTier>(['best', '2160', '1440'])
const SMART_TV_MP4_RESOLUTION_OPTIONS = RESOLUTION_OPTIONS.filter(option => !SMART_TV_MP4_BLOCKED_RESOLUTIONS.has(option.value))

const AUDIO_FORMAT_OPTIONS: SelectOption<DownloadProfileAudioFormat>[] = [
	{value: 'best', label: 'Best'},
	{value: 'mp3', label: 'MP3'},
	{value: 'm4a', label: 'M4A'},
	{value: 'opus', label: 'Opus'},
	{value: 'wav', label: 'WAV'}
]

const VIDEO_AUDIO_FORMAT_OPTIONS: SelectOption<Extract<DownloadProfileAudioFormat, 'best' | 'm4a'>>[] = [
	{value: 'best', label: 'Best native'},
	{value: 'm4a', label: 'M4A / AAC'}
]

const AUDIO_QUALITY_OPTIONS: SelectOption<DownloadProfileAudioQuality>[] = [
	{value: 'best', label: 'Best available'},
	{value: '320', label: 'Up to 320K'},
	{value: '192', label: 'Up to 192K'},
	{value: '128', label: 'Up to 128K'}
]

const SUBTITLE_DELIVERY_OPTIONS: {value: SubtitleMode; label: string}[] = [
	{value: 'sidecar', label: 'Sidecar'},
	{value: 'embed', label: 'Embed'},
	{value: 'subfolder', label: 'Subfolder'}
]

const SUBTITLE_FORMAT_OPTIONS: {value: SubtitleFormat; label: string}[] = [
	{value: 'srt', label: 'SRT'},
	{value: 'vtt', label: 'VTT'},
	{value: 'ass', label: 'ASS'}
]

const SUBTITLE_SOURCE_OPTIONS: SelectOption<DownloadProfileSubtitleSource>[] = [
	{value: 'manual-first', label: 'Manual first, then auto'},
	{value: 'manual-only', label: 'Manual only'},
	{value: 'auto-only', label: 'Auto-generated only'}
]

const OUTPUT_OPTION_DESCRIPTIONS = {
	chapters: 'Chapter markers navigable in any modern player.',
	metadata: 'Title, artist, description, and upload date written into the file.',
	description: 'Saves the video description as a .description text file next to the download.',
	thumbnail: 'Saves the thumbnail as a .jpg image file next to the download.'
} as const

const SPONSOR_BLOCK_OPTIONS: {value: SponsorBlockMode; label: string}[] = [
	{value: 'off', label: 'Off'},
	{value: 'mark', label: 'Mark'},
	{value: 'remove', label: 'Remove'}
]

const SPONSOR_BLOCK_HINTS: Record<SponsorBlockMode, string> = {off: 'No SponsorBlock — video plays as uploaded.', mark: 'Marks sponsor segments as chapters (non-destructive).', remove: 'Cuts sponsor segments from the video using FFmpeg.'}

const PLAYLIST_CAP_OPTIONS: SelectOption<DownloadProfilePlaylistCap>[] = [
	{value: 'confirm', label: 'Confirm when capped'},
	{value: '100', label: 'Load 100 items'},
	{value: '250', label: 'Load 250 items'},
	{value: '500', label: 'Load 500 items'},
	{value: '1000', label: 'Load 1000 items'}
]

const SELECTABLE_TOGGLE_CLASS = 'flex-1 data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]'
const OUTPUT_MODE_CARD_CLASS =
	'h-auto min-h-[4.35rem] flex-col gap-1.5 whitespace-normal rounded-lg border border-[var(--border-strong)] px-2 py-2.5 text-center data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]'

function optionLabel<T extends string>(options: readonly SelectOption<T>[], value: unknown): string {
	const selected = options.find(option => option.value === value)
	if (selected) return selected.label
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
					<SelectValue>{selected => optionLabel(options, selected)}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start">
					<SelectGroup>
						{options.map(option => (
							<SelectItem key={option.value} value={option.value} onClick={() => onValueChange(option.value)} data-testid={testId ? `${testId}-option-${option.value}` : undefined}>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	)
}

function ProfileHelpTooltip({label, children}: {label: string; children: ReactNode}): ReactNode {
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={`${label} help`} className="text-[var(--text-subtle)] hover:text-foreground">
						<Info aria-hidden />
					</Button>
				)}
			/>
			<TooltipContent className="max-w-[18rem] leading-snug">{children}</TooltipContent>
		</Tooltip>
	)
}

function ProfileSwitchRow({id, label, description, checked, onCheckedChange}: {id: string; label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void}): ReactNode {
	return (
		<Field orientation="horizontal" className="min-h-10 items-center justify-between gap-3 rounded-md border border-border bg-background/25 px-3 py-2 text-[12px]">
			<FieldContent className="min-w-0">
				<FieldTitle id={id} className="flex items-center gap-1.5 text-[12px] font-medium">
					{label}
					{description ? <ProfileHelpTooltip label={label}>{description}</ProfileHelpTooltip> : null}
				</FieldTitle>
			</FieldContent>
			<Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} />
		</Field>
	)
}

// react-doctor-disable-next-line react-doctor/no-giant-component react-doctor/prefer-useReducer -- this dense profile form needs a focused decomposition outside the mechanical React Doctor cleanup
export function DownloadProfileEditor({initialProfile = null, open, onOpenChange, onSave}: {initialProfile?: DownloadProfile | null; open: boolean; onOpenChange: (open: boolean) => void; onSave?: (profile: DownloadProfile) => void | Promise<void>}): ReactNode {
	const [draft, setDraft] = useState(() => createDownloadProfileDraft(initialProfile))
	const [profileIconPickerOpen, setProfileIconPickerOpen] = useState(false)
	const [destinationPickerError, setDestinationPickerError] = useState<string | null>(null)
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
		saveInsideSubfolder,
		subfolderName,
		embedMetadata,
		embedChapters,
		saveDescription,
		saveThumbnail,
		sponsorBlockMode,
		playlistCap
	} = draft
	const showVideo = mediaMode === 'video-audio' || mediaMode === 'video-only'
	const showAudio = mediaMode === 'video-audio' || mediaMode === 'audio-only'
	const subtitlesOnly = mediaMode === 'subtitles-only'
	const effectiveSubtitleEnabled = subtitlesOnly || subtitleEnabled
	const outputEnabledCount = [embedMetadata, embedChapters, saveDescription, saveThumbnail].filter(Boolean).length
	const SelectedProfileIcon = PROFILE_ICON_OPTIONS.find(option => option.value === profileIcon)?.icon ?? Captions
	const {subfolderInvalid} = validateDownloadProfileDraft(draft)
	const videoAudioFormat: Extract<DownloadProfileAudioFormat, 'best' | 'm4a'> = audioFormat === 'm4a' ? 'm4a' : 'best'
	const audioQualityDisabled = audioFormat === 'best' || audioFormat === 'wav'
	const videoResolutionOptions = codec === 'mp4' ? SMART_TV_MP4_RESOLUTION_OPTIONS : RESOLUTION_OPTIONS

	function updateDraft(action: DownloadProfileDraftAction): void {
		setDraft(current => updateDownloadProfileDraft(current, action))
	}

	function changeDestination(nextDestination: string): void {
		setDestinationPickerError(null)
		updateDraft({type: 'set-destination', destination: nextDestination})
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
		setDestinationPickerError(null)
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
		const now = new Date().toISOString()
		const profile = downloadProfileFromDraft(draft, now, createProfileId)
		await onSave?.(profile)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[58rem]" data-testid="profiles-editor-dialog">
				<DialogHeader>
					<DialogTitle>Download Profile</DialogTitle>
					<DialogDescription>One reusable setup for Quick Download, Bulk URLs, and playlists.</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[min(78vh,46rem)]">
					<div className="grid gap-4 p-1 pr-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)]">
						<div className="flex flex-col gap-3">
							<ProfilePanel title="Profile identity" description="Name and icon shown in Quick Download, Bulk URLs, and profile lists.">
								<Field className="gap-1.5">
									<FieldLabel htmlFor="profile-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
										Profile name
									</FieldLabel>
									<InputGroup className="h-10" aria-label="Profile name and icon">
										<Popover open={profileIconPickerOpen} onOpenChange={setProfileIconPickerOpen}>
											<InputGroupAddon align="inline-start" className="pl-1.5">
												<PopoverTrigger
													render={
														<InputGroupButton type="button" size="sm" className="h-8 w-14 justify-between px-2" aria-label="Choose profile icon" data-testid="profiles-editor-icon-trigger">
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
													aria-label="Profile icon"
												>
													{PROFILE_ICON_OPTIONS.map(option => {
														const Icon = option.icon
														return (
															<ToggleGroupItem
																key={option.value}
																value={option.value}
																title={option.label}
																className="grid h-10 place-items-center rounded-lg border bg-background/25 p-0 text-[var(--text-subtle)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] hover:border-[var(--border-strong)] hover:text-foreground"
																data-testid={`profiles-editor-icon-${option.value}`}
															>
																<Icon aria-hidden />
																<span className="sr-only">{option.label}</span>
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

							<ProfilePanel title="Download type" description="Choose the primary way you want to download.">
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
											<ToggleGroupItem key={option.value} value={option.value} className={OUTPUT_MODE_CARD_CLASS} title={option.description}>
												<Icon data-icon="inline-start" aria-hidden />
												<span className="text-[11px] font-semibold leading-tight">{option.label}</span>
											</ToggleGroupItem>
										)
									})}
								</ToggleGroup>
							</ProfilePanel>

							<div className="grid gap-3 sm:grid-cols-2">
								{showVideo ? (
									<ProfilePanel title="Video">
										<FieldGroup className="gap-3">
											<ProfileSelect label="Compatibility" value={codec} options={VIDEO_COMPATIBILITY_OPTIONS} onValueChange={setProfileCodec} testId="profiles-editor-video-codec" />
											<ProfileSelect label="Resolution" value={resolution} options={videoResolutionOptions} onValueChange={next => updateDraft({type: 'set-resolution', resolution: next})} testId="profiles-editor-video-resolution" />
										</FieldGroup>
									</ProfilePanel>
								) : null}

								{showAudio ? (
									<ProfilePanel title="Audio">
										<FieldGroup className="gap-3">
											{mediaMode === 'audio-only' ? (
												<>
													<ProfileSelect label="Format" value={audioFormat} options={AUDIO_FORMAT_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-format', audioFormat: next})} testId="profiles-editor-audio-format" />
													<ProfileSelect label="Quality" value={audioQuality} options={AUDIO_QUALITY_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-quality', audioQuality: next})} testId="profiles-editor-audio-quality" disabled={audioQualityDisabled} />
												</>
											) : (
												<ProfileSelect label="Format" value={videoAudioFormat} options={VIDEO_AUDIO_FORMAT_OPTIONS} onValueChange={next => updateDraft({type: 'set-audio-format', audioFormat: next})} testId="profiles-editor-audio-format" />
											)}
										</FieldGroup>
									</ProfilePanel>
								) : null}
							</div>

							{subtitlesOnly ? (
								<Alert variant="info" className="py-2 text-[12px]">
									<AlertDescription className="text-[12px]">This profile queues subtitle files only. Video, audio, SponsorBlock, and media conversion are skipped.</AlertDescription>
								</Alert>
							) : null}

							<ProfilePanel title="Subtitles">
								<FieldGroup className="gap-3">
									<Field orientation="horizontal" className="items-start justify-between gap-3">
										<FieldContent className="gap-1">
											<FieldTitle id="profile-subtitle-downloads" className="text-[12px] font-medium text-[var(--text-subtle)]">
												Subtitle downloads
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
												Off
											</ToggleGroupItem>
											<ToggleGroupItem value="on" className={SELECTABLE_TOGGLE_CLASS}>
												On
											</ToggleGroupItem>
										</ToggleGroup>
									</Field>

									{!effectiveSubtitleEnabled ? (
										<Alert variant="info" className="py-2 text-[12px]">
											<AlertDescription className="text-[12px]">No subtitle files or embedded subtitle tracks will be requested for this profile.</AlertDescription>
										</Alert>
									) : (
										<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
											<Field className="gap-1.5">
												<FieldLabel htmlFor="profile-subtitle-language-draft" className="text-[12px] font-medium text-[var(--text-subtle)]">
													Languages
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
														<span className="px-1 text-[11px] italic text-[var(--text-subtle)]">No languages selected</span>
													)}
												</div>
												<InputGroup aria-label="Subtitle language codes">
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
														aria-label="Subtitle language codes"
													/>
													<InputGroupAddon align="inline-end">
														<InputGroupButton type="button" className="text-[11px]" onClick={addSubtitleLanguages} disabled={subtitleLanguageDraft.trim().length === 0}>
															<Plus data-icon="inline-start" />
															Add
														</InputGroupButton>
													</InputGroupAddon>
												</InputGroup>
											</Field>

											<FieldGroup className="gap-3">
												<ProfileSelect label="Source" value={subtitleSource} options={SUBTITLE_SOURCE_OPTIONS} onValueChange={next => updateDraft({type: 'set-subtitle-source', subtitleSource: next})} testId="profiles-editor-subtitle-source" />

												<Field className="gap-1.5">
													<FieldTitle id="profile-subtitle-delivery" className="text-[12px] font-medium text-[var(--text-subtle)]">
														Delivery
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
																{option.label}
															</ToggleGroupItem>
														))}
													</ToggleGroup>
													{subtitleDelivery === 'embed' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Embed mode saves output as .mkv so subtitle tracks embed reliably.</FieldDescription> : null}
												</Field>

												{subtitleDelivery !== 'embed' ? (
													<Field className="gap-1.5">
														<FieldTitle id="profile-subtitle-format" className="text-[12px] font-medium text-[var(--text-subtle)]">
															Format
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
																	{option.label}
																</ToggleGroupItem>
															))}
														</ToggleGroup>
														{subtitleSource !== 'manual-only' && subtitleFormat === 'ass' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Auto-captions will be saved as SRT instead of ASS.</FieldDescription> : null}
													</Field>
												) : null}
											</FieldGroup>
										</div>
									)}
								</FieldGroup>
							</ProfilePanel>
						</div>

						<ProfilePanel title="Advanced options" className="lg:self-start">
							<FieldGroup className="gap-3">
								<Field className="gap-1.5">
									<FieldLabel htmlFor="profile-destination" className="text-[12px] font-medium text-[var(--text-subtle)]">
										Destination
									</FieldLabel>
									<InputGroup aria-label="Destination folder">
										<InputGroupInput id="profile-destination" value={destination} onChange={event => changeDestination(event.target.value)} placeholder="Default downloads folder" className="font-mono text-[12px]" />
										<InputGroupAddon align="inline-end">
											<InputGroupButton type="button" size="icon-xs" aria-label="Choose destination folder" onClick={() => void chooseDestinationFolder()}>
												<Folder aria-hidden />
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{destinationPickerError ? <FieldDescription className="text-[12px] text-destructive">{destinationPickerError}</FieldDescription> : null}
								</Field>

								<Field orientation="horizontal" className="items-center gap-2 text-[12px] text-[var(--text-subtle)]">
									<Checkbox id="profile-subfolder-enabled" checked={saveInsideSubfolder} onCheckedChange={checked => updateDraft({type: 'set-save-inside-subfolder', saveInsideSubfolder: checked === true})} />
									<FieldLabel htmlFor="profile-subfolder-enabled" className="text-[12px] text-[var(--text-subtle)]">
										Save inside subfolder
									</FieldLabel>
								</Field>
								<Field className="gap-1.5 pl-7">
									<FieldLabel htmlFor="profile-subfolder-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
										Subfolder name
									</FieldLabel>
									<InputGroup aria-label="Subfolder name">
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

								<Card size="sm" className="rounded-lg bg-background/25 px-3 py-3">
									<div className="mb-2 flex items-center justify-between gap-3">
										<h4 className="text-sm font-semibold">Output options</h4>
										<Badge variant="outline">{outputEnabledCount} enabled</Badge>
									</div>
									<div className="grid gap-2">
										<ProfileSwitchRow id="profile-output-metadata" label="Embed metadata" description={OUTPUT_OPTION_DESCRIPTIONS.metadata} checked={embedMetadata} onCheckedChange={next => updateDraft({type: 'set-embed-metadata', embedMetadata: next})} />
										<ProfileSwitchRow id="profile-output-chapters" label="Embed chapters" description={OUTPUT_OPTION_DESCRIPTIONS.chapters} checked={embedChapters} onCheckedChange={next => updateDraft({type: 'set-embed-chapters', embedChapters: next})} />
										<ProfileSwitchRow id="profile-output-description" label="Save description" description={OUTPUT_OPTION_DESCRIPTIONS.description} checked={saveDescription} onCheckedChange={next => updateDraft({type: 'set-save-description', saveDescription: next})} />
										<ProfileSwitchRow id="profile-output-thumbnail" label="Save thumbnail" description={OUTPUT_OPTION_DESCRIPTIONS.thumbnail} checked={saveThumbnail} onCheckedChange={next => updateDraft({type: 'set-save-thumbnail', saveThumbnail: next})} />
									</div>
								</Card>

								<Card size="sm" className="rounded-lg bg-background/25 px-3 py-3">
									<div className="mb-2 flex items-center justify-between gap-3">
										<h4 className="text-sm font-semibold">SponsorBlock</h4>
										<Badge variant="outline">{showVideo ? optionLabel(SPONSOR_BLOCK_OPTIONS, sponsorBlockMode) : 'Skipped'}</Badge>
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
												<ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS} title={SPONSOR_BLOCK_HINTS[option.value]}>
													{option.label}
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									) : (
										<Alert variant="info" className="py-2 text-[12px]">
											<AlertDescription className="text-[12px]">Skipped for this output type.</AlertDescription>
										</Alert>
									)}
								</Card>

								<ProfileSelect label="Playlist probe cap" value={playlistCap} options={PLAYLIST_CAP_OPTIONS} onValueChange={next => updateDraft({type: 'set-playlist-cap', playlistCap: next})} testId="profiles-editor-playlist-cap" />
							</FieldGroup>
						</ProfilePanel>
					</div>
				</ScrollArea>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type="button" onClick={() => void saveProfile()} disabled={subfolderInvalid} className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
						Save profile
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

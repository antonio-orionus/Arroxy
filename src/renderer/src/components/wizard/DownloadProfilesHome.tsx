import {useEffect, useMemo, useRef, useState, type ClipboardEvent, type JSX, type KeyboardEvent} from 'react'
import {Archive, BookOpen, Captions, Check, ChevronDown, ChevronRight, Clapperboard, Download, FileAudio, Headphones, Link2, ListPlus, Music, PenLine, Plus, Scissors, Settings, Users, Wand2, X, type LucideIcon} from 'lucide-react'
import {allDownloadProfiles, downloadProfileLabel, downloadProfileOrigin, downloadProfileRefFor, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {DownloadProfile, DownloadProfileIcon, DownloadProfilesPrefs} from '@shared/types.js'
import {classifyBulkUrlKind, parseBulkUrls} from '@shared/bulkUrls.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {notify} from '@renderer/lib/notify.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../ui/tabs.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {BulkUrlDialog} from './BulkUrlDialog.js'
import {DownloadProfileEditor} from './DownloadProfileEditor.js'
import {DownloadProfilesSettingsTab} from './DownloadProfilesSettingsTab.js'
import {IncompleteCookiesConfigDialog} from './IncompleteCookiesConfigDialog.js'
import hiImg from '../../assets/Hi.png'
import downloadingImg from '../../assets/Downloading.png'

type ProfilesTab = 'download' | 'profiles' | 'settings'
type DownloadInputType = 'Single URL' | 'Playlist URL' | 'Channel URL' | 'Search URL' | 'URL' | 'Unknown URL'
const PROFILE_TABS = ['download', 'profiles', 'settings'] as const satisfies readonly ProfilesTab[]

const ICONS: Record<DownloadProfileIcon, LucideIcon> = {archive: Archive, audio: FileAudio, captions: Captions, classes: BookOpen, clip: Scissors, download: Download, music: Music, podcast: Headphones, video: Clapperboard}

function tabFromHash(hash = window.location.hash): ProfilesTab {
	const value = hash.replace(/^#/, '').toLowerCase()
	if (value === 'profile' || value === 'profiles') return 'profiles'
	if (value === 'setting' || value === 'settings') return 'settings'
	return 'download'
}

function isProfilesTab(value: unknown): value is ProfilesTab {
	return typeof value === 'string' && PROFILE_TABS.includes(value as ProfilesTab)
}

function tabHash(tab: ProfilesTab): string {
	if (tab === 'profiles') return '#profiles'
	if (tab === 'settings') return '#settings'
	return '#download'
}

function profileDetail(profile: DownloadProfile): string {
	const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} subtitles` : 'no subtitles'
	const output = profile.output.kind === 'fixed' ? profile.output.dir : 'default folder'
	const artifacts = [profile.embed.metadata ? 'metadata' : null, profile.embed.thumbnailSidecar ? 'thumbnail' : null, profile.embed.description ? 'description' : null].filter(Boolean).join(' · ')
	return `${subs} · ${output}${artifacts ? ` · ${artifacts}` : ''}`
}

function detectUrlType(value: string): DownloadInputType | null {
	const trimmed = value.trim()
	if (!trimmed) return null
	try {
		const kind = classifyBulkUrlKind(cleanUrl(trimmed))
		if (kind === 'single') return 'Single URL'
		if (kind === 'playlist') return 'Playlist URL'
		if (kind === 'channel') return 'Channel URL'
		if (kind === 'search') return 'Search URL'
		return 'URL'
	} catch {
		return 'Unknown URL'
	}
}

function downloadMascotHelp({activeProfileName, hasActiveDownloads, hasInput, inputType, quickDownloadStatus}: {activeProfileName: string; hasActiveDownloads: boolean; hasInput: boolean; inputType: DownloadInputType | null; quickDownloadStatus: string}): {
	key: string
	title: string
	body: string
	points: string[]
	image: string
} {
	if (quickDownloadStatus === 'preparing') {
		return {key: 'preparing', title: 'Preparing', body: `Quick Download is reading this link and applying ${activeProfileName}.`, points: ['No wizard steps', 'Queued when ready'], image: downloadingImg}
	}

	if (quickDownloadStatus === 'queued') {
		return {key: 'queued', title: 'Queued', body: 'The queue is handling this download. You can paste another link while it works.', points: ['Queue keeps order', 'Profile already applied'], image: downloadingImg}
	}

	if (!hasInput) {
		return {
			key: hasActiveDownloads ? 'idle-running' : 'idle',
			title: hasActiveDownloads ? 'Downloads are running' : 'Tip',
			body: 'Download Profiles save quality, subtitles, output folder, thumbnails, SponsorBlock, and playlist cap rules.',
			points: ['Quick uses the active profile', 'Interactive opens the wizard', 'Bulk URLs handles lists'],
			image: hasActiveDownloads ? downloadingImg : hiImg
		}
	}

	if (inputType === 'Playlist URL' || inputType === 'Channel URL' || inputType === 'Search URL') {
		return {key: `collection-${inputType}`, title: inputType, body: `Quick queues loaded items with ${activeProfileName}. Interactive lets you inspect or select items first.`, points: ['Quick queues all loaded items', 'Interactive supports selection', 'Profile rules apply to every item'], image: hiImg}
	}

	if (inputType === 'Single URL') {
		return {key: 'single', title: 'Single URL', body: `Quick starts one download with ${activeProfileName}. Use Interactive for one-off changes.`, points: ['Quick is fastest', 'Interactive can override options'], image: hiImg}
	}

	return {key: 'generic-url', title: 'URL detected', body: 'Quick will try the active profile. Interactive is safer when you want to review what the link contains.', points: ['Quick uses profile', 'Interactive reviews first'], image: hiImg}
}

export function DownloadProfilesHome(): JSX.Element {
	const {cookiesConfigDialogIssue, dismissCookiesConfigDialog, openCookiesSettings, quickDownload, quickDownloadError, quickDownloadStatus, removeDownloadProfile, saveDownloadProfile, setActiveDownloadProfile, setWizardUrl, settings, submitUrl, wizardUrl} = useAppStore()
	const hasActiveDownloads = useAppStore(state => state.queue.some(item => item.status === 'running'))
	const inputRef = useRef<HTMLInputElement>(null)
	const bulkOpenRef = useRef(false)
	const [activeTab, setActiveTab] = useState<ProfilesTab>(() => tabFromHash())
	const [bulkOpen, setBulkOpen] = useState(false)
	const [editorOpen, setEditorOpen] = useState(false)
	const [editorSessionId, setEditorSessionId] = useState(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)
	const [profileMenuOpen, setProfileMenuOpen] = useState(false)
	const [dismissedMascotKey, setDismissedMascotKey] = useState<string | null>(null)
	const profilesPrefs = settings?.profiles
	const profiles = useMemo(() => allDownloadProfiles(profilesPrefs), [profilesPrefs])
	const {profile: activeProfile} = resolveActiveDownloadProfile(profilesPrefs)
	const hasInput = wizardUrl.trim().length > 0
	const inputType = detectUrlType(wizardUrl)
	const quickPreparing = quickDownloadStatus === 'preparing'
	const quickErrorText = quickDownloadError === 'wizard.url.quickProbeFailed' ? 'Could not read the URL.' : quickDownloadError === 'wizard.url.quickPrepareFailed' ? 'Could not prepare that download.' : (quickDownloadError ?? '')
	const mascotHelp = downloadMascotHelp({activeProfileName: activeProfile.name, hasActiveDownloads, hasInput, inputType, quickDownloadStatus})
	const showMascotHelp = dismissedMascotKey !== mascotHelp.key
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}

	useEffect(() => {
		const sync = (): void => setActiveTab(tabFromHash())
		window.addEventListener('hashchange', sync)
		sync()
		return () => window.removeEventListener('hashchange', sync)
	}, [])

	useEffect(() => {
		bulkOpenRef.current = bulkOpen
	}, [bulkOpen])

	useEffect(() => {
		return window.appApi.events.onClipboardUrl(payload => {
			if (bulkOpenRef.current) {
				bulkLogger.info('Clipboard URL ignored while bulk dialog is open')
				return
			}

			const state = useAppStore.getState()
			if (state.wizardUrl.trim()) return
			if (state.formatsLoading) return
			if (state.quickDownloadStatus === 'preparing') return

			const parsed = parseBulkUrls(payload)
			if (parsed.accepted.length >= 1) {
				const firstUrl = parsed.accepted[0]?.url ?? cleanUrl(payload)
				setWizardUrl(firstUrl)
				bulkLogger.info('Bulk URLs detected from clipboard', {accepted: parsed.accepted.length, rejected: parsed.rejected.length, ignored: parsed.ignoredCount})
				notify.clipboardAutofilled(parsed.accepted.length > 1 ? `${parsed.accepted.length} links found; first link added` : 'Link added from clipboard')
				return
			}

			const cleaned = cleanUrl(payload)
			if (!cleaned.trim()) return
			setWizardUrl(cleaned)
			notify.clipboardAutofilled('Link added from clipboard')
		})
	}, [setWizardUrl])

	function selectTab(tab: ProfilesTab): void {
		setActiveTab(tab)
		window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(tab)}`)
	}

	function openEditor(profile: DownloadProfile | null): void {
		setEditingProfile(profile)
		setEditorSessionId(value => value + 1)
		setEditorOpen(true)
	}

	function handleClearUrl(): void {
		setWizardUrl('')
		inputRef.current?.focus()
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (event.key === 'Enter' && wizardUrl.trim() && !quickPreparing) {
			void submitUrl()
		}
	}

	function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
		const pasted = event.clipboardData.getData('text')
		const cleaned = cleanUrl(pasted)
		if (cleaned === pasted) return
		event.preventDefault()
		const input = event.currentTarget
		const start = input.selectionStart ?? wizardUrl.length
		const end = input.selectionEnd ?? wizardUrl.length
		setWizardUrl(wizardUrl.slice(0, start) + cleaned + wizardUrl.slice(end))
	}

	return (
		<div className="wizard-step mx-auto flex w-full max-w-6xl flex-col gap-4 pb-5" data-testid="download-profiles-home">
			<Tabs
				value={activeTab}
				onValueChange={value => {
					if (isProfilesTab(value)) selectTab(value)
				}}
				className="gap-4"
			>
				<TabsList variant="line" className="flex h-11 w-full justify-start gap-5 border-b border-border/80 p-0" aria-label="Download profile navigation" data-testid="profiles-tabs">
					<TabsTrigger value="download" className="h-11 flex-none rounded-none border-b-2 px-1 data-active:border-[var(--brand)]">
						<Download data-icon="inline-start" aria-hidden />
						Download
					</TabsTrigger>
					<TabsTrigger value="profiles" className="h-11 flex-none rounded-none border-b-2 px-1 data-active:border-[var(--brand)]">
						<Users data-icon="inline-start" aria-hidden />
						Profiles
					</TabsTrigger>
					<TabsTrigger value="settings" className="h-11 flex-none rounded-none border-b-2 px-1 data-active:border-[var(--brand)]">
						<Settings data-icon="inline-start" aria-hidden />
						Settings
					</TabsTrigger>
				</TabsList>

				<TabsContent value="download" className="flex flex-col gap-4">
					<Card className="rounded-lg border-[var(--border-strong)] bg-card/40" data-testid="profiles-download-panel">
						<CardHeader className="flex-row items-center gap-3">
							<div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/40 bg-[var(--brand-dim)] text-[var(--brand)]">
								<Download aria-hidden />
							</div>
							<div className="min-w-0">
								<CardTitle className="text-xl font-semibold leading-tight">Download input</CardTitle>
								<CardDescription className="mt-1 text-[12px] text-[var(--text-subtle)]">Enter a URL to start your download.</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<InputGroup className="mt-5 h-12 border-[var(--border-strong)] bg-background/35">
								<InputGroupAddon align="inline-start">
									<Link2 aria-hidden />
								</InputGroupAddon>
								<InputGroupInput ref={inputRef} type="url" value={wizardUrl} onChange={event => setWizardUrl(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder="Paste a URL..." spellCheck={false} data-testid="profiles-main-input" className="text-[13px]" />
								{hasInput ? (
									<InputGroupAddon align="inline-end">
										<InputGroupButton type="button" size="icon-sm" aria-label="Clear URL" onClick={handleClearUrl} data-testid="url-clear">
											<X aria-hidden />
										</InputGroupButton>
									</InputGroupAddon>
								) : null}
							</InputGroup>

							<div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-subtle)]">
								<Badge variant={hasInput ? 'secondary' : 'outline'} className={cn(!hasInput && 'text-[var(--text-subtle)]')}>
									{hasInput ? 'URL entered' : 'Waiting for URL'}
								</Badge>
								{inputType ? (
									<Badge variant="outline" className="border-[var(--brand)]/40 bg-[var(--brand-dim)] text-[var(--brand)]">
										{inputType}
									</Badge>
								) : null}
							</div>

							<Separator className="my-5" />

							<QuickProfileCard
								activeProfile={activeProfile}
								disabled={!hasInput || quickPreparing}
								menuOpen={profileMenuOpen}
								onDownload={() => void quickDownload()}
								onEditProfile={() => openEditor(activeProfile)}
								onManageProfiles={() => {
									setProfileMenuOpen(false)
									selectTab('profiles')
								}}
								onMenuOpenChange={setProfileMenuOpen}
								onNewProfile={() => {
									setProfileMenuOpen(false)
									openEditor(null)
								}}
								onPickProfile={activateProfile}
								profiles={profiles}
							/>

							{quickDownloadStatus === 'error' ? (
								<Alert variant="warning" className="mt-2 py-2" data-testid="quick-download-feedback">
									<AlertDescription className="text-[11px]">Quick Download failed: {quickErrorText}</AlertDescription>
								</Alert>
							) : null}

							<div className="mt-3 grid gap-2">
								<ActionRow disabled={!hasInput || quickPreparing} icon={Wand2} title="Interactive Download" description="Review and customize options before downloading." onClick={() => void submitUrl()} testId="profiles-interactive-download" />
								<ActionRow icon={ListPlus} title="Bulk URLs" description="Choose Quick or Interactive for batch downloads." onClick={() => setBulkOpen(true)} testId="profiles-bulk-urls" />
							</div>
						</CardContent>
					</Card>
					{showMascotHelp ? <DownloadMascotHelpCard help={mascotHelp} onDismiss={() => setDismissedMascotKey(mascotHelp.key)} /> : null}
				</TabsContent>

				<TabsContent value="profiles">
					<ProfilesTab activeProfile={activeProfile} onEdit={openEditor} onPick={activateProfile} onRemove={profile => void removeDownloadProfile(profile.id)} profiles={profiles} profilesPrefs={profilesPrefs} />
				</TabsContent>
				<TabsContent value="settings">
					<DownloadProfilesSettingsTab />
				</TabsContent>
			</Tabs>

			{bulkOpen ? <BulkUrlDialog open={bulkOpen} onOpenChange={setBulkOpen} initialRaw="" /> : null}
			<DownloadProfileEditor key={editorSessionId} initialProfile={editingProfile} open={editorOpen} onOpenChange={setEditorOpen} onSave={profile => saveDownloadProfile(profile)} />
			<IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
		</div>
	)
}

function DownloadMascotHelpCard({help, onDismiss}: {help: ReturnType<typeof downloadMascotHelp>; onDismiss: () => void}): JSX.Element {
	return (
		<Card className="flex w-full max-w-[34rem] flex-row items-center gap-4 rounded-lg border-[var(--border-strong)] bg-background/30 px-4 py-3" data-testid="profiles-mascot-help">
			<img src={help.image} alt="" aria-hidden className="size-20 shrink-0 object-contain" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-foreground">{help.title}</p>
				<p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--text-subtle)]">{help.body}</p>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{help.points.map(point => (
						<Badge key={point} variant="outline" className="border-border bg-muted/20 text-[var(--text-subtle)]">
							{point}
						</Badge>
					))}
				</div>
			</div>
			<Button type="button" variant="ghost" size="sm" onClick={onDismiss} className="shrink-0 text-[var(--brand)] hover:text-[var(--brand)]" data-testid="profiles-mascot-dismiss">
				Got it
			</Button>
		</Card>
	)
}

function QuickProfileCard({
	activeProfile,
	disabled,
	menuOpen,
	onDownload,
	onEditProfile,
	onManageProfiles,
	onMenuOpenChange,
	onNewProfile,
	onPickProfile,
	profiles
}: {
	activeProfile: DownloadProfile
	disabled: boolean
	menuOpen: boolean
	onDownload: () => void
	onEditProfile: () => void
	onManageProfiles: () => void
	onMenuOpenChange: (open: boolean) => void
	onNewProfile: () => void
	onPickProfile: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
}): JSX.Element {
	const ActiveIcon = ICONS[activeProfile.icon]
	return (
		<div className="grid w-full grid-cols-[minmax(0,1fr)_4rem] overflow-hidden rounded-lg border border-[var(--brand)] bg-background/25 shadow-[0_4px_14px_var(--brand-glow)] md:grid-cols-[minmax(14rem,0.82fr)_minmax(20rem,1fr)_4rem]" data-testid="profiles-quick-preview">
			<button
				type="button"
				disabled={disabled}
				onClick={onDownload}
				className="group/quick flex min-h-24 min-w-0 items-center gap-4 border-e border-[var(--brand)]/40 bg-[linear-gradient(135deg,var(--brand-dim),transparent_72%)] px-5 py-5 text-left transition-colors hover:bg-background/35 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none md:min-h-[7rem] md:gap-5 md:px-6 dark:hover:bg-white/5"
				data-testid="profiles-quick-download"
			>
				<Download className="size-10 shrink-0 text-[var(--brand)] md:size-11" aria-hidden />
				<span className="flex min-w-0 flex-col">
					<span className="text-lg font-semibold leading-tight text-foreground group-disabled/quick:text-foreground/70 md:text-xl dark:text-white dark:group-disabled/quick:text-white/80">Quick Download</span>
					<span className="mt-1 text-[12px] font-medium leading-snug text-[var(--text-subtle)] group-disabled/quick:text-[var(--text-subtle)]/80 dark:text-white/70 dark:group-disabled/quick:text-white/55">Start download using the active profile.</span>
				</span>
			</button>
			<div className="order-3 col-span-2 flex min-w-0 items-center border-t border-border bg-background/20 p-3 md:order-none md:col-auto md:border-t-0 dark:border-white/10">
				<div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-[var(--border-strong)] bg-background/35 px-3 py-3 dark:bg-white/5" data-testid="profiles-active-profile-card">
					<div className="grid size-12 shrink-0 place-items-center rounded-md border border-[var(--brand)]/30 bg-[var(--brand-dim)] text-[var(--brand)]">
						<ActiveIcon aria-hidden />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] dark:text-white/55">Active profile</p>
						<p className="mt-1 truncate text-base font-semibold leading-tight text-foreground dark:text-white">{activeProfile.name}</p>
						<p className="mt-1 truncate text-[12px] text-[var(--text-subtle)] dark:text-white/65">
							{downloadProfileLabel(activeProfile)} · {profileDetail(activeProfile)}
						</p>
					</div>
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button {...props} type="button" variant="outline" size="icon" onClick={onEditProfile} aria-label={`Edit selected profile: ${activeProfile.name}`} className="size-10 shrink-0 border-border bg-background/45 hover:bg-muted dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
									<PenLine aria-hidden />
								</Button>
							)}
						/>
						<TooltipContent>Edit selected profile</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<ProfileMenu activeProfile={activeProfile} menuOpen={menuOpen} onManageProfiles={onManageProfiles} onMenuOpenChange={onMenuOpenChange} onNewProfile={onNewProfile} onPickProfile={onPickProfile} profiles={profiles} />
		</div>
	)
}

function ProfileMenu({
	activeProfile,
	menuOpen,
	onManageProfiles,
	onMenuOpenChange,
	onNewProfile,
	onPickProfile,
	profiles
}: {
	activeProfile: DownloadProfile
	menuOpen: boolean
	onManageProfiles: () => void
	onMenuOpenChange: (open: boolean) => void
	onNewProfile: () => void
	onPickProfile: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
}): JSX.Element {
	return (
		<Popover open={menuOpen} onOpenChange={onMenuOpenChange}>
			<PopoverTrigger
				render={
					<Button
						type="button"
						size="icon-lg"
						className="order-2 h-full min-h-24 w-full rounded-s-none border-s border-[var(--brand)]/40 bg-background/20 hover:bg-background/35 md:order-none md:min-h-[7rem] dark:bg-white/5 dark:hover:bg-white/10"
						aria-label="Choose active download profile"
						title="Choose active download profile"
						data-testid="profiles-profile-menu-trigger"
					>
						<ChevronDown aria-hidden />
					</Button>
				}
			/>
			<PopoverContent
				align="end"
				collisionAvoidance={{side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
				collisionPadding={{top: 76, right: 16, bottom: 24, left: 16}}
				sideOffset={10}
				className="relative max-h-[calc(100vh-6rem)] w-[min(28rem,calc(100vw-2rem))] gap-3 overflow-y-auto border-[var(--border-strong)] p-3 before:absolute before:-top-2 before:right-8 before:size-4 before:rotate-45 before:border-s before:border-t before:border-[var(--border-strong)] before:bg-popover"
				data-testid="profiles-profile-menu"
			>
				<PopoverHeader>
					<PopoverTitle className="text-base font-semibold">Switch profile</PopoverTitle>
					<PopoverDescription className="text-[13px] leading-relaxed">Change the active profile for Quick Download, Bulk URLs, and playlists.</PopoverDescription>
				</PopoverHeader>
				<div className="flex flex-col gap-2">
					{profiles.map(profile => {
						const Icon = ICONS[profile.icon]
						const active = activeProfile.id === profile.id
						return (
							<Button
								key={profile.id}
								type="button"
								variant="outline"
								onClick={() => {
									onPickProfile(profile)
									onMenuOpenChange(false)
								}}
								aria-pressed={active}
								className={cn('h-auto min-h-16 w-full justify-start gap-3 whitespace-normal rounded-md px-3 py-3 text-left', active ? 'border-[var(--brand)] bg-[var(--brand-dim)] shadow-[0_0_0_1px_var(--brand-dim)]' : 'bg-muted/20 hover:border-[var(--border-strong)]')}
							>
								<Icon className="shrink-0 text-[var(--brand)]" aria-hidden />
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-semibold text-foreground">{profile.name}</span>
									<span className="mt-0.5 block truncate text-[12px] font-normal text-[var(--text-subtle)]">{downloadProfileLabel(profile)}</span>
								</span>
								{active ? <Check className="shrink-0 text-[var(--brand)]" aria-hidden /> : null}
							</Button>
						)
					})}
				</div>
				<Separator />
				<div className="grid grid-cols-2 gap-2">
					<Button type="button" variant="outline" size="sm" onClick={onNewProfile}>
						<Plus data-icon="inline-start" />
						New profile
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={onManageProfiles}>
						<Users data-icon="inline-start" />
						Manage profiles
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}

function ActionRow({description, disabled = false, icon: Icon, onClick, testId, title}: {description: string; disabled?: boolean; icon: LucideIcon; onClick: () => void; testId: string; title: string}): JSX.Element {
	return (
		<Button type="button" variant="outline" disabled={disabled} onClick={onClick} data-testid={testId} className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-4 py-3 text-left">
			<Icon data-icon="inline-start" />
			<span className="flex min-w-0 flex-1 flex-col items-start">
				<span className="font-semibold">{title}</span>
				<span className="text-[12px] font-normal text-[var(--text-subtle)]">{description}</span>
			</span>
			<ChevronRight className="ms-auto text-[var(--text-subtle)]" aria-hidden />
		</Button>
	)
}

function ProfilesTab({
	activeProfile,
	onEdit,
	onPick,
	onRemove,
	profiles,
	profilesPrefs
}: {
	activeProfile: DownloadProfile
	onEdit: (profile: DownloadProfile | null) => void
	onPick: (profile: DownloadProfile) => void
	onRemove: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
	profilesPrefs: DownloadProfilesPrefs | undefined
}): JSX.Element {
	return (
		<Card className="rounded-lg border-[var(--border-strong)] bg-card/40" data-testid="profiles-manage-tab">
			<CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="text-xl font-semibold leading-tight">Download Profiles</CardTitle>
					<CardDescription className="mt-1 text-[12px] text-[var(--text-subtle)]">Create, select, edit, or remove reusable download setups.</CardDescription>
				</div>
				<Button type="button" onClick={() => onEdit(null)} className="shadow-[0_4px_14px_var(--brand-glow)]">
					<Plus data-icon="inline-start" />
					New profile
				</Button>
			</CardHeader>
			<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{profiles.map(profile => {
					const Icon = ICONS[profile.icon]
					const active = activeProfile.id === profile.id
					const origin = downloadProfileOrigin(profile, profilesPrefs)
					const isCustom = origin.kind === 'custom'
					const canRemove = isCustom || origin.overridden
					return (
						<article key={profile.id} className={cn('rounded-lg border bg-background/25 p-3', active ? 'border-[var(--brand)] bg-[var(--brand-dim)]/35' : 'border-border')}>
							<button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => onPick(profile)}>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/35 bg-[var(--brand-dim)] text-[var(--brand)]">
									<Icon aria-hidden />
								</span>
								<span className="min-w-0 flex-1">
									<span className="flex items-center gap-2">
										<span className="truncate text-sm font-semibold">{profile.name}</span>
										<Badge variant={isCustom || origin.overridden ? 'outline' : 'secondary'}>{isCustom ? 'custom' : origin.overridden ? 'modified' : 'builtin'}</Badge>
										{active ? <Check className="ml-auto shrink-0 text-[var(--brand)]" aria-hidden /> : null}
									</span>
									<span className="mt-1 block text-[12px] leading-snug text-[var(--text-subtle)]">{downloadProfileLabel(profile)}</span>
									<span className="block text-[12px] leading-snug text-[var(--text-subtle)]">{profileDetail(profile)}</span>
								</span>
							</button>
							<div className="mt-3 grid grid-cols-2 gap-2">
								<Button type="button" variant="outline" size="sm" onClick={() => onEdit(profile)}>
									<PenLine data-icon="inline-start" />
									Edit
								</Button>
								<Button type="button" variant="outline" size="sm" disabled={!canRemove} onClick={() => onRemove(profile)}>
									<X data-icon="inline-start" />
									{isCustom ? 'Remove' : 'Reset'}
								</Button>
							</div>
						</article>
					)
				})}
			</CardContent>
		</Card>
	)
}

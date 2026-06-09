import {useEffect, useMemo, useRef, useState, useSyncExternalStore, type ClipboardEvent, type KeyboardEvent, type ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {Archive, BookOpen, Captions, Check, ChevronDown, ChevronRight, Clapperboard, Clock3, Download, FileAudio, Globe2, Headphones, Link2, ListPlus, Loader2, Music, PenLine, Plus, Scissors, Settings, SlidersHorizontal, Sparkles, Users, Wand2, X, type LucideIcon} from 'lucide-react'
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

const ICONS: Record<DownloadProfileIcon, LucideIcon> = {archive: Archive, audio: FileAudio, captions: Captions, classes: BookOpen, clip: Scissors, controls: SlidersHorizontal, download: Download, music: Music, podcast: Headphones, video: Clapperboard}
const FEATURE_GROUPS = [
	{heading: 'wizard.url.features.youtube.heading', icon: Clapperboard, items: ['wizard.url.features.youtube.video', 'wizard.url.features.youtube.channel', 'wizard.url.features.youtube.playlist', 'wizard.url.features.youtube.short', 'wizard.url.features.youtube.music', 'wizard.url.features.youtube.podcast']},
	{heading: 'wizard.url.features.anySite.heading', icon: Globe2, items: ['wizard.url.features.anySite.video', 'wizard.url.features.anySite.videoPlaylist', 'wizard.url.features.anySite.musicPlaylist']},
	{heading: 'wizard.url.features.always.heading', icon: Clock3, items: ['wizard.url.features.always.audioOnly', 'wizard.url.features.always.subtitles']}
] as const

function tabFromHash(hash = window.location.hash): ProfilesTab {
	const value = hash.replace(/^#/, '').toLowerCase()
	if (value === 'profile' || value === 'profiles') return 'profiles'
	if (value === 'setting' || value === 'settings') return 'settings'
	return 'download'
}

function browserMockScenarioId(): string | null {
	if (import.meta.env.MODE !== 'browser-mock') return null
	try {
		return new URLSearchParams(window.location.search).get('scenario')
	} catch {
		return null
	}
}

function subscribeProfileTabHash(onStoreChange: () => void): () => void {
	window.addEventListener('hashchange', onStoreChange)
	return () => window.removeEventListener('hashchange', onStoreChange)
}

function profileTabSnapshot(): ProfilesTab {
	return tabFromHash()
}

function isProfilesTab(value: unknown): value is ProfilesTab {
	return typeof value === 'string' && PROFILE_TABS.includes(value as ProfilesTab)
}

function tabHash(tab: ProfilesTab): string {
	if (tab === 'profiles') return '#profiles'
	if (tab === 'settings') return '#settings'
	return '#download'
}

function selectProfilesTab(tab: ProfilesTab): void {
	window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(tab)}`)
	window.dispatchEvent(new Event('hashchange'))
}

function profileDetail(profile: DownloadProfile, t: TFunction): string {
	const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} ${t('wizard.confirm.labelSubtitles').toLowerCase()}` : t('wizard.subtitles.noSelected')
	const output = profile.output.kind === 'fixed' ? profile.output.dir : t('wizard.folder.downloads')
	const artifacts = [profile.embed.metadata ? t('wizard.output.embedMetadata.label') : null, profile.embed.thumbnailSidecar ? t('wizard.output.writeThumbnail.label') : null, profile.embed.description ? t('wizard.output.writeDescription.label') : null].filter(Boolean).join(' · ')
	return `${subs} · ${output}${artifacts ? ` · ${artifacts}` : ''}`
}

function detectUrlType(value: string): DownloadInputType | null {
	const trimmed = value.trim()
	if (!trimmed) return null
	try {
		const cleaned = cleanUrl(trimmed)
		new URL(cleaned)
		const kind = classifyBulkUrlKind(cleaned)
		if (kind === 'single') return 'Single URL'
		if (kind === 'playlist') return 'Playlist URL'
		if (kind === 'channel') return 'Channel URL'
		if (kind === 'search') return 'Search URL'
		return 'URL'
	} catch {
		return 'Unknown URL'
	}
}

function downloadMascotHelp({activeProfileName, hasActiveDownloads, hasInput, inputType, quickDownloadStatus, t}: {activeProfileName: string; hasActiveDownloads: boolean; hasInput: boolean; inputType: DownloadInputType | null; quickDownloadStatus: string; t: TFunction}): {
	key: string
	title: string
	body: string
	points: string[]
	image: string
} {
	if (quickDownloadStatus === 'preparing') {
		return {key: 'preparing', title: t('wizard.url.quickPreparing'), body: `${t('wizard.url.quickDownload')} is reading this link and applying ${activeProfileName}.`, points: ['No wizard steps', 'Queued when ready'], image: downloadingImg}
	}

	if (quickDownloadStatus === 'queued') {
		return {key: 'queued', title: t('wizard.url.quickQueued'), body: 'The queue is handling this download. You can paste another link while it works.', points: ['Queue keeps order', 'Profile applied'], image: downloadingImg}
	}

	if (!hasInput) {
		return {
			key: hasActiveDownloads ? 'idle-running' : 'idle',
			title: hasActiveDownloads ? 'Downloads are running' : 'Tip',
			body: hasActiveDownloads ? t('wizard.url.mascotBusy') : t('wizard.url.mascotIdle'),
			points: ['Quick uses the active profile', 'Interactive reviews first', 'Bulk handles lists'],
			image: hasActiveDownloads ? downloadingImg : hiImg
		}
	}

	if (inputType === 'Playlist URL' || inputType === 'Channel URL' || inputType === 'Search URL') {
		return {key: `collection-${inputType}`, title: inputType, body: `Quick queues loaded items with ${activeProfileName}. Interactive lets you inspect or select items first.`, points: ['Quick queues loaded items', 'Interactive supports selection', 'Profile rules apply'], image: hiImg}
	}

	if (inputType === 'Single URL') {
		return {key: 'single', title: 'Single URL', body: `Quick starts one download with ${activeProfileName}. Use Interactive for one-off changes.`, points: ['Quick is fastest', 'Interactive can override options'], image: hiImg}
	}

	return {key: 'generic-url', title: 'URL detected', body: t('wizard.url.quickSingleOnly'), points: ['Quick uses the active profile', 'Interactive reviews first'], image: hiImg}
}

function quickDownloadErrorText(t: TFunction, error: string | null | undefined): string {
	if (!error) return ''
	if (error === 'wizard.url.quickProbeFailed' || error === 'wizard.url.quickPrepareFailed') return t(error)
	return error
}

// react-doctor-disable-next-line react-doctor/prefer-useReducer -- these local UI controls update independently and do not share reducer-style transitions
export function DownloadProfilesHome(): ReactNode {
	const {t} = useTranslation()
	const {cookiesConfigDialogIssue, dismissCookiesConfigDialog, openCookiesSettings, quickDownload, quickDownloadError, quickDownloadStatus, removeDownloadProfile, saveDownloadProfile, setActiveDownloadProfile, setWizardUrl, settings, submitUrl, wizardUrl} = useAppStore()
	const hasActiveDownloads = useAppStore(state => state.queue.some(item => item.status === 'running'))
	const inputRef = useRef<HTMLInputElement>(null)
	const bulkOpenRef = useRef(false)
	const initialBrowserMockScenario = browserMockScenarioId()
	const activeTab = useSyncExternalStore(subscribeProfileTabHash, profileTabSnapshot, profileTabSnapshot)
	const [bulkOpen, setBulkOpen] = useState(() => initialBrowserMockScenario === 'profiles-bulk')
	const [editorOpen, setEditorOpen] = useState(() => initialBrowserMockScenario === 'profiles-editor')
	const [editorSessionId, setEditorSessionId] = useState(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)
	const [profileMenuOpen, setProfileMenuOpen] = useState(() => initialBrowserMockScenario === 'profiles-split-menu')
	const profilesPrefs = settings?.profiles
	const profiles = useMemo(() => allDownloadProfiles(profilesPrefs), [profilesPrefs])
	const {profile: activeProfile} = resolveActiveDownloadProfile(profilesPrefs)
	const hasInput = wizardUrl.trim().length > 0
	const inputType = detectUrlType(wizardUrl)
	const urlReady = inputType !== null && inputType !== 'Unknown URL'
	const quickPreparing = quickDownloadStatus === 'preparing'
	const quickErrorText = quickDownloadErrorText(t, quickDownloadError)
	const mascotHelp = downloadMascotHelp({activeProfileName: activeProfile.name, hasActiveDownloads, hasInput, inputType, quickDownloadStatus, t})
	const showMascotHelp = inputType !== 'Unknown URL'
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}

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
		if (event.key === 'Enter' && urlReady && !quickPreparing) {
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
		<div className="wizard-step mx-auto flex w-full max-w-[92rem] flex-col gap-4 pb-5" data-testid="download-profiles-home">
			<Tabs
				value={activeTab}
				onValueChange={value => {
					if (isProfilesTab(value)) selectProfilesTab(value)
				}}
				className="gap-4"
			>
				<TabsList variant="line" className="download-home-tabs flex h-14 w-full justify-start gap-8 border-b border-border/80 p-0" aria-label="Download profile navigation" data-testid="profiles-tabs">
					<TabsTrigger value="download" className="h-14 flex-none rounded-none border-b-2 px-2 text-[15px] data-active:border-transparent">
						<Link2 data-icon="inline-start" aria-hidden />
						{t('wizard.steps.url')}
					</TabsTrigger>
					<TabsTrigger value="profiles" className="h-14 flex-none rounded-none border-b-2 px-2 text-[15px] data-active:border-transparent">
						<Users data-icon="inline-start" aria-hidden />
						Profiles
					</TabsTrigger>
					<TabsTrigger value="settings" className="h-14 flex-none rounded-none border-b-2 px-2 text-[15px] data-active:border-transparent">
						<Settings data-icon="inline-start" aria-hidden />
						Settings
					</TabsTrigger>
				</TabsList>

				<TabsContent value="download" className="flex flex-col gap-4">
					<Card className="glow-panel rounded-[1.85rem] border-transparent" data-testid="profiles-download-panel">
						<CardHeader className="px-6 pt-6 md:px-10 md:pt-7">
							<div className="min-w-0">
								<CardTitle className="text-2xl font-semibold leading-tight tracking-[-0.01em]">{t('wizard.url.heading')}</CardTitle>
								<CardDescription className="mt-2 text-[13px] text-[var(--text-subtle)]">{t('wizard.url.quickSingleOnly')}</CardDescription>
								<InputGroup className="glow-tile mt-5 h-14 rounded-2xl border-transparent px-1">
									<InputGroupAddon align="inline-start">
										<Link2 aria-hidden />
									</InputGroupAddon>
									<InputGroupInput ref={inputRef} type="url" value={wizardUrl} onChange={event => setWizardUrl(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder={t('wizard.url.placeholder')} spellCheck={false} data-testid="profiles-main-input" className="text-[15px]" />
									{hasInput ? (
										<InputGroupAddon align="inline-end">
											<InputGroupButton type="button" size="icon-sm" aria-label={t('wizard.url.clearAria')} onClick={handleClearUrl} data-testid="url-clear">
												<X aria-hidden />
											</InputGroupButton>
										</InputGroupAddon>
									) : null}
								</InputGroup>
							</div>
						</CardHeader>
						<CardContent className="px-6 pb-3 md:px-10">
							<QuickProfileCard
								activeProfile={activeProfile}
								disabled={!urlReady || quickPreparing}
								menuOpen={profileMenuOpen}
								preparing={quickPreparing}
								onDownload={() => void quickDownload()}
								onEditProfile={() => openEditor(activeProfile)}
								onManageProfiles={() => {
									setProfileMenuOpen(false)
									selectProfilesTab('profiles')
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
									<AlertDescription className="text-[11px]">{t('wizard.url.quickFailed', {error: quickErrorText})}</AlertDescription>
								</Alert>
							) : null}

							<div className="mt-3 grid gap-2">
								<ActionRow disabled={!urlReady || quickPreparing} icon={Wand2} title={t('wizard.url.interactiveDownload')} description={t('wizard.url.fetchFormatsTooltip')} onClick={() => void submitUrl()} testId="profiles-interactive-download" />
								<ActionRow icon={ListPlus} title={t('wizard.url.bulkButton')} description={t('wizard.url.bulkTooltip')} onClick={() => setBulkOpen(true)} testId="profiles-bulk-urls" />
							</div>
						</CardContent>
					</Card>
					{showMascotHelp ? <DownloadMascotHelpCard help={mascotHelp} /> : null}
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

function DownloadMascotHelpCard({help}: {help: ReturnType<typeof downloadMascotHelp>}): ReactNode {
	return (
		<Card className="glow-panel flex w-full flex-col gap-6 rounded-[1.5rem] border-transparent !px-8 !py-7 sm:flex-row sm:items-center md:!px-12 md:!py-8" data-testid="profiles-mascot-help">
			<img src={help.image} alt="" aria-hidden className="size-20 shrink-0 object-contain md:size-24" />
			<div className="grid min-w-0 flex-1 gap-8 lg:grid-cols-[minmax(14rem,0.72fr)_minmax(0,1.28fr)] lg:items-center">
				<div className="min-w-0">
					<p className="text-base font-semibold text-foreground">{help.title}</p>
					<p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--text-glass-muted)] md:text-sm">{help.body}</p>
					<ul className="mt-3 grid gap-1.5 text-[12px] leading-snug text-[var(--text-glass-muted)]">
						{help.points.map(point => (
							<li key={point} className="flex min-w-0 items-start gap-2">
								<Check className="mt-0.5 size-3.5 shrink-0 text-[var(--brand-hover)]" aria-hidden />
								<span className="min-w-0">{point}</span>
							</li>
						))}
					</ul>
				</div>
				<MascotCapabilityMatrix />
			</div>
		</Card>
	)
}

function MascotCapabilityMatrix(): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="min-w-0 lg:border-l lg:border-[var(--glow-border)] lg:pl-7" data-testid="url-capabilities">
			<p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.url.features.heading')}</p>
			<div className="mt-3 grid gap-5 sm:grid-cols-3">
				{FEATURE_GROUPS.map(group => {
					const Icon = group.icon
					return (
						<div key={group.heading} className="min-w-0">
							<p className="flex items-center gap-2 truncate text-[13px] font-semibold text-foreground">
								<Icon className="size-4 shrink-0 text-[var(--brand-hover)]" aria-hidden />
								{t(group.heading)}
							</p>
							<div className="mt-2 flex flex-wrap gap-1">
								{group.items.map(item => (
									<Badge key={item} variant="outline" className="glow-chip px-2 py-0 text-[12px] font-medium">
										{t(item)}
									</Badge>
								))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function QuickProfileCard({
	activeProfile,
	disabled,
	menuOpen,
	preparing,
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
	preparing: boolean
	onDownload: () => void
	onEditProfile: () => void
	onManageProfiles: () => void
	onMenuOpenChange: (open: boolean) => void
	onNewProfile: () => void
	onPickProfile: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
}): ReactNode {
	const {t} = useTranslation()
	const ActiveIcon = ICONS[activeProfile.icon]
	return (
		<div className="grid w-full gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)]" data-testid="profiles-quick-preview">
			<button
				type="button"
				disabled={disabled}
				aria-busy={preparing}
				onClick={onDownload}
				className={cn(
					'glow-tile-primary group/quick relative flex min-h-[7rem] min-w-0 items-center gap-5 overflow-hidden rounded-[1.5rem] px-6 py-5 text-left text-white transition-[filter,transform] duration-200 md:min-h-[9rem] md:gap-8 md:px-8',
					'hover:brightness-[1.08] active:translate-y-px',
					'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-white/70',
					disabled && !preparing && 'pointer-events-none opacity-55 saturate-[0.65]',
					preparing && 'pointer-events-none'
				)}
				data-testid="profiles-quick-download"
			>
				<span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_90%_at_0%_0%,hsl(190_100%_82%/0.34),transparent_52%),radial-gradient(110%_120%_at_100%_120%,hsl(288_96%_68%/0.42),transparent_50%)]" />
				<span className="icon-tile quick-icon-tile relative grid size-16 shrink-0 place-items-center rounded-2xl md:size-20 [&_svg]:size-8 md:[&_svg]:size-10">{preparing ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}</span>
				<span className="relative flex min-w-0 flex-col">
					<span className="text-xl font-semibold leading-tight tracking-[-0.01em] md:text-2xl">{preparing ? `${t('wizard.url.quickPreparing')}…` : t('wizard.url.quickDownload')}</span>
					<span className="mt-2 text-[13px] font-medium leading-snug text-white md:text-sm">{t('wizard.url.quickDownloadTooltip')}</span>
				</span>
				<ChevronRight className="relative ms-auto size-6 shrink-0 text-white/90 transition-transform duration-200 group-hover/quick:translate-x-0.5" aria-hidden />
			</button>

			<div className="glow-tile flex min-w-0 items-center gap-3 rounded-[1.5rem] border-transparent px-4 py-5 md:gap-5 md:px-7" data-testid="profiles-active-profile-card">
				<div className="icon-tile grid size-14 shrink-0 place-items-center rounded-2xl md:size-20 [&_svg]:size-7 md:[&_svg]:size-8">
					<ActiveIcon aria-hidden />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Active profile</p>
					<p className="mt-2 flex min-w-0 items-center gap-1.5 truncate text-base font-semibold leading-tight text-foreground md:gap-2 md:text-xl">
						<span className="truncate">{activeProfile.name}</span>
						<Sparkles className="hidden size-4 shrink-0 text-[var(--brand-hover)] md:block" aria-hidden />
					</p>
					<p className="glass-muted-text mt-1 line-clamp-2 text-[12px] leading-snug md:text-[13px]">
						{downloadProfileLabel(activeProfile)} · {profileDetail(activeProfile, t)}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1.5 md:gap-2">
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button
									{...props}
									type="button"
									variant="outline"
									size="icon-lg"
									onClick={onEditProfile}
									aria-label={`Edit active profile: ${activeProfile.name}`}
									className="glow-tile glow-icon-button size-10 rounded-xl border-transparent bg-transparent hover:brightness-110 md:size-14"
									data-testid="profiles-edit-active-profile"
								>
									<PenLine aria-hidden />
								</Button>
							)}
						/>
						<TooltipContent>Edit active profile</TooltipContent>
					</Tooltip>
					<ProfileMenu activeProfile={activeProfile} menuOpen={menuOpen} onManageProfiles={onManageProfiles} onMenuOpenChange={onMenuOpenChange} onNewProfile={onNewProfile} onPickProfile={onPickProfile} profiles={profiles} />
				</div>
			</div>
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
}): ReactNode {
	return (
		<Popover open={menuOpen} onOpenChange={onMenuOpenChange}>
			<PopoverTrigger
				render={
					<Button type="button" variant="outline" size="icon-lg" aria-label="Switch download profile" title="Switch download profile" className="glow-tile glow-icon-button size-10 rounded-xl border-transparent bg-transparent hover:brightness-110 md:size-14" data-testid="profiles-profile-menu-trigger">
						<ChevronDown aria-hidden className="transition-transform duration-200 group-aria-expanded/button:rotate-180" />
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

function ActionRow({description, disabled = false, icon: Icon, onClick, testId, title}: {description: string; disabled?: boolean; icon: LucideIcon; onClick: () => void; testId: string; title: string}): ReactNode {
	return (
		<Button
			type="button"
			variant="ghost"
			disabled={disabled}
			onClick={onClick}
			data-testid={testId}
			className="glow-tile group/row h-auto min-h-16 justify-start gap-4 whitespace-normal rounded-[1.25rem] border-transparent px-5 py-2.5 text-left transition-[filter,transform] duration-200 hover:bg-transparent hover:brightness-[1.12] active:translate-y-px"
		>
			<span className="icon-tile grid size-12 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover/row:scale-[1.05]">
				<Icon className="size-5" aria-hidden />
			</span>
			<span className="flex min-w-0 flex-1 flex-col items-start">
				<span className="text-base font-semibold">{title}</span>
				<span className="glass-muted-text text-[13px] font-normal">{description}</span>
			</span>
			<ChevronRight className="glass-muted-text ms-auto" aria-hidden />
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
}): ReactNode {
	const {t} = useTranslation()
	return (
		<Card className="glow-panel rounded-2xl border-transparent" data-testid="profiles-manage-tab">
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
									<span className="block text-[12px] leading-snug text-[var(--text-subtle)]">{profileDetail(profile, t)}</span>
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

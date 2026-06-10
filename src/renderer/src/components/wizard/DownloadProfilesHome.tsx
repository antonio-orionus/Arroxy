import {lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ClipboardEvent, type ComponentType, type KeyboardEvent, type ReactNode, type SVGProps} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {Archive, BookOpen, Captions, Check, ChevronDown, ChevronRight, Clapperboard, Download, FileAudio, Globe2, Headphones, Info, Link2, ListPlus, Loader2, Music, PenLine, Plus, Scissors, Settings, SlidersHorizontal, Users, Wand2, X, type LucideIcon} from 'lucide-react'
import {downloadProfileLabel, downloadProfileOrigin, downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {DownloadProfile, DownloadProfileIcon, DownloadProfilesPrefs} from '@shared/types.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {notify} from '@renderer/lib/notify.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useDownloadHomeView, type DownloadInputType} from '../../store/downloadHomeView.js'
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
import {DownloadProfilesSettingsTab} from './DownloadProfilesSettingsTab.js'
import {IncompleteCookiesConfigDialog} from './IncompleteCookiesConfigDialog.js'
import {buildClipboardCandidate, resolveClipboardIntake, type ClipboardCandidate} from './clipboardIntake.js'
import hiImg from '../../assets/Hi.png'
import downloadingImg from '../../assets/Downloading.png'
import IconYoutube from '~icons/logos/youtube-icon'
import IconVimeo from '~icons/logos/vimeo-icon'
import IconTwitch from '~icons/logos/twitch'
import IconTiktok from '~icons/logos/tiktok-icon'
import IconSoundcloud from '~icons/logos/soundcloud'
import IconInstagram from '~icons/logos/instagram-icon'
import IconFacebook from '~icons/logos/facebook'
import IconReddit from '~icons/logos/reddit-icon'
import IconDailymotion from '~icons/simple-icons/dailymotion'
import IconBilibili from '~icons/simple-icons/bilibili'

type ProfilesTab = 'download' | 'profiles' | 'settings'
const PROFILE_TABS = ['download', 'profiles', 'settings'] as const satisfies readonly ProfilesTab[]
type CapabilityId = 'youtube' | 'any-site'
type CapabilityIcon = ComponentType<SVGProps<SVGSVGElement>>
const DownloadProfileEditor = lazy(() => import('./DownloadProfileEditor.js').then(module => ({default: module.DownloadProfileEditor})))

const ICONS: Record<DownloadProfileIcon, LucideIcon> = {archive: Archive, audio: FileAudio, captions: Captions, classes: BookOpen, clip: Scissors, controls: SlidersHorizontal, download: Download, music: Music, podcast: Headphones, video: Clapperboard}
const POPULAR_SITE_LOGOS: {id: string; Icon: CapabilityIcon; color?: string}[] = [
	{id: 'vimeo', Icon: IconVimeo},
	{id: 'twitch', Icon: IconTwitch},
	{id: 'tiktok', Icon: IconTiktok},
	{id: 'soundcloud', Icon: IconSoundcloud},
	{id: 'instagram', Icon: IconInstagram},
	{id: 'facebook', Icon: IconFacebook},
	{id: 'reddit', Icon: IconReddit},
	{id: 'dailymotion', Icon: IconDailymotion, color: '#00ADEF'},
	{id: 'bilibili', Icon: IconBilibili, color: '#00A1D6'}
]
const FEATURE_GROUPS = [
	{
		id: 'youtube',
		heading: 'wizard.url.features.youtube.heading',
		icon: IconYoutube,
		items: ['wizard.url.features.youtube.video', 'wizard.url.features.youtube.channel', 'wizard.url.features.youtube.playlist', 'wizard.url.features.youtube.short', 'wizard.url.features.youtube.music', 'wizard.url.features.youtube.podcast']
	},
	{id: 'any-site', heading: 'wizard.url.features.anySite.heading', icon: Globe2, items: ['wizard.url.features.anySite.video', 'wizard.url.features.anySite.videoPlaylist', 'wizard.url.features.anySite.musicPlaylist', 'wizard.url.features.always.audioOnly', 'wizard.url.features.always.subtitles']}
] as const satisfies readonly {id: CapabilityId; heading: string; icon: CapabilityIcon; items: readonly string[]}[]

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

function quickProfileSummary(profile: DownloadProfile): string {
	switch (profile.media.kind) {
		case 'video-audio': {
			const tier = profile.media.tiers[0] ?? 'best'
			const video = tier === 'best' ? 'best video' : `${tier}p`
			const audio = profile.media.audio.format === 'm4a' ? 'AAC audio' : 'best audio'
			return `${video} · ${audio}`
		}
		case 'video-only': {
			const tier = profile.media.tiers[0] ?? 'best'
			return tier === 'best' ? 'best video · no audio' : `${tier}p · no audio`
		}
		case 'audio-only':
			if (profile.media.audio.format === 'best') return 'best audio'
			if (profile.media.audio.format === 'wav') return 'WAV audio'
			return `${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? 'default'}K`
		case 'subtitles-only':
			return 'subtitles only'
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
	const {
		activeProfile,
		cookiesConfigDialogIssue,
		dismissCookiesConfigDialog,
		hasActiveDownloads,
		hasInput,
		inputType,
		openCookiesSettings,
		profiles,
		profilesPrefs,
		quickDownload,
		quickDownloadError,
		quickDownloadStatus,
		quickPreparing,
		removeDownloadProfile,
		saveDownloadProfile,
		setActiveDownloadProfile,
		setWizardUrl,
		submitUrl,
		urlReady,
		wizardUrl
	} = useDownloadHomeView()
	const inputRef = useRef<HTMLInputElement>(null)
	const bulkOpenRef = useRef(false)
	const initialBrowserMockScenario = browserMockScenarioId()
	const activeTab = useSyncExternalStore(subscribeProfileTabHash, profileTabSnapshot, profileTabSnapshot)
	const [bulkOpen, setBulkOpen] = useState(() => initialBrowserMockScenario === 'profiles-bulk')
	const [bulkInitialRaw, setBulkInitialRaw] = useState('')
	const [pendingClipboard, setPendingClipboard] = useState<ClipboardCandidate | null>(null)
	const [editorOpen, setEditorOpen] = useState(() => initialBrowserMockScenario === 'profiles-editor')
	const [editorSessionId, setEditorSessionId] = useState(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)
	const quickErrorText = quickDownloadErrorText(t, quickDownloadError)
	const mascotHelp = downloadMascotHelp({activeProfileName: activeProfile.name, hasActiveDownloads, hasInput, inputType, quickDownloadStatus, t})
	const showMascotHelp = inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}

	useEffect(() => {
		bulkOpenRef.current = bulkOpen
	}, [bulkOpen])

	const consumeClipboardCandidate = useCallback(
		(candidate: ClipboardCandidate): void => {
			setPendingClipboard(null)
			if (candidate.kind === 'bulk') {
				setBulkInitialRaw(candidate.raw)
				setBulkOpen(true)
				bulkLogger.info('Bulk URLs detected from clipboard', {accepted: candidate.count})
				notify.clipboardAutofilled(`${candidate.count} links opened from clipboard`)
				return
			}

			const url = candidate.acceptedUrls[0]
			if (!url) return
			setWizardUrl(url)
			notify.clipboardAutofilled('Link added from clipboard')
		},
		[setWizardUrl]
	)

	function openManualBulkDialog(): void {
		setPendingClipboard(null)
		setBulkInitialRaw('')
		setBulkOpen(true)
	}

	function handleBulkOpenChange(next: boolean): void {
		setBulkOpen(next)
		if (!next) setBulkInitialRaw('')
	}

	useEffect(() => {
		return window.appApi.events.onClipboardUrl(payload => {
			const state = useAppStore.getState()
			const action = resolveClipboardIntake({candidate: buildClipboardCandidate(payload), hasInput: state.wizardUrl.trim().length > 0, formatsLoading: state.formatsLoading, quickPreparing: state.quickDownloadStatus === 'preparing', bulkOpen: bulkOpenRef.current})

			if (action.kind === 'ignore') return
			if (action.kind === 'store-pending') {
				setPendingClipboard(action.candidate)
				if (bulkOpenRef.current) bulkLogger.info('Clipboard URL held while bulk dialog is open', {accepted: action.candidate.count})
				return
			}
			consumeClipboardCandidate(action.candidate)
		})
	}, [consumeClipboardCandidate])

	function openEditor(profile: DownloadProfile | null): void {
		setEditingProfile(profile)
		setEditorSessionId(value => value + 1)
		setEditorOpen(true)
	}

	function handleClearUrl(): void {
		setWizardUrl('')
		if (pendingClipboard) {
			consumeClipboardCandidate(pendingClipboard)
			return
		}
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
					if (!isProfilesTab(value)) return
					if (value !== 'download') setPendingClipboard(null)
					selectProfilesTab(value)
				}}
				className="gap-4"
			>
				<TabsList variant="line" className="download-home-tabs mx-auto flex justify-center" aria-label="Download profile navigation" data-testid="profiles-tabs">
					<TabsTrigger value="download" className="h-14 flex-1 rounded-full border-0 px-5 text-[16px] data-active:border-transparent">
						<Link2 data-icon="inline-start" aria-hidden />
						{t('wizard.steps.url')}
					</TabsTrigger>
					<TabsTrigger value="profiles" className="h-14 flex-1 rounded-full border-0 px-5 text-[16px] data-active:border-transparent">
						<Users data-icon="inline-start" aria-hidden />
						Profiles
					</TabsTrigger>
					<TabsTrigger value="settings" className="h-14 flex-1 rounded-full border-0 px-5 text-[16px] data-active:border-transparent">
						<Settings data-icon="inline-start" aria-hidden />
						Settings
					</TabsTrigger>
				</TabsList>

				<TabsContent value="download" className="flex flex-col gap-4">
					<Card className="glow-panel rounded-[1.5rem] border-transparent" data-testid="profiles-download-panel">
						<CardHeader className="px-5 pt-5 md:px-6 md:pt-5">
							<div className="min-w-0">
								<CardTitle className="text-display">{t('wizard.url.heading')}</CardTitle>
								<CardDescription className="mt-1.5 text-body text-[var(--text-subtle)]">{t('wizard.url.quickSingleOnly')}</CardDescription>
								<InputGroup className="glow-tile mt-4 h-11 rounded-xl border-transparent px-1">
									<InputGroupAddon align="inline-start">
										<Link2 aria-hidden />
									</InputGroupAddon>
									<InputGroupInput ref={inputRef} type="url" value={wizardUrl} onChange={event => setWizardUrl(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder={t('wizard.url.placeholder')} spellCheck={false} data-testid="profiles-main-input" className="text-title" />
									{hasInput ? (
										<InputGroupAddon align="inline-end">
											<InputGroupButton type="button" size="icon-sm" aria-label={t('wizard.url.clearAria')} onClick={handleClearUrl} data-testid="url-clear">
												<X aria-hidden />
											</InputGroupButton>
										</InputGroupAddon>
									) : null}
								</InputGroup>
								{pendingClipboard ? <ClipboardPendingAction candidate={pendingClipboard} onApply={() => consumeClipboardCandidate(pendingClipboard)} onDismiss={() => setPendingClipboard(null)} /> : null}
							</div>
						</CardHeader>
						<CardContent className="px-5 pb-4 md:px-6">
							<QuickProfileCard
								activeProfile={activeProfile}
								defaultProfileMenuOpen={initialBrowserMockScenario === 'profiles-split-menu'}
								disabled={!urlReady || quickPreparing}
								preparing={quickPreparing}
								onDownload={() => void quickDownload()}
								onEditProfile={() => openEditor(activeProfile)}
								onManageProfiles={() => selectProfilesTab('profiles')}
								onNewProfile={() => openEditor(null)}
								onPickProfile={activateProfile}
								profiles={profiles}
							/>

							{quickDownloadStatus === 'error' ? (
								<Alert variant="warning" className="mt-2 py-2" data-testid="quick-download-feedback">
									<AlertDescription className="text-[11px]">{t('wizard.url.quickFailed', {error: quickErrorText})}</AlertDescription>
								</Alert>
							) : null}

							<div className="mt-3 grid w-full gap-2 lg:grid-cols-[repeat(2,minmax(0,35rem))] lg:justify-start" data-testid="profiles-action-rows">
								<ActionRow disabled={!urlReady || quickPreparing} icon={Wand2} title={t('wizard.url.interactiveDownload')} description={t('wizard.url.fetchFormatsTooltip')} onClick={() => void submitUrl()} testId="profiles-interactive-download" />
								<ActionRow icon={ListPlus} title={t('wizard.url.bulkButton')} description={t('wizard.url.bulkTooltip')} onClick={openManualBulkDialog} testId="profiles-bulk-urls" />
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

			{bulkOpen ? <BulkUrlDialog open={bulkOpen} onOpenChange={handleBulkOpenChange} initialRaw={bulkInitialRaw} /> : null}
			{editorOpen ? (
				<Suspense
					fallback={
						<div className="fixed inset-0 z-50 grid place-items-center bg-background/35" role="status" aria-label={t('wizard.formats.loadingAria')}>
							<Loader2 className="size-5 animate-spin text-[var(--brand)]" aria-hidden />
						</div>
					}
				>
					<DownloadProfileEditor key={editorSessionId} initialProfile={editingProfile} open={editorOpen} onOpenChange={setEditorOpen} onSave={profile => saveDownloadProfile(profile)} />
				</Suspense>
			) : null}
			<IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
		</div>
	)
}

function ClipboardPendingAction({candidate, onApply, onDismiss}: {candidate: ClipboardCandidate; onApply: () => void; onDismiss: () => void}): ReactNode {
	const isBulk = candidate.kind === 'bulk'
	const Icon = isBulk ? ListPlus : Link2
	const statusLabel = isBulk ? `${candidate.count} copied links ready` : 'Copied link ready'
	const actionLabel = isBulk ? `Open ${candidate.count} copied links` : 'Use copied link'
	return (
		<div className="mt-2 flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-[var(--glow-border)] bg-[var(--brand-dim)] px-3 py-2 text-[12px] text-foreground" data-testid="clipboard-pending" role="status">
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<Icon className="size-3.5 shrink-0 text-[var(--brand)]" aria-hidden />
				<span className="min-w-0 truncate">{statusLabel}</span>
			</span>
			<Button type="button" variant="outline" size="xs" onClick={onApply} data-testid="clipboard-pending-action" className="bg-background/50">
				{actionLabel}
			</Button>
			<Button type="button" variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="Dismiss copied link" data-testid="clipboard-pending-dismiss" className="-me-1">
				<X aria-hidden />
			</Button>
		</div>
	)
}

export function DownloadMascotHelpCard({help}: {help: ReturnType<typeof downloadMascotHelp>}): ReactNode {
	return (
		<Card className="glow-panel flex w-full max-w-full flex-col gap-4 rounded-[1.25rem] border-transparent !px-5 !py-4 sm:flex-row sm:items-center md:!px-6 md:!py-5 xl:w-fit xl:max-w-[64rem] xl:self-start" data-testid="profiles-mascot-help">
			<img src={help.image} alt="" aria-hidden className="size-16 shrink-0 object-contain" />
			<div className="grid min-w-0 flex-1 gap-5 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(24rem,1.1fr)] lg:items-center xl:w-[52rem]">
				<div className="min-w-0">
					<p className="text-title text-foreground">{help.title}</p>
					<p className="mt-1 max-w-xl text-body text-[var(--text-glass-muted)]">{help.body}</p>
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

export function MascotCapabilityMatrix(): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="min-w-0 lg:border-l lg:border-[var(--glow-border)] lg:pl-5" data-testid="url-capabilities">
			<p className="text-label uppercase text-[var(--text-subtle)]">{t('wizard.url.features.heading')}</p>
			<div className="mt-3 grid gap-3 sm:grid-cols-[minmax(8rem,0.55fr)_minmax(14rem,1.45fr)]">
				{FEATURE_GROUPS.map(group => {
					const heading = t(group.heading)
					const items = group.items.map(item => t(item))
					const detailLabel = `${heading}: ${items.join(', ')}`
					return (
						<div key={group.id} className="min-w-0">
							<div className="flex min-w-0 items-center gap-1.5">
								<CapabilityMark group={group} />
								<p className="min-w-0 truncate text-title text-foreground">{heading}</p>
								<Tooltip>
									<TooltipTrigger
										render={props => (
											<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={detailLabel} data-testid={`url-capability-${group.id}-tip`} className="-my-1 shrink-0 rounded-full text-[var(--text-subtle)] hover:text-foreground">
												<Info aria-hidden />
											</Button>
										)}
									/>
									<TooltipContent data-testid={`url-capability-${group.id}-content`} className="max-w-[15rem] flex-wrap items-start justify-start gap-1.5 border border-border bg-popover text-popover-foreground shadow-lg">
										{group.items.map(item => (
											<Badge key={item} variant="outline" className="bg-background/50 px-2 py-0 text-[11px]">
												{t(item)}
											</Badge>
										))}
									</TooltipContent>
								</Tooltip>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function CapabilityMark({group}: {group: (typeof FEATURE_GROUPS)[number]}): ReactNode {
	if (group.id === 'any-site') {
		return (
			<span className="flex shrink-0 items-center gap-1" aria-hidden data-testid="url-capability-any-site-logos">
				{POPULAR_SITE_LOGOS.map(({id, Icon, color}) => (
					<Icon key={id} className="size-3.5" style={color ? {color} : undefined} data-testid={`url-capability-site-logo-${id}`} />
				))}
			</span>
		)
	}

	const Icon = group.icon
	return <Icon className={cn('shrink-0', group.id === 'youtube' ? 'size-5' : 'size-4 text-[var(--brand-hover)]')} aria-hidden data-testid={`url-capability-${group.id}-mark`} />
}

function QuickProfileCard({
	activeProfile,
	defaultProfileMenuOpen,
	disabled,
	preparing,
	onDownload,
	onEditProfile,
	onManageProfiles,
	onNewProfile,
	onPickProfile,
	profiles
}: {
	activeProfile: DownloadProfile
	defaultProfileMenuOpen: boolean
	disabled: boolean
	preparing: boolean
	onDownload: () => void
	onEditProfile: () => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
}): ReactNode {
	const {t} = useTranslation()
	const ActiveIcon = ICONS[activeProfile.icon]
	const activeProfileSummary = quickProfileSummary(activeProfile)
	return (
		<div className="quick-profile-cluster flex w-full flex-col overflow-hidden rounded-[1.25rem] md:min-h-[6.5rem] md:flex-row" data-linked-control="quick-profile" data-testid="profiles-quick-preview">
			<button
				type="button"
				disabled={disabled}
				aria-busy={preparing}
				onClick={onDownload}
				className={cn(
					'quick-profile-action group/quick relative flex min-h-[6rem] min-w-0 flex-1 items-center gap-4 overflow-hidden px-5 py-4 text-left transition-[filter,transform] duration-200 md:min-h-[6.5rem] md:basis-[52%] lg:px-5 xl:px-6',
					'hover:brightness-[1.08] active:translate-y-px',
					'focus-visible:outline-none',
					disabled && !preparing && 'pointer-events-none opacity-55 saturate-[0.65]',
					preparing && 'pointer-events-none'
				)}
				data-testid="profiles-quick-download"
			>
				<span aria-hidden className="quick-card-overlay pointer-events-none absolute inset-0" />
				<span className="icon-tile quick-icon-tile relative grid size-12 shrink-0 place-items-center rounded-xl md:size-14 [&_svg]:size-6 md:[&_svg]:size-7">{preparing ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}</span>
				<span className="relative flex min-w-0 flex-col">
					<span className="text-headline">{preparing ? `${t('wizard.url.quickPreparing')}…` : t('wizard.url.quickDownload')}</span>
					<span className="mt-1 block truncate text-sm font-medium leading-snug text-[var(--quick-card-muted)] md:whitespace-nowrap">{t('wizard.url.quickDownloadTooltip', {profileName: activeProfile.name})}</span>
				</span>
				<ChevronRight className="relative ms-auto size-5 shrink-0 text-[var(--quick-card-ink)] opacity-85 transition-transform duration-200 group-hover/quick:translate-x-0.5 md:size-6" aria-hidden />
			</button>

			<ProfileMenu activeProfile={activeProfile} activeProfileSummary={activeProfileSummary} ActiveIcon={ActiveIcon} defaultOpen={defaultProfileMenuOpen} onEditProfile={onEditProfile} onManageProfiles={onManageProfiles} onNewProfile={onNewProfile} onPickProfile={onPickProfile} profiles={profiles} />
		</div>
	)
}

function ProfileMenu({
	activeProfile,
	activeProfileSummary,
	ActiveIcon,
	defaultOpen,
	onEditProfile,
	onManageProfiles,
	onNewProfile,
	onPickProfile,
	profiles
}: {
	activeProfile: DownloadProfile
	activeProfileSummary: string
	ActiveIcon: LucideIcon
	defaultOpen: boolean
	onEditProfile: () => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (profile: DownloadProfile) => void
	profiles: DownloadProfile[]
}): ReactNode {
	const [menuOpen, setMenuOpen] = useState(defaultOpen)

	function closeAndRun(action: () => void): void {
		setMenuOpen(false)
		action()
	}

	return (
		<Popover open={menuOpen} onOpenChange={setMenuOpen}>
			<PopoverTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						aria-label={`Switch download profile: ${activeProfile.name}`}
						title="Switch download profile"
						className="quick-profile-selector m-2 h-auto min-h-[5.5rem] w-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal rounded-[1rem] px-4 py-4 text-left hover:bg-transparent md:m-2 md:min-h-0 md:basis-[48%] md:self-stretch md:px-4 lg:m-3 lg:px-5"
						data-testid="profiles-active-profile-card"
					>
						<span className="icon-tile grid size-12 shrink-0 place-items-center rounded-xl md:size-14">
							<ActiveIcon aria-hidden className="size-6 md:size-7" />
						</span>
						<span className="min-w-0 flex-1">
							<span className="quick-profile-selector-kicker mb-1 block truncate text-label uppercase">Active profile</span>
							<span className="quick-profile-selector-title block truncate text-headline">{activeProfile.name}</span>
							<span className="quick-profile-selector-meta mt-0.5 block truncate text-sm font-normal leading-snug">{activeProfileSummary}</span>
						</span>
						<span className="quick-profile-chevron grid size-10 shrink-0 place-items-center rounded-full">
							<ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-aria-expanded/button:rotate-180" />
						</span>
					</Button>
				}
			/>
			<PopoverContent
				align="end"
				collisionAvoidance={{side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
				collisionPadding={{top: 76, right: 16, bottom: 24, left: 16}}
				finalFocus={closeType => closeType === 'keyboard'}
				initialFocus={openType => openType === 'keyboard'}
				keepMounted
				sideOffset={10}
				className="relative max-h-[calc(100vh-6rem)] w-[min(50rem,calc(100vw-2rem))] gap-3 overflow-y-auto border-[var(--border-strong)] p-3 before:absolute before:-top-2 before:right-8 before:size-4 before:rotate-45 before:border-s before:border-t before:border-[var(--border-strong)] before:bg-popover"
				data-testid="profiles-profile-menu"
			>
				<PopoverHeader>
					<PopoverTitle className="text-base font-semibold">Switch profile</PopoverTitle>
					<PopoverDescription className="text-[13px] leading-relaxed">Change the active profile for Quick Download, Bulk URLs, and playlists.</PopoverDescription>
				</PopoverHeader>
				<Separator />
				<div className="grid grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))] gap-2" data-testid="profiles-profile-menu-grid">
					{profiles.map(profile => {
						const Icon = ICONS[profile.icon]
						const active = activeProfile.id === profile.id
						const profileLabel = downloadProfileLabel(profile)
						return (
							<Button
								key={profile.id}
								type="button"
								variant="outline"
								onClick={() => {
									onPickProfile(profile)
									setMenuOpen(false)
								}}
								aria-pressed={active}
								title={`${profile.name}: ${profileLabel}`}
								className={cn('h-auto min-h-12 w-full justify-start gap-2.5 whitespace-normal rounded-md px-2.5 py-2 text-left', active ? 'border-[var(--brand)] bg-[var(--brand-dim)] shadow-[0_0_0_1px_var(--brand-dim)]' : 'bg-muted/20 hover:border-[var(--border-strong)]')}
								data-testid={`profiles-profile-option-${profile.id}`}
							>
								<Icon className="shrink-0 text-[var(--brand)]" aria-hidden />
								<span className="min-w-0 flex-1">
									<span className="block truncate text-[13px] font-semibold text-foreground">{profile.name}</span>
									<span className="block truncate text-[11px] font-normal leading-tight text-[var(--text-subtle)]">{profileLabel}</span>
								</span>
								{active ? <Check className="shrink-0 text-[var(--brand)]" aria-hidden /> : null}
							</Button>
						)
					})}
				</div>
				<Separator />
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3" data-testid="profiles-profile-menu-actions">
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onEditProfile)}>
						<PenLine data-icon="inline-start" />
						Edit active profile
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onNewProfile)}>
						<Plus data-icon="inline-start" />
						New profile
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onManageProfiles)}>
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
			className="glow-tile group/row h-auto min-h-14 justify-start gap-3 whitespace-normal rounded-[1rem] border-transparent px-4 py-2 text-left transition-[filter,transform] duration-200 hover:bg-transparent hover:brightness-[1.12] active:translate-y-px"
		>
			<span className="icon-tile grid size-10 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover/row:scale-[1.05]">
				<Icon className="size-5" aria-hidden />
			</span>
			<span className="flex min-w-0 flex-1 flex-col items-start">
				<span className="text-title">{title}</span>
				<span className="glass-muted-text text-xs font-normal">{description}</span>
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
						<article key={profile.id} data-active={active ? 'true' : undefined} className="profile-card rounded-lg p-3" data-testid={`profiles-manage-card-${profile.id}`}>
							<button type="button" className="flex w-full items-start gap-3 text-left" aria-pressed={active} onClick={() => onPick(profile)} data-testid={`profiles-manage-card-${profile.id}-picker`}>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/35 bg-[var(--brand-dim)] text-[var(--brand)]">
									<Icon aria-hidden />
								</span>
								<span className="min-w-0 flex-1" data-testid={`profiles-manage-card-${profile.id}-summary`}>
									<span className="flex items-center gap-2" data-testid={`profiles-manage-card-${profile.id}-title-row`}>
										<span className="truncate text-sm font-semibold" data-testid={`profiles-manage-card-${profile.id}-title`}>
											{profile.name}
										</span>
										<Badge variant={isCustom || origin.overridden ? 'outline' : 'secondary'}>{isCustom ? 'custom' : origin.overridden ? 'modified' : 'builtin'}</Badge>
										<Check className={cn('ml-auto size-4 shrink-0 text-[var(--brand)] transition-opacity duration-150', active ? 'opacity-100' : 'opacity-0')} aria-hidden data-testid={`profiles-manage-card-${profile.id}-check`} />
									</span>
									<span className="mt-1 block text-[12px] leading-snug text-[var(--text-subtle)]" data-testid={`profiles-manage-card-${profile.id}-description`}>
										{downloadProfileLabel(profile)}
									</span>
									<span className="block text-[12px] leading-snug text-[var(--text-subtle)]" data-testid={`profiles-manage-card-${profile.id}-detail`}>
										{profileDetail(profile, t)}
									</span>
								</span>
							</button>
							<div className="mt-3 grid grid-cols-2 gap-2" data-testid={`profiles-manage-card-${profile.id}-actions`}>
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

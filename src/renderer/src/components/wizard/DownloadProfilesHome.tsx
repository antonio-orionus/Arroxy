import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ClipboardEvent, type KeyboardEvent, type ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {Check, ChevronRight, Inbox, Link2, ListPlus, PenLine, Plus, RefreshCw, Settings, Users, Wand2, X, type LucideIcon} from 'lucide-react'
import {downloadProfileLabel, downloadProfileOrigin, downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {notify} from '@renderer/lib/notify.js'
import {cn} from '@renderer/lib/utils.js'
import {formatProbeError} from '../../store/helpers.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useDownloadHomeView, type DownloadInputType, type QuickDownloadFailureMessage} from '../../store/downloadHomeView.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../ui/tabs.js'
import {Spinner} from '../ui/spinner.js'
import {BulkUrlDialog} from './BulkUrlDialog.js'
import {DownloadProfilesSettingsTab} from './DownloadProfilesSettingsTab.js'
import {IncompleteCookiesConfigDialog} from './IncompleteCookiesConfigDialog.js'
import {QuickProfileControl} from './QuickProfileControl.js'
import {QueueManagerTab} from '../queue/QueueManagerTab.js'
import {buildClipboardCandidate, resolveClipboardIntake, type ClipboardCandidate} from './clipboardIntake.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {BotWallGuidanceAlert} from './format/BotWallNotice.js'
import {CookiesGuidanceAlert} from './format/CookiesErrorAlert.js'
import type {ProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import hiImg from '../../assets/Hi.png'
import downloadingImg from '../../assets/Downloading.png'

type ProfilesTab = 'download' | 'queue' | 'profiles' | 'settings'
const PROFILE_TABS = ['download', 'queue', 'profiles', 'settings'] as const satisfies readonly ProfilesTab[]
const DownloadProfileEditor = lazy(() => import('./DownloadProfileEditor.js').then(module => ({default: module.DownloadProfileEditor})))
const QUEUE_TAB_TIP_STORAGE_KEY = 'arroxy_seen_queue_tab_tip'
const QUEUE_TAB_TIP_VISIBLE_MS = 5_000

function tabFromHash(hash = window.location.hash): ProfilesTab {
	const value = hash.replace(/^#/, '').toLowerCase()
	if (value === 'profile' || value === 'profiles') return 'profiles'
	if (value === 'queue') return 'queue'
	if (value === 'setting' || value === 'settings') return 'settings'
	return 'download'
}

function browserMockScenarioId(): string | null {
	try {
		return new URLSearchParams(window.location.search).get('scenario')
	} catch {
		return null
	}
}

function isBrowserMockBulkDialogScenario(scenario: string | null): boolean {
	return scenario === 'profiles-bulk' || scenario === 'profiles-bulk-huge-input'
}

function browserMockBulkInitialRaw(scenario: string | null): string {
	if (scenario !== 'profiles-bulk-huge-input') return ''
	return [
		'vite v8.0.16 building ssr environment for development...',
		'4 modules transformed.',
		'out/preload/index.cjs  9.02 kB',
		'',
		'built in 14ms',
		'',
		'electron preload scripts built successfully',
		'',
		'-----',
		'',
		'dev server running for the electron renderer process at:',
		'',
		'  -> Local:   http://localhost:5173/',
		'  -> Network: use --host to expose',
		'',
		'starting electron app...',
		'',
		...Array.from({length: 180}, (_, index) => {
			const seconds = String(index % 60).padStart(2, '0')
			return `17:20:${seconds}.${String(index).padStart(3, '0')}          > gpu features { 2d_canvas: 'disabled_software', direct_rendering_display_compositor: 'disabled_off_ok', gpu_compositing: 'disabled_software', multiple_raster_threads: 'enabled_on', opengl: 'disabled_off', rasterization: 'disabled_software', video_decode: 'disabled_software', vulkan: 'disabled_off' }`
		})
	].join('\n')
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
	if (tab === 'queue') return '#queue'
	if (tab === 'settings') return '#settings'
	return '#download'
}

function selectProfilesTab(tab: ProfilesTab): void {
	window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(tab)}`)
	window.dispatchEvent(new Event('hashchange'))
}

function hasSeenQueueTabTip(): boolean {
	try {
		return localStorage.getItem(QUEUE_TAB_TIP_STORAGE_KEY) === '1'
	} catch {
		return true
	}
}

function markQueueTabTipSeen(): void {
	try {
		localStorage.setItem(QUEUE_TAB_TIP_STORAGE_KEY, '1')
	} catch {
		// Storage may be unavailable in hardened browser contexts; the cue is non-critical.
	}
}

function profileDetail(profile: DownloadProfile, t: TFunction): string {
	const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} ${t('wizard.confirm.labelSubtitles').toLowerCase()}` : t('wizard.subtitles.noSelected')
	const output = profile.output.kind === 'fixed' ? profile.output.dir : t('wizard.folder.downloads')
	const artifacts = [profile.embed.metadata ? t('wizard.output.embedMetadata.label') : null, profile.embed.thumbnailSidecar ? t('wizard.output.writeThumbnail.label') : null, profile.embed.description ? t('wizard.output.writeDescription.label') : null].filter(Boolean).join(' · ')
	return `${subs} · ${output}${artifacts ? ` · ${artifacts}` : ''}`
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

	if (inputType === 'Mixed URL') {
		return {key: 'mixed', title: 'Mixed URL', body: 'This link points at one video inside a collection. Arroxy will ask which one you want before probing.', points: ['Choose video or collection', 'No silent playlist choice'], image: hiImg}
	}

	if (inputType === 'Single URL') {
		return {key: 'single', title: 'Single URL', body: `Quick starts one download with ${activeProfileName}. Use Interactive for one-off changes.`, points: ['Quick is fastest', 'Interactive can override options'], image: hiImg}
	}

	return {key: 'generic-url', title: 'URL detected', body: t('wizard.url.quickSingleOnly'), points: ['Quick uses the active profile', 'Interactive reviews first'], image: hiImg}
}

function quickDownloadFailureText(t: TFunction, message: QuickDownloadFailureMessage | null): string {
	if (!message) return ''
	switch (message.kind) {
		case 'i18n':
			return t(message.key)
		case 'text':
			return message.text
		case 'bulk-probe': {
			const probeText = formatProbeError(message.error) || t('wizard.url.quickProbeFailed')
			return `${t('wizard.url.quickBulkAllFailed')}: ${probeText}`
		}
		case 'probe':
			return formatProbeError(message.error) || t('wizard.url.quickProbeFailed')
	}
	const exhaustive: never = message
	return exhaustive
}

function QuickDownloadErrorAlert({experience, message, onEnableCookiesAndRetry, onOpenCookiesSettings, onRetry, t}: {experience: ProbeErrorExperience | null; message: string; onEnableCookiesAndRetry: () => void; onOpenCookiesSettings: () => void; onRetry: () => void; t: TFunction}): ReactNode {
	const showBotWallGuidance = experience?.botWall.variant !== undefined && experience.botWall.variant !== 'hidden'
	const showCookiesGuidance = experience?.cookies.variant !== undefined && experience.cookies.variant !== 'hidden'
	return (
		<Alert variant="warning" className="mt-2 py-2" data-testid="quick-download-feedback">
			<AlertDescription className="flex flex-col gap-2 text-[11px] text-current">
				<span>{t('wizard.url.quickFailed', {error: message})}</span>
				<div className="flex flex-wrap gap-2">
					<Button type="button" size="sm" variant="outline" onClick={() => onRetry()} data-testid="quick-download-retry">
						<RefreshCw data-icon="inline-start" />
						{t('common.retry')}
					</Button>
				</div>
				{experience && (showBotWallGuidance || showCookiesGuidance) ? (
					<div className="flex flex-col gap-1.5">
						<BotWallGuidanceAlert guidance={experience.botWall} density="compact" showRetryAction={false} onEnableCookiesAndRetry={onEnableCookiesAndRetry} onRetry={onRetry} enableTestId="quick-download-enable-cookies-retry" />
						<CookiesGuidanceAlert guidance={experience.cookies} density="compact" onOpenSettings={onOpenCookiesSettings} openSettingsTestId="quick-download-cookies-settings" />
					</div>
				) : null}
			</AlertDescription>
		</Alert>
	)
}

function QueueTabFirstRunCue({onDismiss, persistent = false}: {onDismiss: () => void; persistent?: boolean}): ReactNode {
	const {t} = useTranslation()

	useEffect(() => {
		if (persistent) return undefined
		const timeout = window.setTimeout(onDismiss, QUEUE_TAB_TIP_VISIBLE_MS)
		return () => window.clearTimeout(timeout)
	}, [onDismiss, persistent])

	return (
		<div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 justify-center px-3" data-testid="queue-tab-first-run-cue">
			<div className="nudge-in pointer-events-auto flex max-w-[min(20rem,calc(100vw-2rem))] items-end gap-2">
				<img src={downloadingImg} alt="" aria-hidden draggable={false} className="size-10 shrink-0 object-contain" />
				<div className="relative rounded-xl border border-[var(--border-strong)] bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground/85 shadow-lg">
					{t('queue.tabTip')}
					<span aria-hidden className="absolute -top-[6px] start-6 size-0" style={{borderBottom: '6px solid var(--secondary)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent'}} />
				</div>
			</div>
		</div>
	)
}

// react-doctor-disable-next-line react-doctor/prefer-useReducer -- these local UI controls update independently and do not share reducer-style transitions
export function DownloadProfilesHome(): ReactNode {
	const {t} = useTranslation()
	const {
		activeProfileDestination,
		activeProfileDestinationDetail,
		activeProfile,
		chooseWizardFolder,
		commonPaths,
		cookiesConfigDialogIssue,
		dismissCookiesConfigDialog,
		globalDestinationRoot,
		hasActiveDownloads,
		hasInput,
		inputType,
		openCookiesSettings,
		profiles,
		profilesPrefs,
		quickDownload,
		quickDownloadFailureMessage,
		quickDownloadProbeExperience,
		quickDownloadProgressFailed,
		quickDownloadStatus,
		quickPreparing,
		removeDownloadProfile,
		retryQuickDownloadFailure,
		retryQuickDownloadWithCookies,
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
	const [bulkOpen, setBulkOpen] = useState(() => isBrowserMockBulkDialogScenario(initialBrowserMockScenario))
	const [bulkInitialRaw, setBulkInitialRaw] = useState(() => browserMockBulkInitialRaw(initialBrowserMockScenario))
	const [pendingClipboard, setPendingClipboard] = useState<ClipboardCandidate | null>(null)
	const [editorOpen, setEditorOpen] = useState(() => initialBrowserMockScenario === 'profiles-editor')
	const [editorSessionId, setEditorSessionId] = useState(0)
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)
	const queueCount = useAppStore(state => state.queue.length)
	const queueIsActive = useAppStore(state => state.queue.some(item => item.status === 'running' || item.lastStatus?.key === 'movingFiles'))
	const previousQueueCountRef = useRef(queueCount)
	const [showQueueTabTip, setShowQueueTabTip] = useState(() => initialBrowserMockScenario === 'queue-tab-tip' || (queueCount > 0 && !hasSeenQueueTabTip()))
	const quickErrorText = quickDownloadFailureText(t, quickDownloadFailureMessage)
	const showQuickPartialWarning = quickDownloadStatus === 'queued' && quickDownloadProgressFailed > 0
	const mascotHelp = downloadMascotHelp({activeProfileName: activeProfile.name, hasActiveDownloads, hasInput, inputType, quickDownloadStatus, t})
	const showMascotHelp = inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'
	const mascotHeaderBody = showMascotHelp ? mascotHelp.body : t('wizard.url.quickSingleOnly')
	const mascotHeaderImage = showMascotHelp ? mascotHelp.image : hiImg
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}
	const pickProfileRef = (ref: DownloadProfileRef): void => {
		void setActiveDownloadProfile(ref)
	}

	useEffect(() => {
		bulkOpenRef.current = bulkOpen
	}, [bulkOpen])

	useEffect(() => {
		if (!showQueueTabTip || initialBrowserMockScenario === 'queue-tab-tip') return
		markQueueTabTipSeen()
	}, [initialBrowserMockScenario, showQueueTabTip])

	useEffect(() => {
		const previousQueueCount = previousQueueCountRef.current
		previousQueueCountRef.current = queueCount
		if (previousQueueCount !== 0 || queueCount === 0 || hasSeenQueueTabTip()) return
		setShowQueueTabTip(true)
	}, [queueCount])

	const consumeClipboardCandidate = useCallback(
		(candidate: ClipboardCandidate): void => {
			setPendingClipboard(null)
			if (candidate.kind === 'bulk') {
				setBulkInitialRaw(candidate.raw)
				setBulkOpen(true)
				bulkLogger.info('Bulk URLs detected from clipboard', {accepted: candidate.count})
				notify.clipboardAutofilled(t('wizard.url.clipboard.autofilledLinks', {count: candidate.count}))
				return
			}

			const url = candidate.acceptedUrls[0]
			if (!url) return
			setWizardUrl(url)
			notify.clipboardAutofilled(t('wizard.url.clipboard.autofilledLink'))
		},
		[setWizardUrl, t]
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

	const editingProfileOrigin = editingProfile ? downloadProfileOrigin(editingProfile, profilesPrefs) : null
	const editorResetProfile = useMemo(
		() =>
			editingProfile && editingProfileOrigin?.kind === 'builtin'
				? {
						enabled: editingProfileOrigin.overridden,
						onReset: async () => {
							await removeDownloadProfile(editingProfile.id)
						}
					}
				: undefined,
		[editingProfile, editingProfileOrigin, removeDownloadProfile]
	)

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
				<div className="relative z-30 mx-auto flex justify-center">
					<TabsList variant="line" className="download-home-tabs flex justify-center" aria-label="Download profile navigation" data-testid="profiles-tabs">
						<TabsTrigger value="download" className="h-12 flex-1 rounded-full border-0 px-4 text-[14px] data-active:border-transparent">
							<Link2 data-icon="inline-start" aria-hidden />
							{t('wizard.steps.url')}
						</TabsTrigger>
						<TabsTrigger value="queue" data-queue-active={queueIsActive ? 'true' : undefined} className={cn('downloads-tab-trigger h-12 flex-[1.22_1_0] rounded-full border-0 px-3 text-[14px] data-active:border-transparent', queueIsActive && 'queue-tab-working')}>
							<Inbox data-icon="inline-start" aria-hidden />
							{t('queue.tabLabel')}
							{queueCount > 0 ? (
								<Badge variant="secondary" className="download-count-badge ms-0.5 h-4 min-w-4 px-1 font-mono text-[10px]">
									{queueCount}
								</Badge>
							) : null}
						</TabsTrigger>
						<TabsTrigger value="profiles" className="h-12 flex-1 rounded-full border-0 px-4 text-[14px] data-active:border-transparent">
							<Users data-icon="inline-start" aria-hidden />
							{t('wizard.url.tabs.profiles')}
						</TabsTrigger>
						<TabsTrigger value="settings" className="h-12 flex-1 rounded-full border-0 px-4 text-[14px] data-active:border-transparent">
							<Settings data-icon="inline-start" aria-hidden />
							{t('wizard.url.tabs.settings')}
						</TabsTrigger>
					</TabsList>
					{showQueueTabTip ? <QueueTabFirstRunCue persistent={initialBrowserMockScenario === 'queue-tab-tip'} onDismiss={() => setShowQueueTabTip(false)} /> : null}
				</div>

				<TabsContent value="download" className="flex flex-col gap-4">
					<Card className="glow-panel rounded-[1.5rem] border-transparent" data-testid="profiles-download-panel">
						<CardHeader className="px-5 pt-5 md:px-6 md:pt-5">
							<div className="min-w-0">
								<div className="flex min-w-0 items-start gap-3" data-testid="profiles-mascot-header">
									<img src={mascotHeaderImage} alt="" aria-hidden className="mt-0.5 size-12 shrink-0 object-contain sm:size-14" draggable={false} />
									<div className="min-w-0 flex-1">
										<CardTitle className="text-display">{t('wizard.url.heading')}</CardTitle>
										<CardDescription className="mt-1.5 text-body text-[var(--text-subtle)]" data-testid="profiles-mascot-copy">
											{mascotHeaderBody}
										</CardDescription>
									</div>
								</div>
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
							<QuickProfileControl
								defaultProfileMenuOpen={initialBrowserMockScenario === 'profiles-split-menu'}
								destination={activeProfileDestination}
								destinationDetail={activeProfileDestinationDetail}
								disabled={!urlReady || quickPreparing}
								preparing={quickPreparing}
								onChangeGlobalDestination={() => void chooseWizardFolder()}
								onDownload={() => void quickDownload()}
								onEditProfile={openEditor}
								onManageProfiles={() => selectProfilesTab('profiles')}
								onNewProfile={() => openEditor(null)}
								onPickProfile={pickProfileRef}
								profilesPrefs={profilesPrefs}
							/>

							{quickDownloadStatus === 'error' ? <QuickDownloadErrorAlert experience={quickDownloadProbeExperience} message={quickErrorText} onEnableCookiesAndRetry={() => void retryQuickDownloadWithCookies()} onOpenCookiesSettings={openCookiesSettings} onRetry={() => void retryQuickDownloadFailure()} t={t} /> : null}
							{showQuickPartialWarning ? (
								<Alert variant="warning" className="mt-2 py-2" data-testid="quick-download-feedback">
									<AlertDescription className="text-[11px]">{t('wizard.url.quickPartialFailed', {count: quickDownloadProgressFailed})}</AlertDescription>
								</Alert>
							) : null}

							<div className="mt-3 grid w-full gap-2 lg:grid-cols-[repeat(2,minmax(0,35rem))] lg:justify-start" data-testid="profiles-action-rows">
								<ActionRow disabled={!urlReady || quickPreparing} icon={Wand2} title={t('wizard.url.interactiveDownload')} description={t('wizard.url.fetchFormatsTooltip')} onClick={() => void submitUrl()} testId="profiles-interactive-download" />
								<ActionRow icon={ListPlus} title={t('wizard.url.bulkButton')} description={t('wizard.url.bulkTooltip')} onClick={openManualBulkDialog} testId="profiles-bulk-urls" />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="queue">
					<QueueManagerTab />
				</TabsContent>

				<TabsContent value="profiles">
					<ProfilesTab activeProfile={activeProfile} onEdit={openEditor} onPick={activateProfile} onRemove={profile => void removeDownloadProfile(profile.id)} profiles={profiles} profilesPrefs={profilesPrefs} />
				</TabsContent>
				<TabsContent value="settings">
					<DownloadProfilesSettingsTab />
				</TabsContent>
			</Tabs>

			{bulkOpen ? <BulkUrlDialog open={bulkOpen} onOpenChange={handleBulkOpenChange} initialRaw={bulkInitialRaw} onEditProfile={() => openEditor(activeProfile)} onManageProfiles={() => selectProfilesTab('profiles')} onNewProfile={() => openEditor(null)} /> : null}
			{editorOpen ? (
				<Suspense
					fallback={
						<output className="fixed inset-0 z-50 grid place-items-center bg-background/35" aria-label={t('wizard.formats.loadingAria')}>
							<Spinner className="size-5 text-[var(--brand)]" aria-hidden />
						</output>
					}
				>
					<DownloadProfileEditor
						key={editorSessionId}
						commonPaths={commonPaths}
						globalDestination={globalDestinationRoot}
						initialProfile={editingProfile}
						onChangeGlobalDestination={() => chooseWizardFolder()}
						open={editorOpen}
						onOpenChange={setEditorOpen}
						onSave={profile => saveDownloadProfile(profile)}
						resetProfile={editorResetProfile}
					/>
				</Suspense>
			) : null}
			<IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
		</div>
	)
}

function ClipboardPendingAction({candidate, onApply, onDismiss}: {candidate: ClipboardCandidate; onApply: () => void; onDismiss: () => void}): ReactNode {
	const {t} = useTranslation()
	const isBulk = candidate.kind === 'bulk'
	const Icon = isBulk ? ListPlus : Link2
	const statusLabel = isBulk ? t('wizard.url.clipboard.pendingLinksReady', {count: candidate.count}) : t('wizard.url.clipboard.pendingLinkReady')
	const actionLabel = isBulk ? t('wizard.url.clipboard.openCopiedLinks', {count: candidate.count}) : t('wizard.url.clipboard.useCopiedLink')
	return (
		<output className="mt-2 flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-[var(--glow-border)] bg-[var(--brand-dim)] px-3 py-2 text-[12px] text-foreground" data-testid="clipboard-pending">
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<Icon className="size-3.5 shrink-0 text-[var(--brand)]" aria-hidden />
				<span className="min-w-0 truncate">{statusLabel}</span>
			</span>
			<Button type="button" variant="outline" size="xs" onClick={onApply} data-testid="clipboard-pending-action" className="bg-background/50">
				{actionLabel}
			</Button>
			<Button type="button" variant="ghost" size="icon-xs" onClick={onDismiss} aria-label={t('wizard.url.clipboard.dismissCopiedLink')} data-testid="clipboard-pending-dismiss" className="-me-1">
				<X aria-hidden />
			</Button>
		</output>
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
					<CardTitle className="text-xl font-semibold leading-tight">{t('wizard.url.profile.panelTitle')}</CardTitle>
					<CardDescription className="mt-1 text-[12px] text-[var(--text-subtle)]">{t('wizard.url.profile.panelDescription')}</CardDescription>
				</div>
				<Button type="button" onClick={() => onEdit(null)} className="shadow-[0_4px_14px_var(--brand-glow)]">
					<Plus data-icon="inline-start" />
					{t('wizard.url.profile.newProfile')}
				</Button>
			</CardHeader>
			<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{profiles.map(profile => {
					const Icon = PROFILE_ICONS[profile.icon]
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
										<Badge variant={isCustom || origin.overridden ? 'outline' : 'secondary'}>{isCustom ? t('wizard.url.profile.badgeCustom') : origin.overridden ? t('wizard.url.profile.badgeModified') : t('wizard.url.profile.badgeBuiltIn')}</Badge>
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
									{t('wizard.url.profile.edit')}
								</Button>
								<Button type="button" variant="outline" size="sm" disabled={!canRemove} onClick={() => onRemove(profile)}>
									<X data-icon="inline-start" />
									{isCustom ? t('wizard.url.profile.remove') : t('wizard.url.profile.reset')}
								</Button>
							</div>
						</article>
					)
				})}
			</CardContent>
		</Card>
	)
}

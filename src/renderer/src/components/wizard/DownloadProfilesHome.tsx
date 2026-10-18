import {useRef, type ClipboardEvent, type KeyboardEvent, type ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {Check, ChevronRight, Link2, ListPlus, PenLine, Plus, Wand2, X, type LucideIcon} from 'lucide-react'
import {downloadProfileLabel, downloadProfileOrigin, downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useDownloadHomeView, type DownloadHomeView, type DownloadInputType} from '../../store/downloadHomeView.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Switch} from '../ui/switch.js'
import {Tabs, TabsContent} from '../ui/tabs.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {BulkUrlDialog} from './BulkUrlDialog.js'
import {DownloadProfilesSettingsTab} from './DownloadProfilesSettingsTab.js'
import {IncompleteCookiesConfigDialog} from './IncompleteCookiesConfigDialog.js'
import {QuickProfileControl} from './QuickProfileControl.js'
import {QueueManagerTab} from '../queue/QueueManagerTab.js'
import {ExploreTab} from '../explore/ExploreTab.js'
import type {ClipboardCandidate} from './clipboardIntake.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {QuickDownloadErrorAlert} from './QuickDownloadErrorAlert.js'
import {HomeTabsList, QueueTabFirstRunCue} from './DownloadHomeTabs.js'
import {isProfilesTab, selectProfilesTab, useProfilesTabRoute, useQueueTabSummary, useQueueTabTip} from './homeTabRoute.js'
import {useBulkUrlDialog, useClipboardIntake} from './downloadHomeIntake.js'
import {ProfileEditorDialog} from './ProfileEditorDialog.js'
import {useProfileEditor} from './useProfileEditor.js'
import hiImg from '../../assets/Hi.png'
import downloadingImg from '../../assets/Downloading.png'
import {IconTile} from '../shared/IconTile.js'

function browserMockScenarioId(): string | null {
	try {
		return new URLSearchParams(window.location.search).get('scenario')
	} catch {
		return null
	}
}

function profileDetail(profile: DownloadProfile, t: TFunction): string {
	const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} ${t('wizard.confirm.labelSubtitles').toLowerCase()}` : t('wizard.subtitles.noSelected')
	const output = profile.output.kind === 'fixed' ? profile.output.dir : t('wizard.folder.downloads')
	const artifacts = [
		profile.embed.metadata ? t('wizard.output.embedMetadata.label') : null,
		profile.embed.thumbnail ? t('wizard.output.embedThumbnail.label') : null,
		profile.embed.thumbnailSidecar ? t('wizard.output.writeThumbnail.label') : null,
		profile.embed.description ? t('wizard.output.writeDescription.label') : null
	]
		.filter(Boolean)
		.join(' · ')
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

export function DownloadProfilesHome(): ReactNode {
	const view = useDownloadHomeView()
	const {activeProfile, cookiesConfigDialogIssue, dismissCookiesConfigDialog, openCookiesSettings, profiles, profilesPrefs, removeDownloadProfile, setActiveDownloadProfile, setDownloadProfileEnabled, setWizardUrl} = view
	const initialBrowserMockScenario = browserMockScenarioId()
	const {activeTab, exploreEnabled, compact} = useProfilesTabRoute()
	const exploreNoticeSeen = useAppStore(state => state.settings?.common?.exploreNoticeSeen === true)
	const {queueCount, attentionCount, queueIsActive} = useQueueTabSummary()
	const bulkDialog = useBulkUrlDialog(initialBrowserMockScenario)
	const {queueTabTipVisible, dismissQueueTabTip} = useQueueTabTip({activeTab, initialBrowserMockScenario})
	const clipboard = useClipboardIntake({bulkOpenRef: bulkDialog.bulkOpenRef, setWizardUrl})
	const editor = useProfileEditor({initialBrowserMockScenario, profilesPrefs, removeDownloadProfile})
	const {openEditor} = editor
	const manageProfiles = (): void => selectProfilesTab('profiles')
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}

	function openManualBulkDialog(): void {
		clipboard.setPendingClipboard(null)
		bulkDialog.openBulkDialog()
	}

	function handleTabChange(value: unknown): void {
		if (!isProfilesTab(value)) return
		if (value !== 'download') clipboard.setPendingClipboard(null)
		selectProfilesTab(value)
	}

	const tabsList = <HomeTabsList compact={compact} exploreEnabled={exploreEnabled} exploreNoticeSeen={exploreNoticeSeen} queueCount={queueCount} attentionCount={attentionCount} queueIsActive={queueIsActive} />

	return (
		<div className={cn('wizard-step mx-auto flex w-full max-w-[92rem] flex-col gap-4', compact ? 'pb-2' : 'pb-5')} data-testid="download-profiles-home">
			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				// Explore's browser fills the remaining height; the other tabs size to their content.
				className={cn('gap-4', activeTab === 'explore' && 'flex-1')}
			>
				{compact ? null : (
					<div className="download-home-tabs-frame relative z-30 flex w-full justify-center">
						{tabsList}
						{queueTabTipVisible ? <QueueTabFirstRunCue persistent={initialBrowserMockScenario === 'queue-tab-tip'} onDismiss={dismissQueueTabTip} /> : null}
					</div>
				)}

				<TabsContent value="download" className="flex flex-col gap-4">
					<DownloadTabPanel
						view={view}
						initialBrowserMockScenario={initialBrowserMockScenario}
						pendingClipboard={clipboard.pendingClipboard}
						onConsumeClipboard={clipboard.consumeClipboardCandidate}
						onDismissClipboard={() => clipboard.setPendingClipboard(null)}
						onEditProfile={openEditor}
						onManageProfiles={manageProfiles}
						onOpenBulk={openManualBulkDialog}
					/>
				</TabsContent>

				{exploreEnabled ? (
					<TabsContent value="explore" className="flex min-h-0 flex-col">
						<ExploreTab compactTabs={compact ? tabsList : null} onEditProfile={openEditor} onNewProfile={() => openEditor(null)} onManageProfiles={manageProfiles} />
					</TabsContent>
				) : null}

				<TabsContent value="queue">
					<QueueManagerTab />
				</TabsContent>

				<TabsContent value="profiles">
					<ProfilesTab activeProfile={activeProfile} onEdit={openEditor} onPick={activateProfile} onRemove={profile => void removeDownloadProfile(profile.id)} onToggleEnabled={(id, enabled) => void setDownloadProfileEnabled(id, enabled)} profiles={profiles} profilesPrefs={profilesPrefs} />
				</TabsContent>
				<TabsContent value="settings">
					<DownloadProfilesSettingsTab />
				</TabsContent>
			</Tabs>

			{bulkDialog.bulkOpen ? <BulkUrlDialog open={bulkDialog.bulkOpen} onOpenChange={bulkDialog.handleBulkOpenChange} initialRaw={bulkDialog.bulkInitialRaw} onEditProfile={() => openEditor(activeProfile)} onManageProfiles={manageProfiles} onNewProfile={() => openEditor(null)} /> : null}
			<ProfileEditorDialog editor={editor} view={view} />
			<IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
		</div>
	)
}

interface DownloadTabPanelProps {
	view: DownloadHomeView
	initialBrowserMockScenario: string | null
	pendingClipboard: ClipboardCandidate | null
	onConsumeClipboard: (candidate: ClipboardCandidate) => void
	onDismissClipboard: () => void
	onEditProfile: (profile: DownloadProfile | null) => void
	onManageProfiles: () => void
	onOpenBulk: () => void
}

// The URL tab: paste a link, then download it with the active profile, review
// it in the wizard, or open the bulk dialog.
function DownloadTabPanel({view, initialBrowserMockScenario, pendingClipboard, onConsumeClipboard, onDismissClipboard, onEditProfile, onManageProfiles, onOpenBulk}: DownloadTabPanelProps): ReactNode {
	const {t} = useTranslation()
	const {activeProfileDestination, activeProfileDestinationDetail, chooseWizardFolder, profilesPrefs, quickDownload, setActiveDownloadProfile, submitUrl, urlReady, wizardUrl} = view
	const pickProfileRef = (ref: DownloadProfileRef): void => {
		void setActiveDownloadProfile(ref)
	}
	return (
		<Card variant="glass" data-testid="profiles-download-panel">
			<CardHeader className="px-5 pt-5 md:px-6 md:pt-5">
				<div className="min-w-0">
					<DownloadMascotHeader view={view} />
					<DownloadUrlInput view={view} pendingClipboard={pendingClipboard} onConsumeClipboard={onConsumeClipboard} />
					{pendingClipboard ? <ClipboardPendingAction onApply={() => onConsumeClipboard(pendingClipboard)} onDismiss={onDismissClipboard} /> : null}
				</div>
			</CardHeader>
			<CardContent className="px-5 pb-4 md:px-6">
				<QuickProfileControl
					defaultProfileMenuOpen={initialBrowserMockScenario === 'profiles-split-menu'}
					destination={activeProfileDestination}
					destinationDetail={activeProfileDestinationDetail}
					disabled={!urlReady}
					onChangeGlobalDestination={() => void chooseWizardFolder()}
					onDownload={() => void quickDownload({url: wizardUrl, entry: 'url-tab'})}
					onEditProfile={onEditProfile}
					onManageProfiles={onManageProfiles}
					onNewProfile={() => onEditProfile(null)}
					onPickProfile={pickProfileRef}
					profilesPrefs={profilesPrefs}
				/>

				<QuickDownloadFeedback view={view} />

				<div className="mt-3 grid w-full gap-2 lg:grid-cols-[repeat(2,minmax(0,35rem))] lg:justify-start" data-testid="profiles-action-rows">
					<ActionRow disabled={!urlReady} icon={Wand2} title={t('wizard.url.interactiveDownload')} description={t('wizard.url.fetchFormatsTooltip')} onClick={() => void submitUrl()} testId="profiles-interactive-download" />
					<ActionRow icon={ListPlus} title={t('wizard.url.bulkButton')} description={t('wizard.url.bulkTooltip')} onClick={onOpenBulk} testId="profiles-bulk-urls" />
				</div>
			</CardContent>
		</Card>
	)
}

function DownloadMascotHeader({view}: {view: DownloadHomeView}): ReactNode {
	const {t} = useTranslation()
	const {activeProfile, hasActiveDownloads, hasInput, inputType, quickDownloadStatus} = view
	const mascotHelp = downloadMascotHelp({activeProfileName: activeProfile.name, hasActiveDownloads, hasInput, inputType, quickDownloadStatus, t})
	const showMascotHelp = inputType !== 'Unknown URL' && inputType !== 'Unsupported URL'
	const mascotHeaderBody = showMascotHelp ? mascotHelp.body : t('wizard.url.quickSingleOnly')
	const mascotHeaderImage = showMascotHelp ? mascotHelp.image : hiImg
	return (
		<div className="flex min-w-0 items-start gap-3" data-testid="profiles-mascot-header">
			<img src={mascotHeaderImage} alt="" aria-hidden className="mt-0.5 size-12 shrink-0 object-contain sm:size-14" draggable={false} />
			<div className="min-w-0 flex-1">
				<CardTitle className="text-display">{t('wizard.url.heading')}</CardTitle>
				<CardDescription className="mt-1.5 text-body text-subtle-foreground" data-testid="profiles-mascot-copy">
					{mascotHeaderBody}
				</CardDescription>
			</div>
		</div>
	)
}

function DownloadUrlInput({view, pendingClipboard, onConsumeClipboard}: {view: DownloadHomeView; pendingClipboard: ClipboardCandidate | null; onConsumeClipboard: (candidate: ClipboardCandidate) => void}): ReactNode {
	const {t} = useTranslation()
	const {hasInput, setWizardUrl, submitUrl, urlReady, wizardUrl} = view
	const inputRef = useRef<HTMLInputElement>(null)

	function handleClearUrl(): void {
		setWizardUrl('')
		if (pendingClipboard) {
			onConsumeClipboard(pendingClipboard)
			return
		}
		inputRef.current?.focus()
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (event.key === 'Enter' && urlReady) {
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
	)
}

function QuickDownloadFeedback({view}: {view: DownloadHomeView}): ReactNode {
	const {t} = useTranslation()
	const {openCookiesSettings, openExploreSignIn, quickDownloadFailureMessage, quickDownloadProbeExperience, quickDownloadProgressFailed, quickDownloadStatus, retryQuickDownloadFailure, retryQuickDownloadWithCookies, retryWithExploreSignIn, signInWithExploreThenRetry} = view
	const showQuickPartialWarning = quickDownloadStatus === 'queued' && quickDownloadProgressFailed > 0
	return (
		<>
			{quickDownloadStatus === 'error' ? (
				<QuickDownloadErrorAlert
					className="mt-2"
					experience={quickDownloadProbeExperience}
					message={quickDownloadFailureMessage}
					onEnableCookiesAndRetry={() => void retryQuickDownloadWithCookies()}
					onOpenCookiesSettings={openCookiesSettings}
					onSignInWithExplore={openExploreSignIn}
					onSignInWithExploreThenRetry={() => void signInWithExploreThenRetry({kind: 'home'})}
					onRetryWithExploreSignIn={() => void retryWithExploreSignIn({kind: 'home'})}
					onRetry={() => void retryQuickDownloadFailure()}
				/>
			) : null}
			{showQuickPartialWarning ? (
				<Alert variant="warning" size="sm" className="mt-2" data-testid="quick-download-feedback">
					<AlertDescription>{t('wizard.url.quickPartialFailed', {count: quickDownloadProgressFailed})}</AlertDescription>
				</Alert>
			) : null}
		</>
	)
}

function ClipboardPendingAction({onApply, onDismiss}: {onApply: () => void; onDismiss: () => void}): ReactNode {
	const {t} = useTranslation()
	const Icon = Link2
	const statusLabel = t('wizard.url.clipboard.pendingLinkReady')
	const actionLabel = t('wizard.url.clipboard.useCopiedLink')
	return (
		<output className="mt-2 flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-[var(--glow-border)] bg-primary/12 px-3 py-2 text-xs text-foreground" data-testid="clipboard-pending">
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
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
			className="glow-tile h-auto min-h-14 justify-start gap-3 whitespace-normal rounded-lg border-transparent px-4 py-2 text-left transition-[filter,transform] duration-200 hover:bg-transparent hover:brightness-(--hover-brightness) active:translate-y-px"
		>
			<IconTile tone="lit">
				<Icon />
			</IconTile>
			<span className="flex min-w-0 flex-1 flex-col items-start">
				<span className="text-title">{title}</span>
				<span className="text-xs font-normal text-muted-foreground">{description}</span>
			</span>
			<ChevronRight className="ms-auto text-muted-foreground" aria-hidden />
		</Button>
	)
}

function ProfilesTab({
	activeProfile,
	onEdit,
	onPick,
	onRemove,
	onToggleEnabled,
	profiles,
	profilesPrefs
}: {
	activeProfile: DownloadProfile
	onEdit: (profile: DownloadProfile | null) => void
	onPick: (profile: DownloadProfile) => void
	onRemove: (profile: DownloadProfile) => void
	onToggleEnabled: (id: string, enabled: boolean) => void
	profiles: DownloadProfile[]
	profilesPrefs: DownloadProfilesPrefs | undefined
}): ReactNode {
	const {t} = useTranslation()
	const enabledCount = profiles.filter(profile => profile.enabled).length
	return (
		<Card variant="glass" data-testid="profiles-manage-tab">
			<CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="text-xl font-semibold leading-tight">{t('wizard.url.profile.panelTitle')}</CardTitle>
					<CardDescription className="mt-1 text-xs text-subtle-foreground">{t('wizard.url.profile.panelDescription')}</CardDescription>
					<p className="mt-1 text-caption text-subtle-foreground">{t('wizard.url.profile.enableHint')}</p>
				</div>
				<Button variant="glow" type="button" onClick={() => onEdit(null)}>
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
					const canToggleOff = profile.enabled ? enabledCount > 1 : true
					return (
						<article
							key={profile.id}
							data-active={active ? 'true' : undefined}
							data-selected={active || undefined}
							data-disabled-profile={!profile.enabled ? 'true' : undefined}
							className={cn('choice-surface rounded-lg p-3', !profile.enabled && 'opacity-60 saturate-[0.7]')}
							data-testid={`profiles-manage-card-${profile.id}`}
						>
							<button
								type="button"
								className="flex w-full items-start gap-3 text-left"
								aria-pressed={active}
								aria-disabled={!profile.enabled}
								onClick={() => {
									if (!profile.enabled) return
									onPick(profile)
								}}
								data-testid={`profiles-manage-card-${profile.id}-picker`}
							>
								<IconTile>
									<Icon />
								</IconTile>
								<span className="min-w-0 flex-1" data-testid={`profiles-manage-card-${profile.id}-summary`}>
									<span className="flex items-center gap-2" data-testid={`profiles-manage-card-${profile.id}-title-row`}>
										<span className="truncate text-sm font-semibold" data-testid={`profiles-manage-card-${profile.id}-title`}>
											{profile.name}
										</span>
										<Badge variant={isCustom || origin.overridden ? 'outline' : 'secondary'}>{isCustom ? t('wizard.url.profile.badgeCustom') : origin.overridden ? t('wizard.url.profile.badgeModified') : t('wizard.url.profile.badgeBuiltIn')}</Badge>
										{!profile.enabled ? <Badge variant="outline">{t('wizard.url.profile.badgeDisabled')}</Badge> : null}
										<Check className={cn('ms-auto size-4 shrink-0 text-primary transition-opacity duration-150', active ? 'opacity-100' : 'opacity-0')} aria-hidden data-testid={`profiles-manage-card-${profile.id}-check`} />
									</span>
									<span className="mt-1 block text-xs text-subtle-foreground" data-testid={`profiles-manage-card-${profile.id}-description`}>
										{downloadProfileLabel(profile)}
									</span>
									<span className="block text-xs text-subtle-foreground" data-testid={`profiles-manage-card-${profile.id}-detail`}>
										{profileDetail(profile, t)}
									</span>
								</span>
							</button>
							<div className="mt-3 flex items-center gap-2" data-testid={`profiles-manage-card-${profile.id}-actions`}>
								<div className="grid flex-1 grid-cols-2 gap-2">
									<Button type="button" variant="outline" size="sm" onClick={() => onEdit(profile)}>
										<PenLine data-icon="inline-start" />
										{t('wizard.url.profile.edit')}
									</Button>
									<Button type="button" variant="outline" size="sm" disabled={!canRemove} onClick={() => onRemove(profile)}>
										<X data-icon="inline-start" />
										{isCustom ? t('wizard.url.profile.remove') : t('wizard.url.profile.reset')}
									</Button>
								</div>
								<Tooltip>
									<TooltipTrigger
										render={props => (
											<span {...props} className="inline-flex">
												<Switch
													checked={profile.enabled}
													disabled={!canToggleOff}
													onCheckedChange={next => {
														if (!canToggleOff && profile.enabled) return
														onToggleEnabled(profile.id, next)
													}}
													aria-label={t('wizard.url.profile.enableToggleAria', {profileName: profile.name})}
													data-testid={`profiles-manage-card-${profile.id}-enabled-toggle`}
												/>
											</span>
										)}
									/>
									{!canToggleOff ? <TooltipContent>{t('wizard.url.profile.lastEnabledHint')}</TooltipContent> : null}
								</Tooltip>
							</div>
						</article>
					)
				})}
			</CardContent>
		</Card>
	)
}

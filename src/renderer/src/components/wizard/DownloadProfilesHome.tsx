import {useRef, type ClipboardEvent, type KeyboardEvent, type ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {ChevronRight, Link2, ListPlus, Wand2, X, type LucideIcon} from 'lucide-react'
import {downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useDownloadHomeView, type DownloadHomeView, type DownloadInputType} from '../../store/downloadHomeView.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Tabs, TabsContent} from '../ui/tabs.js'
import {BulkUrlDialog} from './BulkUrlDialog.js'
import {DownloadProfilesSettingsTab} from './DownloadProfilesSettingsTab.js'
import {ProfilesManageTab} from './DownloadProfilesManageTab.js'
import {IncompleteCookiesConfigDialog} from './IncompleteCookiesConfigDialog.js'
import {QuickProfileControl} from './QuickProfileControl.js'
import {QueueManagerTab} from '../queue/QueueManagerTab.js'
import {ExploreTab} from '../explore/ExploreTab.js'
import {QuickDownloadErrorAlert} from './QuickDownloadErrorAlert.js'
import {HomeTabsList, QueueTabFirstRunCue} from './DownloadHomeTabs.js'
import {isProfilesTab, selectProfilesTab, useProfilesTabRoute, useQueueTabSummary, useQueueTabTip} from './homeTabRoute.js'
import {useBulkUrlDialog, useCopiedLinkIntake} from './downloadHomeIntake.js'
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
	const {activeProfile, cookiesConfigDialogIssue, dismissCookiesConfigDialog, moveDownloadProfile, openCookiesSettings, profiles, profilesPrefs, removeDownloadProfile, setActiveDownloadProfile, setDownloadProfileEnabled, setWizardUrl} = view
	const initialBrowserMockScenario = browserMockScenarioId()
	const {activeTab, exploreEnabled, compact} = useProfilesTabRoute()
	const exploreNoticeSeen = useAppStore(state => state.settings?.common?.exploreNoticeSeen === true)
	const {queueCount, attentionCount, queueIsActive} = useQueueTabSummary()
	const bulkDialog = useBulkUrlDialog(initialBrowserMockScenario)
	const {queueTabTipVisible, dismissQueueTabTip} = useQueueTabTip({activeTab, initialBrowserMockScenario})
	useCopiedLinkIntake({bulkOpen: bulkDialog.bulkOpen, downloadTabActive: activeTab === 'download', setWizardUrl})
	const editor = useProfileEditor({initialBrowserMockScenario, profilesPrefs, removeDownloadProfile})
	const {openEditor} = editor
	const manageProfiles = (): void => selectProfilesTab('profiles')
	const activateProfile = (profile: DownloadProfile): void => {
		void setActiveDownloadProfile(downloadProfileRefFor(profile, profilesPrefs))
	}

	function handleTabChange(value: unknown): void {
		if (!isProfilesTab(value)) return
		selectProfilesTab(value)
	}

	const tabsList = <HomeTabsList compact={compact} exploreEnabled={exploreEnabled} exploreNoticeSeen={exploreNoticeSeen} queueCount={queueCount} attentionCount={attentionCount} queueIsActive={queueIsActive} />

	return (
		<div className={cn('wizard-step mx-auto flex w-full flex-col gap-4', activeTab === 'explore' ? 'max-w-none' : 'max-w-[92rem]', compact ? 'pb-2' : 'pb-5')} data-testid="download-profiles-home">
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
					<DownloadTabPanel view={view} initialBrowserMockScenario={initialBrowserMockScenario} onEditProfile={openEditor} onManageProfiles={manageProfiles} onOpenBulk={bulkDialog.openBulkDialog} />
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
					<ProfilesManageTab
						activeProfile={activeProfile}
						onEdit={openEditor}
						onMove={(id, targetId) => void moveDownloadProfile(id, targetId)}
						onPick={activateProfile}
						onRemove={profile => void removeDownloadProfile(profile.id)}
						onToggleEnabled={(id, enabled) => void setDownloadProfileEnabled(id, enabled)}
						profiles={profiles}
						profilesPrefs={profilesPrefs}
					/>
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
	onEditProfile: (profile: DownloadProfile | null) => void
	onManageProfiles: () => void
	onOpenBulk: () => void
}

// The URL tab: paste a link, then download it with the active profile, review
// it in the wizard, or open the bulk dialog.
function DownloadTabPanel({view, initialBrowserMockScenario, onEditProfile, onManageProfiles, onOpenBulk}: DownloadTabPanelProps): ReactNode {
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
					<DownloadUrlInput view={view} />
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

function DownloadUrlInput({view}: {view: DownloadHomeView}): ReactNode {
	const {t} = useTranslation()
	const {hasInput, setWizardUrl, submitUrl, urlReady, wizardUrl} = view
	const inputRef = useRef<HTMLInputElement>(null)

	function handleClearUrl(): void {
		setWizardUrl('')
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
					url={view.quickDownloadFailure?.kind === 'bulk-probe' ? view.quickDownloadFailure.errorUrl : (view.quickDownloadFailure?.urls[0] ?? null)}
					onEnableCookiesAndRetry={() => void retryQuickDownloadWithCookies()}
					onOpenCookiesSettings={openCookiesSettings}
					onSignInWithExplore={openExploreSignIn}
					onSignInWithExploreThenRetry={site => void signInWithExploreThenRetry({kind: 'home'}, site)}
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

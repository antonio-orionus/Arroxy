import type {StoreApi} from 'zustand'
import type {
	AppSettings,
	AudioBitrate,
	BulkMetadataCancelReason,
	BulkMetadataItemStatus,
	BulkMetadataStatus,
	CookiesBrowser,
	CookiesMode,
	DependencyDiagnostic,
	DependencyId,
	DownloadProfile,
	DownloadProfileRef,
	ExploreViewState,
	FormatOption,
	GraphicsPolicy,
	HotkeyAccelerator,
	HotkeyRegistrationStatus,
	NativeAudioPreference,
	HdrSetting,
	PlaylistEntry,
	PlaylistProbeResult,
	PlaylistScope,
	PlaylistSelection,
	PlaylistSortMode,
	ProbeError,
	ProbePlaylistMode,
	ProbeProgressEvent,
	ProbeInfoJsonRef,
	ProbeDegradationReason,
	SiteCooldown,
	JobAuth,
	QueueItem,
	QueueLane,
	QueueOutputTargetChangeResult,
	QueueSelectionAction,
	QueueSelectionCommandResult,
	QuickDownloadProgressPhase,
	QuickDownloadStatus,
	SubtitleFormat,
	SubtitleMap,
	SubtitleMode,
	SponsorBlockMode,
	SponsorBlockCategory,
	SupportedLang,
	UiStyle,
	UiTheme,
	VideoChapter,
	WizardMode,
	WizardStepName
} from '@shared/types.js'
import type {Result} from '@shared/result.js'
import type {AudioSelection, FormatMode, VideoFileType, WizardMediaKind} from '@shared/schemas.js'
import type {FitNotice} from '@shared/profileSelection.js'
import type {SelectionOrder} from '@shared/selectionOrder.js'
import type {VideoPartFields} from '@shared/videoPart.js'
import type {ReviewRow, WizardSettingsSnapshot} from './wizard/profileApplication.js'
import type {IncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {QuickDownloadFailure} from './wizard/quickDownloadFeedback.js'
export type {AudioSelection}
export type {BulkMetadataCancelReason, BulkMetadataItemStatus, BulkMetadataStatus, WizardMode} from '@shared/types.js'
// WizardStep is a plain alias of the shared WizardStepName (schemas.ts is the
// single source of truth for the step list) — kept under its own name here
// since every renderer file already imports it as WizardStep.
export type WizardStep = WizardStepName
export type AdvancedSettingsTarget = 'cookies' | 'network' | 'hotkey'
// `url-tab` / `explore`: a quick download asked, and its answer places the row.
export type MixedUrlPromptSource = 'wizard' | 'url-tab' | 'explore'
// The home tab a wizard run started from, and lands back on when it ends.
export type WizardOrigin = 'download' | 'explore'

// Explicit mode tag so consumers don't re-derive intent from
// `playlistItems.length > 0`. `single` = format-probe flow; `playlist` =
// flat-probe + preset flow. Set on probe entry, cleared on reset.
export type SetState = StoreApi<AppState>['setState']
export type GetState = StoreApi<AppState>['getState']

// Wizard state is split across four cohesive slices. Each owns a subset of
// fields + actions. AppState below sums them. Components subscribe to flat
// fields (selector at consumption); the split is about source-of-ownership
// for maintainers, not a re-render boundary.

// ProbeOrchestrator — URL → probe pipeline + step-graph navigation +
// playlist enumeration. Owns wizardStep (the canonical "where am I").
export interface ProbeOrchestratorSlice {
	wizardStep: WizardStep
	wizardOrigin: WizardOrigin
	wizardMode: WizardMode
	wizardUrl: string
	wizardTitle: string
	wizardThumbnail: string
	wizardDuration?: number
	// Fields a filename template may name a *directory* after. Arroxy renders
	// directory segments itself (it needs the path before the download starts),
	// so these must be in state rather than left to yt-dlp. Empty when the
	// extractor did not supply one — the segment then collapses.
	wizardVideoId: string
	wizardUploader: string
	wizardUploadDate: string
	wizardFormatsDegraded: {reasons: ProbeDegradationReason[]} | null
	// yt-dlp's IE_NAME for the URL just probed (e.g. 'youtube', 'vimeo'). Used to
	// gate YT-only UI (SponsorBlock step, ban warning) and threaded into PreparedJob
	// so the download path can branch identically.
	wizardExtractor: string
	wizardExtractorKey: string
	// The webpage URL the extractor reports — used to render "Cookies for {host}"
	// dynamically. Empty pre-probe.
	wizardWebpageUrl: string
	wizardProbeInfoJsonRef?: ProbeInfoJsonRef
	// The single-video probe's auth; the queued item inherits it.
	wizardProbeAuth?: JobAuth
	formatsLoading: boolean
	wizardError: ProbeError | null
	wizardErrorOrigin: 'formats' | null
	// Playlist mode — populated when the URL probe returns _type: 'playlist' or
	// 'multi_video' from yt-dlp.
	playlistItems: PlaylistEntry[]
	selectedPlaylistItemIds: string[]
	playlistTitle: string
	playlistId: string
	playlistIsMultiVideo: boolean
	playlistLikelyCapped: boolean
	playlistProbeLoading: boolean
	playlistProbeProgress: ProbeProgressEvent | null
	playlistScopeReloading: boolean
	playlistScopeError: string | null
	playlistScope: PlaylistScope
	playlistSelection: PlaylistSelection | null
	// View-only sort for the playlist picker. Never recomputed onto entries:
	// `id` and `playlistIndex` stay probe-order identity so selection survives
	// sort changes. Submission numbers 001..N over the sorted selected set.
	playlistSortMode: PlaylistSortMode
	multiProfileMode: boolean
	playlistProfileAssignments: Record<string, DownloadProfileRef>
	removedPlaylistItemIds: string[]
	// The subset of removedPlaylistItemIds that was checked (in
	// selectedPlaylistItemIds) at the moment it was removed. removePlaylistItems
	// unconditionally strips removed ids out of selectedPlaylistItemIds, so
	// restoreRemovedPlaylistItems needs this to know which ones to re-check —
	// without it, Restore would either do nothing (never re-selects) or
	// re-check rows the user had deliberately left unchecked.
	removedSelectionIds: string[]
	bulkMetadataStatus: BulkMetadataStatus
	bulkMetadataCompleted: number
	bulkMetadataTotal: number
	bulkMetadataById: Record<string, BulkMetadataItemStatus>
	quickDownloadStatus: QuickDownloadStatus
	quickDownloadFailure: QuickDownloadFailure | null
	quickDownloadQueueIds: string[]
	quickDownloadProgressPhase: QuickDownloadProgressPhase
	quickDownloadProgressTotal: number
	quickDownloadProgressCompleted: number
	quickDownloadProgressFailed: number
	quickDownloadProgressCurrent: string | null
	quickDownloadProgressTitle: string | null
	quickDownloadProgressRunId: number | null
	// The needs-choice row this wizard run is the review of (P2-R40). The row
	// stays until the run queues, which then replaces it. It lives exactly as
	// long as the run: retries keep it; a new run (a URL submitted, a Bulk run,
	// another Review) and every exit (Back home, Start over, cookie settings,
	// Explore sign-in) clear it and leave the row waiting.
	reviewSourceRowId: string | null
	// The single-video Review row that is open (one at a time), if any.
	wizardReviewRow: ReviewRow | null

	// videoIds matched on disk by the last folder scan
	syncedDownloadedIds: string[]
	// Folder-scan lifecycle: 'idle' before any scan, 'scanning' while in flight,
	// 'done' once a result is available (drives the sync alert in StepPlaylistItems).
	syncScanState: 'idle' | 'scanning' | 'done'

	setWizardUrl: (url: string) => void
	submitUrl: (origin?: WizardOrigin) => Promise<void>
	quickDownloadUrls: (urls: string[]) => Promise<void>
	// Bulk URLs' failure alert on the URL tab.
	retryQuickDownloadFailure: () => Promise<void>
	retryQuickPlaylistCap: () => Promise<void>
	retryQuickDownloadWithCookies: () => Promise<void>
	cancelQuickDownload: () => void
	dismissQuickDownloadFailure: () => void
	startBulkUrls: (urls: string[]) => void
	cancelBulkMetadata: (reason?: BulkMetadataCancelReason) => void
	dismissMixedPrompt: (choice: 'video' | 'playlist') => Promise<void>
	setPlaylistItemSelected: (id: string, checked: boolean) => void
	setPlaylistScope: (scope: PlaylistScope) => void
	reloadPlaylistWithScope: (scope: PlaylistScope) => Promise<void>
	selectAllPlaylistItems: () => void
	selectNonePlaylistItems: () => void
	selectPlaylistRange: (from: number, to: number) => void
	confirmPlaylistSelection: () => void
	setPlaylistSelection: (s: PlaylistSelection) => void
	setPlaylistSortMode: (mode: PlaylistSortMode) => void
	enterMultiProfileMode: () => void
	exitMultiProfileMode: () => void
	assignPlaylistProfile: (itemIds: string[], ref: DownloadProfileRef) => void
	resetPlaylistProfile: (itemIds: string[]) => void
	removePlaylistItems: (itemIds: string[]) => void
	restoreRemovedPlaylistItems: () => void
	scanDownloadedInFolder: () => Promise<void>
	applyFolderSync: () => void
	advance: () => void
	back: () => void
	skipToConfirm: () => void
	// Jumps to a visible step the user has already passed (the stepper).
	goToStep: (step: WizardStep) => void
	// Single video: goes to Review, optionally with one row open.
	openReview: (row: ReviewRow | null) => void
	setWizardReviewRow: (row: ReviewRow | null) => void
	reset: () => void
	retry: () => Promise<void>
	retryFormatProbe: () => Promise<void>
	retryProbeWithCookies: () => Promise<void>
	openCookiesSettings: () => void
	// The "Sign in in Explore" guidance action: leaves the wizard for the Explore tab.
	openExploreSignIn: () => void
	// Stops the loading probe and returns to where the run started.
	cancelWizardProbe: () => void
	// A needs-choice row's Review: the wizard's playlist step for the link,
	// from the row's kept probe when there is one, else from a fresh probe.
	openPlaylistReview: (url: string, playlistMode: ProbePlaylistMode, sourceRowId: string, probe?: PlaylistProbeResult) => Promise<void>
}

// QuickDownload — the in-app ends of the background quick download (P2-R37/R38).
export interface QuickDownloadSlice {
	// The URL tab's Quick Download and Explore's Download. `playlistMode` is the
	// answer to the mixed-URL prompt; without it the intake policy decides.
	quickDownload: (request: {url: string; entry: Exclude<InAppQuickDownloadEntry, 'downloads'>; title?: string; playlistMode?: Extract<ProbePlaylistMode, 'video' | 'playlist'>}) => Promise<void>
	// The Downloads tab's resolution of a placeholder row.
	retryQuickDownloadRow: (itemId: string) => Promise<void>
	retryQuickDownloadRowWithCookies: (itemId: string) => Promise<void>
	chooseQuickDownloadRow: (itemId: string, answer: QuickDownloadRowAnswer) => Promise<void>
	// "Sign in with Explore" (P2-R51): the failed items waiting for the Explore
	// sign-in, retried once it is reported. Memory only: a restart forgets them.
	exploreRetryTargets: readonly ExploreRetryTarget[]
	// Switches the cookie mode to `explore`, opens Explore, and remembers the
	// target until Explore reports the sign-in.
	signInWithExploreThenRetry: (target: ExploreRetryTarget) => Promise<void>
	// "Use my Explore sign-in and retry": switches the cookie mode to `explore`, then retries now.
	retryWithExploreSignIn: (target: ExploreRetryTarget) => Promise<void>
}

// What a failure waiting for the Explore sign-in retries: a probe-error row
// (probes again), a failed download (downloads again), the wizard's link (only
// while the URL tab still holds it), or the URL tab's failed quick download.
export type ExploreRetryTarget = {kind: 'row'; itemId: string} | {kind: 'download'; itemId: string} | {kind: 'wizard'; url: string} | {kind: 'home'}

// Where an in-app quick download started. `downloads`: a Retry or a choice on
// the row itself, which needs no "Added" toast.
export type InAppQuickDownloadEntry = 'url-tab' | 'explore' | 'downloads'

// A needs-choice row's answers: all of the collection, the first N loaded, or the wizard's review.
export type QuickDownloadRowAnswer = 'all' | 'first' | 'review'

// FormatPicker — formats / audio / subtitles state, post-probe, plus the
// download profile a single-video run starts from.
export interface FormatPickerSlice {
	wizardFormats: FormatOption[]
	selectedVideoFormatId: string
	audioSelection: AudioSelection
	// The audio pick Video, no audio set aside, given back when audio returns.
	wizardSilencedAudio: AudioSelection | null
	// Preserves the user's bitrate choice when toggling between mp3/m4a/opus
	// rows or away to wav and back. Default 192 (industry standard MP3).
	lastConvertBitrate: AudioBitrate
	// The Format screen's Video / Audio / Subtitles switch.
	wizardMediaKind: WizardMediaKind
	wizardSubtitles: SubtitleMap
	wizardAutomaticCaptions: SubtitleMap
	wizardSubtitleLanguages: string[]
	wizardSubtitleMode: SubtitleMode
	wizardSubtitleFormat: SubtitleFormat
	// Single mode: the profile this run started from, every setting it gave
	// (the baseline the "changed from profile" diff compares against), and what
	// of it this video can't honour.
	wizardProfile: DownloadProfile | null
	wizardProfileBaseline: WizardSettingsSnapshot | null
	wizardFitNotices: FitNotice[]
	// The order the profile picked this video's streams by, for the Profile
	// badge's "Why this one?" tip. Null when the profile has no video.
	wizardSelectionOrder: SelectionOrder | null
	wizardFilenameTemplate: string
	wizardIsAudioOnlySource: boolean
	// The file type this download is saved as (Format screen's "Saves as").
	// Starts from the profile; a stream pick it can't hold sends it back to
	// Auto, and `wizardFileTypeReset` says why until the next file type pick.
	wizardFileType: VideoFileType
	wizardFileTypeReset: {from: VideoFileType; blocker: string} | null

	setSelectedVideoFormatId: (id: string) => void
	setWizardFileType: (fileType: VideoFileType) => void
	setAudioSelection: (sel: AudioSelection) => void
	setWizardMediaKind: (kind: WizardMediaKind) => void
	// The Format screen's switch: a media kind, or Video with no audio.
	setFormatMode: (mode: FormatMode) => void
	toggleSubtitleLanguage: (lang: string) => void
	clearSubtitleLanguages: () => void
	setSubtitleMode: (mode: SubtitleMode) => void
	setSubtitleFormat: (format: SubtitleFormat) => void
	setWizardFilenameTemplate: (template: string) => void
	// Re-applies a profile to every setting; edits are dropped.
	// `keepEdits`: the new profile picks the streams; the user's other edits stay.
	chooseWizardProfile: (ref: DownloadProfileRef, keepEdits?: boolean) => void
	resetWizardToProfile: () => void
	// Saves the current settings as a new profile. Never changes the active one.
	saveWizardAsProfile: (name: string) => Promise<boolean>
	// Saves the current settings into the profile the run started from. Never changes the active one.
	updateWizardProfile: () => Promise<boolean>
}

// VideoPart — the single-video "Part of video" range on the Format screen.
export interface VideoPartSlice {
	wizardChapters: VideoChapter[]
	// The start time the link carries in `t`, offered (never applied) as the
	// part's start: a shared link's `t` is often just a resume point.
	wizardUrlStartSeconds: number | null
	// What the user typed; null downloads the whole video.
	wizardPart: VideoPartFields | null

	setWizardPartEnabled: (enabled: boolean) => void
	setWizardPartStart: (start: string) => void
	setWizardPartEnd: (end: string) => void
	setWizardPartExactCut: (exactCut: boolean) => void
	// Chapter chips and the range bar set both ends at once.
	setWizardPartRange: (startSeconds: number, endSeconds: number) => void
	useUrlStartForPart: () => void
}

// OutputConfig — output dir / subfolder / SponsorBlock / output artifact flags.
export interface OutputConfigSlice {
	wizardOutputDir: string
	wizardSubfolderEnabled: boolean
	wizardSubfolderName: string
	wizardSponsorBlockMode: SponsorBlockMode
	wizardSponsorBlockCategories: SponsorBlockCategory[]
	wizardEmbedChapters: boolean
	wizardEmbedMetadata: boolean
	wizardEmbedThumbnail: boolean
	wizardWriteDescription: boolean
	wizardWriteThumbnail: boolean
	wizardWriteM3u: boolean

	setWizardOutputDir: (dir: string, persist?: boolean) => Promise<void>
	chooseWizardFolder: () => Promise<void>
	setPlaylistFolder: (dir: string) => Promise<void>
	setWizardSubfolderEnabled: (enabled: boolean) => void
	setWizardSubfolderName: (name: string) => void
	setSponsorBlockMode: (mode: SponsorBlockMode) => void
	toggleSponsorBlockCategory: (cat: SponsorBlockCategory) => void
	setEmbedChapters: (v: boolean) => void
	setEmbedMetadata: (v: boolean) => void
	setEmbedThumbnail: (v: boolean) => void
	setWriteDescription: (v: boolean) => void
	setWriteThumbnail: (v: boolean) => void
	setWriteM3u: (value: boolean) => void
}

// WizardDialogs — transient UI flags that gate modal interruptions.
export interface WizardDialogsSlice {
	// Mixed YouTube URLs (?v=X&list=Y) — wizard intercepts pre-probe and asks
	// the user "video or playlist?" so Radio/Mix lists don't auto-route to
	// playlist enumeration.
	mixedUrlPromptOpen: boolean
	mixedUrlPending: string | null
	mixedUrlPromptSource: MixedUrlPromptSource | null
	// Transient flag set when the user navigates to the URL step from the
	// an "Open advanced settings" link. `StepUrlInput` reads it on mount,
	// expands the advanced section, scrolls the requested block into view,
	// and clears the flag so it doesn't re-fire on re-render.
	advancedAutoOpen: boolean
	advancedAutoTarget: AdvancedSettingsTarget
	cookiesConfigDialogIssue: IncompleteCookiesConfigIssue | null
	quickPlaylistCapDialogOpen: boolean

	setAdvancedAutoOpen: (open: boolean, target?: AdvancedSettingsTarget) => void
	cancelMixedPrompt: () => void
	dismissCookiesConfigDialog: () => void
	dismissQuickPlaylistCapDialog: () => void
	openSettings: () => void
	openAdvancedSettings: (target: AdvancedSettingsTarget) => void
}

// Renderer's queue slice is a read-only projection of QueueService (main).
// Actions are thin IPC shims; the queue array hydrates from `queue:event:snapshot`
// on init and updates via the four diff events. Local mutations are forbidden.
export interface QueueSlice {
	queue: QueueItem[]
	// Mirror of QueueService's global scheduler-pause flag (qBittorrent-style
	// "queue paused"). Hydrated from the queue snapshot and kept live via the
	// queue:event:scheduler diff — the queue tab shows a paused banner while
	// this is true and pending items exist, instead of silently "waiting".
	schedulerPaused: boolean
	// True while submitWizardToQueue is in flight. Lets the confirm step
	// disable its action buttons so a user staring at a momentarily-frozen UI
	// (e.g. a 290-entry playlist mid-add) doesn't double-submit and produce
	// duplicate queue items.
	isSubmittingToQueue: boolean
	// A one-shot command for the Downloads tab, raised by a toast's View: show
	// this row. The tab consumes it once the row is on screen.
	queueFocus: QueueFocus | null

	addToQueue: () => Promise<void>
	addAndDownloadImmediately: () => Promise<void>
	queueLoadedPlaylistWithActiveProfile: () => Promise<void>
	setItemLane: (itemId: string, lane: QueueLane) => Promise<void>
	cancelItemDownload: (itemId: string) => Promise<void>
	pauseItemDownload: (itemId: string) => Promise<void>
	resumeItemDownload: (itemId: string) => Promise<void>
	removeQueueItem: (itemId: string) => Promise<void>
	retryQueueItem: (itemId: string) => Promise<void>
	// The Explore offer's "Enable cookies and retry" on a failed download: the stored cookies on, then download again.
	retryDownloadWithCookies: (itemId: string) => Promise<void>
	applyQueueSelectionAction: (action: QueueSelectionAction, itemIds: string[]) => Promise<Result<QueueSelectionCommandResult>>
	changeQueueOutputTarget: (itemIds: string[], outputDir: string) => Promise<Result<QueueOutputTargetChangeResult>>
	clearCompleted: () => Promise<void>
	pauseAll: () => Promise<void>
	resumeAll: () => Promise<void>
	cancelAll: () => Promise<void>
	openItemFolder: (itemId: string) => Promise<void>
	openItemUrl: (itemId: string) => void
	// Opens the Downloads tab (leaving an open wizard) and asks it to show the
	// row; null when the row is not known yet, which just opens the tab.
	showQueueItem: (itemId: string | null) => void
	// Consumes the command `seq` only, so a newer View is never dropped.
	clearQueueFocus: (seq: number) => void
}

// `seq` makes a repeated View on the same row a new command.
export interface QueueFocus {
	itemId: string
	seq: number
}

// Under Explore's address bar after Enter on something the view will not
// load (P2-R45): a web link on another site (which can be downloaded
// instead), an address refused outright, or a search over the length cap.
export type ExploreAddressHint = {kind: 'refused'} | {kind: 'search-too-long'}

export interface UiSlice {
	uiZoom: number
	uiTheme: UiTheme
	uiStyle: UiStyle
	// The hardware backdrop failed at runtime (context lost, shader rejected), so
	// a style that needs it renders as the base style until restart.
	backdropFailed: boolean
	aboutDialogOpen: boolean
	donateDialogOpen: boolean
	exploreAddressHint: ExploreAddressHint | null
	// The Explore browser is on screen (its tab is active, past the first-run notice).
	exploreBrowsing: boolean

	setUiZoom: (zoom: number) => void
	setUiTheme: (theme: UiTheme) => void
	setUiStyle: (style: UiStyle) => void
	setBackdropFailed: (failed: boolean) => void
	setAboutDialogOpen: (open: boolean) => void
	setDonateDialogOpen: (open: boolean) => void
	setExploreAddressHint: (hint: ExploreAddressHint | null) => void
	setExploreBrowsing: (browsing: boolean) => void
}

export interface SystemSlice {
	initialized: boolean
	initializing: boolean
	splashDismissed: boolean
	warmupDiagnostics: Record<DependencyId, DependencyDiagnostic> | null
	warmupBlocking: DependencyId[]
	warmupRunning: boolean
	warmupCancellable: boolean
	warmupProgress: Partial<Record<DependencyId, import('@shared/types.js').WarmupProgressEvent>> | null
	warmupDownloads: import('./warmupDownloads.js').WarmupDownloads
	// The last warmup ended because the user stopped it ("Having trouble? Set it
	// up manually"), not because something failed.
	warmupStopped: boolean
	// A package manager install the repair panel started and is waiting on.
	packageInstall: 'homebrew' | 'winget' | null
	// The latest link the clipboard watcher saw, until the Download tab takes it.
	copiedLink: string | null
	settings: AppSettings | null
	hotkeyRegistration: HotkeyRegistrationStatus
	graphicsPolicy: GraphicsPolicy | null
	language: SupportedLang
	commonPaths: AppSettings['common']['commonPaths']
	shareDialogOpen: boolean
	// The Explore view as main last reported it (no cookies); null until main first answers.
	exploreView: ExploreViewState | null
	// Counts the pointer's entries into the native view; a toolbar tooltip opened before the latest one is closed.
	explorePointerEntries: number
	initialize: () => Promise<void>
	// (Re)binds the renderer's one subscription to the Explore view state.
	bindExploreView: () => void
	setSplashDismissed: (dismissed: boolean) => void
	repairWarmup: () => Promise<void>
	repairYtDlpWithHomebrew: () => Promise<void>
	repairYtDlpWithWinget: () => Promise<void>
	repairFfmpegWithPackageManager: (manager: 'homebrew' | 'winget') => Promise<void>
	cancelWarmup: () => Promise<void>
	setBinaryOverride: (id: DependencyId, path: string) => Promise<void>
	clearBinaryOverride: (id: DependencyId) => Promise<void>
	openBinariesDir: () => Promise<void>
	openLogs: () => Promise<void>
	saveDiagnostics: () => Promise<void>
	markReleaseNotesShown: (version: string) => Promise<void>
	setLanguage: (lang: SupportedLang) => void
	setCookiesPath: (path: string) => Promise<void>
	setCookiesMode: (mode: CookiesMode) => Promise<void>
	setCookiesBrowser: (browser: CookiesBrowser) => Promise<void>
	setProxyUrl: (url: string) => Promise<void>
	setExploreAdBlock: (enabled: boolean) => Promise<void>
	setExploreIdleUnload: (enabled: boolean) => Promise<void>
	setLimitRate: (value: string | undefined) => Promise<void>
	setPlaylistProbeLimit: (value: number) => Promise<void>
	setNativeAudioPreference: (value: NativeAudioPreference) => Promise<void>
	setHdrPreference: (value: HdrSetting) => Promise<void>
	setFilenameTemplate: (template: string) => Promise<void>
	setNetworkPacingPreset: (value: AppSettings['common']['networkPacingPreset']) => Promise<void>
	setPacingSleepRequests: (value: number | undefined) => Promise<void>
	setPacingSleepInterval: (value: number | undefined) => Promise<void>
	setPacingMaxSleepInterval: (value: number | undefined) => Promise<void>
	setPacingSleepSubtitles: (value: number | undefined) => Promise<void>
	setDownloadConnections: (value: number) => Promise<void>
	setConcurrentDownloads: (value: number) => Promise<void>
	setAutoRetryAttempts: (value: number) => Promise<void>
	setAutoRemoveCompleted: (enabled: boolean) => Promise<void>
	setClipboardWatchEnabled: (enabled: boolean) => Promise<void>
	setHotkeyEnabled: (enabled: boolean) => Promise<void>
	setHotkeyAccelerator: (accelerator: HotkeyAccelerator) => Promise<void>
	setCloseBehavior: (value: 'tray' | 'quit') => Promise<void>
	setAnalyticsEnabled: (enabled: boolean) => Promise<void>
	// False when the save failed (the active profile is then rolled back).
	setActiveDownloadProfile: (ref: DownloadProfileRef) => Promise<boolean>
	// False when the settings write failed: it is rolled back, and the user already told.
	saveDownloadProfile: (profile: DownloadProfile, activate?: boolean) => Promise<boolean>
	removeDownloadProfile: (id: string) => Promise<void>
	setDownloadProfileEnabled: (id: string, enabled: boolean) => Promise<void>
	openShareDialog: () => void
	closeShareDialog: () => void
	setShareInlineCardDismissed: () => Promise<void>
	setShareHighValueBannerDismissed: () => Promise<void>
	dismissStyleHint: () => Promise<void>
	dismissVideoPartCallout: () => Promise<void>
	dismissExploreLinkCallout: () => Promise<void>
	dismissFormatProfileCallout: () => Promise<void>
	dismissReviewCallout: () => Promise<void>
	acknowledgeExploreNotice: () => Promise<void>
	setExploreCompactChrome: (compact: boolean) => Promise<void>
	// Marks the first Explore open done; switches `off` to `explore` only if that is the mode right now. One write.
	markExploreFirstOpen: () => Promise<void>
	// The cookie mode to `explore`, the first open marked done (so the open's own
	// switch has nothing left to do). One write; resolves false when it failed.
	switchToExploreCookiesMode: () => Promise<boolean>
	dismissExploreModeNudge: (mode: CookiesMode) => Promise<void>
	setExploreEnabled: (enabled: boolean) => Promise<void>
	signOutOfExplore: () => Promise<void>
}

export interface SiteCooldownSlice {
	// The current network route's running rate-limit cooldowns, as main last reported them.
	siteCooldowns: SiteCooldown[]
	bindSiteCooldowns: () => void
	// "Try now": the next request to `site` goes through its cooldown once. The
	// caller then makes that request (its usual retry).
	tryRateLimitedSiteNow: (site: string) => Promise<void>
}

export type AppState = ProbeOrchestratorSlice & FormatPickerSlice & VideoPartSlice & OutputConfigSlice & WizardDialogsSlice & QueueSlice & QuickDownloadSlice & UiSlice & SystemSlice & SiteCooldownSlice

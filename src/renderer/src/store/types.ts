import type {StoreApi} from 'zustand'
import type {
	AppSettings,
	AudioBitrate,
	BackdropRenderMode,
	BulkMetadataCancelReason,
	BulkMetadataItemStatus,
	BulkMetadataStatus,
	CookiesBrowser,
	CookiesMode,
	DependencyDiagnostic,
	DependencyId,
	DownloadProfile,
	DownloadProfileRef,
	FormatOption,
	GraphicsPolicy,
	HotkeyAccelerator,
	HotkeyRegistrationStatus,
	NativeAudioPreference,
	PlaylistEntry,
	PlaylistScope,
	PlaylistSelection,
	Preset,
	ProbeError,
	ProbeProgressEvent,
	ProbeInfoJsonRef,
	ProbeDegradationReason,
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
	UiTheme,
	WizardMode,
	WizardStepName
} from '@shared/types.js'
import type {Result} from '@shared/result.js'
import type {AudioSelection} from '@shared/schemas.js'
import type {IncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {QuickDownloadFailure} from './wizard/quickDownloadFeedback.js'
export type {AudioSelection}
export type {BulkMetadataCancelReason, BulkMetadataItemStatus, BulkMetadataStatus, WizardMode} from '@shared/types.js'
// WizardStep is a plain alias of the shared WizardStepName (schemas.ts is the
// single source of truth for the step list) — kept under its own name here
// since every renderer file already imports it as WizardStep.
export type WizardStep = WizardStepName
export type AdvancedSettingsTarget = 'cookies' | 'network' | 'hotkey'
export type MixedUrlPromptSource = 'wizard' | 'quick-download'

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

	// videoIds matched on disk by the last folder scan
	syncedDownloadedIds: string[]
	// Folder-scan lifecycle: 'idle' before any scan, 'scanning' while in flight,
	// 'done' once a result is available (drives the sync alert in StepPlaylistItems).
	syncScanState: 'idle' | 'scanning' | 'done'

	setWizardUrl: (url: string) => void
	submitUrl: () => Promise<void>
	quickDownload: () => Promise<void>
	quickDownloadUrls: (urls: string[]) => Promise<void>
	retryQuickDownloadFailure: () => Promise<void>
	retryQuickPlaylistCap: () => Promise<void>
	retryQuickDownloadWithCookies: () => Promise<void>
	cancelQuickDownload: () => void
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
	skipSubtitles: () => void
	skipToConfirm: () => void
	reset: () => void
	retry: () => Promise<void>
	retryFormatProbe: () => Promise<void>
	retryProbeWithCookies: () => Promise<void>
	openCookiesSettings: () => void
}

// FormatPicker — formats / audio / subtitles / preset state, post-probe.
export interface FormatPickerSlice {
	wizardFormats: FormatOption[]
	selectedVideoFormatId: string
	audioSelection: AudioSelection
	// Preserves the user's bitrate choice when toggling between mp3/m4a/opus
	// rows or away to wav and back. Default 192 (industry standard MP3).
	lastConvertBitrate: AudioBitrate
	// May be set IMPLICITLY when video='' (see setSelectedVideoFormatId).
	// Don't treat it as "the preset the user explicitly clicked."
	activePreset: Preset | null
	wizardSubtitles: SubtitleMap
	wizardAutomaticCaptions: SubtitleMap
	wizardSubtitleLanguages: string[]
	wizardSubtitleSkipped: boolean
	wizardSubtitleMode: SubtitleMode
	wizardSubtitleFormat: SubtitleFormat

	setSelectedVideoFormatId: (id: string) => void
	setAudioSelection: (sel: AudioSelection) => void
	setPreset: (p: Preset) => void
	toggleSubtitleLanguage: (lang: string) => void
	setSubtitleMode: (mode: SubtitleMode) => void
	setSubtitleFormat: (format: SubtitleFormat) => void
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

	addToQueue: () => Promise<void>
	addAndDownloadImmediately: () => Promise<void>
	queueLoadedPlaylistWithActiveProfile: () => Promise<void>
	setItemLane: (itemId: string, lane: QueueLane) => Promise<void>
	cancelItemDownload: (itemId: string) => Promise<void>
	pauseItemDownload: (itemId: string) => Promise<void>
	resumeItemDownload: (itemId: string) => Promise<void>
	removeQueueItem: (itemId: string) => Promise<void>
	retryQueueItem: (itemId: string) => Promise<void>
	applyQueueSelectionAction: (action: QueueSelectionAction, itemIds: string[]) => Promise<Result<QueueSelectionCommandResult>>
	changeQueueOutputTarget: (itemIds: string[], outputDir: string) => Promise<Result<QueueOutputTargetChangeResult>>
	clearCompleted: () => Promise<void>
	pauseAll: () => Promise<void>
	resumeAll: () => Promise<void>
	cancelAll: () => Promise<void>
	openItemFolder: (itemId: string) => Promise<void>
	openItemUrl: (itemId: string) => void
}

export interface UiSlice {
	uiZoom: number
	uiTheme: UiTheme
	aboutDialogOpen: boolean

	setUiZoom: (zoom: number) => void
	setUiTheme: (theme: UiTheme) => void
	setAboutDialogOpen: (open: boolean) => void
}

export type ShareTrigger = 'footer' | 'titlebar' | 'about' | 'wizard-card' | 'milestone' | 'high-value-inline'

export interface SystemSlice {
	initialized: boolean
	initializing: boolean
	splashDismissed: boolean
	warmupDiagnostics: Record<DependencyId, DependencyDiagnostic> | null
	warmupBlocking: DependencyId[]
	warmupRunning: boolean
	warmupCancellable: boolean
	warmupProgress: Partial<Record<DependencyId, import('@shared/types.js').WarmupProgressEvent>> | null
	settings: AppSettings | null
	hotkeyRegistration: HotkeyRegistrationStatus
	graphicsPolicy: GraphicsPolicy | null
	language: SupportedLang
	commonPaths: AppSettings['common']['commonPaths']
	shareDialogOpen: boolean
	shareDialogTrigger: ShareTrigger | null
	initialize: () => Promise<void>
	setSplashDismissed: (dismissed: boolean) => void
	repairWarmup: () => Promise<void>
	repairYtDlpWithHomebrew: () => Promise<void>
	repairYtDlpWithWinget: () => Promise<void>
	cancelWarmup: () => Promise<void>
	setBinaryOverride: (id: DependencyId, path: string) => Promise<void>
	clearBinaryOverride: (id: DependencyId) => Promise<void>
	openBinariesDir: () => Promise<void>
	openLogs: () => Promise<void>
	markReleaseNotesShown: (version: string) => Promise<void>
	setLanguage: (lang: SupportedLang) => void
	setCookiesPath: (path: string) => Promise<void>
	setCookiesMode: (mode: CookiesMode) => Promise<void>
	setCookiesBrowser: (browser: CookiesBrowser) => Promise<void>
	setProxyUrl: (url: string) => Promise<void>
	setLimitRate: (value: string | undefined) => Promise<void>
	setPlaylistProbeLimit: (value: number) => Promise<void>
	setBackdropRenderMode: (value: BackdropRenderMode) => Promise<void>
	setNativeAudioPreference: (value: NativeAudioPreference) => Promise<void>
	setFilenameTemplate: (template: string) => Promise<void>
	setNetworkPacingPreset: (value: AppSettings['common']['networkPacingPreset']) => Promise<void>
	setPacingSleepRequests: (value: number | undefined) => Promise<void>
	setPacingSleepInterval: (value: number | undefined) => Promise<void>
	setPacingMaxSleepInterval: (value: number | undefined) => Promise<void>
	setPacingSleepSubtitles: (value: number | undefined) => Promise<void>
	setDownloadConnections: (value: number) => Promise<void>
	setConcurrentDownloads: (value: number) => Promise<void>
	setAutoRetryAttempts: (value: number) => Promise<void>
	setClipboardWatchEnabled: (enabled: boolean) => Promise<void>
	setHotkeyEnabled: (enabled: boolean) => Promise<void>
	setHotkeyAccelerator: (accelerator: HotkeyAccelerator) => Promise<void>
	setCloseBehavior: (value: 'tray' | 'quit') => Promise<void>
	setAnalyticsEnabled: (enabled: boolean) => Promise<void>
	setActiveDownloadProfile: (ref: DownloadProfileRef) => Promise<void>
	saveDownloadProfile: (profile: DownloadProfile, activate?: boolean) => Promise<void>
	removeDownloadProfile: (id: string) => Promise<void>
	setDownloadProfileEnabled: (id: string, enabled: boolean) => Promise<void>
	openShareDialog: (trigger: ShareTrigger) => void
	closeShareDialog: () => void
	setShareInlineCardDismissed: () => Promise<void>
	setShareHighValueBannerDismissed: () => Promise<void>
	dismissMultiProfileHint: () => Promise<void>
}

export type AppState = ProbeOrchestratorSlice & FormatPickerSlice & OutputConfigSlice & WizardDialogsSlice & QueueSlice & UiSlice & SystemSlice

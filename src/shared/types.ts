import type {LocalizedError, YtDlpErrorKind} from './i18n/types.js'
import type {InFlightFormat} from './nameBudget.js'
import type {PreparedJob} from './preparedJob.js'
import type {FormatSelectionSource} from './ytdlp/selectableFormat.js'

export type {PreparedJob} from './preparedJob.js'

// Re-export the enum types whose canonical definition lives in `schemas.ts`
// (where they're z.enum schemas). Importing from `@shared/types` continues to
// work for callers that don't care about the schema vs type distinction.
export type {
	FormatMarker,
	WizardMediaKind,
	PlaylistSelection,
	PlaylistScope,
	VideoGoal,
	VideoCodecPreference,
	VideoFileType,
	NativeAudioChoice,
	PlaylistVideoTier,
	PlaylistSortMode,
	DownloadProfile,
	DownloadProfileAudioFormat,
	DownloadProfileIcon,
	DownloadProfileRef,
	DownloadProfileSubtitleSource,
	DownloadProfilesPrefs,
	SubtitleMode,
	SubtitleFormat,
	SponsorBlockMode,
	SponsorBlockCategory,
	SupportedLang,
	UiTheme,
	UiStyle,
	GraphicsPolicyBackdropReason,
	QueueItemStatus,
	QueueLane,
	QueueArtifactKind,
	QueueSelectionAction,
	QueueActionSkippedItem,
	QueueSchedulerState,
	AudioConvertTarget,
	AudioBitrate,
	AudioTrackQuality,
	AudioConvert,
	AudioSelection,
	CloseBehavior,
	CookiesMode,
	JobAuth,
	CookiesBrowser,
	NetworkPacingPreset,
	NativeAudioPreference,
	HdrPreference,
	HdrSetting,
	QuickDownloadStatus,
	QuickDownloadProgressPhase,
	ProbeOtherErrorCode,
	AppErrorCode,
	WizardMode,
	BulkMetadataStatus,
	BulkMetadataItemStatus,
	BulkMetadataCancelReason,
	BulkUrlRejectReason,
	RuntimeBinaryId,
	RuntimeBinaryChannel,
	RuntimeBinaryProvider,
	WizardStepName
} from './schemas.js'

import type {ExploreSearchEngine, FormatMarker, ProbeDegradationReason, ProbePlaylistMode} from './schemas.js'
export type {ProbeDegradationReason, ProbePlaylistMode, RateLimitEvidence, SiteCooldown, StatusKey} from './schemas.js'
export type {ExploreViewState} from './schemas.js'
export type {ExploreLinkAction, ExploreNavigateCommand, ExploreViewBounds} from './exploreSchemas.js'
export type {HotkeyAccelerator, HotkeyOutcome, HotkeyOutcomeEvent, HotkeyOutcomePayload, HotkeyRegistrationStatus, HotkeyState, HotkeyTriggerPayload} from './schemas.js'
export type {LocalizedError, YtDlpErrorKind} from './i18n/types.js'
export type {FfmpegPackageEntry, RuntimeBinaryIndex, RuntimeBinaryIndexEntry, RuntimeBinaryIndexV1, RuntimeBinaryManifestEntry} from './runtimeBinarySchemas.js'

import type {
	AudioTrackQuality,
	CloseBehavior,
	HotkeyAccelerator,
	PlaylistScope,
	SponsorBlockMode,
	SponsorBlockCategory,
	SupportedLang,
	UiTheme,
	UiStyle,
	GraphicsPolicyBackdropReason,
	StatusKey,
	CookiesMode,
	JobAuth,
	CookiesBrowser,
	NetworkPacingPreset,
	NativeAudioPreference,
	HdrSetting,
	QueueArtifactKind,
	QueueSelectionAction,
	QueueActionSkippedItem as SchemaQueueActionSkippedItem,
	QueueSchedulerState,
	DownloadProfilesPrefs,
	ProbeOtherErrorCode,
	AppErrorCode,
	RuntimeBinaryChannel,
	RuntimeBinaryProvider,
	WizardStepName
} from './schemas.js'

export interface AppError {
	code: AppErrorCode
	message: string
	details?: string
	recoverable?: boolean
}

// Discriminated error for the probe IPC command. Separates yt-dlp classified
// failures (carry LocalizedError for i18n + UI gating) from other probe
// failures (carry a plain message). Replaces the AppError.localizedKey bridge.
// `auth`: who the failed yt-dlp run was. `exploreSession` when the probe escalated
// and still failed with the session's cookies in effect: another sign-in would not help.
export type ProbeError = {kind: 'ytdlp'; error: LocalizedError; auth?: JobAuth} | {kind: 'other'; code: ProbeOtherErrorCode; message: string; details?: string}

export interface GraphicsPolicy {
	backdrop: {webglBlocked: boolean; softwareWebglAllowed: boolean; fallbackReason?: GraphicsPolicyBackdropReason; renderer?: string; devices?: string[]; featureStatus?: Record<string, string>}
}

// Mode-independent prefs and infrastructure config. Anything that applies
// regardless of single-vs-playlist flow lives here.
export interface CommonSettings {
	defaultOutputDir: string
	rememberLastOutputDir: boolean
	lastSubfolderEnabled?: boolean
	lastSubfolder?: string
	// UTC days (YYYY-MM-DD) of the first and last anonymous heartbeat: the last
	// counts an install at most once per day, the first gives its install age.
	// Internal: never accepted from the renderer.
	firstHeartbeatDay?: string
	lastHeartbeatDay?: string
	// Internal: set once edited built-ins have dropped the English names they
	// shipped with. Never accepted from the renderer.
	builtinProfileNamesMigrated?: true
	uiZoom?: number
	uiTheme?: UiTheme
	uiStyle?: UiStyle
	language?: SupportedLang
	commonPaths?: {downloads: string | null; videos: string | null; desktop: string | null; music: string | null; documents: string | null; pictures: string | null; home: string | null}
	cookiesPath?: string
	cookiesMode?: CookiesMode
	cookiesBrowser?: CookiesBrowser
	proxyUrl?: string
	exploreEnabled?: boolean
	exploreUserAgent?: string
	exploreNoticeSeen?: boolean
	exploreModeAutoSwitched?: boolean
	exploreModeNudgeDismissedFor?: CookiesMode
	// Main-owned: the last site page the Explore view showed (see schemas.ts).
	exploreLastUrl?: string
	exploreAdBlock?: boolean
	exploreSearchEngine?: ExploreSearchEngine
	exploreIdleUnload?: boolean
	exploreCompactChrome?: boolean
	exploreZoom?: number
	nativeAudioPreference?: NativeAudioPreference
	hdrPreference?: HdrSetting
	limitRate?: string
	playlistProbeLimit?: number
	networkPacingPreset?: NetworkPacingPreset
	pacingSleepRequests?: number
	pacingSleepInterval?: number
	pacingMaxSleepInterval?: number
	pacingSleepSubtitles?: number
	downloadConnections?: number
	concurrentDownloads?: number
	autoRetryAttempts?: number
	autoRemoveCompleted?: boolean
	clipboardWatchEnabled: boolean
	hotkeyEnabled: boolean
	hotkeyAccelerator?: HotkeyAccelerator
	filenameTemplate?: string
	closeBehavior?: CloseBehavior
	embedChapters?: boolean
	embedMetadata?: boolean
	embedThumbnail?: boolean
	writeDescription?: boolean
	writeThumbnail?: boolean
	writeM3u?: boolean
	lastSponsorBlockMode?: SponsorBlockMode
	lastSponsorBlockCategories?: SponsorBlockCategory[]
	analyticsEnabled?: boolean
	firstRunCompleted?: boolean
	launchCount?: number
	lastReleaseNotesVersionShown?: string
	binaryOverrides?: BinaryOverrides
	successfulDownloadCount?: number
	shareInlineCardDismissed?: boolean
	shareHighValueBannerDismissed?: boolean
	styleHintDismissed?: boolean
	videoPartCalloutDismissed?: boolean
	exploreLinkCalloutDismissed?: boolean
	formatProfileCalloutDismissed?: boolean
	reviewCalloutDismissed?: boolean
}

export interface BinaryOverrides {
	ytDlp?: string
	ffmpeg?: string
	ffprobe?: string
}

// Playlist flow prefs.
export interface PlaylistPrefs {
	lastPlaylistSelection?: import('./schemas.js').PlaylistSelection
}

export interface AppSettings {
	common: CommonSettings
	playlist: PlaylistPrefs
	profiles: DownloadProfilesPrefs
}

export interface SubtitleTrack {
	ext: string
	name?: string
}

export type SubtitleMap = Record<string, SubtitleTrack[]>

export interface FormatOption {
	formatId: string
	label: string
	ext: string
	resolution: string
	fps?: number
	// yt-dlp vcodec (e.g. avc1.640028, vp9, av01…); lets MP4 profiles prefer H.264.
	videoCodec?: string
	// yt-dlp's total bitrate (kbps) of a video stream: its picture, plus its sound when muxed.
	tbr?: number
	abr?: number
	audioCodec?: string
	audioChannels?: number
	sampleRateHz?: number
	isDrc?: boolean
	audioLanguage?: string
	audioLanguagePreference?: number
	audioTrackLabel?: string
	audioTrackQuality?: AudioTrackQuality
	isDefaultAudio?: boolean
	isOriginalAudio?: boolean
	// The size shown: the site's, else one asked of its server, else an estimate.
	filesize?: number
	isVideoOnly: boolean
	isAudioOnly: boolean
	dynamicRange?: string
	// What yt-dlp's notes say about the stream (AI-upscaled, damaged, 360°...).
	markers?: FormatMarker[]
	// yt-dlp's `preference`: the site marks a stream down (damaged, watermarked,
	// a fallback copy). yt-dlp ranks it above everything else; so does Arroxy.
	preference?: number
	// yt-dlp's `quality`: how the site rates copies of the same height (Twitch's
	// portrait crops are -2). Breaks ties at one height, as in yt-dlp's sort.
	quality?: number
}

export type DownloadJobStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export interface DownloadJob {
	id: string
	url: string
	outputDir: string
	formatId?: string
	expectedBytes?: number
	status: DownloadJobStatus
	createdAt: string
	updatedAt: string
}

export interface RecentJob {
	id: string
	url: string
	outputDir: string
	formatId?: string
	status: Extract<DownloadJobStatus, 'completed' | 'failed' | 'cancelled'>
	finishedAt: string
	error?: LocalizedError
}

export interface StatusSnapshot {
	key: StatusKey
	params?: Record<string, string | number>
}

export interface QueueArtifact {
	id: string
	kind: QueueArtifactKind
	path: string
	fileName: string
	sizeBytes?: number
	discoveredAt: string
	missing?: boolean
	internal?: boolean
}

export interface QueueSelectionCommandResult {
	action: QueueSelectionAction
	appliedIds: string[]
	skipped: SchemaQueueActionSkippedItem[]
}

// Outcome of a whole-queue pause or resume: where it left the scheduler, the
// items it moved, and each item it could not move with that item's own error.
export interface QueueSchedulerCommandResult {
	scheduler: QueueSchedulerState
	done: string[]
	failed: QueueSchedulerCommandFailure[]
}

export interface QueueSchedulerCommandFailure {
	itemId: string
	error: AppError
}

export interface QueueOutputTargetMovedArtifact {
	from: string
	to: string
}

export interface QueueOutputTargetChangeItemResult {
	itemId: string
	moved: QueueOutputTargetMovedArtifact[]
	missing: string[]
}

export interface QueueOutputTargetChangeResult {
	outputDir: string
	items: QueueOutputTargetChangeItemResult[]
	skipped: SchemaQueueActionSkippedItem[]
}

export interface QueueItem {
	id: string
	url: string
	title: string
	// Set only when the row title was fabricated by the flat-playlist probe
	// fallback (`Untitled · #N`). Cleared the moment a real title lands from
	// any source (background backfill, artifact derivation), so backfill
	// layers never fight and reruns stay idempotent.
	titleIsPlaceholder?: true
	thumbnail: string
	outputDir: string
	formatLabel: string
	status: import('./schemas.js').QueueItemStatus
	lane: import('./schemas.js').QueueLane
	progressPercent: number
	progressDetail: string | null
	lastStatus: StatusSnapshot | null
	error: LocalizedError | null
	addedAt: string | null
	finishedAt: string | null
	playlistGroupId?: string
	// Per-item opt-out for the playlist `.m3u` artifact. Defaults true; only an
	// explicit `false` (set by the wizard in playlist mode) suppresses the write.
	writeM3u: boolean
	// Persisted resume context. `lastJobId` set iff status ∈ {running,
	// paused-active}; `tempDir` set iff paused-active mid-download.
	tempDir?: string
	lastJobId?: string
	resumeContext?: QueueResumeContext
	// Automatic-retry bookkeeping. `retryAt` is present only while a retry is
	// pending, and drives the countdown the queue row shows.
	retryCount: number
	retryAt?: string
	probeInfoJsonRef?: ProbeInfoJsonRef
	// `exploreSession` once a probe escalated; sticky for the job's whole life.
	auth?: JobAuth
	artifacts: QueueArtifact[]
	// Placeholder rows only: the probe's playlist mode, and the open decision.
	probeMode?: ProbePlaylistMode
	choice?: import('./schemas.js').QueueChoice
	pinnedProfile?: import('./intake/intakeSchemas.js').PinnedDownloadProfile
	origin?: import('./intake/intakeSchemas.js').IntakeOrigin
	job: PreparedJob
}

// Wire format for queue:event:snapshot and queue:cmd:getSnapshot — full item
// list plus the global scheduler-pause flag, so the renderer can hydrate the
// "queue paused" feedback state on boot.
export interface QueueSnapshotPayload {
	items: QueueItem[]
	schedulerPaused: boolean
}

// Wire format for queue:event:scheduler — the global scheduler-pause flag
// flipped. Emitted only on real transitions (a no-op re-pause emits nothing).
export interface QueueSchedulerEventPayload {
	paused: boolean
}

export interface QueueResumeContext {
	kind: 'media-retry'
	tempDir: string
	reason: 'media-transfer' | 'postprocess'
	failureKind: YtDlpErrorKind
}

/**
 * What a video is filed under beyond who posted it, for the `{categories}`,
 * `{artist}`, `{album}` and `{track}` filename tokens. Sparse: most sites set
 * only a category, and only music sites set the rest. Blank values are left out.
 */
export interface MediaTags {
	category?: string // first of yt-dlp's `categories`
	artist?: string // `artist`, else yt-dlp's `artists` joined with ", "
	album?: string
	track?: string
}

export interface PlaylistEntry {
	id: string
	url: string
	title: string
	thumbnail: string
	duration?: number
	playlistIndex: number
	videoId: string | null // raw yt-dlp %(id)s; null when extractor yields none
	probeInfoJsonRef?: ProbeInfoJsonRef
	// Set by this row's own hydration probe; a flat playlist probe lists none.
	// The name budget sizes yt-dlp's in-flight names from them.
	probedFormats?: readonly InFlightFormat[]
	// Inherited from the playlist probe, or set by this row's own hydration probe.
	auth?: JobAuth
	// Filename templates can name directories after {uploader} / {date}, and
	// Arroxy renders those itself because it needs the path before downloading.
	// Sparse on flat playlist probes — an absent value collapses the folder.
	uploader?: string // uploader → channel → creator → uploader_id, resolved at probe time
	uploadDate?: string // raw yt-dlp upload_date (YYYYMMDD)
	mediaTags?: MediaTags
	timestamp?: number // epoch seconds from yt-dlp `timestamp`; too coarse-grained uploadDate cannot order same-day uploads
	// This row is a channel/playlist/album, not a video. Set only on the rows
	// mapPlaylistEntries keeps when a result holds nothing else (its all-nested
	// fallback) — they stay visible so the picker isn't empty, but they must
	// never become a download job: the URL addresses a whole set while a job
	// carries one pre-bound filename. A flag rather than a URL check because the
	// shape is not always tellable — `music.youtube.com/browse/MPRE…` is an album
	// that classifyUrlIntent reads as `unknown`.
	isContainer?: true
	// The display title was fabricated by the flat-playlist probe fallback
	// (`Untitled · #N`) because the extractor supplied no title. A fabricated
	// title must never bind into a filename — playlistEntryTemplateMeta maps it
	// to `title: undefined` so bindFilenameTemplate leaves `{title}` as a
	// late-binding placeholder for yt-dlp to resolve at download time. The
	// site-provided id hint (YouTube browse-id prefixes) is a real hint, not a
	// placeholder, and does not set this flag.
	titleIsPlaceholder?: true
}

export interface ProbeInput {
	url: string
	// Disambiguates mixed YouTube URLs (?v=X&list=Y). 'auto' lets yt-dlp's
	// extractor decide; 'video' forces single-video resolution; 'playlist'
	// forces playlist enumeration.
	playlistMode?: ProbePlaylistMode
	// Probe-time scope for playlist/channel/search enumeration. Downloads still
	// split into Arroxy queue items after this filtered flat probe.
	playlistScope?: PlaylistScope
	// Optional cancellation key: lets the caller abort exactly this probe
	// later (probeCancel(key)) without touching other in-flight probes —
	// hotkey probing rows key on their queue item id.
	ownerKey?: string
	// Per-call budget override (ms). Background hydration pins 180s; absent
	// keeps the 180s interactive default. Mirrors probeSchema's timeoutMs.
	timeoutMs?: number
}

interface ProbeCommon {
	extractor: string
	extractorKey: string
	webpageUrl: string
	// True when the extractor only ever returns audio content (Bandcamp,
	// SoundCloud, QQMusic, Mixcloud, etc.). Renderer uses this to default the
	// wizard to audio-only mode without making the user override the format
	// picker every time. See `isAudioOnlySource()` in shared/ytdlp.
	isAudioOnlySource: boolean
	// Set when the probe only succeeded with the Explore session; the jobs it
	// produces must run signed in too.
	auth?: JobAuth
}

// A chapter of a video, in whole seconds, as the probe reports it.
export interface VideoChapter {
	title: string
	startSeconds: number
	endSeconds: number
}

export interface VideoProbeResult extends ProbeCommon {
	kind: 'video'
	videoId?: string | null
	probeInfoJsonRef?: ProbeInfoJsonRef
	formats: FormatOption[]
	// The formats as yt-dlp sees them, for the profile pick to choose as yt-dlp
	// would. Absent on results built without a probe (the mock backend,
	// scenarios); the pick then reads the options (`selectionSourceFromOptions`).
	formatSelection?: FormatSelectionSource
	title: string
	thumbnail: string
	duration?: number
	// Absent on results built outside ProbeService (mocks, older fixtures).
	chapters?: VideoChapter[]
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
	isLive: boolean
	hasDrm: boolean
	availability?: string
	ageLimit?: number
	degraded?: {reasons: ProbeDegradationReason[]}
	// See PlaylistEntry for why these exist and how absence is handled.
	uploader?: string // uploader → channel → creator → uploader_id, resolved at probe time
	uploadDate?: string // raw yt-dlp upload_date (YYYYMMDD)
	mediaTags?: MediaTags
	timestamp?: number // epoch seconds from yt-dlp `timestamp`
}

export interface PlaylistProbeResult extends ProbeCommon {
	kind: 'playlist'
	isMultiVideo: boolean
	playlistId: string
	playlistTitle: string
	entries: PlaylistEntry[]
}

export type ProbeResult = VideoProbeResult | PlaylistProbeResult

export interface ProbeInfoJsonRef {
	id: string
	createdAt: string
	videoId?: string
	// The probe saw YouTube list formats without download URLs (yt-dlp's
	// "missing a URL" warning), which can cap the download's quality.
	formatsWithheld?: true
	// The probe that wrote it ran with the Explore session, so only a signed-in
	// run may replay it.
	auth?: JobAuth
}

export interface ProbeProgressEvent {
	url: string
	playlistMode: ProbePlaylistMode
	phase: 'pages' | 'items'
	loaded: number
	total?: number
	at: string
}

export type DownloadStage = 'setup' | 'token' | 'download' | 'done' | 'error'

export interface StatusEvent {
	jobId: string
	stage: DownloadStage
	statusKey: StatusKey
	params?: Record<string, string | number>
	error?: LocalizedError
	resumeContext?: QueueResumeContext
	at: string
}

export interface ProgressEvent {
	jobId: string
	line: string
	at: string
	percent?: number
	// yt-dlp's transfer rate (bytes/s) and time left (s), from a structured
	// progress record.
	speedBps?: number
	etaSeconds?: number
}

export interface QueueArtifactEvent {
	jobId: string
	path: string
	kind: QueueArtifactKind
	at: string
	fromPath?: string
	internal?: boolean
	sizeBytes?: number
	// On the media event a completed job announces: the video's title from the
	// info-json yt-dlp wrote, unsanitized. Names a placeholder row.
	title?: string
}

export const DEPENDENCY_IDS = ['yt-dlp', 'ffmpeg', 'ffprobe'] as const
export type DependencyId = (typeof DEPENDENCY_IDS)[number]

export type DependencySource =
	| {kind: 'manualOverride'; path: string}
	| {kind: 'envOverride'; path: string; envVar: string}
	| {kind: 'managed'; channel: RuntimeBinaryChannel; url: string; provider: RuntimeBinaryProvider}
	| {kind: 'managedCache'; channel: RuntimeBinaryChannel; url: string; provider: RuntimeBinaryProvider; path: string}
	| {kind: 'systemPath'; path: string}
	| {kind: 'cache'; path: string}
	| {kind: 'bundled'; path: string}

export type DependencyFailureKind = 'download_failed' | 'extract_failed' | 'hash_failed' | 'spawn_failed' | 'permission_denied' | 'blocked_or_quarantined' | 'bad_exit_code' | 'timeout' | 'pair_incomplete'

// Stable, language-independent codes for each failure kind. Shown in the
// repair UI so users can search ("ARX-006 SmartScreen") on Google/GitHub
// without being blocked by their UI language. Keep these immutable —
// renaming a kind is fine, repurposing a code is not.
export const FAILURE_CODE: Record<DependencyFailureKind, string> = {download_failed: 'ARX-001', extract_failed: 'ARX-002', hash_failed: 'ARX-003', spawn_failed: 'ARX-004', permission_denied: 'ARX-005', blocked_or_quarantined: 'ARX-006', bad_exit_code: 'ARX-007', timeout: 'ARX-008', pair_incomplete: 'ARX-009'}

export type DependencyState = 'missing' | 'downloaded' | 'verified' | 'runnable' | 'failed'

export interface DependencyFailure {
	kind: DependencyFailureKind
	message: string
	osCode?: string
}

export interface DependencyAttempt {
	source: DependencySource
	failure?: DependencyFailure
}

export interface DependencyDiagnostic {
	id: DependencyId
	state: DependencyState
	source: DependencySource | null
	resolvedPath: string | null
	versionOutput?: string
	failure?: DependencyFailure
	attempts: DependencyAttempt[]
}

export interface WarmUpOutput {
	completed: boolean
	dependencies: Record<DependencyId, DependencyDiagnostic>
	blockingFailures: DependencyId[]
	cancelled: boolean
}

export type WarmupPhase = 'starting' | 'downloading' | 'extracting' | 'probing' | 'fallback' | 'done' | 'failed' | 'skipped'

export interface WarmupProgressEvent {
	binary: DependencyId
	phase: WarmupPhase
	bytesDownloaded?: number
	totalBytes?: number
	source?: DependencySource
	failureKind?: DependencyFailureKind
	// Only set on `probing`. True when no verdict was memoized for this exact
	// file, so the probe is a real spawn — the case a security scanner can hold
	// for ~15s. False means the memo answered and the phase ends immediately.
	// The splash uses this to explain a long wait instead of looking hung.
	firstCheck?: boolean
}

export interface CommonPaths {
	downloads: string | null
	videos: string | null
	music: string | null
	desktop?: string | null
	documents?: string | null
	pictures?: string | null
	home?: string | null
}

export interface FeedbackDiagnosticUpload {
	reportId: string
	diagnosticUrl: string | null
	rawBytes: number
	compressedBytes: number
	truncated: boolean
	sha256: string
}

export interface StartDownloadInput {
	url: string
	outputDir?: string
	cookiesMode?: CookiesMode
	job: PreparedJob
	auth?: JobAuth
	tempDir?: string
	// Main-process-only resolved path for an opaque QueueItem.probeInfoJsonRef.
	// The IPC start schema intentionally does not accept this from the renderer.
	probeInfoJsonPath?: string
	// Main-process-only: the probe that wrote that info-json saw YouTube withhold
	// format URLs. A download that loads it skips extraction and so never prints
	// the warning itself.
	probeFormatsWithheld?: boolean
}

// The narrowed shape once DownloadService.start() has refused the unresolved
// probe-stage placeholder — the only shape phases ever observe.
export type ResolvedStartDownloadInput = StartDownloadInput & {job: Exclude<PreparedJob, {kind: 'unresolved'}>}

export interface StartDownloadOutput {
	job: DownloadJob
}

export interface CancelDownloadInput {
	jobId?: string
}

export interface CancelDownloadOutput {
	cancelled: boolean
}

export interface PauseDownloadInput {
	jobId?: string
}

export interface PauseDownloadOutput {
	paused: boolean
	// Persisted resume context — set when paused = true. Renderer writes both
	// back onto the QueueItem so a later resume after restart can re-spawn
	// yt-dlp pointed at the same `.part` files instead of starting fresh.
	tempDir?: string
	jobId?: string
}

export type InstallChannel = 'direct' | 'winget' | 'scoop' | 'homebrew' | 'flatpak' | 'portable' | 'appimage' | 'tarball'

export const INSTALL_CHANNELS: readonly InstallChannel[] = ['direct', 'winget', 'scoop', 'homebrew', 'flatpak', 'portable', 'appimage', 'tarball'] as const

export interface UpdateAvailablePayload {
	version: string
	currentVersion: string
	installChannel: InstallChannel
	// True only for a direct macOS install with `brew` on the Mac: the banner can
	// then offer to move the app under Homebrew while updating.
	homebrewAvailable: boolean
}

export type UpdateInstallResult = {ok: true} | {ok: false; error: string}

export type WizardTransition = 'submitUrl' | 'advance' | 'back' | 'skipToConfirm' | 'retry' | 'reset' | 'playlistScopeReloadStart' | 'playlistScopeReloadSuccess' | 'playlistScopeReloadFailure' | 'playlistScopeReloadIgnored'

export interface WizardStepSnapshot {
	transition: WizardTransition
	fromStep: WizardStepName
	toStep: WizardStepName
	snapshot: Record<string, unknown>
}

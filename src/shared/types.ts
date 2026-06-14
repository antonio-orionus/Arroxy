import type {LocalizedError, YtDlpErrorKind} from './i18n/types.js'
import type {PreparedJob} from './preparedJob.js'

export type {PreparedJob} from './preparedJob.js'

// Re-export the enum types whose canonical definition lives in `schemas.ts`
// (where they're z.enum schemas). Importing from `@shared/types` continues to
// work for callers that don't care about the schema vs type distinction.
export type {
	Preset,
	PlaylistSelection,
	PlaylistScope,
	PlaylistVideoCodec,
	PlaylistVideoTier,
	PlaylistAudioFormat,
	MediaIntent,
	DownloadProfile,
	DownloadProfileAudioFormat,
	DownloadProfileIcon,
	DownloadProfileMedia,
	DownloadProfileRef,
	DownloadProfileSubtitleSource,
	DownloadProfilesPrefs,
	SubtitleMode,
	SubtitleFormat,
	SponsorBlockMode,
	SponsorBlockCategory,
	SupportedLang,
	UiTheme,
	BackdropRenderMode,
	GraphicsPolicyBackdropReason,
	QueueItemStatus,
	QueueLane,
	AudioConvertTarget,
	AudioBitrate,
	AudioConvert,
	AudioSelection,
	CookiesMode,
	CookiesBrowser,
	NetworkPacingPreset,
	NativeAudioPreference,
	QuickDownloadStatus,
	QuickDownloadProgressPhase,
	ProbeOtherErrorCode,
	WizardMode,
	BulkMetadataStatus,
	BulkMetadataItemStatus,
	BulkMetadataCancelReason,
	BulkUrlKind,
	BulkUrlRejectReason,
	RuntimeBinaryId,
	RuntimeBinaryChannel,
	RuntimeBinaryProvider,
	RuntimeBinaryPlatform,
	RuntimeBinaryManifestEntry,
	RuntimeBinaryIndex
} from './schemas.js'

export type {StatusKey} from './schemas.js'
export type {LocalizedError, YtDlpErrorKind} from './i18n/types.js'

import type {
	AudioSelection,
	Preset,
	PlaylistScope,
	SubtitleMode,
	SubtitleFormat,
	SponsorBlockMode,
	SponsorBlockCategory,
	SupportedLang,
	UiTheme,
	BackdropRenderMode,
	GraphicsPolicyBackdropReason,
	StatusKey,
	CookiesMode,
	CookiesBrowser,
	NetworkPacingPreset,
	NativeAudioPreference,
	DownloadProfilesPrefs,
	ProbeOtherErrorCode,
	RuntimeBinaryChannel,
	RuntimeBinaryProvider
} from './schemas.js'

export type AppErrorCode = 'validation' | 'token' | 'binary' | 'download' | 'ipc' | 'unknown'

export interface AppError {
	code: AppErrorCode
	message: string
	details?: string
	recoverable?: boolean
}

// Discriminated error for the probe IPC command. Separates yt-dlp classified
// failures (carry LocalizedError for i18n + UI gating) from other probe
// failures (carry a plain message). Replaces the AppError.localizedKey bridge.
export type ProbeError = {kind: 'ytdlp'; error: LocalizedError} | {kind: 'other'; code: ProbeOtherErrorCode; message: string; details?: string}

export interface GraphicsPolicy {
	backdrop: {forceRenderMode: BackdropRenderMode | null; softwareWebglAllowed: boolean; fallbackReason?: GraphicsPolicyBackdropReason; renderer?: string; devices?: string[]; featureStatus?: Record<string, string>}
}

// Mode-independent prefs and infrastructure config. Anything that applies
// regardless of single-vs-playlist flow lives here.
export interface CommonSettings {
	defaultOutputDir: string
	rememberLastOutputDir: boolean
	lastSubfolderEnabled?: boolean
	lastSubfolder?: string
	// Stable per-install random UUID used as the OpenPanel `profileId`. No PII —
	// this is a random anonymous identifier, not derived from the user. Generated
	// lazily by SettingsStore on first launch when missing.
	installId?: string
	uiZoom?: number
	uiTheme?: UiTheme
	backdropRenderMode?: BackdropRenderMode
	language?: SupportedLang
	commonPaths?: {downloads: string | null; videos: string | null; desktop: string | null; music: string | null; documents: string | null; pictures: string | null; home: string | null}
	cookiesPath?: string
	cookiesMode?: CookiesMode
	cookiesBrowser?: CookiesBrowser
	proxyUrl?: string
	nativeAudioPreference?: NativeAudioPreference
	limitRate?: string
	playlistProbeLimit?: number
	networkPacingPreset?: NetworkPacingPreset
	pacingSleepRequests?: number
	pacingSleepInterval?: number
	pacingMaxSleepInterval?: number
	pacingSleepSubtitles?: number
	pacingConcurrentFragments?: number
	clipboardWatchEnabled: boolean
	includeIdInSingleFilenames?: boolean
	closeBehavior?: 'ask' | 'tray' | 'quit'
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
	drawerOpen?: boolean
	binaryOverrides?: BinaryOverrides
	successfulDownloadCount?: number
	shareInlineCardDismissed?: boolean
	shareHighValueBannerDismissed?: boolean
}

export interface BinaryOverrides {
	ytDlp?: string
	ffmpeg?: string
	ffprobe?: string
}

// Single-video flow prefs. Restored when the user enters the format-probe path.
// All fields are `?:` only — see singlePrefsPatchSchema in schemas.ts for why
// patch shapes never use null (no third state beyond present/absent).
export interface SinglePrefs {
	lastPreset?: Preset
	lastVideoResolution?: string
	lastAudioSelection?: AudioSelection
	lastSubtitleLanguages?: string[]
	lastSubtitleMode?: SubtitleMode
	lastSubtitleFormat?: SubtitleFormat
}

// Playlist flow prefs.
export interface PlaylistPrefs {
	lastPlaylistSelection?: import('./schemas.js').PlaylistSelection
}

export interface AppSettings {
	common: CommonSettings
	single: SinglePrefs
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
	abr?: number
	audioCodec?: string
	isDrc?: boolean
	filesize?: number
	isVideoOnly: boolean
	isAudioOnly: boolean
	dynamicRange?: string
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

export interface QueueItem {
	id: string
	url: string
	title: string
	thumbnail: string
	outputDir: string
	formatLabel: string
	status: import('./schemas.js').QueueItemStatus
	lane: import('./schemas.js').QueueLane
	progressPercent: number
	progressDetail: string | null
	lastStatus: StatusSnapshot | null
	error: LocalizedError | null
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
	probeInfoJsonRef?: ProbeInfoJsonRef
	job: PreparedJob
}

export interface QueueResumeContext {
	kind: 'media-retry'
	tempDir: string
	reason: 'media-transfer' | 'postprocess'
	failureKind: YtDlpErrorKind
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
}

export type ProbePlaylistMode = 'auto' | 'video' | 'playlist'

export interface ProbeInput {
	url: string
	// Disambiguates mixed YouTube URLs (?v=X&list=Y). 'auto' lets yt-dlp's
	// extractor decide; 'video' forces single-video resolution; 'playlist'
	// forces playlist enumeration.
	playlistMode?: ProbePlaylistMode
	// Probe-time scope for playlist/channel/search enumeration. Downloads still
	// split into Arroxy queue items after this filtered flat probe.
	playlistScope?: PlaylistScope
}

export type ProbeDegradationReason = 'botWall' | 'extractor'

interface ProbeCommon {
	extractor: string
	extractorKey: string
	webpageUrl: string
	// True when the extractor only ever returns audio content (Bandcamp,
	// SoundCloud, QQMusic, Mixcloud, etc.). Renderer uses this to default the
	// wizard to audio-only mode without making the user override the format
	// picker every time. See `isAudioOnlySource()` in shared/ytdlp.
	isAudioOnlySource: boolean
}

export interface VideoProbeResult extends ProbeCommon {
	kind: 'video'
	videoId?: string | null
	probeInfoJsonRef?: ProbeInfoJsonRef
	formats: FormatOption[]
	title: string
	thumbnail: string
	duration?: number
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
	isLive: boolean
	hasDrm: boolean
	availability?: string
	ageLimit?: number
	degraded?: {reasons: ProbeDegradationReason[]}
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
	tempDir?: string
	// Main-process-only resolved path for an opaque QueueItem.probeInfoJsonRef.
	// The IPC start schema intentionally does not accept this from the renderer.
	probeInfoJsonPath?: string
}

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

export type InstallChannel = 'direct' | 'winget' | 'scoop' | 'homebrew' | 'flatpak' | 'portable'

export const INSTALL_CHANNELS: readonly InstallChannel[] = ['direct', 'winget', 'scoop', 'homebrew', 'flatpak', 'portable'] as const

export interface UpdateAvailablePayload {
	version: string
	currentVersion: string
	installChannel: InstallChannel
}

export type UpdateInstallResult = {ok: true} | {ok: false; error: string}

export type WizardStepName = 'url' | 'playlistItems' | 'playlistPresets' | 'formats' | 'subtitles' | 'sponsorblock' | 'output' | 'folder' | 'confirm' | 'error'

export type WizardTransition = 'submitUrl' | 'advance' | 'back' | 'skipSubtitles' | 'skipToConfirm' | 'retry' | 'reset' | 'playlistScopeReloadStart' | 'playlistScopeReloadSuccess' | 'playlistScopeReloadFailure' | 'playlistScopeReloadIgnored'

export interface WizardStepSnapshot {
	transition: WizardTransition
	fromStep: WizardStepName
	toStep: WizardStepName
	snapshot: Record<string, unknown>
}

import {z} from 'zod'
import {isValidSubfolder, SUBFOLDER_NAME_MAX} from './subfolder.js'
import {AUDIO_CONVERT_TARGETS, type AudioConvertTarget} from './audioTargets.js'
import {YT_DLP_ERROR_KINDS, type YtDlpErrorKind} from 'ytdlp-errors'

export type {AudioConvertTarget}
export type {YtDlpErrorKind}
export {YT_DLP_ERROR_KINDS}

// Enum schemas — single source of truth. Types below are inferred so adding
// or removing a value never requires hand-editing a parallel union.

export const presetSchema = z.enum(['best-quality', 'balanced', 'small-file', 'audio-only', 'subtitle-only'])
export type Preset = z.infer<typeof presetSchema>
export const PRESETS = presetSchema.options

// Single source for the wizard step list — previously duplicated by hand as
// `WizardStep` (renderer store/types.ts), `WizardStepName` (shared/types.ts,
// crosses the logStep IPC boundary) and `WIZARD_STEPS` (wizardStepGraph.ts).
export const wizardStepNameSchema = z.enum(['url', 'playlistItems', 'playlistPresets', 'playlistProfiles', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm', 'error'])
export type WizardStepName = z.infer<typeof wizardStepNameSchema>

const PLAYLIST_VIDEO_TIER_VALUES = ['best', '2160', '1440', '1080', '720', '480', '360', '240', '144'] as const
export const playlistVideoTierSchema = z.enum(PLAYLIST_VIDEO_TIER_VALUES)
export type PlaylistVideoTier = z.infer<typeof playlistVideoTierSchema>
// Zod v4 stores enum entries in an object, so numeric-like string keys are
// reordered by JavaScript property ordering. Keep the intended UI order here.
export const PLAYLIST_VIDEO_TIERS: readonly PlaylistVideoTier[] = PLAYLIST_VIDEO_TIER_VALUES

export const playlistVideoCodecSchema = z.enum(['best', 'mp4'])
export type PlaylistVideoCodec = z.infer<typeof playlistVideoCodecSchema>

export const playlistAudioFormatSchema = z.enum(['best', 'mp3', 'm4a', 'opus'])
export type PlaylistAudioFormat = z.infer<typeof playlistAudioFormatSchema>

export const downloadProfileAudioFormatSchema = z.enum(['best', 'mp3', 'm4a', 'opus', 'wav'])
export type DownloadProfileAudioFormat = z.infer<typeof downloadProfileAudioFormatSchema>

export const downloadProfileIconSchema = z.enum(['controls', 'download', 'video', 'captions', 'audio', 'music', 'podcast', 'classes', 'clip', 'archive'])
export type DownloadProfileIcon = z.infer<typeof downloadProfileIconSchema>
export const DOWNLOAD_PROFILE_ICONS = downloadProfileIconSchema.options

export const subtitleModeSchema = z.enum(['sidecar', 'embed', 'subfolder'])
export type SubtitleMode = z.infer<typeof subtitleModeSchema>
export const SUBTITLE_MODES = subtitleModeSchema.options

export const subtitleFormatSchema = z.enum(['srt', 'vtt', 'ass'])
export type SubtitleFormat = z.infer<typeof subtitleFormatSchema>
export const SUBTITLE_FORMATS = subtitleFormatSchema.options

export const sponsorBlockModeSchema = z.enum(['off', 'mark', 'remove'])
export type SponsorBlockMode = z.infer<typeof sponsorBlockModeSchema>
export const SPONSORBLOCK_MODES = sponsorBlockModeSchema.options

export const sponsorBlockCategorySchema = z.enum(['sponsor', 'intro', 'outro', 'selfpromo', 'music_offtopic', 'preview', 'filler'])
export type SponsorBlockCategory = z.infer<typeof sponsorBlockCategorySchema>
export const SPONSORBLOCK_CATEGORIES = sponsorBlockCategorySchema.options

// Audio-conversion targets surfaced in the wizard's audio column. yt-dlp will
// run --extract-audio + --audio-format <target> as a post-processor (requires
// ffmpeg). For lossy targets (mp3/m4a/opus) the bitrate is shared via the
// strip below the column; wav has no bitrate.
const LOSSY_TARGET_VALUES = AUDIO_CONVERT_TARGETS.flatMap(s => (s.lossy ? [s.target] : [])) as ['mp3', 'm4a', 'opus']

export const audioBitrateSchema = z.union([z.literal(128), z.literal(192), z.literal(256), z.literal(320)])
export type AudioBitrate = z.infer<typeof audioBitrateSchema>
export const AUDIO_BITRATES: readonly AudioBitrate[] = [128, 192, 256, 320]
export const DEFAULT_AUDIO_BITRATE: AudioBitrate = 192

export const audioTrackQualitySchema = z.enum(['low', 'medium', 'high'])
export type AudioTrackQuality = z.infer<typeof audioTrackQualitySchema>
export const AUDIO_TRACK_QUALITIES = audioTrackQualitySchema.options

// Hard cap on subtitle languages per download — protects against argv length blow-up.
export const MAX_SUBTITLE_LANGUAGES = 50

export const PLAYLIST_PROBE_LIMIT_MIN = 1
export const PLAYLIST_PROBE_LIMIT_MAX = 5000

export const playlistProbeLimitSchema = z.number().int().min(PLAYLIST_PROBE_LIMIT_MIN).max(PLAYLIST_PROBE_LIMIT_MAX)

const subfolderNameSchema = z
	.string()
	.max(SUBFOLDER_NAME_MAX)
	.refine(s => s === '' || isValidSubfolder(s), {message: 'Invalid subfolder name'})

export const audioConvertSchema = z.discriminatedUnion('target', [z.object({target: z.literal('wav')}), z.object({target: z.enum(LOSSY_TARGET_VALUES), bitrateKbps: audioBitrateSchema})])
export type AudioConvert = z.infer<typeof audioConvertSchema>

export const playlistSelectionSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('video'), tier: playlistVideoTierSchema, codec: playlistVideoCodecSchema}), z.object({kind: z.literal('audio'), format: playlistAudioFormatSchema, bitrateKbps: audioBitrateSchema.optional()})])
export type PlaylistSelection = z.infer<typeof playlistSelectionSchema>
export const DEFAULT_PLAYLIST_SELECTION: PlaylistSelection = {kind: 'video', tier: 'best', codec: 'best'}

// Playlist picker sort order. View-only: `id` and `playlistIndex` are immutable
// probe-order identity (mixes repeat videos, so ids are per-row), and sorting
// never recomputes them. Upload-time modes need per-row `timestamp`; rows
// without one sort last, stable in api order. No update-time option — no
// extractor Arroxy supports provides a modified timestamp.
export const playlistSortModeSchema = z.enum(['api', 'upload-asc', 'upload-desc'])
export type PlaylistSortMode = z.infer<typeof playlistSortModeSchema>
export const PLAYLIST_SORT_MODES = playlistSortModeSchema.options

const downloadProfileAudioSchema = z.object({format: downloadProfileAudioFormatSchema, bitrateKbps: audioBitrateSchema.optional()})

const downloadProfileVideoAudioSchema = z.object({format: z.enum(['best', 'm4a'])})

export const downloadProfileMediaSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('video-audio'), codec: playlistVideoCodecSchema, tiers: z.array(playlistVideoTierSchema).min(1), audio: downloadProfileVideoAudioSchema}),
	z.object({kind: z.literal('video-only'), codec: playlistVideoCodecSchema, tiers: z.array(playlistVideoTierSchema).min(1)}),
	z.object({kind: z.literal('audio-only'), audio: downloadProfileAudioSchema}),
	z.object({kind: z.literal('subtitles-only')})
])
export type DownloadProfileMedia = z.infer<typeof downloadProfileMediaSchema>

export const mediaIntentSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('video-audio'), codec: playlistVideoCodecSchema, tiers: z.array(playlistVideoTierSchema).min(1), audio: downloadProfileVideoAudioSchema}),
	z.object({kind: z.literal('video-only'), codec: playlistVideoCodecSchema, tiers: z.array(playlistVideoTierSchema).min(1)}),
	z.object({kind: z.literal('audio-only'), audio: downloadProfileAudioSchema})
])
export type MediaIntent = z.infer<typeof mediaIntentSchema>

export const downloadProfileSubtitleSourceSchema = z.enum(['manual-first', 'manual-only', 'auto-only'])
export type DownloadProfileSubtitleSource = z.infer<typeof downloadProfileSubtitleSourceSchema>

const downloadProfileSubtitlesSchema = z.object({enabled: z.boolean(), languages: z.array(z.string()).max(MAX_SUBTITLE_LANGUAGES), source: downloadProfileSubtitleSourceSchema, mode: subtitleModeSchema, format: subtitleFormatSchema})

const downloadProfileOutputSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('default')}), z.object({kind: z.literal('fixed'), dir: z.string().min(1)})])

// Tokens a user may type in a filename template. The token -> yt-dlp field
// mapping lives in filenameTemplate.ts; only the names are enumerated here.
// `ext` is deliberately absent — the extension is always appended, never typed.
export const filenameTokenSchema = z.enum(['title', 'uploader', 'id', 'date', 'resolution', 'playlist_index', 'playlist_title', 'playlist_id'])
export type FilenameToken = z.infer<typeof filenameTokenSchema>
export const FILENAME_TOKENS = filenameTokenSchema.options
// Templates are path expressions ({uploader}/{playlist_title}/{title}), so the
// cap covers several segments rather than one filename.
export const FILENAME_TEMPLATE_MAX = 200

// Mirrors downloadProfileOutputSchema: `default` inherits the global filename
// template, `custom` overrides it for this profile only.
const downloadProfileFilenameSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('default')}), z.object({kind: z.literal('custom'), template: z.string().trim().min(1).max(FILENAME_TEMPLATE_MAX)})])

export const downloadProfileSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1).max(80),
	icon: downloadProfileIconSchema,
	// `.default` so every profile persisted before the visibility switch existed
	// keeps parsing and lands enabled — same migration lever as `filename` below.
	enabled: z.boolean().default(true),
	media: downloadProfileMediaSchema,
	subtitles: downloadProfileSubtitlesSchema,
	output: downloadProfileOutputSchema,
	// `.default` so profiles persisted before templates existed keep parsing
	// instead of being dropped as invalid on upgrade.
	filename: downloadProfileFilenameSchema.default({kind: 'default'}),
	subfolder: z.object({enabled: z.boolean(), name: subfolderNameSchema}),
	sponsorBlock: z.object({mode: sponsorBlockModeSchema, categories: z.array(sponsorBlockCategorySchema)}),
	embed: z.object({chapters: z.boolean(), metadata: z.boolean(), thumbnail: z.boolean(), description: z.boolean(), thumbnailSidecar: z.boolean()}),
	createdAt: z.string(),
	updatedAt: z.string()
})
export type DownloadProfile = z.infer<typeof downloadProfileSchema>

export const downloadProfileRefSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('builtin'), id: z.string().min(1)}), z.object({kind: z.literal('custom'), id: z.string().min(1)})])
export type DownloadProfileRef = z.infer<typeof downloadProfileRefSchema>

export const downloadProfilesPrefsSchema = z.object({
	active: downloadProfileRefSchema,
	custom: z.array(downloadProfileSchema),
	overrides: z.array(downloadProfileSchema),
	// Built-in visibility only. Keyed by built-in id; absent = use the built-in's
	// own `enabled` default, so a later change to that default still reaches users.
	// Custom profiles carry their own `enabled` — they are fully persisted.
	enabledOverrides: z.record(z.string(), z.boolean()).default({})
})
export type DownloadProfilesPrefs = z.infer<typeof downloadProfilesPrefsSchema>

// Renderer's audio-column selection. Three convert kinds + native + none.
// Defined here (not in renderer/store/types.ts) because it's persisted in
// `SinglePrefs.lastAudioSelection`, so the IPC patch schema needs to validate it.
export const audioSelectionSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('none')}),
	z.object({kind: z.literal('native'), formatId: z.string().min(1)}),
	z.object({kind: z.literal('convert-lossless'), target: z.literal('wav')}),
	z.object({kind: z.literal('convert-lossy'), target: z.enum(LOSSY_TARGET_VALUES), bitrateKbps: audioBitrateSchema})
])
export type AudioSelection = z.infer<typeof audioSelectionSchema>

export const supportedLangSchema = z.enum(['om', 'id', 'de', 'en', 'es', 'fr', 'sw', 'uz', 'pt', 'vi', 'tr', 'am', 'ar', 'ur', 'ps', 'bn', 'hi', 'my', 'el', 'ru', 'sr', 'uk', 'zh', 'ja'])
export type SupportedLang = z.infer<typeof supportedLangSchema>
export const SUPPORTED_LANGS = supportedLangSchema.options

export const uiThemeSchema = z.enum(['light', 'dark', 'system'])
export type UiTheme = z.infer<typeof uiThemeSchema>

export const closeBehaviorSchema = z.enum(['ask', 'tray', 'quit'])
export type CloseBehavior = z.infer<typeof closeBehaviorSchema>

// Electron accelerator chord for the global clipboard-download hotkey. The
// shape is validated, not enumerated: modifiers + one key. Registered via
// Electron's globalShortcut, which rejects malformed chords at register time.
export const hotkeyAcceleratorSchema = z
	.string()
	.regex(/^(CommandOrControl|Cmd|Ctrl|Alt|Option|AltGr|Shift|Super|Meta)(\+(CommandOrControl|Cmd|Ctrl|Alt|Option|AltGr|Shift|Super|Meta))*\+([0-9A-Z]|F([1-9]|1[0-9])|Space|Tab|Capslock|Numlock|Scrolllock|Backquote)$/, 'Use modifiers plus one key, e.g. CommandOrControl+Shift+D')
export type HotkeyAccelerator = z.infer<typeof hotkeyAcceleratorSchema>

// Every hotkey trigger attempt ends in exactly one of these outcomes — no
// silent paths (the OmniGet #198 lesson). The renderer derives the outcome
// and reports it back so main can notify on hidden windows.
export const hotkeyOutcomeSchema = z.enum(['queued', 'already-queued', 'invalid-clipboard', 'multiple-urls', 'submission-failed', 'needs-review', 'busy'])
export type HotkeyOutcome = z.infer<typeof hotkeyOutcomeSchema>

// The schema validates the renderer→main report payload; main decorates the
// event it forwards with its own `toast` verdict — focused + on-screen (see
// hotkeyFeedback) — so the renderer knows whether to surface the toast. Two
// shapes, explicitly: the report (renderer→main) and the event (main→renderer).
export const hotkeyOutcomePayloadSchema = z.object({outcome: hotkeyOutcomeSchema, url: z.string().optional()})
export type HotkeyOutcomePayload = z.infer<typeof hotkeyOutcomePayloadSchema>
export const hotkeyOutcomeEventSchema = hotkeyOutcomePayloadSchema.extend({toast: z.boolean()})
export type HotkeyOutcomeEvent = z.infer<typeof hotkeyOutcomeEventSchema>

// Main reads the clipboard (the renderer cannot while hidden) and sends the
// pre-classified trigger. Renderer never touches the clipboard for the hotkey.
export const hotkeyTriggerSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('single'), url: z.string()}), z.object({kind: z.literal('multiple')}), z.object({kind: z.literal('empty')})])
export type HotkeyTriggerPayload = z.infer<typeof hotkeyTriggerSchema>

// Registration state, pulled by the settings UI (register() returns false when
// another app owns the chord).
export const hotkeyStateSchema = z.object({accelerator: z.string().nullable(), registered: z.boolean()})
export type HotkeyState = z.infer<typeof hotkeyStateSchema>
export const hotkeyRegistrationStatusSchema = z.enum(['off', 'pending', 'registered', 'conflict'])
export type HotkeyRegistrationStatus = z.infer<typeof hotkeyRegistrationStatusSchema>

export const backdropRenderModeSchema = z.enum(['css-only', 'gpu'])
export type BackdropRenderMode = z.infer<typeof backdropRenderModeSchema>

export const graphicsPolicyBackdropReasonSchema = z.enum(['gpu-feature-disabled', 'gpu-feature-software', 'virtual-or-software-renderer', 'gpu-info-unavailable'])
export type GraphicsPolicyBackdropReason = z.infer<typeof graphicsPolicyBackdropReasonSchema>

export const quickDownloadStatusSchema = z.enum(['idle', 'preparing', 'queued', 'error'])
export type QuickDownloadStatus = z.infer<typeof quickDownloadStatusSchema>

export const quickDownloadProgressPhaseSchema = z.enum(['probing', 'queueing'])
export type QuickDownloadProgressPhase = z.infer<typeof quickDownloadProgressPhaseSchema>
export const QUICK_DOWNLOAD_PROGRESS_PHASES = quickDownloadProgressPhaseSchema.options

export const wizardModeSchema = z.enum(['single', 'playlist', 'bulk'])
export type WizardMode = z.infer<typeof wizardModeSchema>

export const bulkMetadataStatusSchema = z.enum(['idle', 'resolving', 'done'])
export type BulkMetadataStatus = z.infer<typeof bulkMetadataStatusSchema>

export const bulkMetadataItemStatusSchema = z.enum(['pending', 'resolving', 'done', 'failed'])
export type BulkMetadataItemStatus = z.infer<typeof bulkMetadataItemStatusSchema>

export const bulkMetadataCancelReasonSchema = z.enum(['queue-submit', 'reset', 'back-to-url', 'start-new-bulk'])
export type BulkMetadataCancelReason = z.infer<typeof bulkMetadataCancelReasonSchema>

export const probeOtherErrorCodeSchema = z.enum(['cancelled', 'cookies_config', 'invalid_url', 'no_formats', 'parse', 'playlist_empty', 'redirect_loop', 'schema', 'unknown'])
export type ProbeOtherErrorCode = z.infer<typeof probeOtherErrorCodeSchema>

export const appErrorCodeSchema = z.enum(['validation', 'conflict', 'token', 'binary', 'download', 'ipc', 'unknown'])
export type AppErrorCode = z.infer<typeof appErrorCodeSchema>

export const bulkUrlKindSchema = z.enum(['single', 'playlist', 'channel', 'search', 'mixed', 'unknown'])
export type BulkUrlKind = z.infer<typeof bulkUrlKindSchema>

export const bulkUrlRejectReasonSchema = z.enum(['duplicate'])
export type BulkUrlRejectReason = z.infer<typeof bulkUrlRejectReasonSchema>

export const cookiesModeSchema = z.enum(['off', 'file', 'browser'])
export type CookiesMode = z.infer<typeof cookiesModeSchema>

export const cookiesBrowserSchema = z.enum(['firefox', 'chromium', 'chrome', 'brave', 'edge', 'safari', 'vivaldi'])
export type CookiesBrowser = z.infer<typeof cookiesBrowserSchema>

export const networkPacingPresetSchema = z.enum(['off', 'balanced', 'careful', 'custom'])
export type NetworkPacingPreset = z.infer<typeof networkPacingPresetSchema>

export const nativeAudioPreferenceSchema = z.enum(['compatible', 'surround'])
export type NativeAudioPreference = z.infer<typeof nativeAudioPreferenceSchema>
export const NATIVE_AUDIO_PREFERENCES = nativeAudioPreferenceSchema.options

export const pacingSleepSecondsSchema = z.number().min(0).max(120)
// Parallel connections for one video's media transfer (yt-dlp
// `--concurrent-fragments`). 0 means off — a single connection, yt-dlp's own
// default. Capped because throughput saturates on the user's bandwidth well
// before this ceiling, while higher values only add rate-limit risk.
export const DOWNLOAD_CONNECTIONS_MAX = 16
export const downloadConnectionsSchema = z.number().int().min(0).max(DOWNLOAD_CONNECTIONS_MAX)

// How many queue items download simultaneously. Distinct from download
// connections, which widens a single item's transfer. Capped well below the
// point where parallel jobs stop helping and start reading as scripted
// traffic to the sites being downloaded from.
export const CONCURRENT_DOWNLOADS_MAX = 8
export const concurrentDownloadsSchema = z.number().int().min(1).max(CONCURRENT_DOWNLOADS_MAX)

// Automatic retries per queue item after a transient failure. 0 means off —
// failures wait for the user, which is the historical behavior. Bounded
// because an unbounded loop against a site that keeps refusing is
// indistinguishable from hammering it.
export const AUTO_RETRY_ATTEMPTS_MAX = 10
export const autoRetryAttemptsSchema = z.number().int().min(0).max(AUTO_RETRY_ATTEMPTS_MAX)

export const runtimeBinaryIdSchema = z.enum(['yt-dlp'])
export type RuntimeBinaryId = z.infer<typeof runtimeBinaryIdSchema>

export const runtimeBinaryChannelSchema = z.enum(['nightly', 'stable', 'default'])
export type RuntimeBinaryChannel = z.infer<typeof runtimeBinaryChannelSchema>

export const runtimeBinaryProviderSchema = z.enum(['github', 'sourceforge'])
export type RuntimeBinaryProvider = z.infer<typeof runtimeBinaryProviderSchema>

export const runtimeBinaryPlatformSchema = z.enum(['win32', 'darwin', 'linux'])
export type RuntimeBinaryPlatform = z.infer<typeof runtimeBinaryPlatformSchema>

const runtimeBinaryArchSchema = z.enum(['x64', 'arm64'])

const runtimeBinaryFormatSchema = z.enum(['raw', 'zip'])

export const runtimeBinaryManifestEntrySchema = z.object({
	id: runtimeBinaryIdSchema,
	channel: runtimeBinaryChannelSchema,
	provider: runtimeBinaryProviderSchema,
	version: z.string().trim().min(1),
	platform: runtimeBinaryPlatformSchema,
	arch: runtimeBinaryArchSchema,
	url: z.url(),
	mirrors: z.array(z.url()).default([]),
	size: z.number().int().positive(),
	sha256: z.string().regex(/^[a-f0-9]{64}$/),
	format: runtimeBinaryFormatSchema,
	executablePath: z.string().trim().min(1)
})
export type RuntimeBinaryManifestEntry = z.infer<typeof runtimeBinaryManifestEntrySchema>

export const runtimeBinaryIndexSchema = z.object({schemaVersion: z.literal(1), generatedAt: z.iso.datetime({offset: true}), entries: z.array(runtimeBinaryManifestEntrySchema).min(1)})
export type RuntimeBinaryIndex = z.infer<typeof runtimeBinaryIndexSchema>

// QueueItemStatus is now a 7-value union with paused split. paused-held is
// "queued + waiting + never spawned a job" (resume = transition to pending).
// paused-active is "had a running job, user paused it" (resume = re-spawn,
// possibly across an app restart via persisted tempDir + lastJobId).
export const queueItemStatusSchema = z.enum(['probing', 'pending', 'running', 'paused-held', 'paused-active', 'done', 'error', 'cancelled'])
export type QueueItemStatus = z.infer<typeof queueItemStatusSchema>

// Lane controls how the scheduler treats an item. `normal` items respect the
// single-slot cap and the inter-job sleep window — typical queue flow.
// `priority` items spawn alongside whatever is running and bypass the sleep
// window, gated only by the maxConcurrent ceiling. User intent: "skip the
// queue, pull this now." Set via the wizard's "Pull it!" CTA or the Queue
// Manager's Pull-now action.
export const queueLaneSchema = z.enum(['normal', 'priority'])
export type QueueLane = z.infer<typeof queueLaneSchema>

export const queueArtifactKindSchema = z.enum(['media', 'subtitle', 'thumbnail', 'description', 'companion', 'unknown'])
export type QueueArtifactKind = z.infer<typeof queueArtifactKindSchema>

export const queueSelectionActionSchema = z.enum(['pause', 'resume', 'cancel', 'retry', 'remove', 'pull-now'])
export type QueueSelectionAction = z.infer<typeof queueSelectionActionSchema>

const queueActionSkippedFailureReasonSchema = z.enum(['invalid-status', 'failed'])
const queueActionSkippedItemSchema = z.union([z.object({itemId: z.string().min(1), reason: z.literal('not-found')}), z.object({itemId: z.string().min(1), status: queueItemStatusSchema, reason: queueActionSkippedFailureReasonSchema})])
export type QueueActionSkippedItem = z.infer<typeof queueActionSkippedItemSchema>

export const queueTableColumnIdSchema = z.enum(['title', 'status', 'progressPercent', 'formatLabel', 'outputDir', 'artifacts', 'addedAt', 'finishedAt'])
export type QueueTableColumnId = z.infer<typeof queueTableColumnIdSchema>
export const QUEUE_TABLE_COLUMN_IDS = queueTableColumnIdSchema.options

const ytDlpErrorKindSchema = z.enum(YT_DLP_ERROR_KINDS)

// Reified queue-status names for use in equality checks. Exact mirror of the schema.
export const QUEUE_STATUS = {probing: 'probing', pending: 'pending', running: 'running', pausedHeld: 'paused-held', pausedActive: 'paused-active', done: 'done', error: 'error', cancelled: 'cancelled'} as const satisfies Record<string, QueueItemStatus>

// Status keys emitted by DownloadService and consumed by the renderer for i18n.
// Defined as a const object so call-sites can reference STATUS_KEY.X — typos
// become compile errors and the runtime values match the i18n locale keys.
export const STATUS_KEY = {
	preparingBinaries: 'preparingBinaries',
	mintingToken: 'mintingToken',
	remintingToken: 'remintingToken',
	startingYtdlp: 'startingYtdlp',
	downloadingMedia: 'downloadingMedia',
	mergingFormats: 'mergingFormats',
	extractingAudio: 'extractingAudio',
	convertingVideo: 'convertingVideo',
	embeddingMetadata: 'embeddingMetadata',
	movingFiles: 'movingFiles',
	fetchingSubtitles: 'fetchingSubtitles',
	sleepingBetweenRequests: 'sleepingBetweenRequests',
	subtitlesFailed: 'subtitlesFailed',
	cancelled: 'cancelled',
	complete: 'complete',
	usedExtractorFallback: 'usedExtractorFallback',
	ytdlpProcessError: 'ytdlpProcessError',
	ytdlpExitCode: 'ytdlpExitCode',
	downloadingBinary: 'downloadingBinary',
	unknownStartupFailure: 'unknownStartupFailure',
	diskSpaceInsufficient: 'diskSpaceInsufficient',
	fetchingSponsorBlock: 'fetchingSponsorBlock',
	retryingSponsorBlock: 'retryingSponsorBlock'
} as const
export type StatusKey = (typeof STATUS_KEY)[keyof typeof STATUS_KEY]

const statusKeySchema = z.enum(Object.values(STATUS_KEY) as [StatusKey, ...StatusKey[]])

// Zoom bounds — kept here so the schema constraint and the renderer clamp share one source.
export const ZOOM_MIN = 0.7
export const ZOOM_MAX = 1.5
export const ZOOM_STEP = 0.05

// Permissive http(s) URL schema. Multi-site support means we can't pre-filter
// by host — yt-dlp itself decides whether the URL is supported (via extractor
// match) and surfaces "Unsupported URL" via stderr if not.
const webUrlSchema = z.url('URL must be valid').refine(value => /^https?:\/\//i.test(value), {message: 'Only http/https URLs are supported'})

const playlistScopeItemsSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('app-limit')}),
	z.object({kind: z.literal('first'), count: playlistProbeLimitSchema}),
	z.object({kind: z.literal('range'), from: playlistProbeLimitSchema, to: playlistProbeLimitSchema}).refine(value => value.from <= value.to, {message: 'Range start must be less than or equal to range end', path: ['to']})
])

export const playlistScopeSchema = z.object({items: playlistScopeItemsSchema})
export type PlaylistScope = z.infer<typeof playlistScopeSchema>

export const probeSchema = z.object({url: webUrlSchema, playlistMode: z.enum(['auto', 'video', 'playlist']).optional(), playlistScope: playlistScopeSchema.optional(), ownerKey: z.string().min(1).optional()})

// PreparedJob discriminated-union schema. Type aliases live in
// `./preparedJob`; the runtime validator lives here so callers that already
// import from `@shared/schemas` get one source of truth and the import graph
// stays acyclic.

const subtitleOptionsSchema = z.object({languages: z.array(z.string()), mode: subtitleModeSchema, format: subtitleFormatSchema, writeAuto: z.boolean()})

const sponsorBlockOptionsSchema = z.discriminatedUnion('mode', [z.object({mode: z.literal('off')}), z.object({mode: z.enum(['mark', 'remove']), categories: z.array(sponsorBlockCategorySchema)})])

const embedOptionsSchema = z.object({chapters: z.boolean(), metadata: z.boolean(), thumbnail: z.boolean(), description: z.boolean(), thumbnailSidecar: z.boolean()})

const presetOrCustomSchema = z.union([presetSchema, z.literal('custom')])

// Each variant carries the yt-dlp `extractor` + `extractor_key` strings that
// were observed at probe time. These plumb through to download jobs so the
// download path can branch on extractor without re-probing.
const extractorIdentitySchema = {extractor: z.string(), extractorKey: z.string()}

export const preparedJobSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('single-format'),
		...extractorIdentitySchema,
		formatId: z.string().min(1),
		preset: presetOrCustomSchema,
		filenameTemplate: z.string().min(1).optional(),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema,
		expectedBytes: z.number().positive().optional()
	}),
	z.object({kind: z.literal('audio-convert'), ...extractorIdentitySchema, audioConvert: audioConvertSchema, preset: presetOrCustomSchema, filenameTemplate: z.string().min(1).optional(), subtitles: subtitleOptionsSchema.optional(), sponsorBlock: sponsorBlockOptionsSchema, embed: embedOptionsSchema}),
	z.object({
		kind: z.literal('ranged-format'),
		...extractorIdentitySchema,
		intent: mediaIntentSchema,
		formatSelector: z.string().min(1).optional(),
		formatSort: z.string().min(1).optional(),
		mergeOutputFormat: z.string().min(1).optional(),
		audioConvert: audioConvertSchema.optional(),
		filenameTemplate: z.string().min(1),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema
	}),
	z.object({kind: z.literal('subtitle-only'), ...extractorIdentitySchema, filenameTemplate: z.string().min(1).optional(), subtitles: subtitleOptionsSchema}),
	z.object({kind: z.literal('unresolved'), extractor: z.literal(''), extractorKey: z.literal('')})
])

export const startDownloadSchema = z.object({url: webUrlSchema, outputDir: z.string().min(1).optional(), cookiesMode: cookiesModeSchema.optional(), job: preparedJobSchema})

export const cancelDownloadSchema = z.object({jobId: z.string().optional()})

export const pauseResumeSchema = z.object({jobId: z.string().optional()})

export const resumeSchema = z.object({jobId: z.string().min(1)})

export const analyticsTrackSchema = z.object({name: z.string().min(1).max(64), props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()})

// yt-dlp `--limit-rate` syntax: integer or decimal followed by K (KB/s) or M (MB/s).
// e.g. "500K", "1.5M". Case-insensitive. Stored verbatim — passed straight to yt-dlp.
// Empty string is the "off" representation (same pattern as proxyUrl). YtDlp.run()
// applies `nonEmpty(value.trim())` so empty / whitespace yields no flag.
export const limitRateSchema = z.string().regex(/^(|\s*|\d+(\.\d+)?[KM])$/i, 'Use a number followed by K or M (e.g. 500K, 1.5M)')

const commonPathsSchema = z.object({downloads: z.string().nullable(), videos: z.string().nullable(), desktop: z.string().nullable(), music: z.string().nullable(), documents: z.string().nullable(), pictures: z.string().nullable(), home: z.string().nullable()})

const binaryOverridesSchema = z.object({ytDlp: z.string().min(1).optional(), ffmpeg: z.string().min(1).optional(), ffprobe: z.string().min(1).optional()}).partial()

const commonSettingsSchema = z.object({
	defaultOutputDir: z.string().min(1),
	rememberLastOutputDir: z.boolean(),
	lastSubfolderEnabled: z.boolean().optional(),
	lastSubfolder: subfolderNameSchema.optional(),
	installId: z.string().min(1).optional(),
	uiZoom: z.number().min(ZOOM_MIN).max(ZOOM_MAX).optional(),
	uiTheme: uiThemeSchema.optional(),
	backdropRenderMode: backdropRenderModeSchema.optional(),
	language: supportedLangSchema.optional(),
	commonPaths: commonPathsSchema.optional(),
	cookiesPath: z.string().optional(),
	cookiesMode: cookiesModeSchema.optional(),
	cookiesBrowser: cookiesBrowserSchema.optional(),
	proxyUrl: z.string().optional(),
	nativeAudioPreference: nativeAudioPreferenceSchema.optional(),
	limitRate: limitRateSchema.optional(),
	playlistProbeLimit: playlistProbeLimitSchema.optional(),
	networkPacingPreset: networkPacingPresetSchema.optional(),
	pacingSleepRequests: pacingSleepSecondsSchema.optional(),
	pacingSleepInterval: pacingSleepSecondsSchema.optional(),
	pacingMaxSleepInterval: pacingSleepSecondsSchema.optional(),
	pacingSleepSubtitles: pacingSleepSecondsSchema.optional(),
	downloadConnections: downloadConnectionsSchema.optional(),
	concurrentDownloads: concurrentDownloadsSchema.optional(),
	autoRetryAttempts: autoRetryAttemptsSchema.optional(),
	clipboardWatchEnabled: z.boolean(),
	hotkeyEnabled: z.boolean(),
	hotkeyAccelerator: hotkeyAcceleratorSchema.optional(),
	filenameTemplate: z.string().trim().min(1).max(FILENAME_TEMPLATE_MAX).optional(),
	closeBehavior: closeBehaviorSchema.optional(),
	embedChapters: z.boolean().optional(),
	embedMetadata: z.boolean().optional(),
	embedThumbnail: z.boolean().optional(),
	writeDescription: z.boolean().optional(),
	writeThumbnail: z.boolean().optional(),
	writeM3u: z.boolean().optional(),
	lastSponsorBlockMode: sponsorBlockModeSchema.optional(),
	lastSponsorBlockCategories: z.array(sponsorBlockCategorySchema).optional(),
	analyticsEnabled: z.boolean().optional(),
	firstRunCompleted: z.boolean().optional(),
	launchCount: z.number().int().nonnegative().optional(),
	lastReleaseNotesVersionShown: z.string().trim().min(1).optional(),
	binaryOverrides: binaryOverridesSchema.optional(),
	successfulDownloadCount: z.number().int().nonnegative().optional(),
	shareInlineCardDismissed: z.boolean().optional(),
	shareHighValueBannerDismissed: z.boolean().optional(),
	multiProfileHintDismissed: z.boolean().optional()
})

const singlePrefsSchema = z.object({
	lastPreset: presetSchema.optional(),
	lastVideoResolution: z.string().optional(),
	lastAudioSelection: audioSelectionSchema.optional(),
	lastSubtitleLanguages: z.array(z.string()).optional(),
	lastSubtitleMode: subtitleModeSchema.optional(),
	lastSubtitleFormat: subtitleFormatSchema.optional()
})

const playlistPrefsSchema = z.object({lastPlaylistSelection: playlistSelectionSchema.optional()})

export const appSettingsSchema = z.object({common: commonSettingsSchema, single: singlePrefsSchema, playlist: playlistPrefsSchema, profiles: downloadProfilesPrefsSchema})

// Common paths are derived from the OS and installId is internal; neither is
// accepted from renderer settings updates. Deriving the rest keeps the patch
// contract in lockstep with the persisted settings contract.
const commonSettingsPatchSchema = commonSettingsSchema.partial().omit({commonPaths: true, installId: true})

// Convention for *patch* schemas: every field is `.optional()` only — never
// `.nullable()`. A patch is "fields the caller wants to change"; "absent" is
// the same signal as "no change", so adding `.nullable()` introduces a third
// state ("explicitly clear") that the merge logic in SettingsStore.deepMerge
// doesn't actually distinguish from undefined. Stay in lockstep with
// commonSettingsPatchSchema and playlistPrefsPatchSchema.
const singlePrefsPatchSchema = z.object({
	lastPreset: presetSchema.optional(),
	lastVideoResolution: z.string().optional(),
	lastAudioSelection: audioSelectionSchema.optional(),
	lastSubtitleLanguages: z.array(z.string()).optional(),
	lastSubtitleMode: subtitleModeSchema.optional(),
	lastSubtitleFormat: subtitleFormatSchema.optional()
})

const playlistPrefsPatchSchema = z.object({lastPlaylistSelection: playlistSelectionSchema.optional()})

const downloadProfilesPrefsPatchSchema = z.object({active: downloadProfileRefSchema.optional(), custom: z.array(downloadProfileSchema).optional(), overrides: z.array(downloadProfileSchema).optional(), enabledOverrides: z.record(z.string(), z.boolean()).optional()})

export const updateSettingsSchema = z.object({common: commonSettingsPatchSchema.optional(), single: singlePrefsPatchSchema.optional(), playlist: playlistPrefsPatchSchema.optional(), profiles: downloadProfilesPrefsPatchSchema.optional()}).refine(
	patch => {
		const hasField = (sub: Record<string, unknown> | undefined): boolean => sub !== undefined && Object.values(sub).some(v => v !== undefined)
		return hasField(patch.common) || hasField(patch.single) || hasField(patch.playlist) || hasField(patch.profiles)
	},
	{message: 'settings:update payload must contain at least one defined field'}
)

// Queue item schema — used by both queueSave IPC handler and queueStore.load
// to reject corrupted persistence (manual edits, partial writes).
// Exported for IPC input validation (queue:cmd:probeFailed) — same shape the
// queue persistence schema uses below.
export const localizedErrorSchemaShape = z.object({kind: ytDlpErrorKindSchema, raw: z.string()})

const statusSnapshotSchema = z.object({key: statusKeySchema, params: z.record(z.string(), z.union([z.string(), z.number()])).optional()})

const queueResumeContextSchema = z.object({kind: z.literal('media-retry'), tempDir: z.string().min(1), reason: z.enum(['media-transfer', 'postprocess']), failureKind: ytDlpErrorKindSchema})
const probeInfoJsonRefSchema = z.object({id: z.string().min(1), createdAt: z.string().min(1), videoId: z.string().min(1).optional()})
const queueArtifactSchema = z.object({id: z.string().min(1), kind: queueArtifactKindSchema, path: z.string().min(1), fileName: z.string().min(1), sizeBytes: z.number().int().nonnegative().optional(), discoveredAt: z.string().min(1), missing: z.boolean().optional(), internal: z.boolean().optional()})

export const queueItemSchema = z
	.object({
		id: z.string(),
		url: z.string(),
		title: z.string(),
		thumbnail: z.string(),
		outputDir: z.string(),
		formatLabel: z.string(),
		status: queueItemStatusSchema,
		lane: queueLaneSchema.default('normal'),
		progressPercent: z.number(),
		progressDetail: z.string().nullable(),
		lastStatus: statusSnapshotSchema.nullable(),
		error: localizedErrorSchemaShape.nullable(),
		addedAt: z.string().nullable().default(null),
		finishedAt: z.string().nullable(),
		playlistGroupId: z.string().min(1).optional(),
		// Per-item opt-out for the playlist `.m3u` artifact. Defaults true so
		// pre-existing persisted items (and single-mode items, which ignore it)
		// keep the historical always-on behavior; only an explicit `false` set by
		// the wizard suppresses the write. Consulted in playlist mode only.
		writeM3u: z.boolean().default(true),
		// Persisted resume context. `lastJobId` is set iff status ∈ {running,
		// paused-active}; `tempDir` is set iff status === 'paused-active' and the
		// job was paused mid-download. `tempDir` survives app restart so the
		// resumed yt-dlp run can target the same .part files. Both undefined for
		// paused-held items (they never spawned a job yet).
		tempDir: z.string().min(1).optional(),
		lastJobId: z.string().min(1).optional(),
		resumeContext: queueResumeContextSchema.optional(),
		// Automatic-retry bookkeeping. `retryCount` is how many automatic
		// retries this item has already consumed; `retryAt` is set only while
		// one is scheduled, so a restart can re-arm the timer instead of
		// stranding the item in error.
		retryCount: z.number().int().min(0).default(0),
		retryAt: z.string().optional(),
		probeInfoJsonRef: probeInfoJsonRefSchema.optional(),
		artifacts: z.array(queueArtifactSchema).default([]),
		job: preparedJobSchema
	})
	.superRefine((item, ctx) => {
		// An unresolved job is the probe stage's signature. It is legal only on
		// a live `probing` row or on a terminal probe-error row (probe-failed
		// finalizes the error but never mints a real job). Everywhere else the
		// pair is a half-built row that must not persist.
		const unresolved = item.job.kind === 'unresolved'
		const legalUnresolved = item.status === QUEUE_STATUS.probing || (item.status === QUEUE_STATUS.error && unresolved)
		if (unresolved !== legalUnresolved) {
			ctx.addIssue({code: 'custom', path: ['job'], message: 'probing status and unresolved job must appear together'})
		}
		if (!item.resumeContext) return

		if (item.status !== QUEUE_STATUS.error && item.status !== QUEUE_STATUS.pending) {
			ctx.addIssue({code: 'custom', path: ['resumeContext'], message: 'resumeContext is only valid on error or pending queue items'})
		}
		if (item.status === QUEUE_STATUS.error && item.error == null) {
			ctx.addIssue({code: 'custom', path: ['resumeContext'], message: 'resumeContext on an error item requires an error payload'})
		}
		if (item.error && item.error.kind !== item.resumeContext.failureKind) {
			ctx.addIssue({code: 'custom', path: ['resumeContext', 'failureKind'], message: 'resumeContext.failureKind must match error.kind when error is present'})
		}
		if (item.tempDir && item.tempDir !== item.resumeContext.tempDir) {
			ctx.addIssue({code: 'custom', path: ['resumeContext', 'tempDir'], message: 'resumeContext.tempDir must match top-level tempDir when both are present'})
		}
	})

export const queueArraySchema = z.array(queueItemSchema)

const playlistManifestItemSchema = z.object({videoId: z.string().nullable(), title: z.string(), duration: z.number().optional()})

export const playlistManifestSchema = z.object({playlistGroupId: z.string().min(1), playlistTitle: z.string(), outputDir: z.string().min(1), items: z.array(playlistManifestItemSchema)})

// yt-dlp info_dict shape lives in `./ytdlp/infoDict.ts` — the spec port that
// validates `--dump-single-json` output. Schemas here are app-internal contracts
// (settings, prefs, queue items); yt-dlp's contract is its own thing.
export {infoDictSchema, type InfoDict} from './ytdlp/infoDict.js'

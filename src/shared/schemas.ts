import {z} from 'zod'
import {validateUaToken} from './exploreUserAgent.js'
import {isValidSubfolder, SUBFOLDER_NAME_MAX} from './subfolder.js'
import {AUDIO_CONVERT_TARGETS, type AudioConvertTarget} from './audioTargets.js'
import {RATE_LIMIT_EVIDENCE, YT_DLP_ERROR_KINDS, type RateLimitEvidence, type YtDlpErrorKind} from 'ytdlp-errors'
import {SUBTITLE_FORMATS, SUBTITLE_MODES, SubtitleFormatSchema as subtitleFormatSchema, SubtitleModeSchema as subtitleModeSchema, type SubtitleFormat, type SubtitleMode} from 'yt-dlp-bridge/schemas'

export type {AudioConvertTarget}
export type {YtDlpErrorKind}
export {YT_DLP_ERROR_KINDS}
// yt-dlp-domain enums owned by the packages that build yt-dlp's argv and read
// its output; re-exported so the app keeps one import site.
export type {RateLimitEvidence, SubtitleFormat, SubtitleMode}
export {SUBTITLE_FORMATS, SUBTITLE_MODES}

// Enum schemas — single source of truth. Types below are inferred so adding
// or removing a value never requires hand-editing a parallel union.

// What a single-video interactive download produces: the Format screen's
// Video / Audio / Subtitles switch.
export const wizardMediaKindSchema = z.enum(['video', 'audio', 'subtitles'])
export type WizardMediaKind = z.infer<typeof wizardMediaKindSchema>

// The Format screen's switch: the download types a profile names. Video, no
// audio is the Video kind with no audio picked and a stream that has none.
export const formatModeSchema = z.enum(['video', 'video-only', 'audio', 'subtitles'])
export type FormatMode = z.infer<typeof formatModeSchema>
export const FORMAT_MODES = formatModeSchema.options

// Single source for the wizard step list — previously duplicated by hand as
// `WizardStep` (renderer store/types.ts), `WizardStepName` (shared/types.ts,
// crosses the logStep IPC boundary) and `WIZARD_STEPS` (wizardStepGraph.ts).
export const wizardStepNameSchema = z.enum(['url', 'playlistItems', 'playlistPresets', 'playlistProfiles', 'formats', 'sponsorblock', 'output', 'folder', 'confirm', 'error'])
export type WizardStepName = z.infer<typeof wizardStepNameSchema>

const PLAYLIST_VIDEO_TIER_VALUES = ['best', '2160', '1440', '1080', '720', '480', '360', '240', '144'] as const
export const playlistVideoTierSchema = z.enum(PLAYLIST_VIDEO_TIER_VALUES)
export type PlaylistVideoTier = z.infer<typeof playlistVideoTierSchema>
// Zod v4 stores enum entries in an object, so numeric-like string keys are
// reordered by JavaScript property ordering. Keep the intended UI order here.
export const PLAYLIST_VIDEO_TIERS: readonly PlaylistVideoTier[] = PLAYLIST_VIDEO_TIER_VALUES

const playlistVideoCodecSchema = z.enum(['best', 'mp4'])

// What a profile's video is for. Decides the codec the selection order prefers:
// Best picture keeps yt-dlp's own codec order (AV1, VP9, HEVC, H.264); Smart TV
// puts H.264 in MP4 first, which YouTube offers only up to 1080p.
export const videoGoalSchema = z.enum(['best-picture', 'smart-tv'])
export type VideoGoal = z.infer<typeof videoGoalSchema>
export const VIDEO_GOALS = videoGoalSchema.options

// The kind of file a video download is saved as. `auto` lets the picked
// streams decide; the others remux (copy streams, never re-encode).
export const videoFileTypeSchema = z.enum(['auto', 'mp4', 'mkv', 'webm'])
export type VideoFileType = z.infer<typeof videoFileTypeSchema>
export const VIDEO_FILE_TYPES = videoFileTypeSchema.options

export const nativeAudioPreferenceSchema = z.enum(['compatible', 'surround'])
export type NativeAudioPreference = z.infer<typeof nativeAudioPreferenceSchema>
export const NATIVE_AUDIO_PREFERENCES = nativeAudioPreferenceSchema.options

// Whether a profile takes HDR video over SDR when a height offers both. The app
// default is Auto (see below); SDR is the fallback when the screen doesn't show
// HDR or nothing is known, because HDR looks washed out on a screen that isn't
// HDR. A height only offered as HDR is still taken, so the choice never costs
// resolution.
export const hdrPreferenceSchema = z.enum(['sdr', 'hdr'])
export type HdrPreference = z.infer<typeof hdrPreferenceSchema>
export const HDR_PREFERENCES = hdrPreferenceSchema.options

// The app-wide setting adds `auto`: HDR first only when this screen shows HDR.
export const hdrSettingSchema = z.enum(['auto', 'sdr', 'hdr'])
export type HdrSetting = z.infer<typeof hdrSettingSchema>
export const HDR_SETTINGS = hdrSettingSchema.options

// Global + profile override, like the save folder and the file name: `default`
// follows Settings, `custom` is this profile's own choice.
export const nativeAudioChoiceSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('default')}), z.object({kind: z.literal('custom'), preference: nativeAudioPreferenceSchema})])
export type NativeAudioChoice = z.infer<typeof nativeAudioChoiceSchema>

export const playlistAudioFormatSchema = z.enum(['best', 'mp3', 'm4a', 'opus'])
export type PlaylistAudioFormat = z.infer<typeof playlistAudioFormatSchema>

export const downloadProfileAudioFormatSchema = z.enum(['best', 'mp3', 'm4a', 'opus', 'wav'])
export type DownloadProfileAudioFormat = z.infer<typeof downloadProfileAudioFormatSchema>

export const downloadProfileIconSchema = z.enum(['controls', 'download', 'video', 'captions', 'audio', 'music', 'podcast', 'classes', 'clip', 'archive'])
export type DownloadProfileIcon = z.infer<typeof downloadProfileIconSchema>
export const DOWNLOAD_PROFILE_ICONS = downloadProfileIconSchema.options

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

export const downloadProfileSubtitleSourceSchema = z.enum(['manual-first', 'manual-only', 'auto-only'])
export type DownloadProfileSubtitleSource = z.infer<typeof downloadProfileSubtitleSourceSchema>

// A subtitles-only batch has no media file to embed into, so the delivery
// choice is narrower than the single-video wizard's SubtitleMode.
export const playlistSubtitleModeSchema = subtitleModeSchema.exclude(['embed'])
export type PlaylistSubtitleMode = z.infer<typeof playlistSubtitleModeSchema>
export const PLAYLIST_SUBTITLE_MODES = playlistSubtitleModeSchema.options

export const playlistSelectionSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('video'), tier: playlistVideoTierSchema, codec: playlistVideoCodecSchema}),
	z.object({kind: z.literal('audio'), format: playlistAudioFormatSchema, bitrateKbps: audioBitrateSchema.optional()}),
	z.object({kind: z.literal('subtitles'), languages: z.array(z.string()).max(MAX_SUBTITLE_LANGUAGES), source: downloadProfileSubtitleSourceSchema, mode: playlistSubtitleModeSchema, format: subtitleFormatSchema})
])
export type PlaylistSelection = z.infer<typeof playlistSelectionSchema>
export type PlaylistSubtitleSelection = Extract<PlaylistSelection, {kind: 'subtitles'}>
export const DEFAULT_PLAYLIST_SELECTION: PlaylistSelection = {kind: 'video', tier: 'best', codec: 'best'}
export const DEFAULT_PLAYLIST_SUBTITLE_SELECTION: PlaylistSubtitleSelection = {kind: 'subtitles', languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'}

// Playlist picker sort order. View-only: `id` and `playlistIndex` are immutable
// probe-order identity (mixes repeat videos, so ids are per-row), and sorting
// never recomputes them. Upload-time modes need per-row `timestamp`; rows
// without one sort last, stable in api order. No update-time option — no
// extractor Arroxy supports provides a modified timestamp.
export const playlistSortModeSchema = z.enum(['api', 'upload-asc', 'upload-desc'])
export type PlaylistSortMode = z.infer<typeof playlistSortModeSchema>
export const PLAYLIST_SORT_MODES = playlistSortModeSchema.options

const downloadProfileAudioSchema = z.object({format: downloadProfileAudioFormatSchema, bitrateKbps: audioBitrateSchema.optional()})

export const hdrChoiceSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('default')}), z.object({kind: z.literal('custom'), preference: hdrPreferenceSchema})])
export type HdrChoice = z.infer<typeof hdrChoiceSchema>

// Whether a profile may pick a stream the site upscaled with AI (YouTube's
// "-sr" formats on old uploads): taller on paper, no real detail added.
export const aiUpscaledSchema = z.enum(['skip', 'allow'])

// What yt-dlp's notes say about a single stream, beyond its size and codec.
// The Format screen tags each one, so nothing about a stream is hidden.
const formatMarkerSchema = z.enum(['ai-upscaled', 'ai-dubbed', 'audio-description', 'spatial-audio', 'vr', 'enhanced-bitrate', 'damaged', 'watermarked'])
export type FormatMarker = z.infer<typeof formatMarkerSchema>
export type AiUpscaled = z.infer<typeof aiUpscaledSchema>
export const AI_UPSCALED_CHOICES = aiUpscaledSchema.options

// `hdr` absent means `default`: profiles saved before the choice existed follow
// the app setting, which upgrades to HDR for existing installs. `aiUpscaled`
// absent means `skip`, for profiles saved before the choice existed too.
const videoMediaFields = {goal: videoGoalSchema, tier: playlistVideoTierSchema, fileType: videoFileTypeSchema, hdr: hdrChoiceSchema.optional(), aiUpscaled: aiUpscaledSchema.optional()}
const videoAudioMediaSchema = z.object({kind: z.literal('video-audio'), ...videoMediaFields, audio: z.object({native: nativeAudioChoiceSchema})})
const videoOnlyMediaSchema = z.object({kind: z.literal('video-only'), ...videoMediaFields})
const audioOnlyMediaSchema = z.object({kind: z.literal('audio-only'), audio: downloadProfileAudioSchema})

// Profiles and queued jobs saved before the selection order existed carry
// `codec` + `tiers` (and an `audio.format` of best/m4a). Read them once into
// the new shape so an upgrade never drops a saved profile or a queued job:
// mp4 → Smart TV; an AAC pick on native video → Best picture saved as MP4,
// the file type that keeps AAC.
const legacyVideoMediaSchema = z.looseObject({kind: z.enum(['video-audio', 'video-only']), codec: playlistVideoCodecSchema, tiers: z.array(z.string()).optional(), audio: z.object({format: z.string()}).optional()})

function upgradeLegacyVideoMedia(raw: unknown): unknown {
	const legacy = legacyVideoMediaSchema.safeParse(raw)
	if (!legacy.success) return raw
	const {codec, tiers, audio, ...rest} = legacy.data
	const goal = codec === 'mp4' ? 'smart-tv' : 'best-picture'
	const fileType = goal === 'best-picture' && audio?.format === 'm4a' ? 'mp4' : 'auto'
	const upgraded = {...rest, goal, tier: tiers?.[0] ?? 'best', fileType}
	return rest.kind === 'video-audio' ? {...upgraded, audio: {native: {kind: 'default'}}} : upgraded
}

export const downloadProfileMediaSchema = z.preprocess(upgradeLegacyVideoMedia, z.discriminatedUnion('kind', [videoAudioMediaSchema, videoOnlyMediaSchema, audioOnlyMediaSchema, z.object({kind: z.literal('subtitles-only')})]))
export type DownloadProfileMedia = z.infer<typeof downloadProfileMediaSchema>

export const mediaIntentSchema = z.preprocess(upgradeLegacyVideoMedia, z.discriminatedUnion('kind', [videoAudioMediaSchema, videoOnlyMediaSchema, audioOnlyMediaSchema]))
export type MediaIntent = z.infer<typeof mediaIntentSchema>
export type VideoMediaIntent = Extract<MediaIntent, {kind: 'video-audio' | 'video-only'}>

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
export const audioSelectionSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('none')}),
	z.object({kind: z.literal('native'), formatId: z.string().min(1)}),
	// `sourceFormatId`: the stream to convert, set when the video has several
	// audio languages; without it yt-dlp converts the source's default track.
	z.object({kind: z.literal('convert-lossless'), target: z.literal('wav'), sourceFormatId: z.string().min(1).optional()}),
	z.object({kind: z.literal('convert-lossy'), target: z.enum(LOSSY_TARGET_VALUES), bitrateKbps: audioBitrateSchema, sourceFormatId: z.string().min(1).optional()})
])
export type AudioSelection = z.infer<typeof audioSelectionSchema>

export const supportedLangSchema = z.enum(['om', 'id', 'de', 'en', 'es', 'fr', 'it', 'sw', 'uz', 'pl', 'pt', 'vi', 'tr', 'am', 'ar', 'ur', 'ps', 'fa', 'bn', 'hi', 'th', 'my', 'km', 'el', 'ru', 'sr', 'uk', 'zh', 'ja', 'ko', 'zh-Hant'])
export type SupportedLang = z.infer<typeof supportedLangSchema>
export const SUPPORTED_LANGS = supportedLangSchema.options

export const uiThemeSchema = z.enum(['light', 'dark', 'system'])
export type UiTheme = z.infer<typeof uiThemeSchema>

export const closeBehaviorSchema = z.enum(['ask', 'tray', 'quit'])
export type CloseBehavior = z.infer<typeof closeBehaviorSchema>

// Electron accelerator chord for the global clipboard-download hotkey:
// modifiers + one key from Electron's accelerator key list (the keys the
// recorder can emit). Registered via Electron's globalShortcut, which rejects
// malformed chords at register time. Older recorders saved `Backquote`, which
// is not an Electron key name and makes globalShortcut.register throw; it is
// read as "`" instead of rejected, since a rejected field resets every common
// setting on load.
const HOTKEY_MODIFIER = '(?:CommandOrControl|Cmd|Ctrl|Alt|Option|AltGr|Shift|Super|Meta)'
const HOTKEY_KEY = "(?:[0-9A-Z]|F(?:[1-9]|1[0-9]|2[0-4])|Space|Tab|Return|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Up|Down|Left|Right|Capslock|Numlock|Scrolllock|PrintScreen|num[0-9]|numdec|numadd|numsub|nummult|numdiv|[-=\\[\\];',./\\\\`]|Backquote)"
export const hotkeyAcceleratorSchema = z
	.string()
	.regex(new RegExp(`^${HOTKEY_MODIFIER}(?:\\+${HOTKEY_MODIFIER})*\\+${HOTKEY_KEY}$`), 'Use modifiers plus one key, e.g. CommandOrControl+Shift+D')
	.transform(chord => chord.replace(/\+Backquote$/, '+`'))
export type HotkeyAccelerator = z.infer<typeof hotkeyAcceleratorSchema>

// Every hotkey trigger attempt ends in exactly one of these outcomes — no
// silent paths (the OmniGet #198 lesson). The renderer derives the outcome
// and reports it back so main can notify on hidden windows.
export const hotkeyOutcomeSchema = z.enum(['queued', 'already-queued', 'invalid-clipboard', 'multiple-urls', 'submission-failed', 'needs-review', 'cookies-setup', 'busy'])
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

// How surfaces are painted (DESIGN.md §8). Independent of the light/dark color scheme.
export const uiStyleSchema = z.enum(['aurora', 'minimal'])
export type UiStyle = z.infer<typeof uiStyleSchema>
export const UI_STYLES = uiStyleSchema.options

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

export const cookiesModeSchema = z.enum(['off', 'file', 'browser', 'explore'])
export type CookiesMode = z.infer<typeof cookiesModeSchema>
export const COOKIES_MODES = cookiesModeSchema.options

// A download's identity for yt-dlp. `exploreSession` is set only by main when a
// run failed in a way an account can fix (escalation), and sticks to the job.
export const jobAuthSchema = z.enum(['anonymous', 'exploreSession'])
export type JobAuth = z.infer<typeof jobAuthSchema>
export const JOB_AUTHS = jobAuthSchema.options

// Why a failed run was retried with the Explore session. Every reason but a
// bot wall is something only the account unlocks, so it reaches a playlist's
// items too; a bot wall signs in only the request that hit it.
const escalationReasonSchema = z.enum(['loginRequired', 'ageRestricted', 'accountOnlyVideo', 'accountOnlyPlaylist', 'playlistMissing', 'botBlock'])
export type EscalationReason = z.infer<typeof escalationReasonSchema>

// What a page load on the Explore partition says about the session. `unknown`:
// the check could not tell (proxy, timeout, load failure, off the site).
const exploreSignInStateSchema = z.enum(['signedIn', 'signedOut', 'unknown'])
export type ExploreSignInState = z.infer<typeof exploreSignInStateSchema>

// Why the Explore view shows its error surface: `proxy` — the proxy setting is
// not usable, so nothing was loaded (fail closed); `load` — the page failed to load.
const exploreViewErrorSchema = z.enum(['proxy', 'load'])
export type ExploreViewError = z.infer<typeof exploreViewErrorSchema>

// The Explore ad blocker as it stands: `off` (the setting is off), `starting`
// (filter lists loading), `on` (blocking), `unavailable` (on, but no filter
// lists could be fetched and none are cached: nothing is blocked).
const exploreAdBlockStatusSchema = z.enum(['off', 'starting', 'on', 'unavailable'])
export type ExploreAdBlockStatus = z.infer<typeof exploreAdBlockStatusSchema>

// What the renderer is told about the Explore view. Carries no cookie data:
// `signedIn` is a presence flag, never the cookies behind it. The schema is
// also the outbound filter, so a field added to the host's state cannot reach
// the renderer until it is listed here.
export const exploreViewStateSchema = z.object({url: z.string(), title: z.string(), canGoBack: z.boolean(), canGoForward: z.boolean(), loading: z.boolean(), signedIn: z.boolean(), error: exploreViewErrorSchema.nullable(), adBlock: exploreAdBlockStatusSchema})
export type ExploreViewState = z.infer<typeof exploreViewStateSchema>

export const cookiesBrowserSchema = z.enum(['firefox', 'chromium', 'chrome', 'brave', 'edge', 'safari', 'vivaldi'])
export type CookiesBrowser = z.infer<typeof cookiesBrowserSchema>

export const networkPacingPresetSchema = z.enum(['off', 'balanced', 'careful', 'custom'])
export type NetworkPacingPreset = z.infer<typeof networkPacingPresetSchema>

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

export const runtimeBinaryArchSchema = z.enum(['x64', 'arm64'])

export const runtimeBinaryFormatSchema = z.enum(['raw', 'zip'])

export const ffmpegPackageFormatSchema = z.enum(['tar.br'])

// QueueItemStatus splits paused in two. paused-held is
// "queued + waiting + never spawned a job" (resume = transition to pending).
// paused-active is "had a running job, user paused it" (resume = re-spawn,
// possibly across an app restart via persisted tempDir + lastJobId).
// `probing` and `needs-choice` are a quick download's placeholder row before
// it has a job: its probe is running, or its probe found something only the
// user can decide (a playlist over the load limit, or one to review).
export const queueItemStatusSchema = z.enum(['probing', 'needs-choice', 'pending', 'running', 'paused-held', 'paused-active', 'done', 'error', 'cancelled'])
export type QueueItemStatus = z.infer<typeof queueItemStatusSchema>

// What a needs-choice row asks. `playlist-cap`: the probe stopped at the load
// limit with `loaded` videos (All / First N / Review). `playlist-review`: a link
// that was not obviously a collection turned out to be one (Review).
export const queueChoiceSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('playlist-cap'), loaded: z.number().int().positive()}), z.object({kind: z.literal('playlist-review'), count: z.number().int().nonnegative()})])
export type QueueChoice = z.infer<typeof queueChoiceSchema>

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

export const queueTableColumnIdSchema = z.enum(['title', 'status', 'progressPercent', 'formatLabel', 'outputDir', 'artifacts', 'fileSize', 'addedAt', 'finishedAt'])
export type QueueTableColumnId = z.infer<typeof queueTableColumnIdSchema>
export const QUEUE_TABLE_COLUMN_IDS = queueTableColumnIdSchema.options

export const ytDlpErrorKindSchema = z.enum(YT_DLP_ERROR_KINDS)

// Reified queue-status names for use in equality checks. Exact mirror of the schema.
export const QUEUE_STATUS = {probing: 'probing', needsChoice: 'needs-choice', pending: 'pending', running: 'running', pausedHeld: 'paused-held', pausedActive: 'paused-active', done: 'done', error: 'error', cancelled: 'cancelled'} as const satisfies Record<string, QueueItemStatus>

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
	qualityLimited: 'qualityLimited',
	qualityLimitedSubtitlesFailed: 'qualityLimitedSubtitlesFailed',
	cancelled: 'cancelled',
	complete: 'complete',
	usedExtractorFallback: 'usedExtractorFallback',
	ytdlpProcessError: 'ytdlpProcessError',
	ytdlpExitCode: 'ytdlpExitCode',
	downloadingBinary: 'downloadingBinary',
	unknownStartupFailure: 'unknownStartupFailure',
	diskSpaceInsufficient: 'diskSpaceInsufficient',
	outputNotWritable: 'outputNotWritable',
	fetchingSponsorBlock: 'fetchingSponsorBlock',
	retryingSponsorBlock: 'retryingSponsorBlock',
	retryingTransfer: 'retryingTransfer',
	signingInWithExplore: 'signingInWithExplore',
	exploreSignedOut: 'exploreSignedOut'
} as const
export type StatusKey = (typeof STATUS_KEY)[keyof typeof STATUS_KEY]

export const statusKeySchema = z.enum(Object.values(STATUS_KEY) as [StatusKey, ...StatusKey[]])

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

// Per-call probe budget override. 1s floors nonsense values, 5min caps a
// hung-overridden probe; background hydration pins 180s. The interactive
// default (180s) applies when the field is absent.
const probeTimeoutMsSchema = z.number().int().min(1000).max(300_000)
export const probePlaylistModeSchema = z.enum(['auto', 'video', 'playlist'])
export type ProbePlaylistMode = z.infer<typeof probePlaylistModeSchema>

export const probeSchema = z.object({url: webUrlSchema, playlistMode: probePlaylistModeSchema.optional(), playlistScope: playlistScopeSchema.optional(), ownerKey: z.string().min(1).optional(), timeoutMs: probeTimeoutMsSchema.optional()})

// Why a probe that still produced a usable result is marked limited: a bot
// check on the way, an extractor-side miss, or the site rate-limiting this
// connection (a different remedy: wait, never cookies).
export const probeDegradationReasonSchema = z.enum(['botWall', 'extractor', 'rateLimit'])
export type ProbeDegradationReason = z.infer<typeof probeDegradationReasonSchema>

// What a run showed about the site rate-limiting this connection, named after
// yt-dlp's wording: an HTTP 429, or YouTube's session limit ("rate-limited by
// YouTube for up to an hour"), which lasts much longer.
const rateLimitEvidenceSchema = z.enum(RATE_LIMIT_EVIDENCE)

// A running rate-limit cooldown on the current network route: until when new
// requests to `site` wait. `site` is the request site key (requestSiteFor).
const requestSiteSchema = z.string().min(1).max(253)
export const siteCooldownSchema = z.strictObject({site: requestSiteSchema, until: z.iso.datetime(), evidence: rateLimitEvidenceSchema})
export type SiteCooldown = z.infer<typeof siteCooldownSchema>
export const siteTryNowSchema = z.strictObject({site: requestSiteSchema})

// PreparedJob discriminated-union schema. Type aliases live in
// `./preparedJob`; the runtime validator lives here so callers that already
// import from `@shared/schemas` get one source of truth and the import graph
// stays acyclic.

// `includeRegionalVariants`: `languages` are base codes that should also fetch
// regional tracks (`de` → `de-DE`). Download profiles set it; the wizard sends
// exact track keys picked from the probe result.
const subtitleOptionsSchema = z.object({languages: z.array(z.string()), mode: subtitleModeSchema, format: subtitleFormatSchema, writeAuto: z.boolean(), autoOnly: z.boolean().optional(), includeRegionalVariants: z.boolean().optional()})

const sponsorBlockOptionsSchema = z.discriminatedUnion('mode', [z.object({mode: z.literal('off')}), z.object({mode: z.enum(['mark', 'remove']), categories: z.array(sponsorBlockCategorySchema)})])

const videoPartSchema = z.object({startSeconds: z.number().int().min(0), endSeconds: z.number().int().positive(), exactCut: z.boolean()}).refine(part => part.startSeconds < part.endSeconds, {message: 'startSeconds must be before endSeconds'})

const embedOptionsSchema = z.object({chapters: z.boolean(), metadata: z.boolean(), thumbnail: z.boolean(), description: z.boolean(), thumbnailSidecar: z.boolean()})

// Each variant carries the yt-dlp `extractor` + `extractor_key` strings that
// were observed at probe time. These plumb through to download jobs so the
// download path can branch on extractor without re-probing.
const extractorIdentitySchema = {extractor: z.string(), extractorKey: z.string()}

export const preparedJobSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('single-format'),
		...extractorIdentitySchema,
		formatId: z.string().min(1),
		mergeOutputFormat: z.string().min(1).optional(),
		remuxVideo: z.string().min(1).optional(),
		filenameTemplate: z.string().min(1).optional(),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema,
		expectedBytes: z.number().positive().optional(),
		videoPart: videoPartSchema.optional()
	}),
	z.object({
		kind: z.literal('audio-convert'),
		...extractorIdentitySchema,
		audioConvert: audioConvertSchema,
		formatId: z.string().min(1).optional(),
		filenameTemplate: z.string().min(1).optional(),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema,
		videoPart: videoPartSchema.optional()
	}),
	z.object({
		kind: z.literal('ranged-format'),
		...extractorIdentitySchema,
		intent: mediaIntentSchema,
		formatSelector: z.string().min(1).optional(),
		formatSort: z.string().min(1).optional(),
		mergeOutputFormat: z.string().min(1).optional(),
		remuxVideo: z.string().min(1).optional(),
		audioConvert: audioConvertSchema.optional(),
		filenameTemplate: z.string().min(1),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema
	}),
	z.object({kind: z.literal('subtitle-only'), ...extractorIdentitySchema, filenameTemplate: z.string().min(1).optional(), subtitles: subtitleOptionsSchema}),
	z.object({kind: z.literal('unresolved'), extractor: z.literal(''), extractorKey: z.literal('')})
])

export const startDownloadSchema = z.object({url: webUrlSchema, outputDir: z.string().min(1).optional(), cookiesMode: cookiesModeSchema.optional(), job: preparedJobSchema, auth: jobAuthSchema.optional()})

export const cancelDownloadSchema = z.object({jobId: z.string().optional()})

export const pauseResumeSchema = z.object({jobId: z.string().optional()})

export const resumeSchema = z.object({jobId: z.string().min(1)})

// yt-dlp `--limit-rate` syntax: integer or decimal followed by K (KB/s) or M (MB/s).
// e.g. "500K", "1.5M". Case-insensitive. Stored verbatim — passed straight to yt-dlp.
// Empty string is the "off" representation (same pattern as proxyUrl). YtDlp.run()
// applies `nonEmpty(value.trim())` so empty / whitespace yields no flag.
export const limitRateSchema = z.string().regex(/^(|\s*|\d+(\.\d+)?[KM])$/i, 'Use a number followed by K or M (e.g. 500K, 1.5M)')

// What the native application menu asks the renderer to do. The renderer owns
// UI state, so a menu pick is a request, applied through the same store actions
// as the footer controls. A speed limit left out means no limit.
export const menuActionSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('about')}),
	z.object({kind: z.literal('share')}),
	z.object({kind: z.literal('feedback')}),
	z.object({kind: z.literal('settings')}),
	z.object({kind: z.literal('logs')}),
	z.object({kind: z.literal('diagnostics')}),
	z.object({kind: z.literal('speedLimit'), limitRate: limitRateSchema.optional()}),
	z.object({kind: z.literal('style'), style: uiStyleSchema}),
	z.object({kind: z.literal('theme'), theme: uiThemeSchema})
])
export type MenuAction = z.infer<typeof menuActionSchema>

const commonPathsSchema = z.object({downloads: z.string().nullable(), videos: z.string().nullable(), desktop: z.string().nullable(), music: z.string().nullable(), documents: z.string().nullable(), pictures: z.string().nullable(), home: z.string().nullable()})

const binaryOverridesSchema = z.object({ytDlp: z.string().min(1).optional(), ffmpeg: z.string().min(1).optional(), ffprobe: z.string().min(1).optional()}).partial()

const commonSettingsSchema = z.object({
	defaultOutputDir: z.string().min(1),
	rememberLastOutputDir: z.boolean(),
	lastSubfolderEnabled: z.boolean().optional(),
	lastSubfolder: subfolderNameSchema.optional(),
	// Lenient on read: a malformed value only means "not sent today", and a strict
	// check here would reset the whole common section to defaults.
	lastHeartbeatDay: z.string().optional(),
	uiZoom: z.number().min(ZOOM_MIN).max(ZOOM_MAX).optional(),
	uiTheme: uiThemeSchema.optional(),
	uiStyle: uiStyleSchema.optional(),
	language: supportedLangSchema.optional(),
	commonPaths: commonPathsSchema.optional(),
	cookiesPath: z.string().optional(),
	cookiesMode: cookiesModeSchema.optional(),
	cookiesBrowser: cookiesBrowserSchema.optional(),
	proxyUrl: z.string().optional(),
	// Absent means enabled.
	exploreEnabled: z.boolean().optional(),
	exploreUserAgent: z.string().max(64).optional(),
	exploreNoticeSeen: z.boolean().optional(),
	exploreModeAutoSwitched: z.boolean().optional(),
	exploreModeNudgeDismissedFor: cookiesModeSchema.optional(),
	// The last site page the Explore view showed, reopened at its next start.
	// Main owns it: written by the view host (which checks every URL before
	// storing and again before reopening it), never by a renderer update.
	exploreLastUrl: z.string().optional(),
	// The Explore ad blocker; absent means off (see isExploreAdBlockOn), only true turns it on.
	exploreAdBlock: z.boolean().optional(),
	// Explore idle unload; absent means off (see isExploreIdleUnloadOn), only true turns it on.
	exploreIdleUnload: z.boolean().optional(),
	// Compact app chrome (icon-only tab bar, slim footer) while browsing in Explore.
	exploreCompactChrome: z.boolean().optional(),
	nativeAudioPreference: nativeAudioPreferenceSchema.optional(),
	hdrPreference: hdrSettingSchema.optional(),
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
	autoRemoveCompleted: z.boolean().optional(),
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
	styleHintDismissed: z.boolean().optional(),
	videoPartCalloutDismissed: z.boolean().optional(),
	exploreLinkCalloutDismissed: z.boolean().optional(),
	formatProfileCalloutDismissed: z.boolean().optional(),
	reviewCalloutDismissed: z.boolean().optional()
})

const playlistPrefsSchema = z.object({lastPlaylistSelection: playlistSelectionSchema.optional()})

export const appSettingsSchema = z.object({common: commonSettingsSchema, playlist: playlistPrefsSchema, profiles: downloadProfilesPrefsSchema})

// Common paths are derived from the OS, the heartbeat day is internal, and the last
// Explore page is the view host's; none is accepted from renderer settings
// updates. Deriving the rest keeps the patch contract in lockstep with the
// persisted settings contract.
// The UA token is validated on write only: a stored value the validator later
// rejects must not invalidate the whole persisted `common` section, because the
// reader (ExploreSessionService) already falls back to the default token.
const commonSettingsPatchSchema = commonSettingsSchema
	.partial()
	.omit({commonPaths: true, lastHeartbeatDay: true, exploreLastUrl: true})
	.extend({
		exploreUserAgent: z
			.string()
			.max(64)
			.refine(v => validateUaToken(v) !== null, {message: 'exploreUserAgent must be a bland Name/version token'})
			.optional()
	})

// Convention for *patch* schemas: every field is `.optional()` only — never
// `.nullable()`. A patch is "fields the caller wants to change"; "absent" is
// the same signal as "no change", so adding `.nullable()` introduces a third
// state ("explicitly clear") that the merge logic in SettingsStore.deepMerge
// doesn't actually distinguish from undefined.
const playlistPrefsPatchSchema = z.object({lastPlaylistSelection: playlistSelectionSchema.optional()})

const downloadProfilesPrefsPatchSchema = z.object({active: downloadProfileRefSchema.optional(), custom: z.array(downloadProfileSchema).optional(), overrides: z.array(downloadProfileSchema).optional(), enabledOverrides: z.record(z.string(), z.boolean()).optional()})

export const updateSettingsSchema = z.object({common: commonSettingsPatchSchema.optional(), playlist: playlistPrefsPatchSchema.optional(), profiles: downloadProfilesPrefsPatchSchema.optional()}).refine(
	patch => {
		const hasField = (sub: Record<string, unknown> | undefined): boolean => sub !== undefined && Object.values(sub).some(v => v !== undefined)
		return hasField(patch.common) || hasField(patch.playlist) || hasField(patch.profiles)
	},
	{message: 'settings:update payload must contain at least one defined field'}
)

const playlistManifestItemSchema = z.object({videoId: z.string().nullable(), title: z.string(), duration: z.number().optional()})

export const playlistManifestSchema = z.object({playlistGroupId: z.string().min(1), playlistTitle: z.string(), outputDir: z.string().min(1), items: z.array(playlistManifestItemSchema)})

// yt-dlp's info_dict shape lives in `yt-dlp-bridge/info` — the spec port that
// validates `--dump-single-json` output. Schemas here are app-internal contracts
// (settings, prefs, queue items — the item contract is in `./queueItemSchema.ts`).

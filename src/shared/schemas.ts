import { z } from 'zod';
import { isValidSubfolder, SUBFOLDER_NAME_MAX } from './subfolder.js';
import { AUDIO_CONVERT_TARGETS, type AudioConvertTarget } from './audioTargets.js';
import { YT_DLP_ERROR_KINDS, type YtDlpErrorKind } from 'ytdlp-errors';

export type { AudioConvertTarget };
export type { YtDlpErrorKind };
export { YT_DLP_ERROR_KINDS };

// Enum schemas — single source of truth. Types below are inferred so adding
// or removing a value never requires hand-editing a parallel union.

export const presetSchema = z.enum(['best-quality', 'balanced', 'small-file', 'audio-only', 'subtitle-only']);
export type Preset = z.infer<typeof presetSchema>;
export const PRESETS = presetSchema.options;

const PLAYLIST_VIDEO_TIER_VALUES = ['best', '2160', '1440', '1080', '720', '480', '360'] as const;
export const playlistVideoTierSchema = z.enum(PLAYLIST_VIDEO_TIER_VALUES);
export type PlaylistVideoTier = z.infer<typeof playlistVideoTierSchema>;
// Zod v4 stores enum entries in an object, so numeric-like string keys are
// reordered by JavaScript property ordering. Keep the intended UI order here.
export const PLAYLIST_VIDEO_TIERS: readonly PlaylistVideoTier[] = PLAYLIST_VIDEO_TIER_VALUES;

const playlistVideoCodecSchema = z.enum(['best', 'mp4']);

export const playlistAudioFormatSchema = z.enum(['best', 'mp3', 'm4a', 'opus']);
export type PlaylistAudioFormat = z.infer<typeof playlistAudioFormatSchema>;

export const subtitleModeSchema = z.enum(['sidecar', 'embed', 'subfolder']);
export type SubtitleMode = z.infer<typeof subtitleModeSchema>;
export const SUBTITLE_MODES = subtitleModeSchema.options;

export const subtitleFormatSchema = z.enum(['srt', 'vtt', 'ass']);
export type SubtitleFormat = z.infer<typeof subtitleFormatSchema>;
export const SUBTITLE_FORMATS = subtitleFormatSchema.options;

export const sponsorBlockModeSchema = z.enum(['off', 'mark', 'remove']);
export type SponsorBlockMode = z.infer<typeof sponsorBlockModeSchema>;
export const SPONSORBLOCK_MODES = sponsorBlockModeSchema.options;

export const sponsorBlockCategorySchema = z.enum(['sponsor', 'intro', 'outro', 'selfpromo', 'music_offtopic', 'preview', 'filler']);
export type SponsorBlockCategory = z.infer<typeof sponsorBlockCategorySchema>;
export const SPONSORBLOCK_CATEGORIES = sponsorBlockCategorySchema.options;

// Audio-conversion targets surfaced in the wizard's audio column. yt-dlp will
// run --extract-audio + --audio-format <target> as a post-processor (requires
// ffmpeg). For lossy targets (mp3/m4a/opus) the bitrate is shared via the
// strip below the column; wav has no bitrate.
const LOSSY_TARGET_VALUES = AUDIO_CONVERT_TARGETS.filter((s) => s.lossy).map((s) => s.target) as ['mp3', 'm4a', 'opus'];

export const audioBitrateSchema = z.union([z.literal(128), z.literal(192), z.literal(256), z.literal(320)]);
export type AudioBitrate = z.infer<typeof audioBitrateSchema>;
export const AUDIO_BITRATES: readonly AudioBitrate[] = [128, 192, 256, 320];
export const DEFAULT_AUDIO_BITRATE: AudioBitrate = 192;

export const audioConvertSchema = z.discriminatedUnion('target', [z.object({ target: z.literal('wav') }), z.object({ target: z.enum(LOSSY_TARGET_VALUES), bitrateKbps: audioBitrateSchema })]);
export type AudioConvert = z.infer<typeof audioConvertSchema>;

export const playlistSelectionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('video'),
    tier: playlistVideoTierSchema,
    codec: playlistVideoCodecSchema
  }),
  z.object({
    kind: z.literal('audio'),
    format: playlistAudioFormatSchema,
    bitrateKbps: audioBitrateSchema.optional()
  })
]);
export type PlaylistSelection = z.infer<typeof playlistSelectionSchema>;
export const DEFAULT_PLAYLIST_SELECTION: PlaylistSelection = { kind: 'video', tier: 'best', codec: 'best' };

// Renderer's audio-column selection. Three convert kinds + native + none.
// Defined here (not in renderer/store/types.ts) because it's persisted in
// `SinglePrefs.lastAudioSelection`, so the IPC patch schema needs to validate it.
export const audioSelectionSchema = z.discriminatedUnion('kind', [z.object({ kind: z.literal('none') }), z.object({ kind: z.literal('native'), formatId: z.string().min(1) }), z.object({ kind: z.literal('convert-lossless'), target: z.literal('wav') }), z.object({ kind: z.literal('convert-lossy'), target: z.enum(LOSSY_TARGET_VALUES), bitrateKbps: audioBitrateSchema })]);
export type AudioSelection = z.infer<typeof audioSelectionSchema>;

export const supportedLangSchema = z.enum(['om', 'de', 'en', 'es', 'fr', 'sw', 'uz', 'vi', 'am', 'ar', 'ur', 'ps', 'bn', 'hi', 'my', 'el', 'ru', 'sr', 'uk', 'zh', 'ja']);
export type SupportedLang = z.infer<typeof supportedLangSchema>;
export const SUPPORTED_LANGS = supportedLangSchema.options;

export const uiThemeSchema = z.enum(['light', 'dark', 'system']);
export type UiTheme = z.infer<typeof uiThemeSchema>;

export const quickDownloadStatusSchema = z.enum(['idle', 'preparing', 'queued', 'error']);
export type QuickDownloadStatus = z.infer<typeof quickDownloadStatusSchema>;

export const wizardModeSchema = z.enum(['single', 'playlist', 'bulk']);
export type WizardMode = z.infer<typeof wizardModeSchema>;

export const bulkMetadataStatusSchema = z.enum(['idle', 'resolving', 'done']);
export type BulkMetadataStatus = z.infer<typeof bulkMetadataStatusSchema>;

export const bulkMetadataItemStatusSchema = z.enum(['pending', 'resolving', 'done', 'failed']);
export type BulkMetadataItemStatus = z.infer<typeof bulkMetadataItemStatusSchema>;

export const bulkMetadataCancelReasonSchema = z.enum(['queue-submit', 'reset', 'back-to-url', 'start-new-bulk']);
export type BulkMetadataCancelReason = z.infer<typeof bulkMetadataCancelReasonSchema>;

export const bulkUrlRejectReasonSchema = z.enum(['duplicate', 'unsupported-playlist', 'unsupported-channel']);
export type BulkUrlRejectReason = z.infer<typeof bulkUrlRejectReasonSchema>;

export const cookiesModeSchema = z.enum(['off', 'file', 'browser']);
export type CookiesMode = z.infer<typeof cookiesModeSchema>;

export const cookiesBrowserSchema = z.enum(['firefox', 'chromium', 'chrome', 'brave', 'edge', 'safari', 'vivaldi']);
export type CookiesBrowser = z.infer<typeof cookiesBrowserSchema>;

export const networkPacingPresetSchema = z.enum(['off', 'balanced', 'careful', 'custom']);
export type NetworkPacingPreset = z.infer<typeof networkPacingPresetSchema>;

export const PLAYLIST_PROBE_LIMIT_MIN = 1;
export const PLAYLIST_PROBE_LIMIT_MAX = 5000;

export const playlistProbeLimitSchema = z.number().int().min(PLAYLIST_PROBE_LIMIT_MIN).max(PLAYLIST_PROBE_LIMIT_MAX);
export const pacingSleepSecondsSchema = z.number().min(0).max(120);
export const pacingConcurrentFragmentsSchema = z.number().int().min(0).max(16);

// QueueItemStatus is now a 7-value union with paused split. paused-held is
// "queued + waiting + never spawned a job" (resume = transition to pending).
// paused-active is "had a running job, user paused it" (resume = re-spawn,
// possibly across an app restart via persisted tempDir + lastJobId).
export const queueItemStatusSchema = z.enum(['pending', 'running', 'paused-held', 'paused-active', 'done', 'error', 'cancelled']);
export type QueueItemStatus = z.infer<typeof queueItemStatusSchema>;

// Lane controls how the scheduler treats an item. `normal` items respect the
// single-slot cap and the inter-job sleep window — typical queue flow.
// `priority` items spawn alongside whatever is running and bypass the sleep
// window, gated only by the maxConcurrent ceiling. User intent: "skip the
// queue, pull this now." Set via the wizard's "Pull it!" CTA or the drawer
// card's Pull-now button.
export const queueLaneSchema = z.enum(['normal', 'priority']);
export type QueueLane = z.infer<typeof queueLaneSchema>;

const ytDlpErrorKindSchema = z.enum(YT_DLP_ERROR_KINDS);

// Reified queue-status names for use in equality checks. Exact mirror of the schema.
export const QUEUE_STATUS = {
  pending: 'pending',
  running: 'running',
  pausedHeld: 'paused-held',
  pausedActive: 'paused-active',
  done: 'done',
  error: 'error',
  cancelled: 'cancelled'
} as const satisfies Record<string, QueueItemStatus>;

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
} as const;
export type StatusKey = (typeof STATUS_KEY)[keyof typeof STATUS_KEY];

const statusKeySchema = z.enum(Object.values(STATUS_KEY) as [StatusKey, ...StatusKey[]]);

// Zoom bounds — kept here so the schema constraint and the renderer clamp share one source.
export const ZOOM_MIN = 0.7;
export const ZOOM_MAX = 1.5;
export const ZOOM_STEP = 0.05;

// Hard cap on subtitle languages per download — protects against argv length blow-up.
export const MAX_SUBTITLE_LANGUAGES = 50;

// Permissive http(s) URL schema. Multi-site support means we can't pre-filter
// by host — yt-dlp itself decides whether the URL is supported (via extractor
// match) and surfaces "Unsupported URL" via stderr if not.
const webUrlSchema = z.url('URL must be valid').refine((value) => /^https?:\/\//i.test(value), { message: 'Only http/https URLs are supported' });

const playlistScopeItemsSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('app-limit') }),
  z.object({ kind: z.literal('first'), count: playlistProbeLimitSchema }),
  z
    .object({
      kind: z.literal('range'),
      from: playlistProbeLimitSchema,
      to: playlistProbeLimitSchema
    })
    .refine((value) => value.from <= value.to, { message: 'Range start must be less than or equal to range end', path: ['to'] })
]);

export const playlistScopeSchema = z.object({
  items: playlistScopeItemsSchema
});
export type PlaylistScope = z.infer<typeof playlistScopeSchema>;

export const probeSchema = z.object({
  url: webUrlSchema,
  playlistMode: z.enum(['auto', 'video', 'playlist']).optional(),
  playlistScope: playlistScopeSchema.optional()
});

// PreparedJob discriminated-union schema. Type aliases live in
// `./preparedJob`; the runtime validator lives here so callers that already
// import from `@shared/schemas` get one source of truth and the import graph
// stays acyclic.

const subtitleOptionsSchema = z.object({
  languages: z.array(z.string()),
  mode: subtitleModeSchema,
  format: subtitleFormatSchema,
  writeAuto: z.boolean()
});

const sponsorBlockOptionsSchema = z.discriminatedUnion('mode', [z.object({ mode: z.literal('off') }), z.object({ mode: z.enum(['mark', 'remove']), categories: z.array(sponsorBlockCategorySchema) })]);

const embedOptionsSchema = z.object({
  chapters: z.boolean(),
  metadata: z.boolean(),
  thumbnail: z.boolean(),
  description: z.boolean(),
  thumbnailSidecar: z.boolean()
});

const presetOrCustomSchema = z.union([presetSchema, z.literal('custom')]);

// Each variant carries the yt-dlp `extractor` + `extractor_key` strings that
// were observed at probe time. These plumb through to download jobs so the
// download path can branch on extractor without re-probing.
const extractorIdentitySchema = {
  extractor: z.string(),
  extractorKey: z.string()
};

export const preparedJobSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('single-format'),
    ...extractorIdentitySchema,
    formatId: z.string().min(1),
    preset: presetOrCustomSchema,
    outputTemplate: z.string().min(1).optional(),
    subtitles: subtitleOptionsSchema.optional(),
    sponsorBlock: sponsorBlockOptionsSchema,
    embed: embedOptionsSchema,
    expectedBytes: z.number().positive().optional()
  }),
  z.object({
    kind: z.literal('audio-convert'),
    ...extractorIdentitySchema,
    audioConvert: audioConvertSchema,
    preset: presetOrCustomSchema,
    outputTemplate: z.string().min(1).optional(),
    subtitles: subtitleOptionsSchema.optional(),
    sponsorBlock: sponsorBlockOptionsSchema,
    embed: embedOptionsSchema
  }),
  z.object({
    kind: z.literal('playlist-preset'),
    ...extractorIdentitySchema,
    selection: playlistSelectionSchema,
    formatSelector: z.string().min(1).optional(),
    formatSort: z.string().min(1).optional(),
    mergeOutputFormat: z.string().min(1).optional(),
    audioConvert: audioConvertSchema.optional(),
    outputTemplate: z.string().min(1),
    subtitles: subtitleOptionsSchema.optional(),
    sponsorBlock: sponsorBlockOptionsSchema,
    embed: embedOptionsSchema
  }),
  z.object({
    kind: z.literal('subtitle-only'),
    ...extractorIdentitySchema,
    outputTemplate: z.string().min(1).optional(),
    subtitles: subtitleOptionsSchema
  })
]);

export const startDownloadSchema = z.object({
  url: webUrlSchema,
  outputDir: z.string().min(1).optional(),
  cookiesMode: cookiesModeSchema.optional(),
  job: preparedJobSchema
});

export const cancelDownloadSchema = z.object({
  jobId: z.string().optional()
});

export const pauseResumeSchema = z.object({
  jobId: z.string().optional()
});

export const resumeSchema = z.object({
  jobId: z.string().min(1)
});

export const analyticsTrackSchema = z.object({
  name: z.string().min(1).max(64),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
});

const subfolderNameSchema = z
  .string()
  .max(SUBFOLDER_NAME_MAX)
  .refine((s) => s === '' || isValidSubfolder(s), { message: 'Invalid subfolder name' });

// yt-dlp `--limit-rate` syntax: integer or decimal followed by K (KB/s) or M (MB/s).
// e.g. "500K", "1.5M". Case-insensitive. Stored verbatim — passed straight to yt-dlp.
// Empty string is the "off" representation (same pattern as proxyUrl). YtDlp.run()
// applies `nonEmpty(value.trim())` so empty / whitespace yields no flag.
export const limitRateSchema = z.string().regex(/^(|\s*|\d+(\.\d+)?[KM])$/i, 'Use a number followed by K or M (e.g. 500K, 1.5M)');

const commonSettingsPatchSchema = z.object({
  defaultOutputDir: z.string().min(1).optional(),
  limitRate: limitRateSchema.optional(),
  playlistProbeLimit: playlistProbeLimitSchema.optional(),
  networkPacingPreset: networkPacingPresetSchema.optional(),
  pacingSleepRequests: pacingSleepSecondsSchema.optional(),
  pacingSleepInterval: pacingSleepSecondsSchema.optional(),
  pacingMaxSleepInterval: pacingSleepSecondsSchema.optional(),
  pacingSleepSubtitles: pacingSleepSecondsSchema.optional(),
  pacingConcurrentFragments: pacingConcurrentFragmentsSchema.optional(),
  rememberLastOutputDir: z.boolean().optional(),
  uiZoom: z.number().min(ZOOM_MIN).max(ZOOM_MAX).optional(),
  uiTheme: uiThemeSchema.optional(),
  language: supportedLangSchema.optional(),
  cookiesPath: z.string().optional(),
  cookiesMode: cookiesModeSchema.optional(),
  cookiesBrowser: cookiesBrowserSchema.optional(),
  proxyUrl: z.string().optional(),
  clipboardWatchEnabled: z.boolean().optional(),
  includeIdInSingleFilenames: z.boolean().optional(),
  closeBehavior: z.enum(['ask', 'tray', 'quit']).optional(),
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
  drawerOpen: z.boolean().optional(),
  successfulDownloadCount: z.number().int().nonnegative().optional(),
  shareInlineCardDismissed: z.boolean().optional(),
  shareHighValueBannerDismissed: z.boolean().optional(),
  binaryOverrides: z
    .object({
      ytDlp: z.string().min(1).optional(),
      ffmpeg: z.string().min(1).optional(),
      ffprobe: z.string().min(1).optional(),
      deno: z.string().min(1).optional()
    })
    .partial()
    .optional(),
  lastSubfolderEnabled: z.boolean().optional(),
  lastSubfolder: subfolderNameSchema.optional()
});

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
});

const playlistPrefsPatchSchema = z.object({
  lastPlaylistSelection: playlistSelectionSchema.optional()
});

export const updateSettingsSchema = z
  .object({
    common: commonSettingsPatchSchema.optional(),
    single: singlePrefsPatchSchema.optional(),
    playlist: playlistPrefsPatchSchema.optional()
  })
  .refine(
    (patch) => {
      const hasField = (sub: Record<string, unknown> | undefined): boolean => sub !== undefined && Object.values(sub).some((v) => v !== undefined);
      return hasField(patch.common) || hasField(patch.single) || hasField(patch.playlist);
    },
    { message: 'settings:update payload must contain at least one defined field' }
  );

// Queue item schema — used by both queueSave IPC handler and queueStore.load
// to reject corrupted persistence (manual edits, partial writes).
const localizedErrorSchema = z.object({
  kind: ytDlpErrorKindSchema,
  raw: z.string()
});

const statusSnapshotSchema = z.object({
  key: statusKeySchema,
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional()
});

export const queueItemSchema = z.object({
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
  error: localizedErrorSchema.nullable(),
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
  job: preparedJobSchema
});

export const queueArraySchema = z.array(queueItemSchema);

const playlistManifestItemSchema = z.object({
  videoId: z.string().nullable(),
  title: z.string(),
  duration: z.number().optional()
});

export const playlistManifestSchema = z.object({
  playlistGroupId: z.string().min(1),
  playlistTitle: z.string(),
  outputDir: z.string().min(1),
  items: z.array(playlistManifestItemSchema)
});

// yt-dlp info_dict shape lives in `./ytdlp/infoDict.ts` — the spec port that
// validates `--dump-single-json` output. Schemas here are app-internal contracts
// (settings, prefs, queue items); yt-dlp's contract is its own thing.
export { infoDictSchema, type YtDlpFormat, type YtDlpSubtitleTrack, type InfoDict } from './ytdlp/infoDict.js';

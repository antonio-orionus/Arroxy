import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import log from 'electron-log/main.js';
import { spawnYtDlp } from '@main/utils/process.js';
import { classifyYtDlpStderr, extractLastError } from 'ytdlp-errors';
import type { YtDlpErrorKind } from 'ytdlp-errors';
import { resolveCookies, type ResolvedCookies } from './cookiesResolver.js';
import { nonEmpty } from '@shared/format.js';
import { EMBED_CONTAINER_EXT } from '@shared/subtitlePath.js';
import { siteForUrl } from '@shared/sites/index.js';
import type { SubtitleFormat, SubtitleMode, SponsorBlockMode, SponsorBlockCategory, StatusKey, AudioConvert } from '@shared/types.js';
import { resolveEmbedPolicy } from '@shared/embedPolicy.js';
import { resolveNetworkPacing, resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { DEFAULT_PLAYLIST_PROBE_LIMIT, type NetworkPacingArgs } from '@shared/constants.js';
import type { BinaryManager } from './BinaryManager.js';
import type { TokenService } from './TokenService.js';
import type { SettingsStore } from '@main/stores/SettingsStore.js';

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void;

const ytDlpLog = log.scope('yt-dlp');

function redactProxy(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.username) u.username = '***';
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '<unparseable>';
  }
}

// 'auto' lets yt-dlp's extractor decide for ambiguous URLs (mixed video+playlist).
// 'video' forces single-video resolution (--no-playlist); 'playlist' forces
// playlist enumeration (--yes-playlist). Renderer surfaces a disambiguation
// prompt for mixed YouTube URLs and passes the user's choice through.
export type ProbePlaylistMode = 'auto' | 'video' | 'playlist';

export type YtDlpRequest =
  | { kind: 'probe'; url: string; playlistMode?: ProbePlaylistMode }
  | {
      kind: 'subtitle';
      url: string;
      outputDir: string;
      subtitleLanguages: string[];
      subtitleMode?: SubtitleMode;
      subtitleFormat: SubtitleFormat;
      writeAutoSubs?: boolean;
      outputTemplate?: string;
    }
  | {
      kind: 'video';
      url: string;
      outputDir: string;
      tempDir?: string;
      formatId?: string;
      formatSelector?: string;
      skipDownload?: boolean;
      audioConvert?: AudioConvert;
      sponsorBlock?: { mode: Exclude<SponsorBlockMode, 'off'>; categories: SponsorBlockCategory[] };
      embedChapters?: boolean;
      embedMetadata?: boolean;
      embedThumbnail?: boolean;
      writeDescription?: boolean;
      writeThumbnail?: boolean;
      outputTemplate?: string;
      // When set, yt-dlp skips extractor and reuses cached metadata.
      // Used on resume to avoid re-extraction (signed-URL expiry,
      // format-ID drift across spawns for HLS/DASH).
      loadInfoJsonPath?: string;
    }
  | {
      kind: 'video+embed';
      url: string;
      outputDir: string;
      tempDir?: string;
      formatId?: string;
      formatSelector?: string;
      audioConvert?: AudioConvert;
      subtitleLanguages: string[];
      writeAutoSubs?: boolean;
      sponsorBlock?: { mode: Exclude<SponsorBlockMode, 'off'>; categories: SponsorBlockCategory[] };
      embedChapters?: boolean;
      embedMetadata?: boolean;
      embedThumbnail?: boolean;
      writeDescription?: boolean;
      writeThumbnail?: boolean;
      outputTemplate?: string;
      loadInfoJsonPath?: string;
    };

export interface YtDlpSignal {
  onMinting?: (attempt: 0 | 1) => void;
  onSpawn?: (proc: ChildProcessWithoutNullStreams) => void;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
  // Caller-driven cancellation. When aborted, in-flight yt-dlp processes are
  // SIGKILLed and the run resolves with an exit-error (rawError: 'Cancelled').
  abortSignal?: AbortSignal;
}

export type YtDlpResult =
  | {
      kind: 'success';
      stdout: string;
      stderr: string;
      usedExtractorFallback: boolean;
      effectiveSubtitleFormat?: SubtitleFormat;
    }
  | { kind: 'spawn-error'; error: Error; stdout: string; stderr: string }
  | {
      kind: 'exit-error';
      exitCode: number;
      // Closed taxonomy. Always populated — `'unknown'` covers the
      // unmatched-stderr fallback. `rawError` carries the verbatim message
      // the renderer should show when no i18n template applies.
      errorKind: YtDlpErrorKind;
      rawError: string | null;
      stdout: string;
      stderr: string;
    };

// VidBee's strategy: skip the player clients that demand a PoT, so the
// non-PoT download path works without needing to mint anything.
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari';

function buildPotExtractorArgs(token: string, visitorData: string): string {
  const visitor = visitorData ? `;visitor_data=${visitorData}` : '';
  return `youtube:po_token=web.gvs+${token}${visitor}`;
}

type RetryStrategy = { kind: 'pot'; reMint: boolean } | { kind: 'fallback' } | { kind: 'noExtractorArgs' };

// Probes (--dump-json) should never legitimately take this long. Without a
// timeout, a stalled yt-dlp run (e.g. extractor giving up but not exiting)
// would freeze the wizard's "Fetching format" spinner indefinitely.
const PROBE_TIMEOUT_MS = 60_000;

interface InvokeOptions {
  url: string;
  ytDlpPath: string;
  ffmpegPath: string | null;
  denoPath: string | null;
  args: string[];
  tokenService: TokenService;
  cookies?: ResolvedCookies | null;
  proxyUrl?: string;
  limitRate?: string;
  timeoutMs?: number;
  signal?: YtDlpSignal;
  isProbe?: boolean;
}

function formatPacingNumber(value: number): string {
  return String(value);
}

function appendRequestPacingArgs(args: string[], pacing: NetworkPacingArgs | undefined): void {
  if (pacing?.sleepRequests !== undefined && pacing.sleepRequests > 0) {
    args.push('--sleep-requests', formatPacingNumber(pacing.sleepRequests));
  }
}

function insertBeforeLastArg(args: string[], values: string[]): void {
  if (values.length === 0) return;
  args.splice(Math.max(0, args.length - 1), 0, ...values);
}

function requestPacingArgs(pacing: NetworkPacingArgs | undefined): string[] {
  const args: string[] = [];
  appendRequestPacingArgs(args, pacing);
  return args;
}

function downloadPacingArgs(pacing: NetworkPacingArgs | undefined): string[] {
  const args: string[] = [];
  appendDownloadPacingArgs(args, pacing);
  return args;
}

function appendDownloadPacingArgs(args: string[], pacing: NetworkPacingArgs | undefined): void {
  appendRequestPacingArgs(args, pacing);
  if (pacing?.sleepInterval !== undefined && pacing.sleepInterval > 0) {
    args.push('--sleep-interval', formatPacingNumber(pacing.sleepInterval));
    if (pacing.maxSleepInterval !== undefined && pacing.maxSleepInterval >= pacing.sleepInterval) {
      args.push('--max-sleep-interval', formatPacingNumber(pacing.maxSleepInterval));
    }
  }
  if (pacing?.concurrentFragments !== undefined && pacing.concurrentFragments > 0) {
    args.push('--concurrent-fragments', String(Math.trunc(pacing.concurrentFragments)));
  }
}

async function invokeOnce(opts: InvokeOptions, strategy: RetryStrategy): Promise<YtDlpResult> {
  const extractorArgsArr: string[] = [];
  if (strategy.kind === 'pot') {
    if (strategy.reMint) opts.tokenService.invalidateCache();
    const { token, visitorData, fromCache } = await opts.tokenService.mintTokenForUrl(opts.url);
    if (!fromCache) opts.signal?.onMinting?.(strategy.reMint ? 1 : 0);
    extractorArgsArr.push('--extractor-args', buildPotExtractorArgs(token, visitorData));
  } else if (strategy.kind === 'fallback') {
    extractorArgsArr.push('--extractor-args', PLAYER_CLIENT_FALLBACK);
  }
  // 'noExtractorArgs' → no --extractor-args flag at all. yt-dlp runs vanilla
  // for non-YouTube extractors.

  const cookiesArgs = opts.cookies?.kind === 'file' ? ['--cookies', opts.cookies.path] : opts.cookies?.kind === 'browser' ? ['--cookies-from-browser', opts.cookies.browser] : [];
  const proxyArgs = opts.proxyUrl ? ['--proxy', opts.proxyUrl] : [];
  // Bandwidth cap (anti-bot lever): only applied to media downloads via the
  // caller — never on probes (we want format JSON instantly) or subtitle
  // sidecar pulls (tiny text, throttling adds zero anti-bot value).
  const limitRateArgs = opts.limitRate ? ['--limit-rate', opts.limitRate] : [];
  // yt-dlp 2026+ requires a JS runtime for nsig/signature decoding on the web
  // client. With deno bundled, we point yt-dlp at it explicitly so it doesn't
  // silently fall back to JS-free clients (where our web.gvs PoT is unused).
  const jsRuntimeArgs = opts.denoPath ? ['--js-runtimes', `deno:${opts.denoPath}`] : [];
  // Pass ffmpeg's location to yt-dlp explicitly instead of relying on the PATH
  // injection in spawnYtDlp. That PATH approach is unreliable inside the packaged
  // Electron portable on Windows: `process.env` can expose the variable as `Path`,
  // so `{ ...process.env }` then `env.PATH = …` writes a *second* key `PATH`
  // holding only ffmpegDir. The child ends up with both `Path=` and `PATH=`, and
  // yt-dlp's frozen-Python `shutil.which('ffmpeg')` reads the original `Path`
  // (without ffmpegDir) → "Preprocessing/Postprocessing: ffmpeg not found".
  const ffmpegLocationArgs = opts.ffmpegPath ? ['--ffmpeg-location', opts.ffmpegPath] : [];
  const args = [...ffmpegLocationArgs, ...extractorArgsArr, ...cookiesArgs, ...proxyArgs, ...limitRateArgs, ...jsRuntimeArgs, ...opts.args];

  ytDlpLog.info('spawn', {
    attempt: strategy.kind,
    reMint: strategy.kind === 'pot' ? strategy.reMint : undefined,
    binary: opts.ytDlpPath,
    ffmpeg: opts.ffmpegPath,
    deno: opts.denoPath,
    cookies: opts.cookies?.kind ?? null,
    proxy: redactProxy(opts.proxyUrl),
    args
  });

  const abortSignal = opts.signal?.abortSignal;
  if (abortSignal?.aborted) {
    return Promise.resolve({
      kind: 'exit-error',
      exitCode: -1,
      errorKind: 'unknown',
      rawError: 'Cancelled',
      stdout: '',
      stderr: ''
    });
  }
  return new Promise<YtDlpResult>((resolve) => {
    const proc = spawnYtDlp(opts.ytDlpPath, args, opts.ffmpegPath);
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: YtDlpResult): void => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (abortSignal && onAbort) abortSignal.removeEventListener('abort', onAbort);
      resolve(result);
    };

    // Force-kill if the process exceeds opts.timeoutMs. SIGKILL on win32 is
    // implemented by node as TerminateProcess — the close event still fires,
    // which the `settled` guard absorbs as a no-op.
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          try {
            proc.kill('SIGKILL');
          } catch {
            /* already exited */
          }
          // Detach buffered listeners — the dead proc will eventually fire
          // 'close' (the settled guard absorbs it), but until GC the closure
          // captures stdout/stderr buffers we no longer need.
          proc.stdout.removeAllListeners('data');
          proc.stderr.removeAllListeners('data');
          finish({
            kind: 'exit-error',
            exitCode: -1,
            errorKind: 'unknown',
            rawError: 'Probe timed out',
            stdout,
            stderr
          });
        }, opts.timeoutMs)
      : null;

    // Caller-driven cancel — kill the child and resolve with a Cancelled
    // exit-error so the wider probe pipeline can categorize and exit cleanly
    // rather than waiting for natural completion.
    const onAbort = abortSignal
      ? (): void => {
          try {
            proc.kill('SIGKILL');
          } catch {
            /* already exited */
          }
          proc.stdout.removeAllListeners('data');
          proc.stderr.removeAllListeners('data');
          finish({
            kind: 'exit-error',
            exitCode: -1,
            errorKind: 'unknown',
            rawError: 'Cancelled',
            stdout,
            stderr
          });
        }
      : null;
    if (abortSignal && onAbort) abortSignal.addEventListener('abort', onAbort, { once: true });

    opts.signal?.onSpawn?.(proc);

    proc.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      opts.signal?.onStdout?.(text);
    });

    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      opts.signal?.onStderr?.(text);
    });

    proc.on('error', (error) => finish({ kind: 'spawn-error', error, stdout, stderr }));

    proc.on('close', (code) => {
      if (code === 0) {
        finish({
          kind: 'success',
          stdout,
          stderr,
          // 'fallback' is the YouTube degraded-success path (no PoT). The non-YouTube
          // vanilla path ('noExtractorArgs') is not a fallback — the user sees nothing.
          usedExtractorFallback: strategy.kind === 'fallback'
        });
        return;
      }
      finish({
        kind: 'exit-error',
        exitCode: code ?? -1,
        errorKind: classifyYtDlpStderr(stderr).kind,
        rawError: extractLastError(stderr),
        stdout,
        stderr
      });
    });
  });
}

// 3-attempt ladder (YouTube only):
//   0. PoT token  → if botBlock, retry
//   1. Re-mint PoT → if still botBlock, fall back
//   2. No PoT, player_client=default,-web,-web_safari  (final attempt)
//
// If the *first* PoT mint throws (provider unavailable, scrape broke), we
// skip the PoT path entirely and go straight to step 2.
//
// Non-YouTube URLs run a single attempt with no --extractor-args. Skipping the
// PoT mint avoids gratuitous HiddenWindow scrapes for sites where the token
// would be ignored.
//
// Probe requests (--dump-single-json) also bypass the PoT path. The
// `visitor_data` arg that travels alongside the PoT silently caps YouTube tab
// pagination at 100 entries (single innertube page) regardless of
// --playlist-end, so a 290-video playlist comes back with `entries.length=100`
// and `playlist_count=290` — visible in user reports as "can't fetch more than
// 100 videos". Probes don't fetch streaming URLs, so PoT validation isn't
// needed; non-web clients (android/ios) provide the format JSON.
async function invokeWithRetry(opts: InvokeOptions): Promise<YtDlpResult> {
  // Site adapter resolves PoT applicability from the URL hostname. The unified
  // probe pipeline runs before extractor identity is known, so URL-based
  // routing stays the conservative pre-probe signal.
  if (opts.isProbe || !siteForUrl(opts.url).needsPotToken) {
    return invokeOnce(opts, { kind: 'noExtractorArgs' });
  }

  let result: YtDlpResult;
  try {
    result = await invokeOnce(opts, { kind: 'pot', reMint: false });
  } catch {
    return invokeOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.errorKind !== 'botBlock') return result;

  try {
    result = await invokeOnce(opts, { kind: 'pot', reMint: true });
  } catch {
    return invokeOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.errorKind !== 'botBlock') return result;

  return invokeOnce(opts, { kind: 'fallback' });
}

// Auto-captions are post-processed to dedupe rolling cues. Dedupe is
// implemented for SRT and VTT; ASS is not covered, so auto+ASS is forced to
// SRT. The UI surfaces this so users aren't surprised.
function effectiveSubtitleFormat(req: { writeAutoSubs?: boolean; subtitleFormat: SubtitleFormat }): SubtitleFormat {
  if (req.writeAutoSubs && req.subtitleFormat === 'ass') return 'srt';
  return req.subtitleFormat;
}

function buildSubtitleArgs(req: Extract<YtDlpRequest, { kind: 'subtitle' }>): string[] {
  const subOutputDir = req.subtitleMode === 'subfolder' ? `${req.outputDir}/subtitles` : req.outputDir;
  const fmt = effectiveSubtitleFormat(req);
  const template = req.outputTemplate ?? '%(title).200B.%(ext)s';
  return ['--skip-download', '--no-playlist', '--write-subs', '--sub-langs', req.subtitleLanguages.join(','), ...(req.writeAutoSubs ? ['--write-auto-subs'] : []), '--sleep-subtitles', '3', '--sub-format', `${fmt}/best`, '--convert-subs', fmt, '-o', `${subOutputDir}/${template}`, req.url];
}

function buildVideoArgs(req: Extract<YtDlpRequest, { kind: 'video' | 'video+embed' }>): string[] {
  const skipDownload = req.kind === 'video' && req.skipDownload === true;
  const args: string[] = ['--progress', '--no-playlist'];
  // Resume hardening: feed cached metadata from a prior spawn so yt-dlp
  // skips extractor work entirely. Avoids signed-URL expiry, session-cookie
  // drift, and HLS format-ID churn that otherwise breaks resume on sites
  // like PornHub.
  if (req.loadInfoJsonPath) {
    args.push('--load-info-json', req.loadInfoJsonPath);
  }
  // Resume from any .part file left by a prior interrupted run (network drop,
  // hard kill, etc.). Cancel paths explicitly call cleanupPartFiles() so a
  // user-cancelled download starts fresh.
  if (!skipDownload) {
    // YouTube serves big VP9/AV1 itags (315/337/313, 4K HDR ~1GB) over a
    // ranged HTTP that frequently truncates mid-body, surfacing as
    // "X bytes read, Y more expected. Retrying ...". Splitting into 10MB
    // ranges sidesteps the truncation. Doubled retry budgets cover the
    // long tail when YT throttles a chunk hard.
    args.push('--continue', '--http-chunk-size', '10M', '--retries', '20', '--fragment-retries', '20');
  }

  const forcesMkv = req.kind === 'video+embed' && req.subtitleLanguages.length > 0;
  // Audio-only conversion is mutually exclusive with subtitle embedding (no
  // video container to embed into) — typed off here, enforced at the wizard.
  const audioConvert = req.kind === 'video' ? req.audioConvert : undefined;

  if (forcesMkv) {
    // mkv embeds vtt natively as a webvtt stream — no --convert-subs needed.
    // mp4+mov_text muxing is unreliable across YouTube's auto-caption variants.
    // --compat-options no-keep-subs deletes the sidecar .vtt files after embed.
    args.push('--write-subs', '--embed-subs', '--sub-langs', req.subtitleLanguages.join(','), '--merge-output-format', EMBED_CONTAINER_EXT, '--compat-options', 'no-keep-subs', '--sleep-subtitles', '3');
    if (req.writeAutoSubs) args.push('--write-auto-subs');
  } else {
    args.push('--no-write-subs', '--no-write-auto-subs');
  }

  if (req.sponsorBlock && req.sponsorBlock.categories.length > 0) {
    const cats = req.sponsorBlock.categories.join(',');
    if (req.sponsorBlock.mode === 'mark') {
      args.push('--sponsorblock-mark', cats);
    } else {
      args.push('--sponsorblock-remove', cats);
    }
  }

  if (req.embedChapters) args.push('--embed-chapters');

  const { embedMetadata, embedThumbnail } = resolveEmbedPolicy({
    embedMetadata: req.embedMetadata,
    embedThumbnail: req.embedThumbnail,
    audioConvert
  });

  if (embedMetadata) args.push('--add-metadata');
  if (embedThumbnail && !forcesMkv) args.push('--embed-thumbnail', '--convert-thumbnails', 'jpg');

  if (req.writeDescription) args.push('--write-description');
  if (req.writeThumbnail) args.push('--write-thumbnail');

  if (skipDownload) {
    args.push('--skip-download');
  } else if (audioConvert) {
    // Override format to bestaudio: -x is mutually exclusive with video+audio
    // merging, and the audio post-processor needs an audio-only source.
    args.push('-f', 'bestaudio/best', '-x', '--audio-format', audioConvert.target);
    if (audioConvert.target !== 'wav') {
      args.push('--audio-quality', `${audioConvert.bitrateKbps}K`);
    }
  } else if (req.formatSelector) {
    args.push('-f', req.formatSelector);
  } else if (req.formatId) {
    args.push('-f', req.formatId);
  }
  const template = req.outputTemplate ?? '%(title).200B.%(ext)s';
  if (req.tempDir) {
    args.push('--paths', `home:${req.outputDir}`, '--paths', `temp:${req.tempDir}`, '-o', template);
  } else {
    args.push('-o', `${req.outputDir}/${template}`);
  }
  // Persist info.json to a deterministic path inside tempDir so the next
  // spawn can find it (consumed by --load-info-json on resume). Skipped for
  // skipDownload paths (no download = no resume). Pushed after the media
  // `-o` so callers indexing the first `-o` still find the media template.
  if (req.tempDir && !skipDownload) {
    args.push('--write-info-json', '-o', `infojson:${req.tempDir}/_arroxy`);
  }
  // With --load-info-json, the info.json is the input source; passing a URL
  // triggers "WARNING: URLs are ignored due to --load-info-json" noise.
  if (!req.loadInfoJsonPath) args.push(req.url);
  return args;
}

export function buildArgs(req: YtDlpRequest, opts: { pacing?: NetworkPacingArgs; playlistProbeLimit?: number } = {}): { args: string[]; subtitleFormat?: SubtitleFormat } {
  switch (req.kind) {
    case 'probe': {
      // --dump-single-json: one JSON document per URL regardless of content type.
      // --flat-playlist: for playlists, returns flat entries (id+title+url) instead
      //   of expanding each entry. For non-playlist URLs it's a no-op — yt-dlp
      //   still returns full video info (formats, subs, etc.).
      // --playlist-end: cap enumeration for channels / search / playlists.
      //   Big channels (5000+ uploads) would otherwise hang the probe and
      //   produce JSON the renderer can't paginate. 500 is a generous ceiling
      //   for a single-screen picker.
      // playlistMode disambiguates mixed YouTube URLs (?v=X&list=Y): yt-dlp's
      //   default routes Radio/Mix to playlist, which is rarely user intent.
      const modeFlag = req.playlistMode === 'video' ? ['--no-playlist'] : req.playlistMode === 'playlist' ? ['--yes-playlist'] : [];
      const capFlag = req.playlistMode === 'video' ? [] : ['--playlist-end', String(opts.playlistProbeLimit ?? DEFAULT_PLAYLIST_PROBE_LIMIT)];
      const args = ['--dump-single-json', '--flat-playlist', ...modeFlag, ...capFlag];
      appendRequestPacingArgs(args, opts.pacing);
      args.push(req.url);
      return { args };
    }
    case 'subtitle': {
      const args = buildSubtitleArgs(req);
      insertBeforeLastArg(args, requestPacingArgs(opts.pacing));
      if (opts.pacing?.sleepSubtitles !== undefined) {
        const idx = args.indexOf('--sleep-subtitles');
        if (idx >= 0) args.splice(idx, 2);
        if (opts.pacing.sleepSubtitles > 0) args.splice(args.length - 1, 0, '--sleep-subtitles', formatPacingNumber(opts.pacing.sleepSubtitles));
      }
      return { args, subtitleFormat: effectiveSubtitleFormat(req) };
    }
    case 'video':
    case 'video+embed': {
      const args = buildVideoArgs(req);
      if (req.loadInfoJsonPath) {
        args.push(...downloadPacingArgs(opts.pacing));
      } else {
        insertBeforeLastArg(args, downloadPacingArgs(opts.pacing));
      }
      if (opts.pacing?.sleepSubtitles !== undefined && (req.kind === 'video+embed' || args.includes('--sleep-subtitles'))) {
        const idx = args.indexOf('--sleep-subtitles');
        if (idx >= 0) args.splice(idx, 2);
        if (opts.pacing.sleepSubtitles > 0 && req.kind === 'video+embed') {
          if (req.loadInfoJsonPath) {
            args.push('--sleep-subtitles', formatPacingNumber(opts.pacing.sleepSubtitles));
          } else {
            args.splice(args.length - 1, 0, '--sleep-subtitles', formatPacingNumber(opts.pacing.sleepSubtitles));
          }
        }
      }
      return { args };
    }
  }
}

export class YtDlp {
  private _ytDlpPath: string | null = null;
  private _ffmpegPath: string | null = null;
  private _denoPath: string | null = null;

  constructor(
    private readonly binaryManager: BinaryManager,
    private readonly tokenService: TokenService,
    private readonly settingsStore: SettingsStore
  ) {}

  // Call once at job start to emit binary-setup status events.
  // run() calls this lazily if not yet done; explicit call lets callers
  // emit status events during the download/install progress.
  async prepare(onStatus?: StatusReporter): Promise<void> {
    this._ytDlpPath = await this.binaryManager.ensureYtDlp(onStatus);
    this._ffmpegPath = await this.binaryManager.ensureFFmpeg(onStatus);
    // ffprobe must live in the same dir as ffmpeg so spawnYtDlp's PATH
    // injection picks up both. We don't need to track the path separately —
    // yt-dlp's post-processors discover it via PATH.
    await this.binaryManager.ensureFFprobe(onStatus);
    this._denoPath = await this.binaryManager.ensureDeno(onStatus);
  }

  get ffmpegPath(): string | null {
    return this._ffmpegPath;
  }

  async run(req: YtDlpRequest, signal?: YtDlpSignal): Promise<YtDlpResult> {
    if (!this._ytDlpPath) await this.prepare();
    const settings = await this.settingsStore.get();
    const cookies = resolveCookies(settings);
    const proxyUrl = nonEmpty(settings.common?.proxyUrl?.trim());
    const pacing = resolveNetworkPacing(settings.common);
    const playlistProbeLimit = resolvePlaylistProbeLimit(settings.common);
    const { args, subtitleFormat } = buildArgs(req, { pacing, playlistProbeLimit });
    const isProbe = req.kind === 'probe';
    // Bandwidth cap applies to media downloads only — probes need raw speed
    // for snappy "Fetch formats" UX, sidecar subs are tiny so throttling
    // wouldn't change YouTube's anti-bot signal.
    const isMediaDownload = req.kind === 'video' || req.kind === 'video+embed';
    const limitRate = isMediaDownload ? nonEmpty(settings.common?.limitRate?.trim()) : undefined;
    const result = await invokeWithRetry({
      url: req.url,
      ytDlpPath: this._ytDlpPath!,
      ffmpegPath: this._ffmpegPath,
      denoPath: this._denoPath,
      args,
      tokenService: this.tokenService,
      cookies,
      proxyUrl,
      limitRate,
      timeoutMs: isProbe ? PROBE_TIMEOUT_MS : undefined,
      isProbe,
      signal
    });
    if (result.kind === 'success' && subtitleFormat) {
      return { ...result, effectiveSubtitleFormat: subtitleFormat };
    }
    return result;
  }
}

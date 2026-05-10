import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import log from 'electron-log/main';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, type StderrSignal } from '@main/utils/ytdlpErrors';
import { resolveCookies, type ResolvedCookies } from './cookiesResolver';
import { nonEmpty } from '@shared/format';
import { EMBED_CONTAINER_EXT } from '@shared/subtitlePath';
import type { SubtitleFormat, SubtitleMode, SponsorBlockMode, SponsorBlockCategory, StatusKey, AudioConvert } from '@shared/types';
import { resolveEmbedPolicy } from '@shared/embedPolicy';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';
import type { SettingsStore } from '@main/stores/SettingsStore';

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

export type YtDlpRequest =
  | { kind: 'probe'; url: string }
  | { kind: 'playlist-probe'; url: string }
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
    };

export interface YtDlpSignal {
  onAttempt?: (attempt: 0 | 1 | 2) => void;
  onSpawn?: (proc: ChildProcessWithoutNullStreams) => void;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
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
      signal: StderrSignal | null;
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

type RetryStrategy = { kind: 'pot'; reMint: boolean } | { kind: 'fallback' };

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
  timeoutMs?: number;
  signal?: YtDlpSignal;
}

async function invokeOnce(opts: InvokeOptions, strategy: RetryStrategy): Promise<YtDlpResult> {
  let extractorArgs: string;
  if (strategy.kind === 'pot') {
    if (strategy.reMint) opts.tokenService.invalidateCache();
    const { token, visitorData } = await opts.tokenService.mintTokenForUrl(opts.url);
    extractorArgs = buildPotExtractorArgs(token, visitorData);
  } else {
    extractorArgs = PLAYER_CLIENT_FALLBACK;
  }

  const cookiesArgs = opts.cookies?.kind === 'file' ? ['--cookies', opts.cookies.path] : opts.cookies?.kind === 'browser' ? ['--cookies-from-browser', opts.cookies.browser] : [];
  const proxyArgs = opts.proxyUrl ? ['--proxy', opts.proxyUrl] : [];
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
  const args = [...ffmpegLocationArgs, '--extractor-args', extractorArgs, ...cookiesArgs, ...proxyArgs, ...jsRuntimeArgs, ...opts.args];

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

  return new Promise<YtDlpResult>((resolve) => {
    const proc = spawnYtDlp(opts.ytDlpPath, args, opts.ffmpegPath);
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: YtDlpResult): void => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
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
          finish({
            kind: 'exit-error',
            exitCode: -1,
            signal: null,
            rawError: 'Probe timed out',
            stdout,
            stderr
          });
        }, opts.timeoutMs)
      : null;

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
          usedExtractorFallback: strategy.kind === 'fallback'
        });
        return;
      }
      finish({
        kind: 'exit-error',
        exitCode: code ?? -1,
        signal: classifyStderr(stderr),
        rawError: extractLastError(stderr),
        stdout,
        stderr
      });
    });
  });
}

// 3-attempt ladder:
//   0. PoT token  → if botBlock, retry
//   1. Re-mint PoT → if still botBlock, fall back
//   2. No PoT, player_client=default,-web,-web_safari  (final attempt)
//
// If the *first* PoT mint throws (provider unavailable, scrape broke), we
// skip the PoT path entirely and go straight to step 2.
async function invokeWithRetry(opts: InvokeOptions): Promise<YtDlpResult> {
  opts.signal?.onAttempt?.(0);
  let result: YtDlpResult;
  try {
    result = await invokeOnce(opts, { kind: 'pot', reMint: false });
  } catch {
    opts.signal?.onAttempt?.(2);
    return invokeOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.signal !== 'botBlock') return result;

  opts.signal?.onAttempt?.(1);
  try {
    result = await invokeOnce(opts, { kind: 'pot', reMint: true });
  } catch {
    opts.signal?.onAttempt?.(2);
    return invokeOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.signal !== 'botBlock') return result;

  opts.signal?.onAttempt?.(2);
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
  const template = req.outputTemplate ?? '%(title)s.%(ext)s';
  return ['--skip-download', '--no-playlist', '--write-subs', '--sub-langs', req.subtitleLanguages.join(','), ...(req.writeAutoSubs ? ['--write-auto-subs'] : []), '--sleep-subtitles', '3', '--sub-format', `${fmt}/best`, '--convert-subs', fmt, '-o', `${subOutputDir}/${template}`, req.url];
}

function buildVideoArgs(req: Extract<YtDlpRequest, { kind: 'video' | 'video+embed' }>): string[] {
  const skipDownload = req.kind === 'video' && req.skipDownload === true;
  const args: string[] = ['--progress', '--no-playlist'];
  // Resume from any .part file left by a prior interrupted run (network drop,
  // hard kill, etc.). Cancel paths explicitly call cleanupPartFiles() so a
  // user-cancelled download starts fresh.
  if (!skipDownload) args.push('--continue');

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
  const template = req.outputTemplate ?? '%(title)s.%(ext)s';
  if (req.tempDir) {
    args.push('--paths', `home:${req.outputDir}`, '--paths', `temp:${req.tempDir}`, '-o', template);
  } else {
    args.push('-o', `${req.outputDir}/${template}`);
  }
  args.push(req.url);
  return args;
}

export function buildArgs(req: YtDlpRequest): { args: string[]; subtitleFormat?: SubtitleFormat } {
  switch (req.kind) {
    case 'probe':
      return { args: ['--dump-json', '--no-playlist', req.url] };
    case 'playlist-probe':
      // --flat-playlist returns NDJSON of entries; --no-playlist would defeat
      // enumeration entirely. --yes-playlist makes the intent explicit so
      // mixed video+playlist URLs always expand here.
      return { args: ['--dump-json', '--flat-playlist', '--yes-playlist', req.url] };
    case 'subtitle':
      return { args: buildSubtitleArgs(req), subtitleFormat: effectiveSubtitleFormat(req) };
    case 'video':
    case 'video+embed':
      return { args: buildVideoArgs(req) };
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
    const { args, subtitleFormat } = buildArgs(req);
    const isProbe = req.kind === 'probe' || req.kind === 'playlist-probe';
    const result = await invokeWithRetry({
      url: req.url,
      ytDlpPath: this._ytDlpPath!,
      ffmpegPath: this._ffmpegPath,
      denoPath: this._denoPath,
      args,
      tokenService: this.tokenService,
      cookies,
      proxyUrl,
      timeoutMs: isProbe ? PROBE_TIMEOUT_MS : undefined,
      signal
    });
    if (result.kind === 'success' && subtitleFormat) {
      return { ...result, effectiveSubtitleFormat: subtitleFormat };
    }
    return result;
  }
}

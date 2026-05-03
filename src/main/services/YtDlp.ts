import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, type StderrSignal } from '@main/utils/ytdlpErrors';
import { resolveCookiesPath } from './cookiesResolver';
import { EMBED_CONTAINER_EXT } from '@shared/subtitlePath';
import type { SubtitleFormat, SubtitleMode, SponsorBlockMode, SponsorBlockCategory, StatusKey } from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';
import type { SettingsStore } from '@main/stores/SettingsStore';

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void;

export type YtDlpRequest =
  | { kind: 'probe'; url: string }
  | {
      kind: 'subtitle';
      url: string;
      outputDir: string;
      subtitleLanguages: string[];
      subtitleMode?: SubtitleMode;
      subtitleFormat: SubtitleFormat;
      writeAutoSubs?: boolean;
    }
  | { kind: 'video'; url: string; outputDir: string; formatId?: string; sponsorBlock?: { mode: Exclude<SponsorBlockMode, 'off'>; categories: SponsorBlockCategory[] }; embedChapters?: boolean; embedMetadata?: boolean; embedThumbnail?: boolean; writeDescription?: boolean; writeThumbnail?: boolean }
  | {
      kind: 'video+embed';
      url: string;
      outputDir: string;
      formatId?: string;
      subtitleLanguages: string[];
      writeAutoSubs?: boolean;
      sponsorBlock?: { mode: Exclude<SponsorBlockMode, 'off'>; categories: SponsorBlockCategory[] };
      embedChapters?: boolean;
      embedMetadata?: boolean;
      embedThumbnail?: boolean;
      writeDescription?: boolean;
      writeThumbnail?: boolean;
    };

export type YtDlpSignal = {
  onAttempt?: (attempt: 0 | 1 | 2) => void;
  onSpawn?: (proc: ChildProcessWithoutNullStreams) => void;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

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

export function isSuccess(r: YtDlpResult): r is Extract<YtDlpResult, { kind: 'success' }> {
  return r.kind === 'success';
}

// VidBee's strategy: skip the player clients that demand a PoT, so the
// non-PoT download path works without needing to mint anything.
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari';

function buildPotExtractorArgs(token: string, visitorData: string): string {
  const visitor = visitorData ? `;visitor_data=${visitorData}` : '';
  return `youtube:po_token=web.gvs+${token}${visitor}`;
}

type RetryStrategy = { kind: 'pot'; reMint: boolean } | { kind: 'fallback' };

interface InvokeOptions {
  url: string;
  ytDlpPath: string;
  ffmpegPath: string | null;
  denoPath: string | null;
  args: string[];
  tokenService: TokenService;
  cookiesPath?: string;
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

  const cookiesArgs = opts.cookiesPath ? ['--cookies', opts.cookiesPath] : [];
  // yt-dlp 2026+ requires a JS runtime for nsig/signature decoding on the web
  // client. With deno bundled, we point yt-dlp at it explicitly so it doesn't
  // silently fall back to JS-free clients (where our web.gvs PoT is unused).
  const jsRuntimeArgs = opts.denoPath ? ['--js-runtimes', `deno:${opts.denoPath}`] : [];
  const args = ['--extractor-args', extractorArgs, ...cookiesArgs, ...jsRuntimeArgs, ...opts.args];

  return new Promise<YtDlpResult>((resolve) => {
    const proc = spawnYtDlp(opts.ytDlpPath, args, opts.ffmpegPath);
    let stdout = '';
    let stderr = '';

    opts.signal?.onSpawn?.(proc);

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString() as string;
      stdout += text;
      opts.signal?.onStdout?.(text);
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString() as string;
      stderr += text;
      opts.signal?.onStderr?.(text);
    });

    proc.on('error', (error) => resolve({ kind: 'spawn-error', error, stdout, stderr }));

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ kind: 'success', stdout, stderr, usedExtractorFallback: strategy.kind === 'fallback' });
        return;
      }
      resolve({
        kind: 'exit-error',
        exitCode: code ?? -1,
        signal: classifyStderr(stderr),
        rawError: extractLastError(stderr),
        stdout,
        stderr,
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
  const subOutputDir = req.subtitleMode === 'subfolder'
    ? `${req.outputDir}/subtitles`
    : req.outputDir;
  const fmt = effectiveSubtitleFormat(req);
  return [
    '--skip-download', '--no-playlist',
    '--write-subs', '--sub-langs', req.subtitleLanguages.join(','),
    ...(req.writeAutoSubs ? ['--write-auto-subs'] : []),
    '--sleep-subtitles', '3',
    '--sub-format', `${fmt}/best`,
    '--convert-subs', fmt,
    '-o', `${subOutputDir}/%(title)s.%(ext)s`, req.url
  ];
}

function buildVideoArgs(req: Extract<YtDlpRequest, { kind: 'video' | 'video+embed' }>): string[] {
  const args: string[] = ['--progress', '--no-playlist'];

  const forcesMkv = req.kind === 'video+embed' && req.subtitleLanguages.length > 0;

  if (forcesMkv) {
    // mkv embeds vtt natively as a webvtt stream — no --convert-subs needed.
    // mp4+mov_text muxing is unreliable across YouTube's auto-caption variants.
    // --compat-options no-keep-subs deletes the sidecar .vtt files after embed.
    args.push(
      '--write-subs', '--embed-subs',
      '--sub-langs', req.subtitleLanguages.join(','),
      '--merge-output-format', EMBED_CONTAINER_EXT,
      '--compat-options', 'no-keep-subs',
      '--sleep-subtitles', '3'
    );
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
  if (req.embedMetadata) args.push('--add-metadata');
  if (req.embedThumbnail && !forcesMkv) args.push('--embed-thumbnail', '--convert-thumbnails', 'jpg');

  if (req.writeDescription) args.push('--write-description');
  if (req.writeThumbnail) args.push('--write-thumbnail');

  if (req.formatId) args.push('-f', req.formatId);
  args.push('-o', `${req.outputDir}/%(title)s.%(ext)s`, req.url);
  return args;
}

function buildArgs(req: YtDlpRequest): { args: string[]; subtitleFormat?: SubtitleFormat } {
  switch (req.kind) {
    case 'probe':
      return { args: ['--dump-json', '--no-playlist', req.url] };
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
    private readonly settingsStore: SettingsStore,
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
    const cookiesPath = resolveCookiesPath(await this.settingsStore.get());
    const { args, subtitleFormat } = buildArgs(req);
    const result = await invokeWithRetry({
      url: req.url,
      ytDlpPath: this._ytDlpPath!,
      ffmpegPath: this._ffmpegPath,
      denoPath: this._denoPath,
      args,
      tokenService: this.tokenService,
      cookiesPath,
      signal,
    });
    if (result.kind === 'success' && subtitleFormat) {
      return { ...result, effectiveSubtitleFormat: subtitleFormat };
    }
    return result;
  }
}

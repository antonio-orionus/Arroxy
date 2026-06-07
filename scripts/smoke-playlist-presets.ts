// Real-network dry-run smoke for Arroxy playlist presets.
//
// Arroxy splits playlists into per-video queue items, so this does NOT use
// yt-dlp native playlist downloads. It probes one YouTube item, caches the real
// info JSON, then runs every UI-reachable PlaylistSelection through Arroxy's
// mediaIntentSpec -> buildVideoArgs path with yt-dlp --load-info-json.
//
// Usage:
//   bun run smoke:playlist
//   bun run smoke:playlist -- --url https://www.youtube.com/watch?v=...
//   bun run smoke:playlist -- --cookies /path/to/cookies.txt
//   bun run smoke:playlist -- --cookies-from-browser firefox

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { mediaIntentSpec, playlistSelectionToMediaIntent } from '../src/shared/mediaIntent.js';
import { AUDIO_BITRATES, PLAYLIST_VIDEO_TIERS, playlistAudioFormatSchema, type AudioBitrate, type PlaylistSelection } from '../src/shared/schemas.js';
import { buildVideoArgs, type YtDlpRequest } from '../src/main/services/YtDlp.js';

const DEFAULT_URL = 'https://www.youtube.com/watch?v=WO2b03Zdu4Q&pp=ygUCNGvSBwkJIwsBhyohjO8%3D';
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari';
const OUTPUT_TEMPLATE = '%(title).200B [%(id)s].%(ext)s';
const UI_REACHABLE_MP4_TIERS = ['1080', '720', '480', '360'] as const;
const RUN_TIMEOUT_MS = 120_000;

type ExtractorStrategy = 'auto' | 'vanilla' | 'fallback';

interface CliArgs {
  url?: string;
  cookies?: string;
  cookiesFromBrowser?: string;
  ytDlpPath?: string;
  denoPath?: string;
  extractorStrategy: ExtractorStrategy;
  keepTemp: boolean;
}

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

interface FormatInfo {
  format_id?: string;
  ext?: string;
  height?: number;
  vcodec?: string;
  acodec?: string;
}

interface SelectedInfo extends FormatInfo {
  title?: string;
  requested_formats?: FormatInfo[];
}

interface SmokeCase {
  name: string;
  selection: PlaylistSelection;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { extractorStrategy: 'auto', keepTemp: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') args.url = readFlagValue(argv, i++, a);
    else if (a === '--cookies') args.cookies = readFlagValue(argv, i++, a);
    else if (a === '--cookies-from-browser') args.cookiesFromBrowser = readFlagValue(argv, i++, a);
    else if (a === '--yt-dlp') args.ytDlpPath = readFlagValue(argv, i++, a);
    else if (a === '--deno') args.denoPath = readFlagValue(argv, i++, a);
    else if (a === '--extractor-strategy') args.extractorStrategy = parseExtractorStrategy(readFlagValue(argv, i++, a));
    else if (a === '--keep-temp') args.keepTemp = true;
    else if (a === '-h' || a === '--help') {
      console.log('Usage: bun run smoke:playlist [-- --url X --cookies file --cookies-from-browser firefox]');
      console.log('       [-- --yt-dlp path --deno path --extractor-strategy auto|vanilla|fallback --keep-temp]');
      process.exit(0);
    }
  }
  return args;
}

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('-')) {
    throw new Error(`Missing value for ${flag}.`);
  }
  return value;
}

function parseExtractorStrategy(value: string | undefined): ExtractorStrategy {
  if (value === 'auto' || value === 'vanilla' || value === 'fallback') return value;
  throw new Error(`Invalid --extractor-strategy '${value ?? ''}'. Expected auto, vanilla, or fallback.`);
}

function findBinary(name: 'yt-dlp' | 'deno', override?: string): string {
  if (override) {
    if (!existsSync(override)) throw new Error(`${name} not found at ${override}`);
    return override;
  }

  const exeName = process.platform === 'win32' ? `${name}.exe` : name;
  const userDataLinux = join(homedir(), '.config', 'arroxy');
  const userDataMac = join(homedir(), 'Library', 'Application Support', 'Arroxy');
  const userDataWin = process.env.APPDATA ? join(process.env.APPDATA, 'Arroxy') : '';
  const candidates = [
    process.env[name === 'yt-dlp' ? 'YT_DLP_PATH' : 'DENO_PATH'],
    join(userDataLinux, 'runtime-cache', 'binaries', exeName),
    join(userDataMac, 'runtime-cache', 'binaries', exeName),
    userDataWin ? join(userDataWin, 'runtime-cache', 'binaries', exeName) : null,
    `/opt/homebrew/bin/${name}`,
    `/usr/local/bin/${name}`,
    `/usr/bin/${name}`
  ].filter((p): p is string => Boolean(p));

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return exeName;
}

function run(binary: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const proc = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      stderr += `${stderr.endsWith('\n') || stderr === '' ? '' : '\n'}Timed out after ${RUN_TIMEOUT_MS}ms.`;
      proc.kill('SIGKILL');
    }, RUN_TIMEOUT_MS);
    proc.stdout.on('data', (c: Buffer) => {
      stdout += c.toString();
    });
    proc.stderr.on('data', (c: Buffer) => {
      stderr += c.toString();
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      reject(err);
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve({ exitCode: timedOut ? -1 : (code ?? -1), stdout, stderr, durationMs: Date.now() - start });
    });
  });
}

function cookiesArgs(args: CliArgs): string[] {
  if (args.cookies) return ['--cookies', args.cookies];
  if (args.cookiesFromBrowser) return ['--cookies-from-browser', args.cookiesFromBrowser];
  return [];
}

function denoArgs(denoPath: string): string[] {
  return existsSync(denoPath) ? ['--js-runtimes', `deno:${denoPath}`] : [];
}

function probeArgs(url: string, cli: CliArgs, denoPath: string, strategy: Exclude<ExtractorStrategy, 'auto'>): string[] {
  return [
    '--dump-single-json',
    '--skip-download',
    '--no-playlist',
    '--no-warnings',
    ...denoArgs(denoPath),
    ...(strategy === 'fallback' ? ['--extractor-args', PLAYER_CLIENT_FALLBACK] : []),
    ...cookiesArgs(cli),
    url
  ];
}

async function probeInfoJson(ytDlpPath: string, url: string, cli: CliArgs, denoPath: string): Promise<{ json: string; strategy: Exclude<ExtractorStrategy, 'auto'>; durationMs: number }> {
  const strategies: Exclude<ExtractorStrategy, 'auto'>[] = cli.extractorStrategy === 'auto' ? ['vanilla', 'fallback'] : [cli.extractorStrategy];
  let last: RunResult | null = null;

  for (const strategy of strategies) {
    const result = await run(ytDlpPath, probeArgs(url, cli, denoPath, strategy));
    if (result.exitCode === 0 && parseSelectedInfo(result.stdout)) {
      return { json: result.stdout, strategy, durationMs: result.durationMs };
    }
    last = result;
  }

  const tail = last?.stderr.trim().split('\n').slice(-4).join('\n') ?? 'unknown probe failure';
  throw new Error(`Initial YouTube probe failed.\n${tail}`);
}

function reqFor(selection: PlaylistSelection, outputDir: string, infoJsonPath: string): Extract<YtDlpRequest, { kind: 'video' }> {
  const spec = mediaIntentSpec(playlistSelectionToMediaIntent(selection));
  return {
    kind: 'video',
    url: DEFAULT_URL,
    outputDir,
    loadInfoJsonPath: infoJsonPath,
    formatSelector: spec.formatSelector,
    formatSort: spec.formatSort,
    mergeOutputFormat: spec.mergeOutputFormat,
    audioConvert: spec.audioConvert,
    outputTemplate: OUTPUT_TEMPLATE
  };
}

function smokeCases(): SmokeCase[] {
  const cases: SmokeCase[] = [
    ...PLAYLIST_VIDEO_TIERS.map((tier) => ({
      name: `video best ${tier}`,
      selection: { kind: 'video' as const, tier, codec: 'best' as const }
    })),
    ...UI_REACHABLE_MP4_TIERS.map((tier) => ({
      name: `video mp4 ${tier}`,
      selection: { kind: 'video' as const, tier, codec: 'mp4' as const }
    })),
    { name: 'audio best', selection: { kind: 'audio', format: 'best' } }
  ];

  for (const format of playlistAudioFormatSchema.options) {
    if (format === 'best') continue;
    for (const bitrateKbps of AUDIO_BITRATES) {
      cases.push({ name: `audio ${format} ${bitrateKbps}K`, selection: { kind: 'audio', format, bitrateKbps } });
    }
  }

  cases.push({ name: 'audio mp3 default bitrate', selection: { kind: 'audio', format: 'mp3' } });
  return cases;
}

function parseSelectedInfo(json: string): SelectedInfo | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isRecord(parsed)) return null;
    const selected: SelectedInfo = {
      title: readString(parsed.title),
      format_id: readString(parsed.format_id),
      ext: readString(parsed.ext),
      height: readNumber(parsed.height),
      vcodec: readString(parsed.vcodec),
      acodec: readString(parsed.acodec)
    };
    if (Array.isArray(parsed.requested_formats)) {
      selected.requested_formats = parsed.requested_formats.filter(isRecord).map((f) => ({
        format_id: readString(f.format_id),
        ext: readString(f.ext),
        height: readNumber(f.height),
        vcodec: readString(f.vcodec),
        acodec: readString(f.acodec)
      }));
    }
    return selected;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function selectedVideo(info: SelectedInfo): FormatInfo | null {
  const requested = info.requested_formats?.find((f) => f.vcodec !== undefined && f.vcodec !== 'none');
  if (requested) return requested;
  return info.vcodec !== undefined && info.vcodec !== 'none' ? info : null;
}

function selectedAudio(info: SelectedInfo): FormatInfo | null {
  const requested = info.requested_formats?.find((f) => f.acodec !== undefined && f.acodec !== 'none');
  if (requested) return requested;
  return info.acodec !== undefined && info.acodec !== 'none' ? info : null;
}

function assertArgValue(args: string[], flag: string, expected: string): string | null {
  const idx = args.indexOf(flag);
  if (idx < 0) return `missing ${flag}`;
  return args[idx + 1] === expected ? null : `${flag} expected ${expected}, got ${args[idx + 1] ?? '<missing>'}`;
}

function validate(caseDef: SmokeCase, args: string[], info: SelectedInfo): string[] {
  const failures: string[] = [];
  if (caseDef.selection.kind === 'video') {
    const video = selectedVideo(info);
    if (!video) {
      failures.push('yt-dlp selected no video stream');
      return failures;
    }
    if (caseDef.selection.tier !== 'best' && video.height !== undefined && video.height > Number(caseDef.selection.tier)) {
      failures.push(`height ${video.height} exceeds requested cap ${caseDef.selection.tier}`);
    }
    if (caseDef.selection.codec === 'mp4') {
      if (info.ext !== 'mp4') failures.push(`merged ext expected mp4, got ${info.ext ?? '<missing>'}`);
      if (video.vcodec === undefined || !/^(avc|h264)/i.test(video.vcodec)) failures.push(`video codec expected H.264/AVC preference, got ${video.vcodec ?? '<missing>'}`);
      failures.push(...[assertArgValue(args, '--merge-output-format', 'mp4'), assertArgValue(args, '-S', 'vcodec:h264,acodec:m4a,ext:mp4')].filter((s): s is string => s !== null));
    }
    return failures;
  }

  const audio = selectedAudio(info);
  const video = selectedVideo(info);
  if (!audio) failures.push('yt-dlp selected no audio stream');
  if (video) failures.push(`audio preset selected a video stream (${video.format_id ?? video.vcodec ?? 'unknown'})`);
  failures.push(...[assertArgValue(args, '-f', 'bestaudio/best')].filter((s): s is string => s !== null));

  if (caseDef.selection.format === 'best') {
    if (args.includes('-x')) failures.push('audio best should not extract/convert');
    return failures;
  }

  const expectedBitrate: AudioBitrate = caseDef.selection.bitrateKbps ?? 192;
  failures.push(
    ...[
      args.includes('-x') ? null : 'missing -x',
      assertArgValue(args, '--audio-format', caseDef.selection.format),
      assertArgValue(args, '--audio-quality', `${expectedBitrate}K`)
    ].filter((s): s is string => s !== null)
  );
  return failures;
}

function describeSelection(info: SelectedInfo): string {
  const video = selectedVideo(info);
  const audio = selectedAudio(info);
  const parts = [
    `ext=${info.ext ?? '?'}`,
    video ? `v=${video.vcodec ?? '?'}@${video.height ?? '?'}p` : 'v=none',
    audio ? `a=${audio.acodec ?? '?'}` : 'a=none'
  ];
  return parts.join('  ');
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));
  const url = firstNonEmpty(cli.url, process.env.ARROXY_SMOKE_URL) ?? DEFAULT_URL;
  const ytDlpPath = findBinary('yt-dlp', cli.ytDlpPath);
  const denoPath = findBinary('deno', cli.denoPath);
  const tempDir = await mkdtemp(join(tmpdir(), 'arroxy-playlist-smoke-'));
  const infoJsonPath = join(tempDir, 'info.json');

  console.log('Playlist preset smoke — real YouTube probe, yt-dlp dry-runs');
  console.log(`  yt-dlp: ${ytDlpPath}`);
  console.log(`  deno:   ${denoPath}`);
  console.log(`  url:    ${url}`);
  console.log('');

  try {
    const probe = await probeInfoJson(ytDlpPath, url, cli, denoPath);
    await writeFile(infoJsonPath, probe.json, 'utf-8');
    const probedInfo = parseSelectedInfo(probe.json);
    console.log(`  PASS  initial probe (${probe.strategy}, ${probe.durationMs}ms)  ${probedInfo?.title ?? '(no title)'}`);

    const cases = smokeCases();
    let failed = 0;
    for (const caseDef of cases) {
      const args = ['--simulate', '--dump-single-json', '--no-warnings', ...buildVideoArgs(reqFor(caseDef.selection, tempDir, infoJsonPath), undefined)];
      const result = await run(ytDlpPath, args);
      const info = parseSelectedInfo(result.stdout);
      const failures = info ? validate(caseDef, args, info) : ['yt-dlp did not return parseable JSON'];
      const ok = result.exitCode === 0 && failures.length === 0;
      if (!ok) failed++;
      const tag = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
      console.log(`  ${tag}  ${caseDef.name.padEnd(25)} ${result.durationMs}ms  ${info ? describeSelection(info) : result.stderr.trim().split('\n').pop()}`);
      for (const failure of failures) console.log(`         ${failure}`);
    }

    console.log('');
    if (failed > 0) {
      console.log(`\x1b[31m${failed}/${cases.length} playlist preset dry-runs failed.\x1b[0m`);
      process.exit(1);
    }
    console.log(`\x1b[32mAll ${cases.length} playlist preset dry-runs passed.\x1b[0m`);
  } finally {
    if (cli.keepTemp) {
      console.log(`  kept temp: ${tempDir}`);
    } else {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed !== '') return trimmed;
  }
  return undefined;
}

main().catch((err: unknown) => {
  console.error('Playlist preset smoke crashed:', err instanceof Error ? err.message : err);
  process.exit(2);
});

import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { YtDlp } from '@main/services/YtDlp.js';
import { EMBED_CONTAINER_EXT } from '@shared/subtitlePath.js';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process.js')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process.js';

const URL = 'https://www.youtube.com/watch?v=test';
const OUTPUT_DIR = '/downloads';

function makeFakeProcess(exitCode = 0) {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => proc.emit('close', exitCode), 10);
  return proc;
}

function makeYtDlp(
  opts: {
    settings?: Record<string, unknown>;
    token?: string;
    visitorData?: string;
    denoPath?: string | null;
  } = {}
) {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({
      token: opts.token ?? 'tok',
      visitorData: opts.visitorData ?? 'vd'
    }),
    invalidateCache: vi.fn()
  };
  const denoPath = opts.denoPath === undefined ? '/fake/deno' : opts.denoPath;
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue(denoPath),
    ensureFFprobe: vi.fn().mockResolvedValue(null)
  };
  const settingsStore = { get: vi.fn().mockResolvedValue({ common: opts.settings ?? {}, single: {}, playlist: {} }) };
  return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
}

function getArgs(callIndex = 0): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1];
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
});

describe('YtDlp — probe args', () => {
  it('default (auto): --dump-single-json --flat-playlist + cap, no playlist flag', async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).toContain('--dump-single-json');
    expect(args).toContain('--flat-playlist');
    expect(args).not.toContain('--yes-playlist');
    expect(args).not.toContain('--no-playlist');
    expect(args).toContain('--playlist-end');
    expect(args[args.indexOf('--playlist-end') + 1]).toBe('101');
    expect(args[args.length - 1]).toBe(URL);
  });

  it("playlistMode='video': adds --no-playlist, drops --playlist-end (single-video resolution)", async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL, playlistMode: 'video' });
    const args = getArgs();
    expect(args).toContain('--no-playlist');
    expect(args).not.toContain('--yes-playlist');
    expect(args).not.toContain('--playlist-end');
  });

  it("playlistMode='playlist': adds --yes-playlist + sentinel --playlist-end 101", async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL, playlistMode: 'playlist' });
    const args = getArgs();
    expect(args).toContain('--yes-playlist');
    expect(args).not.toContain('--no-playlist');
    expect(args).toContain('--playlist-end');
    expect(args[args.indexOf('--playlist-end') + 1]).toBe('101');
  });

  it('settings.playlistProbeLimit overrides default --playlist-end', async () => {
    await makeYtDlp({ settings: { playlistProbeLimit: 250 } }).run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args[args.indexOf('--playlist-end') + 1]).toBe('251');
  });

  it('playlist scope first count maps to --playlist-items with a sentinel', async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL, playlistScope: { items: { kind: 'first', count: 50 } } });
    const args = getArgs();
    expect(args).toContain('--playlist-items');
    expect(args[args.indexOf('--playlist-items') + 1]).toBe('1:51');
    expect(args).not.toContain('--playlist-end');
  });

  it('playlist scope range maps to --playlist-items with an exclusive sentinel end', async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL, playlistScope: { items: { kind: 'range', from: 500, to: 600 } } });
    const args = getArgs();
    expect(args).toContain('--playlist-items');
    expect(args[args.indexOf('--playlist-items') + 1]).toBe('500:601');
    expect(args).not.toContain('--playlist-end');
  });

  it("playlistMode='video' ignores playlist scope args", async () => {
    await makeYtDlp().run({
      kind: 'probe',
      url: URL,
      playlistMode: 'video',
      playlistScope: { items: { kind: 'range', from: 10, to: 20 } }
    });
    const args = getArgs();
    expect(args).toContain('--no-playlist');
    expect(args).not.toContain('--playlist-items');
    expect(args).not.toContain('--playlist-end');
    expect(args).not.toContain('--dateafter');
    expect(args).not.toContain('--extractor-args');
  });
});

describe('YtDlp — outputTemplate', () => {
  it('video kind: outputTemplate replaces default %(title)s.%(ext)s', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      outputTemplate: '01 - %(title)s.%(ext)s'
    });
    const args = getArgs();
    const oArg = args[args.indexOf('-o') + 1];
    expect(oArg).toBe(`${OUTPUT_DIR}/01 - %(title)s.%(ext)s`);
  });

  it('subtitle kind: outputTemplate honored', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'srt',
      outputTemplate: '07 - %(title)s.%(ext)s'
    });
    const args = getArgs();
    const oArg = args[args.indexOf('-o') + 1];
    expect(oArg).toBe(`${OUTPUT_DIR}/07 - %(title)s.%(ext)s`);
  });

  it('video kind: tempDir + outputTemplate keeps -o template-only', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      tempDir: '/tmp/dl',
      outputTemplate: '02 - %(title)s.%(ext)s'
    });
    const args = getArgs();
    expect(args[args.indexOf('-o') + 1]).toBe('02 - %(title)s.%(ext)s');
    expect(args).toContain('--paths');
  });

  it('video kind: omitting outputTemplate keeps default %(title).200B.%(ext)s', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(args[args.indexOf('-o') + 1]).toBe(`${OUTPUT_DIR}/%(title).200B.%(ext)s`);
  });
});

describe('YtDlp — video args', () => {
  it('no formatId → no -f, includes --no-write-subs --no-write-auto-subs', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
    expect(args).not.toContain('-f');
  });

  it('with formatId → -f <id>', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, formatId: 'bv+ba' });
    const args = getArgs();
    const fIdx = args.indexOf('-f');
    expect(fIdx).toBeGreaterThan(-1);
    expect(args[fIdx + 1]).toBe('bv+ba');
  });

  it('with formatSelector → -f <selector>, formatId ignored', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      formatId: '137',
      formatSelector: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]'
    });
    const args = getArgs();
    const fIdx = args.indexOf('-f');
    expect(fIdx).toBeGreaterThan(-1);
    expect(args[fIdx + 1]).toBe('bestvideo[height<=1080]+bestaudio/best[height<=1080]');
    expect(args).not.toContain('137');
  });

  it('skipDownload → --skip-download present, no -f', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      formatSelector: 'bestaudio/best',
      skipDownload: true
    });
    const args = getArgs();
    expect(args).toContain('--skip-download');
    expect(args).not.toContain('-f');
  });

  it('kind=video → --continue present (resume any leftover .part)', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).toContain('--continue');
  });

  it('kind=video with skipDownload=true → no --continue (nothing to resume)', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, skipDownload: true });
    expect(getArgs()).not.toContain('--continue');
  });

  it('output template contains outputDir, url is last', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    const oIdx = args.indexOf('-o');
    expect(oIdx).toBeGreaterThan(-1);
    expect(args[oIdx + 1]).toContain(OUTPUT_DIR);
    expect(args[args.length - 1]).toBe(URL);
  });
});

describe('YtDlp — audio convert args', () => {
  it('mp3 192K → -f bestaudio/best, -x, --audio-format mp3, --audio-quality 192K', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'mp3', bitrateKbps: 192 }
    });
    const args = getArgs();
    expect(args[args.indexOf('-f') + 1]).toBe('bestaudio/best');
    expect(args).toContain('-x');
    expect(args[args.indexOf('--audio-format') + 1]).toBe('mp3');
    expect(args[args.indexOf('--audio-quality') + 1]).toBe('192K');
  });

  it('wav → no --audio-quality', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'wav' }
    });
    const args = getArgs();
    expect(args[args.indexOf('--audio-format') + 1]).toBe('wav');
    expect(args).not.toContain('--audio-quality');
  });

  it('mp3 → auto-embeds thumbnail + metadata when toggles unset', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'mp3', bitrateKbps: 192 }
    });
    const args = getArgs();
    expect(args).toContain('--embed-thumbnail');
    expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg');
    expect(args).toContain('--add-metadata');
  });

  it('wav → auto-metadata yes, auto-thumbnail no (incompatible)', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'wav' }
    });
    const args = getArgs();
    expect(args).toContain('--add-metadata');
    expect(args).not.toContain('--embed-thumbnail');
  });

  it('explicit embedThumbnail=false overrides auto-embed for music format', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'mp3', bitrateKbps: 192 },
      embedThumbnail: false,
      embedMetadata: false
    });
    const args = getArgs();
    expect(args).not.toContain('--embed-thumbnail');
    expect(args).not.toContain('--add-metadata');
  });

  it('opus 128K threads bitrate correctly', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'opus', bitrateKbps: 128 }
    });
    const args = getArgs();
    expect(args[args.indexOf('--audio-format') + 1]).toBe('opus');
    expect(args[args.indexOf('--audio-quality') + 1]).toBe('128K');
  });

  it('m4a 256K threads bitrate correctly', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      audioConvert: { target: 'm4a', bitrateKbps: 256 }
    });
    const args = getArgs();
    expect(args[args.indexOf('--audio-format') + 1]).toBe('m4a');
    expect(args[args.indexOf('--audio-quality') + 1]).toBe('256K');
  });

  it('audioConvert overrides any provided formatId', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      formatId: 'bv+ba',
      audioConvert: { target: 'mp3', bitrateKbps: 192 }
    });
    const args = getArgs();
    expect(args[args.indexOf('-f') + 1]).toBe('bestaudio/best');
    expect(args.filter((a) => a === '-f').length).toBe(1);
  });
});

describe('YtDlp — video+embed args', () => {
  it('--continue present', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en']
    });
    expect(getArgs()).toContain('--continue');
  });

  it('with subs → embed subtitle flags and EMBED_CONTAINER_EXT', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en', 'ja'],
      writeAutoSubs: false
    });
    const args = getArgs();
    expect(args).toContain('--write-subs');
    expect(args).toContain('--embed-subs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en,ja');
    expect(args[args.indexOf('--merge-output-format') + 1]).toBe(EMBED_CONTAINER_EXT);
    expect(args[args.indexOf('--compat-options') + 1]).toBe('no-keep-subs');
    expect(args).toContain('--sleep-subtitles');
    expect(args).not.toContain('--write-auto-subs');
  });

  it('writeAutoSubs=true → adds --write-auto-subs', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      writeAutoSubs: true
    });
    expect(getArgs()).toContain('--write-auto-subs');
  });

  it('empty subs array → falls back to no-subs branch', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: []
    });
    const args = getArgs();
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
    expect(args).not.toContain('--embed-subs');
  });
});

describe('YtDlp — subtitle args', () => {
  it('baseline: skip-download, write-subs, sub-langs, sleep, sub-format, convert-subs', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'vtt'
    });
    const args = getArgs();
    expect(args).toContain('--skip-download');
    expect(args).toContain('--no-playlist');
    expect(args).toContain('--write-subs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en');
    expect(args).toContain('--sleep-subtitles');
    expect(args[args.indexOf('--sub-format') + 1]).toBe('vtt/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('vtt');
    expect(args).not.toContain('--write-auto-subs');
  });

  it('writeAutoSubs=true → adds --write-auto-subs', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'srt',
      writeAutoSubs: true
    });
    expect(getArgs()).toContain('--write-auto-subs');
  });

  it('subtitleMode=subfolder → output path under <dir>/subtitles/', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'srt',
      subtitleMode: 'subfolder'
    });
    const args = getArgs();
    expect(args[args.indexOf('-o') + 1]).toContain(`${OUTPUT_DIR}/subtitles`);
  });

  it('subtitleMode=sidecar → output path is directly in outputDir (no subfolder)', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'srt',
      subtitleMode: 'sidecar'
    });
    const oArg = getArgs()[getArgs().indexOf('-o') + 1];
    expect(oArg).not.toContain('/subtitles');
    expect(oArg).toContain(OUTPUT_DIR);
  });

  it('ass + writeAutoSubs → coerced to srt in args, effectiveSubtitleFormat=srt on result', async () => {
    const result = await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'ass',
      writeAutoSubs: true
    });
    const args = getArgs();
    expect(args[args.indexOf('--sub-format') + 1]).toBe('srt/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('srt');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') expect(result.effectiveSubtitleFormat).toBe('srt');
  });

  it('ass without writeAutoSubs → no coercion', async () => {
    await makeYtDlp().run({
      kind: 'subtitle',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      subtitleFormat: 'ass',
      writeAutoSubs: false
    });
    const args = getArgs();
    expect(args[args.indexOf('--sub-format') + 1]).toBe('ass/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass');
  });
});

describe('YtDlp — cookies injection', () => {
  it("cookiesMode='file'+valid path → --cookies <path>", async () => {
    const ytDlp = makeYtDlp({
      settings: { cookiesMode: 'file', cookiesPath: '/home/u/cookies.txt' }
    });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const idx = args.indexOf('--cookies');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('/home/u/cookies.txt');
    expect(args).not.toContain('--cookies-from-browser');
  });

  it("cookiesMode='off' → no --cookies even with path", async () => {
    const ytDlp = makeYtDlp({
      settings: { cookiesMode: 'off', cookiesPath: '/home/u/cookies.txt' }
    });
    await ytDlp.run({ kind: 'probe', url: URL });
    expect(getArgs()).not.toContain('--cookies');
  });

  it("cookiesMode='file'+empty path → no --cookies", async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesMode: 'file', cookiesPath: '   ' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    expect(getArgs()).not.toContain('--cookies');
  });

  it("cookiesMode='browser'+browser → --cookies-from-browser <browser>, no --cookies", async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesMode: 'browser', cookiesBrowser: 'firefox' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const idx = args.indexOf('--cookies-from-browser');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('firefox');
    expect(args).not.toContain('--cookies');
  });

  it("cookiesMode='browser'+missing browser → no cookies args", async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesMode: 'browser' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).not.toContain('--cookies');
    expect(args).not.toContain('--cookies-from-browser');
  });

  it('cookies appear before request-specific args (after extractor-args block)', async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesMode: 'file', cookiesPath: '/cookies.txt' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const cookiesIdx = args.indexOf('--cookies');
    const dumpJsonIdx = args.indexOf('--dump-single-json');
    expect(cookiesIdx).toBeGreaterThan(-1);
    expect(cookiesIdx).toBeLessThan(dumpJsonIdx);
  });
});

describe('YtDlp — output embed flags', () => {
  it('embedChapters=true → --embed-chapters present', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, embedChapters: true });
    expect(getArgs()).toContain('--embed-chapters');
  });

  it('embedChapters=false → no --embed-chapters', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, embedChapters: false });
    expect(getArgs()).not.toContain('--embed-chapters');
  });

  it('embedChapters undefined → no --embed-chapters', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--embed-chapters');
  });

  it('sponsorBlock.mode=mark + embedChapters=false → no --embed-chapters (setting fully owns the flag)', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      embedChapters: false,
      sponsorBlock: { mode: 'mark', categories: ['sponsor'] }
    });
    expect(getArgs()).not.toContain('--embed-chapters');
  });

  it('sponsorBlock.mode=mark + embedChapters undefined → no --embed-chapters', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      sponsorBlock: { mode: 'mark', categories: ['sponsor'] }
    });
    expect(getArgs()).not.toContain('--embed-chapters');
  });

  it('sponsorBlock.mode=mark + embedChapters=true → --embed-chapters present', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      embedChapters: true,
      sponsorBlock: { mode: 'mark', categories: ['sponsor'] }
    });
    expect(getArgs()).toContain('--embed-chapters');
  });

  it('embedMetadata=true → --add-metadata present', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, embedMetadata: true });
    expect(getArgs()).toContain('--add-metadata');
  });

  it('embedMetadata=false → no --add-metadata', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, embedMetadata: false });
    expect(getArgs()).not.toContain('--add-metadata');
  });

  it('embedMetadata undefined → no --add-metadata', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--add-metadata');
  });

  it('embedThumbnail=true on kind=video → --embed-thumbnail and --convert-thumbnails jpg', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, embedThumbnail: true });
    const args = getArgs();
    expect(args).toContain('--embed-thumbnail');
    expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg');
  });

  it('embedThumbnail=false on kind=video → no thumbnail flags', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      embedThumbnail: false
    });
    expect(getArgs()).not.toContain('--embed-thumbnail');
    expect(getArgs()).not.toContain('--convert-thumbnails');
  });

  it('embedThumbnail=true on kind=video+embed with subs → flags absent (MKV-forced)', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      embedThumbnail: true
    });
    expect(getArgs()).not.toContain('--embed-thumbnail');
    expect(getArgs()).not.toContain('--convert-thumbnails');
  });

  it('embedThumbnail=true on kind=video+embed with empty subs → flags PRESENT (no MKV-force)', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: [],
      embedThumbnail: true
    });
    const args = getArgs();
    expect(args).toContain('--embed-thumbnail');
    expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg');
  });
});

describe('YtDlp — sidecar flags', () => {
  it('writeDescription=true on kind=video → --write-description present', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      writeDescription: true
    });
    expect(getArgs()).toContain('--write-description');
  });

  it('writeDescription=false on kind=video → no --write-description', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      writeDescription: false
    });
    expect(getArgs()).not.toContain('--write-description');
  });

  it('writeDescription undefined on kind=video → no --write-description', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--write-description');
  });

  it('writeThumbnail=true on kind=video → --write-thumbnail present', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, writeThumbnail: true });
    expect(getArgs()).toContain('--write-thumbnail');
  });

  it('writeThumbnail=false on kind=video → no --write-thumbnail', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      writeThumbnail: false
    });
    expect(getArgs()).not.toContain('--write-thumbnail');
  });

  it('writeThumbnail undefined on kind=video → no --write-thumbnail', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--write-thumbnail');
  });

  it('writeDescription=true on kind=video+embed → --write-description present', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      writeDescription: true
    });
    expect(getArgs()).toContain('--write-description');
  });

  it('writeThumbnail=true on kind=video+embed → --write-thumbnail present', async () => {
    await makeYtDlp().run({
      kind: 'video+embed',
      url: URL,
      outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'],
      writeThumbnail: true
    });
    expect(getArgs()).toContain('--write-thumbnail');
  });

  it('both sidecar flags true on kind=video → both flags present', async () => {
    await makeYtDlp().run({
      kind: 'video',
      url: URL,
      outputDir: OUTPUT_DIR,
      writeDescription: true,
      writeThumbnail: true
    });
    const args = getArgs();
    expect(args).toContain('--write-description');
    expect(args).toContain('--write-thumbnail');
  });
});

describe('YtDlp — extractor-args shape', () => {
  it('PoT (kind=video): youtube:po_token=web.gvs+<token>;visitor_data=<vd>', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: 'MYVISITOR' });
    await ytDlp.run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    const i = args.indexOf('--extractor-args');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(args[i + 1]).toBe('youtube:po_token=web.gvs+MYTOKEN;visitor_data=MYVISITOR');
  });

  it('empty visitorData (kind=video) → omits ;visitor_data= segment', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: '' });
    await ytDlp.run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    const i = args.indexOf('--extractor-args');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(args[i + 1]).toBe('youtube:po_token=web.gvs+MYTOKEN');
    expect(args[i + 1]).not.toContain('visitor_data');
  });

  // Regression guard: visitor_data passed to YouTube tab extractor silently
  // caps playlist enumeration at 100 entries (single innertube page),
  // regardless of --playlist-end. Probes are metadata-only and don't fetch
  // streaming URLs, so PoT is unneeded; skipping it lets non-web clients
  // (android/ios) provide full format JSON and unblocks tab pagination.
  it('probe (YouTube): no --extractor-args (bypasses PoT to avoid visitor_data tab cap)', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: 'MYVISITOR' });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).not.toContain('--extractor-args');
  });

  it('probe (YouTube, playlistMode=video): also no --extractor-args', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: 'MYVISITOR' });
    await ytDlp.run({ kind: 'probe', url: URL, playlistMode: 'video' });
    const args = getArgs();
    expect(args).not.toContain('--extractor-args');
  });
});

describe('YtDlp — limit-rate', () => {
  it('settings.limitRate set + kind=video → --limit-rate <value>', async () => {
    const ytDlp = makeYtDlp({ settings: { limitRate: '500K' } });
    await ytDlp.run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    const idx = args.indexOf('--limit-rate');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('500K');
  });

  it('settings.limitRate set + kind=video+embed → --limit-rate <value>', async () => {
    const ytDlp = makeYtDlp({ settings: { limitRate: '1.5M' } });
    await ytDlp.run({ kind: 'video+embed', url: URL, outputDir: OUTPUT_DIR, subtitleLanguages: ['en'] });
    const args = getArgs();
    const idx = args.indexOf('--limit-rate');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('1.5M');
  });

  it('settings.limitRate set + kind=probe → no --limit-rate (probe must stay fast)', async () => {
    const ytDlp = makeYtDlp({ settings: { limitRate: '500K' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    expect(getArgs()).not.toContain('--limit-rate');
  });

  it('settings.limitRate set + kind=subtitle → no --limit-rate (sidecar phase exempt)', async () => {
    const ytDlp = makeYtDlp({ settings: { limitRate: '500K' } });
    await ytDlp.run({ kind: 'subtitle', url: URL, outputDir: OUTPUT_DIR, subtitleLanguages: ['en'], subtitleFormat: 'srt' });
    expect(getArgs()).not.toContain('--limit-rate');
  });

  it('settings.limitRate empty/whitespace → no --limit-rate', async () => {
    const ytDlp = makeYtDlp({ settings: { limitRate: '   ' } });
    await ytDlp.run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--limit-rate');
  });

  it('settings.limitRate undefined → no --limit-rate', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    expect(getArgs()).not.toContain('--limit-rate');
  });
});

describe('YtDlp — network pacing', () => {
  function getArgValue(args: string[], flag: string): string {
    const idx = args.indexOf(flag);
    if (idx === -1) throw new Error(`flag ${flag} not found in args: ${args.join(' ')}`);
    return args[idx + 1];
  }

  it('balanced preset applies request pacing to probes', async () => {
    await makeYtDlp({ settings: { networkPacingPreset: 'balanced' } }).run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).toContain('--sleep-requests');
    expect(args[args.indexOf('--sleep-requests') + 1]).toBe('1');
  });

  it('missing pacing preset defaults to balanced', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(getArgValue(args, '--sleep-requests')).toBe('1');
    expect(getArgValue(args, '--sleep-interval')).toBe('5');
    expect(getArgValue(args, '--max-sleep-interval')).toBe('10');
    expect(getArgValue(args, '--concurrent-fragments')).toBe('1');
  });

  it('balanced preset applies download pacing to video downloads', async () => {
    await makeYtDlp({ settings: { networkPacingPreset: 'balanced' } }).run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(getArgValue(args, '--sleep-requests')).toBe('1');
    expect(getArgValue(args, '--sleep-interval')).toBe('5');
    expect(getArgValue(args, '--max-sleep-interval')).toBe('10');
    expect(getArgValue(args, '--concurrent-fragments')).toBe('1');
  });

  it('balanced preset applies 3s subtitle pacing to subtitle requests', async () => {
    await makeYtDlp({ settings: { networkPacingPreset: 'balanced' } }).run({ kind: 'subtitle', url: URL, outputDir: OUTPUT_DIR, subtitleLanguages: ['en'], subtitleFormat: 'srt' });
    const args = getArgs();
    expect(getArgValue(args, '--sleep-subtitles')).toBe('3');
  });

  it('off preset still keeps the baseline media-start pause', async () => {
    await makeYtDlp({ settings: { networkPacingPreset: 'off' } }).run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(args).not.toContain('--sleep-requests');
    expect(getArgValue(args, '--sleep-interval')).toBe('1');
    expect(getArgValue(args, '--max-sleep-interval')).toBe('3');
  });

  it('custom preset applies subtitle sleep to subtitle requests', async () => {
    await makeYtDlp({ settings: { networkPacingPreset: 'custom', pacingSleepRequests: 2, pacingSleepSubtitles: 7 } }).run({ kind: 'subtitle', url: URL, outputDir: OUTPUT_DIR, subtitleLanguages: ['en'], subtitleFormat: 'srt' });
    const args = getArgs();
    expect(getArgValue(args, '--sleep-requests')).toBe('2');
    expect(getArgValue(args, '--sleep-subtitles')).toBe('7');
  });
});

describe('YtDlp — js-runtimes (deno)', () => {
  it('passes --js-runtimes deno:<path> when deno is bundled', async () => {
    const ytDlp = makeYtDlp({ denoPath: '/fake/deno' });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const idx = args.indexOf('--js-runtimes');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('deno:/fake/deno');
  });

  it('omits --js-runtimes entirely when deno is unavailable', async () => {
    const ytDlp = makeYtDlp({ denoPath: null });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).not.toContain('--js-runtimes');
  });
});

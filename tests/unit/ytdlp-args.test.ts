import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { YtDlp } from '@main/services/YtDlp';
import { EMBED_CONTAINER_EXT } from '@shared/subtitlePath';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

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
  const settingsStore = { get: vi.fn().mockResolvedValue(opts.settings ?? {}) };
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
  it('--dump-json --no-playlist url', async () => {
    await makeYtDlp().run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args).toContain('--dump-json');
    expect(args).toContain('--no-playlist');
    expect(args[args.length - 1]).toBe(URL);
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
  it('cookiesEnabled+valid path → --cookies <path>', async () => {
    const ytDlp = makeYtDlp({
      settings: { cookiesEnabled: true, cookiesPath: '/home/u/cookies.txt' }
    });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const idx = args.indexOf('--cookies');
    expect(idx).toBeGreaterThan(-1);
    expect(args[idx + 1]).toBe('/home/u/cookies.txt');
  });

  it('cookiesEnabled=false → no --cookies even with path', async () => {
    const ytDlp = makeYtDlp({
      settings: { cookiesEnabled: false, cookiesPath: '/home/u/cookies.txt' }
    });
    await ytDlp.run({ kind: 'probe', url: URL });
    expect(getArgs()).not.toContain('--cookies');
  });

  it('cookiesEnabled+empty path → no --cookies', async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesEnabled: true, cookiesPath: '   ' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    expect(getArgs()).not.toContain('--cookies');
  });

  it('cookies appear before request-specific args (after extractor-args block)', async () => {
    const ytDlp = makeYtDlp({ settings: { cookiesEnabled: true, cookiesPath: '/cookies.txt' } });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    const cookiesIdx = args.indexOf('--cookies');
    const dumpJsonIdx = args.indexOf('--dump-json');
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
  it('PoT: youtube:po_token=web.gvs+<token>;visitor_data=<vd>', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: 'MYVISITOR' });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args[0]).toBe('--extractor-args');
    expect(args[1]).toBe('youtube:po_token=web.gvs+MYTOKEN;visitor_data=MYVISITOR');
  });

  it('empty visitorData → omits ;visitor_data= segment', async () => {
    const ytDlp = makeYtDlp({ token: 'MYTOKEN', visitorData: '' });
    await ytDlp.run({ kind: 'probe', url: URL });
    const args = getArgs();
    expect(args[1]).toBe('youtube:po_token=web.gvs+MYTOKEN');
    expect(args[1]).not.toContain('visitor_data');
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

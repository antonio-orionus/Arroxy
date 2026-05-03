import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { YtDlp } from '@main/services/YtDlp';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

const URL = 'https://www.youtube.com/watch?v=test';
const OUTPUT_DIR = '/downloads';
const TEMP_DIR = '/downloads/.arroxy-temp/abcd1234';

function makeFakeProcess(exitCode = 0) {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn(),
  });
  setTimeout(() => proc.emit('close', exitCode), 10);
  return proc;
}

function makeYtDlp() {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'tok', visitorData: 'vd' }),
    invalidateCache: vi.fn(),
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'),
    ensureDeno: vi.fn().mockResolvedValue('/fake/deno'),
    ensureFFprobe: vi.fn().mockResolvedValue(null),
  };
  const settingsStore = { get: vi.fn().mockResolvedValue({}) };
  return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never);
}

function getArgs(callIndex = 0): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1];
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never);
});

describe('YtDlp — --paths temp dir (video)', () => {
  it('when tempDir provided: uses --paths home: and --paths temp:', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, tempDir: TEMP_DIR });
    const args = getArgs();

    const homeIdx = args.indexOf('--paths');
    expect(homeIdx).toBeGreaterThan(-1);
    expect(args[homeIdx + 1]).toBe(`home:${OUTPUT_DIR}`);

    // Find second --paths for temp
    const tempIdx = args.indexOf('--paths', homeIdx + 1);
    expect(tempIdx).toBeGreaterThan(-1);
    expect(args[tempIdx + 1]).toBe(`temp:${TEMP_DIR}`);
  });

  it('when tempDir provided: -o template has no directory prefix', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, tempDir: TEMP_DIR });
    const args = getArgs();
    const oIdx = args.indexOf('-o');
    expect(oIdx).toBeGreaterThan(-1);
    expect(args[oIdx + 1]).not.toContain(OUTPUT_DIR);
    expect(args[oIdx + 1]).toBe('%(title)s.%(ext)s');
  });

  it('when tempDir is absent: falls back to old -o <outputDir>/%(title)s.%(ext)s', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR });
    const args = getArgs();
    expect(args).not.toContain('--paths');
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).toContain(OUTPUT_DIR);
  });

  it('url is always the last argument', async () => {
    await makeYtDlp().run({ kind: 'video', url: URL, outputDir: OUTPUT_DIR, tempDir: TEMP_DIR });
    expect(getArgs().at(-1)).toBe(URL);
  });
});

describe('YtDlp — --paths temp dir (video+embed)', () => {
  it('when tempDir provided: uses --paths home: and --paths temp:', async () => {
    await makeYtDlp().run({
      kind: 'video+embed', url: URL, outputDir: OUTPUT_DIR, tempDir: TEMP_DIR,
      subtitleLanguages: ['en'],
    });
    const args = getArgs();
    const homeIdx = args.indexOf('--paths');
    expect(args[homeIdx + 1]).toBe(`home:${OUTPUT_DIR}`);
    const tempIdx = args.indexOf('--paths', homeIdx + 1);
    expect(args[tempIdx + 1]).toBe(`temp:${TEMP_DIR}`);
  });
});

describe('YtDlp — subtitle requests unchanged by --paths', () => {
  it('subtitle kind does not use --paths', async () => {
    await makeYtDlp().run({
      kind: 'subtitle', url: URL, outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'], subtitleFormat: 'vtt',
    });
    expect(getArgs()).not.toContain('--paths');
  });

  it('subtitle -o still contains outputDir', async () => {
    await makeYtDlp().run({
      kind: 'subtitle', url: URL, outputDir: OUTPUT_DIR,
      subtitleLanguages: ['en'], subtitleFormat: 'srt',
    });
    const args = getArgs();
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).toContain(OUTPUT_DIR);
  });
});

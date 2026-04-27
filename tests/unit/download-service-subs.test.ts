import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DownloadService } from '@main/services/DownloadService';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => { vi.clearAllMocks(); });

function makeFakeProcess(exitCode: number, stderr = '') {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn()
  });
  setTimeout(() => {
    if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
    proc.emit('close', exitCode);
  }, 10);
  return proc;
}

import type { StatusEvent, StatusKey } from '@shared/types';

function captureStatuses(service: { on: (e: 'status', cb: (e: StatusEvent) => void) => void }): StatusEvent[] {
  const events: StatusEvent[] = [];
  service.on('status', (e) => events.push(e));
  return events;
}

function statusKeys(events: StatusEvent[]): StatusKey[] {
  return events.map((e) => e.statusKey);
}

function makeService() {
  const tokenService = {
    mintTokenForUrl: vi.fn().mockResolvedValue({ token: 'mock-token', visitorData: 'mock-visitor' }),
    invalidateCache: vi.fn()
  };
  const binaryManager = {
    ensureYtDlp: vi.fn().mockResolvedValue('/usr/bin/yt-dlp'),
    ensureFFmpeg: vi.fn().mockResolvedValue('/usr/bin/ffmpeg')
  };
  const recentJobsStore = { push: vi.fn().mockResolvedValue(undefined) };
  const logService = { log: vi.fn() };
  const service = new DownloadService(
    binaryManager as never, tokenService as never, recentJobsStore as never, logService as never, false
  );
  return { service, recentJobsStore };
}

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function callArgs(callIndex: number): string[] {
  return vi.mocked(spawnYtDlp).mock.calls[callIndex][1] as string[];
}

describe('DownloadService — split video/subtitle invocations', () => {
  beforeEach(() => {
    // Each spawn gets its own fresh process (each phase is a separate yt-dlp invocation)
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('phase 1 (video) never carries subtitle flags', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en', 'es'], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
    expect(args).not.toContain('--write-subs');
    expect(args).not.toContain('--write-auto-subs');
    expect(args).not.toContain('--sub-langs');
    expect(args).not.toContain('--sleep-subtitles');
  });

  it('phase 2 (subtitles) runs only when languages are selected', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(2);
    const args = callArgs(1);
    expect(args).toContain('--skip-download');
    expect(args).toContain('--write-subs');
    expect(args).toContain('--sub-langs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en');
  });

  it('phase 2 includes --write-auto-subs when writeAutoSubs is true', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en-orig'], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).toContain('--write-auto-subs');
  });

  it('phase 2 omits --write-auto-subs when writeAutoSubs is false', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], writeAutoSubs: false });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).not.toContain('--write-auto-subs');
  });

  it('phase 2 includes --sleep-subtitles 3 (rate-limit protection)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args).toContain('--sleep-subtitles');
    expect(args[args.indexOf('--sleep-subtitles') + 1]).toBe('3');
  });

  it('only phase 1 runs when no subtitles are requested', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });

  it('only phase 1 runs when subtitleLanguages is empty', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: [], writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });

  it('phase 1 always includes -f and -o', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('-f');
    expect(args[args.indexOf('-f') + 1]).toBe('137+251');
    expect(args).toContain('-o');
    expect(args).toContain(YOUTUBE_URL);
  });

  it('does NOT run phase 2 when phase 1 fails', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(1) as never);

    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });
});

describe('DownloadService — subtitle-only (no formatId)', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('runs only the subtitle invocation (no media phase) when formatId is undefined and subs are requested', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
    const args = callArgs(0);
    expect(args).toContain('--skip-download');
    expect(args).toContain('--write-subs');
    expect(args).toContain('--sub-langs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en');
    // and definitely no -f flag (no media format requested)
    expect(args).not.toContain('-f');
  });

  it('emits fetchingSubtitles (not downloadingMedia) on spawn for subtitle-only downloads', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    const keys = statusKeys(events);
    expect(keys).toContain('fetchingSubtitles');
    expect(keys).not.toContain('downloadingMedia');
  });

  it('records job as failed (not completed) when subtitle-only fetch fails — no soft fallback', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(1) as never);

    const { service, recentJobsStore } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    expect(recentJobsStore.push).toHaveBeenCalledOnce();
    expect(recentJobsStore.push.mock.calls[0][0].status).toBe('failed');
    // soft 'subtitlesFailed' is for the two-phase case; subtitle-only must not use it
    expect(statusKeys(events)).not.toContain('subtitlesFailed');
  });

  it('subtitle-only invocation honors subfolder mode in -o path', async () => {
    const { service } = makeService();
    await service.start({
      url: YOUTUBE_URL, outputDir: '/downloads',
      subtitleLanguages: ['en'], subtitleMode: 'subfolder', subtitleFormat: 'ass'
    });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).toContain('/downloads/Subtitles/');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass');
    expect(args[args.indexOf('--sub-format') + 1]).toBe('ass/best');
  });

  it('subtitle-only with embed mode degrades to sidecar treatment (no media to embed into)', async () => {
    const { service } = makeService();
    await service.start({
      url: YOUTUBE_URL, outputDir: '/tmp',
      subtitleLanguages: ['en'], subtitleMode: 'embed'
    });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
    const args = callArgs(0);
    expect(args).toContain('--skip-download');
    expect(args).not.toContain('--embed-subs');
    expect(args).not.toContain('--merge-output-format');
  });

  it('subtitle-only includes --write-auto-subs when writeAutoSubs is true', async () => {
    const { service } = makeService();
    await service.start({
      url: YOUTUBE_URL, outputDir: '/tmp',
      subtitleLanguages: ['en-orig'], writeAutoSubs: true
    });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--write-auto-subs');
  });

  it('emits complete (stage=done) on success in subtitle-only mode', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    const final = events[events.length - 1];
    expect(final.statusKey).toBe('complete');
    expect(final.stage).toBe('done');
  });
});

describe('DownloadService — embed mode', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('phase 1 does not suppress subs when subtitleMode is embed', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).not.toContain('--no-write-subs');
    expect(args).not.toContain('--no-write-auto-subs');
  });

  it('only phase 1 runs when subtitleMode is embed (no phase 2)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    expect(vi.mocked(spawnYtDlp).mock.calls).toHaveLength(1);
  });

  it('phase 1 includes --write-auto-subs when embed mode and writeAutoSubs is true', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en-orig'], subtitleMode: 'embed', writeAutoSubs: true });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--write-auto-subs');
  });

  it('phase 1 includes --embed-subs and --write-subs when subtitleMode is embed', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--write-subs');
    expect(args).toContain('--embed-subs');
    expect(args).toContain('--sub-langs');
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en');
  });

  it('phase 1 forces --merge-output-format mkv when embed mode is active', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--merge-output-format');
    expect(args[args.indexOf('--merge-output-format') + 1]).toBe('mkv');
  });

  it('phase 1 does not include --convert-subs in embed mode (mkv handles vtt natively)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).not.toContain('--convert-subs');
  });

  it('phase 1 includes --compat-options no-keep-subs in embed mode (cleans up sidecar .vtt)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'embed' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).toContain('--compat-options');
    expect(args[args.indexOf('--compat-options') + 1]).toBe('no-keep-subs');
  });

  it('phase 1 omits --merge-output-format when embed mode is not active', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'sidecar' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(0);
    expect(args).not.toContain('--merge-output-format');
  });
});

describe('DownloadService — sidecar format', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('phase 2 prefers <fmt>/best for --sub-format and converts via --convert-subs (default srt)', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args[args.indexOf('--sub-format') + 1]).toBe('srt/best');
    expect(args).toContain('--convert-subs');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('srt');
  });

  it('phase 2 honors a vtt subtitleFormat in both --sub-format and --convert-subs', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleFormat: 'vtt' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args[args.indexOf('--sub-format') + 1]).toBe('vtt/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('vtt');
  });

  it('phase 2 honors an ass subtitleFormat in both --sub-format and --convert-subs', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'], subtitleFormat: 'ass' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args[args.indexOf('--sub-format') + 1]).toBe('ass/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass');
  });
});

describe('DownloadService — subfolder mode', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('phase 2 -o path contains Subtitles/ when subtitleMode is subfolder', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/downloads', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'subfolder' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).toContain('/downloads/Subtitles/');
  });

  it('phase 2 includes --convert-subs for subfolder mode', async () => {
    const { service } = makeService();
    await service.start({ url: YOUTUBE_URL, outputDir: '/downloads', formatId: '137+251', subtitleLanguages: ['en'], subtitleMode: 'subfolder', subtitleFormat: 'ass' });
    await new Promise((r) => setTimeout(r, 80));

    const args = callArgs(1);
    expect(args[args.indexOf('--sub-format') + 1]).toBe('ass/best');
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass');
  });
});

describe('DownloadService — status events', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('emits complete (stage=done) when phase 2 succeeds', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const final = events[events.length - 1];
    expect(final.statusKey).toBe('complete');
    expect(final.stage).toBe('done');
  });

  it('emits subtitlesFailed (stage=done) when phase 2 fails — and never emits complete after', async () => {
    let callIndex = 0;
    vi.mocked(spawnYtDlp).mockImplementation(() => {
      const exitCode = callIndex === 0 ? 0 : 1;
      callIndex++;
      return makeFakeProcess(exitCode) as never;
    });

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const final = events[events.length - 1];
    expect(final.statusKey).toBe('subtitlesFailed');
    expect(final.stage).toBe('done');
    expect(statusKeys(events)).not.toContain('complete');
  });

  it('records job as completed (not failed) when phase 2 fails', async () => {
    let callIndex = 0;
    vi.mocked(spawnYtDlp).mockImplementation(() => {
      const exitCode = callIndex === 0 ? 0 : 1;
      callIndex++;
      return makeFakeProcess(exitCode) as never;
    });

    const { service, recentJobsStore } = makeService();

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    expect(recentJobsStore.push).toHaveBeenCalledOnce();
    expect(recentJobsStore.push.mock.calls[0][0].status).toBe('completed');
  });

  it('emits sleepingBetweenRequests with rounded seconds when yt-dlp logs a sleep line', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[download] Sleeping 5.00 seconds ...\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const sleepEvent = events.find((e) => e.statusKey === 'sleepingBetweenRequests');
    expect(sleepEvent).toBeDefined();
    expect(sleepEvent!.params).toEqual({ seconds: 5 });
  });

  it('rounds fractional sleep durations', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[youtube] Sleeping 3.7 seconds ...\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const sleepEvent = events.find((e) => e.statusKey === 'sleepingBetweenRequests');
    expect(sleepEvent!.params).toEqual({ seconds: 4 });
  });

  it('emits mergingFormats when yt-dlp logs a [Merger] line', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[Merger] Merging formats into "/tmp/video.mp4"\n') as never
    );

    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(statusKeys(events)).toContain('mergingFormats');
  });

  it('emits downloadingMedia at phase 1 spawn and fetchingSubtitles at phase 2 spawn', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp', formatId: '137+251', subtitleLanguages: ['en'] });
    await new Promise((r) => setTimeout(r, 100));

    const keys = statusKeys(events);
    const downloadingMediaIdx = keys.indexOf('downloadingMedia');
    const fetchingSubsIdx = keys.indexOf('fetchingSubtitles');

    expect(downloadingMediaIdx).toBeGreaterThanOrEqual(0);
    expect(fetchingSubsIdx).toBeGreaterThan(downloadingMediaIdx);
  });

  it('does not emit fetchingSubtitles when no subs are requested', async () => {
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(statusKeys(events)).not.toContain('fetchingSubtitles');
  });
});

describe('DownloadService — per-file phase tracking via Destination lines', () => {
  beforeEach(() => {
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0) as never);
  });

  it('emits fetchingSubtitles when [download] Destination points at a .vtt file', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[download] Destination: /tmp/video.en.vtt\n') as never
    );
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    expect(statusKeys(events)).toContain('fetchingSubtitles');
  });

  it('emits downloadingMedia when [download] Destination points at a media file', async () => {
    vi.mocked(spawnYtDlp).mockImplementation(
      () => makeFakeProcess(0, '[download] Destination: /tmp/video.f247.webm\n') as never
    );
    const { service } = makeService();
    const events = captureStatuses(service);

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    // First downloadingMedia is emitted at spawn; we need at least one MORE
    // emitted when the media Destination line is parsed (resets the bar).
    const mediaEvents = events.filter((e) => e.statusKey === 'downloadingMedia');
    expect(mediaEvents.length).toBeGreaterThanOrEqual(2);
  });

  it('suppresses percent in progress events while a subtitle file is the active Destination', async () => {
    const stderr =
      '[download] Destination: /tmp/video.en.vtt\n' +
      '[download] 100% of 79.56KiB in 00:00:00 at 451.58KiB/s\n';
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0, stderr) as never);

    const { service } = makeService();
    const progressEvents: { percent?: number }[] = [];
    service.on('progress', (e: { percent?: number }) => progressEvents.push(e));

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const downloadLineEvent = progressEvents.find((e) =>
      typeof (e as { line?: string }).line === 'string' &&
      (e as { line: string }).line.startsWith('[download] 100%')
    );
    expect(downloadLineEvent).toBeDefined();
    expect(downloadLineEvent!.percent).toBeUndefined();
  });

  it('forwards percent in progress events while a media file is the active Destination', async () => {
    const stderr =
      '[download] Destination: /tmp/video.f247.webm\n' +
      '[download]  42.0% of 27.44MiB at 5.21MiB/s ETA 00:02\n';
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0, stderr) as never);

    const { service } = makeService();
    const progressEvents: { percent?: number; line: string }[] = [];
    service.on('progress', (e: { percent?: number; line: string }) => progressEvents.push(e));

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const pctLine = progressEvents.find((e) => e.line.includes('42.0%'));
    expect(pctLine).toBeDefined();
    expect(pctLine!.percent).toBe(42);
  });

  it('switches kind back to media when a media Destination follows a subtitle Destination', async () => {
    const stderr =
      '[download] Destination: /tmp/video.en.vtt\n' +
      '[download] 100% of 79.56KiB in 00:00:00 at 451.58KiB/s\n' +
      '[download] Destination: /tmp/video.f247.webm\n' +
      '[download]  10.0% of 27.44MiB at 5.21MiB/s ETA 00:05\n';
    vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess(0, stderr) as never);

    const { service } = makeService();
    const progressEvents: { percent?: number; line: string }[] = [];
    service.on('progress', (e: { percent?: number; line: string }) => progressEvents.push(e));

    await service.start({ url: YOUTUBE_URL, outputDir: '/tmp' });
    await new Promise((r) => setTimeout(r, 80));

    const subPercent = progressEvents.find((e) => e.line.includes('79.56KiB'));
    const mediaPercent = progressEvents.find((e) => e.line.includes('10.0%'));
    expect(subPercent!.percent).toBeUndefined();
    expect(mediaPercent!.percent).toBe(10);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { ProgressParser } from '@main/services/download/progressParser.js';
import { AsyncStack } from '@main/services/phases/types.js';
import { STATUS_KEY } from '@shared/schemas.js';
import type { ActiveDownload } from '@main/services/phases/types.js';
import type { DownloadJob, StartDownloadInput } from '@shared/types.js';
import type { PreparedJob } from '@shared/preparedJob.js';

vi.mock('@main/utils/clock', () => ({ nowIso: () => '2024-01-01T00:00:00.000Z' }));

const BASE_INPUT_SUBTITLE_ONLY: StartDownloadInput = {
  url: 'https://www.youtube.com/watch?v=test',
  outputDir: '/tmp',
  job: {
    kind: 'subtitle-only',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    subtitles: { languages: ['en-orig'], mode: 'sidecar', format: 'srt', writeAuto: false }
  } satisfies PreparedJob
};

const BASE_INPUT_SINGLE_FORMAT: StartDownloadInput = {
  url: 'https://www.youtube.com/watch?v=test',
  outputDir: '/tmp',
  job: {
    kind: 'single-format',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    formatId: '248+251',
    preset: 'custom',
    sponsorBlock: { mode: 'off' },
    embed: { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false }
  } satisfies PreparedJob
};

function makeJob(): DownloadJob {
  return {
    id: 'job-1',
    url: 'https://www.youtube.com/watch?v=test',
    outputDir: '/tmp',
    status: 'running',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };
}

function makeActive(input: StartDownloadInput): ActiveDownload {
  return {
    job: makeJob(),
    input,
    controller: new AbortController(),
    get signal(): AbortSignal {
      return this.controller.signal;
    },
    cancelRequested: false,
    pauseRequested: false,
    subtitlePaths: [],
    disposables: new AsyncStack()
  };
}

describe('ProgressParser — subtitle-only progress', () => {
  it('records destination kind and emits matching status while switching files', () => {
    const emitStatus = vi.fn();
    const parser = new ProgressParser(emitStatus, vi.fn());
    const active = makeActive(BASE_INPUT_SINGLE_FORMAT);

    parser.consume(active, '[download] Destination: /tmp/video.en.srt');
    expect(active.currentFileKind).toBe('subtitle');
    expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt']);

    parser.consume(active, '[download] Destination: /tmp/video.mp4');
    expect(active.currentFileKind).toBe('media');
    expect(active.mediaPath).toBe('/tmp/video.mp4');
    expect(emitStatus).toHaveBeenNthCalledWith(1, 'job-1', 'download', STATUS_KEY.fetchingSubtitles);
    expect(emitStatus).toHaveBeenNthCalledWith(2, 'job-1', 'download', STATUS_KEY.downloadingMedia);
  });

  it('emits percent for subtitle file when job is subtitle-only', () => {
    const emitProgress = vi.fn();
    const parser = new ProgressParser(vi.fn(), emitProgress);
    const active = makeActive(BASE_INPUT_SUBTITLE_ONLY);

    // Destination line sets currentFileKind = 'subtitle'
    parser.consume(active, '[download] Destination: /tmp/video.en-orig.srt');
    expect(active.currentFileKind).toBe('subtitle');

    emitProgress.mockClear();
    parser.consume(active, '[download] 100% of   34.29KiB in 00:00:00 at 132.99KiB/s');

    expect(emitProgress).toHaveBeenCalledOnce();
    expect(emitProgress.mock.calls[0][0].percent).toBe(100);
  });

  it('suppresses percent for subtitle file when job is NOT subtitle-only (sidecar subs)', () => {
    const emitProgress = vi.fn();
    const parser = new ProgressParser(vi.fn(), emitProgress);
    const active = makeActive(BASE_INPUT_SINGLE_FORMAT);

    parser.consume(active, '[download] Destination: /tmp/video.en.srt');
    expect(active.currentFileKind).toBe('subtitle');

    emitProgress.mockClear();
    parser.consume(active, '[download]  72.3% of  500.00KiB at   1.00MiB/s ETA 00:00');

    expect(emitProgress).toHaveBeenCalledOnce();
    expect(emitProgress.mock.calls[0][0].percent).toBeUndefined();
  });

  it('forwards percent for media files', () => {
    const emitProgress = vi.fn();
    const parser = new ProgressParser(vi.fn(), emitProgress);
    const active = makeActive(BASE_INPUT_SINGLE_FORMAT);

    parser.consume(active, '[download] Destination: /tmp/video.mp4');
    emitProgress.mockClear();
    parser.consume(active, '[download]  72.3% of  500.00KiB at   1.00MiB/s ETA 00:00');

    expect(emitProgress).toHaveBeenCalledOnce();
    expect(emitProgress.mock.calls[0][0].percent).toBe(72.3);
  });

  it('emits rounded sleep status from yt-dlp sleep lines', () => {
    const emitStatus = vi.fn();
    const parser = new ProgressParser(emitStatus, vi.fn());
    const active = makeActive(BASE_INPUT_SINGLE_FORMAT);

    parser.consume(active, '[download] Sleeping 2.6 seconds ...');

    expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.sleepingBetweenRequests, { seconds: 3 });
  });

  it('emits merging status and records the merged media path', () => {
    const emitStatus = vi.fn();
    const parser = new ProgressParser(emitStatus, vi.fn());
    const active = makeActive(BASE_INPUT_SINGLE_FORMAT);

    parser.consume(active, '[Merger] Merging formats into "/tmp/final.mp4"');

    expect(active.mediaPath).toBe('/tmp/final.mp4');
    expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.mergingFormats);
  });
});

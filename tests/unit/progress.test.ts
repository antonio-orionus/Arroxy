import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { parseSpeedBps, parseEtaSeconds, formatEta, ProgressFormatter, nextMonotonicPercent } from '../../src/shared/progressFormat.js';
import { ProgressNormalizer } from '../../src/shared/progressNormalizer.js';

describe('parseSpeedBps', () => {
  it('parses MiB/s', () => {
    expect(parseSpeedBps('10.71MiB/s')).toBeCloseTo(10.71 * 1024 ** 2);
  });

  it('parses KiB/s', () => {
    expect(parseSpeedBps('135.12KiB/s')).toBeCloseTo(135.12 * 1024);
  });

  it('parses GiB/s', () => {
    expect(parseSpeedBps('1.00GiB/s')).toBeCloseTo(1024 ** 3);
  });

  it('parses B/s', () => {
    expect(parseSpeedBps('512B/s')).toBe(512);
  });

  it('returns null for Unknown B/s', () => {
    expect(parseSpeedBps('Unknown B/s')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(parseSpeedBps('--')).toBeNull();
  });
});

describe('parseEtaSeconds', () => {
  it('parses MM:SS', () => {
    expect(parseEtaSeconds('27:19')).toBe(27 * 60 + 19);
  });

  it('parses HH:MM:SS', () => {
    expect(parseEtaSeconds('01:45:33')).toBe(3600 + 45 * 60 + 33);
  });

  it('returns null for Unknown', () => {
    expect(parseEtaSeconds('Unknown')).toBeNull();
  });

  it('returns null for --:--:--', () => {
    expect(parseEtaSeconds('--:--:--')).toBeNull();
  });
});

describe('formatEta', () => {
  it('formats minutes and seconds', () => {
    expect(formatEta(27 * 60 + 19)).toBe('27:19');
  });

  it('formats hours with zero-padded minutes and seconds', () => {
    expect(formatEta(3600 + 5 * 60 + 3)).toBe('1:05:03');
  });

  it('pads single-digit seconds', () => {
    expect(formatEta(61)).toBe('1:01');
  });
});

describe('nextMonotonicPercent', () => {
  it('never goes backward', () => {
    expect(nextMonotonicPercent(50, 30)).toBe(50);
  });

  it('advances forward', () => {
    expect(nextMonotonicPercent(50, 60)).toBe(60);
  });

  it('clamps to 100', () => {
    expect(nextMonotonicPercent(0, 110)).toBe(100);
  });

  it('returns current on undefined', () => {
    expect(nextMonotonicPercent(42, undefined)).toBe(42);
  });
});

describe('ProgressNormalizer', () => {
  it('ignores low-confidence HLS bootstrap completion', () => {
    const normalizer = new ProgressNormalizer();
    const next = normalizer.nextRunningPercent(0, {
      percent: 100,
      line: '[download] 100.0% of ~   1.00KiB at    1.25KiB/s ETA Unknown (frag 0/128)'
    });

    expect(next).toBe(0);
  });

  it('accepts later HLS fragment progress after bootstrap noise', () => {
    const normalizer = new ProgressNormalizer();
    const afterBootstrap = normalizer.nextRunningPercent(0, {
      percent: 100,
      line: '[download] 100.0% of ~   1.00KiB at    1.25KiB/s ETA Unknown (frag 0/128)'
    });
    const next = normalizer.nextRunningPercent(afterBootstrap, {
      percent: 1.6,
      line: '[download]   1.6% of ~ 127.88MiB at    1.94MiB/s ETA Unknown (frag 1/128)'
    });

    expect(next).toBeCloseTo(1.6, 1);
  });

  it('ignores non-finite incoming progress', () => {
    const normalizer = new ProgressNormalizer();

    expect(
      normalizer.nextRunningPercent(42, {
        percent: Infinity,
        line: '[download] Infinity% of 240.00MiB'
      })
    ).toBe(42);
    expect(
      normalizer.nextRunningPercent(42, {
        percent: -Infinity,
        line: '[download] -Infinity% of 240.00MiB'
      })
    ).toBe(42);
  });

  it('caps running progress below 100 until a terminal status completes the job', () => {
    const normalizer = new ProgressNormalizer();

    const next = normalizer.nextRunningPercent(88, {
      percent: 100,
      line: '[download] 100.0% of 240.00MiB in 00:52'
    });

    expect(next).toBe(99.9);
  });
});

describe('ProgressFormatter', () => {
  let formatter: ProgressFormatter;

  beforeEach(() => {
    formatter = new ProgressFormatter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const downloadLine = (speed: string, eta: string) => `[download]   9.2% of   18.88GiB at  ${speed} ETA ${eta}`;

  it('returns null on first Unknown line (nothing to display yet)', () => {
    expect(formatter.update(downloadLine('Unknown B/s', 'Unknown'))).toBeNull();
  });

  it('emits raw speed and reformatted ETA on first valid line', () => {
    const result = formatter.update(downloadLine('10.00MiB/s', '27:19'));
    expect(result).toBe('10.00MiB/s • ETA 27:19');
  });

  it('throttles within 1000ms — second call returns same string', () => {
    const first = formatter.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(500);
    const second = formatter.update(downloadLine('11.00MiB/s', '24:00'));
    expect(second).toBe(first);
  });

  it('emits updated string after 1000ms', () => {
    const first = formatter.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(1001);
    const second = formatter.update(downloadLine('11.00MiB/s', '24:00'));
    expect(second).not.toBe(first);
    expect(second).toBe('11.00MiB/s • ETA 24:00');
  });

  it('suppresses chunk-boundary spike (speed dropping below 20% of last emit)', () => {
    const baseline = formatter.update(downloadLine('14.00MiB/s', '01:15'));
    vi.advanceTimersByTime(1001);
    // Spike: speed plummets ~180× — typical of yt-dlp's fragment-boundary reset.
    const spike = formatter.update(downloadLine('78.49KiB/s', '03:55:05'));
    expect(spike).toBe(baseline);
  });

  it('continues suppressing throughout a multi-line ramp within the window', () => {
    formatter.update(downloadLine('14.00MiB/s', '01:15'));
    vi.advanceTimersByTime(1001);
    const baseline = formatter.update(downloadLine('14.00MiB/s', '01:14'));
    vi.advanceTimersByTime(1001);
    formatter.update(downloadLine('78.49KiB/s', '03:55:05'));
    vi.advanceTimersByTime(20);
    formatter.update(downloadLine('230.16KiB/s', '01:20:09'));
    vi.advanceTimersByTime(20);
    const ramp = formatter.update(downloadLine('1.09MiB/s', '16:27'));
    expect(ramp).toBe(baseline);
  });

  it('accepts a sustained low speed once suppression window expires', () => {
    formatter.update(downloadLine('14.00MiB/s', '01:15'));
    vi.advanceTimersByTime(1001);
    formatter.update(downloadLine('14.00MiB/s', '01:14'));
    // Network genuinely drops to ~1MiB/s and stays there.
    vi.advanceTimersByTime(1001);
    formatter.update(downloadLine('1.00MiB/s', '15:00'));
    vi.advanceTimersByTime(1600); // past 1500ms suppression window
    const accepted = formatter.update(downloadLine('1.00MiB/s', '15:30'));
    expect(accepted).toBe('1.00MiB/s • ETA 15:30');
  });

  it('does not suppress when speed stays within the normal range', () => {
    formatter.update(downloadLine('14.00MiB/s', '01:15'));
    vi.advanceTimersByTime(1001);
    // 50% drop is plausible network jitter, not a fragment-boundary artifact.
    const result = formatter.update(downloadLine('7.00MiB/s', '02:00'));
    expect(result).toBe('7.00MiB/s • ETA 2:00');
  });

  it('skips Unknown updates and preserves last detail', () => {
    const first = formatter.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(1001);
    const result = formatter.update(downloadLine('Unknown B/s', 'Unknown'));
    expect(result).toBe(first);
  });

  it('returns Merging… for merger lines without throttling', () => {
    expect(formatter.update('[Merger] Merging formats into output.mkv')).toBe('Merging…');
  });

  it('returns ffmpeg detail for ffmpeg progress lines without throttling', () => {
    const line = 'frame= 297 fps=296 q=-1.0 size=   1234kB time=00:00:09.90 bitrate=1020.8kbits/s speed=9.83x';
    const result = formatter.update(line);
    expect(result).toMatch(/Merging…/);
    expect(result).toMatch(/9\.83x/);
  });

  it('parses HLS fragmented line with trailing (frag N/M) suffix', () => {
    const line = '[download]   1.8% of ~ 374.36MiB at    2.63MiB/s ETA 02:28 (frag 4/234)';
    expect(formatter.update(line)).toBe('2.63MiB/s • ETA 2:28');
  });

  it('parses DASH fragmented line with trailing (frag N/M) suffix', () => {
    const line = '[download]  47.0% of ~  1.23GiB at  890.12KiB/s ETA 10:05 (frag 88/187)';
    expect(formatter.update(line)).toBe('890.12KiB/s • ETA 10:05');
  });

  it('reset clears state so next update starts fresh', () => {
    formatter.update(downloadLine('10.00MiB/s', '27:19'));
    formatter.reset();
    expect(formatter.update(downloadLine('Unknown B/s', 'Unknown'))).toBeNull();
  });
});

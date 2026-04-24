import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  parseSpeedBps,
  parseEtaSeconds,
  formatSpeed,
  formatEta,
  ProgressSmoother,
  nextMonotonicPercent,
} from '../../src/renderer/src/store/progress';

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

describe('formatSpeed', () => {
  it('formats GiB/s', () => {
    expect(formatSpeed(1024 ** 3)).toBe('1.00GiB/s');
  });

  it('formats MiB/s', () => {
    expect(formatSpeed(10.71 * 1024 ** 2)).toBe('10.71MiB/s');
  });

  it('formats KiB/s', () => {
    expect(formatSpeed(135 * 1024)).toBe('135.00KiB/s');
  });

  it('formats B/s', () => {
    expect(formatSpeed(512)).toBe('512B/s');
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

describe('ProgressSmoother', () => {
  let smoother: ProgressSmoother;

  beforeEach(() => {
    smoother = new ProgressSmoother();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const downloadLine = (speed: string, eta: string) =>
    `[download]   9.2% of   18.88GiB at  ${speed} ETA ${eta}`;

  it('returns null on first Unknown line (no data yet)', () => {
    expect(smoother.update(downloadLine('Unknown B/s', 'Unknown'))).toBeNull();
  });

  it('returns detail string after first valid line', () => {
    const result = smoother.update(downloadLine('10.00MiB/s', '27:19'));
    expect(result).toMatch(/MiB\/s/);
    expect(result).toMatch(/ETA/);
  });

  it('throttles within 1000ms — second call returns same string', () => {
    const first = smoother.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(500);
    const second = smoother.update(downloadLine('20.00MiB/s', '14:00'));
    expect(second).toBe(first);
  });

  it('emits updated string after 1000ms', () => {
    const first = smoother.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(1001);
    const second = smoother.update(downloadLine('20.00MiB/s', '14:00'));
    expect(second).not.toBe(first);
    expect(second).toMatch(/MiB\/s/);
  });

  it('dampens a wild speed spike via EWMA', () => {
    smoother.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(1001);

    // Spike to 100 MiB/s — EWMA should not jump all the way to 100
    const result = smoother.update(downloadLine('100.00MiB/s', '5:00'));
    const speedMatch = result?.match(/([\d.]+)MiB\/s/);
    expect(speedMatch).not.toBeNull();
    const displayedSpeed = parseFloat(speedMatch![1]);
    expect(displayedSpeed).toBeGreaterThan(10);
    expect(displayedSpeed).toBeLessThan(100);
  });

  it('skips Unknown updates and preserves last detail', () => {
    const first = smoother.update(downloadLine('10.00MiB/s', '27:19'));
    vi.advanceTimersByTime(1001);

    // Unknown lines should not overwrite the display
    const result = smoother.update(downloadLine('Unknown B/s', 'Unknown'));
    expect(result).toBe(first);
  });

  it('returns Merging… for merger lines without throttling', () => {
    expect(smoother.update('[Merger] Merging formats into output.mkv')).toBe('Merging…');
  });

  it('returns ffmpeg detail for ffmpeg progress lines without throttling', () => {
    const line = 'frame= 297 fps=296 q=-1.0 size=   1234kB time=00:00:09.90 bitrate=1020.8kbits/s speed=9.83x';
    const result = smoother.update(line);
    expect(result).toMatch(/Merging…/);
    expect(result).toMatch(/9\.83x/);
  });

  it('reset clears state so next update starts fresh', () => {
    smoother.update(downloadLine('10.00MiB/s', '27:19'));
    smoother.reset();
    // After reset, Unknown line should return null again
    expect(smoother.update(downloadLine('Unknown B/s', 'Unknown'))).toBeNull();
  });
});

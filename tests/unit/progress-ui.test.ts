import { describe, expect, it } from 'vitest';
import { nextMonotonicPercent, ProgressFormatter } from '@renderer/store/progress';

describe('progress ui helpers', () => {
  it('keeps percent monotonic', () => {
    expect(nextMonotonicPercent(0, 12.4)).toBe(12.4);
    expect(nextMonotonicPercent(54, 41)).toBe(54);
    expect(nextMonotonicPercent(54, undefined)).toBe(54);
    expect(nextMonotonicPercent(97, 105)).toBe(100);
  });

  it('extracts speed and eta details from download lines', () => {
    const s = new ProgressFormatter();
    expect(s.update('[download] 54.0% of 18.53MiB at 3.49MiB/s ETA 00:02')).toBe(
      '3.49MiB/s • ETA 0:02'
    );

    // Unknown speed/ETA with no prior detail: nothing to display.
    const s2 = new ProgressFormatter();
    expect(s2.update('[download] 72.7% of 18.53MiB at Unknown B/s ETA Unknown')).toBeNull();

    const s3 = new ProgressFormatter();
    expect(s3.update('[Merger] Merging formats into "/tmp/out.webm"')).toBe('Merging…');
    expect(s3.update('[ffmpeg] Merging formats into "/tmp/out.mp4"')).toBe('Merging…');
    expect(s3.update('[ExtractAudio] Destination: /tmp/out.m4a')).toBe('Merging…');
    expect(s3.update('Deleting original file /tmp/out.f140.m4a')).toBeNull();
    expect(s3.update('[download] 100% of 18.53MiB')).toBeNull();
  });

  it('extracts speed and time from ffmpeg frame-level progress lines', () => {
    const s = new ProgressFormatter();
    expect(
      s.update(
        'frame=  297 fps=296 q=-1.0 Lsize=   3085kB time=00:00:09.90 bitrate=2551.7kbits/s speed=9.83x'
      )
    ).toBe('Merging… 9.83x · 00:00:09');
    expect(
      s.update(
        'frame=   52 fps= 52 q=-1.0 Lsize=    768kB time=00:00:02.16 bitrate=2909.5kbits/s speed=2.16x'
      )
    ).toBe('Merging… 2.16x · 00:00:02');
  });
});

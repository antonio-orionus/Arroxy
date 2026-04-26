import { describe, expect, it } from 'vitest';
import { mapFormats } from '@main/services/FormatProbeService';

describe('mapFormats', () => {
  it('returns raw format_id without composing audio selector', () => {
    const mapped = mapFormats({
      formats: [
        { format_id: '18', resolution: '360p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac' },
        { format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac' },
        { format_id: '137', resolution: '1080p', ext: 'mp4', vcodec: 'avc1', acodec: 'none' }
      ]
    });

    expect(mapped).toHaveLength(3);
    expect(mapped[0].formatId).toBe('137');
    expect(mapped[0].isVideoOnly).toBe(true);
    expect(mapped[0].label).not.toContain('bestaudio');
    expect(mapped[1].formatId).toBe('22');
    expect(mapped[1].isVideoOnly).toBe(false);
    expect(mapped[2].formatId).toBe('18');
    expect(mapped[2].isVideoOnly).toBe(false);
  });

  it('includes audio-only formats (vcodec === none) with isAudioOnly flag', () => {
    const mapped = mapFormats({
      formats: [
        { format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac' },
        { format_id: '140', resolution: 'audio only', ext: 'm4a', vcodec: 'none', acodec: 'mp4a' }
      ]
    });

    expect(mapped).toHaveLength(2);
    const audioOnly = mapped.find((f) => f.formatId === '140');
    expect(audioOnly?.isAudioOnly).toBe(true);
    expect(audioOnly?.isVideoOnly).toBe(false);
  });

  it('sorts by resolution descending then filesize descending', () => {
    const mapped = mapFormats({
      formats: [
        { format_id: '18', resolution: '360p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', filesize: 10000 },
        { format_id: '22', resolution: '720p', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', filesize: 50000 },
        { format_id: '137', resolution: '1080p', ext: 'mp4', vcodec: 'avc1', acodec: 'none', filesize: 90000 }
      ]
    });

    expect(mapped[0].resolution).toBe('1080p');
    expect(mapped[1].resolution).toBe('720p');
    expect(mapped[2].resolution).toBe('360p');
  });
});

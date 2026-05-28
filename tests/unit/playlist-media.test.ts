// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findPlayableFileName, sanitizeM3uTitle } from '@shared/playlistMedia.js';
import { buildM3u } from '@main/services/playlistM3u.js';
import type { PlaylistManifest } from '@shared/playlistManifest.js';

describe('sanitizeM3uTitle', () => {
  it('removes CR/LF so titles cannot inject M3U lines', () => {
    expect(sanitizeM3uTitle('evil\r\n#EXTINF:0,hack')).toBe('evil  #EXTINF:0,hack');
  });
});

describe('findPlayableFileName', () => {
  it('requires a known media extension after the bracketed id', () => {
    const files = ['notes [abc123].txt', 'Track [abc123].mp4', 'partial [abc123].mp4.bak'];
    expect(findPlayableFileName(files, 'abc123')).toBe('Track [abc123].mp4');
  });
});

describe('buildM3u', () => {
  const manifest: PlaylistManifest = {
    playlistGroupId: 'g',
    playlistTitle: 'My List',
    outputDir: '/dl',
    items: [{ videoId: 'a', title: 'First', duration: 65 }]
  };

  it('sanitizes titles in EXTINF lines', () => {
    const files = ['x [a].mp4'];
    const body = buildM3u({ ...manifest, items: [{ videoId: 'a', title: 'bad\r\nline', duration: 1 }] }, files);
    expect(body).not.toMatch(/\r|\nline/);
    expect(body).toContain('#EXTINF:1,bad  line');
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mapPlaylistEntries } from '@main/services/ProbeService.js';
import type { InfoDict } from '@shared/schemas.js';

/** Minimal yt-dlp row — only fields read by mapPlaylistEntries. */
function playlistEntryFixture(row: { id?: string; title: string; url: string; playlist_index: number }) {
  return row;
}

describe('mapPlaylistEntries — videoId', () => {
  it('exposes the raw yt-dlp id as videoId', () => {
    const entry = playlistEntryFixture({ id: 'dQw4w9WgXcQ', title: 'Rick', url: 'https://youtu.be/dQw4w9WgXcQ', playlist_index: 1 }) as InfoDict;
    const out = mapPlaylistEntries([entry], 'https://youtube.com/playlist?list=x', 'youtube');
    expect(out[0].videoId).toBe('dQw4w9WgXcQ');
  });

  it('sets videoId null when the entry has no id', () => {
    const entry = playlistEntryFixture({ title: 'No id', url: 'https://example.com/v/1', playlist_index: 1 }) as InfoDict;
    const out = mapPlaylistEntries([entry], 'https://example.com/list', 'generic');
    expect(out[0].videoId).toBeNull();
  });
});

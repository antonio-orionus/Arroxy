// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { playlistOutputTemplate } from '@renderer/store/queueSlice.js';

describe('playlistOutputTemplate', () => {
  it('is position-independent and id-suffixed with byte truncation', () => {
    expect(playlistOutputTemplate()).toBe('%(title).200B [%(id)s].%(ext)s');
  });
  it('contains no playlist index prefix', () => {
    expect(playlistOutputTemplate()).not.toMatch(/%\(playlist_index\)|^\d/);
  });
});

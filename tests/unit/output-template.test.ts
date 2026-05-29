// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { playlistOutputTemplate, singleOutputTemplate } from '@renderer/store/queueSlice.js';

describe('singleOutputTemplate', () => {
  it('adds the stable id suffix by default', () => {
    expect(singleOutputTemplate(true)).toBe('%(title).200B [%(id)s].%(ext)s');
  });

  it('can keep the legacy title-only shape', () => {
    expect(singleOutputTemplate(false)).toBe('%(title).200B.%(ext)s');
  });
});

describe('playlistOutputTemplate', () => {
  it('is position-independent and id-suffixed with byte truncation', () => {
    expect(playlistOutputTemplate()).toBe('%(title).200B [%(id)s].%(ext)s');
  });
  it('contains no playlist index prefix', () => {
    expect(playlistOutputTemplate()).not.toMatch(/%\(playlist_index\)|^\d/);
  });
});

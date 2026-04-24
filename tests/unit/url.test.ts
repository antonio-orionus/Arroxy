import { describe, expect, it } from 'vitest';
import { parseVideoId } from '@shared/url';

describe('parseVideoId', () => {
  it('extracts ID from youtube.com URL', () => {
    expect(parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be URL', () => {
    expect(parseVideoId('https://youtu.be/dQw4w9WgXcQ?t=1')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for invalid URLs', () => {
    expect(parseVideoId('notaurl')).toBeNull();
  });
});

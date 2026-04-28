import { describe, expect, it } from 'vitest';
import { formatHomeRelativePath } from '@renderer/lib/utils';

const commonPaths = {
  downloads: '/Users/bob/Downloads',
  videos: '/Users/bob/Movies',
  desktop: '/Users/bob/Desktop',
  music: '/Users/bob/Music',
  documents: '/Users/bob/Documents',
  pictures: '/Users/bob/Pictures',
  home: '/Users/bob',
};

describe('formatHomeRelativePath', () => {
  it('shortens paths that are under home', () => {
    expect(formatHomeRelativePath('/Users/bob/Documents', commonPaths)).toBe('~/Documents');
    expect(formatHomeRelativePath('/Users/bob/Downloads', commonPaths)).toBe('~/Downloads');
  });

  it('does not shorten a path that only shares a string prefix with home', () => {
    // /Users/bobby shares the string prefix /Users/bob but is a sibling dir, not a child
    expect(formatHomeRelativePath('/Users/bobby/Videos', commonPaths)).toBe('/Users/bobby/Videos');
  });

  it('returns an absolute path unchanged when it is outside home', () => {
    expect(formatHomeRelativePath('/Volumes/External/video.mp4', commonPaths)).toBe('/Volumes/External/video.mp4');
  });

  it('returns ~ when the path is exactly the home directory', () => {
    expect(formatHomeRelativePath('/Users/bob', commonPaths)).toBe('~');
  });
});

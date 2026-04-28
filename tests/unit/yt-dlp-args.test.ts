import { describe, expect, it } from 'vitest';
import { buildSubtitleArgs, buildVideoArgs } from '@main/services/ytDlpArgs';

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('buildVideoArgs', () => {
  it('suppresses subtitle flags when embedSubs is false', () => {
    const args = buildVideoArgs({ url: URL, outputDir: '/tmp', formatId: '22', embedSubs: false });
    expect(args).toContain('--no-write-subs');
    expect(args).toContain('--no-write-auto-subs');
    expect(args).not.toContain('--write-subs');
    expect(args).not.toContain('--embed-subs');
  });

  it('passes --merge-output-format mkv when embedSubs is true', () => {
    const args = buildVideoArgs({
      url: URL, outputDir: '/tmp', formatId: '22',
      embedSubs: true, subtitleLanguages: ['en']
    });
    expect(args).toContain('--merge-output-format');
    expect(args[args.indexOf('--merge-output-format') + 1]).toBe('mkv');
    expect(args).toContain('--embed-subs');
    expect(args).toContain('--write-subs');
  });

  it('embedSubs falls back to suppression when no languages are provided', () => {
    const args = buildVideoArgs({ url: URL, outputDir: '/tmp', formatId: '22', embedSubs: true });
    expect(args).toContain('--no-write-subs');
    expect(args).not.toContain('--embed-subs');
  });

  it('omits -f when formatId is undefined (subtitle-only callers)', () => {
    const args = buildVideoArgs({ url: URL, outputDir: '/tmp', embedSubs: false });
    expect(args).not.toContain('-f');
  });

  it('places url last with -o template', () => {
    const args = buildVideoArgs({ url: URL, outputDir: '/tmp', formatId: '22', embedSubs: false });
    expect(args[args.length - 1]).toBe(URL);
    expect(args).toContain('-o');
  });

  it('embedSubs with writeAutoSubs adds --write-auto-subs', () => {
    const args = buildVideoArgs({
      url: URL, outputDir: '/tmp', formatId: '22',
      embedSubs: true, subtitleLanguages: ['en'], writeAutoSubs: true
    });
    expect(args).toContain('--write-auto-subs');
  });
});

describe('buildSubtitleArgs', () => {
  it('always includes --skip-download', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/tmp', subtitleLanguages: ['en'], subtitleFormat: 'srt'
    });
    expect(args).toContain('--skip-download');
  });

  it('forces SRT when ASS is paired with auto-captions', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/tmp', subtitleLanguages: ['en-orig'],
      subtitleFormat: 'ass', writeAutoSubs: true
    });
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('srt');
    expect(args[args.indexOf('--sub-format') + 1]).toBe('srt/best');
  });

  it('keeps user-picked ASS when only manual subs are selected', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/tmp', subtitleLanguages: ['en'],
      subtitleFormat: 'ass', writeAutoSubs: false
    });
    expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass');
  });

  it('writes to subtitles/ subfolder when subtitleMode is subfolder', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/downloads', subtitleLanguages: ['en'],
      subtitleMode: 'subfolder', subtitleFormat: 'vtt'
    });
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).toContain('/downloads/subtitles/');
  });

  it('keeps output flat when subtitleMode is sidecar', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/downloads', subtitleLanguages: ['en'],
      subtitleMode: 'sidecar', subtitleFormat: 'vtt'
    });
    const oIdx = args.indexOf('-o');
    expect(args[oIdx + 1]).not.toContain('/subtitles/');
  });

  it('joins multi-lang with comma', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/tmp', subtitleLanguages: ['en', 'es', 'fr'],
      subtitleFormat: 'srt'
    });
    expect(args[args.indexOf('--sub-langs') + 1]).toBe('en,es,fr');
  });

  it('includes --sleep-subtitles 3 for rate-limit protection', () => {
    const args = buildSubtitleArgs({
      url: URL, outputDir: '/tmp', subtitleLanguages: ['en'], subtitleFormat: 'srt'
    });
    expect(args[args.indexOf('--sleep-subtitles') + 1]).toBe('3');
  });
});

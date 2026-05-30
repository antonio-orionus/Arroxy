import { describe, expect, it } from 'vitest';
import { playlistPresetSpec } from '@shared/playlistPresets.js';
import type { PlaylistSelection } from '@shared/schemas.js';

describe('playlistPresetSpec', () => {
  describe('video · best codec', () => {
    it('tier=best → uncapped bestvideo* selector, no sort, no merge', () => {
      const spec = playlistPresetSpec({ kind: 'video', tier: 'best', codec: 'best' });
      expect(spec.formatSelector).toBe('bestvideo*+bestaudio/best');
      expect(spec.formatSort).toBeUndefined();
      expect(spec.mergeOutputFormat).toBeUndefined();
      expect(spec.audioConvert).toBeUndefined();
      expect(spec.producesVideo).toBe(true);
    });

    it.each([
      ['2160', 2160],
      ['1440', 1440],
      ['1080', 1080],
      ['720', 720],
      ['480', 480],
      ['360', 360]
    ] as const)('tier=%s caps height correctly, no sort/merge', (tier, h) => {
      const spec = playlistPresetSpec({ kind: 'video', tier, codec: 'best' });
      expect(spec.formatSelector).toContain(`height<=${h}`);
      expect(spec.formatSort).toBeUndefined();
      expect(spec.mergeOutputFormat).toBeUndefined();
      expect(spec.producesVideo).toBe(true);
    });
  });

  describe('video · mp4 codec', () => {
    it.each(['1080', '720', '480', '360'] as const)('tier=%s → no-fail selector + H.264 sort + mp4 merge', (tier) => {
      const spec = playlistPresetSpec({ kind: 'video', tier, codec: 'mp4' });
      expect(spec.formatSelector).toContain(`height<=${tier}`);
      // Must have the no-fail fallback tail so mixed-codec playlists never error
      expect(spec.formatSelector).toContain('bv*+ba/b');
      expect(spec.formatSort).toContain('vcodec:h264');
      expect(spec.mergeOutputFormat).toBe('mp4');
      expect(spec.audioConvert).toBeUndefined();
      expect(spec.producesVideo).toBe(true);
    });
  });

  describe('audio', () => {
    it('format=best → bestaudio selector, no convert', () => {
      const spec = playlistPresetSpec({ kind: 'audio', format: 'best' });
      expect(spec.formatSelector).toBe('bestaudio/best');
      expect(spec.audioConvert).toBeUndefined();
      expect(spec.formatSort).toBeUndefined();
      expect(spec.producesVideo).toBe(false);
    });

    it.each(['mp3', 'm4a', 'opus'] as const)('format=%s with explicit bitrate → audioConvert', (format) => {
      const spec = playlistPresetSpec({ kind: 'audio', format, bitrateKbps: 256 });
      expect(spec.audioConvert).toEqual({ target: format, bitrateKbps: 256 });
      expect(spec.formatSelector).toBeUndefined();
      expect(spec.producesVideo).toBe(false);
    });

    it('format=mp3 without bitrateKbps → defaults to 192', () => {
      const s: PlaylistSelection = { kind: 'audio', format: 'mp3' };
      const spec = playlistPresetSpec(s);
      expect(spec.audioConvert).toEqual({ target: 'mp3', bitrateKbps: 192 });
    });
  });
});

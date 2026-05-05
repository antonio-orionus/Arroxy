import { describe, it, expect } from 'vitest';
import { resolveEmbedPolicy } from '@shared/embedPolicy';

describe('resolveEmbedPolicy', () => {
  describe('no audioConvert (native audio / video)', () => {
    it('respects literal user toggles', () => {
      expect(resolveEmbedPolicy({ embedMetadata: true, embedThumbnail: true })).toEqual({ embedMetadata: true, embedThumbnail: true });
      expect(resolveEmbedPolicy({ embedMetadata: false, embedThumbnail: false })).toEqual({ embedMetadata: false, embedThumbnail: false });
      expect(resolveEmbedPolicy({})).toEqual({ embedMetadata: false, embedThumbnail: false });
    });
  });

  describe('lossy convert (mp3/m4a/opus)', () => {
    it('defaults metadata + thumbnail ON when undefined', () => {
      expect(resolveEmbedPolicy({ audioConvert: { target: 'mp3', bitrateKbps: 192 } })).toEqual({
        embedMetadata: true,
        embedThumbnail: true
      });
    });
    it('honors explicit opt-out', () => {
      expect(resolveEmbedPolicy({ embedMetadata: false, embedThumbnail: false, audioConvert: { target: 'opus', bitrateKbps: 128 } })).toEqual({ embedMetadata: false, embedThumbnail: false });
    });
    it('keeps thumbnail on for m4a when user is explicit-on', () => {
      expect(resolveEmbedPolicy({ embedMetadata: true, embedThumbnail: true, audioConvert: { target: 'm4a', bitrateKbps: 256 } })).toEqual({ embedMetadata: true, embedThumbnail: true });
    });
  });

  describe('wav convert', () => {
    it('defaults metadata ON, thumbnail OFF', () => {
      expect(resolveEmbedPolicy({ audioConvert: { target: 'wav' } })).toEqual({
        embedMetadata: true,
        embedThumbnail: false
      });
    });
    it('keeps thumbnail OFF even when user said true', () => {
      expect(resolveEmbedPolicy({ embedThumbnail: true, audioConvert: { target: 'wav' } })).toEqual({
        embedMetadata: true,
        embedThumbnail: false
      });
    });
    it('honors explicit metadata opt-out', () => {
      expect(resolveEmbedPolicy({ embedMetadata: false, audioConvert: { target: 'wav' } })).toEqual({
        embedMetadata: false,
        embedThumbnail: false
      });
    });
  });
});

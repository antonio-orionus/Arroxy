import { describe, expect, it } from 'vitest';
import { downloadProfileSchema } from '@shared/schemas.js';
import { BUILTIN_DOWNLOAD_PROFILES, DEFAULT_DOWNLOAD_PROFILE_REF, DEFAULT_DOWNLOAD_PROFILES_PREFS, allDownloadProfiles, downloadProfileLabel, removeCustomDownloadProfile, resolveActiveDownloadProfile, resolveDownloadProfile, upsertCustomDownloadProfile } from '@shared/downloadProfiles.js';
import type { DownloadProfile } from '@shared/types.js';

function customProfile(overrides: Partial<DownloadProfile> = {}): DownloadProfile {
  return {
    ...BUILTIN_DOWNLOAD_PROFILES[1],
    id: 'study-captions',
    name: 'Study Captions',
    icon: 'captions',
    media: { kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'] },
    subtitles: {
      enabled: true,
      languages: ['en', 'uk'],
      source: 'manual-first',
      mode: 'sidecar',
      format: 'srt'
    },
    sponsorBlock: { mode: 'remove', categories: ['sponsor'] },
    embed: { chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true },
    output: { kind: 'fixed', dir: '/home/user/Videos/Classes' },
    subfolder: { enabled: true, name: 'Course' },
    createdAt: '2026-06-07T00:00:00.000Z',
    updatedAt: '2026-06-07T00:00:00.000Z',
    ...overrides
  };
}

describe('download profiles', () => {
  it('built-ins are immutable profile-shaped defaults', () => {
    expect(BUILTIN_DOWNLOAD_PROFILES.map((profile) => profile.id)).toEqual(['best-quality', 'balanced', 'small-file', 'audio-only']);
    for (const profile of BUILTIN_DOWNLOAD_PROFILES) {
      expect(downloadProfileSchema.safeParse(profile).success).toBe(true);
    }
  });

  it('resolves the active profile and falls back to the default built-in when missing', () => {
    const prefs = { ...DEFAULT_DOWNLOAD_PROFILES_PREFS, active: { kind: 'custom' as const, id: 'missing' } };
    expect(resolveActiveDownloadProfile(prefs).ref).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF);
    expect(resolveActiveDownloadProfile(prefs).profile.id).toBe(DEFAULT_DOWNLOAD_PROFILE_REF.id);
  });

  it('upserts and removes custom profiles while preserving active fallback', () => {
    const profile = customProfile();
    const withCustom = upsertCustomDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, profile);
    expect(allDownloadProfiles(withCustom).some((item) => item.id === profile.id)).toBe(true);

    const activeCustom = { ...withCustom, active: { kind: 'custom' as const, id: profile.id } };
    const removed = removeCustomDownloadProfile(activeCustom, profile.id);
    expect(removed.custom).toHaveLength(0);
    expect(removed.active).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF);
  });

  it('resolves media, subtitles, output artifacts, and SponsorBlock into queue-ready options', () => {
    const profile = customProfile();
    const resolved = resolveDownloadProfile(profile, { kind: 'custom', id: profile.id });

    expect(resolved.intent).toEqual({ kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'] });
    expect(resolved.spec?.formatSelector).toContain('height<=1080');
    expect(resolved.spec?.formatSort).toContain('vcodec:h264');
    expect(resolved.subtitles).toEqual({ languages: ['en', 'uk'], mode: 'sidecar', format: 'srt', writeAuto: true });
    expect(resolved.sponsorBlock).toEqual({ mode: 'remove', categories: ['sponsor'] });
    expect(resolved.embed).toEqual({ chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true });
    expect(downloadProfileLabel(profile)).toBe('Video + audio · MP4 · 1080/720');
  });

  it('treats subtitles-only profiles as non-media jobs with sanitized embed and SponsorBlock options', () => {
    const profile = customProfile({
      media: { kind: 'subtitles-only' },
      subtitles: { enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'vtt' },
      sponsorBlock: { mode: 'mark', categories: ['sponsor'] }
    });
    const resolved = resolveDownloadProfile(profile, { kind: 'custom', id: profile.id });

    expect(resolved.intent).toBeNull();
    expect(resolved.spec).toBeNull();
    expect(resolved.isSubtitleOnly).toBe(true);
    expect(resolved.subtitles).toEqual({ languages: ['en'], mode: 'sidecar', format: 'vtt', writeAuto: false });
    expect(resolved.sponsorBlock).toEqual({ mode: 'off' });
    expect(resolved.embed).toEqual({ chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false });
  });

  it('forces audio-only profile subtitles to sidecar instead of embed', () => {
    const profile = customProfile({
      media: { kind: 'audio-only', audio: { format: 'mp3', bitrateKbps: 192 } },
      subtitles: { enabled: true, languages: ['en'], source: 'auto-only', mode: 'embed', format: 'srt' }
    });
    const resolved = resolveDownloadProfile(profile, { kind: 'custom', id: profile.id });

    expect(resolved.spec?.producesVideo).toBe(false);
    expect(resolved.subtitles).toEqual({ languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: true });
  });
});

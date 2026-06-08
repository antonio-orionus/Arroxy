import { describe, expect, it } from 'vitest';
import { downloadProfileSchema } from '@shared/schemas.js';
import { BUILTIN_DOWNLOAD_PROFILES, DEFAULT_DOWNLOAD_PROFILE_REF, DEFAULT_DOWNLOAD_PROFILES_PREFS, allDownloadProfiles, downloadProfileLabel, downloadProfileOrigin, downloadProfileRefFor, removeDownloadProfileFromPrefs, resolveActiveDownloadProfile, resolveDownloadProfile, saveDownloadProfileToPrefs } from '@shared/downloadProfiles.js';
import type { DownloadProfile } from '@shared/types.js';

function customProfile(overrides: Partial<DownloadProfile> = {}): DownloadProfile {
  return {
    ...BUILTIN_DOWNLOAD_PROFILES.find((profile) => profile.id === 'balanced')!,
    id: 'study-captions',
    name: 'Study Captions',
    icon: 'captions',
    media: { kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'], audio: { format: 'm4a' } },
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
    expect(BUILTIN_DOWNLOAD_PROFILES.map((profile) => profile.id)).toEqual(['best-quality', 'best-2160', 'best-1440', 'hd-1080', 'balanced', 'small-file', 'mp4-2160', 'mp4-1440', 'mp4-1080', 'audio-only']);
    for (const profile of BUILTIN_DOWNLOAD_PROFILES) {
      expect(downloadProfileSchema.safeParse(profile).success).toBe(true);
      expect(profile.output).toEqual({ kind: 'default' });
      expect(profile.subfolder).toEqual({ enabled: true, name: profile.name });
      expect(profile.subtitles).toEqual({
        enabled: false,
        languages: [],
        source: 'manual-first',
        mode: 'sidecar',
        format: 'srt'
      });
      expect(profile.embed).toEqual({
        chapters: true,
        metadata: true,
        thumbnail: false,
        description: false,
        thumbnailSidecar: false
      });

      if (profile.media.kind === 'audio-only') {
        expect(profile.media.audio.format).toBe('best');
        expect(profile.media.audio.bitrateKbps).toBeUndefined();
      } else if (profile.media.kind === 'video-audio' || profile.media.kind === 'video-only') {
        if (profile.media.kind === 'video-audio') expect(profile.media.audio.format).toBe(profile.media.codec === 'mp4' ? 'm4a' : 'best');
        if (!profile.id.startsWith('mp4-')) expect(profile.media.codec).toBe('best');
      }

      const resolved = resolveDownloadProfile(profile, { kind: 'builtin', id: profile.id });
      expect(resolved.subtitles).toBeUndefined();
      expect(resolved.embed).toEqual({
        chapters: true,
        metadata: true,
        thumbnail: false,
        description: false,
        thumbnailSidecar: false
      });
    }
  });

  it('maps MP4 built-ins to H.264 video with M4A audio preference at 2160p, 1440p, and 1080p', () => {
    const expected = [
      ['mp4-2160', '2160'],
      ['mp4-1440', '1440'],
      ['mp4-1080', '1080']
    ] as const;

    for (const [id, tier] of expected) {
      const profile = BUILTIN_DOWNLOAD_PROFILES.find((item) => item.id === id);
      expect(profile?.media).toEqual({ kind: 'video-audio', codec: 'mp4', tiers: [tier], audio: { format: 'm4a' } });
      const resolved = resolveDownloadProfile(profile!, { kind: 'builtin', id });
      expect(resolved.spec?.formatSelector).toContain(`height<=${tier}`);
      expect(resolved.spec?.formatSort).toBe('vcodec:h264,acodec:m4a,ext:mp4');
      expect(resolved.spec?.mergeOutputFormat).toBe('mp4');
    }
  });

  it('derives a builtin ref when resolving a builtin profile without an explicit ref', () => {
    const profile = BUILTIN_DOWNLOAD_PROFILES.find((item) => item.id === 'balanced');
    expect(profile).toBeDefined();

    const resolved = resolveDownloadProfile(profile!);

    expect(resolved.ref).toEqual({ kind: 'builtin', id: 'balanced' });
  });

  it('resolves the active profile and falls back to the default built-in when missing', () => {
    const prefs = { ...DEFAULT_DOWNLOAD_PROFILES_PREFS, active: { kind: 'custom' as const, id: 'missing' } };
    expect(resolveActiveDownloadProfile(prefs).ref).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF);
    expect(resolveActiveDownloadProfile(prefs).profile.id).toBe(DEFAULT_DOWNLOAD_PROFILE_REF.id);
  });

  it('upserts and removes custom profiles while preserving active fallback', () => {
    const profile = customProfile();
    const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, profile);
    expect(allDownloadProfiles(withCustom).some((item) => item.id === profile.id)).toBe(true);

    const activeCustom = { ...withCustom, active: { kind: 'custom' as const, id: profile.id } };
    const removed = removeDownloadProfileFromPrefs(activeCustom, profile.id);
    expect(removed.custom).toHaveLength(0);
    expect(removed.active).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF);
  });

  it('overrides built-in profiles without turning callers into builtin/custom policy owners', () => {
    const override = customProfile({
      id: 'balanced',
      name: 'Balanced for lectures',
      icon: 'classes',
      media: { kind: 'video-audio', codec: 'mp4', tiers: ['1080'], audio: { format: 'm4a' } }
    });

    const overridden = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, override);

    expect(overridden.active).toEqual({ kind: 'builtin', id: 'balanced' });
    expect(overridden.custom).toHaveLength(0);
    expect(overridden.overrides).toEqual([override]);
    expect(resolveActiveDownloadProfile(overridden).profile.name).toBe('Balanced for lectures');
    expect(allDownloadProfiles(overridden).find((profile) => profile.id === 'balanced')?.media).toEqual({ kind: 'video-audio', codec: 'mp4', tiers: ['1080'], audio: { format: 'm4a' } });
    expect(downloadProfileOrigin(override, overridden)).toEqual({ kind: 'builtin', overridden: true });
    expect(downloadProfileRefFor(override, overridden)).toEqual({ kind: 'builtin', id: 'balanced' });

    const reset = removeDownloadProfileFromPrefs(overridden, 'balanced');
    expect(reset.overrides).toHaveLength(0);
    expect(reset.active).toEqual({ kind: 'builtin', id: 'balanced' });
    expect(resolveActiveDownloadProfile(reset).profile.name).toBe('Balanced');
  });

  it('resolves media, subtitles, output artifacts, and SponsorBlock into queue-ready options', () => {
    const profile = customProfile();
    const resolved = resolveDownloadProfile(profile, { kind: 'custom', id: profile.id });

    expect(resolved.intent).toEqual({ kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'], audio: { format: 'm4a' } });
    expect(resolved.spec?.formatSelector).toContain('height<=1080');
    expect(resolved.spec?.formatSort).toContain('vcodec:h264');
    expect(resolved.subtitles).toEqual({ languages: ['en', 'uk'], mode: 'sidecar', format: 'srt', writeAuto: true });
    expect(resolved.sponsorBlock).toEqual({ mode: 'remove', categories: ['sponsor'] });
    expect(resolved.embed).toEqual({ chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true });
    expect(downloadProfileLabel(profile)).toBe('Video + audio · MP4 / Smart TV · up to 1080p · AAC audio');
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

  it('resolves WAV audio-only profiles as lossless conversion with no bitrate', () => {
    const profile = customProfile({
      media: { kind: 'audio-only', audio: { format: 'wav' } }
    });
    const resolved = resolveDownloadProfile(profile, { kind: 'custom', id: profile.id });

    expect(resolved.spec?.audioConvert).toEqual({ target: 'wav' });
    expect(downloadProfileLabel(profile)).toBe('Audio only · WAV');
  });
});

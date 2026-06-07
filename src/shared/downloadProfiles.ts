import { DEFAULTS } from './constants.js';
import { DEFAULT_AUDIO_BITRATE } from './schemas.js';
import type { DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs, MediaIntent } from './schemas.js';
import { mediaIntentFromProfileMedia, mediaIntentSpec, type MediaIntentSpec } from './mediaIntent.js';
import type { EmbedOptions, SponsorBlockOptions, SubtitleOptions } from './preparedJob.js';

const BUILTIN_TIMESTAMP = '2026-06-07T00:00:00.000Z';

function baseProfile(id: string, name: string, media: DownloadProfile['media'], icon: DownloadProfile['icon']): DownloadProfile {
  return {
    id,
    name,
    icon,
    media,
    subtitles: {
      enabled: false,
      languages: [],
      source: 'manual-first',
      mode: DEFAULTS.subtitleMode,
      format: DEFAULTS.subtitleFormat
    },
    output: { kind: 'default' },
    subfolder: { enabled: false, name: '' },
    sponsorBlock: {
      mode: DEFAULTS.sponsorBlockMode,
      categories: [...DEFAULTS.sponsorBlockCategories]
    },
    embed: {
      chapters: DEFAULTS.embedChapters,
      metadata: DEFAULTS.embedMetadata,
      thumbnail: DEFAULTS.embedThumbnail,
      description: DEFAULTS.writeDescription,
      thumbnailSidecar: DEFAULTS.writeThumbnail
    },
    playlistProbeCap: 'confirm',
    createdAt: BUILTIN_TIMESTAMP,
    updatedAt: BUILTIN_TIMESTAMP
  };
}

export const BUILTIN_DOWNLOAD_PROFILES: readonly DownloadProfile[] = [baseProfile('best-quality', 'Best quality', { kind: 'video-audio', codec: 'best', tiers: ['best'] }, 'video'), baseProfile('balanced', 'Balanced', { kind: 'video-audio', codec: 'best', tiers: ['720'] }, 'download'), baseProfile('small-file', 'Small file', { kind: 'video-audio', codec: 'best', tiers: ['480', '360'] }, 'clip'), baseProfile('audio-only', 'Audio only', { kind: 'audio-only', audio: { format: 'best', bitrateKbps: DEFAULT_AUDIO_BITRATE } }, 'audio')] as const;

export const DEFAULT_DOWNLOAD_PROFILE_REF: DownloadProfileRef = { kind: 'builtin', id: 'balanced' };

export const DEFAULT_DOWNLOAD_PROFILES_PREFS: DownloadProfilesPrefs = {
  active: DEFAULT_DOWNLOAD_PROFILE_REF,
  custom: []
};

export interface ResolvedDownloadProfile {
  profile: DownloadProfile;
  ref: DownloadProfileRef;
  intent: MediaIntent | null;
  spec: MediaIntentSpec | null;
  subtitles?: SubtitleOptions;
  sponsorBlock: SponsorBlockOptions;
  embed: EmbedOptions;
  isSubtitleOnly: boolean;
}

export function allDownloadProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
  return [...BUILTIN_DOWNLOAD_PROFILES, ...(prefs?.custom ?? [])];
}

function findDownloadProfile(ref: DownloadProfileRef, prefs: DownloadProfilesPrefs | undefined): DownloadProfile | null {
  const profiles = ref.kind === 'builtin' ? BUILTIN_DOWNLOAD_PROFILES : (prefs?.custom ?? []);
  return profiles.find((profile) => profile.id === ref.id) ?? null;
}

export function resolveActiveDownloadProfile(prefs: DownloadProfilesPrefs | undefined): { profile: DownloadProfile; ref: DownloadProfileRef } {
  const active = prefs?.active ?? DEFAULT_DOWNLOAD_PROFILE_REF;
  const found = findDownloadProfile(active, prefs);
  if (found) return { profile: found, ref: active };
  const fallback = findDownloadProfile(DEFAULT_DOWNLOAD_PROFILE_REF, prefs) ?? BUILTIN_DOWNLOAD_PROFILES[0];
  if (!fallback) throw new Error('No built-in download profiles available');
  return { profile: fallback, ref: DEFAULT_DOWNLOAD_PROFILE_REF };
}

export function upsertCustomDownloadProfile(prefs: DownloadProfilesPrefs, profile: DownloadProfile): DownloadProfilesPrefs {
  const without = prefs.custom.filter((item) => item.id !== profile.id);
  return { ...prefs, custom: [...without, profile] };
}

export function removeCustomDownloadProfile(prefs: DownloadProfilesPrefs, id: string): DownloadProfilesPrefs {
  const custom = prefs.custom.filter((profile) => profile.id !== id);
  const activeRemoved = prefs.active.kind === 'custom' && prefs.active.id === id;
  return {
    active: activeRemoved ? DEFAULT_DOWNLOAD_PROFILE_REF : prefs.active,
    custom
  };
}

export function resolveDownloadProfile(profile: DownloadProfile, ref: DownloadProfileRef = { kind: 'custom', id: profile.id }): ResolvedDownloadProfile {
  const intent = mediaIntentFromProfileMedia(profile.media);
  const spec = intent ? mediaIntentSpec(intent) : null;
  const isSubtitleOnly = profile.media.kind === 'subtitles-only';
  const subtitleLanguages = profile.subtitles.enabled || isSubtitleOnly ? profile.subtitles.languages : [];
  const subtitleMode = profile.subtitles.mode === 'embed' && spec?.producesVideo !== true ? 'sidecar' : profile.subtitles.mode;
  const subtitles: SubtitleOptions | undefined =
    subtitleLanguages.length > 0
      ? {
          languages: subtitleLanguages,
          mode: subtitleMode,
          format: profile.subtitles.format,
          writeAuto: profile.subtitles.source !== 'manual-only'
        }
      : undefined;
  const sponsorBlock: SponsorBlockOptions = !spec?.producesVideo || profile.sponsorBlock.mode === 'off' || profile.sponsorBlock.categories.length === 0 ? { mode: 'off' } : { mode: profile.sponsorBlock.mode, categories: [...profile.sponsorBlock.categories] };
  const embed: EmbedOptions = isSubtitleOnly
    ? { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false }
    : {
        chapters: profile.embed.chapters,
        metadata: profile.embed.metadata,
        thumbnail: profile.embed.thumbnail,
        description: profile.embed.description,
        thumbnailSidecar: profile.embed.thumbnailSidecar
      };

  return {
    profile,
    ref,
    intent,
    spec,
    subtitles,
    sponsorBlock,
    embed,
    isSubtitleOnly
  };
}

export function downloadProfileLabel(profile: DownloadProfile): string {
  switch (profile.media.kind) {
    case 'video-audio':
      return `Video + audio · ${profile.media.codec === 'mp4' ? 'MP4' : 'best codec'} · ${profile.media.tiers.join('/')}`;
    case 'video-only':
      return `Video, no audio · ${profile.media.codec === 'mp4' ? 'MP4' : 'best codec'} · ${profile.media.tiers.join('/')}`;
    case 'audio-only':
      return profile.media.audio.format === 'best' ? 'Audio only · best' : `Audio only · ${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}K`;
    case 'subtitles-only':
      return 'Subtitles only';
  }
}

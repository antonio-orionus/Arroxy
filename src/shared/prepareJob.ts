import { playlistPresetSpec } from './playlistPresets.js';
import type { EmbedOptions, ExtractorIdentity, PreparedJob, SponsorBlockOptions, SubtitleOptions } from './preparedJob.js';
import type { AudioConvert, PlaylistPreset, Preset, SponsorBlockCategory, SponsorBlockMode } from './schemas.js';

// Pure builder. Lives in `src/shared/` (not renderer) so future QueueStore
// migrations in main can synthesize jobs without a renderer dependency.
//
// The renderer's queueSlice constructs `PrepareJobInput` from wizard state
// (single mode) or playlist entry context (playlist mode) and hands the DTO
// here. Keeping the builder DTO-shaped lets unit tests cover every kind in
// isolation without spinning up the zustand store.
export interface PrepareJobInput extends ExtractorIdentity {
  mode: 'single' | 'playlist';
  // single-mode inputs (set when mode === 'single')
  formatId?: string;
  audioConvert?: AudioConvert;
  activePreset?: Preset | null;
  expectedBytes?: number;
  // playlist-mode inputs (set when mode === 'playlist')
  playlistPreset?: PlaylistPreset | null;
  outputTemplate?: string;
  // shared
  subtitles?: SubtitleOptions;
  sponsorBlockMode: SponsorBlockMode;
  sponsorBlockCategories: SponsorBlockCategory[];
  embed: EmbedOptions;
}

export function prepareJob(input: PrepareJobInput): PreparedJob {
  const sponsorBlock = toSponsorBlockOptions(input.sponsorBlockMode, input.sponsorBlockCategories);
  const subtitles = input.subtitles && input.subtitles.languages.length > 0 ? input.subtitles : undefined;
  const identity: ExtractorIdentity = { extractor: input.extractor, extractorKey: input.extractorKey };
  const outputTemplate = input.outputTemplate ? { outputTemplate: input.outputTemplate } : {};

  if (input.mode === 'playlist') {
    if (!input.playlistPreset) throw new Error('prepareJob: playlist mode requires playlistPreset');
    if (!input.outputTemplate) throw new Error('prepareJob: playlist mode requires outputTemplate');
    const spec = playlistPresetSpec(input.playlistPreset);
    return {
      kind: 'playlist-preset',
      ...identity,
      preset: input.playlistPreset,
      formatSelector: spec.formatSelector,
      audioConvert: spec.audioConvert,
      outputTemplate: input.outputTemplate,
      subtitles,
      sponsorBlock,
      embed: input.embed
    };
  }

  const hasMedia = !!input.formatId || !!input.audioConvert || (!!input.activePreset && input.activePreset !== 'subtitle-only');
  const hasSubs = !!subtitles;

  if (input.activePreset === 'subtitle-only' || (!hasMedia && hasSubs)) {
    if (!subtitles) throw new Error('prepareJob: subtitle-only requires non-empty subtitle languages');
    return { kind: 'subtitle-only', ...identity, ...outputTemplate, subtitles };
  }

  if (input.audioConvert) {
    return {
      kind: 'audio-convert',
      ...identity,
      audioConvert: input.audioConvert,
      preset: input.activePreset ?? 'custom',
      ...outputTemplate,
      subtitles,
      sponsorBlock,
      embed: input.embed
    };
  }

  if (!input.formatId) throw new Error('prepareJob: single-format requires formatId');
  return {
    kind: 'single-format',
    ...identity,
    formatId: input.formatId,
    preset: input.activePreset ?? 'custom',
    ...outputTemplate,
    subtitles,
    sponsorBlock,
    embed: input.embed,
    expectedBytes: input.expectedBytes
  };
}

function toSponsorBlockOptions(mode: SponsorBlockMode, categories: SponsorBlockCategory[]): SponsorBlockOptions {
  if (mode === 'off' || categories.length === 0) return { mode: 'off' };
  return { mode, categories: [...categories] };
}

import type { PlaylistSelection, Preset } from '@shared/types.js';
import { playlistPresetSpec } from '@shared/playlistPresets.js';
import { presetProducesMedia, presetProducesVideo } from '@shared/presetTraits.js';
import { isYouTubeExtractor } from '@shared/ytdlp/extractorPredicates.js';
import type { WizardMode, WizardStep } from '../../store/types.js';

function isBatchMode(mode: WizardMode): boolean {
  return mode === 'playlist' || mode === 'bulk';
}

export type VisibleStep = Exclude<WizardStep, 'error'>;

export interface StepContext {
  activePreset: Preset | null;
  wizardMode: WizardMode;
  playlistSelection: PlaylistSelection | null;
  // yt-dlp extractor for the URL the user submitted. Empty pre-probe.
  // SponsorBlock step is YouTube-only — non-YT extractors hide the step.
  wizardExtractor: string;
  // True when the probe surfaced at least one subtitle or auto-caption track.
  // Sites whose extractor doesn't publish subs (PornHub, Rumble embeds, many
  // small hosts) get the wizard's subtitles step hidden entirely.
  hasSubtitles: boolean;
}

// Per-step applicable predicates. Single source of truth — used by both the
// renderer (stepRegistry) and the navigation logic (wizardSlice advance/back).
// Pure module: imports nothing React-side, so wizardSlice can safely import
// it without pulling components into the store's import cycle.
export const STEP_APPLICABLE: Record<VisibleStep, (ctx: StepContext) => boolean> = {
  url: () => true,
  playlistItems: ({ wizardMode }) => isBatchMode(wizardMode),
  playlistPresets: ({ wizardMode }) => isBatchMode(wizardMode),
  formats: ({ wizardMode }) => !isBatchMode(wizardMode),
  // Playlist-mode skips subtitles once a preset is locked in. Single-mode
  // skips when the probe returned no subtitle tracks (no manual + no
  // auto-captions).
  subtitles: ({ wizardMode, playlistSelection, hasSubtitles }) => {
    if (isBatchMode(wizardMode) && !!playlistSelection) return false;
    if (!isBatchMode(wizardMode) && !hasSubtitles) return false;
    return true;
  },
  sponsorblock: ({ wizardMode, playlistSelection, activePreset, wizardExtractor }) => {
    // SponsorBlock relies on YouTube's chapter timestamps + the SponsorBlock
    // crowdsourced segment database keyed by YouTube video IDs. Non-YT URLs
    // get nothing useful — hide the step entirely.
    if (!isYouTubeExtractor(wizardExtractor)) return false;
    if (isBatchMode(wizardMode) && playlistSelection) return playlistPresetSpec(playlistSelection).producesVideo;
    if (activePreset && !presetProducesVideo(activePreset)) return false;
    return true;
  },
  output: ({ wizardMode, playlistSelection, activePreset }) => {
    if (isBatchMode(wizardMode) && playlistSelection) return true;
    if (activePreset && !presetProducesMedia(activePreset)) return false;
    return true;
  },
  folder: () => true,
  confirm: () => true
};

export const STEPS: VisibleStep[] = ['url', 'playlistItems', 'playlistPresets', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'];

export function shouldSkip(step: VisibleStep, ctx: StepContext): boolean {
  return !STEP_APPLICABLE[step](ctx);
}

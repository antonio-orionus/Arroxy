import type { StartDownloadInput } from '@shared/types';
import { presetProducesMedia } from '@shared/presetTraits';
import { VideoPhase } from './VideoPhase';
import { SubtitleOnlyPhase } from './SubtitleOnlyPhase';
import { SidecarSubsPhase } from './SidecarSubsPhase';
import { PreflightPhase } from './PreflightPhase';
import type { Phase } from './types';

function presetWantsMedia(preset: StartDownloadInput['preset']): boolean {
  if (!preset || preset === 'custom') return false;
  return presetProducesMedia(preset);
}

export type StrategyKind = 'subtitle-only' | 'video' | 'video+sidecar' | 'video+embed' | 'video+embed+auto';

const PHASES: Record<StrategyKind, Phase[]> = {
  'subtitle-only': [SubtitleOnlyPhase],
  video: [VideoPhase(false)],
  'video+embed': [VideoPhase(true)],
  'video+sidecar': [VideoPhase(false), SidecarSubsPhase(false)],
  'video+embed+auto': [VideoPhase(false), SidecarSubsPhase(true)]
};

// Routing key is preset semantics + media-intent payload, not formatId presence.
// audio-only preset legitimately omits `formatId` and signals media via
// `audioConvert` — earlier `!formatId` check silently dropped that case
// into subtitle-only and skipped the audio download entirely.
export function strategyFor(input: StartDownloadInput): StrategyKind {
  if (input.preset === 'subtitle-only') return 'subtitle-only';
  const wantsSubs = !!input.subtitleLanguages?.length;
  const wantsMedia = !!input.formatId || !!input.audioConvert || presetWantsMedia(input.preset);
  if (!wantsMedia && wantsSubs) return 'subtitle-only';
  if (!wantsSubs) return 'video';
  const userEmbed = input.subtitleMode === 'embed';
  if (userEmbed && input.writeAutoSubs) return 'video+embed+auto';
  if (userEmbed) return 'video+embed';
  return 'video+sidecar';
}

export function phasesFor(input: StartDownloadInput): Phase[] {
  return [PreflightPhase(input.expectedBytes), ...PHASES[strategyFor(input)]];
}

export { PhaseExecutor } from './PhaseExecutor';
export type { Phase, PhaseContext, PhaseOutcome, ActiveDownload, PausedDownload } from './types';

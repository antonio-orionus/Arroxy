import type { StartDownloadInput } from '@shared/types';
import { VideoPhase } from './VideoPhase';
import { SubtitleOnlyPhase } from './SubtitleOnlyPhase';
import { SidecarSubsPhase } from './SidecarSubsPhase';
import type { Phase } from './types';

type StrategyKind = 'subtitle-only' | 'video' | 'video+sidecar' | 'video+embed' | 'video+embed+auto';

const PHASES: Record<StrategyKind, Phase[]> = {
  'subtitle-only':    [SubtitleOnlyPhase],
  'video':            [VideoPhase(false)],
  'video+embed':      [VideoPhase(true)],
  'video+sidecar':    [VideoPhase(false), SidecarSubsPhase(false)],
  'video+embed+auto': [VideoPhase(false), SidecarSubsPhase(true)],
};

function strategyFor(input: StartDownloadInput): StrategyKind {
  const wantsSubs = !!input.subtitleLanguages?.length;
  const userEmbed = input.subtitleMode === 'embed' && wantsSubs;

  if (!input.formatId && wantsSubs) return 'subtitle-only';
  if (!wantsSubs) return 'video';
  if (userEmbed && input.writeAutoSubs) return 'video+embed+auto';
  if (userEmbed) return 'video+embed';
  return 'video+sidecar';
}

export function phasesFor(input: StartDownloadInput): Phase[] {
  return PHASES[strategyFor(input)];
}

export { PhaseExecutor } from './PhaseExecutor';
export type { Phase, PhaseContext, PhaseOutcome, ActiveDownload, PausedDownload } from './types';

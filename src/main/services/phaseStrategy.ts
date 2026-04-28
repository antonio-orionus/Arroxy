// Maps a StartDownloadInput to one of five mutually-exclusive phase strategies.
// Replaces the boolean flag-bag (embedMode/subtitleOnly/embedAndAuto) so the
// implicit invariants are encoded in the type system instead of derived at
// each call site.

import type { StartDownloadInput } from '@shared/types';

export type PhaseStrategy =
  | { kind: 'subtitle-only' }
  | { kind: 'video' }
  | { kind: 'video+sidecar' }
  | { kind: 'video+embed' }
  | { kind: 'video+embed+auto' };

export function phaseStrategyFor(input: StartDownloadInput): PhaseStrategy {
  const wantsSubs = !!input.subtitleLanguages?.length;
  const userEmbed = input.subtitleMode === 'embed' && wantsSubs;

  if (!input.formatId && wantsSubs) return { kind: 'subtitle-only' };
  if (!wantsSubs) return { kind: 'video' };
  if (userEmbed && input.writeAutoSubs) return { kind: 'video+embed+auto' };
  if (userEmbed) return { kind: 'video+embed' };
  return { kind: 'video+sidecar' };
}

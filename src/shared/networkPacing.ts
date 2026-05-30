import { DEFAULT_PLAYLIST_PROBE_LIMIT, NETWORK_PACING_PRESET_VALUES, type NetworkPacingArgs } from './constants.js';
import { PLAYLIST_PROBE_LIMIT_MAX, PLAYLIST_PROBE_LIMIT_MIN } from './schemas.js';
import type { CommonSettings } from './types.js';

function finitePositive(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function resolvePlaylistProbeLimit(settings: Pick<CommonSettings, 'playlistProbeLimit'> | null | undefined): number {
  const value = finitePositive(settings?.playlistProbeLimit);
  if (value === undefined) return DEFAULT_PLAYLIST_PROBE_LIMIT;
  return Math.min(PLAYLIST_PROBE_LIMIT_MAX, Math.max(PLAYLIST_PROBE_LIMIT_MIN, Math.trunc(value)));
}

export function resolveNetworkPacing(settings: CommonSettings | null | undefined): NetworkPacingArgs {
  const preset = settings?.networkPacingPreset ?? 'balanced';
  if (preset !== 'custom') return NETWORK_PACING_PRESET_VALUES[preset];
  if (!settings) return {};
  return {
    sleepRequests: finitePositive(settings.pacingSleepRequests),
    sleepInterval: finitePositive(settings.pacingSleepInterval),
    maxSleepInterval: finitePositive(settings.pacingMaxSleepInterval),
    sleepSubtitles: finitePositive(settings.pacingSleepSubtitles),
    concurrentFragments: finitePositive(settings.pacingConcurrentFragments)
  };
}

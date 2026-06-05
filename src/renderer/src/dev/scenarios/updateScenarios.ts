import type { InstallChannel, UpdateAvailablePayload } from '@shared/types.js';

interface ScenarioLike {
  id: string;
}

export function buildUpdate(scenario: ScenarioLike): UpdateAvailablePayload | null {
  const channelByScenario: Partial<Record<string, InstallChannel>> = {
    'update-direct': 'direct',
    'update-darwin-dmg': 'direct',
    'update-winget': 'winget',
    'update-homebrew': 'homebrew',
    'update-scoop': 'scoop',
    'update-portable': 'portable',
    'update-flatpak': 'flatpak'
  };
  if (scenario.id === 'update-none') return null;
  const installChannel = channelByScenario[scenario.id];
  return installChannel ? { version: '1.2.0', currentVersion: '0.0.1', installChannel } : null;
}

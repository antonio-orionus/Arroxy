import type { InstallChannel } from '@shared/types';

export type Action =
  | { kind: 'install' }
  | { kind: 'download' }
  | { kind: 'command'; cmd: string };

export function resolveAction(channel: InstallChannel, platform: NodeJS.Platform): Action {
  if (channel === 'scoop') return { kind: 'command', cmd: 'scoop update arroxy' };
  if (channel === 'homebrew') return { kind: 'command', cmd: 'brew upgrade --cask arroxy' };
  if (channel === 'winget') return { kind: 'install' };
  return platform === 'darwin' ? { kind: 'download' } : { kind: 'install' };
}

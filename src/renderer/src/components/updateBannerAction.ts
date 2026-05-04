import type { InstallChannel } from '@shared/types';

export type Action =
  | { kind: 'install' }
  | { kind: 'download' }
  | { kind: 'command'; cmd: string };

export function resolveAction(channel: InstallChannel, platform: NodeJS.Platform): Action {
  switch (channel) {
    case 'scoop':    return { kind: 'command', cmd: 'scoop update arroxy' };
    case 'homebrew': return { kind: 'command', cmd: 'brew upgrade --cask arroxy' };
    case 'winget':   return { kind: 'install' };
    case 'portable': return { kind: 'download' };
    case 'direct':   return platform === 'darwin' ? { kind: 'download' } : { kind: 'install' };
    // Flatpak is filtered upstream in the main process — the renderer should
    // never receive this channel. Handled here only for type exhaustiveness.
    case 'flatpak':  return { kind: 'download' };
    default: {
      // Exhaustiveness check — adding a channel without handling here is a type error.
      const _exhaustive: never = channel;
      void _exhaustive;
      return { kind: 'download' };
    }
  }
}

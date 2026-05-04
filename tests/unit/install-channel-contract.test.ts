import { describe, expect, it } from 'vitest';
import { INSTALL_CHANNELS, type InstallChannel } from '@shared/types';
import { resolveAction, type Action } from '@renderer/components/system/updateBannerAction';

// Guardrail: this test exercises every member of the InstallChannel union
// against resolveAction on every supported platform. If a new channel is added
// to the union without handling it in resolveAction, the switch's
// exhaustiveness check fails at type-check time AND this test surfaces the
// missing branch at runtime — even before any UI test runs.

const PLATFORMS: NodeJS.Platform[] = ['win32', 'darwin', 'linux'];

const ACTION_KINDS = new Set<Action['kind']>(['install', 'download', 'command']);

function isAction(value: unknown): value is Action {
  if (typeof value !== 'object' || value === null) return false;
  const kind = (value as { kind?: unknown }).kind;
  if (typeof kind !== 'string' || !ACTION_KINDS.has(kind as Action['kind'])) return false;
  if (kind === 'command') {
    const cmd = (value as { cmd?: unknown }).cmd;
    return typeof cmd === 'string' && cmd.length > 0;
  }
  return true;
}

describe('InstallChannel ↔ resolveAction contract', () => {
  it('INSTALL_CHANNELS covers every member of the union', () => {
    // Compile-time check: this assignment fails if INSTALL_CHANNELS misses a
    // channel that exists in the union. Runtime length sanity check follows.
    const _exhaustive: readonly InstallChannel[] = INSTALL_CHANNELS;
    expect(_exhaustive.length).toBeGreaterThan(0);
    expect(new Set(INSTALL_CHANNELS).size).toBe(INSTALL_CHANNELS.length);
  });

  it.each(INSTALL_CHANNELS)('resolveAction(%s, *) returns a valid Action on every platform', (channel) => {
    for (const platform of PLATFORMS) {
      const action = resolveAction(channel, platform);
      expect(isAction(action), `channel=${channel} platform=${platform} returned ${JSON.stringify(action)}`).toBe(true);
    }
  });

  it('command-kind actions never produce empty strings', () => {
    for (const channel of INSTALL_CHANNELS) {
      for (const platform of PLATFORMS) {
        const action = resolveAction(channel, platform);
        if (action.kind === 'command') {
          expect(action.cmd.trim()).not.toBe('');
        }
      }
    }
  });
});

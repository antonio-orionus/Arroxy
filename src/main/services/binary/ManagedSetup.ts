import type { DependencySource } from '@shared/types.js';

export type ManagedSetupStep = 'preflight' | 'download' | 'checksum_lookup' | 'checksum_verify' | 'install' | 'unknown';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class ManagedSetupError extends Error {
  constructor(
    readonly step: ManagedSetupStep,
    readonly inner: unknown
  ) {
    super(errorMessage(inner));
    this.name = 'ManagedSetupError';
  }
}

export async function withManagedSetupStep<T>(step: ManagedSetupStep, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof ManagedSetupError) throw err;
    throw new ManagedSetupError(step, err);
  }
}

export function managedSetupCause(err: unknown): unknown {
  return err instanceof ManagedSetupError ? err.inner : err;
}

export function managedSetupStep(err: unknown): ManagedSetupStep {
  return err instanceof ManagedSetupError ? err.step : 'unknown';
}

export function sourceTelemetry(source: DependencySource): { source_kind: string; source_channel?: string } {
  return source.kind === 'managed' ? { source_kind: source.kind, source_channel: source.channel } : { source_kind: source.kind };
}

import { ok, type Result } from '@shared/result';
import type { WarmUpOutput } from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';
import type { LogService } from './LogService';

interface WarmupServiceDeps {
  binaryManager: BinaryManager;
  tokenService: TokenService;
  logService: LogService;
}

export class WarmupService {
  private warmUpPromise: Promise<Result<WarmUpOutput>> | null = null;

  constructor(private readonly deps: WarmupServiceDeps) {}

  run(): Promise<Result<WarmUpOutput>> {
    const { binaryManager, tokenService, logService } = this.deps;
    this.warmUpPromise ??= Promise.allSettled([binaryManager.ensureYtDlp(), binaryManager.ensureFFmpeg(), binaryManager.ensureFFprobe(), binaryManager.ensureDeno(), tokenService.warmUp()]).then((results) => {
      const failures = results.flatMap((result) => {
        if (result.status === 'fulfilled') return [];
        return result.reason instanceof Error ? [result.reason.message] : [String(result.reason)];
      });

      if (failures.length > 0) {
        logService.log('WARN', 'Warmup completed with failures', { failures });
      } else {
        logService.log('INFO', 'Warmup completed');
      }

      return ok({ completed: true, failures });
    });

    return this.warmUpPromise;
  }
}

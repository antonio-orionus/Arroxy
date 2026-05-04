import log from 'electron-log/main';

const logger = log.scope('warmup');
import { ok, type Result } from '@shared/result';
import type { WarmUpOutput } from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';

interface WarmupServiceDeps {
  binaryManager: BinaryManager;
  tokenService: TokenService;
}

export class WarmupService {
  private warmUpPromise: Promise<Result<WarmUpOutput>> | null = null;

  constructor(private readonly deps: WarmupServiceDeps) {}

  run(): Promise<Result<WarmUpOutput>> {
    const { binaryManager, tokenService } = this.deps;
    this.warmUpPromise ??= Promise.allSettled([binaryManager.ensureYtDlp(), binaryManager.ensureFFmpeg(), binaryManager.ensureFFprobe(), binaryManager.ensureDeno(), tokenService.warmUp()]).then((results) => {
      const failures = results.flatMap((result) => {
        if (result.status === 'fulfilled') return [];
        return result.reason instanceof Error ? [result.reason.message] : [String(result.reason)];
      });

      if (failures.length > 0) {
        logger.warn('Warmup completed with failures', { failures });
      } else {
        logger.info('Warmup completed');
      }

      return ok({ completed: true, failures });
    });

    return this.warmUpPromise;
  }
}

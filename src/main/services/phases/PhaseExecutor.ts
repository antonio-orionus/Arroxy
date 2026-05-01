import { STATUS_KEY } from '@shared/schemas';
import type { Phase, PhaseContext } from './types';

export class PhaseExecutor {
  async run(ctx: PhaseContext, phases: Phase[]): Promise<void> {
    for (const phase of phases) {
      const out = await phase.run(ctx);
      switch (out.kind) {
        case 'continue':
          continue;
        case 'completed':
          await this.complete(ctx);
          return;
        case 'soft-failed':
          ctx.emitStatus('done', out.status);
          await ctx.finalize('completed');
          return;
        case 'hard-failed':
          await ctx.finalize('failed', out.error);
          return;
        case 'cancelled':
          await ctx.cleanupPartFiles(ctx.active.job.outputDir);
          ctx.emitStatus('error', STATUS_KEY.cancelled);
          await ctx.finalize('cancelled');
          return;
        case 'paused':
          ctx.moveToPaused();
          return;
      }
    }
    await this.complete(ctx);
  }

  private async complete(ctx: PhaseContext): Promise<void> {
    if (ctx.active.usedExtractorFallback) {
      ctx.emitStatus('download', STATUS_KEY.usedExtractorFallback);
    }
    ctx.emitStatus('done', STATUS_KEY.complete);
    await ctx.finalize('completed');
  }
}

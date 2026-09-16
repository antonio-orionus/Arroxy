import {STATUS_KEY} from '@shared/schemas.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'

// Drives the phase chain. Returns the resolved outcome up to the caller
// (DownloadService) — cleanup, finalize, and pause-park live there now,
// driven by the outcome via JobLifecycle. The executor only emits the
// terminal status events that ride the outcome (done/cancelled/extractor
// fallback notice) so phases stay focused on their pipeline step.
export class PhaseExecutor {
	async run(ctx: PhaseContext, phases: Phase[]): Promise<PhaseOutcome> {
		for (const phase of phases) {
			// react-doctor-disable-next-line react-doctor/async-await-in-loop -- phases are a dependent pipeline and must run in order
			const out = await phase.run(ctx)
			switch (out.kind) {
				case 'continue':
					continue
				case 'completed':
					this.emitCompletion(ctx)
					return out
				case 'soft-failed':
					// Both notices matter: the quality limit concerns the video itself.
					if (out.status === STATUS_KEY.subtitlesFailed && ctx.active.qualityLimit) ctx.emitStatus('done', STATUS_KEY.qualityLimitedSubtitlesFailed, {height: ctx.active.qualityLimit.height})
					else ctx.emitStatus('done', out.status)
					return out
				case 'hard-failed':
					// Phase already emitted the error status with the LocalizedError.
					return out
				case 'cancelled':
					ctx.emitStatus('error', STATUS_KEY.cancelled)
					return out
				case 'paused':
					// DownloadService inspects active.cancelRequested to decide whether
					// to park the job (paused) or treat as cancelled (drain + finalize).
					return out
			}
		}
		this.emitCompletion(ctx)
		return {kind: 'completed'}
	}

	private emitCompletion(ctx: PhaseContext): void {
		if (ctx.active.usedExtractorFallback) {
			ctx.emitStatus('download', STATUS_KEY.usedExtractorFallback)
		}
		// A quality limit replaces the plain completion notice.
		if (ctx.active.qualityLimit) ctx.emitStatus('done', STATUS_KEY.qualityLimited, {height: ctx.active.qualityLimit.height})
		else ctx.emitStatus('done', STATUS_KEY.complete)
	}
}

import type {YtDlpSignal} from '../YtDlp.js'
import type {ActiveJob, PhaseContext} from './types.js'

// Shared yt-dlp signal handlers used by every phase that spawns yt-dlp:
//   - assign `active.ytDlpProcess` on spawn
//   - SIGKILL immediately if cancel was requested before spawn returned
//   - register SIGKILL disposable for finalize-time drain
//   - pipe stdout/stderr into ctx.safeConsume
//
// Phases can override or extend any handler via `extra`. When both this helper
// and `extra` define `onSpawn`, the default runs first and then `extra.onSpawn`.
export function buildYtDlpSignal(ctx: PhaseContext, active: ActiveJob, extra: Omit<YtDlpSignal, 'onStdout' | 'onStderr'> & {onStdout?: YtDlpSignal['onStdout']; onStderr?: YtDlpSignal['onStderr']} = {}): YtDlpSignal {
	const {onSpawn: extraOnSpawn, onStdout: extraOnStdout, onStderr: extraOnStderr, ...rest} = extra
	return {
		...rest,
		onSpawn: proc => {
			active.ytDlpProcess = proc
			if (active.cancelRequested) proc.kill('SIGKILL')
			ctx.register(() => {
				proc.kill('SIGKILL')
			})
			extraOnSpawn?.(proc)
		},
		onStdout: extraOnStdout ?? (text => ctx.safeConsume(text)),
		onStderr: extraOnStderr ?? (text => ctx.safeConsume(text))
	}
}

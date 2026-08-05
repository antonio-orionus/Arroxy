import {compileFilenameTemplate, DEFAULT_FILENAME_TEMPLATE} from '@shared/filenameTemplate.js'
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

/**
 * Compile a job's Arroxy filename template into the yt-dlp output template that
 * reaches `-o`. Owned by main, not the renderer: `-o` accepts absolute paths and
 * `../`, so compiling here means the only strings that can ever reach it are
 * built from the allowlisted token grammar.
 *
 * Anything that fails to parse falls back to the built-in default rather than
 * emitting a broken argument or failing the download — a persisted template can
 * go stale through hand-edited config or a token removed in a later release.
 */
export function compiledOutputTemplate(filenameTemplate: string | undefined): string | undefined {
	if (filenameTemplate === undefined) return undefined
	const compiled = compileFilenameTemplate(filenameTemplate)
	if (compiled.ok) return compiled.template
	const fallback = compileFilenameTemplate(DEFAULT_FILENAME_TEMPLATE)
	if (!fallback.ok) throw new Error('invariant: the default filename template must compile')
	return fallback.template
}

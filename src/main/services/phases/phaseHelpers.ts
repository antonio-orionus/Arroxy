import {compileFilenameTemplate, DEFAULT_FILENAME_TEMPLATE} from '@shared/filenameTemplate.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {exploreCookieScopeFor} from '@shared/sites/exploreCookieScope.js'
import type {LocalizedError} from '@shared/types.js'
import type {YtDlpSignal} from '../YtDlp.js'
import {forgetOnExit} from '../download/processControl.js'
import type {ActiveJob, PhaseContext, PhaseOutcome} from './types.js'

// An escalated job runs on the Explore session or not at all: before each of
// its spawns the gate is asked again, so signing out, leaving explore mode or
// the kill switch stop it instead of letting it run anonymously. A sign-out
// the site itself confirmed earlier in the job stops it too, whatever cookies
// the partition still holds. Anonymous jobs pass without a lookup.
export async function canSpawnSignedIn(ctx: PhaseContext): Promise<boolean> {
	if (ctx.active.input.auth !== 'exploreSession') return true
	if ((await ctx.active.exploreSessionCheck) === 'signedOut') return false
	const scope = exploreCookieScopeFor(ctx.active.input.url)
	return scope !== null && ctx.exploreGate.canEscalate(scope)
}

// The outcome of a pause or cancel that landed on the job, else null. Pause wins
// over cancel, like everywhere else a phase checks both; a paused job parks
// rather than failing because its session is gone.
export function interruptedOutcome(active: ActiveJob): PhaseOutcome | null {
	return active.pauseRequested ? {kind: 'paused'} : active.cancelRequested ? {kind: 'cancelled'} : null
}

// The hard failure for an escalated job whose Explore session is gone.
export function exploreSignedOut(ctx: PhaseContext): PhaseOutcome {
	const error: LocalizedError = {kind: 'loginRequired', raw: 'Signed out of the Explore session'}
	ctx.emitStatus('error', STATUS_KEY.exploreSignedOut, undefined, error)
	return {kind: 'hard-failed', error}
}

// Single-spawn phases: the failed outcome when the spawn may not run, else null.
export async function guardSignedInSpawn(ctx: PhaseContext): Promise<PhaseOutcome | null> {
	return (await canSpawnSignedIn(ctx)) ? null : exploreSignedOut(ctx)
}

// Shared yt-dlp signal handlers used by every phase that spawns yt-dlp:
//   - assign `active.ytDlpProcess` on spawn, and clear it when the child exits
//   - SIGKILL immediately if cancel was requested before spawn returned
//   - register SIGKILL disposable for finalize-time drain
//   - pipe stdout/stderr into ctx.safeConsume
//   - cancel through the job's signal; pause stops a run that has not spawned
//     yet (a running process is paused by DownloadService)
//
// Phases can override or extend any handler via `extra`. When both this helper
// and `extra` define `onSpawn`, the default runs first and then `extra.onSpawn`.
export function buildYtDlpSignal(ctx: PhaseContext, active: ActiveJob, extra: Omit<YtDlpSignal, 'onStdout' | 'onStderr'> & {onStdout?: YtDlpSignal['onStdout']; onStderr?: YtDlpSignal['onStderr']} = {}): YtDlpSignal {
	const {onSpawn: extraOnSpawn, onStdout: extraOnStdout, onStderr: extraOnStderr, ...rest} = extra
	return {
		abortSignal: active.signal,
		pauseSignal: active.pauseController?.signal,
		...rest,
		onSpawn: proc => {
			active.ytDlpProcess = proc
			forgetOnExit(proc, () => {
				if (active.ytDlpProcess === proc) active.ytDlpProcess = undefined
			})
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

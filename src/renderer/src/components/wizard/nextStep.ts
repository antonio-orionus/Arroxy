// Pure step-graph traversal. Replaces the duplicated skip-loops in
// wizardSlice.advance / back / skipSubtitles with one source of truth.
//
// `STEP_APPLICABLE` (in stepNavigation.ts) is the eligibility table; this
// module just walks `STEPS` in the requested direction and returns the next
// step that the table says is applicable, or null at the boundary.

import {STEPS, STEP_APPLICABLE, type StepContext, type VisibleStep} from './stepNavigation.js'

// Inputs to nextStep. Extends StepContext with one re-entry signal:
//   - wizardSubtitleSkipped — true when the user clicked "Skip" on the
//     subtitles step. The graph treats `subtitles` as not-applicable so a
//     subsequent `advance()` from `formats` doesn't bounce back into it.
export interface NavContext extends StepContext {
	wizardSubtitleSkipped: boolean
}

function applicable(step: VisibleStep, ctx: NavContext): boolean {
	// The subtitles step is hidden once the user has explicitly skipped it.
	// Without this guard, advancing from `formats` after a skip would walk
	// straight back into `subtitles`.
	if (step === 'subtitles' && ctx.wizardSubtitleSkipped) return false
	return STEP_APPLICABLE[step](ctx)
}

export function nextStep(current: VisibleStep, ctx: NavContext, dir: 'forward' | 'backward'): VisibleStep | null {
	const i = STEPS.indexOf(current)
	if (i < 0) return null
	if (dir === 'forward') {
		if (i >= STEPS.length - 1) return null
		let next = i + 1
		while (next < STEPS.length - 1 && !applicable(STEPS[next], ctx)) next++
		return STEPS[next] ?? null
	}
	if (i <= 0) return null
	let prev = i - 1
	while (prev > 0 && !applicable(STEPS[prev], ctx)) prev--
	return STEPS[prev] ?? null
}

// VideoPart — the single-video wizard's "Part of video": a time range picked on
// the Format screen. It belongs to this one download only (never to a
// profile), is cleared by a new link or a playlist, and survives a retry of the
// same probe. The fields hold what the user typed; validation decides whether
// Download may go ahead.

import type {VideoPart} from '@shared/preparedJob.js'
import {formatPartTime, validateVideoPart, type VideoPartFields, type VideoPartValidation} from '@shared/videoPart.js'
import type {AppState, GetState, SetState, VideoPartSlice} from '../types.js'

export const RESET_VIDEO_PART_STATE = {wizardChapters: [], wizardUrlStartSeconds: null, wizardPart: null} satisfies Pick<VideoPartSlice, 'wizardChapters' | 'wizardUrlStartSeconds' | 'wizardPart'>

type PartState = Pick<AppState, 'wizardPart' | 'wizardDuration' | 'wizardMediaKind'>

/** Why Part can't be used for this video right now, if anything. */
export type PartUnavailableReason = 'subtitles' | 'noDuration'

export function partUnavailableReason(state: Pick<AppState, 'wizardDuration' | 'wizardMediaKind'>): PartUnavailableReason | null {
	// Subtitles always cover the whole video, so a part has nothing to cut.
	if (state.wizardMediaKind === 'subtitles') return 'subtitles'
	if (state.wizardDuration === undefined || state.wizardDuration <= 0) return 'noDuration'
	return null
}

/** Null while the whole video is picked (or Part does not apply). */
export function wizardPartValidation(state: PartState): VideoPartValidation | null {
	if (state.wizardPart === null || partUnavailableReason(state) !== null) return null
	return validateVideoPart(state.wizardPart, state.wizardDuration)
}

/** The part this download takes, or null for the whole video. */
export function wizardVideoPart(state: PartState): VideoPart | null {
	const validation = wizardPartValidation(state)
	return validation?.ok ? validation.part : null
}

function partFieldsForRange(startSeconds: number, endSeconds: number, exactCut: boolean): VideoPartFields {
	return {start: formatPartTime(startSeconds), end: formatPartTime(endSeconds), exactCut}
}

function updateFields(state: AppState, patch: Partial<VideoPartFields>): Partial<AppState> {
	return state.wizardPart === null ? {} : {wizardPart: {...state.wizardPart, ...patch}}
}

export function createVideoPartSlice(set: SetState, _get: GetState): VideoPartSlice {
	return {
		...RESET_VIDEO_PART_STATE,

		setWizardPartEnabled: enabled =>
			set(state => {
				if (!enabled) return {wizardPart: null}
				if (state.wizardPart !== null || state.wizardDuration === undefined) return {}
				return {wizardPart: partFieldsForRange(0, state.wizardDuration, false)}
			}),
		setWizardPartStart: start => set(state => updateFields(state, {start})),
		setWizardPartEnd: end => set(state => updateFields(state, {end})),
		setWizardPartExactCut: exactCut => set(state => updateFields(state, {exactCut})),
		setWizardPartRange: (startSeconds, endSeconds) => set(state => ({wizardPart: partFieldsForRange(startSeconds, endSeconds, state.wizardPart?.exactCut ?? false)})),

		// The link's `t` becomes the start only when the user asks; the end is
		// kept when it still lies after it.
		useUrlStartForPart: () =>
			set(state => {
				const start = state.wizardUrlStartSeconds
				const duration = state.wizardDuration
				if (start === null || duration === undefined || start >= duration) return {}
				const validation = wizardPartValidation(state)
				const end = validation?.ok && validation.part.endSeconds > start ? validation.part.endSeconds : duration
				return {wizardPart: partFieldsForRange(start, end, state.wizardPart?.exactCut ?? false)}
			})
	}
}

// The Control API's error boundary. Internal failures cross it only as one of
// the public codes, with a fixed message: an internal message can carry
// stderr, temp dirs, job options or paths, so none of it goes out.

import {type ControlError, type ControlErrorCode, type ControlErrorDetails, controlError} from 'arroxy-control'
import {appErrorCodeSchema, type AppErrorCode} from '@shared/schemas.js'
import type {AppError} from '@shared/types.js'

// A failure a session answers with. Handlers throw it; the session's edge
// turns it into the response, and anything else thrown into `internal`.
export class ControlFailure extends Error {
	constructor(readonly error: ControlError) {
		super(error.message)
		this.name = 'ControlFailure'
	}
}

export function controlFailure(code: ControlErrorCode, message: string, options: {details?: ControlErrorDetails; retryable?: boolean} = {}): ControlFailure {
	return new ControlFailure(controlError(code, message, options))
}

interface PublicError {
	code: ControlErrorCode
	message: string
	// Overrides the public table's own answer.
	retryable?: boolean
}

const INTERNAL: PublicError = {code: 'internal', message: 'Arroxy could not do that.'}

// `validation` reaches here only as a status refusal: the service answers
// not_found and invalid_request itself before it calls the queue or intake.
const APP_ERRORS: Record<AppErrorCode, PublicError> = {
	validation: {code: 'invalid_state', message: 'The item does not allow that in its current state.'},
	// Another change to the same item is still under way (a pause settling).
	conflict: {code: 'invalid_state', message: 'Another change to the item is still under way; try again in a moment.', retryable: true},
	limit: {code: 'limit_exceeded', message: 'That is more than a client may add from one link.'},
	token: {code: 'internal', message: 'Arroxy could not get a token the site asks for.'},
	binary: {code: 'internal', message: "Arroxy's download tools are not ready."},
	download: {code: 'internal', message: 'The download could not be changed.'},
	ipc: INTERNAL,
	unknown: INTERNAL
}

// Parsed, not trusted: a code from a newer build or a bad cast answers internal.
export function controlErrorForApp(error: Pick<AppError, 'code'>): ControlError {
	const known = appErrorCodeSchema.safeParse(error.code)
	const entry = known.success ? APP_ERRORS[known.data] : INTERNAL
	return controlError(entry.code, entry.message, entry.retryable === undefined ? {} : {retryable: entry.retryable})
}

export function internalError(): ControlError {
	return controlError(INTERNAL.code, INTERNAL.message)
}

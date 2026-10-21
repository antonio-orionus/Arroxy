// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_ERROR_TABLE, controlErrorSchema} from 'arroxy-control'
import {controlErrorForApp} from '@main/control/controlErrors.js'
import {appErrorCodeSchema, type AppErrorCode} from '@shared/schemas.js'
import type {AppError} from '@shared/types.js'

// One fixed table from the queue's and intake's internal error codes to the
// public ones. An internal message can carry stderr, temp dirs or paths, so
// none of it reaches a client.

const LEAKY = 'yt-dlp exited 1: ERROR: /Users/me/Library/Caches/arroxy/tmp-abc/part.webm --cookies /Users/me/cookies.txt'

function appError(code: string): AppError {
	// An unknown code can only arrive from outside the type system (a future
	// code, a bad cast); the cast stands in for it.
	return {code: code as AppErrorCode, message: LEAKY, details: LEAKY, recoverable: true}
}

describe('controlErrorForApp', () => {
	it.each<[AppErrorCode, string, boolean]>([
		['validation', 'invalid_state', false],
		['conflict', 'invalid_state', true],
		['limit', 'limit_exceeded', false],
		['token', 'internal', true],
		['binary', 'internal', true],
		['download', 'internal', true],
		['ipc', 'internal', true],
		['unknown', 'internal', true]
	])('maps %s to %s', (code, publicCode, retryable) => {
		const error = controlErrorForApp(appError(code))
		expect(error.code).toBe(publicCode)
		expect(error.retryable).toBe(retryable)
		expect(controlErrorSchema.safeParse(error).success).toBe(true)
	})

	it('covers every internal code', () => {
		for (const code of appErrorCodeSchema.options) expect(controlErrorForApp(appError(code)).code).toBeTruthy()
	})

	it('answers internal for a code it does not know', () => {
		expect(controlErrorForApp(appError('brand-new')).code).toBe('internal')
	})

	it('never carries the internal message, details, paths or stderr', () => {
		for (const code of [...appErrorCodeSchema.options, 'brand-new']) {
			const serialized = JSON.stringify(controlErrorForApp(appError(code)))
			expect(serialized).not.toContain('/Users/')
			expect(serialized).not.toContain('yt-dlp exited')
			expect(serialized).not.toContain('--cookies')
		}
	})

	it("gives the public table's next step", () => {
		expect(controlErrorForApp(appError('limit')).next).toBe(CONTROL_ERROR_TABLE.limit_exceeded.next)
	})
})

import type {AppError} from './types.js'

export type Result<T, E = AppError> = {ok: true; data: T} | {ok: false; error: E}

export function ok<T>(data: T): {ok: true; data: T} {
	return {ok: true, data}
}

export function fail<T = never, E = AppError>(error: E): Result<T, E> {
	return {ok: false, error}
}

import type { AppError } from './types';

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: AppError): Result<T> {
  return { ok: false, error };
}

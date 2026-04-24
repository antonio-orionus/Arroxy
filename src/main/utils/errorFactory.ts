import type { AppError, AppErrorCode } from '@shared/types';

export function createAppError(
  code: AppErrorCode,
  message: string,
  details?: string,
  recoverable = true
): AppError {
  return { code, message, details, recoverable };
}

export function unknownToMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

import { app, ipcMain } from 'electron';
import type { ZodType } from 'zod';
import { createAppError, unknownToMessage } from '@main/utils/errorFactory';
import { fail, type Result } from '@shared/result';
import type { AppError, CommonPaths } from '@shared/types';

function zodToError(errorMessage: string): AppError {
  return createAppError('validation', errorMessage);
}

export function toIpcFailure(message: string): Result<never> {
  return fail(createAppError('ipc', message));
}

export function toUnknownFailure(error: unknown): Result<never> {
  return fail(createAppError('unknown', unknownToMessage(error)));
}

function safeAppPath(name: Parameters<typeof app.getPath>[0]): string | null {
  try {
    return app.getPath(name);
  } catch {
    return null;
  }
}

export function buildCommonPaths(): CommonPaths {
  const isFlatpak = !!process.env.FLATPAK_ID;
  return {
    downloads: safeAppPath('downloads'),
    videos: safeAppPath('videos'),
    music: safeAppPath('music'),
    ...(isFlatpak
      ? {}
      : {
          desktop: safeAppPath('desktop'),
          documents: safeAppPath('documents'),
          pictures: safeAppPath('pictures'),
          home: safeAppPath('home')
        })
  };
}

export function handle<T, R>(channel: string, schema: ZodType<T>, fn: (data: T) => Promise<Result<R>>): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, async (_, payload: unknown) => {
    const parsed = schema.safeParse(payload ?? {});
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? `Invalid ${channel} payload`));
    }
    try {
      return await fn(parsed.data);
    } catch (error) {
      return toUnknownFailure(error);
    }
  });
}

export function handleRaw(channel: string, listener: Parameters<typeof ipcMain.handle>[1]): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, listener);
}

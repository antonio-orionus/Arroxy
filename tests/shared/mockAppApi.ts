import { vi } from 'vitest';
import type { AppApi } from '@shared/api';
import type { AppSettings } from '@shared/types';
import { defaultAppSettings } from '@shared/constants';
import { ok } from '@shared/result';

function buildMockSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    ...defaultAppSettings('/tmp'),
    ...overrides
  };
}

interface BuildMockOptions {
  settings?: Partial<AppSettings>;
}

export function buildMockAppApi(options: BuildMockOptions = {}): AppApi {
  const settings = buildMockSettings(options.settings);
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
    },
    window: {
      minimize: vi.fn().mockResolvedValue(undefined),
      maximize: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      isMaximized: vi.fn().mockResolvedValue(false),
      onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
    },
    downloads: {
      getFormats: vi.fn().mockResolvedValue(
        ok({
          formats: [
            {
              formatId: '22',
              label: '720p | mp4',
              ext: 'mp4',
              resolution: '720p',
              fps: 30,
              isVideoOnly: false,
              isAudioOnly: false
            }
          ],
          title: 'Test Video',
          thumbnail: ''
        })
      ),
      start: vi.fn().mockResolvedValue(
        ok({
          job: {
            id: 'job-1',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            outputDir: '/tmp',
            status: 'running',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      ),
      cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
      pause: vi.fn().mockResolvedValue(ok({ paused: true })),
      resume: vi.fn().mockResolvedValue(ok({ resumed: false }))
    },
    settings: {
      get: vi.fn().mockResolvedValue(ok(settings)),
      update: vi.fn().mockResolvedValue(ok(settings))
    },
    shell: {
      openFolder: vi.fn().mockResolvedValue(ok({ opened: true })),
      openExternal: vi.fn().mockResolvedValue(ok({ opened: true }))
    },
    logs: {
      openDir: vi.fn().mockResolvedValue(ok({ opened: true }))
    },
    dialog: {
      chooseFolder: vi.fn().mockResolvedValue(ok({ path: '/tmp' })),
      chooseFile: vi.fn().mockResolvedValue(ok({ path: null }))
    },
    events: {
      onStatus: vi.fn().mockReturnValue(() => undefined),
      onProgress: vi.fn().mockReturnValue(() => undefined),
      onClipboardUrl: vi.fn().mockReturnValue(() => undefined)
    },
    queue: {
      save: vi.fn().mockResolvedValue(ok({ saved: true as const })),
      load: vi.fn().mockResolvedValue(ok([]))
    },
    updater: {
      onUpdateAvailable: vi.fn().mockReturnValue(() => undefined),
      install: vi.fn().mockResolvedValue({ ok: true })
    },
    analytics: {
      track: vi.fn()
    },
    diagnostics: {
      logWizardStep: vi.fn()
    }
  };
}

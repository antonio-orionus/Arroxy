import type { AppApi } from '@shared/api';
import type { AppSettings, ProgressEvent, StatusEvent, UpdateAvailablePayload } from '@shared/types';
import { isYouTubeUrl } from '@shared/schemas';
import { defaultAppSettings } from '@shared/constants';

if (!('appApi' in window)) {
  const statusListeners = new Set<(e: StatusEvent) => void>();
  const progressListeners = new Set<(e: ProgressEvent) => void>();
  const updateListeners = new Set<(info: UpdateAvailablePayload) => void>();

  setTimeout(() => {
    // Flip installChannel to 'scoop' / 'homebrew' / 'winget' to preview those banner states
    updateListeners.forEach((l) =>
      l({ version: '1.2.0', currentVersion: '0.0.1', installChannel: 'direct' })
    );
  }, 3_000);

  let settings: AppSettings = {
    ...defaultAppSettings('/home/user/Downloads'),
    language: 'en',
    cookiesPath: undefined,
    cookiesEnabled: false,
    commonPaths: {
      downloads: '/home/user/Downloads',
      videos: '/home/user/Videos',
      desktop: '/home/user/Desktop',
      music: '/home/user/Music',
      documents: '/home/user/Documents',
      pictures: '/home/user/Pictures',
      home: '/home/user',
    }
  };

  function delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  function jobId(): string {
    return `mock-${Date.now()}`;
  }

  async function simulateDownload(id: string, shouldError: boolean): Promise<void> {
    await delay(400);

    const stages: { stage: StatusEvent['stage']; key: StatusEvent['statusKey'] }[] = [
      { stage: 'setup', key: 'preparingBinaries' },
      { stage: 'token', key: 'mintingToken' },
      { stage: 'download', key: 'startingYtdlp' }
    ];
    for (const { stage, key } of stages) {
      statusListeners.forEach((l) =>
        l({ jobId: id, stage, statusKey: key, at: new Date().toISOString() })
      );
      await delay(300);
    }

    if (shouldError) {
      await delay(600);
      statusListeners.forEach((l) =>
        l({
          jobId: id,
          stage: 'error',
          statusKey: 'ytdlpExitCode',
          params: { code: 1 },
          error: { key: 'botBlock', rawMessage: "Sign in to confirm you're not a bot" },
          at: new Date().toISOString()
        })
      );
      return;
    }

    // Simulate yt-dlp progress lines
    const steps = [
      { pct: 5, line: '[download]   5.0% of ~142.30MiB at  3.21MiB/s ETA 00:43' },
      { pct: 18, line: '[download]  18.2% of ~142.30MiB at  4.87MiB/s ETA 00:35' },
      { pct: 34, line: '[download]  34.1% of ~142.30MiB at  5.10MiB/s ETA 00:26' },
      { pct: 51, line: '[download]  51.3% of ~142.30MiB at  4.93MiB/s ETA 00:19' },
      { pct: 67, line: '[download]  67.5% of ~142.30MiB at  5.22MiB/s ETA 00:12' },
      { pct: 82, line: '[download]  82.8% of ~142.30MiB at  5.01MiB/s ETA 00:06' },
      { pct: 95, line: '[download]  95.4% of ~142.30MiB at  4.78MiB/s ETA 00:01' },
      { pct: 100, line: '[download] 100% of ~142.30MiB in 00:28' }
    ];

    for (const step of steps) {
      progressListeners.forEach((l) =>
        l({ jobId: id, line: step.line, percent: step.pct, at: new Date().toISOString() })
      );
      await delay(500);
    }

    statusListeners.forEach((l) =>
      l({ jobId: id, stage: 'done', statusKey: 'complete', at: new Date().toISOString() })
    );
  }

  const mock: AppApi = {
    app: {
      warmUp: async () => {
        await delay(900);
        return { ok: true, data: { completed: true, failures: [] } };
      },
      setLanguage: async () => { /* no-op in browser */ }
    },

    window: {
      minimize: async () => { /* no-op in browser */ },
      maximize: async () => { /* no-op in browser */ },
      close: async () => { /* no-op in browser */ },
      isMaximized: async () => false,
      onMaximizedChange: () => () => undefined
    },

    downloads: {
      getFormats: async (input) => {
        await delay(1400);

        // Reject anything the real shared validator would reject.
        if (!isYouTubeUrl(input.url)) {
          return {
            ok: false,
            error: { code: 'validation', message: 'Not a valid YouTube URL', recoverable: true }
          };
        }

        return {
          ok: true,
          data: {
            title: 'Mock Video — Lo-fi Hip Hop Radio 24/7',
            thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
            formats: [
              { formatId: '313', label: '2160p | webm | 30fps | 2.2 GB', ext: 'webm', resolution: '2160p', fps: 30, filesize: 2_400_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '271', label: '1440p | webm | 30fps | 906.2 MB', ext: 'webm', resolution: '1440p', fps: 30, filesize: 950_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '248', label: '1080p | webm | 30fps | 400.5 MB', ext: 'webm', resolution: '1080p', fps: 30, filesize: 420_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '247', label: '720p | webm | 30fps | 171.7 MB', ext: 'webm', resolution: '720p', fps: 30, filesize: 180_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '135', label: '480p | mp4 | 30fps | 104.9 MB', ext: 'mp4', resolution: '480p', fps: 30, filesize: 110_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '134', label: '360p | mp4 | 30fps | 62.0 MB', ext: 'mp4', resolution: '360p', fps: 30, filesize: 65_000_000, isVideoOnly: true, isAudioOnly: false },
              { formatId: '251', label: 'webm · Opus · 132 kbps · 5.0 MB', ext: 'webm', resolution: 'audio only', abr: 132, filesize: 5_200_000, isVideoOnly: false, isAudioOnly: true },
              { formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, filesize: 5_000_000, isVideoOnly: false, isAudioOnly: true },
              { formatId: '249', label: 'webm · Opus · 50 kbps · 2.0 MB', ext: 'webm', resolution: 'audio only', abr: 50, filesize: 2_000_000, isVideoOnly: false, isAudioOnly: true },
              { formatId: '139', label: 'm4a · AAC · 48 kbps · 1.8 MB', ext: 'm4a', resolution: 'audio only', abr: 48, filesize: 1_900_000, isVideoOnly: false, isAudioOnly: true }
            ],
            subtitles: {
              en: [{ ext: 'vtt', name: 'English' }],
              es: [{ ext: 'vtt', name: 'Español' }]
            },
            // Note: in real yt-dlp output, `automatic_captions` includes BOTH the actual
            // generated track (key ends with `-orig`) AND many on-demand translation
            // options (e.g. `hy`, `eu`). FormatProbeService filters the latter — the mock
            // simulates post-filter state, so only `-orig` entries are present here.
            automaticCaptions: {
              'en-orig': [{ ext: 'vtt', name: 'English (auto)' }]
            }
          }
        };
      },

      start: async (input) => {
        const id = jobId();
        const shouldError = input.url.toLowerCase().includes('error');
        void simulateDownload(id, shouldError);
        return {
          ok: true,
          data: {
            job: {
              id,
              url: input.url,
              outputDir: input.outputDir ?? settings.defaultOutputDir,
              formatId: input.formatId,
              status: 'running',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        };
      },

      cancel: async () => {
        return { ok: true, data: { cancelled: true } };
      },

      pause: async () => {
        return { ok: true, data: { paused: true } };
      },

      resume: async () => {
        // Browser mock has no real job persistence; renderer falls back to start().
        return { ok: true, data: { resumed: false } };
      }
    },

    settings: {
      get: async () => {
        await delay(80);
        return { ok: true, data: { ...settings } };
      },
      update: async (patch) => {
        settings = { ...settings, ...patch };
        return { ok: true, data: { ...settings } };
      }
    },

    shell: {
      openFolder: async (path) => {
        console.log('[mock] openFolder', path);
        return { ok: true, data: { opened: true } };
      },
      openExternal: async (url) => {
        window.open(url, '_blank', 'noopener');
        return { ok: true, data: { opened: true } };
      }
    },

    logs: {
      openDir: async () => {
        console.log('[mock] openDir');
        return { ok: true, data: { opened: true } };
      }
    },

    dialog: {
      chooseFolder: async () => {
        const paths = [
          '/home/user/Downloads',
          '/home/user/Videos',
          '/home/user/Desktop',
          '/tmp/arroxy-downloads'
        ];
        const path = paths[Math.floor(Math.random() * paths.length)];
        await delay(200);
        return { ok: true, data: { path } };
      },
      chooseFile: async () => {
        await delay(200);
        return { ok: true, data: { path: '/home/user/youtube-cookies.txt' } };
      }
    },

    events: {
      onStatus: (listener) => {
        statusListeners.add(listener);
        return () => statusListeners.delete(listener);
      },
      onProgress: (listener) => {
        progressListeners.add(listener);
        return () => progressListeners.delete(listener);
      },
      onClipboardUrl: () => () => undefined,
    },

    queue: {
      save: async () => ({ ok: true, data: { saved: true } }),
      load: async () => ({ ok: true, data: [] })
    },

    updater: {
      onUpdateAvailable: (listener) => {
        updateListeners.add(listener);
        return () => updateListeners.delete(listener);
      },
      install: async () => {
        await delay(2_000);
        console.log('[mock] updater: install complete (would quit in real app)');
      },
    },
  };

  (window as unknown as { appApi: AppApi }).appApi = mock;
}

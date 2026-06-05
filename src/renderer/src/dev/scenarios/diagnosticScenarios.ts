import type { DependencyDiagnostic, DependencyId, WarmUpOutput } from '@shared/types.js';

interface ScenarioLike {
  id: string;
}

export function buildWarmUp(scenario: ScenarioLike): WarmUpOutput {
  const dependencies = allRunnableDependencies();
  switch (scenario.id) {
    case 'diagnostics-ytdlp-missing':
      dependencies['yt-dlp'] = failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed');
      return { completed: false, dependencies, blockingFailures: ['yt-dlp'], cancelled: false };
    case 'diagnostics-ffmpeg-broken':
      dependencies.ffmpeg = failedDependency('ffmpeg', 'bad_exit_code', 'ffmpeg exited with code 1');
      return { completed: false, dependencies, blockingFailures: ['ffmpeg'], cancelled: false };
    case 'diagnostics-deno-missing':
      dependencies.deno = failedDependency('deno', 'download_failed', 'deno download failed');
      return { completed: false, dependencies, blockingFailures: ['deno'], cancelled: false };
    case 'diagnostics-ffprobe-broken':
      dependencies.ffprobe = failedDependency('ffprobe', 'bad_exit_code', 'ffprobe exited with code 1');
      return { completed: false, dependencies, blockingFailures: ['ffprobe'], cancelled: false };
    case 'diagnostics-all-missing': {
      const allFailed = {
        'yt-dlp': failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed'),
        ffmpeg: failedDependency('ffmpeg', 'download_failed', 'ffmpeg download failed'),
        ffprobe: failedDependency('ffprobe', 'download_failed', 'ffprobe download failed'),
        deno: failedDependency('deno', 'download_failed', 'deno download failed')
      };
      return { completed: false, dependencies: allFailed, blockingFailures: ['yt-dlp', 'ffmpeg', 'ffprobe', 'deno'], cancelled: false };
    }
    case 'diagnostics-warmup-running':
      dependencies.deno = failedDependency('deno', 'download_failed', 'deno download failed (non-blocking)');
      return { completed: false, dependencies, blockingFailures: [], cancelled: false };
    default:
      return { completed: true, dependencies, blockingFailures: [], cancelled: false };
  }
}

function allRunnableDependencies(): Record<DependencyId, DependencyDiagnostic> {
  return {
    'yt-dlp': { id: 'yt-dlp', state: 'runnable', source: { kind: 'managed', channel: 'nightly', url: 'mock' }, resolvedPath: '/mock/yt-dlp', attempts: [] },
    ffmpeg: { id: 'ffmpeg', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/ffmpeg', attempts: [] },
    ffprobe: { id: 'ffprobe', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/ffprobe', attempts: [] },
    deno: { id: 'deno', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/deno', attempts: [] }
  };
}

function failedDependency(id: DependencyId, kind: NonNullable<DependencyDiagnostic['failure']>['kind'], message: string): DependencyDiagnostic {
  return {
    id,
    state: 'failed',
    source: { kind: 'managed', channel: id === 'yt-dlp' ? 'nightly' : 'default', url: 'mock' },
    resolvedPath: null,
    failure: { kind, message },
    attempts: []
  };
}

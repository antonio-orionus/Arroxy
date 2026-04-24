import type { FormatOption } from './types';

function resolutionHeight(resolution: string): number {
  const m = resolution.match(/(\d{3,4})/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

export function sortFormatsByQuality(formats: FormatOption[]): FormatOption[] {
  return [...formats].sort((a, b) => {
    const byResolution = resolutionHeight(b.resolution) - resolutionHeight(a.resolution);
    if (byResolution !== 0) return byResolution;
    const byFps = (b.fps ?? 0) - (a.fps ?? 0);
    if (byFps !== 0) return byFps;
    return (b.filesize ?? 0) - (a.filesize ?? 0);
  });
}

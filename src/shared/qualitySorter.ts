import type { FormatOption } from './types';

function resolutionHeight(resolution: string): number {
  const m = resolution.match(/(\d{3,4})/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

export function sortFormatsByQuality(formats: FormatOption[]): FormatOption[] {
  const video = formats.filter((f) => !f.isAudioOnly);
  const audio = formats.filter((f) => f.isAudioOnly);

  const sortedVideo = [...video].sort((a, b) => {
    const byResolution = resolutionHeight(b.resolution) - resolutionHeight(a.resolution);
    if (byResolution !== 0) return byResolution;
    const byFps = (b.fps ?? 0) - (a.fps ?? 0);
    if (byFps !== 0) return byFps;
    return (b.filesize ?? 0) - (a.filesize ?? 0);
  });

  const sortedAudio = [...audio].sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0));

  return [...sortedVideo, ...sortedAudio];
}

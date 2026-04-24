export function nextMonotonicPercent(current: number, incoming?: number): number {
  if (incoming === undefined || Number.isNaN(incoming)) return current;
  const boundedIncoming = Math.min(100, Math.max(0, incoming));
  return Math.max(current, boundedIncoming);
}

const UNITS: Record<string, number> = { B: 1, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3 };

export function parseSpeedBps(speed: string): number | null {
  const match = speed.match(/^([\d.]+)\s*(B|KiB|MiB|GiB)\/s$/);
  if (!match) return null;
  const unit = UNITS[match[2]];
  if (unit === undefined) return null;
  return parseFloat(match[1]) * unit;
}

export function parseEtaSeconds(eta: string): number | null {
  if (eta === 'Unknown' || eta === '--:--:--') return null;
  const parts = eta.split(':').map(Number);
  if (parts.some((p) => Number.isNaN(p))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export function formatSpeed(bps: number): string {
  if (bps >= UNITS.GiB) return `${(bps / UNITS.GiB).toFixed(2)}GiB/s`;
  if (bps >= UNITS.MiB) return `${(bps / UNITS.MiB).toFixed(2)}MiB/s`;
  if (bps >= UNITS.KiB) return `${(bps / UNITS.KiB).toFixed(2)}KiB/s`;
  return `${bps.toFixed(0)}B/s`;
}

export function formatEta(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const EWMA_ALPHA = 0.15;
const THROTTLE_MS = 1000;

export class ProgressSmoother {
  private smoothedSpeedBps: number | null = null;
  private smoothedEtaSec: number | null = null;
  private lastEmitTime = 0;
  private lastDetail: string | null = null;

  update(line: string): string | null {
    if (/^\[(Merger|ffmpeg|VideoRemuxer|ExtractAudio|VideoConvertor|EmbedThumbnail)\]/.test(line)) {
      this.lastDetail = 'Merging…';
      return 'Merging…';
    }

    const ffmpegMatch = line.match(/time=(\d{2}:\d{2}:\d{2}).*?speed=\s*(\S+x)/);
    if (ffmpegMatch) {
      this.lastDetail = `Merging… ${ffmpegMatch[2]} · ${ffmpegMatch[1]}`;
      return this.lastDetail;
    }

    if (!line.startsWith('[download]')) return null;

    const match = line.match(/\bat\s+(.+?)\s+ETA\s+(.+)$/);
    if (!match) return null;

    const speedBps = parseSpeedBps(match[1].trim());
    const etaSec = parseEtaSeconds(match[2].trim());

    if (speedBps !== null) {
      this.smoothedSpeedBps =
        this.smoothedSpeedBps === null
          ? speedBps
          : EWMA_ALPHA * speedBps + (1 - EWMA_ALPHA) * this.smoothedSpeedBps;
    }
    if (etaSec !== null) {
      this.smoothedEtaSec =
        this.smoothedEtaSec === null
          ? etaSec
          : EWMA_ALPHA * etaSec + (1 - EWMA_ALPHA) * this.smoothedEtaSec;
    }

    if (this.smoothedSpeedBps === null || this.smoothedEtaSec === null) {
      return this.lastDetail;
    }

    const now = Date.now();
    if (now - this.lastEmitTime < THROTTLE_MS) {
      return this.lastDetail;
    }
    this.lastEmitTime = now;

    this.lastDetail = `${formatSpeed(this.smoothedSpeedBps)} • ETA ${formatEta(this.smoothedEtaSec)}`;
    return this.lastDetail;
  }

  reset(): void {
    this.smoothedSpeedBps = null;
    this.smoothedEtaSec = null;
    this.lastEmitTime = 0;
    this.lastDetail = null;
  }
}

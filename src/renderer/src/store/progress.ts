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

export function formatEta(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const THROTTLE_MS = 1000;
// yt-dlp resets its averaging window at every fragment boundary, producing
// ~6 lines where speed plummets 50–200× and ETA spikes to hours. Suppress
// those, but cap the suppression so a genuine network slowdown still gets
// through within ~1.5s.
const SUPPRESSION_WINDOW_MS = 1500;
const SPIKE_DROP_RATIO = 0.2;

export class ProgressFormatter {
  private lastEmittedSpeedBps: number | null = null;
  private suppressedSinceMs: number | null = null;
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

    const speedStr = match[1].trim();
    const etaStr = match[2].trim();
    const speedBps = parseSpeedBps(speedStr);
    const etaSec = parseEtaSeconds(etaStr);
    if (speedBps === null || etaSec === null) return this.lastDetail;

    const now = Date.now();

    if (this.lastEmittedSpeedBps !== null && speedBps < this.lastEmittedSpeedBps * SPIKE_DROP_RATIO) {
      if (this.suppressedSinceMs === null) this.suppressedSinceMs = now;
      if (now - this.suppressedSinceMs < SUPPRESSION_WINDOW_MS) {
        return this.lastDetail;
      }
    } else {
      this.suppressedSinceMs = null;
    }

    if (now - this.lastEmitTime < THROTTLE_MS) return this.lastDetail;
    this.lastEmitTime = now;
    this.lastEmittedSpeedBps = speedBps;
    this.lastDetail = `${speedStr} • ETA ${formatEta(etaSec)}`;
    return this.lastDetail;
  }

  reset(): void {
    this.lastEmittedSpeedBps = null;
    this.suppressedSinceMs = null;
    this.lastEmitTime = 0;
    this.lastDetail = null;
  }
}

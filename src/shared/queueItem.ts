import type { QueueItem } from './types.js';

// True when a completed item represents a "high-value" download — used to
// gate the passive share banner in SmartDrawer. High value = anything the
// user explicitly opted into beyond a default single-format pull: 4K,
// audio-only conversion (MP3/M4A/etc), subtitles, SponsorBlock, playlists,
// or subtitle-only jobs.
export function isHighValueDownload(item: QueueItem): boolean {
  if (item.status !== 'done') return false;
  if (item.playlistGroupId) return true;
  // Defensive: queue items persisted before job-shape migrations may lack a
  // typed job. Treat absent job as low-value rather than crashing the banner.
  if (!item.job) return false;
  switch (item.job.kind) {
    case 'audio-convert':
    case 'subtitle-only':
    case 'ranged-format':
      return true;
    case 'single-format': {
      const hasSubs = (item.job.subtitles?.languages.length ?? 0) > 0;
      const hasSb = item.job.sponsorBlock.mode !== 'off';
      const is4k = /2160|4K|3840/i.test(item.formatLabel);
      return hasSubs || hasSb || is4k;
    }
  }
}

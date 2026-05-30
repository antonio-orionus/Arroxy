import type { AudioConvert, PlaylistSelection, PlaylistVideoTier } from './schemas.js';
import { DEFAULT_AUDIO_BITRATE } from './schemas.js';

export interface PlaylistPresetSpec {
  formatSelector?: string;
  // -S sort string — never fails, picks closest match. Used for MP4 (H.264 preferred).
  formatSort?: string;
  // --merge-output-format container override. Only set when formatSort targets a codec.
  mergeOutputFormat?: string;
  audioConvert?: AudioConvert;
  producesVideo: boolean;
}

// Maps a PlaylistSelection to yt-dlp arguments per video in the playlist.
// Uses -S (sort) rather than -f codec filters so no item is ever skipped —
// yt-dlp degrades gracefully to the closest available format.
export function playlistPresetSpec(s: PlaylistSelection): PlaylistPresetSpec {
  if (s.kind === 'audio') {
    if (s.format === 'best') {
      return { formatSelector: 'bestaudio/best', producesVideo: false };
    }
    const bitrateKbps = s.bitrateKbps ?? DEFAULT_AUDIO_BITRATE;
    return {
      audioConvert: { target: s.format, bitrateKbps },
      producesVideo: false
    };
  }

  // Video
  const { tier, codec } = s;

  if (tier === 'best') {
    return { formatSelector: 'bestvideo*+bestaudio/best', producesVideo: true };
  }

  const heights: Record<Exclude<PlaylistVideoTier, 'best'>, number> = { '2160': 2160, '1440': 1440, '1080': 1080, '720': 720, '480': 480, '360': 360 };
  const h = heights[tier];

  if (codec === 'mp4') {
    // Prefer H.264 + AAC in MP4 via -S; never hard-filters so an AV1-only item
    // still downloads (AV1 in mp4 container) rather than erroring.
    return {
      formatSelector: `bv*[height<=${h}]+ba/b[height<=${h}]/bv*+ba/b`,
      formatSort: 'vcodec:h264,acodec:m4a,ext:mp4',
      mergeOutputFormat: 'mp4',
      producesVideo: true
    };
  }

  // codec === 'best'
  return {
    formatSelector: `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`,
    producesVideo: true
  };
}

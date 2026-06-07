import type { AudioConvert, DownloadProfileMedia, MediaIntent, PlaylistSelection, PlaylistVideoTier } from './schemas.js';
import { DEFAULT_AUDIO_BITRATE } from './schemas.js';

export interface MediaIntentSpec {
  formatSelector?: string;
  // -S sort string — never fails, picks closest match. Used for MP4 (H.264 preferred).
  formatSort?: string;
  // --merge-output-format container override. Only set when formatSort targets a codec.
  mergeOutputFormat?: string;
  audioConvert?: AudioConvert;
  producesVideo: boolean;
  producesAudio: boolean;
}

const heights: Record<Exclude<PlaylistVideoTier, 'best'>, number> = { '2160': 2160, '1440': 1440, '1080': 1080, '720': 720, '480': 480, '360': 360 };

export function playlistSelectionToMediaIntent(selection: PlaylistSelection): MediaIntent {
  if (selection.kind === 'audio') {
    return { kind: 'audio-only', audio: { format: selection.format, bitrateKbps: selection.bitrateKbps } };
  }
  return { kind: 'video-audio', codec: selection.codec, tiers: [selection.tier] };
}

export function mediaIntentFromProfileMedia(media: DownloadProfileMedia): MediaIntent | null {
  if (media.kind === 'subtitles-only') return null;
  return media;
}

function primaryVideoTier(tiers: readonly PlaylistVideoTier[]): PlaylistVideoTier {
  return tiers[0] ?? 'best';
}

// Maps media intent to yt-dlp arguments per URL.
// Uses -S (sort) rather than hard codec filters for MP4 so no URL is skipped —
// yt-dlp degrades gracefully to the closest available format.
export function mediaIntentSpec(intent: MediaIntent): MediaIntentSpec {
  if (intent.kind === 'audio-only') {
    if (intent.audio.format === 'best') {
      return { formatSelector: 'bestaudio/best', producesVideo: false, producesAudio: true };
    }
    const bitrateKbps = intent.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE;
    return {
      audioConvert: { target: intent.audio.format, bitrateKbps },
      producesVideo: false,
      producesAudio: true
    };
  }

  const tier = primaryVideoTier(intent.tiers);
  const withAudio = intent.kind === 'video-audio';

  if (tier === 'best') {
    if (!withAudio) return { formatSelector: 'bestvideo', producesVideo: true, producesAudio: false };
    return { formatSelector: 'bestvideo*+bestaudio/best', producesVideo: true, producesAudio: true };
  }

  const h = heights[tier];

  if (intent.codec === 'mp4') {
    if (!withAudio) {
      return {
        formatSelector: `bestvideo[height<=${h}]/bestvideo`,
        formatSort: 'vcodec:h264,ext:mp4',
        mergeOutputFormat: 'mp4',
        producesVideo: true,
        producesAudio: false
      };
    }
    return {
      formatSelector: `bv*[height<=${h}]+ba/b[height<=${h}]/bv*+ba/b`,
      formatSort: 'vcodec:h264,acodec:m4a,ext:mp4',
      mergeOutputFormat: 'mp4',
      producesVideo: true,
      producesAudio: true
    };
  }

  if (!withAudio) {
    return {
      formatSelector: `bestvideo[height<=${h}]/bestvideo`,
      producesVideo: true,
      producesAudio: false
    };
  }

  return {
    formatSelector: `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`,
    producesVideo: true,
    producesAudio: true
  };
}

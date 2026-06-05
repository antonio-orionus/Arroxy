import type { PlaylistEntry, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult } from '@shared/types.js';
import type { YtDlpErrorKind } from '@shared/schemas.js';

interface ScenarioLike {
  id: string;
}

interface ProbeUrlParams {
  playlistCount: number | null;
  probeErrorKind: YtDlpErrorKind | null;
}

export function shouldMockEmptyPlaylistScopeReload(scenario: ScenarioLike, playlistMode: ProbePlaylistMode | undefined, playlistScope: PlaylistScope | undefined): boolean {
  return scenario.id === 'playlist-scope-empty-reload' && playlistMode === 'playlist' && playlistScope !== undefined && playlistScope.items.kind !== 'app-limit';
}

export function buildProbeResult(scenario: ScenarioLike, params?: ProbeUrlParams): ProbeResult | null {
  if (params?.playlistCount !== null && params?.playlistCount !== undefined) {
    return playlistProbe(params.playlistCount);
  }
  switch (scenario.id) {
    case 'single-normal':
      return normalVideoProbe();
    case 'playlist-normal':
    case 'playlist-scope-empty-reload':
      return playlistProbe(12, { fullThumbnails: true });
    case 'playlist-no-thumbnails':
      return playlistProbe(100, { thumbnails: false });
    case 'playlist-long-titles':
      return playlistProbe(100, { longTitles: true });
    case 'probe-audio-only':
      return audioOnlyProbe();
    case 'probe-with-subtitles':
      return videoWithSubtitlesProbe();
    case 'probe-no-formats':
      return noFormatsProbe();
    case 'probe-live-stream':
      return liveStreamProbe();
    default:
      return null;
  }
}

const PROBE_ERROR_RAW: Partial<Record<YtDlpErrorKind, string>> = {
  botBlock: "ERROR: [youtube] x: Sign in to confirm you're not a bot. Use --cookies-from-browser ...",
  ipBlock: 'ERROR: [youtube] x: Unable to download webpage: HTTP Error 429: Too Many Requests',
  rateLimit: 'ERROR: unable to download video data: HTTP Error 429: Too Many Requests',
  ageRestricted: 'ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm your age.',
  unavailable: 'ERROR: [youtube] dQw4w9WgXcQ: Video unavailable.',
  geoBlocked: 'ERROR: [youtube] dQw4w9WgXcQ: The uploader has not made this video available in your country.',
  drmProtected: 'ERROR: [youtube] dQw4w9WgXcQ: This video is DRM-protected.',
  loginRequired: 'ERROR: [youtube] dQw4w9WgXcQ: This video is only available to registered users.',
  outOfDiskSpace: 'ERROR: [Errno 28] No space left on device',
  chunkTransferFailure: 'ERROR: unable to download video data: <urlopen error [Errno 104] Connection reset by peer>',
  postprocessFailure: 'ERROR: ffmpeg exited with code 1',
  unsupportedUrl: 'ERROR: Unsupported URL: https://example.com/unsupported',
  parse: 'ERROR: Unable to extract video data',
  network: 'ERROR: unable to download video data: <urlopen error [Errno -2] Name or service not known>',
  unknown: 'ERROR: Something went wrong (unknown error)'
};

export function buildProbeError(_scenario: ScenarioLike, params?: ProbeUrlParams): ProbeError | null {
  if (params?.probeErrorKind !== null && params?.probeErrorKind !== undefined) {
    const raw = PROBE_ERROR_RAW[params.probeErrorKind] ?? `ERROR: ${params.probeErrorKind} error (mock)`;
    return { kind: 'ytdlp', error: { kind: params.probeErrorKind, raw } };
  }
  return null;
}

const MOCK_FORMATS = [
  { formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '251', label: 'webm · Opus · 132 kbps · 5.0 MB', ext: 'webm', resolution: 'audio only', abr: 132, filesize: 5_200_000, isVideoOnly: false, isAudioOnly: true },
  { formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, filesize: 5_000_000, isVideoOnly: false, isAudioOnly: true }
] as const;

const NORMAL_VIDEO_FORMATS = [
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
] as const;

export function normalVideoProbe(options: { webpageUrl?: string; degraded?: Extract<ProbeResult, { kind: 'video' }>['degraded'] } = {}): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: options.webpageUrl ?? 'https://www.youtube.com/watch?v=mock-normal',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 60 * 60 * 24,
    title: 'Mock Video - Lo-fi Hip Hop Radio 24/7',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    ...(options.degraded ? { degraded: options.degraded } : {}),
    formats: [...NORMAL_VIDEO_FORMATS],
    subtitles: {
      en: [{ ext: 'vtt', name: 'English' }],
      es: [{ ext: 'vtt', name: 'Espanol' }]
    },
    automaticCaptions: {
      'en-orig': [{ ext: 'vtt', name: 'English (auto)' }]
    }
  };
}

function audioOnlyProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'soundcloud',
    extractorKey: 'SoundCloud',
    webpageUrl: 'https://soundcloud.com/mock/track',
    isAudioOnlySource: true,
    isLive: false,
    hasDrm: false,
    duration: 214,
    title: 'Mock SoundCloud Track - audio-only source',
    thumbnail: 'https://i1.sndcdn.com/artworks-mock.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: [
      { formatId: 'http_mp3-128', label: 'mp3 · 128 kbps · 3.4 MB', ext: 'mp3', resolution: 'audio only', abr: 128, filesize: 3_500_000, isVideoOnly: false, isAudioOnly: true },
      { formatId: 'http_opus-64', label: 'opus · 64 kbps · 1.7 MB', ext: 'opus', resolution: 'audio only', abr: 64, filesize: 1_700_000, isVideoOnly: false, isAudioOnly: true }
    ]
  };
}

function videoWithSubtitlesProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=subtitles',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 1845,
    title: 'Mock Video - Multi-Language Subtitles',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {
      en: [{ ext: 'vtt', name: 'English' }],
      es: [{ ext: 'vtt', name: 'Espanol' }],
      fr: [{ ext: 'vtt', name: 'Francais' }],
      de: [{ ext: 'vtt', name: 'Deutsch' }],
      ja: [{ ext: 'vtt', name: 'Japanese' }],
      zh: [{ ext: 'vtt', name: 'Chinese' }],
      ar: [{ ext: 'vtt', name: 'Arabic' }]
    },
    automaticCaptions: {
      'en-orig': [{ ext: 'vtt', name: 'English (auto)' }],
      'es-orig': [{ ext: 'vtt', name: 'Espanol (auto)' }]
    },
    formats: [...MOCK_FORMATS]
  };
}

function noFormatsProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=noformats',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 300,
    title: 'Mock Video - No Formats Available',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: []
  };
}

function liveStreamProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=livestream',
    isAudioOnlySource: false,
    isLive: true,
    hasDrm: false,
    title: 'Mock Live Stream - 24/7 Radio',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: [
      { formatId: '95', label: '1080p | mp4 | HLS', ext: 'mp4', resolution: '1080p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false },
      { formatId: '94', label: '720p | mp4 | HLS', ext: 'mp4', resolution: '720p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false },
      { formatId: '92', label: '480p | mp4 | HLS', ext: 'mp4', resolution: '480p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false }
    ]
  };
}

export function playlistProbe(count: number, options: { thumbnails?: boolean; fullThumbnails?: boolean; longTitles?: boolean; webpageUrl?: string } = {}): ProbeResult {
  const entries: PlaylistEntry[] = Array.from({ length: count }, (_, i) => {
    const number = i + 1;
    const title = options.longTitles ? `Mock playlist item ${number} - an intentionally long title with extra metadata, brackets, episode numbers, and enough words to pressure every row layout` : `Mock playlist item ${number} - ${i % 3 === 0 ? 'a longer title that should ellipsize gracefully when the row is narrow' : 'short title'}`;
    return {
      id: `mock${number}`,
      url: `https://www.youtube.com/watch?v=mock${number}`,
      title,
      thumbnail: options.thumbnails === false ? '' : options.fullThumbnails === true || i % 5 !== 0 ? 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg' : '',
      duration: 90 + i * 47,
      playlistIndex: number,
      videoId: `mockid${number}`
    };
  });

  return {
    kind: 'playlist',
    extractor: 'youtube:tab',
    extractorKey: 'YoutubeTab',
    webpageUrl: options.webpageUrl ?? 'https://example.com/mock-playlist',
    isAudioOnlySource: false,
    isMultiVideo: false,
    playlistId: 'PLmock_browser',
    playlistTitle: 'Mock Browser Playlist',
    entries
  };
}

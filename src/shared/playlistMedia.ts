/** Extensions matched for playlist folder scan / M3U (yt-dlp output templates). */
const PLAYLIST_MEDIA_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'mov', 'avi', 'm4v', 'mp3', 'flac', 'm4a', 'opus', 'wav', 'ogg']);

function mediaExtensionSuffix(name: string, bracketSuffix: string): string | null {
  const idx = name.lastIndexOf(bracketSuffix);
  if (idx < 0) return null;
  const extPart = name.slice(idx + bracketSuffix.length);
  if (!extPart.startsWith('.')) return null;
  const ext = extPart.slice(1).toLowerCase();
  return PLAYLIST_MEDIA_EXTENSIONS.has(ext) ? extPart : null;
}

/** `Title [videoId].mp4` — bracketed id immediately before a known media extension. */
export function findPlayableFileName(files: readonly string[], videoId: string): string | undefined {
  const bracketSuffix = `[${videoId}]`;
  return files.find((name) => mediaExtensionSuffix(name, bracketSuffix) !== null);
}

/** Strip control chars so renderer-provided titles cannot inject M3U lines. */
export function sanitizeM3uTitle(title: string): string {
  let out = '';
  for (const ch of title) {
    const code = ch.charCodeAt(0);
    if (ch === '\r' || ch === '\n' || code < 32 || code === 127) {
      out += ' ';
    } else {
      out += ch;
    }
  }
  return out.trim();
}

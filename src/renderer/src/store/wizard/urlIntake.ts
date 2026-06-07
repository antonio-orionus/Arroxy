// URL intake helpers used before probing. Kept separate from the probe
// orchestrator so URL normalization and mixed-URL detection stay testable.

// Detect YouTube URLs that carry both `v=` (single video) and `list=` (playlist).
// yt-dlp's default for these routes Radio/Mix lists to playlist enumeration;
// users typically want the single video they clicked, so the wizard prompts.
export function isMixedYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
    if (!isYouTube) return false;
    const hasVideo = !!u.searchParams.get('v') || (host === 'youtu.be' && u.pathname.length > 1);
    return hasVideo && !!u.searchParams.get('list');
  } catch {
    return false;
  }
}

const YT_CHANNEL_TAB_NAMES = new Set(['videos', 'shorts', 'streams', 'live', 'playlists', 'community', 'about', 'featured', 'channels', 'store', 'releases', 'podcasts']);

export function rewriteYouTubeChannelRoot(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com');
    if (!isYouTube) return url;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return url;
    const isChannelRoot = (segments[0].startsWith('@') && segments.length === 1) || ((segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') && segments.length === 2);
    if (!isChannelRoot) return url;
    const lastSegment = segments[segments.length - 1].toLowerCase();
    if (YT_CHANNEL_TAB_NAMES.has(lastSegment)) return url;
    u.pathname = `${u.pathname.replace(/\/$/, '')}/videos`;
    return u.toString();
  } catch {
    return url;
  }
}

export function parseVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0] || null;
    }

    if (host.endsWith('youtube.com')) {
      return parsed.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
}

const YOUTUBE_TRACKING_PARAMS = ['feature', 'gclid', 'kw', 'si', 'pp'];

const GLOBAL_TRACKING_PARAM_PATTERNS = [/^utm_/i, /^fbclid$/i, /^_ga$/i, /^_gl$/i, /^srsltid$/i, /^msclkid$/i, /^mkt_tok$/i, /^mc_(eid|cid|tc)$/i];

function isYoutubeHost(host: string): boolean {
  return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com');
}

function shouldStrip(name: string): boolean {
  if (YOUTUBE_TRACKING_PARAMS.includes(name.toLowerCase())) return true;
  return GLOBAL_TRACKING_PARAM_PATTERNS.some((re) => re.test(name));
}

export function cleanYoutubeUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.toLowerCase();
  if (!isYoutubeHost(host)) return url;

  if (host.endsWith('youtube.com') && parsed.pathname === '/redirect') {
    const target = parsed.searchParams.get('q');
    if (target) return cleanYoutubeUrl(target);
  }

  if (host.endsWith('youtube.com') && parsed.pathname === '/signin') return url;

  const keep: [string, string][] = [];
  for (const [name, value] of parsed.searchParams) {
    if (!shouldStrip(name)) keep.push([name, value]);
  }
  parsed.search = '';
  for (const [name, value] of keep) parsed.searchParams.append(name, value);

  return parsed.toString();
}

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

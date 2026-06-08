import { cleanUrl } from './cleanUrl.js';
import type { BulkUrlKind, BulkUrlRejectReason } from './schemas.js';

export interface BulkUrlAccepted {
  url: string;
  kind: BulkUrlKind;
}

export interface BulkUrlRejected {
  id: string;
  url: string;
  reason: BulkUrlRejectReason;
}

export interface BulkUrlParseResult {
  accepted: BulkUrlAccepted[];
  rejected: BulkUrlRejected[];
  duplicateCount: number;
  ignoredCount: number;
}

const URL_RE = /https?:\/\/[^\s,;|<>"'`]+/gi;
const TRAILING_PUNCTUATION_RE = /[)\].,;:!?]+$/;

function trimUrlToken(token: string): string {
  return token.replace(TRAILING_PUNCTUATION_RE, '');
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function isYouTubeHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
}

function isSingleVideoYouTubePath(host: string, segments: string[], searchParams: URLSearchParams): boolean {
  return (host === 'youtu.be' && segments.length === 1 && !!segments[0]) || (segments[0] === 'watch' && !!searchParams.get('v')) || (segments[0] === 'shorts' && segments.length === 2 && !!segments[1]);
}

export function classifyBulkUrlKind(url: string): BulkUrlKind {
  const parsed = parseUrl(url);
  if (!parsed || !isYouTubeHost(parsed.hostname)) return 'other';

  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments[0] === 'results' && parsed.searchParams.has('search_query')) return 'search';
  if (segments[0]?.startsWith('@') || segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') return 'channel';

  if (parsed.searchParams.has('list') || segments[0] === 'playlist') return 'playlist';
  if (isSingleVideoYouTubePath(host, segments, parsed.searchParams)) return 'single';
  return 'other';
}

export function isClearlyIndividualYouTubeUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || !isYouTubeHost(parsed.hostname)) return false;
  return classifyBulkUrlKind(url) === 'single';
}

export function extractYouTubeVideoId(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed || !isYouTubeHost(parsed.hostname) || classifyBulkUrlKind(url) !== 'single') return null;

  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split('/').filter(Boolean);
  if (host === 'youtu.be') return segments[0] ?? null;
  if (segments[0] === 'watch') return parsed.searchParams.get('v');
  if (segments[0] === 'shorts') return segments[1] ?? null;
  return null;
}

export function deriveBulkUrlLabel(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const videoId = extractYouTubeVideoId(url);
  if (videoId) return `YouTube ${videoId}`;

  const path = parsed.pathname.replace(/\/+$/g, '').split('/').filter(Boolean).slice(-2).join('/');
  return path ? `${parsed.hostname}/${path}` : parsed.hostname;
}

export function parseBulkUrls(raw: string): BulkUrlParseResult {
  const accepted: BulkUrlAccepted[] = [];
  const rejected: BulkUrlRejected[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;
  let rejectedIndex = 0;

  for (const match of raw.matchAll(URL_RE)) {
    const cleaned = cleanUrl(trimUrlToken(match[0]));

    if (seen.has(cleaned)) {
      duplicateCount++;
      rejectedIndex++;
      rejected.push({ id: `rejected-${rejectedIndex}`, url: cleaned, reason: 'duplicate' });
      continue;
    }

    seen.add(cleaned);
    accepted.push({ url: cleaned, kind: classifyBulkUrlKind(cleaned) });
  }

  return {
    accepted,
    rejected,
    duplicateCount,
    ignoredCount: rejected.length
  };
}

// Shared URL resolution for the manual smoke scripts.
// Order: ARROXY_SMOKE_URL env var > --url flag > first non-comment line of
// youtube-urls.local.txt (gitignored). Throws if none of those produce a URL.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCAL_FILE_NAME = 'youtube-urls.local.txt';

function resolveLocalUrlFile(): string {
  return join(process.cwd(), LOCAL_FILE_NAME);
}

export function readUrlFromLocalFile(): string | null {
  const path = resolveLocalUrlFile();
  if (!existsSync(path)) return null;
  const content = readFileSync(path, 'utf-8');
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    return line;
  }
  return null;
}

export function resolveSmokeUrl(flagUrl?: string): string {
  const envUrl = process.env.ARROXY_SMOKE_URL?.trim();
  if (envUrl) return envUrl;
  if (flagUrl?.trim()) return flagUrl.trim();
  const fileUrl = readUrlFromLocalFile();
  if (fileUrl) return fileUrl;
  throw new Error(
    `No smoke URL configured. Provide one via ARROXY_SMOKE_URL=, the --url flag, ` +
    `or the first non-comment line of ${LOCAL_FILE_NAME} (gitignored).`
  );
}

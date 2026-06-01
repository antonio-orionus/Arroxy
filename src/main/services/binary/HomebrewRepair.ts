import { execFile } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import fsPromises from 'node:fs/promises';
import { promisify } from 'node:util';
import log from 'electron-log/main.js';
import { whereOnPath } from './BinaryProbe.js';

const execFileAsync = promisify(execFile);
const logger = log.scope('homebrew-repair');
const HOMEBREW_INSTALL_TIMEOUT_MS = 10 * 60 * 1000;

async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function firstExecutable(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate;
  }
  return null;
}

export async function installYtDlpWithHomebrew(): Promise<string> {
  if (process.platform !== 'darwin') {
    throw new Error('Homebrew repair is only available on macOS.');
  }

  const brewPath = await firstExecutable(await whereOnPath('brew'));
  if (!brewPath) {
    throw new Error('Homebrew was not found. Install Homebrew first, then retry setup.');
  }

  logger.info('Installing yt-dlp with Homebrew', { brewPath });
  await execFileAsync(brewPath, ['install', 'yt-dlp'], {
    timeout: HOMEBREW_INSTALL_TIMEOUT_MS,
    maxBuffer: 4 * 1024 * 1024,
    env: {
      ...process.env,
      NONINTERACTIVE: '1',
      HOMEBREW_NO_ANALYTICS: '1'
    }
  });

  const installed = await firstExecutable(await whereOnPath('yt-dlp'));
  if (installed) return installed;

  throw new Error('Homebrew finished, but yt-dlp was not found in Homebrew bin paths.');
}

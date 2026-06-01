import { execFile } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import fsPromises from 'node:fs/promises';
import { promisify } from 'node:util';
import log from 'electron-log/main.js';
import { whereOnPath } from './BinaryProbe.js';

const execFileAsync = promisify(execFile);
const logger = log.scope('winget-repair');
const WINGET_INSTALL_TIMEOUT_MS = 10 * 60 * 1000;

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

export async function installYtDlpWithWinget(): Promise<string> {
  if (process.platform !== 'win32') {
    throw new Error('WinGet repair is only available on Windows.');
  }

  const wingetPath = await firstExecutable(await whereOnPath('winget.exe'));
  if (!wingetPath) {
    throw new Error('WinGet was not found. Install App Installer from Microsoft Store, then retry setup.');
  }

  logger.info('Installing yt-dlp with WinGet', { wingetPath });
  await execFileAsync(wingetPath, ['install', '--id', 'yt-dlp.yt-dlp', '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements'], {
    timeout: WINGET_INSTALL_TIMEOUT_MS,
    maxBuffer: 4 * 1024 * 1024,
    windowsHide: true
  });

  const installed = await firstExecutable(await whereOnPath('yt-dlp.exe'));
  if (installed) return installed;

  throw new Error('WinGet finished, but yt-dlp was not found in WinGet links.');
}

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import log from 'electron-log/main.js';
import { firstExecutable, whereOnPath } from './BinaryProbe.js';

const execFileAsync = promisify(execFile);
const logger = log.scope('winget-repair');
const WINGET_INSTALL_TIMEOUT_MS = 10 * 60 * 1000;
const WINGET_ALREADY_INSTALLED_CODES = new Set([-1978335135, -1978334963, -1978335189, 2316632161, 2316632333, 2316632107]);

function isIdempotentWingetInstallExit(error: unknown): boolean {
  const code = (error as { code?: unknown }).code;
  return typeof code === 'number' && WINGET_ALREADY_INSTALLED_CODES.has(code);
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
  try {
    await execFileAsync(wingetPath, ['install', '--id', 'yt-dlp.yt-dlp', '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements'], {
      timeout: WINGET_INSTALL_TIMEOUT_MS,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true
    });
  } catch (error) {
    if (!isIdempotentWingetInstallExit(error)) throw error;
    logger.info('WinGet reported yt-dlp is already installed', { wingetPath, code: (error as { code?: unknown }).code });
  }

  const installed = await firstExecutable(await whereOnPath('yt-dlp.exe'));
  if (installed) return installed;

  throw new Error('WinGet finished, but yt-dlp was not found in WinGet links.');
}

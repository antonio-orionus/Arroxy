import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs, { constants as fsConstants } from 'node:fs';
import fsPromises from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
import { createAppError } from '@main/utils/errorFactory';
import type { AppError, StatusKey } from '@shared/types';
import type { LogService } from './LogService';

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void;

function parseShaLine(content: string, fileName: string): string | null {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Accept formats like: "<sha>  <filename>"
    const parts = trimmed.split(/\s+/);
    const shaCandidate = parts[0];
    const assetCandidate = parts[parts.length - 1];

    if (assetCandidate === fileName && /^[a-fA-F0-9]{64}$/.test(shaCandidate)) {
      return shaCandidate.toLowerCase();
    }
  }
  return null;
}

function resolveRedirect(baseUrl: string, next: string): string {
  if (/^https?:\/\//i.test(next)) return next;
  return new URL(next, baseUrl).toString();
}

const HTTP_TIMEOUT_MS = 30_000;

async function downloadText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = (targetUrl: string): void => {
      const req = https
        .get(targetUrl, { headers: { 'User-Agent': 'arroxy/1.0' } }, (res) => {
          if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
            request(resolveRedirect(targetUrl, res.headers.location));
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode ?? 'unknown'} while downloading text`));
            return;
          }

          let output = '';
          res.setEncoding('utf-8');
          res.on('data', (chunk) => {
            output += chunk;
          });
          res.on('end', () => resolve(output));
          res.on('error', reject);
        })
        .on('error', reject);
      req.setTimeout(HTTP_TIMEOUT_MS, () => {
        req.destroy(new Error(`HTTP request timed out after ${HTTP_TIMEOUT_MS}ms`));
      });
    };

    request(url);
  });
}

async function downloadFile(url: string, destination: string): Promise<void> {
  await fsPromises.mkdir(path.dirname(destination), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const request = (targetUrl: string): void => {
      const req = https
        .get(targetUrl, { headers: { 'User-Agent': 'arroxy/1.0' } }, async (res) => {
          try {
            if (
              res.statusCode &&
              [301, 302, 307, 308].includes(res.statusCode) &&
              res.headers.location
            ) {
              request(resolveRedirect(targetUrl, res.headers.location));
              return;
            }

            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode ?? 'unknown'} while downloading binary`));
              return;
            }

            const out = fs.createWriteStream(destination);
            await pipeline(res, out);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
      req.setTimeout(HTTP_TIMEOUT_MS, () => {
        req.destroy(new Error(`HTTP request timed out after ${HTTP_TIMEOUT_MS}ms`));
      });
    };

    request(url);
  });
}

async function sha256ForFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));
  });
}

type AssetPlatform = 'win32' | 'darwin' | 'linux';
type AssetArch = 'arm64' | 'x64';

const YT_DLP_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {
  win32:  { x64: 'yt-dlp.exe',         arm64: 'yt-dlp.exe' },
  darwin: { x64: 'yt-dlp_macos_legacy', arm64: 'yt-dlp_macos' },
  linux:  { x64: 'yt-dlp_linux',       arm64: 'yt-dlp_linux_aarch64' }
};

const FFMPEG_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {
  win32:  { x64: 'ffmpeg-win32-x64',  arm64: 'ffmpeg-win32-arm64' },
  darwin: { x64: 'ffmpeg-darwin-x64', arm64: 'ffmpeg-darwin-arm64' },
  linux:  { x64: 'ffmpeg-linux-x64',  arm64: 'ffmpeg-linux-arm64' }
};

function currentAssetTarget(): { platform: AssetPlatform; arch: AssetArch } | null {
  const platform = process.platform;
  if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') return null;
  const arch: AssetArch = process.arch === 'arm64' ? 'arm64' : 'x64';
  return { platform, arch };
}

function ytDlpAssetName(): string {
  const target = currentAssetTarget();
  if (!target) return 'yt-dlp_linux';
  return YT_DLP_ASSETS[target.platform][target.arch];
}

function ffmpegAssetName(): string | null {
  const target = currentAssetTarget();
  if (!target) return null;
  return FFMPEG_ASSETS[target.platform][target.arch];
}

interface EnsureBinaryConfig {
  name: string;
  destinationPath: string;
  downloadUrl: string;
  expectedSha256?: () => Promise<string | null>;
  onStatus?: StatusReporter;
  requiredChecksum?: boolean;
  isUpToDate?: () => Promise<boolean>;
}

export class BinaryManager {
  private readonly cacheDir: string;

  private readonly logger: LogService;

  private readonly retryDelays: [number, number];

  private readonly inProgress = new Map<string, Promise<void>>();

  constructor(userDataPath: string, logger: LogService, retryDelays: [number, number] = [2000, 8000]) {
    this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries');
    this.logger = logger;
    this.retryDelays = retryDelays;
  }

  getYtDlpPath(): string {
    return process.env.ARROXY_YT_DLP_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  }

  getFfmpegPath(): string {
    return process.env.ARROXY_FFMPEG_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  }

  async ensureYtDlp(onStatus?: StatusReporter): Promise<string> {
    const override = process.env.ARROXY_YT_DLP_PATH;
    if (override && await this.isUsableBinary(override)) {
      this.logger.log('INFO', 'Using pre-installed yt-dlp', { path: override });
      return override;
    }

    const assetName = ytDlpAssetName();
    const expectedSha256 = async (): Promise<string | null> => {
      const sumsUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS';
      const sumsFile = await downloadText(sumsUrl);
      return parseShaLine(sumsFile, assetName);
    };

    const targetPath = this.getYtDlpPath();
    await this.ensureBinary({
      name: 'yt-dlp',
      destinationPath: targetPath,
      downloadUrl: `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`,
      expectedSha256,
      onStatus,
      requiredChecksum: true,
      isUpToDate: () => this.isYtDlpUpToDate(targetPath)
    });

    return targetPath;
  }

  async ensureFFmpeg(onStatus?: StatusReporter): Promise<string | null> {
    const override = process.env.ARROXY_FFMPEG_PATH;
    if (override && await this.isUsableBinary(override)) {
      this.logger.log('INFO', 'Using pre-installed ffmpeg', { path: override });
      return override;
    }

    const assetName = ffmpegAssetName();
    if (!assetName) return null;

    const targetPath = this.getFfmpegPath();
    const checksumUrl = `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/${assetName}.sha256`;

    const expectedSha256 = async (): Promise<string | null> => {
      try {
        const checksumText = await downloadText(checksumUrl);
        const firstToken = checksumText.trim().split(/\s+/)[0];
        if (/^[a-fA-F0-9]{64}$/.test(firstToken)) return firstToken.toLowerCase();
        return null;
      } catch {
        return null;
      }
    };

    await this.ensureBinary({
      name: 'ffmpeg',
      destinationPath: targetPath,
      downloadUrl: `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/${assetName}`,
      expectedSha256,
      onStatus,
      requiredChecksum: false
    });

    return targetPath;
  }

  private async ensureBinary(config: EnsureBinaryConfig): Promise<void> {
    const { destinationPath, name } = config;

    if (await this.isUsableBinary(destinationPath)) {
      const upToDate = !config.isUpToDate || (await config.isUpToDate());
      if (upToDate) {
        this.logger.log('INFO', `${name} binary already exists`, { destinationPath });
        return;
      }
      this.logger.log('INFO', `${name} binary is outdated, re-downloading`);
    }

    const existing = this.inProgress.get(destinationPath);
    if (existing) return existing;

    const promise = this.downloadBinary(config).finally(() => {
      this.inProgress.delete(destinationPath);
    });
    this.inProgress.set(destinationPath, promise);
    return promise;
  }

  private async downloadBinary(config: EnsureBinaryConfig): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.attemptDownload(config);
        return;
      } catch (err) {
        const isChecksumError = err instanceof Error && err.message.toLowerCase().includes('checksum');
        if (isChecksumError || attempt === maxAttempts) throw err;
        const delay = attempt === 1 ? this.retryDelays[0] : this.retryDelays[1];
        this.logger.log('WARN', `${config.name} download failed, retrying in ${delay}ms`, {
          attempt,
          error: err instanceof Error ? err.message : String(err)
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  private async attemptDownload(config: EnsureBinaryConfig): Promise<void> {
    const { destinationPath, name, downloadUrl, expectedSha256, onStatus, requiredChecksum = false } = config;

    const tempPath = `${destinationPath}.tmp`;
    onStatus?.('downloadingBinary', { name });
    this.logger.log('INFO', `Downloading ${name}`, { downloadUrl, destinationPath });

    await downloadFile(downloadUrl, tempPath);

    if (expectedSha256) {
      const expected = await expectedSha256();
      if (!expected && requiredChecksum) {
        await fsPromises.rm(tempPath, { force: true });
        throw this.toBinaryError(
          `Checksum source unavailable for ${name}. Refusing to use unverified binary.`
        );
      }

      if (expected) {
        const actual = await sha256ForFile(tempPath);
        if (actual !== expected) {
          await fsPromises.rm(tempPath, { force: true });
          throw this.toBinaryError(
            `${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`
          );
        }
      } else {
        this.logger.log('WARN', `Checksum unavailable for ${name}, proceeding without verification`);
      }
    }

    await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fsPromises.rename(tempPath, destinationPath);

    if (process.platform !== 'win32') {
      await fsPromises.chmod(destinationPath, 0o755);
    }
  }

  private async isYtDlpUpToDate(binaryPath: string): Promise<boolean> {
    const [local, remote] = await Promise.all([
      this.getLocalYtDlpVersion(binaryPath),
      this.getRemoteYtDlpVersion()
    ]);
    if (!local) return false;
    if (!remote) {
      this.logger.log('WARN', 'Could not fetch yt-dlp remote version, skipping update check');
      return true;
    }
    if (local !== remote) {
      this.logger.log('INFO', 'yt-dlp update available', { local, remote });
      return false;
    }
    this.logger.log('INFO', 'yt-dlp is up to date', { version: local });
    return true;
  }

  private async getLocalYtDlpVersion(binaryPath: string): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync(binaryPath, ['--version']);
      return stdout.trim();
    } catch {
      return null;
    }
  }

  private async getRemoteYtDlpVersion(): Promise<string | null> {
    try {
      const json = await downloadText('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest');
      const parsed = JSON.parse(json) as { tag_name?: string };
      return parsed.tag_name ?? null;
    } catch {
      return null;
    }
  }

  private async isUsableBinary(binaryPath: string): Promise<boolean> {
    try {
      const mode = process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK;
      await fsPromises.access(binaryPath, mode);
      return true;
    } catch {
      return false;
    }
  }

  private toBinaryError(message: string): AppError {
    return createAppError('binary', message);
  }
}

export const binaryInternals = {
  parseShaLine,
  ytDlpAssetName,
  ffmpegAssetName,
  sha256ForFile
};

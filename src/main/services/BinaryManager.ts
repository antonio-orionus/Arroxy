import { createHash } from 'node:crypto';
import fs, { constants as fsConstants } from 'node:fs';
import fsPromises from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createAppError } from '@main/utils/errorFactory';
import type { AppError } from '@shared/types';
import type { LogService } from './LogService';

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

async function downloadText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = (targetUrl: string): void => {
      https
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
    };

    request(url);
  });
}

async function downloadFile(url: string, destination: string): Promise<void> {
  await fsPromises.mkdir(path.dirname(destination), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const request = (targetUrl: string): void => {
      https
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

function ytDlpAssetName(): string {
  if (process.platform === 'win32') return 'yt-dlp.exe';
  if (process.platform === 'darwin') {
    return process.arch === 'arm64' ? 'yt-dlp_macos' : 'yt-dlp_macos_legacy';
  }
  return process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
}

function ffmpegAssetName(): string | null {
  if (process.platform === 'win32') return process.arch === 'arm64' ? 'ffmpeg-win32-arm64' : 'ffmpeg-win32-x64';
  if (process.platform === 'darwin') return process.arch === 'arm64' ? 'ffmpeg-darwin-arm64' : 'ffmpeg-darwin-x64';
  if (process.platform === 'linux') return process.arch === 'arm64' ? 'ffmpeg-linux-arm64' : 'ffmpeg-linux-x64';
  return null;
}

interface EnsureBinaryConfig {
  name: string;
  destinationPath: string;
  downloadUrl: string;
  expectedSha256?: () => Promise<string | null>;
  onStatus?: (message: string) => void;
  requiredChecksum?: boolean;
}

export class BinaryManager {
  private readonly cacheDir: string;

  private readonly logger: LogService;

  private readonly inProgress = new Map<string, Promise<void>>();

  constructor(userDataPath: string, logger: LogService) {
    this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries');
    this.logger = logger;
  }

  getYtDlpPath(): string {
    return path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  }

  getFfmpegPath(): string {
    return path.join(this.cacheDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  }

  async ensureYtDlp(onStatus?: (message: string) => void): Promise<string> {
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
      requiredChecksum: true
    });

    return targetPath;
  }

  async ensureFFmpeg(onStatus?: (message: string) => void): Promise<string | null> {
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
      this.logger.log('INFO', `${name} binary already exists`, { destinationPath });
      return;
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
    const { destinationPath, name, downloadUrl, expectedSha256, onStatus, requiredChecksum = false } = config;

    const tempPath = `${destinationPath}.tmp`;
    onStatus?.(`Downloading ${name} binary...`);
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

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs, { constants as fsConstants } from 'node:fs';
import fsPromises from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import extractZip from 'extract-zip';
import log from 'electron-log/main';

const execFileAsync = promisify(execFile);
import { trackMain } from '@main/services/analytics';
import type { StatusKey } from '@shared/types';

const logger = log.scope('binary');

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void;

function binaryPhase(err: unknown): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  if (msg.includes('checksum')) return 'verify';
  if (msg.includes('archive') || msg.includes('did not contain') || msg.includes('extract')) return 'extract';
  return 'download';
}

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
        .get(targetUrl, { headers: { 'User-Agent': 'arroxy/1.0' } }, (res) => {
          if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
            request(resolveRedirect(targetUrl, res.headers.location));
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode ?? 'unknown'} while downloading binary`));
            return;
          }

          const out = fs.createWriteStream(destination);
          pipeline(res, out).then(resolve, (error: unknown) => {
            reject(error instanceof Error ? error : new Error(String(error)));
          });
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
  win32: { x64: 'yt-dlp.exe', arm64: 'yt-dlp.exe' },
  darwin: { x64: 'yt-dlp_macos_legacy', arm64: 'yt-dlp_macos' },
  linux: { x64: 'yt-dlp_linux', arm64: 'yt-dlp_linux_aarch64' }
};

const FFMPEG_ASSETS: Record<AssetPlatform, Record<AssetArch, string>> = {
  win32: { x64: 'ffmpeg-win32-x64', arm64: 'ffmpeg-win32-arm64' },
  darwin: { x64: 'ffmpeg-darwin-x64', arm64: 'ffmpeg-darwin-arm64' },
  linux: { x64: 'ffmpeg-linux-x64', arm64: 'ffmpeg-linux-arm64' }
};

// Deno releases ship as ZIPs named deno-<rust-target>.zip on the GitHub release
// page. The archive contains a single binary (deno or deno.exe).
// Note: Windows ARM64 has no official deno build yet — null falls back to no JS runtime.
const DENO_ASSETS: Record<AssetPlatform, Record<AssetArch, string | null>> = {
  win32: { x64: 'x86_64-pc-windows-msvc', arm64: null },
  darwin: { x64: 'x86_64-apple-darwin', arm64: 'aarch64-apple-darwin' },
  linux: { x64: 'x86_64-unknown-linux-gnu', arm64: 'aarch64-unknown-linux-gnu' }
};

// ffprobe is shipped alongside ffmpeg in the canonical FFmpeg distributions.
// We pull it at runtime instead of bundling via @ffprobe-installer/* npm
// optional deps, which were unreliable on cross-platform CI: bun's frozen
// lockfile sometimes skips the host-platform optional, and electron-builder
// can't unpack what was never installed.
//
// - Win/Linux: BtbN/FFmpeg-Builds — single `latest` rolling tag, archives
//   contain bin/ffprobe(.exe). Linux is .tar.xz (extracted via system tar).
// - macOS: evermeet.cx — ships ffprobe as a standalone .zip; the
//   /getrelease/ffprobe/zip endpoint redirects to the latest version.
type FfprobeArchive = { source: 'btbn'; archive: string; format: 'zip' | 'tar.xz' } | { source: 'evermeet'; format: 'zip' };

const FFPROBE_ASSETS: Record<AssetPlatform, Record<AssetArch, FfprobeArchive | null>> = {
  win32: {
    x64: { source: 'btbn', archive: 'ffmpeg-master-latest-win64-gpl.zip', format: 'zip' },
    arm64: null
  },
  linux: {
    x64: { source: 'btbn', archive: 'ffmpeg-master-latest-linux64-gpl.tar.xz', format: 'tar.xz' },
    arm64: { source: 'btbn', archive: 'ffmpeg-master-latest-linuxarm64-gpl.tar.xz', format: 'tar.xz' }
  },
  darwin: {
    x64: { source: 'evermeet', format: 'zip' },
    arm64: { source: 'evermeet', format: 'zip' }
  }
};

function ffprobeAsset(): FfprobeArchive | null {
  const target = currentAssetTarget();
  if (!target) return null;
  return FFPROBE_ASSETS[target.platform][target.arch];
}

function ffprobeDownloadUrl(asset: FfprobeArchive): string {
  if (asset.source === 'btbn') {
    return `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/${asset.archive}`;
  }
  return 'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip';
}

function ffprobeExecutableName(): string {
  return process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
}

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

function denoAssetTarget(): string | null {
  const target = currentAssetTarget();
  if (!target) return null;
  return DENO_ASSETS[target.platform][target.arch];
}

function denoAssetName(): string | null {
  const target = denoAssetTarget();
  return target ? `deno-${target}.zip` : null;
}

function denoExecutableName(): string {
  return process.platform === 'win32' ? 'deno.exe' : 'deno';
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

  private readonly retryDelays: [number, number];

  private readonly inProgress = new Map<string, Promise<void>>();

  constructor(userDataPath: string, retryDelays: [number, number] = [2000, 8000]) {
    this.cacheDir = path.join(userDataPath, 'runtime-cache', 'binaries');
    this.retryDelays = retryDelays;
  }

  getYtDlpPath(): string {
    return process.env.ARROXY_YT_DLP_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  }

  getFfmpegPath(): string {
    return process.env.ARROXY_FFMPEG_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  }

  getDenoPath(): string {
    return process.env.ARROXY_DENO_PATH ?? path.join(this.cacheDir, denoExecutableName());
  }

  getFfprobePath(): string {
    return process.env.ARROXY_FFPROBE_PATH ?? path.join(this.cacheDir, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
  }

  async ensureYtDlp(onStatus?: StatusReporter): Promise<string> {
    const override = process.env.ARROXY_YT_DLP_PATH;
    if (override && (await this.isUsableBinary(override))) {
      logger.info('Using pre-installed yt-dlp', { path: override });
      return override;
    }

    const assetName = ytDlpAssetName();
    const expectedSha256 = async (): Promise<string | null> => {
      const sumsUrl = 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/SHA2-256SUMS';
      const sumsFile = await downloadText(sumsUrl);
      return parseShaLine(sumsFile, assetName);
    };

    const targetPath = this.getYtDlpPath();
    try {
      await this.ensureBinary({
        name: 'yt-dlp',
        destinationPath: targetPath,
        downloadUrl: `https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/${assetName}`,
        expectedSha256,
        onStatus,
        requiredChecksum: true,
        isUpToDate: () => this.isYtDlpUpToDate(targetPath)
      });
    } catch (err) {
      trackMain('binary_setup_failed', { binary: 'ytdlp', phase: binaryPhase(err) });
      throw err;
    }

    return targetPath;
  }

  // ffprobe is required by yt-dlp's post-processing (chapter modification,
  // SponsorBlock-remove, embed-thumbnail, --add-metadata) to read media
  // duration. Downloaded at runtime from the canonical FFmpeg distributions
  // (BtbN for Win/Linux, evermeet.cx for macOS) and cached under
  // runtime-cache/binaries/ so it lives next to ffmpeg — this way
  // spawnYtDlp's existing PATH injection finds both with one PATH entry.
  // Returns null if the platform/arch has no upstream build; the caller
  // tolerates this (ffprobe is only needed by certain post-processors).
  async ensureFFprobe(onStatus?: StatusReporter): Promise<string | null> {
    const override = process.env.ARROXY_FFPROBE_PATH;
    if (override && (await this.isUsableBinary(override))) {
      logger.info('Using pre-installed ffprobe', { path: override });
      return override;
    }

    const asset = ffprobeAsset();
    if (!asset) {
      logger.warn('No ffprobe build for this platform/arch, postprocessing may fail');
      return null;
    }

    const targetPath = this.getFfprobePath();
    if (await this.isUsableBinary(targetPath)) {
      logger.info('ffprobe binary already exists', { destinationPath: targetPath });
      return targetPath;
    }

    const downloadUrl = ffprobeDownloadUrl(asset);
    const innerName = ffprobeExecutableName();

    try {
      if (asset.format === 'zip') {
        await this.ensureZippedBinary({
          name: 'ffprobe',
          downloadUrl,
          zipFileName: asset.source === 'btbn' ? asset.archive : 'ffprobe.zip',
          innerExecutableName: innerName,
          destinationPath: targetPath,
          // BtbN and evermeet.cx don't publish per-asset SHA256s on a stable
          // URL alongside the artifact (BtbN signs with PGP; evermeet uses
          // signed JSON metadata). Skipping checksum is consistent with how
          // ffmpeg's checksum is treated as best-effort.
          expectedSha256: () => Promise.resolve(null),
          onStatus
        });
      } else {
        await this.ensureTarXzBinary({
          name: 'ffprobe',
          downloadUrl,
          archiveFileName: (asset as { archive: string }).archive,
          innerExecutableName: innerName,
          destinationPath: targetPath,
          onStatus
        });
      }
    } catch (err) {
      trackMain('binary_setup_failed', { binary: 'ffprobe', phase: binaryPhase(err) });
      logger.warn('Failed to bundle ffprobe, postprocessing may fail', {
        error: err instanceof Error ? err.message : String(err)
      });
      return null;
    }

    return targetPath;
  }

  // Linux BtbN ffmpeg builds ship as .tar.xz, which Node has no built-in
  // extractor for. We shell out to system `tar` (always present on Linux/
  // macOS, ships with Win10 1803+ but we use zip on Windows). xz support
  // in `tar` is provided by xz-utils, also ubiquitous on modern distros.
  private async ensureTarXzBinary(config: { name: string; downloadUrl: string; archiveFileName: string; innerExecutableName: string; destinationPath: string; onStatus?: StatusReporter }): Promise<void> {
    const { destinationPath, name, onStatus } = config;

    const existing = this.inProgress.get(destinationPath);
    if (existing) return existing;

    const promise = (async (): Promise<void> => {
      const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), `arroxy-${name}-`));
      const archivePath = path.join(tempDir, config.archiveFileName);

      try {
        onStatus?.('downloadingBinary', { name });
        logger.info(`Downloading ${name}`, {
          downloadUrl: config.downloadUrl,
          destinationPath
        });

        await downloadFile(config.downloadUrl, archivePath);

        const extractDir = path.join(tempDir, 'unpacked');
        await fsPromises.mkdir(extractDir, { recursive: true });
        await execFileAsync('tar', ['-xJf', archivePath, '-C', extractDir]);

        const innerPath = await this.findExecutableInTree(extractDir, config.innerExecutableName);
        if (!innerPath) {
          throw new Error(`${name} archive did not contain ${config.innerExecutableName}`);
        }

        await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });
        await fsPromises.copyFile(innerPath, destinationPath);
        await fsPromises.chmod(destinationPath, 0o755);
      } finally {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
      }
    })().finally(() => {
      this.inProgress.delete(destinationPath);
    });

    this.inProgress.set(destinationPath, promise);
    return promise;
  }

  // Deno is the JS runtime yt-dlp uses for nsig/signature decoding on the web
  // client. Without it, yt-dlp silently drops every JS-needing client and
  // falls back to android_vr — which our PoT (bound to web.gvs) can't help.
  // Returns null when:
  //   - the platform/arch has no upstream deno build (Windows ARM64), or
  //   - download/extraction failed for any reason.
  // The caller (YtDlp) treats null as "skip --js-runtimes" rather than failing
  // the download. Bot-block fallbacks still cover us.
  async ensureDeno(onStatus?: StatusReporter): Promise<string | null> {
    const override = process.env.ARROXY_DENO_PATH;
    if (override && (await this.isUsableBinary(override))) {
      logger.info('Using pre-installed deno', { path: override });
      return override;
    }

    const assetName = denoAssetName();
    if (!assetName) {
      logger.info('No deno build for this platform/arch, skipping');
      return null;
    }

    const targetPath = this.getDenoPath();
    if (await this.isUsableBinary(targetPath)) {
      logger.info('deno binary already exists', { destinationPath: targetPath });
      return targetPath;
    }

    const downloadUrl = `https://github.com/denoland/deno/releases/latest/download/${assetName}`;
    const checksumUrl = `${downloadUrl}.sha256sum`;

    try {
      await this.ensureZippedBinary({
        name: 'deno',
        downloadUrl,
        zipFileName: assetName,
        innerExecutableName: denoExecutableName(),
        destinationPath: targetPath,
        expectedSha256: async () => {
          try {
            const checksumText = await downloadText(checksumUrl);
            return (
              parseShaLine(checksumText, assetName) ??
              (() => {
                const firstToken = checksumText.trim().split(/\s+/)[0];
                return /^[a-fA-F0-9]{64}$/.test(firstToken) ? firstToken.toLowerCase() : null;
              })()
            );
          } catch {
            return null;
          }
        },
        onStatus
      });
      return targetPath;
    } catch (err) {
      trackMain('binary_setup_failed', { binary: 'deno', phase: binaryPhase(err) });
      logger.warn('Failed to bundle deno, continuing without JS runtime', {
        error: err instanceof Error ? err.message : String(err)
      });
      return null;
    }
  }

  async ensureFFmpeg(onStatus?: StatusReporter): Promise<string | null> {
    const override = process.env.ARROXY_FFMPEG_PATH;
    if (override && (await this.isUsableBinary(override))) {
      logger.info('Using pre-installed ffmpeg', { path: override });
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

    try {
      await this.ensureBinary({
        name: 'ffmpeg',
        destinationPath: targetPath,
        downloadUrl: `https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/${assetName}`,
        expectedSha256,
        onStatus,
        requiredChecksum: false
      });
    } catch (err) {
      trackMain('binary_setup_failed', { binary: 'ffmpeg', phase: binaryPhase(err) });
      throw err;
    }

    return targetPath;
  }

  private async ensureZippedBinary(config: { name: string; downloadUrl: string; zipFileName: string; innerExecutableName: string; destinationPath: string; expectedSha256: () => Promise<string | null>; onStatus?: StatusReporter }): Promise<void> {
    const { destinationPath, name, onStatus } = config;

    const existing = this.inProgress.get(destinationPath);
    if (existing) return existing;

    const promise = (async (): Promise<void> => {
      const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), `arroxy-${name}-`));
      const zipPath = path.join(tempDir, config.zipFileName);

      try {
        onStatus?.('downloadingBinary', { name });
        logger.info(`Downloading ${name}`, {
          downloadUrl: config.downloadUrl,
          destinationPath
        });

        await downloadFile(config.downloadUrl, zipPath);

        const expected = await config.expectedSha256();
        if (expected) {
          const actual = await sha256ForFile(zipPath);
          if (actual !== expected) {
            throw new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`);
          }
        } else {
          logger.warn(`Checksum unavailable for ${name}, proceeding without verification`);
        }

        const extractDir = path.join(tempDir, 'unpacked');
        await fsPromises.mkdir(extractDir, { recursive: true });
        await extractZip(zipPath, { dir: extractDir });

        const innerPath = await this.findExecutableInTree(extractDir, config.innerExecutableName);
        if (!innerPath) {
          throw new Error(`${name} archive did not contain ${config.innerExecutableName}`);
        }

        await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });
        // copyFile (rather than rename) handles cross-device temp dirs.
        await fsPromises.copyFile(innerPath, destinationPath);
        if (process.platform !== 'win32') {
          await fsPromises.chmod(destinationPath, 0o755);
        }
      } finally {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
      }
    })().finally(() => {
      this.inProgress.delete(destinationPath);
    });

    this.inProgress.set(destinationPath, promise);
    return promise;
  }

  private async findExecutableInTree(root: string, name: string): Promise<string | null> {
    const entries = await fsPromises.readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(root, entry.name);
      if (entry.isDirectory()) {
        const nested = await this.findExecutableInTree(full, name);
        if (nested) return nested;
      } else if (entry.isFile() && entry.name === name) {
        return full;
      }
    }
    return null;
  }

  private async ensureBinary(config: EnsureBinaryConfig): Promise<void> {
    const { destinationPath, name } = config;

    if (await this.isUsableBinary(destinationPath)) {
      const upToDate = !config.isUpToDate || (await config.isUpToDate());
      if (upToDate) {
        logger.info(`${name} binary already exists`, { destinationPath });
        return;
      }
      logger.info(`${name} binary is outdated, re-downloading`);
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
        logger.warn(`${config.name} download failed, retrying in ${delay}ms`, {
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
    logger.info(`Downloading ${name}`, { downloadUrl, destinationPath });

    await downloadFile(downloadUrl, tempPath);

    if (expectedSha256) {
      const expected = await expectedSha256();
      if (!expected && requiredChecksum) {
        await fsPromises.rm(tempPath, { force: true });
        throw new Error(`Checksum source unavailable for ${name}. Refusing to use unverified binary.`);
      }

      if (expected) {
        const actual = await sha256ForFile(tempPath);
        if (actual !== expected) {
          await fsPromises.rm(tempPath, { force: true });
          throw new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`);
        }
      } else {
        logger.warn(`Checksum unavailable for ${name}, proceeding without verification`);
      }
    }

    await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fsPromises.rename(tempPath, destinationPath);

    if (process.platform !== 'win32') {
      await fsPromises.chmod(destinationPath, 0o755);
    }
  }

  private async isYtDlpUpToDate(binaryPath: string): Promise<boolean> {
    const [local, remote] = await Promise.all([this.getLocalYtDlpVersion(binaryPath), this.getRemoteYtDlpVersion()]);
    if (!local) return false;
    if (!remote) {
      logger.warn('Could not fetch yt-dlp remote version, skipping update check');
      return true;
    }
    if (local !== remote) {
      logger.info('yt-dlp update available', { local, remote });
      return false;
    }
    logger.info('yt-dlp is up to date', { version: local });
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
      const json = await downloadText('https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest');
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
}

export const binaryInternals = {
  parseShaLine,
  ytDlpAssetName,
  ffmpegAssetName,
  denoAssetName,
  denoAssetTarget,
  denoExecutableName,
  sha256ForFile
};

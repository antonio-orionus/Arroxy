import type { LogService } from '@main/services/LogService';
import { createAppError } from '@main/utils/errorFactory';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, friendlyMessage } from '@main/utils/ytdlpErrors';
import { ok, fail, type Result } from '@shared/result';
import { sortFormatsByQuality } from '@shared/qualitySorter';
import type { FormatOption, GetFormatsOutput } from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';

interface YtDlpFormat {
  format_id?: string;
  ext?: string;
  resolution?: string;
  format_note?: string;
  fps?: number;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
}

interface YtDlpInfo {
  formats?: YtDlpFormat[];
  title?: string;
  thumbnail?: string;
  duration?: number;
}


export function mapFormats(info: YtDlpInfo): FormatOption[] {
  const formats = info.formats ?? [];

  const mapped = formats
    .filter((item) => item.vcodec !== 'none' && item.format_id)
    .map((item) => {
      const resolution = item.resolution ?? item.format_note ?? 'unknown';
      const ext = item.ext ?? 'unknown';
      const fps = item.fps;
      const filesize = item.filesize;
      const isVideoOnly = item.acodec === 'none';
      const formatId = item.format_id ?? '';
      const details = [resolution, ext, fps ? `${fps}fps` : null, filesize ? humanSize(filesize) : null]
        .filter(Boolean)
        .join(' | ');

      return {
        formatId,
        label: details,
        ext,
        resolution,
        fps,
        filesize,
        isVideoOnly
      } satisfies FormatOption;
    });

  return sortFormatsByQuality(mapped);
}

function humanSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;

  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }

  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export class FormatProbeService {
  constructor(
    private readonly binaryManager: BinaryManager,
    private readonly tokenService: TokenService,
    private readonly logger: LogService,
    private readonly mockMode = false
  ) {}

  async getFormats(url: string): Promise<Result<GetFormatsOutput>> {
    try {
      if (this.mockMode) {
        return ok({
          formats: [
            { formatId: '137', label: '1080p | mp4 | 30fps', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true },
            { formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false },
            { formatId: '18', label: '360p | mp4 | 30fps', ext: 'mp4', resolution: '360p', fps: 30, filesize: 150_000_000, isVideoOnly: false }
          ],
          title: 'Mock Video Title',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 212
        });
      }

      this.logger.log('INFO', 'Format probe started', { url });
      const ytDlpPath = await this.binaryManager.ensureYtDlp();
      const ffmpegPath = await this.binaryManager.ensureFFmpeg();

      return await this.runProbe(url, ytDlpPath, ffmpegPath, false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown format probing error';
      this.logger.log('ERROR', 'Format probe failure', { message, url });
      return fail(createAppError('download', message));
    }
  }

  private async runProbe(
    url: string,
    ytDlpPath: string,
    ffmpegPath: string | null,
    isRetry: boolean
  ): Promise<Result<GetFormatsOutput>> {
    const { token, visitorData } = await this.tokenService.mintTokenForUrl(url);
    const extractorArgs = `youtube:po_token=web.gvs+${token}${visitorData ? `;visitor_data=${visitorData}` : ''}`;

    const args = [
      '--extractor-args',
      extractorArgs,
      '--dump-json',
      '--no-playlist',
      url
    ];

    this.logger.log('INFO', 'yt-dlp format probe spawned', { url, isRetry });

    return new Promise((resolve) => {
      const proc = spawnYtDlp(ytDlpPath, args, ffmpegPath);
      let stdout = '';
      let stderrBuf = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString() as string;
        stderrBuf += text;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          this.logger.log('INFO', line, { source: 'yt-dlp-format-probe' });
        }
      });

      proc.on('error', (error) => {
        this.logger.log('ERROR', 'yt-dlp format probe spawn error', { message: error.message, url });
        resolve(fail(createAppError('download', `yt-dlp failed to start: ${error.message}`)));
      });

      proc.on('close', async (code) => {
        if (code !== 0) {
          const signal = classifyStderr(stderrBuf);

          if (signal === 'bot_block' && !isRetry) {
            this.logger.log('INFO', 'Bot block detected in format probe — re-minting token', { url });
            this.tokenService.invalidateCache();
            resolve(await this.runProbe(url, ytDlpPath, ffmpegPath, true));
            return;
          }

          const message = signal
            ? friendlyMessage(signal)
            : (extractLastError(stderrBuf) ?? `yt-dlp format probing failed with exit code ${code ?? -1}`);
          this.logger.log('ERROR', 'yt-dlp format probe failed', { code, url, signal });
          resolve(fail(createAppError('download', message)));
          return;
        }

        try {
          const parsed = JSON.parse(stdout) as YtDlpInfo;
          const formats = mapFormats(parsed);
          this.logger.log('INFO', 'Format probe complete', { url, title: parsed.title, formatCount: formats.length });
          resolve(ok({
            formats,
            title: parsed.title ?? '',
            thumbnail: parsed.thumbnail ?? '',
            duration: typeof parsed.duration === 'number' ? Math.round(parsed.duration) : undefined
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown JSON parse error';
          this.logger.log('ERROR', 'Format probe JSON parse failed', { message, url });
          resolve(fail(createAppError('download', 'Failed to parse format list', message)));
        }
      });
    });
  }
}

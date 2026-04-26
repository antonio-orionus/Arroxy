import type { LogService } from '@main/services/LogService';
import { createAppError } from '@main/utils/errorFactory';
import { splitStderrLines } from '@main/utils/process';
import { ok, fail, type Result } from '@shared/result';
import { sortFormatsByQuality } from '@shared/qualitySorter';
import { humanSize } from '@shared/format';
import type { FormatOption, GetFormatsOutput } from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { TokenService } from './TokenService';
import { runYtDlp } from './ytDlpRunner';

interface YtDlpFormat {
  format_id?: string;
  ext?: string;
  resolution?: string;
  format_note?: string;
  fps?: number;
  abr?: number;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  dynamic_range?: string;
}

interface YtDlpInfo {
  formats?: YtDlpFormat[];
  title?: string;
  thumbnail?: string;
  duration?: number;
}

function friendlyCodec(acodec: string): string {
  if (acodec === 'opus') return 'Opus';
  if (acodec.startsWith('mp4a')) return 'AAC';
  return acodec;
}

export function mapFormats(info: YtDlpInfo): FormatOption[] {
  const formats = info.formats ?? [];

  const mapped = formats
    .filter((item) => item.format_id && item.ext !== 'mhtml')
    .filter((item) => item.vcodec !== 'none' || (item.acodec && item.acodec !== 'none'))
    .map((item) => {
      const isAudioOnly = item.vcodec === 'none';
      const ext = item.ext ?? 'unknown';
      const filesize = item.filesize;
      const formatId = item.format_id ?? '';

      if (isAudioOnly) {
        const abr = item.abr;
        const codec = friendlyCodec(item.acodec ?? '');
        const details = [ext, codec, abr ? `${Math.round(abr)} kbps` : null, filesize ? humanSize(filesize) : null]
          .filter(Boolean)
          .join(' · ');
        return {
          formatId,
          label: details,
          ext,
          resolution: 'audio only',
          abr,
          filesize,
          isVideoOnly: false,
          isAudioOnly: true,
          dynamicRange: undefined
        } satisfies FormatOption;
      }

      const resolution = item.resolution ?? item.format_note ?? 'unknown';
      const fps = item.fps;
      const isVideoOnly = item.acodec === 'none';
      const dynamicRange = item.dynamic_range && item.dynamic_range !== 'SDR' ? item.dynamic_range : undefined;
      const details = [resolution, ext, fps ? `${fps}fps` : null, dynamicRange ?? null, filesize ? humanSize(filesize) : null]
        .filter(Boolean)
        .join(' | ');

      return {
        formatId,
        label: details,
        ext,
        resolution,
        fps,
        filesize,
        isVideoOnly,
        isAudioOnly: false,
        dynamicRange
      } satisfies FormatOption;
    });

  return sortFormatsByQuality(mapped);
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
            { formatId: '137', label: '1080p | mp4 | 30fps', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true, isAudioOnly: false },
            { formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false },
            { formatId: '18', label: '360p | mp4 | 30fps', ext: 'mp4', resolution: '360p', fps: 30, filesize: 150_000_000, isVideoOnly: false, isAudioOnly: false }
          ],
          title: 'Mock Video Title',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 212
        });
      }

      this.logger.log('INFO', 'Format probe started', { url });
      const ytDlpPath = await this.binaryManager.ensureYtDlp();
      const ffmpegPath = await this.binaryManager.ensureFFmpeg();

      const result = await runYtDlp({
        url,
        ytDlpPath,
        ffmpegPath,
        args: ['--dump-json', '--no-playlist', url],
        tokenService: this.tokenService,
        onStderr: (chunk) => {
          for (const line of splitStderrLines(chunk)) {
            this.logger.log('INFO', line, { source: 'yt-dlp-format-probe' });
          }
        }
      });

      if (result.exitCode !== 0) {
        this.logger.log('ERROR', 'yt-dlp format probe failed', { code: result.exitCode, url, signal: result.errorClass });
        return fail(createAppError('download', result.message ?? 'Format probing failed'));
      }

      try {
        const parsed = JSON.parse(result.stdout) as YtDlpInfo;
        const formats = mapFormats(parsed);
        this.logger.log('INFO', 'Format probe complete', { url, title: parsed.title, formatCount: formats.length });
        return ok({
          formats,
          title: parsed.title ?? '',
          thumbnail: parsed.thumbnail ?? '',
          duration: typeof parsed.duration === 'number' ? Math.round(parsed.duration) : undefined
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown JSON parse error';
        this.logger.log('ERROR', 'Format probe JSON parse failed', { message, url });
        return fail(createAppError('download', 'Failed to parse format list', message));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown format probing error';
      this.logger.log('ERROR', 'Format probe failure', { message, url });
      return fail(createAppError('download', message));
    }
  }
}

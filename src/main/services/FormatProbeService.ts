import log from 'electron-log/main';
import { trackMain, probeDurationBucket } from '@main/services/analytics';

const logger = log.scope('probe');
import { createAppError } from '@main/utils/errorFactory';
import { splitStderrLines } from '@main/utils/process';
import { ok, fail, type Result } from '@shared/result';
import { sortFormatsByQuality } from '@shared/qualitySorter';
import { humanSize } from '@shared/format';
import type { FormatOption, GetFormatsOutput, SubtitleMap } from '@shared/types';
import { ytDlpInfoSchema, type YtDlpInfo, type YtDlpSubtitleTrack } from '@shared/schemas';
import { LIVE_CHAT_LANG } from '@shared/constants';
import { YtDlp } from './YtDlp';

function sanitizeSubtitleMap(raw: Record<string, YtDlpSubtitleTrack[]> | undefined, isAutomaticCaptions = false): SubtitleMap {
  if (!raw) return {};
  const result: SubtitleMap = {};
  for (const [lang, tracks] of Object.entries(raw)) {
    if (lang === LIVE_CHAT_LANG) continue;
    // YouTube bundles real auto-captions and on-demand translation options into the same map.
    // Only keys ending in `-orig` are real generated tracks — everything else is a translation
    // request that YouTube generates live and rate-limits aggressively.
    if (isAutomaticCaptions && !lang.endsWith('-orig')) continue;
    const valid = tracks
      .filter((t) => typeof t.ext === 'string' && t.ext.length > 0)
      .map((t) => ({
        ext: t.ext as string,
        ...(t.name ? { name: t.name } : {})
      }));
    if (valid.length > 0) result[lang] = valid;
  }
  return result;
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
        const details = [ext, codec, abr ? `${Math.round(abr)} kbps` : null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' · ');
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
      const details = [resolution, ext, fps ? `${fps}fps` : null, dynamicRange ?? null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' | ');

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

function categorizeProbeError(msg: string): string {
  const m = msg.toLowerCase();
  if (/sign in to confirm|confirm you'?re not a bot|\bbot\b|http error 403|\b403\b/.test(m)) return 'bot_detected';
  if (/unsupported url|is not a supported (?:site|url)|no extractor matches/.test(m)) return 'unsupported_site';
  if (/json (?:parse|decode)|unexpected token|schema validation|invalid json/.test(m)) return 'parse';
  if (/\b(?:timed? out|timeout|econn(?:reset|refused|aborted)|enotfound|getaddrinfo|network is unreachable)\b/.test(m)) return 'network';
  return 'unknown';
}

export class FormatProbeService {
  constructor(
    private readonly ytDlp: YtDlp,
    private readonly mockMode = false
  ) {}

  async getFormats(url: string): Promise<Result<GetFormatsOutput>> {
    const startMs = Date.now();
    try {
      if (this.mockMode) {
        return ok({
          formats: [
            {
              formatId: '137',
              label: '1080p | mp4 | 30fps',
              ext: 'mp4',
              resolution: '1080p',
              fps: 30,
              filesize: 800_000_000,
              isVideoOnly: true,
              isAudioOnly: false
            },
            {
              formatId: '22',
              label: '720p | mp4 | 30fps',
              ext: 'mp4',
              resolution: '720p',
              fps: 30,
              filesize: 400_000_000,
              isVideoOnly: false,
              isAudioOnly: false
            },
            {
              formatId: '18',
              label: '360p | mp4 | 30fps',
              ext: 'mp4',
              resolution: '360p',
              fps: 30,
              filesize: 150_000_000,
              isVideoOnly: false,
              isAudioOnly: false
            }
          ],
          title: 'Mock Video Title',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 212,
          subtitles: { en: [{ ext: 'vtt', name: 'English' }], es: [{ ext: 'vtt' }] },
          automaticCaptions: { de: [{ ext: 'vtt' }], ja: [{ ext: 'vtt', name: '日本語' }] }
        });
      }

      logger.info('Format probe started', { url });

      const result = await this.ytDlp.run(
        { kind: 'probe', url },
        {
          onStderr: (chunk) => {
            for (const line of splitStderrLines(chunk)) {
              logger.info(line, { source: 'yt-dlp-format-probe' });
            }
          }
        }
      );

      if (result.kind !== 'success') {
        const code = result.kind === 'exit-error' ? result.exitCode : null;
        const signal = result.kind === 'exit-error' ? result.signal : null;
        const rawError = result.kind === 'exit-error' ? result.rawError : result.error.message;
        logger.error('yt-dlp format probe failed', { code, url, signal });
        trackMain('format_probed', {
          duration_bucket: probeDurationBucket(Date.now() - startMs),
          error_category: categorizeProbeError(rawError ?? '')
        });
        return fail(createAppError('download', rawError ?? 'Format probing failed'));
      }

      try {
        const raw = JSON.parse(result.stdout);
        const parseResult = ytDlpInfoSchema.safeParse(raw);
        if (!parseResult.success) {
          const message = parseResult.error.issues[0]?.message ?? 'yt-dlp output failed schema validation';
          logger.error('Format probe schema validation failed', { message, url });
          trackMain('format_probed', {
            outcome: 'error',
            duration_bucket: probeDurationBucket(Date.now() - startMs),
            error_category: 'parse'
          });
          return fail(createAppError('download', 'Unexpected yt-dlp output shape', message));
        }
        const parsed = parseResult.data;
        const formats = mapFormats(parsed);
        logger.info('Format probe complete', {
          url,
          title: parsed.title,
          formatCount: formats.length
        });
        return ok({
          formats,
          title: parsed.title ?? '',
          thumbnail: parsed.thumbnail ?? '',
          duration: typeof parsed.duration === 'number' ? Math.round(parsed.duration) : undefined,
          subtitles: sanitizeSubtitleMap(parsed.subtitles),
          automaticCaptions: sanitizeSubtitleMap(parsed.automatic_captions, true)
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown JSON parse error';
        logger.error('Format probe JSON parse failed', { message, url });
        trackMain('format_probed', {
          duration_bucket: probeDurationBucket(Date.now() - startMs),
          error_category: 'parse'
        });
        return fail(createAppError('download', 'Failed to parse format list', message));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown format probing error';
      logger.error('Format probe failure', { message, url });
      trackMain('format_probed', {
        duration_bucket: probeDurationBucket(Date.now() - startMs),
        error_category: categorizeProbeError(message)
      });
      return fail(createAppError('download', message));
    }
  }
}

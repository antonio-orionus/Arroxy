// Subtitle file post-processing extracted from DownloadService.
// Pure(-ish) orchestration: takes the disk paths produced by phase 2 and
// runs dedupe / ffmpeg-mux. Cancel awareness is provided by the caller via
// `shouldAbort` and the `onSpawn` hook (so DownloadService can still kill
// the ffmpeg child if a cancel lands mid-mux).

import { extname } from 'node:path';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { dedupeSrt } from './srtDedupe';
import { dedupeVtt } from './vttDedupe';
import { spawnFFmpeg } from '@main/utils/process';
import { detectSubtitleLang, EMBED_CONTAINER_EXT } from '@shared/subtitlePath';
import type { LogService } from './LogService';

// Minimal ISO 639-1 → 639-2/B mapping for the languages YouTube most commonly
// exposes. mkv prefers 3-letter codes per the Matroska spec; players still
// auto-pickup with 2-letter codes but 3-letter is more correct. For codes we
// don't recognize (e.g. "en-orig", regional variants), pass through as-is.
const ISO_639_1_TO_2B: Record<string, string> = {
  en: 'eng',
  es: 'spa',
  fr: 'fre',
  de: 'ger',
  it: 'ita',
  pt: 'por',
  ru: 'rus',
  ja: 'jpn',
  ko: 'kor',
  zh: 'chi',
  ar: 'ara',
  hi: 'hin',
  uk: 'ukr',
  pl: 'pol',
  tr: 'tur',
  nl: 'dut',
  sv: 'swe',
  da: 'dan',
  no: 'nor',
  fi: 'fin',
  cs: 'cze',
  el: 'gre',
  he: 'heb',
  th: 'tha',
  vi: 'vie',
  id: 'ind',
  ro: 'rum',
  hu: 'hun',
  bg: 'bul'
};

function toIso639(lang: string): string {
  const base = lang.toLowerCase();
  if (/^[a-z]{2}$/.test(base) && ISO_639_1_TO_2B[base]) return ISO_639_1_TO_2B[base];
  return lang;
}

function buildSubtitleEmbedArgs(opts: { videoPath: string; subtitleTracks: Array<{ path: string; lang: string }>; outputPath: string }): string[] {
  const args: string[] = ['-y'];
  args.push('-i', opts.videoPath);
  for (const track of opts.subtitleTracks) args.push('-i', track.path);
  args.push('-c', 'copy', '-c:s', 'srt');
  for (let i = 0; i < opts.subtitleTracks.length; i++) {
    args.push(`-metadata:s:s:${i}`, `language=${toIso639(opts.subtitleTracks[i].lang)}`);
  }
  args.push(opts.outputPath);
  return args;
}

// YouTube auto-captions arrive as rolling cues — each cue duplicates the
// previous + 1 word. Run pure-TS dedupe on each .srt / .vtt we wrote.
// Failures are logged and swallowed: dedupe glitches must never lose a video.
export async function dedupeSubtitleFiles(paths: readonly string[], logger: LogService, jobId: string, shouldAbort: () => boolean): Promise<void> {
  await Promise.all(
    paths.map(async (path) => {
      if (shouldAbort()) return;
      const ext = extname(path).toLowerCase();
      const dedupe = ext === '.srt' ? dedupeSrt : ext === '.vtt' ? dedupeVtt : null;
      if (!dedupe) return;
      try {
        const original = await readFile(path, 'utf8');
        const cleaned = dedupe(original);
        if (cleaned !== original && !shouldAbort()) {
          await writeFile(path, cleaned, 'utf8');
        }
      } catch (err) {
        logger.log('WARN', 'auto-caption dedupe skipped', {
          jobId,
          path,
          message: err instanceof Error ? err.message : String(err)
        });
      }
    })
  );
}

export interface MuxResult {
  ok: boolean;
  outputPath?: string;
}

// Mux deduped sidecar subs into the merged video via ffmpeg -c copy (+ srt
// for sub streams). Returns the new media path on success.
//
// Lang attribution is strict: each sub path must end in `.<lang>.<ext>` for
// one of the requested langs. Unknown → 'und' (no positional fallback —
// yt-dlp doesn't guarantee output order matches input order).
export async function muxSubtitlesIntoVideo(opts: { ffmpegPath: string; videoPath: string; subtitlePaths: readonly string[]; requestedLangs: readonly string[]; onSpawn: (proc: ChildProcessWithoutNullStreams) => void; logger: LogService; jobId: string }): Promise<MuxResult> {
  if (opts.subtitlePaths.length === 0) return { ok: false };

  const tracks = opts.subtitlePaths.map((path) => ({
    path,
    lang: detectSubtitleLang(path, opts.requestedLangs) ?? 'und'
  }));

  const stem = opts.videoPath.replace(/\.[^.\\/]+$/, '');
  const outputPath = `${stem}.${EMBED_CONTAINER_EXT}`;
  const tempPath = `${stem}.muxing.${EMBED_CONTAINER_EXT}`;
  const args = buildSubtitleEmbedArgs({
    videoPath: opts.videoPath,
    subtitleTracks: tracks,
    outputPath: tempPath
  });

  const ok = await new Promise<boolean>((resolve) => {
    const proc = spawnFFmpeg(opts.ffmpegPath, args);
    opts.onSpawn(proc);
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
  });

  if (!ok) {
    opts.logger.log('ERROR', 'subtitle mux: ffmpeg failed or cancelled', { jobId: opts.jobId });
    await unlink(tempPath).catch(() => {});
    return { ok: false };
  }

  try {
    await rename(tempPath, outputPath);
    if (outputPath !== opts.videoPath) await unlink(opts.videoPath).catch(() => {});
    await Promise.all(opts.subtitlePaths.map((p) => unlink(p).catch(() => {})));
    return { ok: true, outputPath };
  } catch (err) {
    opts.logger.log('WARN', 'subtitle mux: post-mux cleanup partial', {
      jobId: opts.jobId,
      message: err instanceof Error ? err.message : String(err)
    });
    return { ok: true, outputPath };
  }
}

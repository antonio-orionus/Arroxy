import type { SubtitleFormat, SubtitleMode } from '@shared/types';

interface SubtitleArgsInput {
  url: string;
  outputDir: string;
  subtitleLanguages: string[];
  subtitleMode?: SubtitleMode;
  subtitleFormat: SubtitleFormat;
  writeAutoSubs?: boolean;
}

interface VideoArgsInput {
  url: string;
  outputDir: string;
  formatId?: string;
  embedSubs: boolean;
  subtitleLanguages?: string[];
  writeAutoSubs?: boolean;
}

// Subtitle-only / phase-2 sidecar args. Output goes to a `Subtitles` subfolder
// when `subfolder` mode is selected; everything else writes alongside the media.
export function buildSubtitleArgs(input: SubtitleArgsInput): string[] {
  const subOutputDir = input.subtitleMode === 'subfolder'
    ? `${input.outputDir}/Subtitles`
    : input.outputDir;
  return [
    '--skip-download', '--no-playlist',
    '--write-subs', '--sub-langs', input.subtitleLanguages.join(','),
    ...(input.writeAutoSubs ? ['--write-auto-subs'] : []),
    '--sleep-subtitles', '3',
    '--sub-format', `${input.subtitleFormat}/best`,
    '--convert-subs', input.subtitleFormat,
    '-o', `${subOutputDir}/%(title)s.%(ext)s`, input.url
  ];
}

// Phase-1 video args. When embedMode is true, subs are muxed inline (mkv only —
// mp4+mov_text is unreliable across YouTube's auto-caption variants). When
// false, sub flags are explicitly suppressed so a 429 can't fail the video.
export function buildVideoArgs(input: VideoArgsInput): string[] {
  const args: string[] = ['--progress', '--no-playlist'];

  if (input.embedSubs && input.subtitleLanguages?.length) {
    // mkv embeds vtt natively as a webvtt stream — no --convert-subs needed.
    // mp4+mov_text muxing is unreliable across YouTube's auto-caption variants
    // (see refs/GDownloader source comment, refs/omniget error-recovery path).
    // --compat-options no-keep-subs deletes the sidecar .vtt files after embed.
    args.push(
      '--write-subs', '--embed-subs',
      '--sub-langs', input.subtitleLanguages.join(','),
      '--merge-output-format', 'mkv',
      '--compat-options', 'no-keep-subs',
      '--sleep-subtitles', '3'
    );
    if (input.writeAutoSubs) args.push('--write-auto-subs');
  } else {
    args.push('--no-write-subs', '--no-write-auto-subs');
  }

  if (input.formatId) args.push('-f', input.formatId);
  args.push('-o', `${input.outputDir}/%(title)s.%(ext)s`, input.url);
  return args;
}

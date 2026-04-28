// Pure ffmpeg argv builder for muxing already-downloaded subtitle sidecars
// into a video. The actual spawn + cleanup orchestration lives in
// subtitlePostProcess.ts so this module stays a pure function.
//
// Used when the user picks embed mode AND auto-captions: yt-dlp's
// `--embed-subs` would mux raw rolling cues, so we download as sidecar,
// dedupe, then mux the cleaned subs ourselves.

interface SubtitleTrack {
  path: string;
  lang: string; // BCP-47-ish code from yt-dlp (e.g. "en", "en-orig", "zh-Hans")
}

interface BuildArgsInput {
  videoPath: string;
  subtitleTracks: SubtitleTrack[];
  outputPath: string;
}

// Minimal ISO 639-1 → 639-2/B mapping for the languages YouTube most commonly
// exposes. mkv prefers 3-letter codes per the Matroska spec; players still
// auto-pickup with 2-letter codes but 3-letter is more correct. For codes we
// don't recognize (e.g. "en-orig", regional variants), pass through as-is —
// any compliant player accepts arbitrary BCP-47 strings here.
const ISO_639_1_TO_2B: Record<string, string> = {
  en: 'eng', es: 'spa', fr: 'fre', de: 'ger', it: 'ita', pt: 'por',
  ru: 'rus', ja: 'jpn', ko: 'kor', zh: 'chi', ar: 'ara', hi: 'hin',
  uk: 'ukr', pl: 'pol', tr: 'tur', nl: 'dut', sv: 'swe', da: 'dan',
  no: 'nor', fi: 'fin', cs: 'cze', el: 'gre', he: 'heb', th: 'tha',
  vi: 'vie', id: 'ind', ro: 'rum', hu: 'hun', bg: 'bul'
};

function toIso639(lang: string): string {
  // Only translate clean 2-letter codes; anything with a region/variant suffix
  // (en-orig, zh-Hans, pt-BR) passes through verbatim so the player still has
  // *something* to display in its track menu.
  const base = lang.toLowerCase();
  if (/^[a-z]{2}$/.test(base) && ISO_639_1_TO_2B[base]) return ISO_639_1_TO_2B[base];
  return lang;
}

export function buildSubtitleEmbedArgs(input: BuildArgsInput): string[] {
  const args: string[] = ['-y'];
  args.push('-i', input.videoPath);
  for (const track of input.subtitleTracks) {
    args.push('-i', track.path);
  }
  // Copy video+audio streams without re-encoding; encode subs as srt (Matroska's
  // native text codec, plays in every modern player).
  args.push('-c', 'copy', '-c:s', 'srt');
  for (let i = 0; i < input.subtitleTracks.length; i++) {
    args.push(`-metadata:s:s:${i}`, `language=${toIso639(input.subtitleTracks[i].lang)}`);
  }
  args.push(input.outputPath);
  return args;
}

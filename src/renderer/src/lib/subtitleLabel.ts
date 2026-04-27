import type { SubtitleMap } from '@shared/types';

export function resolveSubtitleLabel(
  code: string,
  subtitles: SubtitleMap,
  automaticCaptions: SubtitleMap,
  uiLanguage: string
): string {
  const fromMeta = subtitles[code]?.[0]?.name ?? automaticCaptions[code]?.[0]?.name;
  if (fromMeta) return fromMeta;
  try {
    const normalized = code.replace('_', '-').split('-orig')[0];
    const dn = new Intl.DisplayNames([uiLanguage, 'en'], { type: 'language' });
    return dn.of(normalized) ?? code;
  } catch {
    return code;
  }
}

export function buildSubtitleList(
  subtitles: SubtitleMap,
  automaticCaptions: SubtitleMap,
  uiLanguage: string
): { code: string; displayName: string; isAuto: boolean }[] {
  const manual = Object.keys(subtitles)
    .filter((code) => code !== 'live_chat')
    .map((code) => ({
      code,
      displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage),
      isAuto: false
    }));
  const auto = Object.keys(automaticCaptions)
    .filter((code) => code !== 'live_chat' && !subtitles[code])
    .map((code) => ({
      code,
      displayName: resolveSubtitleLabel(code, subtitles, automaticCaptions, uiLanguage),
      isAuto: true
    }));
  return [...manual, ...auto];
}

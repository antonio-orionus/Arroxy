import type {
  AppError,
  AppSettings,
  FormatOption,
  LocalizedError,
  Preset,
  StatusSnapshot,
  SubtitleMap
} from '@shared/types';
import { PRESETS } from '@shared/schemas';
import { i18next } from '@shared/i18n';
import type { WizardStep } from './types';
export type { WizardStep };

export interface GroupedVideoFormat {
  resolution: string;
  formatId: string;
  label: string;
  isAudioOnly: boolean;
  dynamicRange?: string;
}

export function presetLabel(preset: Preset): string {
  return i18next.t(`presets.${preset}.label` as const);
}

export function presetOptions(): { value: Preset; label: string; desc: string }[] {
  return PRESETS.map((value) => ({
    value,
    label: i18next.t(`presets.${value}.label` as const),
    desc: i18next.t(`presets.${value}.desc` as const)
  }));
}

export function buildFormatId(videoFormatId: string, audioFormatId: string | null): string | undefined {
  if (videoFormatId === '' && audioFormatId === null) return undefined;
  if (videoFormatId === '') return audioFormatId ?? undefined;
  if (audioFormatId === null) return videoFormatId;
  return `${videoFormatId}+${audioFormatId}`;
}

// Selected-audio-id → human label. Used by buildFormatLabel (queue item) and
// StepConfirm (preview row) so they can't drift.
export function resolveAudioLabel(
  audioFormatId: string | null,
  audioFormats: FormatOption[]
): string {
  if (audioFormatId === null) return i18next.t('wizard.formats.noAudio');
  const audioFmt = audioFormats.find((f) => f.formatId === audioFormatId);
  return audioFmt?.label ?? i18next.t('formatLabel.audioFallback');
}

// Selected-video-id → resolution label. The audio-only case returns
// `audioOnlyFallback`, which differs by caller: queue items store the
// untranslated sentinel `'audio-only'`; the confirm view shows a translated string.
export function resolveVideoResolution(
  selectedVideoFormatId: string,
  formats: FormatOption[],
  audioOnlyFallback: string
): string {
  if (selectedVideoFormatId === '') return audioOnlyFallback;
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  return grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;
}

export function buildFormatLabel(
  videoFormatId: string,
  videoResolution: string,
  audioFormatId: string | null,
  audioFormats: FormatOption[],
  preset: Preset | null
): string {
  if (preset) {
    return i18next.t(`presets.${preset}.label` as const);
  }
  const audioLabel = resolveAudioLabel(audioFormatId, audioFormats);
  if (videoFormatId === '') return i18next.t('formatLabel.audioOnlyDot', { audio: audioLabel });
  return i18next.t('formatLabel.videoDot', { resolution: videoResolution, audio: audioLabel });
}

export function groupVideoFormats(formats: FormatOption[]): GroupedVideoFormat[] {
  const seen = new Set<string>();
  const grouped: GroupedVideoFormat[] = [];

  for (const f of formats) {
    if (f.isAudioOnly) continue;
    const key = `${f.resolution}|${f.dynamicRange ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      grouped.push({ resolution: f.resolution, formatId: f.formatId, label: f.label, isAudioOnly: false, dynamicRange: f.dynamicRange });
    }
  }

  grouped.push({
    resolution: i18next.t('wizard.formats.audioOnly'),
    formatId: '',
    label: i18next.t('wizard.formats.audioOnlyOption'),
    isAudioOnly: true
  });

  return grouped;
}

export function applyPreset(preset: Preset, formats: FormatOption[]): { videoFormatId: string; audioFormatId: string | null } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;
  const worstAudio = audioFormats[audioFormats.length - 1]?.formatId ?? bestAudio;

  if (preset === 'best-quality') {
    return { videoFormatId: grouped[0]?.formatId ?? '', audioFormatId: bestAudio };
  }
  if (preset === 'balanced') {
    const target = grouped.find((g) => {
      const match = g.resolution.match(/(\d+)/);
      return match ? Number(match[1]) <= 720 : false;
    });
    return { videoFormatId: target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: bestAudio };
  }
  if (preset === 'audio-only') {
    return { videoFormatId: '', audioFormatId: bestAudio };
  }
  if (preset === 'subtitle-only') {
    return { videoFormatId: '', audioFormatId: null };
  }
  // small-file
  return { videoFormatId: grouped[grouped.length - 1]?.formatId ?? '', audioFormatId: worstAudio };
}

export function restoreFormatSelection(
  formats: FormatOption[],
  settings: AppSettings | null
): { videoFormatId: string; audioFormatId: string | null; preset: Preset | null } {
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  const audioFormats = formats.filter((f) => f.isAudioOnly);
  const bestAudio = audioFormats[0]?.formatId ?? null;

  if (settings?.lastPreset) {
    const result = applyPreset(settings.lastPreset, formats);
    return { ...result, preset: settings.lastPreset };
  }

  if (settings?.lastVideoResolution === 'audio-only') {
    return { videoFormatId: '', audioFormatId: bestAudio, preset: null };
  }

  if (settings?.lastVideoResolution) {
    const match = grouped.find((g) => g.resolution === settings.lastVideoResolution);
    if (match) return { videoFormatId: match.formatId, audioFormatId: bestAudio, preset: null };
  }

  return { ...applyPreset('best-quality', formats), preset: 'best-quality' };
}

export function restoreSubtitleSelection(
  subtitles: SubtitleMap | undefined,
  automaticCaptions: SubtitleMap | undefined,
  settings: AppSettings | null
): { languages: string[] } {
  const available = new Set([
    ...Object.keys(subtitles ?? {}),
    ...Object.keys(automaticCaptions ?? {})
  ]);
  const languages = (settings?.lastSubtitleLanguages ?? []).filter((l) => available.has(l));
  return { languages };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatStatus(snapshot: StatusSnapshot | null): string {
  if (!snapshot) return '';
  const key = `status.${snapshot.key}`;
  // i18next typed resources don't compose with computed keys + interpolation params; cast through unknown.
  return (i18next.t as (k: string, opts?: Record<string, unknown>) => string)(key, snapshot.params);
}

export function formatLocalizedError(error: LocalizedError | null): string {
  if (!error) return '';
  if (error.key) return i18next.t(`errors.ytdlp.${error.key}` as const);
  return error.rawMessage ?? '';
}

export function formatError(error: AppError | null): string {
  if (!error) return '';
  return error.message;
}

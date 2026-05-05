import type { AppError, AudioConvert, FormatOption, LocalizedError, Preset, StatusSnapshot } from '@shared/types';
import { PRESETS } from '@shared/schemas';
import { i18next } from '@shared/i18n';
import type { AudioSelection, WizardStep } from './types';
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

// Composes the yt-dlp `-f` value for native + video selections. Convert
// selections set `formatId: undefined` and pass `audioConvert` instead — the
// main process then forces `-f bestaudio/best`.
export function buildFormatId(videoFormatId: string, audioSelection: AudioSelection): string | undefined {
  if (audioSelection.kind === 'convert-lossy' || audioSelection.kind === 'convert-lossless') return undefined;
  const audioFormatId = audioSelection.kind === 'native' ? audioSelection.formatId : null;
  if (videoFormatId === '' && audioFormatId === null) return undefined;
  if (videoFormatId === '') return audioFormatId ?? undefined;
  if (audioFormatId === null) return videoFormatId;
  return `${videoFormatId}+${audioFormatId}`;
}

// IPC payload mirror of audioSelection. Returns the `audioConvert` field for
// the IPC schema, or undefined for native/none picks.
export function buildAudioConvertPayload(audioSelection: AudioSelection): AudioConvert | undefined {
  if (audioSelection.kind === 'convert-lossless') return { target: 'wav' };
  if (audioSelection.kind === 'convert-lossy') return { target: audioSelection.target, bitrateKbps: audioSelection.bitrateKbps };
  return undefined;
}

// Selected audio → human label. Used by buildFormatLabel (queue item) and
// StepConfirm (preview row) so they can't drift.
export function resolveAudioLabel(audioSelection: AudioSelection, audioFormats: FormatOption[]): string {
  if (audioSelection.kind === 'none') return i18next.t('wizard.formats.noAudio');
  if (audioSelection.kind === 'convert-lossless') return i18next.t('wizard.formats.convert.wavLabel');
  if (audioSelection.kind === 'convert-lossy') {
    // i18next typed-resource inference doesn't always pick up placeholders in
    // every locale variant — cast through `unknown` like formatStatus does.
    return (i18next.t as (k: string, opts?: Record<string, unknown>) => string)('wizard.formats.convert.lossyLabel', {
      target: audioSelection.target.toUpperCase(),
      bitrate: audioSelection.bitrateKbps
    });
  }
  const audioFmt = audioFormats.find((f) => f.formatId === audioSelection.formatId);
  return audioFmt?.label ?? i18next.t('formatLabel.audioFallback');
}

// Selected-video-id → resolution label. The audio-only case returns
// `audioOnlyFallback`, which differs by caller: queue items store the
// untranslated sentinel `'audio-only'`; the confirm view shows a translated string.
export function resolveVideoResolution(selectedVideoFormatId: string, formats: FormatOption[], audioOnlyFallback: string): string {
  if (selectedVideoFormatId === '') return audioOnlyFallback;
  const grouped = groupVideoFormats(formats).filter((g) => !g.isAudioOnly);
  return grouped.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;
}

export function buildFormatLabel(videoFormatId: string, videoResolution: string, audioSelection: AudioSelection, audioFormats: FormatOption[], preset: Preset | null): string {
  if (preset) {
    return i18next.t(`presets.${preset}.label` as const);
  }
  const audioLabel = resolveAudioLabel(audioSelection, audioFormats);
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
      grouped.push({
        resolution: f.resolution,
        formatId: f.formatId,
        label: f.label,
        isAudioOnly: false,
        dynamicRange: f.dynamicRange
      });
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
  if (error.localizedKey) return i18next.t(`errors.ytdlp.${error.localizedKey}` as const);
  return error.message;
}

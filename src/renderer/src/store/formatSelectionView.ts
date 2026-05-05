import { useMemo } from 'react';
import { i18next } from '@shared/i18n';
import type { AudioBitrate, FormatOption } from '@shared/types';
import type { Preset } from '@shared/schemas';
import type { AudioSelection } from './types';
import { useAppStore } from './useAppStore';
import { resolveVideoResolution } from './helpers';
import { presetProducesMedia } from '@shared/presetTraits';

export type ConvertTooltipKey = 'wizard.formats.convert.requiresAudioOnly' | 'wizard.formats.convert.requiresLossy';

export interface FormatSelectionView {
  mode: 'video+audio' | 'audio-only' | 'subtitle-only';
  canContinue: boolean;
  currentResolutionLabel: string;
  selectedFilesize: number | undefined;
  video: { disabled: boolean };
  audio: {
    convertDisabled: boolean;
    convertTooltipKey: ConvertTooltipKey | null;
    noAudioDisabled: boolean;
    bitrateStrip: {
      blocked: boolean;
      value: AudioBitrate;
      tooltipKey: ConvertTooltipKey | null;
    };
  };
}

function selectView(state: { selectedVideoFormatId: string; audioSelection: AudioSelection; lastConvertBitrate: AudioBitrate; activePreset: Preset | null; wizardFormats: FormatOption[] }): FormatSelectionView {
  const { selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats } = state;

  const isAudioOnly = selectedVideoFormatId === '';
  const isSubtitleOnly = activePreset !== null && !presetProducesMedia(activePreset);

  const mode: FormatSelectionView['mode'] = isSubtitleOnly ? 'subtitle-only' : isAudioOnly ? 'audio-only' : 'video+audio';

  const canContinue = isSubtitleOnly || !(isAudioOnly && audioSelection.kind === 'none');

  const currentResolutionLabel = isSubtitleOnly ? i18next.t('presets.subtitle-only.label') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'));

  const selectedFilesize = wizardFormats.find((f) => f.formatId === selectedVideoFormatId)?.filesize;

  const convertDisabled = !isAudioOnly;
  const lossyConvert = audioSelection.kind === 'convert-lossy' ? audioSelection : null;
  const bitrateBlocked = lossyConvert === null;
  const bitrateValue = lossyConvert?.bitrateKbps ?? lastConvertBitrate;

  return {
    mode,
    canContinue,
    currentResolutionLabel,
    selectedFilesize,
    video: {
      disabled: isSubtitleOnly
    },
    audio: {
      convertDisabled,
      convertTooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : null,
      noAudioDisabled: isAudioOnly,
      bitrateStrip: {
        blocked: bitrateBlocked,
        value: bitrateValue,
        tooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : bitrateBlocked ? 'wizard.formats.convert.requiresLossy' : null
      }
    }
  };
}

export function useFormatSelectionView(): FormatSelectionView {
  const selectedVideoFormatId = useAppStore((s) => s.selectedVideoFormatId);
  const audioSelection = useAppStore((s) => s.audioSelection);
  const lastConvertBitrate = useAppStore((s) => s.lastConvertBitrate);
  const activePreset = useAppStore((s) => s.activePreset);
  const wizardFormats = useAppStore((s) => s.wizardFormats);

  return useMemo(() => selectView({ selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats }), [selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats]);
}

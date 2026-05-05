import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useFormatSelectionView } from '../../store/formatSelectionView';
import { VideoSummaryCard } from '../shared/VideoSummaryCard';
import downloadingImg from '../../assets/Downloading.png';
import { PresetStrip } from './format/PresetStrip';
import { VideoColumn } from './format/VideoColumn';
import { AudioColumn } from './format/AudioColumn';
import { FormatFooter } from './format/FormatFooter';

export function StepFormatSelect(): JSX.Element {
  const { t } = useTranslation();
  const { wizardFormats, formatsLoading, wizardTitle, wizardThumbnail, wizardDuration, selectedVideoFormatId, audioSelection, activePreset, setSelectedVideoFormatId, setAudioSelection, setPreset, advance, back } = useAppStore();
  const view = useFormatSelectionView();

  if (formatsLoading) {
    return (
      <div className="wizard-step flex flex-col items-center gap-4 py-8">
        <div className="rounded-2xl bg-[var(--brand-dim)] p-4 shadow-[0_0_28px_var(--brand-glow)]">
          <img src={downloadingImg} alt="" aria-hidden className="w-28 h-28 object-contain" />
        </div>
        <div className="relative rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-muted-foreground leading-relaxed shadow-sm text-center max-w-[260px]">
          <span
            aria-hidden
            className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '7px solid var(--border)'
            }}
          />
          <span
            aria-hidden
            className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '7px solid var(--secondary)'
            }}
          />
          {t('wizard.formats.sniffing')}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
          <div className="spinner" aria-label={t('wizard.formats.loadingAria')} />
          <span>{t('wizard.formats.loadingHint')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-step flex flex-col gap-3" data-testid="step-formats">
      <VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} resolution={view.currentResolutionLabel} />

      <PresetStrip activePreset={activePreset} onSelect={setPreset} />

      <div className="grid grid-cols-2 gap-[20px]">
        <VideoColumn formats={wizardFormats} selectedVideoFormatId={selectedVideoFormatId} onSelect={setSelectedVideoFormatId} />
        <AudioColumn formats={wizardFormats} audioSelection={audioSelection} onSelect={setAudioSelection} />
      </div>

      <FormatFooter onBack={back} onContinue={advance} />
    </div>
  );
}

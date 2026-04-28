import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { humanSize } from '@shared/format';
import { useAppStore, presetLabel, resolveAudioLabel, resolveVideoResolution } from '../store/useAppStore';
import { formatHomeRelativePath } from '@renderer/lib/utils';
import { effectiveOutputDir } from '@renderer/lib/path';
import { resolveSubtitleLabel, SUBTITLE_MODE_I18N_KEYS } from '../lib/subtitleLabel';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { VideoSummaryCard } from './VideoSummaryCard';
import loveImg from '../assets/Love.png';

export function StepConfirm(): JSX.Element {
  const { t, i18n } = useTranslation();
  const {
    wizardTitle,
    wizardThumbnail,
    wizardDuration,
    wizardOutputDir,
    selectedVideoFormatId,
    selectedAudioFormatId,
    activePreset,
    wizardFormats,
    wizardSubtitleLanguages,
    wizardSubtitleMode,
    wizardSubtitleFormat,
    wizardSubtitles,
    wizardAutomaticCaptions,
    commonPaths,
    wizardSubfolderEnabled,
    wizardSubfolderName,
    addToQueue,
    addAndDownloadImmediately,
    goToStep
  } = useAppStore();

  const audioFormats = wizardFormats.filter((f) => f.isAudioOnly);
  const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, t('wizard.confirm.audioOnly'));
  const audioLabel = resolveAudioLabel(selectedAudioFormatId, audioFormats);

  const videoSummary = activePreset
    ? presetLabel(activePreset)
    : selectedVideoFormatId === ''
      ? t('wizard.confirm.audioOnly')
      : videoResolution;

  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const estimatedSize = selectedFormat?.filesize ? `~${humanSize(selectedFormat.filesize)}` : t('wizard.confirm.sizeUnknown');

  const finalDir = effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName);
  const shortPath = formatHomeRelativePath(finalDir, commonPaths);

  const subtitlesValue = (() => {
    if (wizardSubtitleLanguages.length === 0) return t('wizard.confirm.subtitlesNone');
    const langList = wizardSubtitleLanguages
      .map((code) => resolveSubtitleLabel(code, wizardSubtitles, wizardAutomaticCaptions, i18n.language))
      .join(', ');
    const modeLabel = t(SUBTITLE_MODE_I18N_KEYS[wizardSubtitleMode]);
    const formatPart = wizardSubtitleMode !== 'embed' ? `${wizardSubtitleFormat.toUpperCase()} · ` : '';
    return `${langList} · ${formatPart}${modeLabel}`;
  })();

  const summaryRows: { key: string; label: string; value: string }[] = [
    { key: 'video',     label: t('wizard.confirm.labelVideo'),     value: videoSummary },
    { key: 'audio',     label: t('wizard.confirm.labelAudio'),     value: audioLabel },
    { key: 'subtitles', label: t('wizard.confirm.labelSubtitles'), value: subtitlesValue },
    { key: 'saveTo',    label: t('wizard.confirm.labelSaveTo'),    value: shortPath },
    { key: 'size',      label: t('wizard.confirm.labelSize'),      value: estimatedSize },
  ];

  // Nothing-selected guard: subtitle-only preset with zero languages produces an
  // empty download (no formatId, no subs). Block the action buttons in that case.
  const hasNothingSelected =
    selectedVideoFormatId === '' && selectedAudioFormatId === null && wizardSubtitleLanguages.length === 0;

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
      <VideoSummaryCard
        thumbnail={wizardThumbnail}
        title={wizardTitle}
        duration={wizardDuration}
        resolution={selectedVideoFormatId !== '' ? videoResolution : undefined}
      />

      {/* Mascot banner */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[hsla(220,100%,56%,0.15)] bg-[var(--brand-dim)] shrink-0">
        <img src={loveImg} alt="" aria-hidden className="w-16 h-16 object-contain shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">{t('wizard.confirm.readyHeadline')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('wizard.confirm.landIn')}{' '}
            <code className="font-mono text-foreground/80">{shortPath}</code>
          </p>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-lg border border-border bg-secondary overflow-hidden" data-testid="confirm-preview">
        <table className="w-full">
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.key} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] w-16 whitespace-nowrap">
                  {row.label}
                </td>
                <td
                  className="px-4 py-2 text-xs text-foreground/80 font-mono truncate max-w-xs"
                  data-testid={`confirm-${row.key}`}
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 sticky bottom-0 bg-background py-3 -mx-6 px-6 border-t border-border/50">
        <Button
          variant="ghost"
          type="button"
          onClick={() => goToStep('folder')}
          data-testid="btn-back"
          className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground mr-auto"
        >
          {t('common.back')}
        </Button>
        <Tooltip>
          <TooltipTrigger render={(props) => (
            <Button
              {...props}
              variant="outline"
              type="button"
              onClick={() => void addToQueue()}
              data-testid="btn-add-to-queue"
              disabled={hasNothingSelected}
            >
              {t('wizard.confirm.addToQueue')}
            </Button>
          )} />
          <TooltipContent>{t('wizard.confirm.addToQueueTooltip')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={(props) => (
            <Button
              {...props}
              type="button"
              size="lg"
              onClick={() => void addAndDownloadImmediately()}
              data-testid="btn-download-now"
              disabled={hasNothingSelected}
              className="shadow-[0_4px_14px_var(--brand-glow)]"
            >
              {t('wizard.confirm.pullIt')}
            </Button>
          )} />
          <TooltipContent>{t('wizard.confirm.pullItTooltip')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

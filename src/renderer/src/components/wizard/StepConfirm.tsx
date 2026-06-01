import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { humanSize } from '@shared/format.js';
import { useAppStore, presetLabel, resolveAudioLabel, resolveVideoResolution } from '../../store/useAppStore.js';
import { formatHomeRelativePath } from '@renderer/lib/utils.js';
import { effectiveOutputDir } from '@renderer/lib/path.js';
import { resolveSubtitleLabel, SUBTITLE_MODE_I18N_KEYS } from '../../lib/subtitleLabel.js';
import { sanitizeJobOptions } from '@shared/sanitizeJobOptions.js';
import { resolveOutputContainer } from '../../store/wizard/resolveContainer.js';
import { Button } from '../ui/button.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip.js';
import { WizardFooter } from './WizardFooter.js';
import { VideoSummaryCard } from '../shared/VideoSummaryCard.js';
import { isAudioOnlySource } from '@shared/ytdlp/extractorPredicates.js';
import { playlistPresetSpec } from '@shared/playlistPresets.js';
import loveImg from '../../assets/Love.png';

export function StepConfirm(): JSX.Element {
  const { t, i18n } = useTranslation();
  const CONFLICT_LABELS: Record<string, string> = {
    thumbnailEmbedNotSupported: t('wizard.confirm.thumbnailEmbedNotSupported'),
    subtitleEmbedAudioOnly: t('wizard.confirm.subtitleEmbedAudioOnly')
  };
  const { wizardTitle, wizardThumbnail, wizardDuration, wizardWebpageUrl, wizardOutputDir, selectedVideoFormatId, audioSelection, activePreset, wizardFormats, wizardSubtitleLanguages, wizardSubtitleMode, wizardSubtitleFormat, wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleSkipped, commonPaths, wizardSubfolderEnabled, wizardSubfolderName, addToQueue, addAndDownloadImmediately, back, playlistItems, selectedPlaylistItemIds, playlistSelection, playlistTitle, wizardMode, wizardExtractor, wizardEmbedChapters, wizardEmbedMetadata, wizardEmbedThumbnail, wizardWriteDescription, wizardWriteThumbnail, wizardSponsorBlockMode, isSubmittingToQueue } = useAppStore();
  const inPlaylist = wizardMode === 'playlist';
  const inBulk = wizardMode === 'bulk';
  const inBatch = inPlaylist || inBulk;

  const effectiveSubtitleLanguages = wizardSubtitleSkipped ? [] : wizardSubtitleLanguages;

  const audioFormats = wizardFormats.filter((f) => f.isAudioOnly);
  const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, t('wizard.confirm.audioOnly'));
  const audioLabel = resolveAudioLabel(audioSelection, audioFormats);

  const videoSummary = activePreset ? presetLabel(activePreset) : selectedVideoFormatId === '' ? t('wizard.confirm.audioOnly') : videoResolution;

  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const estimatedSize = selectedFormat?.filesize ? `~${humanSize(selectedFormat.filesize)}` : t('wizard.confirm.sizeUnknown');

  const finalDir = effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName);
  const shortPath = formatHomeRelativePath(finalDir, commonPaths);

  const subtitlesValue = (() => {
    if (effectiveSubtitleLanguages.length === 0) return t('wizard.confirm.subtitlesNone');
    const langList = effectiveSubtitleLanguages.map((code) => resolveSubtitleLabel(code, wizardSubtitles, wizardAutomaticCaptions, i18n.language)).join(', ');
    const modeLabel = t(SUBTITLE_MODE_I18N_KEYS[wizardSubtitleMode]);
    const formatPart = wizardSubtitleMode !== 'embed' ? `${wizardSubtitleFormat.toUpperCase()} · ` : '';
    return `${langList} · ${formatPart}${modeLabel}`;
  })();

  const presetLabelStr = (() => {
    if (!playlistSelection) return '';
    if (playlistSelection.kind === 'audio') {
      if (playlistSelection.format === 'best') return t('playlistPresets.audioFormat.best');
      return t('playlistPresets.audioFormatBitrate', { format: playlistSelection.format.toUpperCase(), kbps: playlistSelection.bitrateKbps ?? 192 });
    }
    const tierLabel = t(`playlistPresets.tier.${playlistSelection.tier}`);
    return playlistSelection.codec === 'mp4' ? `MP4 · ${tierLabel}` : tierLabel;
  })();
  // "videos" vs "tracks" — pick the unit that matches the actual content.
  // Audio-only extractors (Bandcamp, QQMusic, etc.) and audio playlist
  // selections → "tracks". Video selections → "videos".
  const isAudioPlaylistPreset = !!playlistSelection && !playlistPresetSpec(playlistSelection).producesVideo;
  const itemsAreAudio = isAudioOnlySource(wizardExtractor) || isAudioPlaylistPreset;
  const itemsValue = inBulk ? t('wizard.confirm.itemsValueBulk', { count: selectedPlaylistItemIds.length, total: String(playlistItems.length) }) : t(itemsAreAudio ? 'wizard.confirm.itemsValueAudio' : 'wizard.confirm.itemsValue', { count: selectedPlaylistItemIds.length, total: String(playlistItems.length) });

  const summaryRows: { key: string; label: string; value: string }[] = inBatch
    ? [
        { key: 'playlist', label: t(inBulk ? 'wizard.confirm.labelBulk' : 'wizard.confirm.labelPlaylist'), value: inBulk ? t('wizard.bulk.title') : playlistTitle || '—' },
        { key: 'preset', label: t('wizard.confirm.labelPreset'), value: presetLabelStr || '—' },
        { key: 'items', label: t('wizard.confirm.labelItems'), value: itemsValue },
        { key: 'saveTo', label: t('wizard.confirm.labelSaveTo'), value: shortPath }
      ]
    : [
        { key: 'video', label: t('wizard.confirm.labelVideo'), value: videoSummary },
        { key: 'audio', label: t('wizard.confirm.labelAudio'), value: audioLabel },
        { key: 'subtitles', label: t('wizard.confirm.labelSubtitles'), value: subtitlesValue },
        { key: 'saveTo', label: t('wizard.confirm.labelSaveTo'), value: shortPath },
        { key: 'size', label: t('wizard.confirm.labelSize'), value: estimatedSize }
      ];

  const hasNothingSelected = inBatch ? !playlistSelection || selectedPlaylistItemIds.length === 0 : selectedVideoFormatId === '' && audioSelection.kind === 'none' && effectiveSubtitleLanguages.length === 0;

  // Only surface conflicts the user actively created through visible wizard steps.
  // subtitle-only skips the output + sponsorblock steps, so those options are never
  // shown to the user — silently sanitized in buildQueueItem but not displayed here.
  const USER_VISIBLE_CONFLICTS: ReadonlySet<string> = new Set(['thumbnailEmbedNotSupported', 'subtitleEmbedAudioOnly']);
  const { conflicts: allConflicts } = !inBatch
    ? sanitizeJobOptions({
        isSubtitleOnly: activePreset === 'subtitle-only',
        hasVideoTrack: selectedVideoFormatId !== '',
        resolvedOutputContainer: resolveOutputContainer(selectedVideoFormatId, audioSelection, wizardSubtitleMode, wizardFormats, activePreset),
        subtitleMode: wizardSubtitleMode,
        subtitleLanguages: effectiveSubtitleLanguages,
        embed: { chapters: wizardEmbedChapters, metadata: wizardEmbedMetadata, thumbnail: wizardEmbedThumbnail, description: wizardWriteDescription, thumbnailSidecar: wizardWriteThumbnail },
        sponsorBlockMode: wizardSponsorBlockMode
      })
    : { conflicts: [] };
  const conflicts = allConflicts.filter((c) => USER_VISIBLE_CONFLICTS.has(c.code));

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
      {!inBatch && <VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} resolution={selectedVideoFormatId !== '' ? videoResolution : undefined} webpageUrl={wizardWebpageUrl} />}

      {/* Mascot banner */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[hsla(220,100%,56%,0.15)] bg-[var(--brand-dim)] shrink-0">
        <img src={loveImg} alt="" aria-hidden className="w-16 h-16 object-contain shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">{t('wizard.confirm.readyHeadline')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('wizard.confirm.landIn')} <code className="font-mono text-foreground/80">{shortPath}</code>
          </p>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-lg border border-border bg-secondary overflow-hidden" data-testid="confirm-preview">
        <table className="w-full">
          <tbody>
            {summaryRows.map((row) => (
              <tr key={row.key} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] w-16 whitespace-nowrap">{row.label}</td>
                <td className="px-4 py-2 text-xs text-foreground/80 font-mono truncate max-w-xs" data-testid={`confirm-${row.key}`}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {conflicts.length > 0 && (
        <ul className="space-y-1" data-testid="confirm-conflicts">
          {conflicts.map((c) => (
            <li key={c.code} className="flex items-start gap-1.5 text-xs text-amber-500 dark:text-amber-400/90 px-1">
              <span className="shrink-0 mt-px">⚠</span>
              <span>{CONFLICT_LABELS[c.code]}</span>
            </li>
          ))}
        </ul>
      )}

      {hasNothingSelected && (
        <p className="text-xs text-muted-foreground text-center px-2" data-testid="nothing-to-download-note">
          {t('wizard.confirm.nothingToDownload')}
        </p>
      )}

      <WizardFooter>
        <Button variant="ghost" type="button" onClick={back} data-testid="btn-back" disabled={isSubmittingToQueue} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
          {t('common.back')}
        </Button>
        {inBatch ? (
          // Batch downloads always go through the queue — parallel-pulling N entries
          // would spike YouTube rate-limits and bot-detection. No Pull-it CTA.
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <Button {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={hasNothingSelected || isSubmittingToQueue} className="shadow-[0_4px_14px_var(--brand-glow)] pl-4 pr-3 min-w-[96px]">
                  {t('wizard.confirm.addToQueue')}
                </Button>
              )}
            />
            <TooltipContent>{t('wizard.confirm.addToQueueTooltip')}</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <Button {...props} variant="outline" type="button" onClick={() => void addAndDownloadImmediately()} data-testid="btn-download-now" disabled={hasNothingSelected || isSubmittingToQueue}>
                    {t('wizard.confirm.pullIt')}
                  </Button>
                )}
              />
              <TooltipContent>{t('wizard.confirm.pullItTooltip')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <Button {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={hasNothingSelected || isSubmittingToQueue} className="shadow-[0_4px_14px_var(--brand-glow)] pl-4 pr-3 min-w-[96px]">
                    {t('wizard.confirm.addToQueue')}
                  </Button>
                )}
              />
              <TooltipContent>{t('wizard.confirm.addToQueueTooltip')}</TooltipContent>
            </Tooltip>
          </>
        )}
      </WizardFooter>
    </div>
  );
}

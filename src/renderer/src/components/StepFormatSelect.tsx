import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { Preset } from '@shared/types';
import { humanSize } from '@shared/format';
import { useAppStore, groupVideoFormats, presetOptions } from '../store/useAppStore';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Separator } from './ui/separator';
import { RadioOption } from './ui/radio-option';
import { cn } from '@renderer/lib/utils';
import { VideoSummaryCard } from './VideoSummaryCard';
import { MascotBubble } from './MascotBubble';
import choosingImg from '../assets/Choosing.png';
import downloadingImg from '../assets/Downloading.png';

export function StepFormatSelect(): JSX.Element {
  const { t } = useTranslation();
  const {
    wizardFormats,
    formatsLoading,
    wizardTitle,
    wizardThumbnail,
    wizardDuration,
    selectedVideoFormatId,
    selectedAudioFormatId,
    activePreset,
    setSelectedVideoFormatId,
    setAudioFormatId,
    setPreset,
    confirmFormats,
    resetWizard
  } = useAppStore();

  const [extFilter, setExtFilter] = useState<string | null>(null);
  const [drFilter, setDrFilter] = useState<string | null>(null);

  const filteredFormats = wizardFormats
    .filter((f) => !extFilter || f.ext === extFilter)
    .filter((f) => !drFilter || (drFilter === 'SDR' ? !f.dynamicRange : f.dynamicRange === drFilter));

  const videoGroups = groupVideoFormats(filteredFormats);
  const isAudioOnly = selectedVideoFormatId === '';
  const subtitleOnlyPreset = activePreset === 'subtitle-only';
  // 'subtitle-only' preset deliberately picks no video + no audio. The subtitle
  // step + confirm step then guarantee at least one language is chosen.
  const canContinue = subtitleOnlyPreset || !(isAudioOnly && selectedAudioFormatId === null);

  const uniqueExts = [...new Set(wizardFormats.filter((f) => f.isVideoOnly).map((f) => f.ext))];
  const uniqueDynamicRanges = [...new Set(wizardFormats.filter((f) => f.isVideoOnly).map((f) => f.dynamicRange ?? 'SDR'))];

  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const selectedFilesize = selectedFormat?.filesize;

  const currentResolutionLabel =
    activePreset === 'subtitle-only'
      ? t('presets.subtitle-only.label')
      : selectedVideoFormatId === ''
        ? t('wizard.formats.audioOnly')
        : groupVideoFormats(wizardFormats).find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? '';

  const maxFilesize = Math.max(
    ...videoGroups
      .filter((g) => !g.isAudioOnly)
      .map((g) => filteredFormats.find((f) => f.formatId === g.formatId)?.filesize ?? 0),
    1
  );

  const PRESET_OPTIONS = presetOptions();

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
            style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '7px solid var(--border)' }}
          />
          <span
            aria-hidden
            className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '7px solid var(--secondary)' }}
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
      <VideoSummaryCard
        thumbnail={wizardThumbnail}
        title={wizardTitle}
        duration={wizardDuration}
        resolution={currentResolutionLabel}
      />

      {/* Quick presets */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          {t('wizard.formats.quickPresets')}
        </p>
        <ToggleGroup
          value={activePreset ? [activePreset] : []}
          onValueChange={(vals) => { if (vals[0]) setPreset(vals[0] as Preset); }}
          className="grid grid-cols-5 gap-1.5 w-full"
        >
          {PRESET_OPTIONS.map((p) => (
            <Tooltip key={p.value}>
              <TooltipTrigger
                render={(props) => (
                  <ToggleGroupItem
                    {...props}
                    value={p.value}
                    className="flex items-center justify-center py-1.5 px-2.5 rounded-[8px] border h-auto w-full aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] border-[var(--border-strong)] bg-secondary/60 hover:border-muted-foreground hover:-translate-y-0.5 transition-all"
                  >
                    <span className="text-[13px] font-semibold text-foreground truncate">
                      {p.label}
                    </span>
                  </ToggleGroupItem>
                )}
              />
              <TooltipContent>{p.desc}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-[20px]">
        {/* Video column */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-[6px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              {t('wizard.formats.video')}
            </p>
            <div className="flex items-center gap-[6px]">
              {uniqueDynamicRanges.length > 1 && (
                <ToggleGroup
                  value={drFilter ? [drFilter] : []}
                  onValueChange={(vals) => setDrFilter(vals[0] ?? null)}
                  className="gap-[3px]"
                >
                  {uniqueDynamicRanges.map((dr) => (
                    <ToggleGroupItem
                      key={dr}
                      value={dr}
                      className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground"
                    >
                      {dr}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
              {uniqueExts.length > 1 && (
                <ToggleGroup
                  value={extFilter ? [extFilter] : []}
                  onValueChange={(vals) => setExtFilter(vals[0] ?? null)}
                  className="gap-[3px]"
                >
                  {uniqueExts.map((ext) => (
                    <ToggleGroupItem
                      key={ext}
                      value={ext}
                      className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground"
                    >
                      {ext}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </div>
          </div>

          {videoGroups.map((g) => {
            const isChecked = selectedVideoFormatId === g.formatId;
            const rawFmt = filteredFormats.find((f) => f.formatId === g.formatId);
            const filesize = rawFmt?.filesize;
            const barWidth = filesize ? Math.max(2, (filesize / maxFilesize) * 100) : 0;
            const meta = g.isAudioOnly
              ? ''
              : [rawFmt?.ext, rawFmt?.fps ? `${rawFmt.fps}fps` : null, rawFmt?.dynamicRange ?? null, filesize ? humanSize(filesize) : null]
                  .filter(Boolean)
                  .join(' · ');

            return (
              <RadioOption
                key={g.formatId || 'audio-only'}
                checked={isChecked}
                disabled={subtitleOnlyPreset}
                onClick={() => setSelectedVideoFormatId(g.formatId)}
                label={g.resolution}
                labelClassName="min-w-[68px]"
                meta={
                  <>
                    {!g.isAudioOnly && (
                      <div className="w-[32px] h-[2px] bg-accent rounded-full flex-shrink-0">
                        <div
                          className={cn('h-full rounded-full bg-[var(--brand)]', isChecked ? 'opacity-100' : 'opacity-25')}
                          style={{ width: barWidth > 0 ? `${barWidth}%` : '0%' }}
                        />
                      </div>
                    )}
                    {meta && (
                      <span
                        className="text-[13px] ml-auto whitespace-nowrap"
                        style={{ color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)' }}
                      >
                        {meta}
                      </span>
                    )}
                  </>
                }
              />
            );
          })}
        </div>

        {/* Audio column */}
        <div className="flex flex-col gap-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] mb-[6px]">
            {t('wizard.formats.audio')}
          </p>
          {wizardFormats.filter((f) => f.isAudioOnly).map((fmt) => {
            const isChecked = selectedAudioFormatId === fmt.formatId;
            return (
              <RadioOption
                key={fmt.formatId}
                checked={isChecked}
                disabled={subtitleOnlyPreset}
                onClick={() => setAudioFormatId(fmt.formatId)}
                label={fmt.ext}
                meta={
                  <span
                    className="text-[11px] ml-auto whitespace-nowrap"
                    style={{ color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)' }}
                  >
                    {fmt.label}
                  </span>
                }
              />
            );
          })}
          <RadioOption
            checked={selectedAudioFormatId === null}
            disabled={isAudioOnly || subtitleOnlyPreset}
            onClick={() => setAudioFormatId(null)}
            label={t('wizard.formats.noAudio')}
            meta={<span className="text-[11px] text-[var(--text-subtle)] ml-auto whitespace-nowrap">{t('wizard.formats.videoOnly')}</span>}
          />

          <MascotBubble
            image={choosingImg}
            message={t('wizard.formats.mascot')}
            side="right"
            className="mt-3"
          />
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex items-center justify-between sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <span className="text-[13px] text-muted-foreground">
          {subtitleOnlyPreset ? (
            t('presets.subtitle-only.label')
          ) : selectedFilesize ? (
            <>{t('wizard.formats.total')} <span className="text-[17px] font-bold text-[var(--brand)]">~{humanSize(selectedFilesize)}</span></>
          ) : isAudioOnly ? (
            t('wizard.formats.audioOnly')
          ) : (
            t('wizard.formats.sizeUnknown')
          )}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={resetWizard}
            className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground"
          >
            {t('common.back')}
          </Button>
          <Button
            type="button"
            onClick={confirmFormats}
            disabled={!canContinue}
            className="shadow-[0_4px_14px_var(--brand-glow)]"
          >
            {t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}

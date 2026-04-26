import { useState, type JSX } from 'react';
import type { Preset } from '@shared/types';
import { humanSize } from '@shared/format';
import { useAppStore, groupVideoFormats, PRESET_LABELS } from '../store/useAppStore';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Separator } from './ui/separator';
import { RadioOption } from './ui/radio-option';
import { cn } from '@renderer/lib/utils';
import { VideoSummaryCard } from './VideoSummaryCard';
import { MascotBubble } from './MascotBubble';
import choosingImg from '../assets/Choosing.png';
import downloadingImg from '../assets/Downloading.png';

const PRESET_DESCRIPTIONS: Record<Preset, string> = {
  'best-quality': 'Highest resolution + best audio',
  balanced: '720p max + good audio',
  'audio-only': 'No video, best audio',
  'small-file': 'Lowest resolution + low audio'
};

const PRESET_OPTIONS: { value: Preset; label: string; desc: string }[] =
  (Object.keys(PRESET_LABELS) as Preset[]).map((value) => ({
    value,
    label: PRESET_LABELS[value],
    desc: PRESET_DESCRIPTIONS[value]
  }));

export function StepFormatSelect(): JSX.Element {
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
  const canContinue = !(isAudioOnly && selectedAudioFormatId === null);

  const uniqueExts = [...new Set(wizardFormats.filter((f) => f.isVideoOnly).map((f) => f.ext))];
  const uniqueDynamicRanges = [...new Set(wizardFormats.filter((f) => f.isVideoOnly).map((f) => f.dynamicRange ?? 'SDR'))];

  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const selectedFilesize = selectedFormat?.filesize;

  const currentResolutionLabel =
    selectedVideoFormatId === ''
      ? 'Audio only'
      : groupVideoFormats(wizardFormats).find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? '';

  const maxFilesize = Math.max(
    ...videoGroups
      .filter((g) => !g.isAudioOnly)
      .map((g) => filteredFormats.find((f) => f.formatId === g.formatId)?.filesize ?? 0),
    1
  );

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
          Sniffing out the best formats for you…
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
          <div className="spinner" aria-label="Loading formats" />
          <span>Usually takes a second</span>
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
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Quick presets</p>
        <ToggleGroup
          value={activePreset ? [activePreset] : []}
          onValueChange={(vals) => { if (vals[0]) setPreset(vals[0] as Preset); }}
          className="grid grid-cols-4 gap-1.5 w-full"
        >
          {PRESET_OPTIONS.map((p) => (
            <ToggleGroupItem
              key={p.value}
              value={p.value}
              className="flex flex-col items-start gap-0.5 py-1.5 px-2.5 rounded-[8px] border h-auto text-left w-full aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] border-[var(--border-strong)] bg-secondary/60 hover:border-muted-foreground hover:-translate-y-0.5 transition-all"
            >
              <span className="text-[13px] font-semibold shrink-0 text-foreground">
                {p.label}
              </span>
              <span className="text-[11px] text-[var(--text-subtle)] leading-snug line-clamp-2">{p.desc}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-[20px]">
        {/* Video column */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-[6px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Video</p>
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
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] mb-[6px]">Audio</p>
          {wizardFormats.filter((f) => f.isAudioOnly).map((fmt) => {
            const isChecked = selectedAudioFormatId === fmt.formatId;
            return (
              <RadioOption
                key={fmt.formatId}
                checked={isChecked}
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
            disabled={isAudioOnly}
            onClick={() => setAudioFormatId(null)}
            label="No audio"
            meta={<span className="text-[11px] text-[var(--text-subtle)] ml-auto whitespace-nowrap">Video only</span>}
          />

          <MascotBubble
            image={choosingImg}
            message="Best + Best = max quality. I'd pick that!"
            side="right"
            className="mt-3"
          />
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex items-center justify-between sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <span className="text-[13px] text-muted-foreground">
          {selectedFilesize ? (
            <>Total <span className="text-[17px] font-bold text-[var(--brand)]">~{humanSize(selectedFilesize)}</span></>
          ) : isAudioOnly ? (
            'Audio only'
          ) : (
            'Size unknown'
          )}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={resetWizard}
            className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={confirmFormats}
            disabled={!canContinue}
            className="shadow-[0_4px_14px_var(--brand-glow)]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

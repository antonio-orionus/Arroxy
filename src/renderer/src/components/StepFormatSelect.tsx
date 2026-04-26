import { useState, type JSX } from 'react';
import type { AudioQuality, FormatOption, Preset } from '@shared/types';
import { useAppStore, groupVideoFormats } from '../store/useAppStore';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { cn } from '@renderer/lib/utils';
import { VideoSummaryCard } from './VideoSummaryCard';
import { MascotBubble } from './MascotBubble';
import choosingImg from '../assets/Choosing.png';

const AUDIO_OPTIONS: { value: AudioQuality; label: string; sublabel: string }[] = [
  { value: 'best', label: 'Best', sublabel: 'Highest available bitrate' },
  { value: 'good', label: 'Good', sublabel: 'Up to 128 kbps' },
  { value: 'low', label: 'Low', sublabel: 'Smallest audio file' },
  { value: 'none', label: 'No audio', sublabel: 'Video stream only' }
];

const PRESET_OPTIONS: { value: Preset; label: string; desc: string }[] = [
  { value: 'best-quality', label: 'Best quality', desc: 'Highest resolution + best audio' },
  { value: 'balanced', label: 'Balanced', desc: '720p max + good audio' },
  { value: 'audio-only', label: 'Audio only', desc: 'No video, best audio' },
  { value: 'small-file', label: 'Small file', desc: 'Lowest resolution + low audio' }
];

function humanSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) { value /= 1024; idx += 1; }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function fmtEta(seconds: number): string {
  if (seconds < 60) return '<1m';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h${rm}m` : `${h}h`;
}

function getFormatByResolution(resolution: string, formats: FormatOption[]): FormatOption | undefined {
  return formats.find((f) => f.resolution === resolution);
}

export function StepFormatSelect(): JSX.Element {
  const {
    wizardFormats,
    formatsLoading,
    wizardTitle,
    wizardThumbnail,
    wizardDuration,
    selectedVideoFormatId,
    selectedAudioQuality,
    activePreset,
    setSelectedVideoFormatId,
    setAudioQuality,
    setPreset,
    confirmFormats,
    resetWizard
  } = useAppStore();

  const [extFilter, setExtFilter] = useState<string | null>(null);

  const filteredFormats = extFilter
    ? wizardFormats.filter((f) => f.ext === extFilter)
    : wizardFormats;

  const videoGroups = groupVideoFormats(filteredFormats);
  const isAudioOnly = selectedVideoFormatId === '';
  const canContinue = !(isAudioOnly && selectedAudioQuality === 'none');

  // Unique codec/ext values from video-track-only formats for filter pills
  const uniqueExts = [...new Set(wizardFormats.filter((f) => f.isVideoOnly).map((f) => f.ext))];

  // Selected format's filesize for the summary
  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const selectedFilesize = selectedFormat?.filesize;

  // Resolution label for VideoSummaryCard
  const currentResolutionLabel =
    selectedVideoFormatId === ''
      ? 'Audio only'
      : groupVideoFormats(wizardFormats).find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? '';

  // Max filesize for proportional size bars
  const maxFilesize = Math.max(
    ...videoGroups
      .filter((g) => !g.isAudioOnly)
      .map((g) => getFormatByResolution(g.resolution, filteredFormats)?.filesize ?? 0),
    1
  );

  if (formatsLoading) {
    return (
      <div className="wizard-step flex items-center gap-3 py-6 text-muted-foreground text-sm">
        <div className="spinner" aria-label="Loading formats" />
        <span>Fetching available formats…</span>
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick presets</p>
        <ToggleGroup
          value={activePreset ? [activePreset] : []}
          onValueChange={(vals) => { if (vals[0]) setPreset(vals[0] as Preset); }}
          className="grid grid-cols-4 gap-1.5 w-full"
        >
          {PRESET_OPTIONS.map((p) => (
            <ToggleGroupItem
              key={p.value}
              value={p.value}
              className="flex flex-col items-start gap-0.5 py-1.5 px-2.5 rounded-md border h-auto text-left w-full aria-pressed:border-[var(--color-accent)] aria-pressed:bg-[var(--color-accent-dim)] aria-pressed:shadow-[0_0_0_1px_var(--color-accent)] border-border bg-secondary/60 hover:border-muted-foreground hover:-translate-y-0.5 transition-all"
            >
              <span className="text-[11px] font-semibold shrink-0 group-aria-pressed/toggle:text-[var(--color-accent)] text-foreground">
                {p.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-snug truncate">{p.desc}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Video column */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video</p>
            {uniqueExts.length > 1 && (
              <ToggleGroup
                value={extFilter ? [extFilter] : []}
                onValueChange={(vals) => setExtFilter(vals[0] ?? null)}
                className="gap-1"
              >
                {uniqueExts.map((ext) => (
                  <ToggleGroupItem
                    key={ext}
                    value={ext}
                    className="h-5 px-1.5 rounded-full text-[9px] font-medium border aria-pressed:border-[var(--color-accent)] aria-pressed:bg-[var(--color-accent-dim)] aria-pressed:text-[var(--color-accent)] border-border bg-secondary text-muted-foreground hover:border-muted-foreground"
                  >
                    {ext}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </div>

          {videoGroups.map((g) => {
            const isChecked = selectedVideoFormatId === g.formatId;
            const rawFmt = getFormatByResolution(g.resolution, filteredFormats);
            const filesize = rawFmt?.filesize;
            const barWidth = filesize ? Math.max(2, (filesize / maxFilesize) * 100) : 0;
            const etaSec = filesize ? filesize / 10_485_760 : null;
            const meta = g.isAudioOnly ? '' : [rawFmt?.ext, rawFmt?.fps ? `${rawFmt.fps}fps` : null].filter(Boolean).join(' · ');

            return (
              <label
                key={g.formatId || 'audio-only'}
                className={cn(
                  'flex flex-col gap-0.5 py-0.5 px-2 rounded-md border cursor-pointer transition-colors',
                  isChecked
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                    : 'border-transparent hover:bg-accent'
                )}
              >
                <span className="flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="video-format"
                      value={g.formatId}
                      checked={isChecked}
                      onChange={() => setSelectedVideoFormatId(g.formatId)}
                      className="accent-[var(--color-accent)] shrink-0"
                    />
                    <span className="text-xs font-medium text-foreground">{g.resolution}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {meta && <span className="text-[10px] text-muted-foreground">{meta}</span>}
                    {etaSec !== null && (
                      <span className="text-[9px] text-muted-foreground bg-secondary rounded px-1 py-0.5">
                        {fmtEta(etaSec)}
                      </span>
                    )}
                  </span>
                </span>
                {!g.isAudioOnly && barWidth > 0 && (
                  <div className="h-[2px] rounded-full bg-secondary mx-5">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]/30"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                )}
              </label>
            );
          })}
        </div>

        {/* Audio column */}
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Audio</p>
          <RadioGroup
            value={selectedAudioQuality}
            onValueChange={(val) => setAudioQuality(val as AudioQuality)}
            className="flex flex-col gap-0.5"
          >
            {AUDIO_OPTIONS.map((opt) => {
              const disabled = opt.value === 'none' && isAudioOnly;
              const isChecked = selectedAudioQuality === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center justify-between gap-2 py-0.5 px-2 rounded-md border cursor-pointer transition-colors',
                    disabled && 'opacity-40 cursor-not-allowed',
                    isChecked && !disabled
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                      : 'border-transparent hover:bg-accent'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <RadioGroupItem value={opt.value} disabled={disabled} className="shrink-0" />
                    <span className="text-xs font-medium text-foreground">{opt.label}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{opt.sublabel}</span>
                </label>
              );
            })}
          </RadioGroup>

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
        <span className="text-[11px] text-muted-foreground">
          {selectedFilesize
            ? `~${humanSize(selectedFilesize)} (video)`
            : isAudioOnly
              ? 'Audio only'
              : 'Size unknown'}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={resetWizard}>Back</Button>
          <Button type="button" onClick={confirmFormats} disabled={!canContinue}>Continue</Button>
        </div>
      </div>
    </div>
  );
}

import { useState, type JSX } from 'react';
import type { AudioQuality, FormatOption, Preset } from '@shared/types';
import { useAppStore, groupVideoFormats } from '../store/useAppStore';
import { Button } from './ui/button';
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
      <div className="wizard-step flex items-center gap-3 py-6 text-zinc-500 text-sm">
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quick presets</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_OPTIONS.map((p) => {
            const isActive = activePreset === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPreset(p.value)}
                className={cn(
                  'flex items-baseline gap-1.5 py-1.5 px-2.5 rounded-md border text-left transition-all duration-150',
                  'hover:-translate-y-0.5',
                  isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] shadow-[0_0_0_1px_var(--color-accent)]'
                    : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500'
                )}
              >
                <span className={cn('text-[11px] font-semibold shrink-0', isActive ? 'text-[var(--color-accent)]' : 'text-zinc-100')}>
                  {p.label}
                </span>
                <span className="text-[10px] text-zinc-500 leading-snug truncate">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Video column */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Video</p>
            {uniqueExts.length > 1 && (
              <div className="flex gap-1">
                {uniqueExts.map((ext) => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => setExtFilter(extFilter === ext ? null : ext)}
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[9px] font-medium border transition-colors',
                      extFilter === ext
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-500'
                    )}
                  >
                    {ext}
                  </button>
                ))}
              </div>
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
                    : 'border-transparent hover:bg-zinc-800'
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
                    <span className="text-xs font-medium text-zinc-100">{g.resolution}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {meta && <span className="text-[10px] text-zinc-500">{meta}</span>}
                    {etaSec !== null && (
                      <span className="text-[9px] text-zinc-400 bg-zinc-800 rounded px-1 py-0.5">
                        {fmtEta(etaSec)}
                      </span>
                    )}
                  </span>
                </span>
                {!g.isAudioOnly && barWidth > 0 && (
                  <div className="h-[2px] rounded-full bg-zinc-800 mx-5">
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Audio</p>
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
                    : 'border-transparent hover:bg-zinc-800'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="audio-quality"
                    value={opt.value}
                    checked={isChecked}
                    onChange={() => setAudioQuality(opt.value)}
                    disabled={disabled}
                    className="accent-[var(--color-accent)] shrink-0"
                  />
                  <span className="text-xs font-medium text-zinc-100">{opt.label}</span>
                </span>
                <span className="text-[10px] text-zinc-500 shrink-0">{opt.sublabel}</span>
              </label>
            );
          })}

          <MascotBubble
            image={choosingImg}
            message="Best + Best = max quality. I'd pick that!"
            side="right"
            className="mt-3"
          />
        </div>
      </div>

      <div className="flex items-center justify-between sticky bottom-0 bg-zinc-950 py-3 -mx-6 px-6 border-t border-zinc-800/50">
        <span className="text-[11px] text-zinc-500">
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

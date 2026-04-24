import type { JSX } from 'react';
import type { AudioQuality, Preset } from '@shared/types';
import { useAppStore, groupVideoFormats } from '../store/useAppStore';
import { Button } from './ui/button';
import { cn } from '@renderer/lib/utils';

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

export function StepFormatSelect(): JSX.Element {
  const {
    wizardFormats,
    formatsLoading,
    selectedVideoFormatId,
    selectedAudioQuality,
    activePreset,
    setSelectedVideoFormatId,
    setAudioQuality,
    setPreset,
    confirmFormats,
    resetWizard
  } = useAppStore();

  const videoGroups = groupVideoFormats(wizardFormats);
  const isAudioOnly = selectedVideoFormatId === '';
  const canContinue = !(isAudioOnly && selectedAudioQuality === 'none');

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
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Video</p>
          {videoGroups.map((g) => {
            const isChecked = selectedVideoFormatId === g.formatId;
            const meta = g.isAudioOnly ? '' : g.label.split(' | ').slice(1).join(' · ');
            return (
              <label
                key={g.formatId || 'audio-only'}
                className={cn(
                  'flex items-center justify-between gap-2 py-1 px-2 rounded-md border cursor-pointer transition-colors',
                  isChecked
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                    : 'border-transparent hover:bg-zinc-800'
                )}
              >
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
                {meta && <span className="text-[10px] text-zinc-500 shrink-0">{meta}</span>}
              </label>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">Audio</p>
          {AUDIO_OPTIONS.map((opt) => {
            const disabled = opt.value === 'none' && isAudioOnly;
            const isChecked = selectedAudioQuality === opt.value;
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex items-center justify-between gap-2 py-1 px-2 rounded-md border cursor-pointer transition-colors',
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
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={resetWizard}>Back</Button>
        <Button type="button" onClick={confirmFormats} disabled={!canContinue}>Continue</Button>
      </div>
    </div>
  );
}

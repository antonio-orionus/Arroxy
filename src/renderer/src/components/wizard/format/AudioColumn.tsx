import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { AudioBitrate, AudioConvertTarget, FormatOption } from '@shared/types';
import { AUDIO_CONVERT_TARGETS } from '@shared/audioTargets';
import { AUDIO_BITRATES } from '@shared/schemas';
import type { AudioSelection } from '../../../store/types';
import { useFormatSelectionView } from '../../../store/formatSelectionView';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import { RadioOption } from '../../ui/radio-option';
import { ScrollArea } from '../../ui/scroll-area';
import { MascotBubble } from '../../shared/MascotBubble';
import { cn } from '@renderer/lib/utils';
import choosingImg from '../../../assets/Choosing.png';

interface AudioColumnProps {
  formats: FormatOption[];
  audioSelection: AudioSelection;
  onSelect: (sel: AudioSelection) => void;
}

export function AudioColumn({ formats, audioSelection, onSelect }: AudioColumnProps): JSX.Element {
  const { t } = useTranslation();
  const { mode, audio } = useFormatSelectionView();
  const [audioExtFilter, setAudioExtFilter] = useState<string | null>(null);

  const subtitleOnly = mode === 'subtitle-only';
  const nativeAudios = formats.filter((f) => f.isAudioOnly);
  const nativeExts = [...new Set(nativeAudios.map((f) => f.ext))];
  const convertExts: AudioConvertTarget[] = AUDIO_CONVERT_TARGETS.map((s) => s.target);
  const audioExts = [...nativeExts, ...convertExts.filter((e) => !nativeExts.includes(e))];

  const matchExt = (ext: string): boolean => !audioExtFilter || ext === audioExtFilter;

  const isNativeChecked = (formatId: string): boolean => audioSelection.kind === 'native' && audioSelection.formatId === formatId;
  const isConvertChecked = (target: AudioConvertTarget): boolean => (audioSelection.kind === 'convert-lossless' || audioSelection.kind === 'convert-lossy') && audioSelection.target === target;

  const pickConvert = (target: AudioConvertTarget): AudioSelection => (target === 'wav' ? { kind: 'convert-lossless', target: 'wav' } : { kind: 'convert-lossy', target, bitrateKbps: audio.bitrateStrip.value });

  const bitrateStrip = (
    <div className={cn('flex items-center justify-between mt-2 px-1 transition-opacity', audio.bitrateStrip.blocked && 'opacity-40 pointer-events-none')} data-testid="audio-bitrate-strip">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.convert.bitrate')}</span>
      <ToggleGroup
        value={[String(audio.bitrateStrip.value)]}
        onValueChange={(vals) => {
          if (audioSelection.kind !== 'convert-lossy') return;
          const next = Number(vals[0]) as AudioBitrate;
          if (!AUDIO_BITRATES.includes(next)) return;
          onSelect({ kind: 'convert-lossy', target: audioSelection.target, bitrateKbps: next });
        }}
        className="gap-[3px]"
      >
        {AUDIO_BITRATES.map((rate) => (
          <ToggleGroupItem key={rate} value={String(rate)} className="h-6 px-[10px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
            {rate}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );

  const bitrateTooltipMsg = audio.bitrateStrip.tooltipKey ? t(audio.bitrateStrip.tooltipKey) : null;

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between mb-[6px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.audio')}</p>
        {audioExts.length > 1 && (
          <ToggleGroup value={audioExtFilter ? [audioExtFilter] : []} onValueChange={(vals) => setAudioExtFilter(vals[0] ?? null)} className="gap-[3px]">
            {audioExts.map((ext) => (
              <ToggleGroupItem key={ext} value={ext} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
                {ext}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>

      <ScrollArea className="max-h-[240px]">
        {nativeAudios
          .filter((f) => matchExt(f.ext))
          .map((fmt) => {
            const isChecked = isNativeChecked(fmt.formatId);
            return (
              <RadioOption
                key={fmt.formatId}
                checked={isChecked}
                disabled={subtitleOnly}
                onClick={() => onSelect({ kind: 'native', formatId: fmt.formatId })}
                label={fmt.ext}
                meta={
                  <span className="text-[11px] ml-auto whitespace-nowrap" style={{ color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)' }}>
                    {fmt.label}
                  </span>
                }
              />
            );
          })}

        {convertExts
          .filter((e) => matchExt(e))
          .map((target) => {
            const isChecked = isConvertChecked(target);
            const meta = target === 'wav' ? t('wizard.formats.convert.uncompressed') : t('wizard.formats.convert.label');
            const radio = (
              <RadioOption
                key={`convert-${target}`}
                checked={isChecked}
                disabled={subtitleOnly || audio.convertDisabled}
                onClick={() => onSelect(pickConvert(target))}
                label={target}
                meta={
                  <span className="text-[11px] ml-auto whitespace-nowrap" style={{ color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)' }}>
                    {meta}
                  </span>
                }
              />
            );
            return audio.convertDisabled && !subtitleOnly ? (
              <Tooltip key={`convert-${target}`}>
                <TooltipTrigger render={(props) => <div {...props}>{radio}</div>} />
                <TooltipContent>{t('wizard.formats.convert.requiresAudioOnly')}</TooltipContent>
              </Tooltip>
            ) : (
              radio
            );
          })}

        <RadioOption checked={audioSelection.kind === 'none'} disabled={audio.noAudioDisabled} onClick={() => onSelect({ kind: 'none' })} label={t('wizard.formats.noAudio')} meta={<span className="text-[11px] text-[var(--text-subtle)] ml-auto whitespace-nowrap">{t('wizard.formats.videoOnly')}</span>} />
      </ScrollArea>

      {bitrateTooltipMsg ? (
        <Tooltip>
          <TooltipTrigger render={(props) => <div {...props}>{bitrateStrip}</div>} />
          <TooltipContent>{bitrateTooltipMsg}</TooltipContent>
        </Tooltip>
      ) : (
        bitrateStrip
      )}

      <MascotBubble image={choosingImg} message={t('wizard.formats.mascot')} side="right" className="mt-3" />
    </div>
  );
}

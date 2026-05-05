import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormatOption } from '@shared/types';
import { humanSize } from '@shared/format';
import { groupVideoFormats } from '../../../store/useAppStore';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { RadioOption } from '../../ui/radio-option';
import { ScrollArea } from '../../ui/scroll-area';
import { cn } from '@renderer/lib/utils';

interface VideoColumnProps {
  formats: FormatOption[];
  selectedVideoFormatId: string;
  disabled: boolean;
  onSelect: (formatId: string) => void;
}

export function VideoColumn({ formats, selectedVideoFormatId, disabled, onSelect }: VideoColumnProps): JSX.Element {
  const { t } = useTranslation();
  const [extFilter, setExtFilter] = useState<string | null>(null);
  const [drFilter, setDrFilter] = useState<string | null>(null);

  const filteredFormats = formats.filter((f) => !extFilter || f.ext === extFilter).filter((f) => !drFilter || (drFilter === 'SDR' ? !f.dynamicRange : f.dynamicRange === drFilter));
  const videoGroups = groupVideoFormats(filteredFormats);

  const uniqueExts = [...new Set(formats.filter((f) => f.isVideoOnly).map((f) => f.ext))];
  const uniqueDynamicRanges = [...new Set(formats.filter((f) => f.isVideoOnly).map((f) => f.dynamicRange ?? 'SDR'))];

  const maxFilesize = Math.max(...videoGroups.filter((g) => !g.isAudioOnly).map((g) => filteredFormats.find((f) => f.formatId === g.formatId)?.filesize ?? 0), 1);

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="flex items-center justify-between mb-[6px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.video')}</p>
        <div className="flex items-center gap-[6px]">
          {uniqueDynamicRanges.length > 1 && (
            <ToggleGroup value={drFilter ? [drFilter] : []} onValueChange={(vals) => setDrFilter(vals[0] ?? null)} className="gap-[3px]">
              {uniqueDynamicRanges.map((dr) => (
                <ToggleGroupItem key={dr} value={dr} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
                  {dr}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          {uniqueExts.length > 1 && (
            <ToggleGroup value={extFilter ? [extFilter] : []} onValueChange={(vals) => setExtFilter(vals[0] ?? null)} className="gap-[3px]">
              {uniqueExts.map((ext) => (
                <ToggleGroupItem key={ext} value={ext} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
                  {ext}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {videoGroups.map((g) => {
          const isChecked = selectedVideoFormatId === g.formatId;
          const rawFmt = filteredFormats.find((f) => f.formatId === g.formatId);
          const filesize = rawFmt?.filesize;
          const barWidth = filesize ? Math.max(2, (filesize / maxFilesize) * 100) : 0;
          const meta = g.isAudioOnly ? '' : [rawFmt?.ext, rawFmt?.fps ? `${rawFmt.fps}fps` : null, rawFmt?.dynamicRange ?? null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' · ');

          return (
            <RadioOption
              key={g.formatId || 'audio-only'}
              checked={isChecked}
              disabled={disabled}
              onClick={() => onSelect(g.formatId)}
              label={g.resolution}
              labelClassName="min-w-[68px]"
              meta={
                <>
                  {!g.isAudioOnly && (
                    <div className="w-[32px] h-[2px] bg-accent rounded-full flex-shrink-0">
                      <div className={cn('h-full rounded-full bg-[var(--brand)]', isChecked ? 'opacity-100' : 'opacity-25')} style={{ width: barWidth > 0 ? `${barWidth}%` : '0%' }} />
                    </div>
                  )}
                  {meta && (
                    <span
                      className="text-[13px] ml-auto whitespace-nowrap"
                      style={{
                        color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)'
                      }}
                    >
                      {meta}
                    </span>
                  )}
                </>
              }
            />
          );
        })}
      </ScrollArea>
    </div>
  );
}

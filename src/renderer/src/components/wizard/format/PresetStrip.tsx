import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { Preset } from '@shared/types';
import { presetOptions } from '../../../store/useAppStore';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';

interface PresetStripProps {
  activePreset: Preset | null;
  onSelect: (p: Preset) => void;
}

export function PresetStrip({ activePreset, onSelect }: PresetStripProps): JSX.Element {
  const { t } = useTranslation();
  const options = presetOptions();

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.quickPresets')}</p>
      <ToggleGroup
        value={activePreset ? [activePreset] : []}
        onValueChange={(vals) => {
          if (vals[0]) onSelect(vals[0] as Preset);
        }}
        className="grid grid-cols-5 gap-1.5 w-full"
      >
        {options.map((p) => (
          <Tooltip key={p.value}>
            <TooltipTrigger
              render={(props) => (
                <ToggleGroupItem {...props} value={p.value} className="flex items-center justify-center py-1.5 px-2.5 rounded-[8px] border h-auto w-full aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] border-[var(--border-strong)] bg-secondary/60 hover:border-muted-foreground hover:-translate-y-0.5 transition-all">
                  <span className="text-[13px] font-semibold text-foreground truncate">{p.label}</span>
                </ToggleGroupItem>
              )}
            />
            <TooltipContent>{p.desc}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  );
}

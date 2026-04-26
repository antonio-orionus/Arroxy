import { useState, useMemo, type JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@renderer/lib/utils';
import { VideoSummaryCard } from './VideoSummaryCard';

interface Location {
  id: string;
  label: string;
  icon: string;
  path: string | null;
}

function matchLocation(dir: string, locations: Location[]): string {
  const preset = locations.find((l) => l.path !== null && l.path === dir);
  return preset?.id ?? 'custom';
}

function RadioDot({ checked }: { checked: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'w-[13px] h-[13px] rounded-full border-2 flex-shrink-0 transition-colors',
        checked
          ? 'border-[var(--brand)] bg-[var(--brand)] shadow-[0_0_0_2px_var(--brand-dim)]'
          : 'border-[var(--border-strong)]'
      )}
    />
  );
}

export function StepFolderConfirm(): JSX.Element {
  const {
    wizardOutputDir,
    wizardThumbnail,
    wizardTitle,
    wizardDuration,
    commonPaths,
    confirmFolder
  } = useAppStore();

  const locations = useMemo<Location[]>(() => [
    { id: 'downloads', label: 'Downloads', icon: '📁', path: commonPaths?.downloads ?? null },
    { id: 'videos',    label: 'Movies',    icon: '🎬', path: commonPaths?.videos ?? null },
    { id: 'desktop',   label: 'Desktop',   icon: '🖥', path: commonPaths?.desktop ?? null },
    { id: 'custom',    label: 'Custom…',   icon: '📂', path: null },
  ], [commonPaths]);

  const [selectedId, setSelectedId] = useState<string>(() => matchLocation(wizardOutputDir, locations));

  function goBack(): void {
    useAppStore.setState({ wizardStep: 'formats' });
  }

  async function handleSelect(loc: Location): Promise<void> {
    if (loc.path !== null) {
      setSelectedId(loc.id);
      useAppStore.setState({ wizardOutputDir: loc.path });
      await window.appApi.settings.update({ defaultOutputDir: loc.path });
    } else {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      setSelectedId('custom');
      useAppStore.setState({ wizardOutputDir: result.data.path });
      await window.appApi.settings.update({ defaultOutputDir: result.data.path });
    }
  }

  const displayPath = (loc: Location): string | null => {
    if (loc.path === null && selectedId === 'custom') return wizardOutputDir || null;
    if (loc.path === null) return null;
    const home = commonPaths?.downloads?.replace(/[/\\][^/\\]+$/, '');
    if (home && loc.path.startsWith(home)) {
      return loc.path.replace(home, '~');
    }
    return loc.path;
  };

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-folder">
      <VideoSummaryCard
        thumbnail={wizardThumbnail}
        title={wizardTitle}
        duration={wizardDuration}
      />

      <div className="flex flex-col gap-1.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Save to</p>
        <div className="flex flex-col gap-1">
          {locations.map((loc) => {
            const isSelected = selectedId === loc.id;
            const path = displayPath(loc);
            return (
              <div
                key={loc.id}
                onClick={() => void handleSelect(loc)}
                className={cn(
                  'flex items-center gap-3 py-[5px] px-[8px] rounded-[6px] cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-[var(--brand-dim)]'
                    : 'hover:bg-accent'
                )}
              >
                <RadioDot checked={isSelected} />
                <span className="text-base leading-none" aria-hidden>{loc.icon}</span>
                <span
                  className={cn(
                    'text-[11px] font-medium flex-1',
                    isSelected ? 'font-semibold text-[var(--brand)]' : 'text-muted-foreground'
                  )}
                >
                  {loc.label}
                </span>
                {path && (
                  <code className="font-mono text-[10px] text-[var(--text-subtle)] truncate max-w-xs">
                    {path}
                  </code>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <Button
          variant="ghost"
          type="button"
          onClick={goBack}
          className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={confirmFolder}
          disabled={!wizardOutputDir}
          className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

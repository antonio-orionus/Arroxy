import { useState, useMemo, type JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
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
    // Shorten common path prefix to ~
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Save to</p>
        <ul className="flex flex-col gap-1">
          {locations.map((loc) => {
            const isSelected = selectedId === loc.id;
            const path = displayPath(loc);
            return (
              <li key={loc.id}>
                <label
                  className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-lg border cursor-pointer transition-colors',
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                      : 'border-transparent hover:bg-zinc-800/60'
                  )}
                >
                  <input
                    type="radio"
                    name="save-location"
                    value={loc.id}
                    checked={isSelected}
                    onChange={() => void handleSelect(loc)}
                    className="accent-[var(--color-accent)] shrink-0"
                  />
                  <span className="text-base" aria-hidden>{loc.icon}</span>
                  <span className="text-sm font-medium text-zinc-100 flex-1">{loc.label}</span>
                  {path && (
                    <code className="font-mono text-[10px] text-zinc-500 truncate max-w-[160px]">
                      {path}
                    </code>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-zinc-950 py-3 -mx-6 px-6 border-t border-zinc-800/50">
        <Button variant="ghost" type="button" onClick={goBack}>Back</Button>
        <Button type="button" onClick={confirmFolder} disabled={!wizardOutputDir}>Continue</Button>
      </div>
    </div>
  );
}

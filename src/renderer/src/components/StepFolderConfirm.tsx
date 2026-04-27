import { useState, useMemo, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { RadioOption } from './ui/radio-option';
import { formatHomeRelativePath } from '@renderer/lib/utils';
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
  const { t } = useTranslation();
  const {
    wizardOutputDir,
    wizardThumbnail,
    wizardTitle,
    wizardDuration,
    commonPaths,
    confirmFolder,
    goToStep,
    setWizardOutputDir
  } = useAppStore();

  const locations = useMemo<Location[]>(() => [
    { id: 'downloads', label: t('wizard.folder.downloads'), icon: '📁', path: commonPaths?.downloads ?? null },
    { id: 'videos',    label: t('wizard.folder.videos'),    icon: '🎬', path: commonPaths?.videos ?? null },
    { id: 'desktop',   label: t('wizard.folder.desktop'),   icon: '🖥', path: commonPaths?.desktop ?? null },
    { id: 'custom',    label: t('wizard.folder.custom'),    icon: '📂', path: null },
  ], [commonPaths, t]);

  const [selectedId, setSelectedId] = useState<string>(() => matchLocation(wizardOutputDir, locations));

  async function handleSelect(loc: Location): Promise<void> {
    if (loc.path !== null) {
      setSelectedId(loc.id);
      await setWizardOutputDir(loc.path);
    } else {
      const result = await window.appApi.dialog.chooseFolder();
      if (!result.ok || !result.data.path) return;
      setSelectedId('custom');
      await setWizardOutputDir(result.data.path);
    }
  }

  const displayPath = (loc: Location): string | null => {
    if (loc.path === null && selectedId === 'custom') return wizardOutputDir || null;
    if (loc.path === null) return null;
    return formatHomeRelativePath(loc.path, commonPaths);
  };

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-folder">
      <VideoSummaryCard
        thumbnail={wizardThumbnail}
        title={wizardTitle}
        duration={wizardDuration}
      />

      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          {t('wizard.folder.heading')}
        </p>
        <div className="flex flex-col gap-1">
          {locations.map((loc) => {
            const isSelected = selectedId === loc.id;
            const path = displayPath(loc);
            return (
              <RadioOption
                key={loc.id}
                checked={isSelected}
                onClick={() => void handleSelect(loc)}
                className="gap-3"
                labelClassName="flex-1"
                adornment={<span className="text-base leading-none" aria-hidden>{loc.icon}</span>}
                label={loc.label}
                meta={path && (
                  <code className="font-mono text-[12px] text-[var(--text-subtle)] truncate max-w-xs">
                    {path}
                  </code>
                )}
              />
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <Button
          variant="ghost"
          type="button"
          onClick={() => goToStep('formats')}
          className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground"
        >
          {t('common.back')}
        </Button>
        <Button
          type="button"
          onClick={confirmFolder}
          disabled={!wizardOutputDir}
          className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none"
        >
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

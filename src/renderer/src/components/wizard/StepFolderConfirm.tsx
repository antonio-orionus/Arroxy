import { useState, useMemo, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { RadioOption } from '../ui/radio-option';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { formatHomeRelativePath } from '@renderer/lib/utils';
import { isValidSubfolder } from '@renderer/lib/path';
import { VideoSummaryCard } from '../shared/VideoSummaryCard';

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
  const { wizardOutputDir, wizardThumbnail, wizardTitle, wizardDuration, commonPaths, advance, back, setWizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName, setWizardSubfolderEnabled, setWizardSubfolderName } = useAppStore();

  const { presets, custom, locations } = useMemo(() => {
    const presets: Location[] = (
      [
        {
          id: 'downloads',
          label: t('wizard.folder.downloads'),
          icon: '📁',
          path: commonPaths?.downloads ?? null
        },
        {
          id: 'music',
          label: t('wizard.folder.music'),
          icon: '🎵',
          path: commonPaths?.music ?? null
        },
        {
          id: 'videos',
          label: t('wizard.folder.videos'),
          icon: '🎬',
          path: commonPaths?.videos ?? null
        },
        {
          id: 'desktop',
          label: t('wizard.folder.desktop'),
          icon: '🖥',
          path: commonPaths?.desktop ?? null
        },
        {
          id: 'documents',
          label: t('wizard.folder.documents'),
          icon: '📄',
          path: commonPaths?.documents ?? null
        },
        {
          id: 'pictures',
          label: t('wizard.folder.pictures'),
          icon: '🖼',
          path: commonPaths?.pictures ?? null
        },
        { id: 'home', label: t('wizard.folder.home'), icon: '🏠', path: commonPaths?.home ?? null }
      ] as Location[]
    ).filter((p) => p.path !== null);
    const custom: Location = {
      id: 'custom',
      label: t('wizard.folder.custom'),
      icon: '📂',
      path: null
    };
    return { presets, custom, locations: [...presets, custom] };
  }, [commonPaths, t]);

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

  const renderRadio = (loc: Location, full: boolean): JSX.Element => {
    const isSelected = selectedId === loc.id;
    const path = displayPath(loc);
    return (
      <RadioOption
        key={loc.id}
        checked={isSelected}
        onClick={() => void handleSelect(loc)}
        className={full ? 'col-span-2 gap-3' : 'gap-3'}
        labelClassName="flex-1 truncate"
        adornment={
          <span className="text-base leading-none" aria-hidden>
            {loc.icon}
          </span>
        }
        label={loc.label}
        meta={path && <code className="font-mono text-[12px] text-[var(--text-subtle)] truncate max-w-[140px]">{path}</code>}
      />
    );
  };

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-folder">
      <VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} />

      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.folder.heading')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((loc) => renderRadio(loc, false))}
          {renderRadio(custom, true)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Switch checked={wizardSubfolderEnabled} onCheckedChange={setWizardSubfolderEnabled} aria-label={t('wizard.folder.subfolder.toggle')} />
          <span className="text-[13px] font-medium text-foreground">{t('wizard.folder.subfolder.toggle')}</span>
        </label>
        <Input type="text" value={wizardSubfolderName} onChange={(e) => setWizardSubfolderName(e.target.value)} disabled={!wizardSubfolderEnabled} placeholder={t('wizard.folder.subfolder.placeholder')} maxLength={64} aria-invalid={wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName)} className="ml-[42px] w-[calc(100%-42px)]" />
        {wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName) && <p className="ml-[42px] text-[12px] text-destructive">{t('wizard.folder.subfolder.invalid')}</p>}
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <Button variant="ghost" type="button" onClick={back} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
          {t('common.back')}
        </Button>
        <Button type="button" onClick={advance} disabled={!wizardOutputDir || (wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName))} className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

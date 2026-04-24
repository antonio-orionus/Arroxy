import type { JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';

export function StepFolderConfirm(): JSX.Element {
  const { wizardOutputDir, chooseWizardFolder, confirmFolder } = useAppStore();

  function goBack(): void {
    useAppStore.setState({ wizardStep: 'formats' });
  }

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-folder">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Save to</h2>
        <p className="text-sm text-zinc-500">Where should the file be saved?</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5">
        <code className="font-mono text-xs text-zinc-400 flex-1 truncate">
          {wizardOutputDir || 'No folder selected'}
        </code>
        <Button variant="secondary" size="sm" type="button" onClick={() => void chooseWizardFolder()}>
          Change…
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={goBack}>Back</Button>
        <Button type="button" onClick={confirmFolder} disabled={!wizardOutputDir}>Continue</Button>
      </div>
    </div>
  );
}

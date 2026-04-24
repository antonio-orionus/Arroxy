import { useEffect, useRef, type JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function StepUrlInput(): JSX.Element {
  const { wizardUrl, setWizardUrl, submitUrl } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && wizardUrl.trim()) {
      void submitUrl();
    }
  }

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-url">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Paste a YouTube URL</h2>
        <p className="text-sm text-zinc-500">Video, playlist item, or short — any YouTube link works.</p>
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="url"
          className="flex-1"
          value={wizardUrl}
          onChange={(e) => setWizardUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://www.youtube.com/watch?v=..."
          spellCheck={false}
          data-testid="url-input"
        />
        <Button
          type="button"
          onClick={() => void submitUrl()}
          disabled={!wizardUrl.trim()}
          data-testid="btn-find-formats"
        >
          Find Formats
        </Button>
      </div>
    </div>
  );
}

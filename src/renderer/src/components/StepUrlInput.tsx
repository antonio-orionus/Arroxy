import { useEffect, useRef, type JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MascotBubble } from './MascotBubble';
import hiImg from '../assets/Hi.png';
import downloadingImg from '../assets/Downloading.png';

export function StepUrlInput(): JSX.Element {
  const { wizardUrl, setWizardUrl, submitUrl, queue } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasActiveDownloads = queue.some((i) => i.status === 'downloading');

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
        <h2 className="text-lg font-semibold text-foreground mb-1">Paste a YouTube URL</h2>
        <MascotBubble
          image={hasActiveDownloads ? downloadingImg : hiImg}
      message={
  hasActiveDownloads
    ? 'Downloading in the background… I can multitask 😎'
    : 'Drop me a YouTube link (video or Short) — then hit “Fetch formats” and I’ll get to work ✨'
}
          className="mt-2"
        />
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
          className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none"
        >
          Fetch formats →
        </Button>
      </div>
    </div>
  );
}

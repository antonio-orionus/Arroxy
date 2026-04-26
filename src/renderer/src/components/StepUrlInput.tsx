import { useEffect, useRef, type JSX } from 'react';
import { ArrowRight } from 'lucide-react';
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
      <MascotBubble
        image={hasActiveDownloads ? downloadingImg : hiImg}
        message={
          hasActiveDownloads
            ? 'Downloading in the background… I can multitask 😎'
            : 'Drop me a YouTube link (video or Short) — then hit "Fetch formats" and I\'ll get to work ✨'
        }
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">YouTube URL</p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="url"
            className="flex-1 h-10"
            value={wizardUrl}
            onChange={(e) => setWizardUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://www.youtube.com/watch?v=..."
            spellCheck={false}
            data-testid="url-input"
          />
          <Button
            type="button"
            size="lg"
            onClick={() => void submitUrl()}
            disabled={!wizardUrl.trim()}
            data-testid="btn-find-formats"
            className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none gap-2"
          >
            Fetch formats <ArrowRight size={16} />
          </Button>
        </div>
        <p className="text-[12px] text-[var(--text-subtle)]">Supports youtube.com and youtu.be links</p>
      </div>
    </div>
  );
}

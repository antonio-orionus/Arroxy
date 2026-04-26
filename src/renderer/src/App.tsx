import { useEffect, useState, type JSX } from 'react';
import { useAppStore } from './store/useAppStore';
import { TitleBar } from './components/TitleBar';
import { WizardPanel } from './components/WizardPanel';
import { SmartDrawer } from './components/SmartDrawer';
import { SplashScreen } from './components/SplashScreen';
import { FeedbackNudge } from './components/FeedbackNudge';
import { TooltipProvider } from './components/ui/tooltip';
import { cn } from './lib/utils';

const FEEDBACK_URL = 'https://github.com/antonio-orionus/Arroxy/issues/new/choose';

function buildDebugInfo(): string {
  const ua = navigator.userAgent;
  const electron = ua.match(/Electron\/([\d.]+)/)?.[1] ?? 'unknown';
  const chrome = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? 'unknown';
  return [`Platform: ${window.platform}`, `Electron: ${electron}`, `Chrome: ${chrome}`].join('\n');
}

export function App(): JSX.Element {
  const { initialized, initialize, openLogs, uiZoom, setUiZoom, warmupFailures } = useAppStore();
  const [debugCopied, setDebugCopied] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  function copyDebugInfo(): void {
    void navigator.clipboard.writeText(buildDebugInfo()).then(() => {
      setDebugCopied(true);
      setTimeout(() => setDebugCopied(false), 1500);
    });
  }

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const delay = (window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS as number ?? 45_000;
    const t = setTimeout(() => setShowNudge(true), delay);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showNudge) return;
    const t = setTimeout(() => setShowNudge(false), 8_000);
    return () => clearTimeout(t);
  }, [showNudge]);

  return (
    <TooltipProvider>
    <div className="relative flex flex-col h-screen w-screen bg-background overflow-hidden" data-testid="app-root">
      <TitleBar />

      <div className="flex-1 flex flex-col overflow-hidden" data-testid="app-content">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[700px] mx-auto" style={{ zoom: uiZoom }}>
            <WizardPanel />
          </div>
        </div>
        <SmartDrawer />
      </div>

      <footer className="shrink-0 flex items-center justify-between border-t border-border px-4 h-7">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom - 0.05)}
            disabled={uiZoom <= 0.7}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label="Zoom out"
          >−</button>
          <span className="text-[11px] text-muted-foreground w-8 text-center tabular-nums">
            {Math.round(uiZoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom + 0.05)}
            disabled={uiZoom >= 1.5}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label="Zoom in"
          >+</button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-foreground/80 transition-colors"
            onClick={copyDebugInfo}
            title="Copy Electron version, OS, and Chrome version to clipboard"
          >
            {debugCopied ? 'Copied!' : 'Copy debug info'}
          </button>
          <div className="relative">
            <FeedbackNudge
              visible={showNudge}
              message="Enjoying Arroxy? I'd love to hear from you! 💬"
            />
            <button
              type="button"
              className={cn(
                'text-[11px] transition-colors',
                showNudge ? 'feedback-btn-nudging' : 'text-muted-foreground hover:text-foreground/80'
              )}
              onClick={() => {
                setShowNudge(false);
                void window.appApi.shell.openExternal(FEEDBACK_URL);
              }}
              data-testid="btn-feedback"
            >
              Feedback
            </button>
          </div>
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-foreground/80 transition-colors"
            onClick={() => void openLogs()}
            data-testid="btn-logs"
          >
            Logs
          </button>
        </div>
      </footer>

      <SplashScreen initialized={initialized} warmupFailures={warmupFailures} />
    </div>
    </TooltipProvider>
  );
}

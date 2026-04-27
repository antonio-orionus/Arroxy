import { useEffect, useState, type JSX } from 'react';
import { Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store/useAppStore';
import { TitleBar } from './components/TitleBar';
import { WizardPanel } from './components/WizardPanel';
import { SmartDrawer } from './components/SmartDrawer';
import { SplashScreen } from './components/SplashScreen';
import { FeedbackNudge } from './components/FeedbackNudge';
import { UpdateBanner } from './components/UpdateBanner';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguagePicker } from './components/LanguagePicker';
import { TooltipProvider } from './components/ui/tooltip';
import { cn } from './lib/utils';
import type { UpdateAvailablePayload } from '@shared/types';

const FEEDBACK_URL = 'https://github.com/antonio-orionus/Arroxy/issues/new/choose';

function buildDebugInfo(): string {
  const ua = navigator.userAgent;
  const electron = ua.match(/Electron\/([\d.]+)/)?.[1] ?? 'unknown';
  const chrome = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? 'unknown';
  return [`Platform: ${window.platform}`, `Electron: ${electron}`, `Chrome: ${chrome}`].join('\n');
}

export function App(): JSX.Element {
  const { t } = useTranslation();
  const { initialized, initialize, openLogs, uiZoom, setUiZoom, uiTheme, warmupFailures } = useAppStore();
  const [debugCopied, setDebugCopied] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateAvailablePayload | null>(null);
  const [installing, setInstalling] = useState(false);

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
    return window.appApi.updater.onUpdateAvailable(setUpdateInfo);
  }, []);

  function handleInstall(): void {
    setInstalling(true);
    void window.appApi.updater.install();
  }

  function handleDownload(): void {
    void window.appApi.shell.openExternal('https://github.com/antonio-orionus/Arroxy/releases/latest');
    setUpdateInfo(null);
  }

  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function apply(): void {
      html.classList.toggle('dark', uiTheme === 'dark' || (uiTheme === 'system' && mq.matches));
    }

    apply();
    if (uiTheme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [uiTheme]);

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

      {updateInfo && (
        <UpdateBanner
          info={updateInfo}
          installing={installing}
          onInstall={handleInstall}
          onDownload={handleDownload}
          onDismiss={() => setUpdateInfo(null)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden" data-testid="app-content">
        <div className="flex-1 flex flex-col overflow-hidden" style={{ zoom: uiZoom }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <WizardPanel />
          </div>
          <SmartDrawer />
        </div>
      </div>

      <footer className="shrink-0 flex items-center justify-between border-t border-border px-4 h-7">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom - 0.05)}
            disabled={uiZoom <= 0.7}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label={t('app.zoomOut')}
          >−</button>
          <span className="text-[13px] text-muted-foreground w-8 text-center tabular-nums">
            {Math.round(uiZoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom + 0.05)}
            disabled={uiZoom >= 1.5}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label={t('app.zoomIn')}
          >+</button>
          <div className="w-px h-3 bg-border mx-1" aria-hidden />
          <ThemeToggle />
          <div className="w-px h-3 bg-border mx-1" aria-hidden />
          <LanguagePicker />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors"
            onClick={copyDebugInfo}
            title={debugCopied ? t('app.debugCopied') : t('app.debugCopyTitle')}
            data-testid="btn-debug"
          >
            <Bug size={14} />
          </button>
          <div className="relative">
            <FeedbackNudge
              visible={showNudge}
              message={t('app.feedbackNudge')}
            />
            <button
              type="button"
              className={cn(
                'text-[13px] transition-colors',
                showNudge ? 'feedback-btn-nudging' : 'text-muted-foreground hover:text-foreground/80'
              )}
              onClick={() => {
                setShowNudge(false);
                void window.appApi.shell.openExternal(FEEDBACK_URL);
              }}
              data-testid="btn-feedback"
            >
              {t('app.feedback')}
            </button>
          </div>
          <button
            type="button"
            className="text-[13px] text-muted-foreground hover:text-foreground/80 transition-colors"
            onClick={() => void openLogs()}
            data-testid="btn-logs"
          >
            {t('app.logs')}
          </button>
        </div>
      </footer>

      <SplashScreen initialized={initialized} warmupFailures={warmupFailures} />
    </div>
    </TooltipProvider>
  );
}

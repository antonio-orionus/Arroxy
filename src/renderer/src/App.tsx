import { useEffect, type JSX } from 'react';
import { useAppStore } from './store/useAppStore';
import { TitleBar } from './components/TitleBar';
import { WizardPanel } from './components/WizardPanel';
import { QueuePanel } from './components/QueuePanel';

export function App(): JSX.Element {
  const { initialized, initialize, openLogs, uiZoom, setUiZoom } = useAppStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 overflow-hidden" data-testid="app-root">
      <TitleBar />

      {initialized ? (
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-testid="app-content">
          <div className="max-w-[700px] mx-auto" style={{ zoom: uiZoom }}>
            <WizardPanel />
            <QueuePanel />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" data-testid="app-loading">
          <div className="spinner" aria-label="Loading" />
        </div>
      )}

      <footer className="shrink-0 flex items-center justify-between border-t border-zinc-800 px-4 h-7">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom - 0.05)}
            disabled={uiZoom <= 0.7}
            className="w-4 h-4 flex items-center justify-center text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label="Zoom out"
          >−</button>
          <span className="text-[11px] text-zinc-600 w-8 text-center tabular-nums">
            {Math.round(uiZoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setUiZoom(uiZoom + 0.05)}
            disabled={uiZoom >= 1.5}
            className="w-4 h-4 flex items-center justify-center text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
            aria-label="Zoom in"
          >+</button>
        </div>
        <button
          type="button"
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
          onClick={() => void openLogs()}
          data-testid="btn-logs"
        >
          Logs
        </button>
      </footer>
    </div>
  );
}

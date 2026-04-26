import { useEffect, useState, type JSX } from 'react';
import { Minus, Square, Minimize2, X } from 'lucide-react';
import { cn } from '@renderer/lib/utils';
import appIcon from '@renderer/assets/App-icon-HQ.png';

const drag: React.CSSProperties = { WebkitAppRegion: 'drag' } as React.CSSProperties;
const noDrag: React.CSSProperties = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

const isMac = window.platform === 'darwin';

function MacControls({ isMaximized }: { isMaximized: boolean }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5" style={noDrag} data-testid="window-controls-mac">
      <button
        type="button"
        aria-label="Close"
        data-testid="wc-close"
        onClick={() => void window.appApi.window.close()}
        className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#e0443e] transition-colors flex items-center justify-center"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#820005] leading-none">✕</span>
      </button>
      <button
        type="button"
        aria-label="Minimize"
        data-testid="wc-minimize"
        onClick={() => void window.appApi.window.minimize()}
        className="group w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#d4a000] transition-colors flex items-center justify-center"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#985700] leading-none">−</span>
      </button>
      <button
        type="button"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        data-testid="wc-maximize"
        onClick={() => void window.appApi.window.maximize()}
        className="group w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1aaa2f] transition-colors flex items-center justify-center"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#006500] leading-none">
          {isMaximized ? '⊟' : '+'}
        </span>
      </button>
    </div>
  );
}

function WinLinuxControls({ isMaximized }: { isMaximized: boolean }): JSX.Element {
  return (
    <div className="flex items-center" style={noDrag} data-testid="window-controls-win">
      <button
        type="button"
        aria-label="Minimize"
        data-testid="wc-minimize"
        onClick={() => void window.appApi.window.minimize()}
        className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Minus size={10} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        data-testid="wc-maximize"
        onClick={() => void window.appApi.window.maximize()}
        className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {isMaximized
          ? <Minimize2 size={11} strokeWidth={2.5} />
          : <Square size={10} strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        aria-label="Close"
        data-testid="wc-close"
        onClick={() => void window.appApi.window.close()}
        className="h-8 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[var(--color-status-error)] transition-colors"
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    void window.appApi.window.isMaximized().then(setIsMaximized);
    return window.appApi.window.onMaximizedChange(setIsMaximized);
  }, []);

  return (
    <div
      className={cn(
        'flex items-center h-9 border-b border-border select-none shrink-0',
        isMac ? 'pl-3 pr-2' : 'pl-4 pr-0'
      )}
      style={drag}
      data-testid="title-bar"
    >
      {isMac && <MacControls isMaximized={isMaximized} />}

      <span
        className={cn(
          'flex-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground tracking-wide',
          isMac ? 'justify-center' : 'pl-1'
        )}
      >
        <img src={appIcon} alt="" width={14} height={14} className="opacity-70" draggable={false} />
        Arroxy
      </span>

      {!isMac && <WinLinuxControls isMaximized={isMaximized} />}
    </div>
  );
}

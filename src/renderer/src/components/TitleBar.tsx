import { useEffect, useState, type JSX } from 'react';
import { cn } from '@renderer/lib/utils';

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
        <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-[#820005] leading-none">✕</span>
      </button>
      <button
        type="button"
        aria-label="Minimize"
        data-testid="wc-minimize"
        onClick={() => void window.appApi.window.minimize()}
        className="group w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#d4a000] transition-colors flex items-center justify-center"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-[#985700] leading-none">−</span>
      </button>
      <button
        type="button"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        data-testid="wc-maximize"
        onClick={() => void window.appApi.window.maximize()}
        className="group w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1aaa2f] transition-colors flex items-center justify-center"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-[#006500] leading-none">
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
        className="h-8 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm"
      >
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        data-testid="wc-maximize"
        onClick={() => void window.appApi.window.maximize()}
        className="h-8 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        {isMaximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="0" width="8" height="8" />
            <polyline points="0,2 0,10 8,10" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Close"
        data-testid="wc-close"
        onClick={() => void window.appApi.window.close()}
        className="h-8 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-red-600 transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
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
        'flex items-center h-9 border-b border-zinc-800 select-none shrink-0',
        isMac ? 'pl-3 pr-2' : 'pl-4 pr-0'
      )}
      style={drag}
      data-testid="title-bar"
    >
      {isMac && <MacControls isMaximized={isMaximized} />}

      <span
        className={cn(
          'flex-1 text-xs font-medium text-zinc-500 tracking-wide',
          isMac ? 'text-center' : 'pl-1'
        )}
      >
        YT Download
      </span>

      {!isMac && <WinLinuxControls isMaximized={isMaximized} />}
    </div>
  );
}

import { useState, type JSX } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { playlistScopeSchema, PLAYLIST_PROBE_LIMIT_MAX, PLAYLIST_PROBE_LIMIT_MIN } from '@shared/schemas.js';
import type { PlaylistScope } from '@shared/types.js';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { Input } from '../ui/input.js';
import { RadioOption } from '../ui/radio-option.js';

type ItemMode = PlaylistScope['items']['kind'];

interface PlaylistScopeControlProps {
  onApplyScope?: (scope: PlaylistScope) => Promise<void> | void;
  applyLabel?: string;
  pendingLabel?: string;
  disabled?: boolean;
}

function copy(t: TFunction, key: string, defaultValue: string, values: Record<string, string | number> = {}): string {
  return t(key, { defaultValue, ...values });
}

function scopeSummary(scope: PlaylistScope, appLimit: number, t: TFunction): string {
  return scope.items.kind === 'app-limit' ? copy(t, 'wizard.url.playlistScope.summaryAppLimit', 'Load first {{count}} items', { count: appLimit }) : scope.items.kind === 'first' ? copy(t, 'wizard.url.playlistScope.summaryFirst', 'Load first {{count}} items', { count: scope.items.count }) : copy(t, 'wizard.url.playlistScope.summaryRange', 'Load items {{from}}-{{to}}', { from: scope.items.from, to: scope.items.to });
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  return 'Unknown error';
}

export function PlaylistScopeControl({ onApplyScope, applyLabel, pendingLabel, disabled = false }: PlaylistScopeControlProps): JSX.Element {
  const { t } = useTranslation();
  const { playlistScope, setPlaylistScope, settings } = useAppStore();
  const appLimit = resolvePlaylistProbeLimit(settings?.common);
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [mode, setMode] = useState<ItemMode>(playlistScope.items.kind);
  const [firstDraft, setFirstDraft] = useState(playlistScope.items.kind === 'first' ? String(playlistScope.items.count) : String(appLimit));
  const [fromDraft, setFromDraft] = useState(playlistScope.items.kind === 'range' ? String(playlistScope.items.from) : '1');
  const [toDraft, setToDraft] = useState(playlistScope.items.kind === 'range' ? String(playlistScope.items.to) : String(appLimit));
  const [applyError, setApplyError] = useState<string | null>(null);

  function syncDraftsFromScope(): void {
    setMode(playlistScope.items.kind);
    setFirstDraft(playlistScope.items.kind === 'first' ? String(playlistScope.items.count) : String(appLimit));
    setFromDraft(playlistScope.items.kind === 'range' ? String(playlistScope.items.from) : '1');
    setToDraft(playlistScope.items.kind === 'range' ? String(playlistScope.items.to) : String(appLimit));
    setApplyError(null);
  }

  function parseScope(): PlaylistScope | null {
    const items = mode === 'app-limit' ? { kind: 'app-limit' as const } : mode === 'first' ? { kind: 'first' as const, count: Number(firstDraft) } : { kind: 'range' as const, from: Number(fromDraft), to: Number(toDraft) };
    const candidate = { items };
    const parsed = playlistScopeSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  }

  const parsedScope = parseScope();

  function resetDrafts(): void {
    setMode('app-limit');
    setFirstDraft(String(appLimit));
    setFromDraft('1');
    setToDraft(String(appLimit));
    setApplyError(null);
  }

  async function applyScope(): Promise<void> {
    if (!parsedScope) return;
    setApplyError(null);
    if (onApplyScope) {
      setApplying(true);
      try {
        await onApplyScope(parsedScope);
        setOpen(false);
      } catch (error) {
        setApplyError(copy(t, 'wizard.url.playlistScope.applyError', 'Could not apply that playlist scope: {{message}}', { message: errorMessage(error) }));
      } finally {
        setApplying(false);
      }
      return;
    }
    setPlaylistScope(parsedScope);
    setOpen(false);
  }

  return (
    <section className="rounded-md border border-[var(--border-strong)] bg-card/40 px-3 py-2.5" data-testid="playlist-scope-control">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{copy(t, 'wizard.url.playlistScope.label', 'Playlist scope')}</p>
          <p className="mt-1 truncate text-[12px] text-foreground" data-testid="playlist-scope-summary">
            {scopeSummary(playlistScope, appLimit, t)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            syncDraftsFromScope();
            setOpen(true);
          }}
          data-testid="playlist-scope-change"
          disabled={disabled || applying}
        >
          <SlidersHorizontal size={14} />
          {copy(t, 'wizard.url.playlistScope.change', 'Change')}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="playlist-scope-dialog">
          <DialogHeader>
            <DialogTitle>{copy(t, 'wizard.url.playlistScope.dialogTitle', 'Playlist scope')}</DialogTitle>
            <DialogDescription>{copy(t, 'wizard.url.playlistScope.dialogDescription', 'Choose what Arroxy asks yt-dlp to load for this playlist.')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">{copy(t, 'wizard.url.playlistScope.itemsLabel', 'Items to load')}</span>
              <div className="grid gap-1" role="radiogroup" aria-label={copy(t, 'wizard.url.playlistScope.itemsLabel', 'Items to load')}>
                <RadioOption label={copy(t, 'wizard.url.playlistScope.appLimit', 'Use app limit: {{count}}', { count: appLimit })} checked={mode === 'app-limit'} onClick={() => setMode('app-limit')} />
                <RadioOption label={copy(t, 'wizard.url.playlistScope.first', 'First')} checked={mode === 'first'} onClick={() => setMode('first')} />
                {mode === 'first' && <Input type="number" min={PLAYLIST_PROBE_LIMIT_MIN} max={PLAYLIST_PROBE_LIMIT_MAX} value={firstDraft} onChange={(event) => setFirstDraft(event.target.value)} className="h-8 font-mono" data-testid="playlist-scope-first-input" />}
                <RadioOption label={copy(t, 'wizard.url.playlistScope.range', 'Range')} checked={mode === 'range'} onClick={() => setMode('range')} />
                {mode === 'range' && (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Input type="number" min={PLAYLIST_PROBE_LIMIT_MIN} max={PLAYLIST_PROBE_LIMIT_MAX} value={fromDraft} onChange={(event) => setFromDraft(event.target.value)} className="h-8 font-mono" data-testid="playlist-scope-range-from" />
                    <span className="text-[11px] text-[var(--text-subtle)]">{copy(t, 'wizard.url.playlistScope.to', 'to')}</span>
                    <Input type="number" min={PLAYLIST_PROBE_LIMIT_MIN} max={PLAYLIST_PROBE_LIMIT_MAX} value={toDraft} onChange={(event) => setToDraft(event.target.value)} className="h-8 font-mono" data-testid="playlist-scope-range-to" />
                  </div>
                )}
              </div>
            </div>
            {!parsedScope && <p className="text-[11px] text-amber-500">{copy(t, 'wizard.url.playlistScope.invalid', 'Use whole item numbers from 1 to 5000, with the start no higher than the end.')}</p>}
            {applyError ? (
              <p className="text-[11px] text-amber-500" data-testid="playlist-scope-apply-error">
                {applyError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetDrafts} data-testid="playlist-scope-reset">
              {copy(t, 'wizard.url.playlistScope.reset', 'Reset')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {copy(t, 'wizard.url.playlistScope.cancel', 'Cancel')}
            </Button>
            <Button type="button" onClick={() => void applyScope()} disabled={!parsedScope || applying} data-testid="playlist-scope-apply">
              {applying ? (pendingLabel ?? copy(t, 'wizard.url.playlistScope.reloading', 'Reloading...')) : (applyLabel ?? copy(t, 'wizard.url.playlistScope.apply', 'Apply'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { type JSX, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FolderCheck, FolderSearch, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Checkbox } from '../ui/checkbox.js';
import { Input } from '../ui/input.js';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert.js';
import { WizardStepFooterActions } from './WizardStepFooterActions.js';
import { isAudioOnlySource } from '@shared/ytdlp/extractorPredicates.js';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { resolvePlaylistDir } from '../../store/wizard/playlistDir.js';
import { formatDuration } from '@renderer/lib/formatDuration.js';
import { notify } from '@renderer/lib/notify.js';
import { PlaylistProbeLimitSelector } from './PlaylistProbeLimitSelector.js';
import { PlaylistScopeControl } from './PlaylistScopeControl.js';

// undefined = no duration metadata (common for nested-playlist entries from
// music search, channel root, etc.) — render an em-dash instead of falsely
// labeling them "live".
function formatEntryDuration(seconds: number | undefined, liveLabel: string): string {
  if (seconds === undefined) return '—';
  return formatDuration(seconds, liveLabel);
}

export function StepPlaylistItems(): JSX.Element {
  const { t } = useTranslation();
  const store = useAppStore();
  const { playlistItems, selectedPlaylistItemIds, playlistTitle, playlistProbeLoading, playlistScopeReloading, playlistScopeError, playlistLikelyCapped, syncedDownloadedIds, syncScanState, setPlaylistItemSelected, selectAllPlaylistItems, selectNonePlaylistItems, selectPlaylistRange, confirmPlaylistSelection, back, wizardExtractor, scanDownloadedInFolder, applyFolderSync, setPlaylistFolder, settings, reloadPlaylistWithScope, retryFormatProbe } = store;

  // Effective folder the playlist's files land in (and where the scan looks) —
  // the same resolver the queue builder + scan use, so display == download == scan.
  const syncDir = resolvePlaylistDir(store);

  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  // Lets the user dismiss the sync alert (or hide it after applying) without
  // re-running the scan. Reset implicitly whenever a new scan completes.
  const [syncDismissed, setSyncDismissed] = useState(false);

  const foundCount = syncedDownloadedIds.length;

  function changeSyncFolder(): void {
    // Open at the current playlist dir; the pick becomes base+subfolder via
    // setPlaylistFolder (single SSOT), then we rescan the new location. State
    // only changes after a successful pick + folder write, so a rejected dialog
    // or failed settings persist can't leave the sync UI inconsistent.
    void (async () => {
      try {
        const res = await window.appApi.dialog.chooseFolder(syncDir || undefined);
        if (!res.ok || !res.data.path) return;
        await setPlaylistFolder(res.data.path);
        setSyncDismissed(false);
        void scanDownloadedInFolder();
      } catch (error) {
        notify.folderSelectFailed(error);
      }
    })();
  }

  const parentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: playlistItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5
  });

  const selectedCount = selectedPlaylistItemIds.length;
  const playlistLimit = resolvePlaylistProbeLimit(settings?.common);
  const showProbeLimitAlert = !playlistProbeLoading && playlistLikelyCapped;
  const probeLimitDescription = t('wizard.playlist.probeLimitAlertDesc', { count: playlistLimit });
  // yt-dlp's --flat-playlist returns thumbnails for some extractors
  // (YouTube tab) but not others (PornHub paged list, generic). When no
  // entry has one, hide the thumbnail slot entirely so the list renders
  // compactly instead of showing 500 empty boxes.
  const hasAnyThumbnail = useMemo(() => playlistItems.some((e) => !!e.thumbnail), [playlistItems]);
  const canContinue = selectedCount > 0;

  function applyRange(): void {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (!isNaN(from) && !isNaN(to)) selectPlaylistRange(from, to);
  }

  const liveLabel = t('wizard.playlist.durationUnknown');

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3" data-testid="step-playlist-items">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold truncate">{playlistTitle || t('wizard.playlist.heading')}</h2>
        <span className="shrink-0 text-xs text-muted-foreground">{t(isAudioOnlySource(wizardExtractor) ? 'wizard.playlist.itemCountAudio' : 'wizard.playlist.itemCount', { count: playlistItems.length })}</span>
      </div>

      <PlaylistScopeControl applyLabel={t('wizard.url.playlistScope.applyReload', { defaultValue: 'Apply and reload' })} pendingLabel={t('wizard.url.playlistScope.reloading', { defaultValue: 'Reloading...' })} disabled={playlistProbeLoading || playlistScopeReloading} onApplyScope={reloadPlaylistWithScope} />

      {playlistScopeError ? (
        <Alert variant="warning" className="flex items-start gap-3" data-testid="playlist-scope-error">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <AlertTitle>{t('wizard.url.playlistScope.emptyTitle', { defaultValue: 'No videos in that scope' })}</AlertTitle>
            <AlertDescription className="break-words">{playlistScopeError}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {showProbeLimitAlert && (
        <Alert variant="warning" className="flex items-start gap-3" data-testid="playlist-probe-limit-alert">
          <Info className="mt-0.5 size-4 shrink-0 text-sky-500" />
          <div className="min-w-0 flex-1">
            <AlertTitle>{t('wizard.playlist.probeLimitAlertTitle')}</AlertTitle>
            <AlertDescription className="break-words">{probeLimitDescription}</AlertDescription>
          </div>
          <PlaylistProbeLimitSelector testId="playlist-alert-probe-limit" showCurrent={false} onLimitChanged={() => retryFormatProbe()} className="w-40" />
        </Alert>
      )}

      {playlistProbeLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">{t('wizard.playlist.loadingItems')}</div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" onClick={selectAllPlaylistItems}>
              {t('wizard.playlist.selectAll')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={selectNonePlaylistItems}>
              {t('wizard.playlist.selectNone')}
            </Button>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeFrom')}</span>
              <Input className="h-7 w-14 px-2 text-xs" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} placeholder="1" />
              <span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeTo')}</span>
              <Input className="h-7 w-14 px-2 text-xs" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} placeholder="10" />
              <Button type="button" variant="outline" size="sm" onClick={applyRange}>
                {t('wizard.playlist.rangeApply')}
              </Button>
            </div>
          </div>

          {syncScanState === 'scanning' && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderSearch size={13} />
              {t('wizard.playlist.syncScanning')}
            </p>
          )}

          {syncScanState === 'done' && !syncDismissed && foundCount > 0 && (
            <Alert variant="success" className="flex items-start gap-3">
              <FolderCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <AlertTitle>{t('wizard.playlist.syncFoundTitle')}</AlertTitle>
                <AlertDescription className="break-words">{t('wizard.playlist.syncFoundDesc', { n: foundCount, dir: syncDir })}</AlertDescription>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      applyFolderSync();
                      setSyncDismissed(true);
                    }}
                  >
                    {t('wizard.playlist.syncApply')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={changeSyncFolder}>
                    {t('wizard.playlist.syncChange')}
                  </Button>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" className="-mt-1 -me-1 shrink-0" aria-label={t('titleBar.close')} onClick={() => setSyncDismissed(true)}>
                <X />
              </Button>
            </Alert>
          )}

          {syncScanState === 'done' && !syncDismissed && foundCount === 0 && (
            <Alert variant="info" className="flex items-start gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-sky-500" />
              <div className="min-w-0 flex-1">
                <AlertTitle>{t('wizard.playlist.syncNoneTitle')}</AlertTitle>
                <AlertDescription className="break-words">{t('wizard.playlist.syncNoneDesc', { dir: syncDir })}</AlertDescription>
                <div className="mt-2.5">
                  <Button type="button" variant="outline" size="sm" onClick={changeSyncFolder}>
                    {t('wizard.playlist.syncChange')}
                  </Button>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" className="-mt-1 -me-1 shrink-0" aria-label={t('titleBar.close')} onClick={() => setSyncDismissed(true)}>
                <X />
              </Button>
            </Alert>
          )}

          <div ref={parentRef} className="h-[calc(100vh-280px)] min-h-[300px] overflow-y-auto rounded-md border border-border">
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const entry = playlistItems[virtualRow.index];
                const checked = selectedPlaylistItemIds.includes(entry.id);
                const isAlreadyDownloaded = !!(entry.videoId && syncedDownloadedIds.includes(entry.videoId));
                return (
                  <div
                    key={entry.id}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{ position: 'absolute', top: virtualRow.start, left: 0, right: 0 }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setPlaylistItemSelected(entry.id, !checked)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') setPlaylistItemSelected(entry.id, !checked);
                    }}
                  >
                    <Checkbox checked={checked} onCheckedChange={(v) => setPlaylistItemSelected(entry.id, !!v)} onClick={(e) => e.stopPropagation()} />
                    {hasAnyThumbnail ? entry.thumbnail ? <img src={entry.thumbnail} alt={t('wizard.playlist.thumbnailAlt')} referrerPolicy="no-referrer" className="h-8 w-[56px] shrink-0 rounded-sm object-cover" loading="lazy" /> : <div className="h-8 w-[56px] shrink-0 rounded-sm bg-muted" /> : null}
                    <span className="flex-1 truncate text-sm">{entry.title}</span>
                    {isAlreadyDownloaded && <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t('wizard.playlist.alreadyDownloaded')}</span>}
                    <span className="shrink-0 text-xs text-muted-foreground">{formatEntryDuration(entry.duration, liveLabel)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCount > 0 ? <p className="text-xs text-muted-foreground">{t('wizard.playlist.selectedCount_other', { count: selectedCount })}</p> : <p className="text-xs text-destructive">{t('wizard.playlist.noSelection')}</p>}
        </>
      )}

      <WizardStepFooterActions onBack={back} onContinue={() => void confirmPlaylistSelection()} continueDisabled={!canContinue} />
    </div>
  );
}

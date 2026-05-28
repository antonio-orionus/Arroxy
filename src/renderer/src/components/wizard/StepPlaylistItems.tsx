import { type JSX, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Checkbox } from '../ui/checkbox.js';
import { Input } from '../ui/input.js';
import { WizardStepFooterActions } from './WizardStepFooterActions.js';
import { isAudioOnlySource } from '@shared/ytdlp/extractorPredicates.js';
import { formatDuration } from '@renderer/lib/formatDuration.js';

// undefined = no duration metadata (common for nested-playlist entries from
// music search, channel root, etc.) — render an em-dash instead of falsely
// labeling them "live".
function formatEntryDuration(seconds: number | undefined, liveLabel: string): string {
  if (seconds === undefined) return '—';
  return formatDuration(seconds, liveLabel);
}

export function StepPlaylistItems(): JSX.Element {
  const { t } = useTranslation();
  const { playlistItems, selectedPlaylistItemIds, playlistTitle, playlistProbeLoading, syncedDownloadedIds, wizardOutputDir, setPlaylistItemSelected, selectAllPlaylistItems, selectNonePlaylistItems, selectPlaylistRange, confirmPlaylistSelection, back, wizardExtractor, syncWithFolder, chooseWizardFolder } = useAppStore();

  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [syncOpen, setSyncOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: playlistItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5
  });

  const selectedCount = selectedPlaylistItemIds.length;
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
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold truncate">{playlistTitle || t('wizard.playlist.heading')}</h2>
        <span className="shrink-0 text-xs text-muted-foreground">{t(isAudioOnlySource(wizardExtractor) ? 'wizard.playlist.itemCountAudio' : 'wizard.playlist.itemCount', { count: playlistItems.length })}</span>
      </div>

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
            <Button type="button" variant="outline" size="sm" onClick={() => setSyncOpen((v) => !v)}>
              {t('wizard.playlist.syncWithFolder')}
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

          {syncOpen && (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground shrink-0">{t('wizard.playlist.syncPanelDir')}</span>
                <span className="flex-1 truncate font-mono text-[11px]">{wizardOutputDir || '—'}</span>
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => void chooseWizardFolder()}>
                  {t('wizard.playlist.syncChange')}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void syncWithFolder()}>
                  {t('wizard.playlist.syncApply')}
                </Button>
                {syncedDownloadedIds.length === 0 && <span className="text-xs text-muted-foreground">{t('wizard.playlist.syncNoPriorDownloads')}</span>}
              </div>
            </div>
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

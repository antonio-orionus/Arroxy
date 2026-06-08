import { type JSX } from 'react';
import { AlertTriangle } from 'lucide-react';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { PlaylistProbeLimitSelector } from './PlaylistProbeLimitSelector.js';

export function QuickPlaylistCapDialog(): JSX.Element {
  const quickPlaylistCapDialogOpen = useAppStore((state) => state.quickPlaylistCapDialogOpen);
  const playlistItems = useAppStore((state) => state.playlistItems);
  const playlistTitle = useAppStore((state) => state.playlistTitle);
  const isSubmittingToQueue = useAppStore((state) => state.isSubmittingToQueue);
  const settings = useAppStore((state) => state.settings);
  const dismissQuickPlaylistCapDialog = useAppStore((state) => state.dismissQuickPlaylistCapDialog);
  const queueLoadedPlaylistWithActiveProfile = useAppStore((state) => state.queueLoadedPlaylistWithActiveProfile);
  const retryFormatProbe = useAppStore((state) => state.retryFormatProbe);
  const playlistLimit = resolvePlaylistProbeLimit(settings?.common);
  const itemCount = playlistItems.length;

  return (
    <Dialog
      open={quickPlaylistCapDialogOpen}
      onOpenChange={(open) => {
        if (!open) dismissQuickPlaylistCapDialog();
      }}
    >
      <DialogContent data-testid="quick-playlist-cap-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500" aria-hidden />
            Playlist scan is capped
          </DialogTitle>
          <DialogDescription>
            {playlistTitle ? `${playlistTitle}: ` : ''}Arroxy loaded {itemCount} item{itemCount === 1 ? '' : 's'} using the current limit of {playlistLimit}. Queue the loaded items now, or increase the limit and scan again.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-background/30 p-3">
          <p className="mb-2 text-[12px] font-semibold text-foreground">Change load limit</p>
          <PlaylistProbeLimitSelector
            testId="quick-playlist-cap-probe-limit"
            showCurrent={false}
            onLimitChanged={() => {
              dismissQuickPlaylistCapDialog();
              void retryFormatProbe();
            }}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={dismissQuickPlaylistCapDialog}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void queueLoadedPlaylistWithActiveProfile()} disabled={itemCount === 0 || isSubmittingToQueue} data-testid="quick-playlist-cap-queue-loaded" className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
            Queue loaded items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

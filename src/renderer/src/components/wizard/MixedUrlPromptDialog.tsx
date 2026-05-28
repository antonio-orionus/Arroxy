import { useEffect, useRef, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js';
import { useAppStore } from '../../store/useAppStore.js';

// Mixed YouTube URLs (?v=X&list=Y) are ambiguous: yt-dlp's default routes
// Radio/Mix lists to playlist enumeration, which rarely matches user intent
// (they clicked a specific video). The wizardSlice opens this dialog before
// probing whenever it detects the mixed pattern; the user's choice flows
// through to the probe IPC as `playlistMode: 'video' | 'playlist'`.
export function MixedUrlPromptDialog(): JSX.Element {
  const { t } = useTranslation();
  const { mixedUrlPromptOpen, dismissMixedPrompt, openAdvancedSettings, settings } = useAppStore();
  const playlistButtonRef = useRef<HTMLButtonElement>(null);
  const playlistLimit = resolvePlaylistProbeLimit(settings?.common);

  useEffect(() => {
    if (mixedUrlPromptOpen) playlistButtonRef.current?.focus();
  }, [mixedUrlPromptOpen]);

  return (
    <Dialog open={mixedUrlPromptOpen} onOpenChange={() => undefined}>
      <DialogContent>
        <DialogTitle>{t('wizard.mixedPrompt.title')}</DialogTitle>
        <DialogDescription>{t('wizard.mixedPrompt.body')}</DialogDescription>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-[var(--border-strong)] bg-card/40 px-3 py-2 text-[12px]" data-testid="mixed-playlist-cap">
          <span className="text-[var(--text-subtle)]">{t('wizard.mixedPrompt.playlistLimit', { count: playlistLimit })}</span>
          <button type="button" className="font-medium text-[var(--brand)] hover:underline" onClick={() => openAdvancedSettings('network')} data-testid="mixed-open-advanced">
            {t('wizard.mixedPrompt.advancedSettings')}
          </button>
        </div>
        <DialogFooter>
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <Button {...props} type="button" variant="outline" onClick={() => void dismissMixedPrompt('video')}>
                  {t('wizard.mixedPrompt.singleVideo')}
                </Button>
              )}
            />
            <TooltipContent className="max-w-[18rem] leading-snug" data-testid="mixed-single-tooltip">
              {t('wizard.mixedPrompt.singleTooltip')}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <Button {...props} ref={playlistButtonRef} type="button" variant="outline" onClick={() => void dismissMixedPrompt('playlist')}>
                  {t('wizard.mixedPrompt.pickFromPlaylist')}
                </Button>
              )}
            />
            <TooltipContent className="max-w-[18rem] leading-snug" data-testid="mixed-playlist-tooltip">
              {t('wizard.mixedPrompt.playlistTooltip')}
            </TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { type JSX, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface Props {
  open: boolean;
  url: string | null;
  onUse: () => void;
  onDisable: () => void;
  onCancel: () => void;
}

export function ClipboardConfirmDialog({ open, url, onUse, onDisable, onCancel }: Props): JSX.Element {
  const { t } = useTranslation();
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  function handleOpenChange(next: boolean): void {
    // Esc / outside click → treat as cancel.
    if (!next) onCancel();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        data-testid="clipboard-confirm-dialog"
        initialFocus={() => yesButtonRef.current}
      >
        <DialogHeader>
          <DialogTitle>{t('wizard.url.clipboard.dialog.title')}</DialogTitle>
          <DialogDescription>{t('wizard.url.clipboard.dialog.body')}</DialogDescription>
        </DialogHeader>
        {url ? (
          <div
            className="rounded-md border border-[var(--border-strong)] bg-muted/40 px-3 py-2 text-[12px] font-mono text-foreground break-all"
            data-testid="clipboard-confirm-url"
          >
            {url}
          </div>
        ) : null}
        <DialogFooter>
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button
                {...props}
                type="button"
                variant="outline"
                onClick={onDisable}
                data-testid="clipboard-confirm-disable"
                className="sm:mr-auto"
              >
                {t('wizard.url.clipboard.dialog.disableButton')}
              </Button>
            )} />
            <TooltipContent
              side="top"
              className="max-w-xs"
              data-testid="clipboard-confirm-disable-tooltip"
            >
              {t('wizard.url.clipboard.dialog.disableNote')}
            </TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            data-testid="clipboard-confirm-cancel"
          >
            {t('wizard.url.clipboard.dialog.cancelButton')}
          </Button>
          <Button
            ref={yesButtonRef}
            type="button"
            onClick={onUse}
            data-testid="clipboard-confirm-use"
          >
            {t('wizard.url.clipboard.dialog.useButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { type JSX, useRef } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip.js';

export type ClipboardPrompt =
  | {
      kind: 'single';
      url: string;
    }
  | {
      kind: 'bulk';
      raw: string;
      urls: string[];
      ignoredCount: number;
    };

interface Props {
  open: boolean;
  prompt: ClipboardPrompt | null;
  onUse: () => void;
  onFetch: () => void;
  onBulk: () => void;
  onQuickDownload: () => void;
  onDisable: () => void;
  onCancel: () => void;
  quickPreparing: boolean;
}

export function ClipboardConfirmDialog({ open, prompt, onUse, onFetch, onBulk, onQuickDownload, onDisable, onCancel, quickPreparing }: Props): JSX.Element {
  const { t } = useTranslation();
  const fetchButtonRef = useRef<HTMLButtonElement>(null);
  const bulkButtonRef = useRef<HTMLButtonElement>(null);
  const isBulk = prompt?.kind === 'bulk';

  function handleOpenChange(next: boolean): void {
    // Esc / outside click → treat as cancel.
    if (!next) onCancel();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} data-testid="clipboard-confirm-dialog" initialFocus={() => bulkButtonRef.current ?? fetchButtonRef.current} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isBulk ? t('wizard.url.clipboard.dialog.bulkTitle') : t('wizard.url.clipboard.dialog.title')}</DialogTitle>
          <DialogDescription>{isBulk ? t('wizard.url.clipboard.dialog.bulkBody') : t('wizard.url.clipboard.dialog.body')}</DialogDescription>
        </DialogHeader>
        {prompt?.kind === 'single' ? (
          <div className="rounded-md border border-[var(--border-strong)] bg-muted/40 px-3 py-2 text-[12px] font-mono text-foreground break-all" data-testid="clipboard-confirm-url">
            {prompt.url}
          </div>
        ) : null}
        {prompt?.kind === 'bulk' ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-full border border-[var(--border-strong)] bg-muted/40 px-2 py-1 font-medium text-foreground" data-testid="clipboard-confirm-bulk-count">
                {t('wizard.url.clipboard.dialog.bulkSummary', { count: prompt.urls.length })}
              </span>
              {prompt.ignoredCount > 0 ? (
                <span className="text-[var(--text-subtle)]" data-testid="clipboard-confirm-bulk-ignored">
                  {t('wizard.url.clipboard.dialog.bulkIgnored', { count: prompt.ignoredCount })}
                </span>
              ) : null}
            </div>
            <div className="max-h-28 overflow-auto rounded-md border border-[var(--border-strong)] bg-muted/40 px-3 py-2 text-[12px] font-mono text-foreground" data-testid="clipboard-confirm-bulk-preview">
              {prompt.urls.slice(0, 4).map((url) => (
                <div key={url} className="break-all">
                  {url}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <DialogFooter className="sm:flex-wrap sm:items-center">
          <Tooltip>
            <TooltipTrigger
              render={(props) => (
                <Button {...props} type="button" variant="outline" onClick={onDisable} data-testid="clipboard-confirm-disable" className="sm:mr-auto">
                  {t('wizard.url.clipboard.dialog.disableButton')}
                </Button>
              )}
            />
            <TooltipContent side="top" className="max-w-xs" data-testid="clipboard-confirm-disable-tooltip">
              {t('wizard.url.clipboard.dialog.disableNote')}
            </TooltipContent>
          </Tooltip>
          <Button type="button" variant="ghost" onClick={onCancel} data-testid="clipboard-confirm-cancel">
            {t('wizard.url.clipboard.dialog.cancelButton')}
          </Button>
          {isBulk ? (
            <Button ref={bulkButtonRef} type="button" onClick={onBulk} data-testid="clipboard-confirm-bulk" className="shadow-[0_4px_14px_var(--brand-glow)]">
              {t('wizard.url.clipboard.dialog.bulkButton')}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onUse} data-testid="clipboard-confirm-use">
                {t('wizard.url.clipboard.dialog.useButton')}
              </Button>
              <Button type="button" variant="outline" onClick={onQuickDownload} disabled={quickPreparing} data-testid="clipboard-confirm-quick-download" className="gap-2">
                {quickPreparing ? <span className="h-4 w-4 rounded-full border-2 border-current/20 border-t-current animate-spin" aria-hidden /> : <Download size={16} />}
                {quickPreparing ? t('wizard.url.quickPreparing') : t('wizard.url.quickDownload')}
              </Button>
              <Button ref={fetchButtonRef} type="button" onClick={onFetch} disabled={quickPreparing} data-testid="clipboard-confirm-fetch" className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none gap-2">
                {t('wizard.url.fetchFormats')} <ArrowRight size={16} className="rtl:rotate-180" />
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

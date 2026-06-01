import { useRef, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Link2 } from 'lucide-react';
import { parseBulkUrls } from '@shared/bulkUrls.js';
import type { BulkUrlRejectReason } from '@shared/types.js';
import { bulkLogger } from '@renderer/lib/bulkLogger.js';
import { Button } from '../ui/button.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { useAppStore } from '../../store/useAppStore.js';

interface BulkUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRaw?: string;
}

const REJECT_I18N: Record<BulkUrlRejectReason, 'wizard.bulk.reject.duplicate' | 'wizard.bulk.reject.playlist' | 'wizard.bulk.reject.channel'> = {
  duplicate: 'wizard.bulk.reject.duplicate',
  'unsupported-playlist': 'wizard.bulk.reject.playlist',
  'unsupported-channel': 'wizard.bulk.reject.channel'
};

export function BulkUrlDialog({ open, onOpenChange, initialRaw = '' }: BulkUrlDialogProps): JSX.Element {
  const { t } = useTranslation();
  const startBulkUrls = useAppStore((state) => state.startBulkUrls);
  const [raw, setRaw] = useState(initialRaw);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const parsed = parseBulkUrls(raw);
  const canConfirm = parsed.accepted.length >= 2;

  function close(): void {
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean): void {
    if (next) setRaw(initialRaw);
    onOpenChange(next);
  }

  function confirm(): void {
    if (!canConfirm) return;
    bulkLogger.info('Bulk URL dialog confirmed', {
      accepted: parsed.accepted.length,
      rejected: parsed.rejected.length,
      ignored: parsed.ignoredCount
    });
    startBulkUrls(parsed.accepted.map((item) => item.url));
    setRaw('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="bulk-url-dialog" className="sm:max-w-xl" initialFocus={() => textareaRef.current}>
        <DialogHeader>
          <DialogTitle>{t('wizard.bulk.title')}</DialogTitle>
          <DialogDescription>{t('wizard.bulk.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="bulk-url-textarea" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {t('wizard.bulk.textareaLabel')}
          </label>
          <textarea ref={textareaRef} id="bulk-url-textarea" data-testid="bulk-url-textarea" value={raw} onChange={(event) => setRaw(event.target.value)} placeholder={t('wizard.bulk.textareaPlaceholder')} spellCheck={false} className="min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30" />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {t('wizard.bulk.acceptedCount')}{' '}
            <strong className="text-foreground" data-testid="bulk-url-valid-count">
              {parsed.accepted.length}
            </strong>
          </span>
          {parsed.ignoredCount > 0 ? (
            <span data-testid="bulk-url-ignored-count">
              {t('wizard.bulk.ignoredCount')} <strong className="text-foreground">{parsed.ignoredCount}</strong>
            </span>
          ) : null}
        </div>

        <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-secondary/50" data-testid="bulk-url-preview">
          {parsed.accepted.length === 0 && parsed.rejected.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">{t('wizard.bulk.emptyPreview')}</p>
          ) : (
            <div className="divide-y divide-border">
              {parsed.accepted.map((item, index) => (
                <div key={item.url} className="flex items-center gap-2 px-3 py-2 text-xs">
                  <Link2 size={13} className="shrink-0 text-[var(--brand)]" />
                  <span className="shrink-0 font-mono text-muted-foreground">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-foreground/80">{item.url}</span>
                </div>
              ))}
              {parsed.rejected.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 text-xs text-amber-500">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-mono">{item.url}</span>
                  <span className="shrink-0">{t(REJECT_I18N[item.reason])}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!canConfirm ? <p className="text-xs text-muted-foreground">{t('wizard.bulk.needsTwo')}</p> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={confirm} disabled={!canConfirm} data-testid="bulk-url-confirm" className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
            {t('wizard.bulk.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { humanSize } from '@shared/format';
import { useFormatSelectionView } from '../../../store/formatSelectionView';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';

interface FormatFooterProps {
  onBack: () => void;
  onContinue: () => void;
}

export function FormatFooter({ onBack, onContinue }: FormatFooterProps): JSX.Element {
  const { t } = useTranslation();
  const { mode, selectedFilesize, canContinue } = useFormatSelectionView();
  return (
    <>
      <Separator className="bg-border/50 -mx-6 w-auto" />
      <div className="flex items-center justify-between sticky bottom-0 bg-background py-3 -mx-6 px-6">
        <span className="text-[13px] text-muted-foreground">
          {mode === 'subtitle-only' ? (
            t('presets.subtitle-only.label')
          ) : selectedFilesize ? (
            <>
              {t('wizard.formats.total')} <span className="text-[17px] font-bold text-[var(--brand)]">~{humanSize(selectedFilesize)}</span>
            </>
          ) : mode === 'audio-only' ? (
            t('wizard.formats.audioOnly')
          ) : (
            t('wizard.formats.sizeUnknown')
          )}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={onBack} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
            {t('common.back')}
          </Button>
          <Button type="button" onClick={onContinue} disabled={!canContinue} className="shadow-[0_4px_14px_var(--brand-glow)]">
            {t('common.continue')}
          </Button>
        </div>
      </div>
    </>
  );
}

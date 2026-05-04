import { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';

export function StepOutput(): JSX.Element {
  const { t } = useTranslation();
  const { wizardEmbedChapters, wizardEmbedMetadata, wizardEmbedThumbnail, wizardWriteDescription, wizardWriteThumbnail, setEmbedChapters, setEmbedMetadata, setEmbedThumbnail, setWriteDescription, setWriteThumbnail, advance, back } = useAppStore();

  return (
    <div className="wizard-step flex flex-col gap-1.5" data-testid="step-output">
      <div className="flex flex-col gap-3 py-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground">{t('wizard.output.embedChapters.label')}</span>
            <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.output.embedChapters.description')}</span>
          </div>
          <Switch checked={wizardEmbedChapters} onCheckedChange={setEmbedChapters} aria-label={t('wizard.output.embedChapters.label')} data-testid="embed-chapters-toggle" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground">{t('wizard.output.embedMetadata.label')}</span>
            <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.output.embedMetadata.description')}</span>
          </div>
          <Switch checked={wizardEmbedMetadata} onCheckedChange={setEmbedMetadata} aria-label={t('wizard.output.embedMetadata.label')} data-testid="embed-metadata-toggle" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground">{t('wizard.output.embedThumbnail.label')}</span>
            <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.output.embedThumbnail.description')}</span>
          </div>
          <Switch checked={wizardEmbedThumbnail} onCheckedChange={setEmbedThumbnail} aria-label={t('wizard.output.embedThumbnail.label')} data-testid="embed-thumbnail-toggle" />
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />

      <div className="flex flex-col gap-3 py-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground">{t('wizard.output.writeDescription.label')}</span>
            <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.output.writeDescription.description')}</span>
          </div>
          <Switch checked={wizardWriteDescription} onCheckedChange={setWriteDescription} aria-label={t('wizard.output.writeDescription.label')} data-testid="write-description-toggle" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground">{t('wizard.output.writeThumbnail.label')}</span>
            <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.output.writeThumbnail.description')}</span>
          </div>
          <Switch checked={wizardWriteThumbnail} onCheckedChange={setWriteThumbnail} aria-label={t('wizard.output.writeThumbnail.label')} data-testid="write-thumbnail-toggle" />
        </div>
      </div>

      <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
      <div className="flex items-center justify-end py-3 -mx-6 px-6 gap-2">
        <Button variant="ghost" type="button" onClick={back} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
          {t('common.back')}
        </Button>
        <Button type="button" onClick={advance} className="shadow-[0_4px_14px_var(--brand-glow)]">
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

import { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { RadioOption } from '../ui/radio-option';
import { SPONSORBLOCK_CATEGORIES, SPONSORBLOCK_MODES } from '@shared/schemas';
import type { SponsorBlockMode } from '@shared/types';

const SB_MODE_LABEL_KEYS = {
  off: 'wizard.sponsorblock.mode.off',
  mark: 'wizard.sponsorblock.mode.mark',
  remove: 'wizard.sponsorblock.mode.remove'
} as const satisfies Record<SponsorBlockMode, string>;

const SB_MODE_HINT_KEYS = {
  off: 'wizard.sponsorblock.modeHint.off',
  mark: 'wizard.sponsorblock.modeHint.mark',
  remove: 'wizard.sponsorblock.modeHint.remove'
} as const satisfies Record<SponsorBlockMode, string>;

export function StepSponsorBlock(): JSX.Element {
  const { t } = useTranslation();
  const { wizardSponsorBlockMode, wizardSponsorBlockCategories, setSponsorBlockMode, toggleSponsorBlockCategory, advance, back } = useAppStore();

  const showCategories = wizardSponsorBlockMode !== 'off';

  return (
    <div className="wizard-step flex flex-col gap-1.5" data-testid="step-sponsorblock">
      {/* ── Mode ───────────────────────────────────────── */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.sponsorblock.modeHeading')}</span>
        <div role="radiogroup" aria-label={t('wizard.sponsorblock.modeHeading')} className="flex flex-row flex-wrap gap-1">
          {SPONSORBLOCK_MODES.map((mode) => (
            <RadioOption key={mode} label={t(SB_MODE_LABEL_KEYS[mode])} checked={wizardSponsorBlockMode === mode} onClick={() => setSponsorBlockMode(mode)} className="py-0.5" />
          ))}
        </div>

        <span />
        <p className="text-[11px] text-[var(--text-subtle)] leading-snug">{t(SB_MODE_HINT_KEYS[wizardSponsorBlockMode])}</p>
      </div>

      {/* ── Categories (visible when mode is not off) ── */}
      {showCategories && (
        <>
          <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
          <div data-testid="sb-categories">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-2 pt-1 pb-1.5">{t('wizard.sponsorblock.categoriesHeading')}</p>
            <div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
              {SPONSORBLOCK_CATEGORIES.map((cat) => {
                const isChecked = wizardSponsorBlockCategories.includes(cat);
                return (
                  <label key={cat} data-testid={`sb-cat-${cat}`} className="flex w-full items-center gap-2 h-7 px-2 rounded-md text-sm font-medium transition-colors cursor-pointer hover:bg-accent/60 has-[[data-checked]]:bg-[var(--brand-dim)] has-[[data-checked]]:border-l-2 has-[[data-checked]]:border-[var(--brand)] has-[[data-checked]]:text-[var(--brand)]">
                    <Checkbox checked={isChecked} onCheckedChange={() => toggleSponsorBlockCategory(cat)} className="border-[var(--border-strong)] data-checked:border-[var(--brand)] data-checked:bg-[var(--brand)] data-checked:text-white" />
                    <span className="flex-1 text-left truncate">{t(`wizard.sponsorblock.cat.${cat}`)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

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

import { type JSX, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { RadioOption } from '../ui/radio-option';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { MascotBubble } from '../shared/MascotBubble';
import { buildSubtitleList, SUBTITLE_MODE_I18N_KEYS } from '../../lib/subtitleLabel';
import loveImg from '../../assets/Love.png';
import { SUBTITLE_FORMATS, SUBTITLE_MODES } from '@shared/schemas';

export function StepSubtitles(): JSX.Element {
  const { t, i18n } = useTranslation();
  const { wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleLanguages, wizardSubtitleMode, wizardSubtitleFormat, toggleSubtitleLanguage, setSubtitleMode, setSubtitleFormat, advance, back, skipSubtitles } = useAppStore();

  const [query, setQuery] = useState('');

  const allLangs = useMemo(() => buildSubtitleList(wizardSubtitles, wizardAutomaticCaptions, i18n.language), [wizardSubtitles, wizardAutomaticCaptions, i18n.language]);

  const hasLangs = allLangs.length > 0;
  const selectedCount = wizardSubtitleLanguages.length;
  // Show a heads-up when ASS is paired with auto-captions: we force SRT in
  // that combo because our auto-cap dedupe doesn't have an ASS code path.
  const hasAutoSelected = wizardSubtitleLanguages.some((code) => allLangs.find((l) => l.code === code)?.isAuto);
  const showAutoAssNote = hasAutoSelected && wizardSubtitleFormat === 'ass' && wizardSubtitleMode !== 'embed';

  const q = query.trim().toLowerCase();
  const manualLangs = allLangs.filter((l) => !l.isAuto && (!q || l.displayName.toLowerCase().includes(q)));
  const autoLangs = allLangs.filter((l) => l.isAuto && (!q || l.displayName.toLowerCase().includes(q)));
  const noMatches = hasLangs && q !== '' && manualLangs.length === 0 && autoLangs.length === 0;

  const selectedItems = allLangs.filter((l) => wizardSubtitleLanguages.includes(l.code));

  function clearAll(): void {
    for (const { code } of selectedItems) toggleSubtitleLanguage(code);
  }

  const saveModes = SUBTITLE_MODES.map((mode) => ({
    mode,
    label: t(SUBTITLE_MODE_I18N_KEYS[mode])
  }));

  return (
    <div className="wizard-step flex flex-col gap-1.5" data-testid="step-subtitles">
      {/* ── Save as / Format — only relevant when subs exist ─ */}
      {hasLangs && (
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 items-center -mx-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.subtitles.saveMode.heading')}</span>
          <div role="radiogroup" aria-label={t('wizard.subtitles.saveMode.heading')} className="flex flex-row flex-wrap gap-1">
            {saveModes.map(({ mode, label }) => (
              <RadioOption key={mode} label={label} checked={wizardSubtitleMode === mode} onClick={() => setSubtitleMode(mode)} className="py-0.5" />
            ))}
          </div>

          {wizardSubtitleMode === 'embed' ? (
            <>
              <span />
              <p data-testid="subtitle-embed-note" className="text-[11px] text-[var(--text-subtle)] leading-snug">
                {t('wizard.subtitles.embedNote')}
              </p>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-1 shrink-0">{t('wizard.subtitles.format.heading')}</span>
              <div className="flex items-center gap-1.5">
                {SUBTITLE_FORMATS.map((fmt) => (
                  <button key={fmt} type="button" aria-pressed={wizardSubtitleFormat === fmt} onClick={() => setSubtitleFormat(fmt)} className="h-6 px-2 rounded text-[11px] font-semibold uppercase border border-[var(--border-strong)] transition-colors aria-pressed:bg-[var(--brand-dim)] aria-pressed:border-[var(--brand)] aria-pressed:text-[var(--brand)] hover:bg-accent/60">
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}

          {showAutoAssNote && (
            <>
              <span />
              <p data-testid="subtitle-auto-ass-note" className="text-[11px] text-[var(--text-subtle)] leading-snug">
                {t('wizard.subtitles.autoAssNote')}
              </p>
            </>
          )}
        </div>
      )}

      {hasLangs && <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />}

      {/* ── Languages ───────────────────────────────────── */}
      {!hasLangs ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{t('wizard.subtitles.noLanguages')}</p>
        </div>
      ) : (
        <>
          {/* Selected chips row */}
          <div className="flex items-center gap-2 min-h-[28px]">
            <div className="flex flex-1 flex-wrap gap-1.5 overflow-hidden">
              {selectedItems.length === 0 ? (
                <span className="text-[11px] italic text-[var(--text-subtle)]">{t('wizard.subtitles.noSelected')}</span>
              ) : (
                selectedItems.map(({ code, displayName }) => (
                  <span key={code} className="flex items-center gap-1 h-6 pl-2.5 pr-1.5 rounded-full text-[11px] font-semibold bg-[var(--brand)] text-white">
                    {displayName}
                    <button
                      type="button"
                      aria-label={`Remove ${displayName}`}
                      onClick={() => {
                        toggleSubtitleLanguage(code);
                      }}
                      className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X size={9} strokeWidth={3} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedCount > 0 && <span className="text-[11px] text-[var(--text-subtle)]">{selectedCount}</span>}
              {selectedCount > 0 && (
                <button type="button" onClick={clearAll} className="text-[11px] text-[var(--brand)] hover:underline cursor-pointer">
                  {t('wizard.subtitles.clearAll')}
                </button>
              )}
            </div>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder={t('wizard.subtitles.searchPlaceholder')}
              className="w-full h-8 pl-7 pr-3 rounded-md border border-[var(--border-strong)] bg-secondary/60 text-sm text-foreground placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-colors"
            />
          </div>

          {/* Language list */}
          <div className="flex flex-col -mx-1 px-1">
            {noMatches ? (
              <p className="py-4 text-center text-sm text-[var(--text-subtle)]">{t('wizard.subtitles.noMatches')}</p>
            ) : (
              <>
                <LangSection label={t('wizard.subtitles.sectionManual')} items={manualLangs} selected={wizardSubtitleLanguages} onToggle={toggleSubtitleLanguage} autoBadge={t('wizard.subtitles.autoBadge')} />
                <LangSection label={t('wizard.subtitles.sectionAuto')} items={autoLangs} selected={wizardSubtitleLanguages} onToggle={toggleSubtitleLanguage} autoBadge={t('wizard.subtitles.autoBadge')} />
              </>
            )}
          </div>
        </>
      )}

      <Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
      <div className="flex items-center justify-between py-3 -mx-6 px-6">
        {hasLangs ? <MascotBubble image={loveImg} message={t('wizard.subtitles.mascot')} side="left" /> : <span />}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" type="button" onClick={back} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
            {t('common.back')}
          </Button>
          {selectedCount > 0 ? (
            <>
              <Button variant="ghost" type="button" onClick={skipSubtitles} className="border-[1.5px] border-[var(--border-strong)] text-foreground hover:bg-accent/60">
                {t('wizard.subtitles.skipSubs')}
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={(props) => (
                    <Button {...props} type="button" onClick={advance} className="shadow-[0_4px_14px_var(--brand-glow)]">
                      {t('common.continue')}
                    </Button>
                  )}
                />
                <TooltipContent data-testid="subtitle-selected-tooltip">{t('wizard.subtitles.selectedNote', { count: selectedCount })}</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Button type="button" onClick={skipSubtitles} className="shadow-[0_4px_14px_var(--brand-glow)]">
              {hasLangs ? t('wizard.subtitles.skipSubs') : t('wizard.subtitles.skip')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LangSectionProps {
  label: string;
  items: { code: string; displayName: string; isAuto: boolean }[];
  selected: string[];
  onToggle: (code: string) => void;
  autoBadge: string;
}

function LangSection({ label, items, selected, onToggle, autoBadge }: LangSectionProps): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-subtle)] px-2 pt-1.5 pb-0.5">
        {label} ({items.length})
      </p>
      <div className="grid grid-cols-3 gap-x-1">
        {items.map(({ code, displayName, isAuto }) => {
          const isChecked = selected.includes(code);
          return (
            <button
              key={code}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => {
                onToggle(code);
              }}
              className="flex w-full items-center gap-2 h-7 px-2 rounded-md text-sm font-medium transition-colors cursor-pointer aria-checked:bg-[var(--brand-dim)] aria-checked:border-l-2 aria-checked:border-[var(--brand)] aria-checked:text-[var(--brand)] hover:bg-accent/60"
            >
              <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border-strong)] transition-colors" style={isChecked ? { borderColor: 'var(--brand)' } : undefined}>
                {isChecked && <Check size={10} strokeWidth={3} className="text-[var(--brand)]" />}
              </span>
              <span className="flex-1 text-left truncate">{displayName}</span>
              {isAuto && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--brand-dim)] text-[var(--brand)] shrink-0">{autoBadge}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

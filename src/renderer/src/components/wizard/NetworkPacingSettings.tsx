import { useState, type JSX, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PLAYLIST_PROBE_LIMIT, NETWORK_PACING_PRESET_VALUES, PLAYLIST_PROBE_LIMIT_PRESETS } from '@shared/constants.js';
import { PLAYLIST_PROBE_LIMIT_MAX, PLAYLIST_PROBE_LIMIT_MIN, playlistProbeLimitSchema, pacingConcurrentFragmentsSchema, pacingSleepSecondsSchema } from '@shared/schemas.js';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import type { NetworkPacingPreset } from '@shared/types.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Input } from '../ui/input.js';
import { RadioOption } from '../ui/radio-option.js';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js';

const CUSTOM_FIELDS = [
  { key: 'pacingSleepRequests', labelKey: 'sleepRequests', unitKey: 'seconds', testId: 'pacing-sleep-requests' },
  { key: 'pacingSleepInterval', labelKey: 'sleepInterval', unitKey: 'seconds', testId: 'pacing-sleep-interval' },
  { key: 'pacingMaxSleepInterval', labelKey: 'maxSleepInterval', unitKey: 'seconds', testId: 'pacing-max-sleep-interval' },
  { key: 'pacingSleepSubtitles', labelKey: 'sleepSubtitles', unitKey: 'seconds', testId: 'pacing-sleep-subtitles' },
  { key: 'pacingConcurrentFragments', labelKey: 'concurrentFragments', unitKey: 'threads', testId: 'pacing-concurrent-fragments' }
] as const;

const OFF_SUBTITLE_SLEEP_SECONDS = 3;

function HelpTooltip({ children, testId, label }: { children: ReactNode; testId: string; label: string }): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <button {...props} type="button" aria-label={label} className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--text-subtle)] hover:bg-muted hover:text-foreground" data-testid={testId}>
            <Info size={13} />
          </button>
        )}
      />
      <TooltipContent className="max-w-[18rem] leading-snug">{children}</TooltipContent>
    </Tooltip>
  );
}

function toDraft(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

function formatSeconds(value: number | undefined): string {
  if (value === undefined || value === 0) return '0s';
  return `${value}s`;
}

function presetSummaryValues(preset: Exclude<NetworkPacingPreset, 'custom'>): { requests: string; downloads: string; subtitles: string; fragments: number } {
  const values = NETWORK_PACING_PRESET_VALUES[preset];
  const subtitleSleep = preset === 'off' ? OFF_SUBTITLE_SLEEP_SECONDS : values.sleepSubtitles;
  return {
    requests: formatSeconds(values.sleepRequests),
    downloads: values.sleepInterval !== undefined && values.maxSleepInterval !== undefined ? `${values.sleepInterval}-${values.maxSleepInterval}s` : '0s',
    subtitles: formatSeconds(subtitleSleep),
    fragments: values.concurrentFragments ?? 1
  };
}

export function NetworkPacingSettings(): JSX.Element {
  const { t } = useTranslation();
  const { settings, setPlaylistProbeLimit, setNetworkPacingPreset, setPacingSleepRequests, setPacingSleepInterval, setPacingMaxSleepInterval, setPacingSleepSubtitles, setPacingConcurrentFragments } = useAppStore();
  const common = settings?.common;
  const playlistLimit = resolvePlaylistProbeLimit(common);
  const playlistIsPreset = (PLAYLIST_PROBE_LIMIT_PRESETS as readonly number[]).includes(playlistLimit);
  const pacingPreset: NetworkPacingPreset = common?.networkPacingPreset ?? 'balanced';
  const [customLimitDraft, setCustomLimitDraft] = useState(playlistIsPreset ? '' : String(playlistLimit));
  const [fieldDrafts, setFieldDrafts] = useState<Partial<Record<(typeof CUSTOM_FIELDS)[number]['key'], string>>>({});

  const customLimitInvalid = customLimitDraft.trim() !== '' && !playlistProbeLimitSchema.safeParse(Number(customLimitDraft)).success;

  function pickPlaylistLimit(value: number): void {
    setCustomLimitDraft('');
    void setPlaylistProbeLimit(value);
  }

  function updateCustomLimit(value: string): void {
    setCustomLimitDraft(value);
    const parsed = Number(value);
    if (playlistProbeLimitSchema.safeParse(parsed).success) void setPlaylistProbeLimit(parsed);
  }

  const FIELD_SETTERS = {
    pacingSleepRequests: setPacingSleepRequests,
    pacingSleepInterval: setPacingSleepInterval,
    pacingMaxSleepInterval: setPacingMaxSleepInterval,
    pacingSleepSubtitles: setPacingSleepSubtitles,
    pacingConcurrentFragments: setPacingConcurrentFragments
  } as const;

  function onFieldChange(key: (typeof CUSTOM_FIELDS)[number]['key'], value: string): void {
    setFieldDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function onFieldBlur(key: (typeof CUSTOM_FIELDS)[number]['key']): void {
    const draft = fieldDrafts[key];
    if (draft === undefined) return;
    const parsed = draft === '' ? 0 : Number(draft);
    const schema = key === 'pacingConcurrentFragments' ? pacingConcurrentFragmentsSchema : pacingSleepSecondsSchema;
    if (!schema.safeParse(parsed).success) return;
    setFieldDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    void FIELD_SETTERS[key](parsed);
  }

  return (
    <div className="flex flex-col gap-3" data-testid="network-pacing-section">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-foreground">{t('wizard.url.networkPacing.heading')}</span>
        <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.networkPacing.description')}</span>
      </div>

      <div className="flex flex-col gap-1.5 rounded-md border border-[var(--border-strong)] bg-background/35 p-2.5" data-testid="playlist-probe-limit-section">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.url.playlistProbeLimit.label')}</span>
          <HelpTooltip testId="playlist-probe-limit-tooltip" label={t('wizard.url.playlistProbeLimit.label')}>
            {t('wizard.url.playlistProbeLimit.tooltip')}
          </HelpTooltip>
        </div>
        <p className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.playlistProbeLimit.description')}</p>
        <div className="grid grid-cols-3 gap-0.5" role="radiogroup" aria-label={t('wizard.url.playlistProbeLimit.label')}>
          {PLAYLIST_PROBE_LIMIT_PRESETS.map((preset) => (
            <RadioOption key={preset} label={String(preset)} checked={playlistLimit === preset && customLimitDraft === ''} onClick={() => pickPlaylistLimit(preset)} />
          ))}
          <RadioOption label={t('wizard.url.playlistProbeLimit.custom')} checked={customLimitDraft !== '' || !playlistIsPreset} onClick={() => setCustomLimitDraft(String(playlistLimit))} />
        </div>
        <p className="text-[11px] text-[var(--text-subtle)]" data-testid="playlist-probe-limit-current">
          {t('wizard.url.playlistProbeLimit.current', { count: playlistLimit })}
        </p>
        {(customLimitDraft !== '' || !playlistIsPreset) && (
          <div className="flex flex-col gap-1">
            <Input type="number" min={PLAYLIST_PROBE_LIMIT_MIN} max={PLAYLIST_PROBE_LIMIT_MAX} value={customLimitDraft} onChange={(e) => updateCustomLimit(e.target.value)} placeholder={String(DEFAULT_PLAYLIST_PROBE_LIMIT)} className="h-8 text-[12px] font-mono" aria-invalid={customLimitInvalid} data-testid="playlist-probe-limit-custom" />
            {customLimitInvalid && <p className="text-[11px] text-amber-500">{t('wizard.url.playlistProbeLimit.invalid')}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 rounded-md border border-[var(--border-strong)] bg-background/35 p-2.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.url.networkPacing.presetLabel')}</span>
          <HelpTooltip testId="network-pacing-tooltip" label={t('wizard.url.networkPacing.presetLabel')}>
            {t('wizard.url.networkPacing.tooltip')}
          </HelpTooltip>
        </div>
        <div className="grid grid-cols-2 gap-0.5" role="radiogroup" aria-label={t('wizard.url.networkPacing.presetLabel')}>
          {(['off', 'balanced', 'careful', 'custom'] as const).map((preset) => (
            <Tooltip key={preset}>
              <TooltipTrigger
                render={(props) => (
                  <div {...props}>
                    <RadioOption label={t(`wizard.url.networkPacing.presets.${preset}`)} checked={pacingPreset === preset} onClick={() => void setNetworkPacingPreset(preset)} />
                  </div>
                )}
              />
              <TooltipContent className="max-w-[18rem] leading-snug" data-testid={`network-pacing-${preset}-tooltip`}>
                {t(`wizard.url.networkPacing.tooltips.${preset}`)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {pacingPreset !== 'custom' && (
          <p className="text-[11px] text-[var(--text-subtle)]" data-testid="network-pacing-summary">
            {t('wizard.url.networkPacing.summary', presetSummaryValues(pacingPreset))}
          </p>
        )}
      </div>

      {pacingPreset === 'custom' && (
        <div className="grid grid-cols-2 gap-2 rounded-md border border-[var(--border-strong)] bg-background/35 p-2.5" data-testid="network-pacing-custom">
          {CUSTOM_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">{t(`wizard.url.networkPacing.fields.${field.labelKey}`)}</span>
              <div className="relative">
                <Input type="number" min={0} value={fieldDrafts[field.key] ?? toDraft(common?.[field.key])} onChange={(e) => onFieldChange(field.key, e.target.value)} onBlur={() => onFieldBlur(field.key)} placeholder={String(NETWORK_PACING_PRESET_VALUES.balanced[field.labelKey] ?? '')} className="h-8 pe-14 text-[12px] font-mono" data-testid={field.testId} />
                <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-subtle)]">{t(`wizard.url.networkPacing.units.${field.unitKey}`)}</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

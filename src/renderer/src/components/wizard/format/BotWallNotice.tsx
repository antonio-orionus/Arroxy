import type { JSX } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert.js';
import { Button } from '@renderer/components/ui/button.js';

interface Props {
  // When set, the component renders even if `wizardFormatsDegraded` is null.
  // Use case: surfacing the same notice on `StepError` when the probe hard-
  // failed with a bot-detected category — there's no degraded payload in
  // that path, but the cookies CTA still applies.
  forceShow?: boolean;
}

export function BotWallNotice({ forceShow = false }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const { wizardFormatsDegraded, settings, retryFormatProbe, retryProbeWithCookies } = useAppStore();

  const isBotWall = forceShow || (wizardFormatsDegraded?.reasons.includes('botWall') ?? false);
  if (!isBotWall) return null;

  const cookiesMode = settings?.common?.cookiesMode ?? 'off';
  const hasCookiesPath = Boolean(settings?.common?.cookiesPath?.trim());
  const hasCookiesBrowser = Boolean(settings?.common?.cookiesBrowser);
  const cookiesConfigured = hasCookiesPath || hasCookiesBrowser;

  const variant: 'unconfigured' | 'disabled' | 'enabled' = cookiesMode !== 'off' ? 'enabled' : cookiesConfigured ? 'disabled' : 'unconfigured';

  const body = variant === 'unconfigured' ? t('wizard.formats.botWall.bodyUnconfigured') : variant === 'disabled' ? t('wizard.formats.botWall.bodyDisabled') : t('wizard.formats.botWall.bodyEnabled');

  return (
    <Alert role="status" variant="warning" data-testid="bot-wall-notice" data-variant={variant} className="text-[12px]">
      <AlertTriangle />
      <AlertTitle className="text-[12px]">{t('wizard.formats.botWall.heading')}</AlertTitle>
      <AlertDescription className="text-[12px] text-current">{body}</AlertDescription>
      <div className="col-start-2 flex flex-wrap gap-2">
        {variant === 'disabled' ? (
          <Button type="button" size="sm" variant="default" onClick={() => void retryProbeWithCookies()} data-testid="bot-wall-enable-cta">
            <ShieldCheck data-icon="inline-start" />
            {t('wizard.formats.botWall.enableRetryCta')}
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={() => void retryFormatProbe()} data-testid="bot-wall-retry-cta">
          <RefreshCw data-icon="inline-start" />
          {t('wizard.formats.botWall.retryCta')}
        </Button>
      </div>
    </Alert>
  );
}

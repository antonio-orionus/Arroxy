import { useEffect, useRef, type JSX } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { MascotBubble } from './MascotBubble';
import { formatHomeRelativePath } from '@renderer/lib/utils';
import hiImg from '../assets/Hi.png';
import downloadingImg from '../assets/Downloading.png';

const COOKIES_HELP_URL = 'https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp';
const COOKIES_FIREFOX_URL = 'https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/';
const COOKIES_CHROME_URL = 'https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc';

export function StepUrlInput(): JSX.Element {
  const { t } = useTranslation();
  const {
    wizardUrl,
    setWizardUrl,
    submitUrl,
    queue,
    settings,
    setCookiesPath,
    setCookiesEnabled
  } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasActiveDownloads = queue.some((i) => i.status === 'downloading');

  const cookiesPath = settings?.cookiesPath ?? '';
  const cookiesEnabled = settings?.cookiesEnabled ?? false;
  const commonPaths = settings?.commonPaths;
  const showMissingFileWarning = cookiesEnabled && !cookiesPath.trim();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && wizardUrl.trim()) {
      void submitUrl();
    }
  }

  async function handleChooseCookies(): Promise<void> {
    const result = await window.appApi.dialog.chooseFile();
    if (result.ok && result.data.path) {
      await setCookiesPath(result.data.path);
    }
  }

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-url">
      <MascotBubble
        image={hasActiveDownloads ? downloadingImg : hiImg}
        message={hasActiveDownloads ? t('wizard.url.mascotBusy') : t('wizard.url.mascotIdle')}
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          {t('wizard.url.heading')}
        </p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="url"
            className="flex-1 h-10"
            value={wizardUrl}
            onChange={(e) => setWizardUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('wizard.url.placeholder')}
            spellCheck={false}
            data-testid="url-input"
          />
          <Button
            type="button"
            size="lg"
            onClick={() => void submitUrl()}
            disabled={!wizardUrl.trim()}
            data-testid="btn-find-formats"
            className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none gap-2"
          >
            {t('wizard.url.fetchFormats')} <ArrowRight size={16} />
          </Button>
        </div>
        <p className="text-[12px] text-[var(--text-subtle)]">{t('wizard.url.hint')}</p>
      </div>

      <details className="group rounded-md border border-[var(--border-strong)] bg-card/40" data-testid="advanced-section">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-medium text-[var(--text-subtle)] hover:text-foreground">
          {t('wizard.url.advanced')}
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">
                {t('wizard.url.cookies.toggle')}
              </span>
              <span className="text-[11px] text-[var(--text-subtle)]">
                {t('wizard.url.cookies.toggleDescription')}
              </span>
            </div>
            <Switch
              checked={cookiesEnabled}
              onCheckedChange={(checked) => void setCookiesEnabled(checked)}
              aria-label={t('wizard.url.cookies.toggle')}
              data-testid="cookies-toggle"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[var(--text-subtle)]">
              {t('wizard.url.cookies.fileLabel')}
            </span>
            <div className="flex gap-2">
              <Input
                readOnly
                value={cookiesPath ? formatHomeRelativePath(cookiesPath, commonPaths) : ''}
                placeholder={t('wizard.url.cookies.placeholder')}
                className="flex-1 h-9 text-[12px] font-mono"
                data-testid="cookies-path"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleChooseCookies()}
                data-testid="cookies-choose"
              >
                {t('wizard.url.cookies.choose')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void setCookiesPath('')}
                disabled={!cookiesPath}
                data-testid="cookies-clear"
              >
                {t('wizard.url.cookies.clear')}
              </Button>
            </div>
            {showMissingFileWarning ? (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-500" data-testid="cookies-warning">
                <AlertTriangle size={12} />
                {t('wizard.url.cookies.enabledButNoFile')}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-[var(--text-subtle)] leading-relaxed">
            <p>{t('wizard.url.cookies.risk')}</p>
            <p className="text-amber-600 dark:text-amber-400">{t('wizard.url.cookies.banWarning')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <button
              type="button"
              className="underline text-[var(--text-subtle)] hover:text-foreground"
              onClick={() => void window.appApi.shell.openExternal(COOKIES_HELP_URL)}
              data-testid="cookies-help-link"
            >
              {t('wizard.url.cookies.helpLink')}
            </button>
            <button
              type="button"
              className="underline text-[var(--text-subtle)] hover:text-foreground"
              onClick={() => void window.appApi.shell.openExternal(COOKIES_FIREFOX_URL)}
              data-testid="cookies-firefox-link"
            >
              {t('wizard.url.cookies.extensionFirefox')} ↗
            </button>
            <button
              type="button"
              className="underline text-[var(--text-subtle)] hover:text-foreground"
              onClick={() => void window.appApi.shell.openExternal(COOKIES_CHROME_URL)}
              data-testid="cookies-chrome-link"
            >
              {t('wizard.url.cookies.extensionChrome')} ↗
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

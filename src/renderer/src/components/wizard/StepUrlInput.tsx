import { useEffect, useRef, useState, type JSX, type ReactNode } from 'react';
import { ArrowRight, AlertTriangle, Share2, X, Video, ListVideo, Music, Tv, Smartphone, Mic, Globe, ListMusic, AudioLines, Captions } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { track } from '@renderer/lib/analytics.js';
import { Input } from '../ui/input.js';
import { Button } from '../ui/button.js';
import { Switch } from '../ui/switch.js';
import { RadioOption } from '../ui/radio-option.js';
import { MascotBubble } from '../shared/MascotBubble.js';
import { ClipboardConfirmDialog } from '../shared/ClipboardConfirmDialog.js';
import { IncompleteCookiesConfigDialog } from './IncompleteCookiesConfigDialog.js';
import { LimitRatePicker } from '../shared/LimitRatePicker.js';
import { NetworkPacingSettings } from './NetworkPacingSettings.js';
import { formatHomeRelativePath } from '@renderer/lib/utils.js';
import { cleanUrl } from '@shared/cleanUrl.js';
import { DEFAULTS } from '@shared/constants.js';
import type { CookiesBrowser, CookiesMode } from '@shared/types.js';
import hiImg from '../../assets/Hi.png';
import downloadingImg from '../../assets/Downloading.png';

// Brand names are stable English globally — not translated. Keep this list
// in sync with the `cookiesBrowserSchema` enum in `src/shared/schemas.ts`.
const COOKIES_BROWSERS: readonly { value: CookiesBrowser; label: string; macOnly?: boolean }[] = [
  { value: 'firefox', label: 'Firefox' },
  { value: 'chromium', label: 'Chromium' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'brave', label: 'Brave' },
  { value: 'edge', label: 'Edge' },
  { value: 'safari', label: 'Safari', macOnly: true },
  { value: 'vivaldi', label: 'Vivaldi' }
];

const COOKIES_HELP_URL = 'https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp';
const COOKIES_FIREFOX_URL = 'https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/';
const COOKIES_CHROME_URL = 'https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc';

export function StepUrlInput(): JSX.Element {
  const { t } = useTranslation();
  const { wizardUrl, setWizardUrl, submitUrl, queue, settings, initialized, advancedAutoOpen, advancedAutoTarget, setAdvancedAutoOpen, setCookiesPath, setCookiesMode, setCookiesBrowser, setClipboardWatchEnabled, setIncludeIdInSingleFilenames, setCloseBehavior, setAnalyticsEnabled, setProxyUrl, setLimitRate, cookiesConfigDialogIssue, dismissCookiesConfigDialog, openCookiesSettings, openShareDialog, setShareInlineCardDismissed } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasActiveDownloads = queue.some((i) => i.status === 'running');
  const [pendingClipboardUrl, setPendingClipboardUrl] = useState<string | null>(null);

  const shareCardVisible = !(settings?.common?.shareInlineCardDismissed ?? false);

  function handleShareInlineCardClick(): void {
    openShareDialog('wizard-card');
  }
  const cookiesPath = settings?.common?.cookiesPath ?? '';
  const cookiesMode: CookiesMode = settings?.common?.cookiesMode ?? 'off';
  const cookiesBrowser = settings?.common?.cookiesBrowser;
  const proxyUrl = settings?.common?.proxyUrl ?? '';
  const commonPaths = settings?.common?.commonPaths;
  const showMissingFileWarning = cookiesMode === 'file' && !cookiesPath.trim();
  const showMissingBrowserWarning = cookiesMode === 'browser' && !cookiesBrowser;
  const platform = (window as Window & { platform?: NodeJS.Platform }).platform;
  const visibleBrowsers = COOKIES_BROWSERS.filter((b) => !b.macOnly || platform === 'darwin');

  useEffect(() => {
    inputRef.current?.focus();
    const { queue } = useAppStore.getState();
    if (!queue.some((i) => i.status === 'running')) {
      track('wizard_started');
    }
  }, []);

  // Honor "open advanced settings" links from modals/error steps: expand the
  // advanced section and scroll the requested block into view, then clear
  // the flag so a subsequent reset doesn't re-fire it.
  useEffect(() => {
    if (!advancedAutoOpen) return;
    const advanced = document.querySelector('[data-testid="advanced-section"]');
    if (advanced instanceof HTMLDetailsElement) advanced.open = true;
    const targetTestId = advancedAutoTarget === 'network' ? 'network-pacing-section' : 'cookies-source';
    const target = document.querySelector(`[data-testid="${targetTestId}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }
    setAdvancedAutoOpen(false, advancedAutoTarget);
  }, [advancedAutoOpen, advancedAutoTarget, setAdvancedAutoOpen]);

  useEffect(() => {
    return window.appApi.events.onClipboardUrl((url) => {
      // Read fresh state — listener is registered once per mount but the store
      // changes underneath; stale closures would read stale wizardUrl.
      const { wizardUrl: currentUrl, formatsLoading } = useAppStore.getState();
      if (currentUrl) return;
      if (formatsLoading) return;
      setPendingClipboardUrl(cleanUrl(url));
    });
  }, []);

  function handleConfirmClipboard(): void {
    if (pendingClipboardUrl) setWizardUrl(pendingClipboardUrl);
    setPendingClipboardUrl(null);
    inputRef.current?.focus();
  }

  async function handleFetchClipboard(): Promise<void> {
    if (pendingClipboardUrl) setWizardUrl(pendingClipboardUrl);
    setPendingClipboardUrl(null);
    await submitUrl();
  }

  function handleDisableClipboard(): void {
    void setClipboardWatchEnabled(false);
    setPendingClipboardUrl(null);
  }

  function handleCancelClipboard(): void {
    setPendingClipboardUrl(null);
  }

  function handleClearUrl(): void {
    setWizardUrl('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' && wizardUrl.trim()) {
      void submitUrl();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    const pasted = e.clipboardData.getData('text');
    const cleaned = cleanUrl(pasted);
    if (cleaned === pasted) return;
    e.preventDefault();
    const input = e.currentTarget;
    const start = input.selectionStart ?? wizardUrl.length;
    const end = input.selectionEnd ?? wizardUrl.length;
    const next = wizardUrl.slice(0, start) + cleaned + wizardUrl.slice(end);
    setWizardUrl(next);
  }

  async function handleChooseCookies(): Promise<void> {
    const result = await window.appApi.dialog.chooseFile();
    if (result.ok && result.data.path) {
      await setCookiesPath(result.data.path);
    }
  }

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-url">
      <div className="flex items-center gap-3">
        <MascotBubble image={hasActiveDownloads ? downloadingImg : hiImg} message={hasActiveDownloads ? t('wizard.url.mascotBusy') : t('wizard.url.mascotIdle')} className="w-[30%] shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.url.heading')}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input ref={inputRef} type="url" className={`h-10 ${wizardUrl.trim() ? 'pe-9' : ''}`} value={wizardUrl} onChange={(e) => setWizardUrl(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder={t('wizard.url.placeholder')} spellCheck={false} data-testid="url-input" />
              {wizardUrl.trim() ? (
                <button type="button" onClick={handleClearUrl} aria-label={t('wizard.url.clearAria')} data-testid="url-clear" className="absolute end-1.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <Button type="button" size="lg" onClick={() => void submitUrl()} disabled={!wizardUrl.trim()} data-testid="btn-find-formats" className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none gap-2">
              {t('wizard.url.fetchFormats')} <ArrowRight size={16} className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {shareCardVisible && (
        <div className="flex items-center gap-2 rounded-md border border-[var(--border-strong)] bg-card/40 px-3 py-2" data-testid="share-inline-card">
          <button type="button" onClick={handleShareInlineCardClick} className="flex-1 inline-flex items-center gap-2 text-start text-[13px] text-foreground hover:text-foreground/80 transition-colors" data-testid="share-inline-card-body">
            <Share2 size={14} className="shrink-0 text-[var(--brand)]" aria-hidden />
            <span className="flex-1">{t('share.inlineCard.body')}</span>
          </button>
          <button type="button" onClick={() => void setShareInlineCardDismissed()} aria-label={t('share.inlineCard.dismiss')} title={t('share.inlineCard.dismiss')} data-testid="share-inline-card-dismiss" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3" data-testid="features">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.url.features.heading')}</p>

        <FeatureSection heading={t('wizard.url.features.youtube.heading')}>
          <FeatureChip icon={<Video size={14} />} label={t('wizard.url.features.youtube.video')} />
          <FeatureChip icon={<Tv size={14} />} label={t('wizard.url.features.youtube.channel')} />
          <FeatureChip icon={<ListVideo size={14} />} label={t('wizard.url.features.youtube.playlist')} />
          <FeatureChip icon={<Smartphone size={14} />} label={t('wizard.url.features.youtube.short')} />
          <FeatureChip icon={<Music size={14} />} label={t('wizard.url.features.youtube.music')} />
          <FeatureChip icon={<Mic size={14} />} label={t('wizard.url.features.youtube.podcast')} />
        </FeatureSection>

        <FeatureSection heading={t('wizard.url.features.anySite.heading')}>
          <FeatureChip icon={<Globe size={14} />} label={t('wizard.url.features.anySite.video')} />
          <FeatureChip icon={<ListVideo size={14} />} label={t('wizard.url.features.anySite.videoPlaylist')} />
          <FeatureChip icon={<ListMusic size={14} />} label={t('wizard.url.features.anySite.musicPlaylist')} />
        </FeatureSection>

        <FeatureSection heading={t('wizard.url.features.always.heading')}>
          <FeatureChip icon={<AudioLines size={14} />} label={t('wizard.url.features.always.audioOnly')} />
          <FeatureChip icon={<Captions size={14} />} label={t('wizard.url.features.always.subtitles')} />
        </FeatureSection>
      </div>

      <details className="group rounded-md border border-[var(--border-strong)] bg-card/40" data-testid="advanced-section">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-medium text-[var(--text-subtle)] hover:text-foreground">{t('wizard.url.advanced')}</summary>
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.clipboard.toggle')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.clipboard.toggleDescription')}</span>
            </div>
            <Switch checked={settings?.common?.clipboardWatchEnabled ?? false} onCheckedChange={(checked) => void setClipboardWatchEnabled(checked)} aria-label={t('wizard.url.clipboard.toggle')} data-testid="clipboard-watch-toggle" />
          </div>

          <div className="flex flex-col gap-1.5" data-testid="cookies-source">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.cookies.sourceLabel')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.cookies.toggleDescription')}</span>
            </div>
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={t('wizard.url.cookies.sourceLabel')}>
              <RadioOption label={t('wizard.url.cookies.sourceOff')} checked={cookiesMode === 'off'} onClick={() => void setCookiesMode('off')} />
              <RadioOption label={t('wizard.url.cookies.sourceFile')} checked={cookiesMode === 'file'} onClick={() => void setCookiesMode('file')} />
              <RadioOption label={t('wizard.url.cookies.sourceBrowser')} checked={cookiesMode === 'browser'} onClick={() => void setCookiesMode('browser')} />
            </div>
          </div>

          {cookiesMode === 'file' ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">{t('wizard.url.cookies.fileLabel')}</span>
              <div className="flex gap-2">
                <Input readOnly value={cookiesPath ? formatHomeRelativePath(cookiesPath, commonPaths) : ''} placeholder={t('wizard.url.cookies.placeholder')} className="flex-1 h-9 text-[12px] font-mono" data-testid="cookies-path" />
                <Button type="button" size="sm" variant="outline" onClick={() => void handleChooseCookies()} data-testid="cookies-choose">
                  {t('wizard.url.cookies.choose')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => void setCookiesPath('')} disabled={!cookiesPath} data-testid="cookies-clear">
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
          ) : null}

          {cookiesMode === 'browser' ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">{t('wizard.url.cookies.browserLabel')}</span>
              <select
                value={cookiesBrowser ?? ''}
                onChange={(e) => {
                  const val = e.target.value as CookiesBrowser | '';
                  if (val) void setCookiesBrowser(val);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="cookies-browser-select"
              >
                <option value="" disabled className="bg-popover text-popover-foreground">
                  {t('wizard.url.cookies.browserPlaceholder')}
                </option>
                {visibleBrowsers.map((b) => (
                  <option key={b.value} value={b.value} className="bg-popover text-popover-foreground">
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.cookies.browserHelp')}</p>
              {showMissingBrowserWarning ? (
                <p className="flex items-center gap-1.5 text-[11px] text-amber-500" data-testid="cookies-browser-warning">
                  <AlertTriangle size={12} />
                  {t('wizard.url.cookies.enabledButNoBrowser')}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1 text-[11px] text-[var(--text-subtle)] leading-relaxed">
            <p>{t('wizard.url.cookies.risk')}</p>
            <p className="text-amber-600 dark:text-amber-400">{t('wizard.url.cookies.banWarning')}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.proxy.label')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.proxy.description')}</span>
            </div>
            <div className="flex gap-2">
              <Input type="url" value={proxyUrl} onChange={(e) => void setProxyUrl(e.target.value)} placeholder={t('wizard.url.proxy.placeholder')} className="flex-1 h-9 text-[12px] font-mono" data-testid="proxy-url-input" />
              <Button type="button" size="sm" variant="ghost" onClick={() => void setProxyUrl('')} disabled={!proxyUrl} data-testid="proxy-clear">
                {t('wizard.url.proxy.clear')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5" data-testid="limit-rate-section">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.limitRate.label')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.limitRate.description')}</span>
            </div>
            <LimitRatePicker value={settings?.common?.limitRate?.trim() ? settings.common.limitRate : undefined} onChange={(v) => void setLimitRate(v)} />
          </div>

          <NetworkPacingSettings />

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.singleFilenameId.toggle')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.singleFilenameId.toggleDescription')}</span>
            </div>
            <Switch checked={settings?.common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames} onCheckedChange={(checked) => void setIncludeIdInSingleFilenames(checked)} aria-label={t('wizard.url.singleFilenameId.toggle')} data-testid="single-filename-id-toggle" />
          </div>

          {(window as Window & { platform?: string }).platform !== 'darwin' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-foreground">{t('wizard.url.closeToTray.toggle')}</span>
                <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.closeToTray.toggleDescription')}</span>
              </div>
              <Switch checked={settings?.common?.closeBehavior === 'tray'} onCheckedChange={(checked) => void setCloseBehavior(checked ? 'tray' : 'quit')} aria-label={t('wizard.url.closeToTray.toggle')} data-testid="close-to-tray-toggle" />
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">{t('wizard.url.analytics.toggle')}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.analytics.toggleDescription')}</span>
            </div>
            <Switch checked={settings?.common?.analyticsEnabled ?? true} onCheckedChange={(checked) => void setAnalyticsEnabled(checked)} aria-label={t('wizard.url.analytics.toggle')} data-testid="analytics-toggle" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_HELP_URL)} data-testid="cookies-help-link">
              {t('wizard.url.cookies.helpLink')}
            </button>
            <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_FIREFOX_URL)} data-testid="cookies-firefox-link">
              {t('wizard.url.cookies.extensionFirefox')} ↗
            </button>
            <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_CHROME_URL)} data-testid="cookies-chrome-link">
              {t('wizard.url.cookies.extensionChrome')} ↗
            </button>
          </div>
        </div>
      </details>

      <ClipboardConfirmDialog open={pendingClipboardUrl !== null && initialized} url={pendingClipboardUrl} onUse={handleConfirmClipboard} onFetch={() => void handleFetchClipboard()} onDisable={handleDisableClipboard} onCancel={handleCancelClipboard} />
      <IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
    </div>
  );
}

function FeatureSection({ heading, children }: { heading: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium text-[var(--text-subtle)]">{heading}</p>
      <div className="flex flex-wrap gap-1.5" role="list">
        {children}
      </div>
    </div>
  );
}

function FeatureChip({ icon, label }: { icon: ReactNode; label: string }): JSX.Element {
  return (
    <span role="listitem" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-card/40 px-2.5 py-1 text-[12px] text-foreground">
      <span aria-hidden className="text-[var(--text-subtle)]">
        {icon}
      </span>
      {label}
    </span>
  );
}

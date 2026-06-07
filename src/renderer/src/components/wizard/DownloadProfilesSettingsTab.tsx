import { useEffect, type JSX, type ReactNode } from 'react';
import { AlertTriangle, Gauge } from 'lucide-react';
import { DEFAULTS } from '@shared/constants.js';
import type { CookiesBrowser, CookiesMode } from '@shared/types.js';
import { formatHomeRelativePath } from '@renderer/lib/utils.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { RadioOption } from '../ui/radio-option.js';
import { Switch } from '../ui/switch.js';
import { LimitRatePicker } from '../shared/LimitRatePicker.js';
import { formatLimitRateLabel } from '../shared/limitRateFormat.js';
import { NetworkPacingSettings } from './NetworkPacingSettings.js';

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

function SettingsPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }): JSX.Element {
  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-card/40 p-3">
      <div className="mb-3">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {description ? <p className="mt-1 text-[12px] leading-snug text-[var(--text-subtle)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SettingSwitch({ id, label, description, checked, onCheckedChange, testId }: { id: string; label: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void; testId?: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span id={id} className="text-[13px] font-medium text-foreground">
          {label}
        </span>
        <span className="text-[11px] text-[var(--text-subtle)]">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} data-testid={testId} />
    </div>
  );
}

export function DownloadProfilesSettingsTab(): JSX.Element {
  const { advancedAutoOpen, advancedAutoTarget, settings, setAdvancedAutoOpen, setClipboardWatchEnabled, setCookiesPath, setCookiesMode, setCookiesBrowser, setProxyUrl, setLimitRate, setIncludeIdInSingleFilenames, setCloseBehavior, setAnalyticsEnabled } = useAppStore();
  const common = settings?.common;
  const cookiesPath = common?.cookiesPath ?? '';
  const cookiesMode: CookiesMode = common?.cookiesMode ?? 'off';
  const cookiesBrowser = common?.cookiesBrowser;
  const proxyUrl = common?.proxyUrl ?? '';
  const commonPaths = common?.commonPaths;
  const platform = (window as Window & { platform?: NodeJS.Platform }).platform;
  const visibleBrowsers = COOKIES_BROWSERS.filter((browser) => !browser.macOnly || platform === 'darwin');
  const showMissingFileWarning = cookiesMode === 'file' && !cookiesPath.trim();
  const showMissingBrowserWarning = cookiesMode === 'browser' && !cookiesBrowser;
  const limitRate = common?.limitRate?.trim() ? common.limitRate : undefined;

  useEffect(() => {
    if (!advancedAutoOpen) return;
    const targetTestId = advancedAutoTarget === 'network' ? 'network-pacing-section' : 'cookies-source';
    const target = document.querySelector(`[data-testid="${targetTestId}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }
    setAdvancedAutoOpen(false, advancedAutoTarget);
  }, [advancedAutoOpen, advancedAutoTarget, setAdvancedAutoOpen]);

  async function chooseCookiesFile(): Promise<void> {
    const result = await window.appApi.dialog.chooseFile();
    if (result.ok && result.data.path) await setCookiesPath(result.data.path);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid="profiles-settings-tab">
      <SettingsPanel title="Input" description="Same controls that used to live in Advanced settings.">
        <div className="flex flex-col gap-4">
          <SettingSwitch id="profiles-settings-clipboard" label="Clipboard watching" description="Detect copied links and fill the URL input automatically." checked={common?.clipboardWatchEnabled ?? false} onCheckedChange={(checked) => void setClipboardWatchEnabled(checked)} />

          <div className="flex flex-col gap-1.5" data-testid="cookies-source">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">Cookie source</span>
              <span className="text-[11px] text-[var(--text-subtle)]">Use browser cookies only when a site requires an authenticated session.</span>
            </div>
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Cookie source">
              <RadioOption label="Off" checked={cookiesMode === 'off'} onClick={() => void setCookiesMode('off')} />
              <RadioOption label="File" checked={cookiesMode === 'file'} onClick={() => void setCookiesMode('file')} />
              <RadioOption label="Browser" checked={cookiesMode === 'browser'} onClick={() => void setCookiesMode('browser')} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_HELP_URL)} data-testid="cookies-help-link">
                Help
              </button>
              <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_FIREFOX_URL)} data-testid="cookies-firefox-link">
                Firefox extension
              </button>
              <button type="button" className="underline text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_CHROME_URL)} data-testid="cookies-chrome-link">
                Chrome extension
              </button>
            </div>
          </div>

          {cookiesMode === 'file' ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">cookies.txt file</span>
              <div className="flex gap-2">
                <Input readOnly value={cookiesPath ? formatHomeRelativePath(cookiesPath, commonPaths) : ''} placeholder="Choose cookies.txt..." className="h-9 flex-1 text-[12px] font-mono" data-testid="profiles-settings-cookies-path" />
                <Button type="button" size="sm" variant="outline" onClick={() => void chooseCookiesFile()}>
                  Choose
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => void setCookiesPath('')} disabled={!cookiesPath}>
                  Clear
                </Button>
              </div>
              {showMissingFileWarning ? <WarningText text="Cookie file mode is enabled but no file is selected." /> : null}
            </div>
          ) : null}

          {cookiesMode === 'browser' ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[var(--text-subtle)]">Browser</span>
              <select
                value={cookiesBrowser ?? ''}
                onChange={(event) => {
                  const value = event.target.value as CookiesBrowser | '';
                  if (value) void setCookiesBrowser(value);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="profiles-settings-cookies-browser"
              >
                <option value="" disabled className="bg-popover text-popover-foreground">
                  Choose browser...
                </option>
                {visibleBrowsers.map((browser) => (
                  <option key={browser.value} value={browser.value} className="bg-popover text-popover-foreground">
                    {browser.label}
                  </option>
                ))}
              </select>
              {showMissingBrowserWarning ? <WarningText text="Browser cookie mode is enabled but no browser is selected." /> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">Proxy URL</span>
              <span className="text-[11px] text-[var(--text-subtle)]">Optional proxy passed to yt-dlp.</span>
            </div>
            <div className="flex gap-2">
              <Input type="url" value={proxyUrl} onChange={(event) => void setProxyUrl(event.target.value)} placeholder="http://127.0.0.1:8080" className="h-9 flex-1 text-[12px] font-mono" data-testid="profiles-settings-proxy-url" />
              <Button type="button" size="sm" variant="ghost" onClick={() => void setProxyUrl('')} disabled={!proxyUrl}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Download behavior" description="Global behavior that affects profile-driven downloads too.">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">Speed limit</span>
              <span className="text-[11px] text-[var(--text-subtle)]">Throttle new downloads.</span>
            </div>
            <Popover>
              <PopoverTrigger type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-background/35 px-2.5 text-[12px] font-semibold text-foreground hover:bg-muted" data-testid="profiles-settings-limit-rate-trigger">
                <Gauge data-icon="inline-start" aria-hidden />
                {limitRate ? formatLimitRateLabel(limitRate) : 'Off'}
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-64">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Speed limit</p>
                  <p className="text-[11px] text-[var(--text-subtle)]">Running jobs need pause/resume to apply changes.</p>
                </div>
                <LimitRatePicker value={limitRate} onChange={(value) => void setLimitRate(value)} />
              </PopoverContent>
            </Popover>
          </div>

          <NetworkPacingSettings />

          <SettingSwitch id="profiles-settings-filename-id" label="Include ID in single-video filenames" description="Keeps filenames stable when titles change." checked={common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames} onCheckedChange={(checked) => void setIncludeIdInSingleFilenames(checked)} testId="single-filename-id-toggle" />

          {platform !== 'darwin' ? <SettingSwitch id="profiles-settings-close-tray" label="Close to tray" description="Keep Arroxy running when the window closes." checked={common?.closeBehavior === 'tray'} onCheckedChange={(checked) => void setCloseBehavior(checked ? 'tray' : 'quit')} /> : null}

          <SettingSwitch id="profiles-settings-analytics" label="Anonymous analytics" description="Help improve Arroxy with anonymous usage events." checked={common?.analyticsEnabled ?? true} onCheckedChange={(checked) => void setAnalyticsEnabled(checked)} />
        </div>
      </SettingsPanel>
    </div>
  );
}

function WarningText({ text }: { text: string }): JSX.Element {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-amber-500">
      <AlertTriangle size={12} />
      {text}
    </p>
  );
}

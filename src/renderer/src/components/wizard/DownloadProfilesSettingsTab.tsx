import {useEffect, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, Gauge} from 'lucide-react'
import {DEFAULTS} from '@shared/constants.js'
import type {CookiesBrowser, CookiesMode} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'
import {Switch} from '../ui/switch.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {LimitRatePicker} from '../shared/LimitRatePicker.js'
import {formatLimitRateLabel} from '../shared/limitRateFormat.js'
import {NetworkPacingSettings} from './NetworkPacingSettings.js'

const COOKIES_BROWSERS: readonly {value: CookiesBrowser; label: string; macOnly?: boolean}[] = [
	{value: 'firefox', label: 'Firefox'},
	{value: 'chromium', label: 'Chromium'},
	{value: 'chrome', label: 'Chrome'},
	{value: 'brave', label: 'Brave'},
	{value: 'edge', label: 'Edge'},
	{value: 'safari', label: 'Safari', macOnly: true},
	{value: 'vivaldi', label: 'Vivaldi'}
]

const COOKIES_HELP_URL = 'https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp'
const COOKIES_FIREFOX_URL = 'https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/'
const COOKIES_CHROME_URL = 'https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc'

function SettingsPanel({title, description, children}: {title: string; description?: string; children: ReactNode}): ReactNode {
	return (
		<Card size="sm" className="gap-3 rounded-lg border-[var(--border-strong)] bg-card/40 py-3">
			<CardHeader className="gap-1 px-3">
				<CardTitle className="text-sm font-semibold leading-tight">{title}</CardTitle>
				{description ? <CardDescription className="text-[12px] leading-snug text-[var(--text-subtle)]">{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="px-3">{children}</CardContent>
		</Card>
	)
}

function SettingSwitch({id, label, description, checked, onCheckedChange, testId}: {id: string; label: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void; testId?: string}): ReactNode {
	return (
		<Field orientation="horizontal" className="items-center justify-between gap-3">
			<FieldContent className="gap-0.5">
				<FieldTitle id={id} className="text-[13px] font-medium text-foreground">
					{label}
				</FieldTitle>
				<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{description}</FieldDescription>
			</FieldContent>
			<Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} data-testid={testId} />
		</Field>
	)
}

export function DownloadProfilesSettingsTab(): ReactNode {
	const {t} = useTranslation()
	const {advancedAutoOpen, advancedAutoTarget, settings, setAdvancedAutoOpen, setClipboardWatchEnabled, setCookiesPath, setCookiesMode, setCookiesBrowser, setProxyUrl, setLimitRate, setIncludeIdInSingleFilenames, setCloseBehavior, setAnalyticsEnabled} = useAppStore()
	const common = settings?.common
	const cookiesPath = common?.cookiesPath ?? ''
	const cookiesMode: CookiesMode = common?.cookiesMode ?? 'off'
	const cookiesBrowser = common?.cookiesBrowser
	const proxyUrl = common?.proxyUrl ?? ''
	const commonPaths = common?.commonPaths
	const platform = (window as Window & {platform?: NodeJS.Platform}).platform
	const visibleBrowsers = COOKIES_BROWSERS.filter(browser => !browser.macOnly || platform === 'darwin')
	const showMissingFileWarning = cookiesMode === 'file' && !cookiesPath.trim()
	const showMissingBrowserWarning = cookiesMode === 'browser' && !cookiesBrowser
	const limitRate = common?.limitRate?.trim() ? common.limitRate : undefined

	useEffect(() => {
		if (!advancedAutoOpen) return
		const targetTestId = advancedAutoTarget === 'network' ? 'network-pacing-section' : 'cookies-source'
		const target = document.querySelector(`[data-testid="${targetTestId}"]`)
		if (target instanceof HTMLElement) {
			target.scrollIntoView?.({block: 'center', behavior: 'smooth'})
		}
		setAdvancedAutoOpen(false, advancedAutoTarget)
	}, [advancedAutoOpen, advancedAutoTarget, setAdvancedAutoOpen])

	async function chooseCookiesFile(): Promise<void> {
		const result = await window.appApi.dialog.chooseFile()
		if (result.ok && result.data.path) await setCookiesPath(result.data.path)
	}

	return (
		<div className="grid gap-4 lg:grid-cols-2" data-testid="profiles-settings-tab">
			<SettingsPanel title="Input" description={t('wizard.url.advanced')}>
				<FieldGroup className="gap-4">
					<SettingSwitch id="profiles-settings-clipboard" label={t('wizard.url.clipboard.toggle')} description={t('wizard.url.clipboard.toggleDescription')} checked={common?.clipboardWatchEnabled ?? false} onCheckedChange={checked => void setClipboardWatchEnabled(checked)} />

					<Field className="gap-1.5" data-testid="cookies-source">
						<FieldContent className="gap-0.5">
							<FieldTitle id="profiles-settings-cookies-mode" className="text-[13px] font-medium text-foreground">
								{t('wizard.url.cookies.sourceLabel')}
							</FieldTitle>
							<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.cookies.toggleDescription')}</FieldDescription>
						</FieldContent>
						<ToggleGroup
							variant="outline"
							value={[cookiesMode]}
							onValueChange={value => {
								if (value[0]) void setCookiesMode(value[0] as CookiesMode)
							}}
							spacing={1}
							className="flex w-full flex-wrap gap-1"
							aria-labelledby="profiles-settings-cookies-mode"
						>
							<ToggleGroupItem value="off" className="h-7 px-3 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
								{t('wizard.url.cookies.sourceOff')}
							</ToggleGroupItem>
							<ToggleGroupItem value="file" className="h-7 px-3 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
								{t('wizard.url.cookies.sourceFile')}
							</ToggleGroupItem>
							<ToggleGroupItem value="browser" className="h-7 px-3 text-[12px] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]">
								{t('wizard.url.cookies.sourceBrowser')}
							</ToggleGroupItem>
						</ToggleGroup>
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
							<Button type="button" variant="link" size="xs" className="h-auto px-0 text-[11px] text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_HELP_URL)} data-testid="cookies-help-link">
								{t('wizard.url.cookies.helpLink')}
							</Button>
							<Button type="button" variant="link" size="xs" className="h-auto px-0 text-[11px] text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_FIREFOX_URL)} data-testid="cookies-firefox-link">
								{t('wizard.url.cookies.extensionFirefox')}
							</Button>
							<Button type="button" variant="link" size="xs" className="h-auto px-0 text-[11px] text-[var(--text-subtle)] hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_CHROME_URL)} data-testid="cookies-chrome-link">
								{t('wizard.url.cookies.extensionChrome')}
							</Button>
						</div>
						<WarningText text={t('wizard.url.cookies.risk')} />
						{cookiesMode !== 'off' ? <WarningText text={t('wizard.url.cookies.banWarning')} /> : null}
					</Field>

					{cookiesMode === 'file' ? (
						<Field className="gap-1.5">
							<FieldLabel htmlFor="profiles-settings-cookies-path" className="text-[11px] font-medium text-[var(--text-subtle)]">
								{t('wizard.url.cookies.fileLabel')}
							</FieldLabel>
							<InputGroup className="h-9">
								<InputGroupInput id="profiles-settings-cookies-path" readOnly value={cookiesPath ? formatHomeRelativePath(cookiesPath, commonPaths) : ''} placeholder={t('wizard.url.cookies.placeholder')} className="text-[12px] font-mono" data-testid="profiles-settings-cookies-path" />
								<InputGroupAddon align="inline-end">
									<InputGroupButton type="button" onClick={() => void chooseCookiesFile()}>
										{t('wizard.url.cookies.choose')}
									</InputGroupButton>
									<InputGroupButton type="button" onClick={() => void setCookiesPath('')} disabled={!cookiesPath}>
										{t('wizard.url.cookies.clear')}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							{showMissingFileWarning ? <WarningText text={t('wizard.url.cookies.enabledButNoFile')} /> : null}
						</Field>
					) : null}

					{cookiesMode === 'browser' ? (
						<Field className="gap-1.5">
							<FieldLabel htmlFor="profiles-settings-cookies-browser-trigger" className="text-[11px] font-medium text-[var(--text-subtle)]">
								{t('wizard.url.cookies.browserLabel')}
							</FieldLabel>
							<Select
								value={cookiesBrowser ?? ''}
								onValueChange={value => {
									if (value) void setCookiesBrowser(value as CookiesBrowser)
								}}
							>
								<SelectTrigger id="profiles-settings-cookies-browser-trigger" className="w-full" data-testid="profiles-settings-cookies-browser">
									<SelectValue placeholder={t('wizard.url.cookies.browserPlaceholder')}>{selected => visibleBrowsers.find(browser => browser.value === selected)?.label ?? t('wizard.url.cookies.browserPlaceholder')}</SelectValue>
								</SelectTrigger>
								<SelectContent align="start">
									<SelectGroup>
										{visibleBrowsers.map(browser => (
											<SelectItem key={browser.value} value={browser.value}>
												{browser.label}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
							<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.cookies.browserHelp')}</FieldDescription>
							{showMissingBrowserWarning ? <WarningText text={t('wizard.url.cookies.enabledButNoBrowser')} /> : null}
						</Field>
					) : null}

					<Field className="gap-1.5">
						<FieldContent className="gap-0.5">
							<FieldLabel htmlFor="profiles-settings-proxy-url" className="text-[13px] font-medium text-foreground">
								{t('wizard.url.proxy.label')}
							</FieldLabel>
							<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.proxy.description')}</FieldDescription>
						</FieldContent>
						<InputGroup className="h-9">
							<InputGroupInput id="profiles-settings-proxy-url" type="url" value={proxyUrl} onChange={event => void setProxyUrl(event.target.value)} placeholder={t('wizard.url.proxy.placeholder')} className="text-[12px] font-mono" data-testid="profiles-settings-proxy-url" />
							<InputGroupAddon align="inline-end">
								<InputGroupButton type="button" onClick={() => void setProxyUrl('')} disabled={!proxyUrl}>
									{t('wizard.url.proxy.clear')}
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					</Field>
				</FieldGroup>
			</SettingsPanel>

			<SettingsPanel title="Download behavior" description="Global behavior that affects profile-driven downloads too.">
				<FieldGroup className="gap-4">
					<Field orientation="horizontal" className="items-center justify-between gap-3">
						<FieldContent className="gap-0.5">
							<FieldTitle id="profiles-settings-speed-limit" className="text-[13px] font-medium text-foreground">
								{t('wizard.url.limitRate.label')}
							</FieldTitle>
							<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.limitRate.description')}</FieldDescription>
						</FieldContent>
						<Popover>
							<PopoverTrigger
								render={
									<Button type="button" variant="outline" size="sm" aria-labelledby="profiles-settings-speed-limit" data-testid="profiles-settings-limit-rate-trigger">
										<Gauge data-icon="inline-start" aria-hidden />
										{limitRate ? formatLimitRateLabel(limitRate) : t('wizard.url.limitRate.off')}
									</Button>
								}
							/>
							<PopoverContent align="end" sideOffset={8} className="w-64">
								<div className="flex flex-col gap-1">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('wizard.url.limitRate.label')}</p>
									<p className="text-[11px] text-[var(--text-subtle)]">{t('wizard.url.limitRate.activeWarning')}</p>
								</div>
								<LimitRatePicker value={limitRate} onChange={value => void setLimitRate(value)} />
							</PopoverContent>
						</Popover>
					</Field>

					<NetworkPacingSettings />

					<SettingSwitch
						id="profiles-settings-filename-id"
						label={t('wizard.url.singleFilenameId.toggle')}
						description={t('wizard.url.singleFilenameId.toggleDescription')}
						checked={common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames}
						onCheckedChange={checked => void setIncludeIdInSingleFilenames(checked)}
						testId="single-filename-id-toggle"
					/>

					{platform !== 'darwin' ? <SettingSwitch id="profiles-settings-close-tray" label={t('wizard.url.closeToTray.toggle')} description={t('wizard.url.closeToTray.toggleDescription')} checked={common?.closeBehavior === 'tray'} onCheckedChange={checked => void setCloseBehavior(checked ? 'tray' : 'quit')} /> : null}

					<SettingSwitch id="profiles-settings-analytics" label={t('wizard.url.analytics.toggle')} description={t('wizard.url.analytics.toggleDescription')} checked={common?.analyticsEnabled ?? true} onCheckedChange={checked => void setAnalyticsEnabled(checked)} />
				</FieldGroup>
			</SettingsPanel>
		</div>
	)
}

function WarningText({text}: {text: string}): ReactNode {
	return (
		<Alert variant="warning" className="py-1.5">
			<AlertTriangle aria-hidden />
			<AlertDescription className="text-[11px]">{text}</AlertDescription>
		</Alert>
	)
}

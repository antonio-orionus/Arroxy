import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle} from 'lucide-react'
import type {CookiesBrowser, CookiesMode} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'

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

// The cookies source picker plus the follow-up field its mode needs (a cookies
// file or a browser to read from).
export function CookiesSettingsFields(): ReactNode {
	const {settings} = useAppStore()
	const cookiesMode: CookiesMode = settings?.common?.cookiesMode ?? 'off'
	return (
		<>
			<CookiesSourceField cookiesMode={cookiesMode} />
			{cookiesMode === 'file' ? <CookiesFileField /> : null}
			{cookiesMode === 'browser' ? <CookiesBrowserField /> : null}
		</>
	)
}

function CookiesSourceField({cookiesMode}: {cookiesMode: CookiesMode}): ReactNode {
	const {t} = useTranslation()
	const {settings, setCookiesMode} = useAppStore()
	const exploreEnabled = settings?.common?.exploreEnabled !== false
	return (
		<Field className="gap-1.5" data-testid="cookies-source">
			<FieldContent className="gap-0.5">
				<FieldTitle id="profiles-settings-cookies-mode">{t('wizard.url.cookies.sourceLabel')}</FieldTitle>
				<FieldDescription>{t('wizard.url.cookies.toggleDescription')}</FieldDescription>
			</FieldContent>
			<ToggleGroup
				size="sm"
				variant="outline"
				value={[cookiesMode]}
				onValueChange={value => {
					if (value[0]) void setCookiesMode(value[0] as CookiesMode)
				}}
				spacing={1}
				className="flex w-full flex-wrap gap-1"
				aria-labelledby="profiles-settings-cookies-mode"
			>
				<ToggleGroupItem value="explore">
					{t('wizard.url.cookies.sourceExplore')} <Badge size="sm">{t('wizard.url.cookies.recommended')}</Badge>
				</ToggleGroupItem>
				<ToggleGroupItem value="off">{t('wizard.url.cookies.sourceOff')}</ToggleGroupItem>
				<ToggleGroupItem value="file">{t('wizard.url.cookies.sourceFile')}</ToggleGroupItem>
				<ToggleGroupItem value="browser">{t('wizard.url.cookies.sourceBrowser')}</ToggleGroupItem>
			</ToggleGroup>
			{cookiesMode === 'explore' ? <ExploreModeDescription enabled={exploreEnabled} /> : null}
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
				<Button type="button" variant="link" size="inline" className="text-subtle-foreground hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_HELP_URL)} data-testid="cookies-help-link">
					{t('wizard.url.cookies.helpLink')}
				</Button>
				<Button type="button" variant="link" size="inline" className="text-subtle-foreground hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_FIREFOX_URL)} data-testid="cookies-firefox-link">
					{t('wizard.url.cookies.extensionFirefox')}
				</Button>
				<Button type="button" variant="link" size="inline" className="text-subtle-foreground hover:text-foreground" onClick={() => void window.appApi.shell.openExternal(COOKIES_CHROME_URL)} data-testid="cookies-chrome-link">
					{t('wizard.url.cookies.extensionChrome')}
				</Button>
			</div>
			<WarningText text={t('wizard.url.cookies.risk')} />
			{cookiesMode !== 'off' ? <WarningText text={t('wizard.url.cookies.banWarning')} /> : null}
		</Field>
	)
}

function CookiesFileField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setCookiesPath} = useAppStore()
	const cookiesPath = settings?.common?.cookiesPath ?? ''
	const commonPaths = settings?.common?.commonPaths

	async function chooseCookiesFile(): Promise<void> {
		const result = await window.appApi.dialog.chooseFile()
		if (result.ok && result.data.path) await setCookiesPath(result.data.path)
	}

	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor="profiles-settings-cookies-path" size="sm">
				{t('wizard.url.cookies.fileLabel')}
			</FieldLabel>
			<InputGroup className="h-9">
				<InputGroupInput id="profiles-settings-cookies-path" readOnly value={cookiesPath ? formatHomeRelativePath(cookiesPath, commonPaths) : ''} placeholder={t('wizard.url.cookies.placeholder')} className="text-xs font-mono" data-testid="profiles-settings-cookies-path" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton type="button" onClick={() => void chooseCookiesFile()}>
						{t('wizard.url.cookies.choose')}
					</InputGroupButton>
					<InputGroupButton type="button" onClick={() => void setCookiesPath('')} disabled={!cookiesPath}>
						{t('wizard.url.cookies.clear')}
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			{cookiesPath.trim() ? null : <WarningText text={t('wizard.url.cookies.enabledButNoFile')} />}
		</Field>
	)
}

function CookiesBrowserField(): ReactNode {
	const {t} = useTranslation()
	const {settings, setCookiesBrowser} = useAppStore()
	const cookiesBrowser = settings?.common?.cookiesBrowser
	const visibleBrowsers = COOKIES_BROWSERS.filter(browser => !browser.macOnly || window.platform === 'darwin')
	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor="profiles-settings-cookies-browser-trigger" size="sm">
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
			<FieldDescription>{t('wizard.url.cookies.browserHelp')}</FieldDescription>
			{cookiesBrowser ? null : <WarningText text={t('wizard.url.cookies.enabledButNoBrowser')} />}
		</Field>
	)
}

// The tab is the only place to sign in, so with it turned off there is nothing to link to.
function ExploreModeDescription({enabled}: {enabled: boolean}): ReactNode {
	const {t} = useTranslation()
	if (!enabled) return <WarningText text={t('wizard.url.cookies.exploreDisabled')} />
	return (
		<FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-1" data-testid="cookies-explore-description">
			<span>{t('wizard.url.cookies.exploreDescription')}</span>
			<Button type="button" variant="link" size="inline" onClick={() => replaceHash('explore')} data-testid="cookies-open-explore">
				{t('wizard.url.cookies.openExplore')}
			</Button>
		</FieldDescription>
	)
}

function WarningText({text}: {text: string}): ReactNode {
	return (
		<Alert variant="warning" size="sm">
			<AlertTriangle aria-hidden />
			<AlertDescription>{text}</AlertDescription>
		</Alert>
	)
}

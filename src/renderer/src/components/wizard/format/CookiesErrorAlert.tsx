import type {ReactNode} from 'react'
import {AlertTriangle, ExternalLink} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {Alert, AlertDescription} from '@renderer/components/ui/alert.js'
import {Button} from '@renderer/components/ui/button.js'

const DPAPI_DOCS_URL = 'https://github.com/yt-dlp/yt-dlp/issues/10927'

function isDpapiCookieError(text: string | undefined | null): boolean {
	if (!text) return false
	return /Failed to decrypt with DPAPI|no encrypted key in Local State/i.test(text)
}

interface CookiesAlertShellProps {
	mode: string
	variant?: string
	body: ReactNode
	footer: ReactNode
}

function CookiesAlertShell({mode, variant, body, footer}: CookiesAlertShellProps): ReactNode {
	return (
		<Alert role="status" variant="warning" data-testid="cookies-error-alert" data-mode={mode} {...(variant ? {'data-variant': variant} : {})} className="text-[12px]">
			<AlertTriangle />
			<AlertDescription className="flex flex-col gap-1 text-[12px] text-current">{body}</AlertDescription>
			<div className="col-start-2 flex flex-col gap-2">{footer}</div>
		</Alert>
	)
}

function OpenCookiesSettingsButton(): ReactNode {
	const {t} = useTranslation()
	const {openCookiesSettings} = useAppStore()
	return (
		<div className="flex flex-wrap gap-2">
			<Button type="button" size="sm" variant="outline" onClick={() => openCookiesSettings()} data-testid="cookies-error-open-settings-cta">
				<ExternalLink data-icon="inline-start" />
				{t('wizard.formats.cookiesError.openSettingsCta')}
			</Button>
		</div>
	)
}

interface CookiesErrorAlertProps {
	// When true, render even if cookiesMode === 'off'. Used by StepError when
	// the error message itself signals "needs cookies".
	forceShowCookiesOff?: boolean
}

export function CookiesErrorAlert({forceShowCookiesOff = false}: CookiesErrorAlertProps = {}): ReactNode | null {
	const {t} = useTranslation()
	const {settings, wizardError} = useAppStore()
	const cookiesMode = settings?.common?.cookiesMode ?? 'off'

	// Cookies-off + error suggests cookies → render the "needs cookies" variant
	// so the user has a one-click path to the cookies settings.
	if (cookiesMode === 'off') {
		if (!forceShowCookiesOff) return null
		return (
			<CookiesAlertShell
				mode="off"
				variant="needs-cookies"
				body={
					<>
						<span className="font-semibold">{t('wizard.formats.cookiesError.needsCookies.heading')}</span>
						<span className="leading-snug">{t('wizard.formats.cookiesError.needsCookies.body')}</span>
					</>
				}
				footer={<OpenCookiesSettingsButton />}
			/>
		)
	}

	const errorRaw = wizardError?.kind === 'ytdlp' ? wizardError.error.raw : wizardError?.kind === 'other' ? wizardError.message + (wizardError.details ? '\n' + wizardError.details : '') : null
	const dpapiDetected = cookiesMode === 'browser' && isDpapiCookieError(errorRaw)

	if (dpapiDetected) {
		return (
			<CookiesAlertShell
				mode="browser"
				variant="dpapi"
				body={
					<>
						<span className="font-semibold">{t('wizard.formats.cookiesError.dpapi.heading')}</span>
						<span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.explanation')}</span>
					</>
				}
				footer={
					<>
						<ol className="flex list-decimal flex-col gap-1.5 ps-4 marker:text-amber-700/80 dark:marker:text-amber-200/70">
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFirefoxLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFirefoxBody')}</span>
							</li>
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFileLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFileBody')}</span>
							</li>
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixUnsafeLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixUnsafeBody')}</span>{' '}
								<Button type="button" variant="link" size="xs" className="h-auto px-0 align-baseline text-[12px]" onClick={() => void window.appApi.shell.openExternal(DPAPI_DOCS_URL)} data-testid="cookies-error-dpapi-docs-link">
									{t('wizard.formats.cookiesError.dpapi.docsLinkLabel')}
									<ExternalLink data-icon="inline-end" />
								</Button>
							</li>
						</ol>
						<OpenCookiesSettingsButton />
					</>
				}
			/>
		)
	}

	const modeLabel = cookiesMode === 'file' ? t('wizard.formats.cookiesError.currentModeFile') : t('wizard.formats.cookiesError.currentModeBrowser')
	const explanation = cookiesMode === 'file' ? t('wizard.formats.cookiesError.explanationFile') : t('wizard.formats.cookiesError.explanationBrowser')

	return (
		<CookiesAlertShell
			mode={cookiesMode}
			body={
				<>
					<span className="font-semibold">{t('wizard.formats.cookiesError.heading')}</span>
					<span className="text-[11px] text-amber-800/80 dark:text-amber-200/80">
						{t('wizard.formats.cookiesError.currentModeLabel')}: <span className="font-medium">{modeLabel}</span>
					</span>
					<span className="leading-snug">{explanation}</span>
				</>
			}
			footer={<OpenCookiesSettingsButton />}
		/>
	)
}

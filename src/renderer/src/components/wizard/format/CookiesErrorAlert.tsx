import type {ReactNode} from 'react'
import {AlertTriangle, ExternalLink} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import type {CookiesGuidance} from '@renderer/store/wizard/probeErrorExperience.js'
import {Alert, AlertDescription} from '@renderer/components/ui/alert.js'
import {Button} from '@renderer/components/ui/button.js'
import {cn} from '@renderer/lib/utils.js'

const DPAPI_DOCS_URL = 'https://github.com/yt-dlp/yt-dlp/issues/10927'
type GuidanceDensity = 'full' | 'compact'

interface CookiesAlertShellProps {
	mode: string
	variant?: string
	body: ReactNode
	footer: ReactNode
	density: GuidanceDensity
}

function CookiesAlertShell({mode, variant, body, footer, density}: CookiesAlertShellProps): ReactNode {
	const compact = density === 'compact'
	return (
		<Alert role="status" variant="warning" data-testid="cookies-error-alert" data-mode={mode} data-density={density} {...(variant ? {'data-variant': variant} : {})} className={cn('text-[12px]', compact && 'py-2')}>
			<AlertTriangle className={cn(compact && 'mt-0.5 size-3.5')} />
			<AlertDescription className={cn('flex flex-col gap-1 text-[12px] text-current', compact && 'text-[11px]')}>{body}</AlertDescription>
			<div className={cn('col-start-2 flex flex-col gap-2', compact && 'gap-1.5')}>{footer}</div>
		</Alert>
	)
}

function OpenCookiesSettingsButton({onOpenSettings, density, testId}: {onOpenSettings: () => void; density: GuidanceDensity; testId: string}): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="flex flex-wrap gap-2">
			<Button type="button" size={density === 'compact' ? 'xs' : 'sm'} variant="outline" onClick={onOpenSettings} data-testid={testId}>
				<ExternalLink data-icon="inline-start" />
				{t('wizard.formats.cookiesError.openSettingsCta')}
			</Button>
		</div>
	)
}

interface CookiesGuidanceAlertProps {
	guidance: CookiesGuidance
	onOpenSettings: () => void
	density?: GuidanceDensity
	openSettingsTestId?: string
}

export function CookiesGuidanceAlert({guidance, onOpenSettings, density = 'full', openSettingsTestId = 'cookies-error-open-settings-cta'}: CookiesGuidanceAlertProps): ReactNode | null {
	const {t} = useTranslation()
	if (guidance.variant === 'hidden') return null
	if (guidance.variant === 'needs-cookies') {
		return (
			<CookiesAlertShell
				mode="off"
				variant="needs-cookies"
				density={density}
				body={
					<>
						<span className="font-semibold">{t('wizard.formats.cookiesError.needsCookies.heading')}</span>
						<span className="leading-snug">{t('wizard.formats.cookiesError.needsCookies.body')}</span>
					</>
				}
				footer={<OpenCookiesSettingsButton onOpenSettings={onOpenSettings} density={density} testId={openSettingsTestId} />}
			/>
		)
	}
	if (guidance.variant === 'dpapi') {
		return (
			<CookiesAlertShell
				mode="browser"
				variant="dpapi"
				density={density}
				body={
					<>
						<span className="font-semibold">{t('wizard.formats.cookiesError.dpapi.heading')}</span>
						<span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.explanation')}</span>
					</>
				}
				footer={
					<>
						<ol className={cn('flex list-decimal flex-col gap-1.5 ps-4 marker:text-amber-700/80 dark:marker:text-amber-200/70', density === 'compact' && 'gap-1')}>
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFirefoxLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFirefoxBody')}</span>
							</li>
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFileLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFileBody')}</span>
							</li>
							<li>
								<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixUnsafeLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixUnsafeBody')}</span>{' '}
								<Button type="button" variant="link" size="xs" className={cn('h-auto px-0 align-baseline text-[12px]', density === 'compact' && 'text-[11px]')} onClick={() => void window.appApi.shell.openExternal(DPAPI_DOCS_URL)} data-testid="cookies-error-dpapi-docs-link">
									{t('wizard.formats.cookiesError.dpapi.docsLinkLabel')}
									<ExternalLink data-icon="inline-end" />
								</Button>
							</li>
						</ol>
						<OpenCookiesSettingsButton onOpenSettings={onOpenSettings} density={density} testId={openSettingsTestId} />
					</>
				}
			/>
		)
	}

	const modeLabel = guidance.mode === 'file' ? t('wizard.formats.cookiesError.currentModeFile') : t('wizard.formats.cookiesError.currentModeBrowser')
	const explanation = guidance.mode === 'file' ? t('wizard.formats.cookiesError.explanationFile') : t('wizard.formats.cookiesError.explanationBrowser')

	return (
		<CookiesAlertShell
			mode={guidance.mode}
			density={density}
			body={
				<>
					<span className="font-semibold">{t('wizard.formats.cookiesError.heading')}</span>
					<span className="text-[11px] text-amber-800/80 dark:text-amber-200/80">
						{t('wizard.formats.cookiesError.currentModeLabel')}: <span className="font-medium">{modeLabel}</span>
					</span>
					<span className="leading-snug">{explanation}</span>
				</>
			}
			footer={<OpenCookiesSettingsButton onOpenSettings={onOpenSettings} density={density} testId={openSettingsTestId} />}
		/>
	)
}

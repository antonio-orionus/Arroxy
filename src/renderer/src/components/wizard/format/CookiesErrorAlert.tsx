import type {ReactNode} from 'react'
import {AlertTriangle, Compass, ExternalLink, RefreshCw, ShieldCheck} from 'lucide-react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import type {ExploreSignInSite} from '@renderer/store/exploreSignInSite.js'
import type {ConfiguredCookiesMode, CookiesGuidance} from '@renderer/store/wizard/probeErrorExperience.js'
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
		<Alert role="status" variant="warning" data-testid="cookies-error-alert" data-mode={mode} data-density={density} {...(variant ? {'data-variant': variant} : {})} size={compact ? 'sm' : 'default'}>
			<AlertTriangle />
			<AlertDescription className="flex flex-col gap-1">{body}</AlertDescription>
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
	// Both get the guidance's site: where in Explore the sign-in is.
	onSignInWithExplore: (site: ExploreSignInSite) => void
	onSignInWithExploreThenRetry: (site: ExploreSignInSite) => void
	onRetryWithExploreSignIn: () => void
	// The offer's second way when a cookies file or browser is already set up.
	onEnableCookiesAndRetry: () => void
	density?: GuidanceDensity
	openSettingsTestId?: string
}

const CONFIGURED_COPY = {
	file: {heading: 'wizard.formats.cookiesError.heading', mode: 'wizard.formats.cookiesError.currentModeFile', explanation: 'wizard.formats.cookiesError.explanationFile'},
	browser: {heading: 'wizard.formats.cookiesError.heading', mode: 'wizard.formats.cookiesError.currentModeBrowser', explanation: 'wizard.formats.cookiesError.explanationBrowser'},
	explore: {heading: 'wizard.formats.cookiesError.exploreSignedIn.heading', mode: 'wizard.formats.cookiesError.currentModeExplore', explanation: 'wizard.formats.cookiesError.exploreSignedIn.body'}
} as const satisfies Record<ConfiguredCookiesMode, {heading: string; mode: string; explanation: string}>

const EXPLORE_SIGN_IN_COPY = {heading: 'wizard.formats.cookiesError.exploreSignIn.heading', body: 'wizard.formats.cookiesError.exploreSignIn.body'} as const

const EXPLORE_OFFER_COPY = {
	'explore-offer': {heading: 'wizard.formats.cookiesError.exploreOffer.heading', body: 'wizard.formats.cookiesError.exploreOffer.body', cta: 'wizard.formats.cookiesError.exploreOffer.cta'},
	'explore-reuse': {heading: 'wizard.formats.cookiesError.exploreReuse.heading', body: 'wizard.formats.cookiesError.exploreReuse.body', cta: 'wizard.formats.cookiesError.exploreReuse.cta'}
} as const

type ExploreOfferGuidance = Extract<CookiesGuidance, {variant: 'explore-offer' | 'explore-reuse'}>

// Another site's sign-in (ADR 0011): the alert names the site, and the user retries.
function exploreGuidanceText(t: TFunction, guidance: ExploreOfferGuidance | Extract<CookiesGuidance, {variant: 'explore-sign-in'}>): {heading: string; body: string} {
	if (guidance.variant !== 'explore-reuse' && guidance.site.kind === 'web') {
		const {host} = guidance.site
		return {heading: t('wizard.formats.cookiesError.exploreSite.heading', {host}), body: t(guidance.variant === 'explore-offer' ? 'wizard.formats.cookiesError.exploreSite.offerBody' : 'wizard.formats.cookiesError.exploreSite.signInBody', {host})}
	}
	const copy = guidance.variant === 'explore-sign-in' ? EXPLORE_SIGN_IN_COPY : EXPLORE_OFFER_COPY[guidance.variant]
	return {heading: t(copy.heading), body: t(copy.body)}
}

interface ExploreOfferAlertProps extends Pick<CookiesGuidanceAlertProps, 'onOpenSettings' | 'onSignInWithExploreThenRetry' | 'onRetryWithExploreSignIn' | 'onEnableCookiesAndRetry'> {
	guidance: ExploreOfferGuidance
	density: GuidanceDensity
	openSettingsTestId: string
}

function ExploreOfferAlert({guidance, density, openSettingsTestId, onOpenSettings, onSignInWithExploreThenRetry, onRetryWithExploreSignIn, onEnableCookiesAndRetry}: ExploreOfferAlertProps): ReactNode {
	const {t} = useTranslation()
	// P2-R51: Explore first; a cookies file or browser stays the second way.
	const copy = EXPLORE_OFFER_COPY[guidance.variant]
	const text = exploreGuidanceText(t, guidance)
	const size = density === 'compact' ? 'xs' : 'sm'
	return (
		<CookiesAlertShell
			mode="off"
			variant={guidance.variant}
			density={density}
			body={
				<>
					<span className="font-semibold">{text.heading}</span>
					<span className="leading-snug">{text.body}</span>
				</>
			}
			footer={
				<div className="flex flex-wrap gap-2">
					<Button type="button" size={size} variant="default" onClick={guidance.variant === 'explore-offer' ? () => onSignInWithExploreThenRetry(guidance.site) : onRetryWithExploreSignIn} data-testid={guidance.variant === 'explore-offer' ? 'cookies-error-explore-offer-cta' : 'cookies-error-explore-reuse-cta'}>
						{guidance.variant === 'explore-offer' ? <Compass data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
						{t(copy.cta)}
					</Button>
					{guidance.secondary === 'enable-cookies' ? (
						<Button type="button" size={size} variant="outline" onClick={onEnableCookiesAndRetry} data-testid="cookies-error-enable-cookies-retry">
							<ShieldCheck data-icon="inline-start" />
							{t('wizard.formats.botWall.enableRetryCta')}
						</Button>
					) : (
						<Button type="button" size={size} variant="outline" onClick={onOpenSettings} data-testid={openSettingsTestId}>
							<ExternalLink data-icon="inline-start" />
							{t('wizard.formats.cookiesError.otherCookiesCta')}
						</Button>
					)}
				</div>
			}
		/>
	)
}

// The three ways around Chromium's app-bound cookie encryption on Windows.
function DpapiFixSteps({density}: {density: GuidanceDensity}): ReactNode {
	const {t} = useTranslation()
	return (
		<ol className={cn('flex list-decimal flex-col gap-1.5 ps-4 marker:text-warning', density === 'compact' && 'gap-1')}>
			<li>
				<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFirefoxLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFirefoxBody')}</span>
			</li>
			<li>
				<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixFileLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixFileBody')}</span>
			</li>
			<li>
				<span className="font-medium">{t('wizard.formats.cookiesError.dpapi.fixUnsafeLabel')}.</span> <span className="leading-snug">{t('wizard.formats.cookiesError.dpapi.fixUnsafeBody')}</span>{' '}
				<Button type="button" variant="link" size="inline" onClick={() => void window.appApi.shell.openExternal(DPAPI_DOCS_URL)} data-testid="cookies-error-dpapi-docs-link">
					{t('wizard.formats.cookiesError.dpapi.docsLinkLabel')}
					<ExternalLink data-icon="inline-end" />
				</Button>
			</li>
		</ol>
	)
}

export function CookiesGuidanceAlert({guidance, onOpenSettings, onSignInWithExplore, onSignInWithExploreThenRetry, onRetryWithExploreSignIn, onEnableCookiesAndRetry, density = 'full', openSettingsTestId = 'cookies-error-open-settings-cta'}: CookiesGuidanceAlertProps): ReactNode | null {
	const {t} = useTranslation()
	if (guidance.variant === 'hidden') return null
	if (guidance.variant === 'explore-offer' || guidance.variant === 'explore-reuse') {
		return <ExploreOfferAlert guidance={guidance} density={density} openSettingsTestId={openSettingsTestId} onOpenSettings={onOpenSettings} onSignInWithExploreThenRetry={onSignInWithExploreThenRetry} onRetryWithExploreSignIn={onRetryWithExploreSignIn} onEnableCookiesAndRetry={onEnableCookiesAndRetry} />
	}
	if (guidance.variant === 'explore-sign-in') {
		const text = exploreGuidanceText(t, guidance)
		return (
			<CookiesAlertShell
				mode="explore"
				variant="explore-sign-in"
				density={density}
				body={
					<>
						<span className="font-semibold">{text.heading}</span>
						<span className="leading-snug">{text.body}</span>
					</>
				}
				footer={
					<div className="flex flex-wrap gap-2">
						<Button type="button" size={density === 'compact' ? 'xs' : 'sm'} variant="outline" onClick={() => onSignInWithExplore(guidance.site)} data-testid="cookies-error-explore-sign-in-cta">
							<Compass data-icon="inline-start" />
							{t('wizard.formats.cookiesError.exploreSignIn.cta')}
						</Button>
					</div>
				}
			/>
		)
	}
	if (guidance.variant === 'explore-refused') {
		return (
			<CookiesAlertShell
				mode={guidance.mode}
				variant="explore-refused"
				density={density}
				body={
					<>
						<span className="font-semibold">{t('wizard.formats.cookiesError.exploreRefused.heading')}</span>
						<span className="leading-snug">{t('wizard.formats.cookiesError.exploreRefused.body')}</span>
					</>
				}
				footer={null}
			/>
		)
	}
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
						<DpapiFixSteps density={density} />
						<OpenCookiesSettingsButton onOpenSettings={onOpenSettings} density={density} testId={openSettingsTestId} />
					</>
				}
			/>
		)
	}

	const copy = CONFIGURED_COPY[guidance.mode]

	return (
		<CookiesAlertShell
			mode={guidance.mode}
			density={density}
			body={
				<>
					<span className="font-semibold">{t(copy.heading)}</span>
					<span className="text-caption text-muted-foreground">
						{t('wizard.formats.cookiesError.currentModeLabel')}: <span className="font-medium">{t(copy.mode)}</span>
					</span>
					<span className="leading-snug">{t(copy.explanation)}</span>
				</>
			}
			footer={<OpenCookiesSettingsButton onOpenSettings={onOpenSettings} density={density} testId={openSettingsTestId} />}
		/>
	)
}

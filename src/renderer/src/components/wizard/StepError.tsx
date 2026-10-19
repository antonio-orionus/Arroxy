import type {ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {formatProbeError, useAppStore} from '../../store/useAppStore.js'
import {buildProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import {Button} from '../ui/button.js'
import {requestSiteFor} from '@shared/sites/index.js'
import {BotWallGuidanceAlert} from './format/BotWallNotice.js'
import {RateLimitAlert} from './format/RateLimitNotice.js'
import {CookiesGuidanceAlert} from './format/CookiesErrorAlert.js'

export function StepError(): ReactNode {
	const {t} = useTranslation()
	const {wizardError, wizardUrl, settings, exploreView, retry, reset, openCookiesSettings, openExploreSignIn, retryFormatProbe, retryProbeWithCookies, signInWithExploreThenRetry, retryWithExploreSignIn} = useAppStore(
		useShallow(state => ({
			wizardError: state.wizardError,
			wizardUrl: state.wizardUrl,
			settings: state.settings,
			exploreView: state.exploreView,
			retry: state.retry,
			reset: state.reset,
			openCookiesSettings: state.openCookiesSettings,
			openExploreSignIn: state.openExploreSignIn,
			retryFormatProbe: state.retryFormatProbe,
			retryProbeWithCookies: state.retryProbeWithCookies,
			signInWithExploreThenRetry: state.signInWithExploreThenRetry,
			retryWithExploreSignIn: state.retryWithExploreSignIn
		}))
	)
	// Leaving for Explore is the user's own choice here, unlike a toast's (P2-R41).
	const target = {kind: 'wizard', url: wizardUrl.trim()} as const
	const message = formatProbeError(wizardError)
	const experience = buildProbeErrorExperience({error: wizardError, url: target.url, commonSettings: settings?.common, exploreSignedIn: exploreView?.signedIn ?? null})
	const showBotWallNotice = experience.botWall.variant !== 'hidden'
	const showCookiesAlert = experience.cookies.variant !== 'hidden'
	// The rate-limit alert carries the retry: "Try now" while the cooldown runs.
	const showRateLimitAlert = experience.rateLimit.variant !== 'hidden'

	return (
		<div className="wizard-step flex flex-col items-center gap-4 py-4 text-center" data-testid="step-error">
			<div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-base font-bold error-icon-pulse" aria-hidden data-testid="error-icon">
				✕
			</div>
			<p className="text-sm text-foreground/80 max-w-sm" data-testid="error-message">
				{message}
			</p>
			{showBotWallNotice || showCookiesAlert || showRateLimitAlert ? (
				<div className="w-full max-w-md text-start flex flex-col gap-2">
					<RateLimitAlert guidance={experience.rateLimit} site={requestSiteFor(target.url)} onRetry={() => void retry()} />
					<BotWallGuidanceAlert guidance={experience.botWall} onEnableCookiesAndRetry={() => void retryProbeWithCookies()} onRetry={() => void retryFormatProbe()} />
					<CookiesGuidanceAlert
						guidance={experience.cookies}
						onOpenSettings={openCookiesSettings}
						onSignInWithExplore={openExploreSignIn}
						onSignInWithExploreThenRetry={site => void signInWithExploreThenRetry(target, site)}
						onRetryWithExploreSignIn={() => void retryWithExploreSignIn(target)}
						onEnableCookiesAndRetry={() => void retryProbeWithCookies()}
					/>
				</div>
			) : null}
			<div className="flex gap-2">
				<Button variant="ghost" type="button" onClick={reset} data-testid="btn-start-over">
					{t('common.startOver')}
				</Button>
				{showRateLimitAlert ? null : (
					<Button type="button" onClick={() => void retry()} data-testid="btn-retry">
						{t('common.retry')}
					</Button>
				)}
			</div>
		</div>
	)
}

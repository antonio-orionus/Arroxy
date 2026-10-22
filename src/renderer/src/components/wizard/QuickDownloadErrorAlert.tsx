import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {RefreshCw} from 'lucide-react'
import type {ExploreSignInSite} from '../../store/exploreSignInSite.js'
import type {ProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {requestSiteFor} from '@shared/sites/index.js'
import {BotWallGuidanceAlert} from './format/BotWallNotice.js'
import {RateLimitAlert} from './format/RateLimitNotice.js'
import {CookiesGuidanceAlert} from './format/CookiesErrorAlert.js'

interface QuickDownloadErrorAlertProps {
	experience: ProbeErrorExperience | null
	// What the failure was, in the user's language.
	message: string
	// The URL the failed probe asked for: whose rate-limit cooldown the alert shows.
	url: string | null
	onEnableCookiesAndRetry: () => void
	onOpenCookiesSettings: () => void
	onSignInWithExplore: (site: ExploreSignInSite) => void
	onSignInWithExploreThenRetry: (site: ExploreSignInSite) => void
	onRetryWithExploreSignIn: () => void
	onRetry: () => void
	className?: string
}

// A failed quick download (a probe-error row in Downloads), with the bot-wall /
// cookies guidance its probe error calls for.
export function QuickDownloadErrorAlert({experience, message, url, onEnableCookiesAndRetry, onOpenCookiesSettings, onSignInWithExplore, onSignInWithExploreThenRetry, onRetryWithExploreSignIn, onRetry, className}: QuickDownloadErrorAlertProps): ReactNode {
	const {t} = useTranslation()
	const showBotWallGuidance = experience?.botWall.variant !== undefined && experience.botWall.variant !== 'hidden'
	const showCookiesGuidance = experience?.cookies.variant !== undefined && experience.cookies.variant !== 'hidden'
	// A rate limit's own alert carries the retry ("Try now" while the cooldown runs).
	const showRateLimitGuidance = experience !== null && experience.rateLimit.variant !== 'hidden' && url !== null
	return (
		<Alert variant="warning" size="sm" className={className} data-testid="quick-download-feedback">
			<AlertDescription className="flex flex-col gap-2">
				<span>{t('wizard.url.quickFailed', {error: message})}</span>
				{showRateLimitGuidance ? null : (
					<div className="flex flex-wrap gap-2">
						<Button type="button" size="sm" variant="outline" onClick={() => onRetry()} data-testid="quick-download-retry">
							<RefreshCw data-icon="inline-start" />
							{t('common.retry')}
						</Button>
					</div>
				)}
				{experience && (showBotWallGuidance || showCookiesGuidance || showRateLimitGuidance) ? (
					<div className="flex flex-col gap-1.5">
						{showRateLimitGuidance ? <RateLimitAlert guidance={experience.rateLimit} site={requestSiteFor(url)} density="compact" onRetry={onRetry} /> : null}
						<BotWallGuidanceAlert guidance={experience.botWall} density="compact" showRetryAction={false} onEnableCookiesAndRetry={onEnableCookiesAndRetry} onRetry={onRetry} enableTestId="quick-download-enable-cookies-retry" />
						<CookiesGuidanceAlert
							guidance={experience.cookies}
							density="compact"
							onOpenSettings={onOpenCookiesSettings}
							onSignInWithExplore={onSignInWithExplore}
							onSignInWithExploreThenRetry={onSignInWithExploreThenRetry}
							onRetryWithExploreSignIn={onRetryWithExploreSignIn}
							onEnableCookiesAndRetry={onEnableCookiesAndRetry}
							openSettingsTestId="quick-download-cookies-settings"
						/>
					</div>
				) : null}
			</AlertDescription>
		</Alert>
	)
}

import type {JSX} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {RefreshCw, Timer, Zap} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {requestSiteFor} from '@shared/sites/index.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildProbeErrorExperience, type RateLimitGuidance} from '@renderer/store/wizard/probeErrorExperience.js'
import {Alert, AlertDescription, AlertTitle} from '@renderer/components/ui/alert.js'
import {Button} from '@renderer/components/ui/button.js'
import {cooldownEndLabel, siteLabel, useRunningCooldowns} from '@renderer/components/shared/useRunningCooldowns.js'

type GuidanceDensity = 'full' | 'compact'

interface RateLimitAlertProps {
	guidance: RateLimitGuidance
	// The request site key of the URL the alert is about (requestSiteFor).
	site: string
	// The request to make again: run as is once the cooldown is over, or right
	// after "Try now" lets it through.
	onRetry: () => void
	density?: GuidanceDensity
}

// The site is rate-limiting this connection: says so, says when Arroxy asks it
// again, and offers "Try now" while the cooldown runs. Never cookie advice —
// no cookie or account can lift a rate limit.
export function RateLimitAlert({guidance, site, onRetry, density = 'full'}: RateLimitAlertProps): JSX.Element | null {
	const {t, i18n} = useTranslation()
	const tryRateLimitedSiteNow = useAppStore(state => state.tryRateLimitedSiteNow)
	const cooldown = useRunningCooldowns().find(entry => entry.site === site) ?? null
	if (guidance.variant === 'hidden') return null
	const compact = density === 'compact'
	const name = siteLabel(site)
	const time = cooldown ? cooldownEndLabel(cooldown, i18n.language) : null
	const lead = guidance.variant === 'degraded' ? t('wizard.formats.rateLimit.leadDegraded') : t('wizard.formats.rateLimit.leadFailed', {site: name})
	const wait = time ? t('wizard.formats.rateLimit.waitUntil', {site: name, time}) : t('wizard.formats.rateLimit.waitOver')
	const session = cooldown?.evidence === 'sessionRateLimited' ? ` ${t('wizard.formats.rateLimit.sessionNote', {site: name})}` : ''

	const tryNow = async (): Promise<void> => {
		await tryRateLimitedSiteNow(site)
		onRetry()
	}

	return (
		<Alert role="status" variant="warning" data-testid="rate-limit-notice" data-variant={guidance.variant} data-cooling={cooldown ? 'true' : 'false'} data-density={density} size={compact ? 'sm' : 'default'}>
			<Timer />
			<AlertTitle>{t('wizard.formats.rateLimit.heading', {site: name})}</AlertTitle>
			<AlertDescription>{`${lead} ${wait}${session}`}</AlertDescription>
			<div className="col-start-2 flex flex-wrap gap-2">
				{cooldown ? (
					<Button type="button" size={compact ? 'xs' : 'sm'} variant="outline" onClick={() => void tryNow()} data-testid="rate-limit-try-now">
						<Zap data-icon="inline-start" />
						{t('wizard.formats.rateLimit.tryNowCta')}
					</Button>
				) : (
					<Button type="button" size={compact ? 'xs' : 'sm'} variant="outline" onClick={onRetry} data-testid="rate-limit-retry">
						<RefreshCw data-icon="inline-start" />
						{t('wizard.formats.rateLimit.retryCta')}
					</Button>
				)}
			</div>
		</Alert>
	)
}

// The Format screen's notice: the probe came back usable, but the site
// rate-limited part of it.
export function RateLimitNotice(): JSX.Element | null {
	const {wizardFormatsDegraded, wizardUrl, retryFormatProbe} = useAppStore(useShallow(state => ({wizardFormatsDegraded: state.wizardFormatsDegraded, wizardUrl: state.wizardUrl, retryFormatProbe: state.retryFormatProbe})))
	const experience = buildProbeErrorExperience({error: null, degradedReasons: wizardFormatsDegraded?.reasons})
	return <RateLimitAlert guidance={experience.rateLimit} site={requestSiteFor(wizardUrl.trim())} onRetry={() => void retryFormatProbe()} />
}

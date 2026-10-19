import type {JSX} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {AlertTriangle, RefreshCw, ShieldCheck} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildProbeErrorExperience, type BotWallGuidance} from '@renderer/store/wizard/probeErrorExperience.js'
import {Alert, AlertDescription, AlertTitle} from '@renderer/components/ui/alert.js'
import {Button} from '@renderer/components/ui/button.js'

type GuidanceDensity = 'full' | 'compact'

interface Props {
	// When set, the component renders even if `wizardFormatsDegraded` is null.
	// Use case: surfacing the same notice on `StepError` when the probe hard-
	// failed with a bot-detected category — there's no degraded payload in
	// that path, but the cookies CTA still applies.
	forceShow?: boolean
}

interface BotWallGuidanceAlertProps {
	guidance: BotWallGuidance
	onEnableCookiesAndRetry: () => void
	onRetry: () => void
	density?: GuidanceDensity
	showRetryAction?: boolean
	enableTestId?: string
	retryTestId?: string
}

const BOT_WALL_BODY = {unconfigured: 'wizard.formats.botWall.bodyUnconfigured', disabled: 'wizard.formats.botWall.bodyDisabled', enabled: 'wizard.formats.botWall.bodyEnabled', explore: 'wizard.formats.botWall.bodyExplore'} as const satisfies Record<Exclude<BotWallGuidance['variant'], 'hidden'>, string>

export function BotWallGuidanceAlert({guidance, onEnableCookiesAndRetry, onRetry, density = 'full', showRetryAction = true, enableTestId = 'bot-wall-enable-cta', retryTestId = 'bot-wall-retry-cta'}: BotWallGuidanceAlertProps): JSX.Element | null {
	const {t} = useTranslation()
	if (guidance.variant === 'hidden') return null
	const compact = density === 'compact'
	const showEnableAction = guidance.variant === 'disabled'
	const showActions = showEnableAction || showRetryAction

	const body = t(BOT_WALL_BODY[guidance.variant])

	return (
		<Alert role="status" variant="warning" data-testid="bot-wall-notice" data-variant={guidance.variant} data-density={density} size={compact ? 'sm' : 'default'}>
			<AlertTriangle />
			<AlertTitle>{t('wizard.formats.botWall.heading')}</AlertTitle>
			<AlertDescription>{body}</AlertDescription>
			{showActions ? (
				<div className="col-start-2 flex flex-wrap gap-2">
					{showEnableAction ? (
						<Button type="button" size={compact ? 'xs' : 'sm'} variant="default" onClick={onEnableCookiesAndRetry} data-testid={enableTestId}>
							<ShieldCheck data-icon="inline-start" />
							{t('wizard.formats.botWall.enableRetryCta')}
						</Button>
					) : null}
					{showRetryAction ? (
						<Button type="button" size={compact ? 'xs' : 'sm'} variant="outline" onClick={onRetry} data-testid={retryTestId}>
							<RefreshCw data-icon="inline-start" />
							{t('wizard.formats.botWall.retryCta')}
						</Button>
					) : null}
				</div>
			) : null}
		</Alert>
	)
}

export function BotWallNotice({forceShow = false}: Props): JSX.Element | null {
	const {wizardFormatsDegraded, settings, retryFormatProbe, retryProbeWithCookies} = useAppStore(useShallow(state => ({wizardFormatsDegraded: state.wizardFormatsDegraded, settings: state.settings, retryFormatProbe: state.retryFormatProbe, retryProbeWithCookies: state.retryProbeWithCookies})))
	const experience = buildProbeErrorExperience({error: null, commonSettings: settings?.common, degradedReasons: forceShow ? ['botWall'] : wizardFormatsDegraded?.reasons})
	return <BotWallGuidanceAlert guidance={experience.botWall} onEnableCookiesAndRetry={() => void retryProbeWithCookies()} onRetry={() => void retryFormatProbe()} />
}

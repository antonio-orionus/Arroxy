import type {JSX} from 'react'
import {AlertTriangle, RefreshCw, ShieldCheck} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildProbeErrorExperience, type BotWallGuidance} from '@renderer/store/wizard/probeErrorExperience.js'
import {Alert, AlertDescription, AlertTitle} from '@renderer/components/ui/alert.js'
import {Button} from '@renderer/components/ui/button.js'
import {cn} from '@renderer/lib/utils.js'

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

export function BotWallGuidanceAlert({guidance, onEnableCookiesAndRetry, onRetry, density = 'full', showRetryAction = true, enableTestId = 'bot-wall-enable-cta', retryTestId = 'bot-wall-retry-cta'}: BotWallGuidanceAlertProps): JSX.Element | null {
	const {t} = useTranslation()
	if (guidance.variant === 'hidden') return null
	const compact = density === 'compact'
	const showEnableAction = guidance.variant === 'disabled'
	const showActions = showEnableAction || showRetryAction

	const body = guidance.variant === 'unconfigured' ? t('wizard.formats.botWall.bodyUnconfigured') : guidance.variant === 'disabled' ? t('wizard.formats.botWall.bodyDisabled') : t('wizard.formats.botWall.bodyEnabled')

	return (
		<Alert role="status" variant="warning" data-testid="bot-wall-notice" data-variant={guidance.variant} data-density={density} className={cn('text-[12px]', compact && 'py-2')}>
			<AlertTriangle className={cn(compact && 'mt-0.5 size-3.5')} />
			<AlertTitle className={cn('text-[12px]', compact && 'text-[11px]')}>{t('wizard.formats.botWall.heading')}</AlertTitle>
			<AlertDescription className={cn('text-[12px] text-current', compact && 'text-[11px]')}>{body}</AlertDescription>
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
	const {wizardFormatsDegraded, settings, retryFormatProbe, retryProbeWithCookies} = useAppStore()
	const experience = buildProbeErrorExperience({error: null, commonSettings: settings?.common, degradedReasons: forceShow ? ['botWall'] : wizardFormatsDegraded?.reasons})
	return <BotWallGuidanceAlert guidance={experience.botWall} onEnableCookiesAndRetry={() => void retryProbeWithCookies()} onRetry={() => void retryFormatProbe()} />
}

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {formatProbeError, useAppStore} from '../../store/useAppStore.js'
import {buildProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import {Button} from '../ui/button.js'
import {BotWallGuidanceAlert} from './format/BotWallNotice.js'
import {CookiesGuidanceAlert} from './format/CookiesErrorAlert.js'

export function StepError(): ReactNode {
	const {t} = useTranslation()
	const {wizardError, settings, retry, reset, openCookiesSettings, retryFormatProbe, retryProbeWithCookies} = useAppStore()
	const message = formatProbeError(wizardError)
	const experience = buildProbeErrorExperience({error: wizardError, commonSettings: settings?.common})
	const showBotWallNotice = experience.botWall.variant !== 'hidden'
	const showCookiesAlert = experience.cookies.variant !== 'hidden'

	return (
		<div className="wizard-step flex flex-col items-center gap-4 py-4 text-center" data-testid="step-error">
			<div className="w-10 h-10 rounded-full bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] flex items-center justify-center text-base font-bold error-icon-pulse" aria-hidden data-testid="error-icon">
				✕
			</div>
			<p className="text-sm text-foreground/80 max-w-sm" data-testid="error-message">
				{message}
			</p>
			{showBotWallNotice || showCookiesAlert ? (
				<div className="w-full max-w-md text-start flex flex-col gap-2">
					<BotWallGuidanceAlert guidance={experience.botWall} onEnableCookiesAndRetry={() => void retryProbeWithCookies()} onRetry={() => void retryFormatProbe()} />
					<CookiesGuidanceAlert guidance={experience.cookies} onOpenSettings={openCookiesSettings} />
				</div>
			) : null}
			<div className="flex gap-2">
				<Button variant="ghost" type="button" onClick={reset} data-testid="btn-start-over">
					{t('common.startOver')}
				</Button>
				<Button type="button" onClick={() => void retry()} data-testid="btn-retry">
					{t('common.retry')}
				</Button>
			</div>
		</div>
	)
}

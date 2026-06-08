import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {formatProbeError, useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {BotWallNotice} from './format/BotWallNotice.js'
import {CookiesErrorAlert} from './format/CookiesErrorAlert.js'
import {isBotWallKind, isCookiesNeededKind} from './format/cookiesGate.js'

export function StepError(): ReactNode {
	const {t} = useTranslation()
	const {wizardError, settings, retry, reset} = useAppStore()
	const message = formatProbeError(wizardError)
	const errorKind = wizardError?.kind === 'ytdlp' ? wizardError.error.kind : undefined
	const showBotWallNotice = isBotWallKind(errorKind)
	const cookiesEnabled = (settings?.common?.cookiesMode ?? 'off') !== 'off'
	// When cookies are off but the error itself signals "auth required" / "use
	// --cookies", fire the alert anyway so the user has a one-click route to the
	// cookies block on the URL step.
	const errorSuggestsCookies = isCookiesNeededKind(errorKind)
	const showCookiesAlert = cookiesEnabled || errorSuggestsCookies

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
					{showBotWallNotice ? <BotWallNotice forceShow /> : null}
					{showCookiesAlert ? <CookiesErrorAlert forceShowCookiesOff={errorSuggestsCookies} /> : null}
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

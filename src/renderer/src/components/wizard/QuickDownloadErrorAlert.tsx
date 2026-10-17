import type {ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {RefreshCw, X} from 'lucide-react'
import {formatProbeError} from '../../store/helpers.js'
import type {QuickDownloadFailureMessage} from '../../store/downloadHomeView.js'
import type {ProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import {Alert, AlertAction, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {BotWallGuidanceAlert} from './format/BotWallNotice.js'
import {CookiesGuidanceAlert} from './format/CookiesErrorAlert.js'
import {Hint} from '../shared/Hint.js'

function quickDownloadFailureText(t: TFunction, message: QuickDownloadFailureMessage | null): string {
	if (!message) return ''
	switch (message.kind) {
		case 'i18n':
			return t(message.key)
		case 'text':
			return message.text
		case 'bulk-probe': {
			const probeText = formatProbeError(message.error) || t('wizard.url.quickProbeFailed')
			return `${t('wizard.url.quickBulkAllFailed')}: ${probeText}`
		}
	}
	const exhaustive: never = message
	return exhaustive
}

interface QuickDownloadErrorAlertProps {
	experience: ProbeErrorExperience | null
	message: QuickDownloadFailureMessage | null
	onEnableCookiesAndRetry: () => void
	onOpenCookiesSettings: () => void
	onSignInWithExplore: () => void
	onSignInWithExploreThenRetry: () => void
	onRetryWithExploreSignIn: () => void
	onRetry: () => void
	// Surfaces without a URL field to edit (Explore) need an explicit way to clear it.
	onDismiss?: () => void
	className?: string
}

// A failed quick download, with the bot-wall / cookies guidance its probe error calls for.
export function QuickDownloadErrorAlert({experience, message, onEnableCookiesAndRetry, onOpenCookiesSettings, onSignInWithExplore, onSignInWithExploreThenRetry, onRetryWithExploreSignIn, onRetry, onDismiss, className}: QuickDownloadErrorAlertProps): ReactNode {
	const {t} = useTranslation()
	const showBotWallGuidance = experience?.botWall.variant !== undefined && experience.botWall.variant !== 'hidden'
	const showCookiesGuidance = experience?.cookies.variant !== undefined && experience.cookies.variant !== 'hidden'
	return (
		<Alert variant="warning" size="sm" className={className} data-testid="quick-download-feedback">
			<AlertDescription className="flex flex-col gap-2">
				<span>{t('wizard.url.quickFailed', {error: quickDownloadFailureText(t, message)})}</span>
				<div className="flex flex-wrap gap-2">
					<Button type="button" size="sm" variant="outline" onClick={() => onRetry()} data-testid="quick-download-retry">
						<RefreshCw data-icon="inline-start" />
						{t('common.retry')}
					</Button>
				</div>
				{experience && (showBotWallGuidance || showCookiesGuidance) ? (
					<div className="flex flex-col gap-1.5">
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
			{onDismiss ? (
				<AlertAction>
					<Hint label={t('common.dismiss')}>
						<Button type="button" size="icon-xs" variant="ghost" aria-label={t('common.dismiss')} onClick={onDismiss} data-testid="quick-download-dismiss">
							<X aria-hidden />
						</Button>
					</Hint>
				</AlertAction>
			) : null}
		</Alert>
	)
}

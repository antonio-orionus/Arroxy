import type {JSX} from 'react'
import {useTranslation} from 'react-i18next'
import type {SetupProgress} from '../../store/warmupDownloads.js'
import {Progress} from '../ui/progress.js'

// The one line under the bar: the time left while bytes move, otherwise what is
// happening. Empty while a download has no estimate yet; the line keeps its
// height so the screen does not jump when the estimate arrives.
function useStatusLine(setup: SetupProgress, secondsLeft: number | null): string | null {
	const {t} = useTranslation()
	if (setup.stage === 'connecting') return t('splash.setup.stage.connecting')
	if (setup.stage === 'unpacking') return setup.unpacking.includes('media') ? t('splash.setup.stage.unpacking') : t('splash.setup.stage.unpackingEngine')
	if (setup.stage === 'checking') return t('splash.setup.stage.checking')
	// Only a sized bar backs a time left: while a download has no size yet, the
	// bytes left leave it out and the estimate would promise too little.
	if (secondsLeft === null || setup.percent === null) return null
	return secondsLeft < 60 ? t('splash.setup.left.underMinute') : t('splash.setup.left.minutes', {count: Math.round(secondsLeft / 60)})
}

// Under the splash's heading while Arroxy downloads its tools: one bar, one
// line.
export function SplashSetup({setup, label, secondsLeft, firstCheck}: {setup: SetupProgress; label: string; secondsLeft: number | null; firstCheck: boolean}): JSX.Element {
	const {t} = useTranslation()
	const determinate = setup.stage === 'downloading' && setup.percent !== null
	const status = useStatusLine(setup, secondsLeft)
	return (
		<div className="splash-setup" data-testid="splash-setup" data-stage={setup.stage}>
			<Progress className="splash-setup-bar" aria-label={label} value={determinate ? Math.round(setup.percent ?? 0) : null} />
			{/* Keyed on its words, so each new line fades in rather than swapping. */}
			<p key={status ?? ''} className="splash-setup-status" data-testid="splash-setup-status">
				{status}
			</p>
			{setup.stage === 'checking' && firstCheck && (
				<p className="splash-bytes" data-testid="splash-verify-firstcheck">
					{t('splash.verifyFirstCheck')}
				</p>
			)}
		</div>
	)
}

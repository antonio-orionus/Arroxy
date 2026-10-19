import type {JSX} from 'react'
import {useTranslation} from 'react-i18next'
import type {SetupProgress} from '../../store/warmupDownloads.js'

function formatMegabytes(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TITLE_KEY = {firstRun: 'splash.setup.title.firstRun', media: 'splash.setup.title.media', engine: 'splash.setup.title.engine'} as const
const NOTE_KEY = {firstRun: 'splash.setup.note.firstRun', media: 'splash.setup.note.media', engine: 'splash.setup.note.engine'} as const

// Who is waiting decides the words: a first launch is setting Arroxy up; a
// returning user is getting one of the tools updated.
function audience(setup: SetupProgress, returning: boolean): keyof typeof TITLE_KEY {
	if (!returning) return 'firstRun'
	return setup.groups.includes('media') ? 'media' : 'engine'
}

function stageKey(setup: SetupProgress): 'splash.setup.stage.connecting' | 'splash.setup.stage.unpacking' | 'splash.setup.stage.checking' | 'splash.setup.stage.downloadingBoth' | 'splash.setup.stage.downloadingEngine' | 'splash.setup.stage.downloadingMedia' {
	if (setup.stage === 'connecting') return 'splash.setup.stage.connecting'
	if (setup.stage === 'unpacking') return 'splash.setup.stage.unpacking'
	if (setup.stage === 'checking') return 'splash.setup.stage.checking'
	const engine = setup.downloading.includes('engine')
	const media = setup.downloading.includes('media')
	if (engine && media) return 'splash.setup.stage.downloadingBoth'
	return engine ? 'splash.setup.stage.downloadingEngine' : 'splash.setup.stage.downloadingMedia'
}

// The splash while Arroxy downloads its tools: one bar for everything, what is
// happening in plain words, and that it happens once.
export function SplashSetup({setup, secondsLeft, returning, firstCheck}: {setup: SetupProgress; secondsLeft: number | null; returning: boolean; firstCheck: boolean}): JSX.Element {
	const {t} = useTranslation()
	const who = audience(setup, returning)
	const title = t(TITLE_KEY[who])
	const determinate = setup.stage === 'downloading' && setup.percent !== null
	const timeLeft = secondsLeft === null ? null : secondsLeft < 60 ? t('splash.setup.left.underMinute') : t('splash.setup.left.minutes', {count: Math.round(secondsLeft / 60)})
	return (
		<div className="splash-setup" data-testid="splash-setup" data-stage={setup.stage}>
			<p className="splash-setup-title">{title}</p>
			{/* A returning user's heading already says what is downloading. */}
			{(who === 'firstRun' || setup.stage !== 'downloading') && <p className="splash-name">{t(stageKey(setup))}</p>}
			<div className="splash-progress splash-setup-bar" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={determinate ? Math.round(setup.percent ?? 0) : undefined}>
				<div className={determinate ? 'splash-progress-bar' : 'splash-progress-bar splash-progress-bar--indeterminate'} style={determinate ? {width: `${setup.percent}%`} : undefined} />
			</div>
			{determinate && setup.total > 0 && (
				<p className="splash-bytes" data-testid="splash-setup-bytes">
					{t('splash.setup.bytes', {done: formatMegabytes(setup.downloaded), total: formatMegabytes(setup.total)})}
					{timeLeft && ` · ${timeLeft}`}
				</p>
			)}
			{setup.stage === 'checking' && firstCheck && (
				<p className="splash-bytes" data-testid="splash-verify-firstcheck">
					{t('splash.verifyFirstCheck')}
				</p>
			)}
			<p className="splash-setup-note">{t(NOTE_KEY[who])}</p>
		</div>
	)
}

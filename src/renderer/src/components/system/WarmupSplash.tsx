import {useState, useEffect, useMemo, type JSX} from 'react'
import {useTranslation} from 'react-i18next'
import mainImg from '../../assets/Main.png'
import type {DependencyDiagnostic, DependencyId, WarmupProgressEvent} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {RepairPanel} from './RepairPanel.js'

interface Props {
	initialized: boolean
	warmupBlocking: DependencyId[]
	warmupDiagnostics: Record<DependencyId, DependencyDiagnostic> | null
	warmupProgress: Partial<Record<DependencyId, WarmupProgressEvent>> | null
	showGreeting: boolean
	onDismissed?: () => void
	onCancel?: () => void | Promise<void>
}

// Warmup finishes in well under a second on a warm start, so a longer floor is
// pure imposed delay — it hid every measured startup improvement behind itself.
// This is only long enough that a fast warmup does not blink the splash away.
const MIN_MS = 800

// A first check normally runs ~15s. Saying so up front turned out to be more
// than a user wants at that moment — it reads as noise while the thing is still
// plainly working. Held back to well beyond the normal duration, the same words
// arrive only when the wait has stopped being ordinary, which is when they help.
const FIRST_CHECK_HINT_MS = 35000

// Counted from the last sign of progress, not from mount. A cold start is ~22s of
// legitimate work on fast hardware, so an elapsed-time offer either fires during
// the normal path or makes a genuinely stalled download wait out the whole budget.
// Measured against progress instead, this stays silent while bytes are moving and
// surfaces promptly once they stop.
const CANCEL_OFFER_MS = 60000

// Identifies one candidate attempt. Every DependencySource variant carries a
// path or a url, and those are what distinguish two probes of the same binary.
function verificationAttemptKey(event: WarmupProgressEvent): string {
	const source = event.source
	if (!source) return event.binary
	const detail = 'path' in source ? source.path : 'url' in source ? source.url : ''
	return `${event.binary}:${source.kind}:${detail}`
}

function formatBytes(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function WarmupSplash({initialized, warmupBlocking, warmupDiagnostics, warmupProgress, showGreeting, onDismissed, onCancel}: Props): JSX.Element | null {
	const {t} = useTranslation()
	const [minPassed, setMinPassed] = useState(false)
	const [gone, setGone] = useState(false)
	const [slowFirstCheckFor, setSlowFirstCheckFor] = useState<string | null>(null)
	const [cancelOffered, setCancelOffered] = useState(false)
	useEffect(() => {
		const timer = setTimeout(() => setMinPassed(true), MIN_MS)
		return () => clearTimeout(timer)
	}, [])

	const {entries, activeEntry, verifyingEntry, totalDownloaded, totalBytes, percent} = useMemo(() => {
		const entries = Object.values(warmupProgress ?? {}).filter((e): e is WarmupProgressEvent => e !== undefined)
		const activeEntry = entries.find(e => e.phase === 'downloading')
		// Nothing rendered these phases before, so a probe that outlived its
		// download left the splash frozen on a generic line — which is how a
		// resolver walking its fallback list reads to a user as a restart loop.
		const verifyingEntry = entries.find(e => e.phase === 'probing' || e.phase === 'extracting')
		const downloadingEntries = entries.filter(e => e.phase === 'downloading')
		const totalDownloaded = downloadingEntries.reduce((sum, e) => sum + (e.bytesDownloaded ?? 0), 0)
		const totalBytes = downloadingEntries.reduce((sum, e) => sum + (e.totalBytes ?? 0), 0)
		const percent = totalBytes > 0 ? Math.min(100, (totalDownloaded / totalBytes) * 100) : null
		return {entries, activeEntry, verifyingEntry, totalDownloaded, totalBytes, percent}
	}, [warmupProgress])

	// Two conditions, and both are load-bearing. `firstCheck` means a real spawn is
	// underway rather than a memo read, so the message can never flash during a
	// verification that was always going to return instantly. The timer then holds
	// it back past the normal duration of that spawn.
	//
	// The key includes the source, not just the binary: resolving yt-dlp probes
	// several candidates in a row, all reporting binary 'yt-dlp'. Keyed on the id
	// alone, a slow managed probe would leave the hint armed, and the next
	// candidate — a Homebrew yt-dlp answering in 30ms — would flash it on screen
	// before it had waited for anything.
	const verifyingKey = verifyingEntry?.firstCheck === true ? verificationAttemptKey(verifyingEntry) : null
	useEffect(() => {
		if (!verifyingKey) return undefined
		const timer = setTimeout(() => setSlowFirstCheckFor(verifyingKey), FIRST_CHECK_HINT_MS)
		return () => clearTimeout(timer)
	}, [verifyingKey])
	const firstCheck = verifyingKey !== null && slowFirstCheckFor === verifyingKey

	// Any advance — a phase change or another throttled chunk of bytes — restarts
	// the cancel countdown. Once offered the button stays: pulling a control back
	// out from under someone reaching for it is worse than leaving it up.
	const progressToken = `${entries.map(e => `${e.binary}:${e.phase}`).join('|')}:${totalDownloaded}`
	useEffect(() => {
		if (cancelOffered) return undefined
		const timer = setTimeout(() => setCancelOffered(true), CANCEL_OFFER_MS)
		return () => clearTimeout(timer)
	}, [progressToken, cancelOffered])

	if (gone) return null

	// Splash stays mounted as the repair container while any blocking dep is
	// not runnable. Without blocking failures we fade out as before.
	const blocked = warmupBlocking.length > 0
	const fading = initialized && minPassed && !blocked

	const showProgress = !blocked && (activeEntry != null || (percent !== null && percent < 100))
	const showVerifying = !blocked && !showProgress && verifyingEntry != null
	const showCancel = onCancel != null && !blocked && !fading && cancelOffered

	return (
		<div
			className="splash-overlay"
			data-testid="splash-overlay"
			data-state={fading ? 'fading' : blocked ? 'blocked' : 'preparing'}
			role={blocked ? undefined : 'status'}
			aria-live={blocked ? undefined : 'polite'}
			aria-busy={!initialized && !blocked}
			aria-hidden={fading ? true : undefined}
			style={{opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto'}}
			onTransitionEnd={event => {
				if (!fading || event.currentTarget !== event.target) return
				setGone(true)
				onDismissed?.()
			}}
		>
			<img src={mainImg} alt="" className="splash-mascot" />
			<div className="splash-text">
				{showGreeting && (
					<p className="splash-greeting" data-testid="splash-greeting">
						{t('splash.greeting')}
					</p>
				)}
				<p className="splash-brand">Arroxy</p>
				{showProgress ? (
					<>
						<p className="splash-name">{activeEntry ? t('splash.downloading', {binary: activeEntry.binary}) : t('splash.warmup')}</p>
						{percent !== null && (
							<div className="splash-progress">
								<div className="splash-progress-bar" style={{width: `${percent}%`}} />
							</div>
						)}
						{totalDownloaded > 0 && totalBytes > 0 && (
							<p className="splash-bytes">
								{formatBytes(totalDownloaded)} / {formatBytes(totalBytes)}
							</p>
						)}
					</>
				) : showVerifying ? (
					<>
						<p className="splash-name" data-testid="splash-verifying">
							{t('splash.verifying', {binary: verifyingEntry.binary})}
						</p>
						<div className="splash-progress">
							<div className="splash-progress-bar splash-progress-bar--indeterminate" />
						</div>
						{firstCheck && (
							<p className="splash-bytes" data-testid="splash-verify-firstcheck">
								{t('splash.verifyFirstCheck')}
							</p>
						)}
					</>
				) : (
					!blocked && <p className="splash-name">{t('splash.warmup')}</p>
				)}
				{showCancel && (
					<Button type="button" variant="link" size="sm" className="splash-cancel" data-testid="splash-cancel" onClick={() => void onCancel?.()}>
						{t('splash.cancel')}
					</Button>
				)}
				{blocked && warmupDiagnostics && <RepairPanel diagnostics={warmupDiagnostics} blocking={warmupBlocking} />}
				{blocked && !warmupDiagnostics && <p className="splash-name">{t('splash.warmupFailedNoDiag')}</p>}
			</div>
		</div>
	)
}

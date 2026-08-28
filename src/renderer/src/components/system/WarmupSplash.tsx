import {useState, useEffect, useMemo, type JSX} from 'react'
import {useTranslation} from 'react-i18next'
import mainImg from '../../assets/Main.png'
import type {DependencyDiagnostic, DependencyId, WarmupProgressEvent} from '@shared/types.js'
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

const MIN_MS = 3000

// yt-dlp's version probe can legitimately run for the better part of a minute on
// a cold macOS launch — the binary is a PyInstaller onefile, so every run unpacks
// ~100 libraries that Gatekeeper then inspects. Until this delay elapses the
// splash says nothing extra; past it, silence reads as a hang, so we explain.
const SLOW_VERIFY_HINT_MS = 5000

// Independent of the hint: however warmup is spending its time, a user who has
// waited this long needs a way out. Cancelling lands on the repair panel, which
// can retry or point at a manual binary.
const CANCEL_OFFER_MS = 10000

function formatBytes(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function WarmupSplash({initialized, warmupBlocking, warmupDiagnostics, warmupProgress, showGreeting, onDismissed, onCancel}: Props): JSX.Element | null {
	const {t} = useTranslation()
	const [minPassed, setMinPassed] = useState(false)
	const [gone, setGone] = useState(false)
	const [slowVerifyFor, setSlowVerifyFor] = useState<DependencyId | null>(null)
	const [cancelOffered, setCancelOffered] = useState(false)
	useEffect(() => {
		const timer = setTimeout(() => setMinPassed(true), MIN_MS)
		return () => clearTimeout(timer)
	}, [])
	useEffect(() => {
		const timer = setTimeout(() => setCancelOffered(true), CANCEL_OFFER_MS)
		return () => clearTimeout(timer)
	}, [])

	const {activeEntry, verifyingEntry, totalDownloaded, totalBytes, percent} = useMemo(() => {
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
		return {activeEntry, verifyingEntry, totalDownloaded, totalBytes, percent}
	}, [warmupProgress])

	// Recorded against the binary it belongs to rather than as a bare flag, so
	// finishing one check or moving to the next clears the hint by derivation
	// instead of a reset that would re-render every time verification ends.
	const verifyingBinary = verifyingEntry?.binary ?? null
	useEffect(() => {
		if (!verifyingBinary) return undefined
		const timer = setTimeout(() => setSlowVerifyFor(verifyingBinary), SLOW_VERIFY_HINT_MS)
		return () => clearTimeout(timer)
	}, [verifyingBinary])
	const slowVerify = verifyingBinary !== null && slowVerifyFor === verifyingBinary

	if (gone) return null

	// Splash stays mounted as the repair container while any blocking dep is
	// not runnable. Without blocking failures we fade out as before.
	const blocked = warmupBlocking.length > 0
	const fading = initialized && minPassed && !blocked

	const showProgress = !blocked && (activeEntry != null || (percent !== null && percent < 100))
	const showVerifying = !blocked && !showProgress && verifyingEntry != null
	const showCancel = !blocked && !fading && cancelOffered

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
						{slowVerify && (
							<p className="splash-bytes" data-testid="splash-verify-slow">
								{t('splash.verifySlow')}
							</p>
						)}
					</>
				) : (
					!blocked && <p className="splash-name">{t('splash.warmup')}</p>
				)}
				{showCancel && (
					<button type="button" className="splash-cancel" data-testid="splash-cancel" onClick={() => void onCancel?.()}>
						{t('splash.cancel')}
					</button>
				)}
				{blocked && warmupDiagnostics && <RepairPanel diagnostics={warmupDiagnostics} blocking={warmupBlocking} />}
				{blocked && !warmupDiagnostics && <p className="splash-name">{t('splash.warmupFailedNoDiag')}</p>}
			</div>
		</div>
	)
}

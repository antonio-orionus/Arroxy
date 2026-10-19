import {lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode} from 'react'
import {flushSync} from 'react-dom'
import {useTranslation} from 'react-i18next'
import {CloudOff, RotateCw, Settings, ShieldAlert} from 'lucide-react'
import type {ExploreViewBounds, ExploreViewState} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from '../ui/empty.js'
import {boundsClearOfToasts, hasBlockingOverlay, sameBounds, visibleBounds} from './exploreLayout.js'
import {afterNextPaint, captureExploreView, decodeSnapshot} from './exploreSnapshot.js'

// browser-mock has no native view; its dev page stands in for it. Gating the
// dynamic import keeps the dev chunk out of production builds.
const ExploreMockPage = import.meta.env.MODE === 'browser-mock' ? lazy(() => import('../../dev/ExploreMockPage.js').then(module => ({default: module.ExploreMockPage}))) : null

function subscribeOverlays(onChange: () => void): () => void {
	const observer = new MutationObserver(onChange)
	observer.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['role', 'hidden']})
	return () => observer.disconnect()
}

interface ExploreViewportProps {
	error: ExploreViewState['error']
	onRetry: () => void
	onOpenSettings: () => void
}

// The browser itself is a native view in main; this element only reserves its
// place. Main positions the view over it and shows it while nothing — no
// dialog, splash, or error surface — needs the same pixels. Under an overlay
// the element shows a picture of the page instead (P2-R35).
export function ExploreViewport({error, onRetry, onOpenSettings}: ExploreViewportProps): ReactNode {
	const placeholderRef = useRef<HTMLDivElement>(null)
	// The rect last sent, and the window zoom it was sent under: main scales the
	// rect by the main window's zoom factor, so a zoom change alone must re-send.
	const lastSentRef = useRef<{bounds: ExploreViewBounds; ratio: number} | null>(null)
	const frameRef = useRef<number | null>(null)
	const uiZoom = useAppStore(state => state.uiZoom)
	// React re-reads the snapshot right after subscribing, so an overlay that
	// opened between render and the observer attaching is not missed.
	const overlayOpen = useSyncExternalStore(subscribeOverlays, hasBlockingOverlay, () => false)
	const visible = !overlayOpen && error === null
	// The picture of the page shown while an overlay hides the view.
	const [snapshot, setSnapshot] = useState<string | null>(null)
	// The error as of the last commit, read when the view stops being shown.
	const errorRef = useRef(error)
	useLayoutEffect(() => {
		errorRef.current = error
	}, [error])
	// The hide-behind-a-picture sequence in flight; showing the view cancels it.
	const hideRunRef = useRef<SnapshotRun | null>(null)

	// Leaving the tab mid-sequence: the view hides now, not when the picture lands.
	useEffect(
		() => () => {
			const run = hideRunRef.current
			if (!run || run.cancelled || run.done) return
			run.cancelled = true
			void window.appApi.explore.setVisible(false)
		},
		[]
	)

	const sendBounds = useCallback((): void => {
		const element = placeholderRef.current
		if (!element) return
		const bounds = boundsClearOfToasts(visibleBounds(element))
		const ratio = window.devicePixelRatio
		const last = lastSentRef.current
		if (last && last.ratio === ratio && sameBounds(last.bounds, bounds)) return
		lastSentRef.current = {bounds, ratio}
		void window.appApi.explore.setBounds(bounds)
	}, [])

	const scheduleBounds = useCallback((): void => {
		if (frameRef.current !== null) return
		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = null
			sendBounds()
		})
	}, [sendBounds])

	useEffect(() => {
		const element = placeholderRef.current
		// Any DOM change can add or retire a toast, or move the placeholder without resizing it.
		const mutations = new MutationObserver(scheduleBounds)
		mutations.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['role', 'hidden', 'data-visible', 'data-removed', 'data-mounted', 'data-expanded']})
		const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleBounds)
		if (element) resize?.observe(element)
		window.addEventListener('resize', scheduleBounds)
		// Capture catches the wizard scrollport, which does not bubble scroll to window.
		window.addEventListener('scroll', scheduleBounds, true)
		// The tab's slide-in and toasts sliding in, stacking or expanding move by
		// transform, which no observer reports.
		window.addEventListener('animationend', scheduleBounds, true)
		window.addEventListener('transitionend', scheduleBounds, true)
		return () => {
			mutations.disconnect()
			resize?.disconnect()
			window.removeEventListener('resize', scheduleBounds)
			window.removeEventListener('scroll', scheduleBounds, true)
			window.removeEventListener('animationend', scheduleBounds, true)
			window.removeEventListener('transitionend', scheduleBounds, true)
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
			frameRef.current = null
		}
	}, [scheduleBounds])

	useEffect(() => {
		scheduleBounds()
	}, [scheduleBounds, uiZoom])

	useEffect(() => {
		// Checked live as well: this effect can run before the overlay store has re-rendered.
		if (!visible || hasBlockingOverlay()) return
		if (hideRunRef.current) hideRunRef.current.cancelled = true
		const element = placeholderRef.current
		// Place the view before it appears, so it never flashes at stale bounds.
		sendBounds()
		let shown = true
		// The live view first, then the picture goes: the page never blinks out.
		// A show that fails drops it too: no picture outlives its overlay.
		const dropSnapshot = (): void => {
			if (shown) setSnapshot(null)
		}
		void window.appApi.explore.setVisible(true).then(dropSnapshot, dropSnapshot)
		// Sent right behind the show: main builds a new view before its first
		// wait, and a page navigated to during that wait stays.
		const address = useAppStore.getState().takeExplorePendingAddress()
		if (address !== null) void loadAddress(address)
		return () => {
			shown = false
			// An overlay over the mounted, error-free viewport: hide behind a
			// picture of the page. Leaving the tab or an error hides at once.
			if (element?.isConnected === true && errorRef.current === null && hasBlockingOverlay()) {
				const run: SnapshotRun = {cancelled: false, done: false}
				hideRunRef.current = run
				void hideBehindSnapshot(run, setSnapshot)
				return
			}
			void window.appApi.explore.setVisible(false)
		}
	}, [sendBounds, visible])

	return (
		<div ref={placeholderRef} className="relative flex min-h-64 flex-1 flex-col overflow-hidden rounded-lg bg-background/12 ring-1 ring-border-strong" data-testid="explore-viewport">
			{error ? <ExploreError error={error} onRetry={onRetry} onOpenSettings={onOpenSettings} /> : null}
			{/* Where the view was: its top-left corner, at the view's width. A view
			    shortened for a toast gives a shorter picture, as it was on screen. */}
			{snapshot && !error ? <img src={snapshot} alt="" aria-hidden draggable={false} className="pointer-events-none absolute top-0 left-0 h-auto w-full select-none" data-testid="explore-snapshot" /> : null}
			{ExploreMockPage && !error ? (
				<Suspense fallback={null}>
					<ExploreMockPage />
				</Suspense>
			) : null}
		</div>
	)
}

async function loadAddress(url: string): Promise<void> {
	const result = await window.appApi.explore.navigate({kind: 'address', url})
	if (!result.ok) console.warn('[explore] pending address not loaded', result.error.code)
}

interface SnapshotRun {
	cancelled: boolean
	done: boolean
}

// Capture → picture shown → view hidden. Without a picture (none, failed, or
// slower than an overlay may wait) the view hides at once, as before. A
// picture from an earlier run goes first: the view is still up and covers it,
// and a reopen faster than main's answer to the show would otherwise leave it.
async function hideBehindSnapshot(run: SnapshotRun, show: (url: string | null) => void): Promise<void> {
	show(null)
	const url = await captureExploreView()
	if (run.cancelled) return
	if (url !== null) {
		await decodeSnapshot(url)
		if (run.cancelled) return
		show(url)
		await afterNextPaint()
		if (run.cancelled) return
	} else {
		// Committed before the hide, not on React's next pass: the view going
		// away must not uncover a picture from an earlier run, not even for a frame.
		flushSync(() => show(null))
	}
	run.done = true
	void window.appApi.explore.setVisible(false)
}

function ExploreError({error, onRetry, onOpenSettings}: {error: NonNullable<ExploreViewState['error']>; onRetry: () => void; onOpenSettings: () => void}): ReactNode {
	const {t} = useTranslation()
	const proxy = error === 'proxy'
	return (
		<Empty role="alert" data-testid="explore-error" data-error={error}>
			<EmptyHeader>
				<EmptyMedia variant="icon">{proxy ? <ShieldAlert aria-hidden /> : <CloudOff aria-hidden />}</EmptyMedia>
				<EmptyTitle>{proxy ? t('explore.error.proxyTitle') : t('explore.error.loadTitle')}</EmptyTitle>
				<EmptyDescription>{proxy ? t('explore.error.proxyBody') : t('explore.error.loadBody')}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent className="flex-row flex-wrap justify-center">
				<Button type="button" size="sm" onClick={onRetry}>
					<RotateCw data-icon="inline-start" aria-hidden />
					{t('explore.error.retry')}
				</Button>
				{proxy ? (
					<Button type="button" size="sm" variant="outline" onClick={onOpenSettings}>
						<Settings data-icon="inline-start" aria-hidden />
						{t('explore.error.openSettings')}
					</Button>
				) : null}
			</EmptyContent>
		</Empty>
	)
}

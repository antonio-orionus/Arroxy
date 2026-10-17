import {lazy, Suspense, useEffect, useLayoutEffect, useState, type ReactNode} from 'react'
import log from 'electron-log/renderer.js'
import {Info, MessageCircle, Share2} from 'lucide-react'
import IconDiscord from '~icons/simple-icons/discord'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {DISCORD_URL} from '@shared/constants.js'
import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, type UiTheme} from '@shared/schemas.js'
import {useAppStore} from './store/useAppStore.js'
import {subscribeMenuActions} from './lib/menuAction.js'
import {AppBackdrop} from './components/layout/background/AppBackdrop.js'
import type {BackdropColorScheme} from './components/layout/background/types.js'
import {TitleBar} from './components/layout/TitleBar.js'
import {WizardPanel} from './components/layout/WizardPanel.js'
import {WarmupSplash} from './components/system/WarmupSplash.js'
import {FeedbackNudge} from './components/system/FeedbackNudge.js'
import {UpdateBanner} from './components/system/UpdateBanner.js'
import {Toaster} from './components/ui/sonner.js'
import {useToastSink} from './lib/toastSink.js'
import {ThemeToggle} from './components/system/ThemeToggle.js'
import {StyleToggle} from './components/system/StyleToggle.js'
import {LanguagePicker} from './components/system/LanguagePicker.js'
import {AboutDialog} from './components/system/AboutDialog.js'
import {FeedbackDialog} from './components/system/FeedbackDialog.js'
import {useUpdateChannel} from './components/system/useUpdateChannel.js'
import {WhatsNewDialog} from './components/system/WhatsNewDialog.js'
import {useWhatsNewDialog} from './components/system/useWhatsNewDialog.js'
import {shouldShowSplashGreeting} from './components/system/splashGreeting.js'
import {Button} from './components/ui/button.js'
import {ButtonGroup} from './components/ui/button-group.js'
import {TooltipProvider} from './components/ui/tooltip.js'
import {cn} from './lib/utils.js'
import {selectBackdropAvailability, selectCompactChrome, selectEffectiveStyle} from './store/uiSlice.js'
import {STYLES} from './styles/registry.js'
import changelogText from '../../../CHANGELOG.md?raw'
import {Hint} from './components/shared/Hint.js'

const SHOW_SCENARIO_GALLERY = import.meta.env.MODE === 'browser-mock'
const ShareDialog = lazy(() => import('./components/system/ShareDialog.js').then(module => ({default: module.ShareDialog})))
// Dev-only screens: gating the dynamic import itself lets Vite drop their chunks
// from production builds instead of shipping them unreachable.
const ScenarioGallery = SHOW_SCENARIO_GALLERY ? lazy(() => import('./dev/ScenarioGallery.js').then(module => ({default: module.ScenarioGallery}))) : null
const UiKit = import.meta.env.MODE === 'browser-mock' ? lazy(() => import('./dev/UiKit.js').then(module => ({default: module.UiKit}))) : null
const FOOTER_ACTION_BUTTON_CLASS = 'footer-action-button h-6 rounded-md px-1.5 text-sm text-muted-foreground max-sm:size-6 max-sm:px-0'
const FOOTER_COMPACT_LABEL_CLASS = 'max-sm:sr-only'
const feedbackLogger = log.scope('feedback')
const DEFAULT_FEEDBACK_NUDGE_DELAY_MS = 45_000

// Design-system sheet (browser-mock only): every primitive in every variant. Reach it via `?kit`.
function isUiKitStage(): boolean {
	return import.meta.env.MODE === 'browser-mock' && new URLSearchParams(window.location.search).has('kit')
}

function exitUiKitStage(): void {
	const url = new URL(window.location.href)
	url.searchParams.delete('kit')
	window.location.assign(`${url.pathname}${url.search}${url.hash}`)
}

function isBackdropOnlyStage(): boolean {
	return (import.meta.env.MODE === 'browser-mock' || import.meta.env.MODE === 'test') && new URLSearchParams(window.location.search).has('backdrop')
}

function resolveColorScheme(uiTheme: UiTheme, systemPrefersDark: boolean): BackdropColorScheme {
	return uiTheme === 'dark' || (uiTheme === 'system' && systemPrefersDark) ? 'dark' : 'light'
}

function openDiscord(): void {
	void window.appApi.shell.openExternal(DISCORD_URL)
}

function exitBackdropStage(): void {
	const url = new URL(window.location.href)
	url.searchParams.delete('backdrop')
	window.location.assign(`${url.pathname}${url.search}${url.hash}`)
}

function shouldRenderStartupSplash(): boolean {
	if (import.meta.env.MODE !== 'browser-mock') return true
	return window.__arroxyBrowserMockShowStartupSplash === true
}

function resolveFeedbackNudgeDelay(injectedDelay: number | undefined): number {
	return typeof injectedDelay === 'number' && Number.isFinite(injectedDelay) && injectedDelay >= 0 ? injectedDelay : DEFAULT_FEEDBACK_NUDGE_DELAY_MS
}

export function App(): ReactNode {
	const {t} = useTranslation()
	const {initialized, initialize, setSplashDismissed, splashDismissed, cancelWarmup, warmupBlocking, warmupDiagnostics, warmupProgress, settings, graphicsPolicy, setBackdropFailed} = useAppStore(
		useShallow(state => ({
			initialized: state.initialized,
			initialize: state.initialize,
			setSplashDismissed: state.setSplashDismissed,
			splashDismissed: state.splashDismissed,
			cancelWarmup: state.cancelWarmup,
			warmupBlocking: state.warmupBlocking,
			warmupDiagnostics: state.warmupDiagnostics,
			warmupProgress: state.warmupProgress,
			settings: state.settings,
			graphicsPolicy: state.graphicsPolicy,
			setBackdropFailed: state.setBackdropFailed
		}))
	)
	const {uiZoom, setUiZoom, uiTheme, setUiTheme, setUiStyle, setAboutDialogOpen, openShareDialog, shareDialogOpen, openLogs, saveDiagnostics, setLimitRate, openSettings} = useAppStore(
		useShallow(state => ({
			uiZoom: state.uiZoom,
			setUiZoom: state.setUiZoom,
			uiTheme: state.uiTheme,
			setUiTheme: state.setUiTheme,
			setUiStyle: state.setUiStyle,
			setAboutDialogOpen: state.setAboutDialogOpen,
			openShareDialog: state.openShareDialog,
			shareDialogOpen: state.shareDialogOpen,
			openLogs: state.openLogs,
			saveDiagnostics: state.saveDiagnostics,
			setLimitRate: state.setLimitRate,
			openSettings: state.openSettings
		}))
	)
	const update = useUpdateChannel()
	// While browsing in Explore's compact layout the footer drops its labels and slims down.
	const compactChrome = useAppStore(selectCompactChrome)
	const footerLabelClass = compactChrome ? 'sr-only' : FOOTER_COMPACT_LABEL_CLASS
	const footerActionClass = cn(FOOTER_ACTION_BUTTON_CLASS, compactChrome && 'size-6 px-0')
	// Routes notify.ts to the toast surface for as long as the app is mounted.
	useToastSink()
	const [showNudge, setShowNudge] = useState(false)
	const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
	const [colorScheme, setColorScheme] = useState<BackdropColorScheme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
	const showStartupSplash = shouldRenderStartupSplash()
	const whatsNew = useWhatsNewDialog(changelogText, {startupReady: !showStartupSplash || splashDismissed})
	const effectiveStyle = useAppStore(selectEffectiveStyle)
	const backdropAvailability = useAppStore(selectBackdropAvailability)
	const backdropScenes = backdropAvailability === 'available' ? STYLES[effectiveStyle].backdrop : null
	const softwareWebglAllowed = graphicsPolicy?.backdrop.softwareWebglAllowed ?? false
	const markBackdropFailed = (): void => setBackdropFailed(true)

	// Before paint, so a style switch never shows a frame of the old paint.
	useLayoutEffect(() => {
		document.documentElement.dataset.style = effectiveStyle
	}, [effectiveStyle])

	useEffect(() => {
		void initialize()
	}, [initialize])

	useEffect(() => {
		const html = document.documentElement
		const mq = window.matchMedia('(prefers-color-scheme: dark)')

		function apply(): void {
			const resolved = resolveColorScheme(uiTheme, mq.matches)
			html.classList.toggle('dark', resolved === 'dark')
			html.classList.toggle('light', resolved === 'light')
			setColorScheme(resolved)
		}

		apply()
		if (uiTheme === 'system') {
			mq.addEventListener('change', apply)
			return () => mq.removeEventListener('change', apply)
		}
	}, [uiTheme])

	useEffect(() => {
		const delay = resolveFeedbackNudgeDelay(window.__NUDGE_DELAY_MS)
		const t = setTimeout(() => setShowNudge(true), delay)
		return () => clearTimeout(t)
	}, [])

	// The native application menu (macOS) asks for the same things the footer does.
	useEffect(
		() =>
			subscribeMenuActions(action => {
				switch (action.kind) {
					case 'about':
						setAboutDialogOpen(true)
						break
					case 'share':
						openShareDialog()
						break
					case 'feedback':
						setFeedbackDialogOpen(true)
						break
					case 'settings':
						openSettings()
						break
					case 'logs':
						void openLogs()
						break
					case 'diagnostics':
						void saveDiagnostics()
						break
					case 'speedLimit':
						void setLimitRate(action.limitRate)
						break
					case 'style':
						setUiStyle(action.style)
						break
					case 'theme':
						setUiTheme(action.theme)
						break
				}
			}),
		[setAboutDialogOpen, openShareDialog, setUiStyle, setUiTheme, openLogs, saveDiagnostics, setLimitRate, openSettings]
	)

	useEffect(() => {
		if (!showNudge) return
		const t = setTimeout(() => setShowNudge(false), 8_000)
		return () => clearTimeout(t)
	}, [showNudge])

	if (UiKit && isUiKitStage()) {
		return (
			<TooltipProvider>
				<div className="relative h-screen w-screen overflow-hidden">
					<AppBackdrop scenes={backdropScenes} colorScheme={colorScheme} softwareWebglAllowed={softwareWebglAllowed} onUnavailable={markBackdropFailed} />
					<Suspense fallback={null}>
						<UiKit onExit={exitUiKitStage} />
					</Suspense>
				</div>
			</TooltipProvider>
		)
	}

	// Backdrop isolation stage (browser-mock only): strips all chrome so the animated
	// background can be tuned on its own. Reach it via `?backdrop=1` or the gallery button.
	if (isBackdropOnlyStage()) {
		return (
			<div className="relative h-screen w-screen overflow-hidden" data-testid="backdrop-stage">
				<AppBackdrop scenes={STYLES.aurora.backdrop} colorScheme={colorScheme} softwareWebglAllowed onUnavailable={markBackdropFailed} />
				<div className="fixed bottom-4 left-4 z-10 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-md border border-border-strong bg-background/80 px-2 py-1.5 backdrop-blur">
					<ThemeToggle />
					<button type="button" onClick={exitBackdropStage} className="text-xs font-medium text-muted-foreground hover:text-foreground" data-testid="backdrop-stage-exit">
						← exit
					</button>
				</div>
			</div>
		)
	}

	return (
		<TooltipProvider>
			<div className="relative flex flex-col h-screen w-screen overflow-hidden" data-testid="app-root">
				<AppBackdrop scenes={backdropScenes} colorScheme={colorScheme} softwareWebglAllowed={softwareWebglAllowed} onUnavailable={markBackdropFailed} />
				<TitleBar />

				{update.info && <UpdateBanner info={update.info} installing={update.installing} installError={update.error} onInstall={update.install} onDownload={update.download} onDismiss={update.dismiss} />}

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden" data-testid="app-content">
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{zoom: uiZoom}}>
						<div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" data-testid="wizard-scrollport">
							<WizardPanel />
						</div>
					</div>
				</div>

				<footer className={cn('chrome-glass shrink-0 flex min-w-0 items-center justify-between gap-2 border-t border-border px-4 max-sm:px-2', compactChrome ? 'h-7' : 'h-8')} data-compact={compactChrome ? 'true' : undefined} data-testid="app-footer">
					<div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden" data-testid="footer-left-controls">
						<ButtonGroup>
							<Button type="button" variant="ghost" size="icon-xs" onClick={() => setUiZoom(uiZoom - ZOOM_STEP)} disabled={uiZoom <= ZOOM_MIN} className="size-5 text-base leading-none text-muted-foreground" aria-label={t('app.zoomOut')}>
								−
							</Button>
							<Button type="button" variant="ghost" size="icon-xs" onClick={() => setUiZoom(uiZoom + ZOOM_STEP)} disabled={uiZoom >= ZOOM_MAX} className="size-5 text-base leading-none text-muted-foreground" aria-label={t('app.zoomIn')}>
								+
							</Button>
						</ButtonGroup>
						<span className="w-8 text-center text-sm text-muted-foreground tabular-nums">{Math.round(uiZoom * 100)}%</span>
						<div className="mx-1 h-3 w-px bg-border" aria-hidden />
						<ThemeToggle />
						<StyleToggle hintReady={(!showStartupSplash || splashDismissed) && !whatsNew.open} />
						<div className="mx-1 h-3 w-px bg-border" aria-hidden />
						<div className="min-w-0 [&_[data-slot=select-trigger]]:max-w-[6rem] [&_[data-slot=select-value]]:truncate sm:[&_[data-slot=select-trigger]]:max-w-none" data-testid="footer-language-picker">
							<LanguagePicker />
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-0.5 sm:gap-1" data-testid="footer-actions">
						<Hint label={t('about.openTitle')}>
							<Button type="button" variant="ghost" size="xs" className={cn(footerActionClass, 'max-sm:hidden')} onClick={() => setAboutDialogOpen(true)} data-testid="btn-about">
								<Info data-icon="inline-start" aria-hidden />
								<span className={cn(compactChrome && 'sr-only')}>{t('about.button')}</span>
							</Button>
						</Hint>
						<Hint label={t('share.footerTooltip')}>
							<Button type="button" variant="ghost" size="xs" className={footerActionClass} onClick={() => openShareDialog()} data-testid="btn-share">
								<Share2 data-icon="inline-start" aria-hidden />
								<span className={footerLabelClass} data-testid="btn-share-label">
									{t('share.footerLabel')}
								</span>
							</Button>
						</Hint>
						<Hint label="Discord">
							<Button type="button" variant="ghost" size="xs" className={footerActionClass} onClick={openDiscord} aria-label="Discord" data-testid="btn-discord">
								<IconDiscord data-icon="inline-start" aria-hidden />
								<span className={footerLabelClass} data-testid="btn-discord-label">
									Discord
								</span>
							</Button>
						</Hint>
						<div className="relative inline-flex h-6 items-center">
							<FeedbackNudge visible={showNudge} message={t('app.feedbackNudge')} />
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className={cn(footerActionClass, showNudge && 'feedback-btn-nudging')}
								onClick={() => {
									feedbackLogger.info('Feedback button clicked', {source: 'footer', nudgeVisible: showNudge})
									setShowNudge(false)
									setFeedbackDialogOpen(true)
								}}
								aria-label={t('app.feedback')}
								data-testid="btn-feedback"
							>
								<MessageCircle data-icon="inline-start" aria-hidden />
								<span className={footerLabelClass} data-testid="btn-feedback-label">
									{t('app.feedback')}
								</span>
							</Button>
						</div>
					</div>
				</footer>

				{showStartupSplash && <WarmupSplash initialized={initialized} warmupBlocking={warmupBlocking} warmupDiagnostics={warmupDiagnostics} warmupProgress={warmupProgress} showGreeting={shouldShowSplashGreeting(settings)} onDismissed={() => setSplashDismissed(true)} onCancel={cancelWarmup} />}
				<AboutDialog />
				{shareDialogOpen ? (
					<Suspense fallback={null}>
						<ShareDialog />
					</Suspense>
				) : null}
				<FeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
				<WhatsNewDialog open={whatsNew.open} digest={whatsNew.digest} onClose={whatsNew.close} onOpenFullNotes={whatsNew.openFullNotes} />
				{ScenarioGallery ? (
					<Suspense fallback={null}>
						<ScenarioGallery />
					</Suspense>
				) : null}
				<Toaster theme={colorScheme} />
			</div>
		</TooltipProvider>
	)
}

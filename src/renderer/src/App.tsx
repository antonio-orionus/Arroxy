import {lazy, Suspense, useEffect, useState, type ReactNode} from 'react'
import log from 'electron-log/renderer.js'
import {Cpu, FileText, Image, Info, MessageCircle, Paintbrush, Share2} from 'lucide-react'
import IconDiscord from '~icons/simple-icons/discord'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {DEFAULTS, DISCORD_URL} from '@shared/constants.js'
import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, type UiTheme} from '@shared/schemas.js'
import {useAppStore} from './store/useAppStore.js'
import {AppBackdrop} from './components/layout/background/AppBackdrop.js'
import type {BackdropColorScheme} from './components/layout/background/types.js'
import {TitleBar} from './components/layout/TitleBar.js'
import {WizardPanel} from './components/layout/WizardPanel.js'
import {SmartDrawer} from './components/layout/SmartDrawer.js'
import {WarmupSplash} from './components/system/WarmupSplash.js'
import {FeedbackNudge} from './components/system/FeedbackNudge.js'
import {UpdateBanner} from './components/system/UpdateBanner.js'
import {ThemeToggle} from './components/system/ThemeToggle.js'
import {LanguagePicker} from './components/system/LanguagePicker.js'
import {AboutDialog} from './components/system/AboutDialog.js'
import {FeedbackDialog} from './components/system/FeedbackDialog.js'
import {useUpdateChannel} from './components/system/useUpdateChannel.js'
import {shouldShowSplashGreeting} from './components/system/splashGreeting.js'
import {Button} from './components/ui/button.js'
import {ButtonGroup} from './components/ui/button-group.js'
import {TooltipProvider} from './components/ui/tooltip.js'
import {cn} from './lib/utils.js'

const SHOW_SCENARIO_GALLERY = import.meta.env.MODE === 'browser-mock'
const ShareDialog = lazy(() => import('./components/system/ShareDialog.js').then(module => ({default: module.ShareDialog})))
const ScenarioGallery = lazy(() => import('./dev/ScenarioGallery.js').then(module => ({default: module.ScenarioGallery})))
const FOOTER_ACTION_BUTTON_CLASS = 'footer-action-button h-6 rounded-md px-1.5 text-[13px] text-muted-foreground max-sm:size-6 max-sm:px-0'
const FOOTER_VERSION_BUTTON_CLASS = 'footer-action-button h-6 rounded-md px-1.5 text-[11px] text-muted-foreground/60 tabular-nums max-sm:hidden'
const FOOTER_COMPACT_LABEL_CLASS = 'max-sm:sr-only'
const feedbackLogger = log.scope('feedback')
type BackdropPreviewMode = 'gpu' | 'canvas2d' | 'css'

const BACKDROP_PREVIEW_MODES = [
	{description: 'WebGL shader preview: hardware when available, software allowed in this stage.', icon: Cpu, id: 'gpu', label: 'WebGL shader'},
	{description: 'Canvas2D fallback: WebGL is bypassed, static canvas plus CSS drift.', icon: Image, id: 'canvas2d', label: 'Canvas2D fallback'},
	{description: 'CSS emergency: no canvas, body gradients only.', icon: Paintbrush, id: 'css', label: 'CSS emergency'}
] as const satisfies readonly {description: string; icon: typeof Cpu; id: BackdropPreviewMode; label: string}[]

function isBackdropOnlyStage(): boolean {
	return (import.meta.env.MODE === 'browser-mock' || import.meta.env.MODE === 'test') && new URLSearchParams(window.location.search).has('backdrop')
}

function backdropPreviewModeFromUrl(): BackdropPreviewMode {
	try {
		const forcedMode = new URLSearchParams(window.location.search).get('backdropForceFallback')
		return forcedMode === 'canvas2d' || forcedMode === 'css' ? forcedMode : 'gpu'
	} catch {
		return 'gpu'
	}
}

function resolveColorScheme(uiTheme: UiTheme, systemPrefersDark: boolean): BackdropColorScheme {
	return uiTheme === 'dark' || (uiTheme === 'system' && systemPrefersDark) ? 'dark' : 'light'
}

function previewModeToRenderMode(mode: BackdropPreviewMode): 'css-only' | 'fallback' | 'gpu' {
	if (mode === 'css') return 'css-only'
	if (mode === 'canvas2d') return 'fallback'
	return 'gpu'
}

function shouldRenderStartupSplash(): boolean {
	if (import.meta.env.MODE !== 'browser-mock') return true
	return window.__arroxyBrowserMockShowStartupSplash === true
}

export function App(): ReactNode {
	const {t} = useTranslation()
	const {initialized, initialize, openLogs, setSplashDismissed, warmupBlocking, warmupDiagnostics, warmupProgress, settings} = useAppStore(
		useShallow(state => ({initialized: state.initialized, initialize: state.initialize, openLogs: state.openLogs, setSplashDismissed: state.setSplashDismissed, warmupBlocking: state.warmupBlocking, warmupDiagnostics: state.warmupDiagnostics, warmupProgress: state.warmupProgress, settings: state.settings}))
	)
	const {uiZoom, setUiZoom, uiTheme, setAboutDialogOpen, openShareDialog, shareDialogOpen} = useAppStore(
		useShallow(state => ({uiZoom: state.uiZoom, setUiZoom: state.setUiZoom, uiTheme: state.uiTheme, setAboutDialogOpen: state.setAboutDialogOpen, openShareDialog: state.openShareDialog, shareDialogOpen: state.shareDialogOpen}))
	)
	const update = useUpdateChannel()
	const [showNudge, setShowNudge] = useState(false)
	const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
	const [colorScheme, setColorScheme] = useState<BackdropColorScheme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
	const [backdropPreviewMode, setBackdropPreviewMode] = useState<BackdropPreviewMode>(() => backdropPreviewModeFromUrl())
	const showStartupSplash = shouldRenderStartupSplash()
	const backdropRenderMode = settings?.common?.backdropRenderMode ?? DEFAULTS.backdropRenderMode

	function openDiscord(): void {
		void window.appApi.shell.openExternal(DISCORD_URL)
	}

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
		const delay = ((window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS as number) ?? 45_000
		const t = setTimeout(() => setShowNudge(true), delay)
		return () => clearTimeout(t)
	}, [])

	useEffect(() => {
		if (!showNudge) return
		const t = setTimeout(() => setShowNudge(false), 8_000)
		return () => clearTimeout(t)
	}, [showNudge])

	// Backdrop isolation stage (browser-mock only): strips all chrome so the animated
	// background can be tuned on its own. Reach it via `?backdrop=1` or the gallery button.
	if (isBackdropOnlyStage()) {
		const activeBackdropPreview = BACKDROP_PREVIEW_MODES.find(mode => mode.id === backdropPreviewMode) ?? BACKDROP_PREVIEW_MODES[0]
		const applyBackdropPreviewMode = (mode: BackdropPreviewMode): void => {
			const url = new URL(window.location.href)
			if (mode === 'gpu') url.searchParams.delete('backdropForceFallback')
			else url.searchParams.set('backdropForceFallback', mode)
			window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
			setBackdropPreviewMode(mode)
		}
		const exit = (): void => {
			const url = new URL(window.location.href)
			url.searchParams.delete('backdrop')
			window.location.assign(`${url.pathname}${url.search}${url.hash}`)
		}
		return (
			<div className="relative h-screen w-screen overflow-hidden" data-testid="backdrop-stage">
				<AppBackdrop key={`${colorScheme}-${backdropPreviewMode}`} colorScheme={colorScheme} renderMode={previewModeToRenderMode(backdropPreviewMode)} />
				<div className="fixed bottom-4 left-4 z-10 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-md border border-[var(--border-strong)] bg-background/80 px-2 py-1.5 backdrop-blur">
					<ThemeToggle />
					<div className="h-5 w-px bg-border" aria-hidden />
					<div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-0.5" data-testid="backdrop-preview-controls" aria-label="Backdrop render path">
						{BACKDROP_PREVIEW_MODES.map(mode => {
							const Icon = mode.icon
							const active = mode.id === backdropPreviewMode
							return (
								<button
									key={mode.id}
									type="button"
									onClick={() => applyBackdropPreviewMode(mode.id)}
									aria-pressed={active}
									className={cn('inline-flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors', active ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_var(--brand-glow)]' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
									data-testid={`backdrop-preview-${mode.id}`}
								>
									<Icon size={12} aria-hidden />
									{mode.label}
								</button>
							)
						})}
					</div>
					<p className="max-w-[min(30rem,calc(100vw-2rem))] text-[11px] leading-4 text-muted-foreground" data-testid="backdrop-preview-description">
						{activeBackdropPreview.description}
					</p>
					<button type="button" onClick={exit} className="text-xs font-medium text-muted-foreground hover:text-foreground" data-testid="backdrop-stage-exit">
						← exit
					</button>
				</div>
			</div>
		)
	}

	return (
		<TooltipProvider>
			<div className="relative flex flex-col h-screen w-screen overflow-hidden" data-testid="app-root">
				<AppBackdrop key={`${colorScheme}-${backdropRenderMode}`} colorScheme={colorScheme} renderMode={backdropRenderMode} />
				<TitleBar />

				{update.info && <UpdateBanner info={update.info} installing={update.installing} installError={update.error} onInstall={update.install} onDownload={update.download} onDismiss={update.dismiss} />}

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden" data-testid="app-content">
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{zoom: uiZoom}}>
						<div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" data-testid="wizard-scrollport">
							<WizardPanel />
						</div>
						<SmartDrawer />
					</div>
				</div>

				<footer className="chrome-glass shrink-0 flex h-8 min-w-0 items-center justify-between gap-2 border-t border-border px-4 max-sm:px-2" data-testid="app-footer">
					<div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden" data-testid="footer-left-controls">
						<ButtonGroup>
							<Button type="button" variant="ghost" size="icon-xs" onClick={() => setUiZoom(uiZoom - ZOOM_STEP)} disabled={uiZoom <= ZOOM_MIN} className="size-5 text-base leading-none text-muted-foreground" aria-label={t('app.zoomOut')}>
								−
							</Button>
							<Button type="button" variant="ghost" size="icon-xs" onClick={() => setUiZoom(uiZoom + ZOOM_STEP)} disabled={uiZoom >= ZOOM_MAX} className="size-5 text-base leading-none text-muted-foreground" aria-label={t('app.zoomIn')}>
								+
							</Button>
						</ButtonGroup>
						<span className="w-8 text-center text-[13px] text-muted-foreground tabular-nums">{Math.round(uiZoom * 100)}%</span>
						<div className="mx-1 h-3 w-px bg-border" aria-hidden />
						<ThemeToggle />
						<div className="mx-1 h-3 w-px bg-border" aria-hidden />
						<div className="min-w-0 [&_select]:max-w-[4.75rem] [&_select]:truncate sm:[&_select]:max-w-none" data-testid="footer-language-picker">
							<LanguagePicker />
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-0.5 sm:gap-1" data-testid="footer-actions">
						<Button type="button" variant="ghost" size="xs" className={FOOTER_VERSION_BUTTON_CLASS} onClick={() => setAboutDialogOpen(true)} title={t('about.openTitle')} data-testid="btn-about-version">
							v{window.appVersion}
						</Button>
						<Button type="button" variant="ghost" size="xs" className={cn(FOOTER_ACTION_BUTTON_CLASS, 'max-sm:hidden')} onClick={() => setAboutDialogOpen(true)} title={t('about.openTitle')} data-testid="btn-about">
							<Info data-icon="inline-start" aria-hidden />
							{t('about.button')}
						</Button>
						<Button type="button" variant="ghost" size="xs" className={FOOTER_ACTION_BUTTON_CLASS} onClick={() => openShareDialog('footer')} title={t('share.footerTooltip')} data-testid="btn-share">
							<Share2 data-icon="inline-start" aria-hidden />
							<span className={FOOTER_COMPACT_LABEL_CLASS} data-testid="btn-share-label">
								{t('share.footerLabel')}
							</span>
						</Button>
						<Button type="button" variant="ghost" size="xs" className={FOOTER_ACTION_BUTTON_CLASS} onClick={openDiscord} title="Discord" aria-label="Discord" data-testid="btn-discord">
							<IconDiscord data-icon="inline-start" aria-hidden />
							<span className={FOOTER_COMPACT_LABEL_CLASS} data-testid="btn-discord-label">
								Discord
							</span>
						</Button>
						<div className="relative inline-flex h-6 items-center">
							<FeedbackNudge visible={showNudge} message={t('app.feedbackNudge')} />
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className={cn(FOOTER_ACTION_BUTTON_CLASS, showNudge && 'feedback-btn-nudging')}
								onClick={() => {
									feedbackLogger.info('Feedback button clicked', {source: 'footer', nudgeVisible: showNudge})
									setShowNudge(false)
									setFeedbackDialogOpen(true)
								}}
								aria-label={t('app.feedback')}
								data-testid="btn-feedback"
							>
								<MessageCircle data-icon="inline-start" aria-hidden />
								<span className={FOOTER_COMPACT_LABEL_CLASS} data-testid="btn-feedback-label">
									{t('app.feedback')}
								</span>
							</Button>
						</div>
						<Button type="button" variant="ghost" size="xs" className={FOOTER_ACTION_BUTTON_CLASS} onClick={() => void openLogs()} aria-label={t('app.logs')} data-testid="btn-logs">
							<FileText data-icon="inline-start" aria-hidden />
							<span className={FOOTER_COMPACT_LABEL_CLASS} data-testid="btn-logs-label">
								{t('app.logs')}
							</span>
						</Button>
					</div>
				</footer>

				{showStartupSplash && <WarmupSplash initialized={initialized} warmupBlocking={warmupBlocking} warmupDiagnostics={warmupDiagnostics} warmupProgress={warmupProgress} showGreeting={shouldShowSplashGreeting(settings)} onDismissed={() => setSplashDismissed(true)} />}
				<AboutDialog />
				{shareDialogOpen ? (
					<Suspense fallback={null}>
						<ShareDialog />
					</Suspense>
				) : null}
				<FeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
				{SHOW_SCENARIO_GALLERY ? (
					<Suspense fallback={null}>
						<ScenarioGallery />
					</Suspense>
				) : null}
			</div>
		</TooltipProvider>
	)
}

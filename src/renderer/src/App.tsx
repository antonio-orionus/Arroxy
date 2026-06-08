import {useEffect, useState, type JSX} from 'react'
import {Bug, Info, Share2} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP} from '@shared/schemas.js'
import {useAppStore} from './store/useAppStore.js'
import {TitleBar} from './components/layout/TitleBar.js'
import {WizardPanel} from './components/layout/WizardPanel.js'
import {SmartDrawer} from './components/layout/SmartDrawer.js'
import {SplashScreen} from './components/system/SplashScreen.js'
import {FeedbackNudge} from './components/system/FeedbackNudge.js'
import {UpdateBanner} from './components/system/UpdateBanner.js'
import {ThemeToggle} from './components/system/ThemeToggle.js'
import {LanguagePicker} from './components/system/LanguagePicker.js'
import {AboutDialog} from './components/system/AboutDialog.js'
import {ShareDialog} from './components/system/ShareDialog.js'
import {useUpdateChannel} from './components/system/useUpdateChannel.js'
import {shouldShowSplashGreeting} from './components/system/splashGreeting.js'
import {Button} from './components/ui/button.js'
import {ButtonGroup} from './components/ui/button-group.js'
import {TooltipProvider} from './components/ui/tooltip.js'
import {ScenarioGallery} from './dev/ScenarioGallery.js'
import {cn} from './lib/utils.js'

const FEEDBACK_URL = 'https://github.com/antonio-orionus/Arroxy/issues/new/choose'
const SHOW_SCENARIO_GALLERY = import.meta.env.MODE === 'browser-mock'

function shouldRenderStartupSplash(): boolean {
	if (import.meta.env.MODE !== 'browser-mock') return true
	return window.__arroxyBrowserMockShowStartupSplash === true
}

function buildDebugInfo(): string {
	const ua = navigator.userAgent
	const electron = /Electron\/([\d.]+)/.exec(ua)?.[1] ?? 'unknown'
	const chrome = /Chrome\/([\d.]+)/.exec(ua)?.[1] ?? 'unknown'
	return [`Platform: ${window.platform}`, `Electron: ${electron}`, `Chrome: ${chrome}`].join('\n')
}

export function App(): JSX.Element {
	const {t} = useTranslation()
	const {initialized, initialize, openLogs, uiZoom, setUiZoom, uiTheme, warmupBlocking, warmupDiagnostics, warmupProgress, settings, setSplashDismissed, setAboutDialogOpen, openShareDialog} = useAppStore()
	const update = useUpdateChannel()
	const [debugCopied, setDebugCopied] = useState(false)
	const [showNudge, setShowNudge] = useState(false)
	const showStartupSplash = shouldRenderStartupSplash()

	function copyDebugInfo(): void {
		void navigator.clipboard.writeText(buildDebugInfo()).then(() => {
			setDebugCopied(true)
			setTimeout(() => setDebugCopied(false), 1500)
		})
	}

	useEffect(() => {
		void initialize()
	}, [initialize])

	useEffect(() => {
		const html = document.documentElement
		const mq = window.matchMedia('(prefers-color-scheme: dark)')

		function apply(): void {
			html.classList.toggle('dark', uiTheme === 'dark' || (uiTheme === 'system' && mq.matches))
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

	return (
		<TooltipProvider>
			<div className="relative flex flex-col h-screen w-screen bg-background overflow-hidden" data-testid="app-root">
				<TitleBar />

				{update.info && <UpdateBanner info={update.info} installing={update.installing} installError={update.error} onInstall={update.install} onDownload={update.download} onDismiss={update.dismiss} />}

				<div className="flex-1 flex flex-col overflow-hidden" data-testid="app-content">
					<div className="flex-1 flex flex-col overflow-hidden" style={{zoom: uiZoom}}>
						<div className="flex-1 overflow-y-auto overflow-x-hidden">
							<WizardPanel />
						</div>
						<SmartDrawer />
					</div>
				</div>

				<footer className="shrink-0 flex items-center justify-between border-t border-border px-4 h-7">
					<div className="flex items-center gap-1">
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
						<LanguagePicker />
					</div>
					<div className="flex items-center gap-3">
						<Button type="button" variant="ghost" size="xs" className="h-5 px-0 text-[11px] text-muted-foreground/50 tabular-nums" onClick={() => setAboutDialogOpen(true)} title={t('about.openTitle')} data-testid="btn-about-version">
							v{window.appVersion}
						</Button>
						<Button type="button" variant="ghost" size="xs" className="h-5 px-0 text-[13px] text-muted-foreground" onClick={() => setAboutDialogOpen(true)} title={t('about.openTitle')} data-testid="btn-about">
							<Info data-icon="inline-start" aria-hidden />
							{t('about.button')}
						</Button>
						<Button type="button" variant="ghost" size="icon-xs" className="size-5 text-muted-foreground" onClick={copyDebugInfo} title={debugCopied ? t('app.debugCopied') : t('app.debugCopyTitle')} aria-label={debugCopied ? t('app.debugCopied') : t('app.debugCopyTitle')} data-testid="btn-debug">
							<Bug aria-hidden />
						</Button>
						<Button type="button" variant="ghost" size="xs" className="h-5 px-0 text-[13px] text-muted-foreground" onClick={() => openShareDialog('footer')} title={t('share.footerTooltip')} data-testid="btn-share">
							<Share2 data-icon="inline-start" aria-hidden />
							{t('share.footerLabel')}
						</Button>
						<div className="relative inline-flex items-center h-5">
							<FeedbackNudge visible={showNudge} message={t('app.feedbackNudge')} />
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className={cn('h-5 px-0 text-[13px]', showNudge ? 'feedback-btn-nudging' : 'text-muted-foreground')}
								onClick={() => {
									setShowNudge(false)
									void window.appApi.shell.openExternal(FEEDBACK_URL)
								}}
								data-testid="btn-feedback"
							>
								{t('app.feedback')}
							</Button>
						</div>
						<Button type="button" variant="ghost" size="xs" className="h-5 px-0 text-[13px] text-muted-foreground" onClick={() => void openLogs()} data-testid="btn-logs">
							{t('app.logs')}
						</Button>
					</div>
				</footer>

				{showStartupSplash && <SplashScreen initialized={initialized} warmupBlocking={warmupBlocking} warmupDiagnostics={warmupDiagnostics} warmupProgress={warmupProgress} showGreeting={shouldShowSplashGreeting(settings)} onDismissed={() => setSplashDismissed(true)} />}
				<AboutDialog />
				<ShareDialog />
				{SHOW_SCENARIO_GALLERY && <ScenarioGallery />}
			</div>
		</TooltipProvider>
	)
}

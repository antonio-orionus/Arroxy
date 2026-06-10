import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import {ChevronDown, RotateCcw, Sparkles, TestTube2} from 'lucide-react'
import {SUPPORTED_LANGS, YT_DLP_ERROR_KINDS} from '@shared/schemas.js'
import type {SupportedLang, YtDlpErrorKind} from '@shared/schemas.js'
import {applyScenarioWorkbenchState, BROWSER_MOCK_SCENARIOS, getScenario, isScreenPresetScenario, mockStepForScenario, mockStepsForScenario, readScenarioIdFromUrl, readUrlParams, type BrowserMockScenario, type BrowserMockScenarioGroup, type BrowserMockStep} from './browserMockScenarios.js'
import {applyThemeLive, knobUrl, MOCK_PLATFORM_LABELS, MOCK_PLATFORMS, readKnobs, type MockPlatform} from './browserMockKnobs.js'
import type {UiTheme} from '@shared/schemas.js'
import {cn} from '../lib/utils.js'
import {useAppStore} from '../store/useAppStore.js'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select.js'

const GROUPS: BrowserMockScenarioGroup[] = ['General', 'Playlist', 'Profiles', 'Probe Results', 'Probe Errors', 'Dialogs', 'Updates', 'Queue', 'Diagnostics']
const PLAYLIST_PRESETS = [99, 100, 101] as const

function activeScenario(): BrowserMockScenario {
	try {
		return getScenario(readScenarioIdFromUrl(window.location))
	} catch {
		return getScenario(null)
	}
}

function activeUrlParams(): ReturnType<typeof readUrlParams> {
	try {
		return readUrlParams(window.location)
	} catch {
		return {playlistCount: null, probeErrorKind: null, mockStep: null}
	}
}

function activeKnobs(): ReturnType<typeof readKnobs> {
	try {
		return readKnobs(window.location)
	} catch {
		return {theme: null, locale: null, platform: null}
	}
}

function scenarioUrl(id: BrowserMockScenario['id']): string {
	const url = new URL(window.location.href)
	url.searchParams.delete('playlist')
	url.searchParams.delete('probeError')
	url.searchParams.delete('mockStep')
	if (id === 'default') url.searchParams.delete('scenario')
	else url.searchParams.set('scenario', id)
	return `${url.pathname}${url.search}${url.hash}`
}

function playlistParamUrl(count: number): string {
	const url = new URL(window.location.href)
	url.searchParams.delete('scenario')
	url.searchParams.delete('probeError')
	url.searchParams.delete('mockStep')
	url.searchParams.set('playlist', String(count))
	return `${url.pathname}${url.search}${url.hash}`
}

function probeErrorParamUrl(kind: YtDlpErrorKind | null): string {
	const url = new URL(window.location.href)
	url.searchParams.delete('scenario')
	url.searchParams.delete('playlist')
	url.searchParams.delete('mockStep')
	if (kind === null) url.searchParams.delete('probeError')
	else url.searchParams.set('probeError', kind)
	return `${url.pathname}${url.search}${url.hash}`
}

function mockStepUrl(scenario: BrowserMockScenario, step: BrowserMockStep | null): string {
	const url = new URL(window.location.href)
	url.searchParams.delete('playlist')
	url.searchParams.delete('probeError')
	url.searchParams.set('scenario', scenario.id)
	if (step === null) url.searchParams.delete('mockStep')
	else url.searchParams.set('mockStep', step)
	return `${url.pathname}${url.search}${url.hash}`
}

function applyScenario(id: BrowserMockScenario['id']): void {
	window.location.assign(scenarioUrl(id))
}

function applyBackdropStage(): void {
	const url = new URL(window.location.href)
	// Keep theme/locale/platform knobs; drop scenario state.
	for (const p of ['scenario', 'playlist', 'probeError', 'mockStep']) url.searchParams.delete(p)
	url.searchParams.set('backdrop', '1')
	window.location.assign(`${url.pathname}${url.search}${url.hash}`)
}

function applyPlaylistCount(count: number): void {
	window.location.assign(playlistParamUrl(count))
}

function applyProbeErrorKind(kind: YtDlpErrorKind | null): void {
	window.location.assign(probeErrorParamUrl(kind))
}

function applyMockStep(scenario: BrowserMockScenario, step: BrowserMockStep | null): void {
	window.location.assign(mockStepUrl(scenario, step))
}

function mockStepOptions(scenario: BrowserMockScenario): readonly BrowserMockStep[] {
	return mockStepsForScenario(scenario)
}

function applyKnob(updates: {theme?: UiTheme | null; locale?: SupportedLang | null; platform?: MockPlatform | null}): void {
	const url = knobUrl(updates, window.location)
	// Theme toggles live (no reload); locale/platform need reload for settings to take effect.
	if ('theme' in updates && !('locale' in updates) && !('platform' in updates)) {
		applyThemeLive(updates.theme ?? null)
		window.history.replaceState(null, '', url)
	} else {
		window.location.assign(url)
	}
}

export function ScenarioGallery(): ReactNode {
	const [open, setOpen] = useState(false)
	const scenario = activeScenario()
	const urlParams = activeUrlParams()
	const knobs = activeKnobs()
	const initialized = useAppStore(state => state.initialized)
	const autoAppliedRef = useRef<string | null>(null)
	const [playlistInput, setPlaylistInput] = useState(urlParams.playlistCount !== null ? String(urlParams.playlistCount) : '')

	const [liveTheme, setLiveTheme] = useState<UiTheme | null>(knobs.theme)

	const grouped = useMemo(() => GROUPS.map(group => ({group, scenarios: BROWSER_MOCK_SCENARIOS.filter(candidate => candidate.group === group)})), [])

	useEffect(() => {
		const applyKey = `${scenario.id}:${urlParams.playlistCount ?? ''}:${urlParams.probeErrorKind ?? ''}:${urlParams.mockStep ?? ''}`
		if (!initialized || autoAppliedRef.current === applyKey) return
		autoAppliedRef.current = applyKey
		const store = useAppStore.getState()

		void applyScenarioWorkbenchState({scenario, params: {playlistCount: urlParams.playlistCount, probeErrorKind: urlParams.probeErrorKind, mockStep: urlParams.mockStep}, store: {reset: store.reset, setWizardUrl: store.setWizardUrl, submitUrl: store.submitUrl, setState: useAppStore.setState}})
	}, [initialized, scenario, scenario.id, scenario.kind, urlParams.mockStep, urlParams.playlistCount, urlParams.probeErrorKind])

	const isPlaylistParam = urlParams.playlistCount !== null
	const isProbeErrorParam = urlParams.probeErrorKind !== null
	const currentMockStep = mockStepForScenario(scenario, urlParams.mockStep)
	const showMockStepPicker = isScreenPresetScenario(scenario) && !isPlaylistParam && !isProbeErrorParam
	const availableMockSteps = mockStepOptions(scenario)

	function activeLabel(): string {
		if (isPlaylistParam) return `Playlist ×${urlParams.playlistCount}`
		if (isProbeErrorParam) return `Error: ${urlParams.probeErrorKind ?? ''}`
		return scenario.title
	}

	function activeDescription(): string {
		if (isPlaylistParam) return `Playlist probe with ${urlParams.playlistCount} entries.`
		if (isProbeErrorParam) return `Probe error: ${urlParams.probeErrorKind ?? ''}.`
		if (currentMockStep !== null) return `${scenario.description} Opens directly to ${currentMockStep}.`
		return scenario.description
	}

	function handlePlaylistSubmit(e: React.SyntheticEvent): void {
		e.preventDefault()
		const count = parseInt(playlistInput, 10)
		if (Number.isInteger(count) && count > 0) applyPlaylistCount(count)
	}

	const handleThemeToggle = useCallback(
		(theme: UiTheme) => {
			const next = liveTheme === theme ? null : theme
			setLiveTheme(next)
			applyKnob({theme: next})
		},
		[liveTheme]
	)

	return (
		<aside className="fixed bottom-9 left-3 z-[45] max-w-[calc(100vw-1.5rem)] text-xs" data-testid="scenario-gallery">
			<button type="button" onClick={() => setOpen(value => !value)} className="flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-md border border-[var(--border-strong)] bg-background/95 px-3 py-2 text-left shadow-lg backdrop-blur" data-testid="scenario-gallery-toggle" aria-expanded={open}>
				<TestTube2 size={14} className="shrink-0 text-sky-500" />
				<span className="min-w-0">
					<span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Scenario</span>
					<span className="block max-w-48 truncate font-semibold text-foreground">{activeLabel()}</span>
				</span>
				<ChevronDown size={14} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
			</button>

			{open && (
				<div className="mt-2 w-[min(560px,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-[var(--border-strong)] bg-background/98 shadow-xl backdrop-blur" data-testid="scenario-gallery-panel">
					<div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
						<div className="min-w-0">
							<p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Browser Mock Gallery</p>
							<p className="truncate text-[11px] text-muted-foreground">{activeDescription()}</p>
						</div>
						<div className="flex shrink-0 items-center gap-1.5">
							<button type="button" onClick={applyBackdropStage} className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 font-medium text-muted-foreground hover:text-foreground" data-testid="scenario-backdrop-only">
								<Sparkles size={12} />
								Backdrop only
							</button>
							<button type="button" onClick={() => applyScenario('default')} className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 font-medium text-muted-foreground hover:text-foreground" data-testid="scenario-reset">
								<RotateCcw size={12} />
								Reset
							</button>
						</div>
					</div>

					<div className="max-h-[min(70vh,620px)] overflow-y-auto p-3">
						{/* Knobs section */}
						<section className="mb-4" data-testid="knobs-section">
							<h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Knobs</h3>
							<div className="flex flex-wrap gap-x-4 gap-y-2">
								{/* Theme */}
								<div>
									<p className="mb-1 text-[10px] text-muted-foreground">Theme</p>
									<div className="flex gap-1">
										{(['light', 'dark'] as const).map(t => (
											<button
												key={t}
												type="button"
												onClick={() => handleThemeToggle(t)}
												className={cn('h-7 rounded border px-2 text-[10px] font-medium capitalize transition-colors', liveTheme === t ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
												data-testid={`knob-theme-${t}`}
											>
												{t}
											</button>
										))}
									</div>
								</div>
								{/* Locale */}
								<div>
									<p className="mb-1 text-[10px] text-muted-foreground">Locale</p>
									<div className="flex gap-1">
										<Select value={knobs.locale ?? ''} onValueChange={v => applyKnob({locale: v === '' ? null : (v as SupportedLang)})}>
											<SelectTrigger size="sm" className={cn('text-[11px]', knobs.locale !== null ? 'border-[var(--brand)]' : '')} data-testid="knob-locale-select">
												<SelectValue placeholder="— default (en) —" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">— default (en) —</SelectItem>
												{SUPPORTED_LANGS.map(lang => (
													<SelectItem key={lang} value={lang}>
														{lang}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								{/* Platform */}
								<div>
									<p className="mb-1 text-[10px] text-muted-foreground">Platform</p>
									<div className="flex gap-1">
										{MOCK_PLATFORMS.map(p => (
											<button
												key={p}
												type="button"
												onClick={() => applyKnob({platform: knobs.platform === p ? null : p})}
												className={cn('h-7 rounded border px-2 text-[10px] font-medium transition-colors', knobs.platform === p ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
												data-testid={`knob-platform-${p}`}
											>
												{MOCK_PLATFORM_LABELS[p]}
											</button>
										))}
									</div>
								</div>
							</div>
						</section>

						{showMockStepPicker && (
							<section className="mb-4" data-testid="mock-step-section">
								<h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Screen</h3>
								<div className="flex items-center gap-2">
									<Select value={currentMockStep ?? ''} onValueChange={v => applyMockStep(scenario, v === '' ? null : (v as BrowserMockStep))}>
										<SelectTrigger size="sm" className={cn('flex-1 text-[11px]', currentMockStep !== null ? 'border-[var(--brand)]' : '')} data-testid="mock-step-select">
											<SelectValue placeholder="Natural landing screen" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">Natural landing screen</SelectItem>
											{availableMockSteps.map(step => (
												<SelectItem key={step} value={step}>
													{step}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{currentMockStep !== null && (
										<button type="button" onClick={() => applyMockStep(scenario, null)} className="h-7 rounded border border-border px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground" data-testid="mock-step-clear">
											Clear
										</button>
									)}
								</div>
							</section>
						)}

						{grouped.map(({group, scenarios}) => (
							<section key={group} className="mb-4 last:mb-0">
								<h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{group}</h3>

								{group === 'Playlist' && (
									<div className="mb-2">
										<p className="mb-1.5 text-[10px] text-muted-foreground">Count — playlist probe with N items</p>
										<form onSubmit={handlePlaylistSubmit} className="flex items-center gap-1.5">
											<input
												type="number"
												min={1}
												aria-label="Playlist item count"
												placeholder="e.g. 50"
												value={playlistInput}
												onChange={e => setPlaylistInput(e.target.value)}
												className={cn('h-7 w-20 rounded border bg-muted/20 px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]', isPlaylistParam ? 'border-[var(--brand)]' : 'border-border')}
												data-testid="playlist-count-input"
											/>
											<button type="submit" className="h-7 rounded border border-border px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground">
												Go
											</button>
											{PLAYLIST_PRESETS.map(count => (
												<button
													key={count}
													type="button"
													onClick={() => {
														setPlaylistInput(String(count))
														applyPlaylistCount(count)
													}}
													className={cn('h-7 rounded border px-2 text-[10px] font-medium transition-colors', urlParams.playlistCount === count ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
													data-testid={`playlist-preset-${count}`}
												>
													{count}
												</button>
											))}
										</form>
									</div>
								)}

								{group === 'Probe Errors' && (
									<div className="mb-2">
										<p className="mb-1.5 text-[10px] text-muted-foreground">Error kind — all YtDlpErrorKind values</p>
										<div className="flex items-center gap-1.5">
											<Select value={urlParams.probeErrorKind ?? ''} onValueChange={v => applyProbeErrorKind(v === '' ? null : (v as YtDlpErrorKind))}>
												<SelectTrigger size="sm" className={cn('flex-1 text-[11px]', isProbeErrorParam ? 'border-[var(--brand)]' : '')} data-testid="probe-error-kind-select">
													<SelectValue placeholder="— pick an error kind —" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="">— pick an error kind —</SelectItem>
													{YT_DLP_ERROR_KINDS.map(kind => (
														<SelectItem key={kind} value={kind}>
															{kind}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isProbeErrorParam && (
												<button type="button" onClick={() => applyProbeErrorKind(null)} className="h-7 rounded border border-border px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground" data-testid="probe-error-clear">
													Clear
												</button>
											)}
										</div>
									</div>
								)}

								{scenarios.length > 0 && (
									<div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
										{scenarios.map(candidate => {
											const active = !isPlaylistParam && !isProbeErrorParam && candidate.id === scenario.id
											return (
												<button
													key={candidate.id}
													type="button"
													onClick={() => applyScenario(candidate.id)}
													className={cn('min-h-16 rounded-md border p-2 text-left transition-colors', active ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-foreground' : 'border-border bg-muted/20 text-muted-foreground hover:border-[var(--border-strong)] hover:text-foreground')}
													data-testid={`scenario-button-${candidate.id}`}
													aria-pressed={active}
												>
													<span className="block truncate text-[12px] font-semibold">{candidate.title}</span>
													<span className="mt-1 block line-clamp-2 text-[10px] leading-snug">{candidate.description}</span>
												</button>
											)
										})}
									</div>
								)}
							</section>
						))}
					</div>
				</div>
			)}
		</aside>
	)
}

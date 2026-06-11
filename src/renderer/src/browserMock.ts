import type {AppApi} from '@shared/api.js'
import type {AppSettings, DependencyDiagnostic, DependencyId, ProbeProgressEvent, ProgressEvent, QueueItem, StatusEvent, UpdateAvailablePayload, WarmUpOutput, WarmupProgressEvent} from '@shared/types.js'
import {QUEUE_STATUS, STATUS_KEY, YT_DLP_ERROR_KINDS, type YtDlpErrorKind} from '@shared/schemas.js'
import {BROWSER_MOCK_LAUNCH_MODES, buildScenarioAppApiState, getScenario, normalVideoProbe, playlistProbe, readScenarioIdFromUrl, readUrlParams, shouldMockEmptyPlaylistScopeReload, shouldShowBrowserMockStartupSplash, type BrowserMockLaunchMode, type BrowserMockScenario} from './dev/browserMockScenarios.js'
import {applyThemeLive, readKnobs, RTL_LANGS} from './dev/browserMockKnobs.js'
import {buildProbeErrorForKind} from './dev/scenarios/probeScenarios.js'

const BROWSER_MOCK_LAUNCH_STORAGE_KEY = 'arroxy:browserMockLaunch'

function isBrowserMockLaunchMode(value: string | null): value is BrowserMockLaunchMode {
	return value != null && (BROWSER_MOCK_LAUNCH_MODES as readonly string[]).includes(value)
}

export function parseBrowserMockLaunchMode(search: string, storageValue: string | null): BrowserMockLaunchMode {
	const queryValue = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('mockLaunch')
	if (isBrowserMockLaunchMode(queryValue)) return queryValue
	if (isBrowserMockLaunchMode(storageValue)) return storageValue
	return 'ready'
}

function readBrowserMockLaunchMode(): BrowserMockLaunchMode {
	try {
		return parseBrowserMockLaunchMode(window.location.search, window.localStorage.getItem(BROWSER_MOCK_LAUNCH_STORAGE_KEY))
	} catch {
		return 'ready'
	}
}

function readBrowserMockScenario(): BrowserMockScenario {
	try {
		return getScenario(readScenarioIdFromUrl(window.location))
	} catch {
		return getScenario(null)
	}
}

function looksLikeUrl(input: string): boolean {
	try {
		const u = new URL(input)
		return u.protocol === 'http:' || u.protocol === 'https:'
	} catch {
		return false
	}
}

function shouldMockPlaylistProbe(input: {url: string; playlistMode?: 'auto' | 'video' | 'playlist'}): boolean {
	if (input.playlistMode === 'playlist') return true
	if (input.playlistMode === 'video') return false
	try {
		const url = new URL(input.url)
		const host = url.hostname.toLowerCase().replace(/^www\./, '')
		if (url.searchParams.get('playlist') === '1') return true
		if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) {
			if (url.pathname.startsWith('/playlist')) return true
			if (!url.searchParams.has('v') && url.searchParams.has('list')) return true
		}
		return false
	} catch {
		return false
	}
}

function mockPlaylistItemCount(url: string): number {
	try {
		const raw = new URL(url).searchParams.get('items')
		const parsed = Number(raw)
		return Number.isInteger(parsed) && parsed > 0 ? parsed : 12
	} catch {
		return 12
	}
}

function mockProbeErrorKind(url: string): YtDlpErrorKind | null {
	try {
		const raw = new URL(url).searchParams.get('mockProbeError')
		return raw !== null && (YT_DLP_ERROR_KINDS as readonly string[]).includes(raw) ? (raw as YtDlpErrorKind) : null
	} catch {
		return null
	}
}

export function installBrowserMock(): void {
	if ('appApi' in window) return

	const knobs = readKnobs(location)
	const launchMode = readBrowserMockLaunchMode()
	const scenarioState = buildScenarioAppApiState(readBrowserMockScenario(), readUrlParams(location), knobs)
	;(window as Window & {__arroxyBrowserMockShowStartupSplash?: boolean}).__arroxyBrowserMockShowStartupSplash = shouldShowBrowserMockStartupSplash({launchMode, warmUp: scenarioState.warmUp})

	// Apply theme immediately so the first render uses the right colour scheme.
	applyThemeLive(knobs.theme)

	// Expose mock platform so UpdateBanner, TitleBar, etc. behave as if running
	// on the selected OS. Falls back to 'linux' so browser-mock always has a value.
	;(window as Window & {platform: string}).platform = knobs.platform ?? 'linux'

	// RTL direction for locale knob.
	if (knobs.locale !== null) {
		document.documentElement.dir = RTL_LANGS.has(knobs.locale) ? 'rtl' : 'ltr'
	}

	const statusListeners = new Set<(e: StatusEvent) => void>()
	const progressListeners = new Set<(e: ProgressEvent) => void>()
	const probeProgressListeners = new Set<(e: ProbeProgressEvent) => void>()
	const updateListeners = new Set<(info: UpdateAvailablePayload) => void>()
	const warmupProgressListeners = new Set<(e: WarmupProgressEvent) => void>()
	const clipboardUrlListeners = new Set<(url: string) => void>()
	const queueSnapshotListeners = new Set<(items: QueueItem[]) => void>()
	const queueAddedListeners = new Set<(event: {items: QueueItem[]; atIdx: number}) => void>()
	const queueUpdatedListeners = new Set<(event: {item: QueueItem}) => void>()
	const queueRemovedListeners = new Set<(event: {itemId: string}) => void>()
	const queueItems: QueueItem[] = [...scenarioState.queueItems]
	const queueItemById = new Map(queueItems.map(item => [item.id, item]))
	let queueRunning = false
	let warmupCallCount = 0

	let settings: AppSettings = scenarioState.settings

	;(window as Window & {__arroxyMockEmitClipboardUrl?: (url: string) => void}).__arroxyMockEmitClipboardUrl = url => {
		clipboardUrlListeners.forEach(listener => listener(url))
	}

	function emitScenarioUpdate(listener: (info: UpdateAvailablePayload) => void): void {
		if (scenarioState.update === null) return
		listener(scenarioState.update)
	}

	function delay(ms: number): Promise<void> {
		return new Promise(r => setTimeout(r, ms))
	}

	function jobId(): string {
		return `mock-${Date.now()}`
	}

	async function simulateDownload(id: string, shouldError: boolean): Promise<void> {
		await delay(400)

		const stages: {stage: StatusEvent['stage']; key: StatusEvent['statusKey']}[] = [
			{stage: 'setup', key: 'preparingBinaries'},
			{stage: 'token', key: 'mintingToken'},
			{stage: 'download', key: 'startingYtdlp'}
		]
		for (const {stage, key} of stages) {
			statusListeners.forEach(l => l({jobId: id, stage, statusKey: key, at: new Date().toISOString()}))
			await delay(300)
		}

		if (shouldError) {
			await delay(600)
			statusListeners.forEach(l => l({jobId: id, stage: 'error', statusKey: 'ytdlpExitCode', params: {code: 1}, error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}, at: new Date().toISOString()}))
			return
		}

		// Simulate yt-dlp progress lines
		const steps = [
			{pct: 5, line: '[download]   5.0% of ~142.30MiB at  3.21MiB/s ETA 00:43'},
			{pct: 18, line: '[download]  18.2% of ~142.30MiB at  4.87MiB/s ETA 00:35'},
			{pct: 34, line: '[download]  34.1% of ~142.30MiB at  5.10MiB/s ETA 00:26'},
			{pct: 51, line: '[download]  51.3% of ~142.30MiB at  4.93MiB/s ETA 00:19'},
			{pct: 67, line: '[download]  67.5% of ~142.30MiB at  5.22MiB/s ETA 00:12'},
			{pct: 82, line: '[download]  82.8% of ~142.30MiB at  5.01MiB/s ETA 00:06'},
			{pct: 95, line: '[download]  95.4% of ~142.30MiB at  4.78MiB/s ETA 00:01'},
			{pct: 100, line: '[download] 100% of ~142.30MiB in 00:28'}
		]

		for (const step of steps) {
			progressListeners.forEach(l => l({jobId: id, line: step.line, percent: step.pct, at: new Date().toISOString()}))
			await delay(500)
		}

		statusListeners.forEach(l => l({jobId: id, stage: 'done', statusKey: 'complete', at: new Date().toISOString()}))
	}

	function emitQueueUpdated(item: QueueItem): void {
		queueUpdatedListeners.forEach(listener => listener({item}))
	}

	function setQueueItem(nextItem: QueueItem): void {
		const index = queueItems.findIndex(item => item.id === nextItem.id)
		if (index < 0) return
		queueItems[index] = nextItem
		queueItemById.set(nextItem.id, nextItem)
		emitQueueUpdated(nextItem)
	}

	function removeQueueItem(itemId: string): void {
		const index = queueItems.findIndex(item => item.id === itemId)
		if (index < 0) return
		queueItems.splice(index, 1)
		queueItemById.delete(itemId)
		queueRemovedListeners.forEach(listener => listener({itemId}))
	}

	function maybeStartNextQueueItem(): void {
		if (queueRunning) return
		const next = queueItems.find(item => item.status === QUEUE_STATUS.pending)
		if (!next) return
		queueRunning = true
		void simulateQueueItem(next)
	}

	async function simulateQueueItem(item: QueueItem): Promise<void> {
		let current: QueueItem = {...item, status: QUEUE_STATUS.running, progressPercent: 0, progressDetail: 'Starting yt-dlp', lastStatus: {key: STATUS_KEY.startingYtdlp}}
		setQueueItem(current)

		const steps = [8, 21, 38, 54, 71, 88, 100]
		for (const percent of steps) {
			await delay(250)
			const stillCurrent = queueItemById.get(item.id)
			if (stillCurrent?.status !== QUEUE_STATUS.running) {
				queueRunning = false
				maybeStartNextQueueItem()
				return
			}
			current = {...stillCurrent, progressPercent: percent, progressDetail: percent >= 100 ? 'Finalizing' : `Downloading ${percent}%`, lastStatus: {key: percent >= 100 ? STATUS_KEY.complete : STATUS_KEY.startingYtdlp}}
			setQueueItem(current)
		}

		const finished: QueueItem = {...current, status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, lastStatus: {key: STATUS_KEY.complete}, finishedAt: new Date().toISOString()}
		setQueueItem(finished)
		queueRunning = false
		maybeStartNextQueueItem()
	}

	const mock: AppApi = {
		app: {
			warmUp: async input => {
				warmupCallCount += 1
				const force = input?.force === true
				const allRunnable: Record<DependencyId, DependencyDiagnostic> = {
					'yt-dlp': {id: 'yt-dlp', state: 'runnable', source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'mock'}, resolvedPath: '/mock/yt-dlp', attempts: []},
					ffmpeg: {id: 'ffmpeg', state: 'runnable', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: '/mock/ffmpeg', attempts: []},
					ffprobe: {id: 'ffprobe', state: 'runnable', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: '/mock/ffprobe', attempts: []},
					deno: {id: 'deno', state: 'runnable', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: '/mock/deno', attempts: []}
				}

				if (launchMode !== 'ready') {
					const binaries: {name: DependencyId; size: number}[] = [
						{name: 'yt-dlp', size: 12 * 1024 * 1024},
						{name: 'ffmpeg', size: 80 * 1024 * 1024},
						{name: 'ffprobe', size: 30 * 1024 * 1024},
						{name: 'deno', size: 95 * 1024 * 1024}
					]
					for (const {name, size} of binaries) {
						const steps = 10
						for (let i = 1; i <= steps; i++) {
							await delay(120)
							warmupProgressListeners.forEach(l => l({binary: name, phase: 'downloading', bytesDownloaded: Math.round((size / steps) * i), totalBytes: size}))
						}
						warmupProgressListeners.forEach(l => l({binary: name, phase: 'done', bytesDownloaded: size, totalBytes: size}))
					}
				}

				if (launchMode === 'cold-error' && !force && warmupCallCount === 1) {
					const blocked: Record<DependencyId, DependencyDiagnostic> = {
						...allRunnable,
						'yt-dlp': {id: 'yt-dlp', state: 'failed', source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'mock'}, resolvedPath: null, failure: {kind: 'blocked_or_quarantined', message: 'SmartScreen blocked the download'}, attempts: []}
					}
					const result: WarmUpOutput = {completed: false, dependencies: blocked, blockingFailures: ['yt-dlp'], cancelled: false}
					return {ok: true, data: result}
				}

				const result: WarmUpOutput = force ? {completed: true, dependencies: allRunnable, blockingFailures: [], cancelled: false} : scenarioState.warmUp
				return {ok: true, data: result}
			},
			cancelWarmup: async () => {
				/* no-op in browser */
			},
			installYtDlpWithHomebrew: async () => {
				await delay(800)
				return {ok: true, data: {installedPath: '/opt/homebrew/bin/yt-dlp'}}
			},
			installYtDlpWithWinget: async () => {
				await delay(800)
				return {ok: true, data: {installedPath: 'C:\\Users\\mock\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe'}}
			},
			setLanguage: async () => {
				/* no-op in browser */
			}
		},

		window: {
			minimize: async () => {
				/* no-op in browser */
			},
			maximize: async () => {
				/* no-op in browser */
			},
			close: async () => {
				/* no-op in browser */
			},
			isMaximized: () => Promise.resolve(false),
			onMaximizedChange: () => () => undefined
		},

		downloads: {
			probeCancel: async () => {
				/* no-op in browser */
			},
			probe: async input => {
				if (!looksLikeUrl(input.url)) {
					return {ok: false, error: {kind: 'other', code: 'invalid_url', message: 'Not a valid http(s) URL'}}
				}

				const probeErrorKind = mockProbeErrorKind(input.url)
				if (probeErrorKind !== null) {
					return {ok: false, error: buildProbeErrorForKind(probeErrorKind)}
				}

				if (shouldMockEmptyPlaylistScopeReload(scenarioState.scenario, input.playlistMode, input.playlistScope)) {
					return {ok: false, error: {kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}}
				}

				if (shouldMockPlaylistProbe(input)) {
					const itemCount = mockPlaylistItemCount(input.url)
					await delay(1400)
					return {ok: true, data: playlistProbe(itemCount, {webpageUrl: input.url})}
				}

				if (scenarioState.probeResult) {
					await delay(1400)
					return {ok: true, data: {...scenarioState.probeResult, webpageUrl: input.url}}
				}

				// Visual harness: append `?fail=1` to a URL to simulate a hard
				// probe failure (drives the wizard error step + CookiesErrorAlert).
				// Combine with `&bot=1` to simulate a bot-wall hard fail so the
				// BotWallNotice (forceShow on StepError) renders alongside. Combine
				// with `&dpapi=1` to simulate the Chrome 127+ App-Bound Encryption
				// failure so the DPAPI variant of CookiesErrorAlert renders.
				if (/[?&]fail=1\b/.test(input.url)) {
					const isBot = /[?&]bot=1\b/.test(input.url)
					const isDpapi = /[?&]dpapi=1\b/.test(input.url)
					if (isDpapi) {
						return {ok: false, error: {kind: 'ytdlp', error: {kind: 'unknown', raw: 'ERROR: Failed to decrypt with DPAPI. See https://github.com/yt-dlp/yt-dlp/issues/10927 for more info'}}}
					}
					if (isBot) {
						return {ok: false, error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: "ERROR: [youtube] x: Sign in to confirm you're not a bot. Use --cookies-from-browser …"}}}
					}
					return {ok: false, error: {kind: 'ytdlp', error: {kind: 'unavailable', raw: 'ERROR: [youtube] dQw4w9WgXcQ: Video unavailable. The uploader has not made this video available in your country.'}}}
				}

				// Visual harness: append `?bot=1` to a URL to simulate the bot-wall
				// degraded probe (signal-only, no count truncation). Used to render
				// the BotWallNotice variants in the renderer dev server.
				const simulateBotWall = /[?&]bot=1\b/.test(input.url)

				await delay(1400)
				return {ok: true, data: normalVideoProbe({webpageUrl: input.url, degraded: simulateBotWall ? {reasons: ['botWall' as const]} : undefined})}
			},

			start: input => {
				const id = jobId()
				const shouldError = input.url.toLowerCase().includes('error')
				void simulateDownload(id, shouldError)
				return Promise.resolve({ok: true, data: {job: {id, url: input.url, outputDir: input.outputDir ?? settings.common.defaultOutputDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}}} as const)
			},

			cancel: () => Promise.resolve({ok: true, data: {cancelled: true}} as const),

			pause: () => Promise.resolve({ok: true, data: {paused: true}} as const),

			resume: () => Promise.resolve({ok: true, data: {resumed: false}} as const)
		},

		settings: {
			get: async () => {
				await delay(80)
				return {ok: true, data: {...settings}}
			},
			update: patch => {
				settings = {common: {...settings.common, ...(patch.common ?? {})}, single: {...settings.single, ...(patch.single ?? {})}, playlist: {...settings.playlist, ...(patch.playlist ?? {})}, profiles: {...settings.profiles, ...(patch.profiles ?? {})}}
				return Promise.resolve({ok: true, data: {...settings}} as const)
			}
		},

		shell: {
			openFolder: path => {
				console.log('[mock] openFolder', path)
				return Promise.resolve({ok: true, data: {opened: true}} as const)
			},
			openExternal: url => {
				window.open(url, '_blank', 'noopener')
				return Promise.resolve({ok: true, data: {opened: true}} as const)
			},
			openBinariesDir: () => {
				console.log('[mock] openBinariesDir')
				return Promise.resolve({ok: true, data: {opened: true}} as const)
			}
		},

		logs: {
			openDir: () => {
				console.log('[mock] openDir')
				return Promise.resolve({ok: true, data: {opened: true}} as const)
			},
			uploadFeedbackDiagnostic: input => {
				console.log('[mock] uploadFeedbackDiagnostic', input.reportId)
				return Promise.resolve({ok: true, data: {reportId: input.reportId, diagnosticUrl: null, rawBytes: 128_000, compressedBytes: 32_000, truncated: false, sha256: 'mock-diagnostic-sha256'}} as const)
			}
		},

		dialog: {
			chooseFolder: async () => {
				const paths = ['/home/user/Downloads', '/home/user/Videos', '/home/user/Desktop', '/tmp/arroxy-downloads']
				const path = paths[Math.floor(Math.random() * paths.length)]
				await delay(200)
				return {ok: true, data: {path}}
			},
			chooseFile: async () => {
				await delay(200)
				return {ok: true, data: {path: '/home/user/youtube-cookies.txt'}}
			},
			chooseExecutable: async binary => {
				await delay(200)
				return {ok: true, data: {path: `/usr/local/bin/${binary}`}}
			}
		},

		events: {
			onStatus: listener => {
				statusListeners.add(listener)
				return () => statusListeners.delete(listener)
			},
			onProgress: listener => {
				progressListeners.add(listener)
				return () => progressListeners.delete(listener)
			},
			onProbeProgress: listener => {
				probeProgressListeners.add(listener)
				return () => probeProgressListeners.delete(listener)
			},
			onClipboardUrl: listener => {
				clipboardUrlListeners.add(listener)
				return () => clipboardUrlListeners.delete(listener)
			},
			onWarmupProgress: listener => {
				warmupProgressListeners.add(listener)
				return () => warmupProgressListeners.delete(listener)
			}
		},

		queue: {
			cmd: {
				add: items => {
					const atIdx = queueItems.length
					queueItems.push(...items)
					for (const item of items) queueItemById.set(item.id, item)
					queueAddedListeners.forEach(listener => listener({items, atIdx}))
					maybeStartNextQueueItem()
					return Promise.resolve({ok: true, data: {ids: items.map(item => item.id)}} as const)
				},
				getSnapshot: () => Promise.resolve({ok: true, data: [...queueItems]} as const),
				start: ({itemId}) => {
					const item = queueItemById.get(itemId)
					if (item && item.status !== QUEUE_STATUS.done && item.status !== QUEUE_STATUS.cancelled) {
						setQueueItem({...item, status: QUEUE_STATUS.pending})
						maybeStartNextQueueItem()
					}
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				pause: ({itemId}) => {
					const item = queueItemById.get(itemId)
					if (item?.status === QUEUE_STATUS.running) setQueueItem({...item, status: QUEUE_STATUS.pausedActive})
					else if (item?.status === QUEUE_STATUS.pending) setQueueItem({...item, status: QUEUE_STATUS.pausedHeld})
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				resume: ({itemId}) => {
					const item = queueItemById.get(itemId)
					if (item?.status === QUEUE_STATUS.pausedActive || item?.status === QUEUE_STATUS.pausedHeld) {
						setQueueItem({...item, status: QUEUE_STATUS.pending})
						maybeStartNextQueueItem()
					}
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				cancel: ({itemId}) => {
					const targets = itemId === null ? [...queueItems] : [queueItemById.get(itemId)].filter((item): item is QueueItem => item !== undefined)
					targets.forEach(item => setQueueItem({...item, status: QUEUE_STATUS.cancelled, progressDetail: null, finishedAt: new Date().toISOString()}))
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				retry: () => Promise.resolve({ok: true, data: undefined} as const),
				clearCompleted: () => {
					for (const item of [...queueItems]) {
						if (item.status === QUEUE_STATUS.done) removeQueueItem(item.id)
					}
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				remove: ({itemId}) => {
					removeQueueItem(itemId)
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				setLane: ({itemId, lane}) => {
					const item = queueItemById.get(itemId)
					if (item) setQueueItem({...item, lane})
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				pauseAll: () => {
					for (const item of queueItems) {
						if (item.status === QUEUE_STATUS.running) setQueueItem({...item, status: QUEUE_STATUS.pausedActive})
					}
					return Promise.resolve({ok: true, data: undefined} as const)
				},
				resumeAll: () => {
					for (const item of queueItems) {
						if (item.status === QUEUE_STATUS.pausedActive || item.status === QUEUE_STATUS.pausedHeld) setQueueItem({...item, status: QUEUE_STATUS.pending})
					}
					maybeStartNextQueueItem()
					return Promise.resolve({ok: true, data: undefined} as const)
				}
			},
			events: {
				onSnapshot: listener => {
					queueSnapshotListeners.add(listener)
					return () => queueSnapshotListeners.delete(listener)
				},
				onAdded: listener => {
					queueAddedListeners.add(listener)
					return () => queueAddedListeners.delete(listener)
				},
				onUpdated: listener => {
					queueUpdatedListeners.add(listener)
					return () => queueUpdatedListeners.delete(listener)
				},
				onRemoved: listener => {
					queueRemovedListeners.add(listener)
					return () => queueRemovedListeners.delete(listener)
				}
			}
		},

		updater: {
			onUpdateAvailable: listener => {
				updateListeners.add(listener)
				if (scenarioState.update) {
					window.setTimeout(() => emitScenarioUpdate(listener), 200)
				}
				return () => updateListeners.delete(listener)
			},
			install: async () => {
				await delay(2_000)
				console.log('[mock] updater: install complete (would quit in real app)')
				return {ok: true} as const
			}
		},

		analytics: {track: (name, props) => console.log('[mock] analytics', name, props)},

		diagnostics: {logWizardStep: snapshot => console.log('[mock] wizard step', snapshot)},

		playlist: {
			scanFolder: async () => {
				await delay(150)
				return {ok: true as const, data: {matchedIds: []}}
			},
			registerManifest: () => Promise.resolve({ok: true as const, data: undefined})
		}
	}

	;(window as unknown as {appApi: AppApi}).appApi = mock
	;(window as unknown as {appVersion: string}).appVersion = '0.0.0-dev'
}

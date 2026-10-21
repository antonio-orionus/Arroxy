import type {Result} from './result.js'
import type {SupportedLang} from './i18n/types.js'
import type {
	AppSettings,
	CancelDownloadInput,
	CancelDownloadOutput,
	CommonSettings,
	DependencyId,
	DownloadJob,
	DownloadProfilesPrefs,
	ExploreLinkAction,
	ExploreNavigateCommand,
	ExploreViewBounds,
	ExploreViewState,
	FeedbackDiagnosticUpload,
	GraphicsPolicy,
	HotkeyOutcomeEvent,
	HotkeyOutcomePayload,
	HotkeyState,
	HotkeyTriggerPayload,
	LocalizedError,
	PauseDownloadInput,
	PauseDownloadOutput,
	PlaylistPrefs,
	ProbeError,
	ProbeInput,
	ProbeProgressEvent,
	ProbeResult,
	ProgressEvent,
	SiteCooldown,
	QueueSelectionAction,
	QueueSelectionCommandResult,
	QueueOutputTargetChangeResult,
	QueueItem,
	QueueLane,
	QueueSnapshotPayload,
	QueueSchedulerEventPayload,
	StartDownloadInput,
	StartDownloadOutput,
	StatusEvent,
	UpdateAvailablePayload,
	UpdateInstallResult,
	WarmUpOutput,
	WarmupProgressEvent,
	WizardStepSnapshot
} from './types.js'
import type {PlaylistManifest} from './playlistManifest.js'
import type {JobAuth, QueueChoice} from './schemas.js'

export interface SettingsPatch {
	common?: Partial<CommonSettings>
	playlist?: Partial<PlaylistPrefs>
	profiles?: Partial<DownloadProfilesPrefs>
}

export interface WindowApi {
	minimize(): Promise<void>
	maximize(): Promise<void>
	close(): Promise<void>
	isMaximized(): Promise<boolean>
	onMaximizedChange(listener: (isMaximized: boolean) => void): () => void
}

export interface AppApi {
	app: {
		warmUp(input?: {force?: boolean}): Promise<Result<WarmUpOutput>>
		cancelWarmup(): Promise<void>
		getGraphicsPolicy(): Promise<Result<GraphicsPolicy>>
		installYtDlpWithHomebrew(): Promise<Result<{installedPath: string}>>
		installYtDlpWithWinget(): Promise<Result<{installedPath: string}>>
		installFfmpegWithHomebrew(): Promise<Result<{ffmpegPath: string; ffprobePath: string}>>
		installFfmpegWithWinget(): Promise<Result<{ffmpegPath: string; ffprobePath: string}>>
		setLanguage(language: SupportedLang): Promise<void>
	}
	window: WindowApi
	downloads: {
		probe(input: ProbeInput): Promise<Result<ProbeResult, ProbeError>>
		probeCancel(): Promise<void>
		start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>>
		cancel(input?: CancelDownloadInput): Promise<Result<CancelDownloadOutput>>
		pause(input?: PauseDownloadInput): Promise<Result<PauseDownloadOutput>>
		resume(input: {jobId: string}): Promise<Result<{resumed: boolean; job?: DownloadJob}>>
	}
	settings: {get(): Promise<Result<AppSettings>>; update(input: SettingsPatch): Promise<Result<AppSettings>>}
	hotkey: {reportOutcome(input: HotkeyOutcomePayload): Promise<Result<void>>; getState(): Promise<Result<HotkeyState>>; testPress(): Promise<Result<void>>; rendererReady(): Promise<Result<void>>}
	// The renderer listens for arroxy:// links (onOpenedLink); main holds them until then.
	links: {rendererReady(): Promise<Result<void>>}
	shell: {openFolder(path?: string): Promise<Result<{opened: boolean}>>; openExternal(url: string): Promise<Result<{opened: boolean}>>; openBinariesDir(): Promise<Result<{opened: boolean}>>}
	logs: {openDir(): Promise<Result<{opened: boolean}>>; uploadFeedbackDiagnostic(input: {reportId: string}): Promise<Result<FeedbackDiagnosticUpload>>; saveDiagnostics(): Promise<Result<{path: string}>>}
	dialog: {chooseFolder(defaultPath?: string): Promise<Result<{path: string | null}>>; chooseFile(): Promise<Result<{path: string | null}>>; chooseExecutable(binary: DependencyId): Promise<Result<{path: string | null}>>}
	events: {
		onStatus(listener: (event: StatusEvent) => void): () => void
		onProgress(listener: (event: ProgressEvent) => void): () => void
		onProbeProgress(listener: (event: ProbeProgressEvent) => void): () => void
		onClipboardUrl(listener: (url: string) => void): () => void
		onOpenedLink(listener: (url: string) => void): () => void
		onHotkeyTrigger(listener: (trigger: HotkeyTriggerPayload) => void): () => void
		onHotkeyOutcome(listener: (event: HotkeyOutcomeEvent) => void): () => void
		// Untrusted until parsed with `menuActionSchema`.
		onMenuAction(listener: (payload: unknown) => void): () => void
		onWarmupProgress(listener: (event: WarmupProgressEvent) => void): () => void
	}
	queue: {
		cmd: {
			// `skippedAlreadyQueued`: rows left out because their video is already live.
			add(items: QueueItem[]): Promise<Result<{ids: string[]; skippedAlreadyQueued: number}>>
			getSnapshot(): Promise<Result<QueueSnapshotPayload>>
			probeFailed(input: {itemId: string; error: LocalizedError; auth?: JobAuth}): Promise<Result<void>>
			// A probing placeholder waits for the user's choice (see QueueProbeLifecycle).
			needsChoice(input: {itemId: string; choice: QueueChoice; title: string}): Promise<Result<void>>
			// A probe-error or needs-choice placeholder goes back to probing.
			reprobe(input: {itemId: string}): Promise<Result<void>>
			start(input: {itemId: string}): Promise<Result<void>>
			pause(input: {itemId: string}): Promise<Result<void>>
			resume(input: {itemId: string}): Promise<Result<void>>
			cancel(input: {itemId: string | null}): Promise<Result<void>>
			retry(input: {itemId: string}): Promise<Result<void>>
			clearCompleted(): Promise<Result<void>>
			remove(input: {itemId: string}): Promise<Result<void>>
			// Atomic probe-stage swap: replaces a live placeholder (probing or
			// needs-choice) with the prepared items, or refuses (enqueueing
			// nothing) once it is gone. See QueueProbeLifecycle.
			// `skippedAlreadyQueued`: rows left out because their video is already live.
			replaceProbing(input: {itemId: string; items: QueueItem[]}): Promise<Result<{ids: string[]; skippedAlreadyQueued: number}>>
			setLane(input: {itemId: string; lane: QueueLane}): Promise<Result<void>>
			applySelectionAction(input: {action: QueueSelectionAction; itemIds: string[]}): Promise<Result<QueueSelectionCommandResult>>
			changeOutputTarget(input: {itemIds: string[]; outputDir: string}): Promise<Result<QueueOutputTargetChangeResult>>
			pauseAll(): Promise<Result<void>>
			resumeAll(): Promise<Result<void>>
		}
		events: {
			onSnapshot(listener: (event: QueueSnapshotPayload) => void): () => void
			onAdded(listener: (event: {items: QueueItem[]; atIdx: number}) => void): () => void
			onUpdated(listener: (event: {item: QueueItem}) => void): () => void
			onRemoved(listener: (event: {itemId: string}) => void): () => void
			onScheduler(listener: (event: QueueSchedulerEventPayload) => void): () => void
		}
	}
	explore: {
		navigate(command: ExploreNavigateCommand): Promise<Result<void>>
		setBounds(rect: ExploreViewBounds): Promise<Result<void>>
		setVisible(visible: boolean): Promise<Result<void>>
		setActive(active: boolean): Promise<Result<void>>
		signOut(): Promise<Result<void>>
		getState(): Promise<Result<ExploreViewState>>
		// A JPEG data URL of the shown page, or null when there is none to take.
		capture(): Promise<Result<string | null>>
		onStateChanged(listener: (state: ExploreViewState) => void): () => void
		// The pointer entered the native view (it never reports the toolbar's mouseleave).
		onPointerInView(listener: () => void): () => void
		// A pick in the page's link menu (main builds and shows the menu).
		onLinkAction(listener: (action: ExploreLinkAction) => void): () => void
	}
	// Rate-limit cooldowns on the current network route (see SiteRequestState).
	siteRequests: {
		getCooldowns(): Promise<Result<SiteCooldown[]>>
		// "Try now": the next request to `site` goes through its cooldown once.
		tryNow(site: string): Promise<Result<void>>
		onCooldownsChanged(listener: (cooldowns: SiteCooldown[]) => void): () => void
	}
	updater: {onUpdateAvailable(listener: (info: UpdateAvailablePayload) => void): () => void; install(): Promise<UpdateInstallResult>}
	diagnostics: {logWizardStep(snapshot: WizardStepSnapshot): void}
	playlist: {scanFolder(input: {outputDir: string; videoIds: string[]}): Promise<Result<{matchedIds: string[]}>>; registerManifest(manifest: PlaylistManifest): Promise<Result<void>>}
}

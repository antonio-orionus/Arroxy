// Every way the app quits passes this gate: the window's close button, Cmd+Q,
// the app and Dock menus, the tray, a crashed renderer's Quit, an update
// install and the end of the OS session. Quitting never cancels the queue: the
// gate saves it (QueueService.suspendForExit) and the next launch continues it.
// It asks first only when the user quits with downloads running; an OS
// shutdown or logout must not be held up by a dialog.
// No electron imports: index.ts wires the events.

export type QuitTrigger = 'user' | 'system'
export type QuitDecision = 'ask' | 'stop'

export function decideQuit({trigger, runningCount}: {trigger: QuitTrigger; runningCount: number}): QuitDecision {
	return trigger === 'user' && runningCount > 0 ? 'ask' : 'stop'
}

export interface QuitGateDeps {
	runningCount: () => number
	// Resolves true to quit, false to keep downloading.
	askToQuit: (runningCount: number) => Promise<boolean>
	suspendQueue: () => Promise<void>
	// Tray, hotkeys, clipboard watcher, token window: only once the quit is certain.
	dispose: () => void
	// app.quit(): the approved quit passes the gate and closes the windows.
	quit: () => void
	log: {info: (message: string, meta?: Record<string, unknown>) => void; warn: (message: string, meta?: Record<string, unknown>) => void}
	stopBudgetMs?: number
}

export interface QuitGate {
	// True once the queue is saved; the window close handler lets windows close then.
	readonly approved: boolean
	onBeforeQuit: (event: {preventDefault: () => void}) => void
	// The OS is shutting down or logging out: stop at once, never ask.
	sessionEnding: () => void
	// For an exit the gate does not drive (an update install): save and approve, without asking or quitting.
	prepareForExit: () => Promise<void>
}

const DEFAULT_STOP_BUDGET_MS = 5000

type Phase = 'open' | 'asking' | 'stopping' | 'approved'

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

export function createQuitGate(deps: QuitGateDeps): QuitGate {
	const budgetMs = deps.stopBudgetMs ?? DEFAULT_STOP_BUDGET_MS
	let phase: Phase = 'open'
	let stopped: Promise<void> | null = null

	function stop(): Promise<void> {
		stopped ??= (async () => {
			phase = 'stopping'
			let timer: ReturnType<typeof setTimeout> | undefined
			const budget = new Promise<'late'>(resolve => {
				timer = setTimeout(() => resolve('late'), budgetMs)
			})
			const saved = deps.suspendQueue().then(
				() => 'saved' as const,
				(error: unknown) => {
					deps.log.warn('Saving the queue before quitting failed', {error: errorMessage(error)})
					return 'saved' as const
				}
			)
			const outcome = await Promise.race([saved, budget])
			clearTimeout(timer)
			if (outcome === 'late') deps.log.warn('Saving the queue before quitting took too long; quitting anyway', {budgetMs})
			// A disposer that throws must not hold every later quit in `stopping`.
			try {
				deps.dispose()
			} catch (error) {
				deps.log.warn('Releasing app services before quitting failed', {error: errorMessage(error)})
			}
			phase = 'approved'
			deps.log.info('App shutting down')
		})()
		return stopped
	}

	async function stopAndQuit(): Promise<void> {
		await stop()
		deps.quit()
	}

	async function askThenQuit(runningCount: number): Promise<void> {
		phase = 'asking'
		let quit = false
		try {
			quit = await deps.askToQuit(runningCount)
		} catch (error) {
			deps.log.warn('Quit dialog failed; keeping the app open', {error: errorMessage(error)})
		}
		// The session may have ended while the dialog was open; that quit wins.
		if (phase !== 'asking') return
		if (!quit) {
			phase = 'open'
			return
		}
		await stopAndQuit()
	}

	return {
		get approved() {
			return phase === 'approved'
		},
		onBeforeQuit(event) {
			if (phase === 'approved') return
			event.preventDefault()
			if (phase !== 'open') return
			const runningCount = deps.runningCount()
			if (decideQuit({trigger: 'user', runningCount}) === 'ask') void askThenQuit(runningCount)
			else void stopAndQuit()
		},
		sessionEnding() {
			if (phase === 'approved' || phase === 'stopping') return
			deps.log.info('System session ending; saving the queue without asking')
			void stopAndQuit()
		},
		prepareForExit: stop
	}
}

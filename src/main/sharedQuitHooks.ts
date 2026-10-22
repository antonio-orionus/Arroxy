interface QuitEvent {
	preventDefault(): void
	readonly defaultPrevented: boolean
}

// Electron's app, as far as quitting goes.
export interface QuitHooks {
	on(event: 'before-quit', listener: (event: QuitEvent) => void): unknown
	on(event: 'will-quit', listener: (event: QuitEvent) => void): unknown
	exit(code: number): void
}

// Several holds stop a quit at will-quit (agent control closing its socket, a
// warmup report going out), each ending its hold with exit(0). Electron exits
// on the first call and cuts the others short, so through this adapter the app
// exits only once every hold that stopped the quit has called exit().
export function sharedQuitHooks(app: QuitHooks): QuitHooks {
	let holding = 0
	return {
		on(event: 'before-quit' | 'will-quit', listener: (event: QuitEvent) => void): unknown {
			// The quit gate's listener runs first (main/quitGate.ts) and holds every
			// quit while it asks or saves the queue; the user may keep the app open.
			// A hold starts only on the quit the gate lets through.
			if (event === 'before-quit')
				return app.on('before-quit', quitEvent => {
					if (!quitEvent.defaultPrevented) listener(quitEvent)
				})
			return app.on('will-quit', quitEvent => {
				let held = false
				listener({
					get defaultPrevented() {
						return quitEvent.defaultPrevented
					},
					preventDefault: () => {
						quitEvent.preventDefault()
						if (held) return
						held = true
						holding += 1
					}
				})
			})
		},
		exit(code: number): void {
			holding = Math.max(0, holding - 1)
			if (holding === 0) app.exit(code)
		}
	}
}

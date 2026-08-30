// Tracks the first `gpu-info-update` so the graphics policy knows whether
// `app.getGPUFeatureStatus()` is reporting settled values or startup defaults.
//
// The listener and the budget have to start at different times. Attaching the
// listener has to happen at module load, because the event can fire before
// `app.whenReady()` and a listener attached later would miss it outright. The
// budget, on the other hand, must not start until the app is ready — otherwise
// it is measuring "2.5s from process start", so a slow cold start can burn the
// whole budget before Chromium ever had a chance to report, and the policy is
// then built on a timeout that says nothing about the GPU.
//
// No electron imports — index.ts passes `app` in.

export interface GpuInfoEmitter {
	once(event: 'gpu-info-update', listener: () => void): unknown
	removeListener(event: 'gpu-info-update', listener: () => void): unknown
}

export interface GpuInfoReadinessWatch {
	/**
	 * Resolves true if the first `gpu-info-update` arrived, false if the budget
	 * expired first. Never settles until `startBudget` has been called, so every
	 * caller that awaits this must be downstream of app-ready.
	 */
	whenUpdated: Promise<boolean>
	/** Starts the budget clock. Call once, at app-ready. Later calls are ignored. */
	startBudget: (timeoutMs: number) => void
}

export function watchInitialGpuInfoUpdate(emitter: GpuInfoEmitter): GpuInfoReadinessWatch {
	let settled = false
	let timeout: ReturnType<typeof setTimeout> | undefined
	let resolveUpdated: (updated: boolean) => void = () => {}

	const finish = (updated: boolean): void => {
		if (settled) return
		settled = true
		if (timeout !== undefined) clearTimeout(timeout)
		emitter.removeListener('gpu-info-update', onUpdate)
		resolveUpdated(updated)
	}

	const onUpdate = (): void => finish(true)

	const whenUpdated = new Promise<boolean>(resolve => {
		resolveUpdated = resolve
	})

	emitter.once('gpu-info-update', onUpdate)

	return {
		whenUpdated,
		startBudget: (timeoutMs: number): void => {
			if (settled || timeout !== undefined) return
			timeout = setTimeout(() => finish(false), timeoutMs)
		}
	}
}

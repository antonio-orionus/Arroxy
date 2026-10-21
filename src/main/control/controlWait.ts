// `wait`: hold a request until its target reaches a state, listening to the
// sources that change it and never polling. Ends at the target, at the
// timeout with the target as it is, when the target is gone, or when the
// session closes; every listener and the timer go with it.

import type {ControlQueue} from './controlTypes.js'
import type {IntakeRegistry} from './IntakeRegistry.js'

// What moved: queue rows, or one intake.
export type WaitChange = {kind: 'rows'; itemIds: readonly string[]} | {kind: 'intake'; intakeId: string}

// One listener on the queue and the registry for every wait in the service,
// held only while a wait runs. Each wait filters for its own target, so a
// progress tick on one row re-reads no other wait's target.
export class WaitChanges {
	private readonly listeners = new Set<(change: WaitChange) => void>()
	private stop: (() => void) | null = null

	constructor(private readonly sources: {queue: Pick<ControlQueue, 'onChange'>; registry: Pick<IntakeRegistry, 'onChange'>}) {}

	listen(listener: (change: WaitChange) => void): () => void {
		this.listeners.add(listener)
		if (!this.stop) {
			const stops = [this.sources.queue.onChange(itemIds => this.tell({kind: 'rows', itemIds})), this.sources.registry.onChange(record => this.tell({kind: 'intake', intakeId: record.intakeId}))]
			this.stop = () => {
				for (const stop of stops) stop()
			}
		}
		return () => {
			this.listeners.delete(listener)
			if (this.listeners.size > 0 || !this.stop) return
			this.stop()
			this.stop = null
		}
	}

	private tell(change: WaitChange): void {
		for (const listener of [...this.listeners]) listener(change)
	}
}

export interface WaitWatch<T> {
	// The target now; undefined once it is gone.
	read(): T | undefined
	reached(target: T): boolean
	// Calls back on any change that may have moved the target.
	subscribe(onChange: () => void): () => void
}

export type WaitEnd<T> = {kind: 'reached' | 'timeout'; target: T} | {kind: 'gone'} | {kind: 'aborted'}

export function waitFor<T>(watch: WaitWatch<T>, timeoutMs: number, signal: AbortSignal): Promise<WaitEnd<T>> {
	return new Promise(resolve => {
		if (signal.aborted) {
			resolve({kind: 'aborted'})
			return
		}
		let ended = false
		let unsubscribe = (): void => undefined
		let timer: ReturnType<typeof setTimeout> | undefined
		const end = (result: WaitEnd<T>): void => {
			if (ended) return
			ended = true
			unsubscribe()
			clearTimeout(timer)
			signal.removeEventListener('abort', onAbort)
			resolve(result)
		}
		const onAbort = (): void => end({kind: 'aborted'})
		const look = (): void => {
			const target = watch.read()
			if (target === undefined) end({kind: 'gone'})
			else if (watch.reached(target)) end({kind: 'reached', target})
		}
		look()
		if (ended) return
		unsubscribe = watch.subscribe(look)
		signal.addEventListener('abort', onAbort, {once: true})
		timer = setTimeout(() => {
			const target = watch.read()
			end(target === undefined ? {kind: 'gone'} : {kind: 'timeout', target})
		}, timeoutMs)
	})
}

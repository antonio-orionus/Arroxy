// Paces every yt-dlp spawn that runs on the user's Explore session, so an
// escalation burst (a playlist hitting a sign-in wall) cannot hammer the site
// with one account: at most `maxConcurrent` signed-in spawns at once, starts at
// least `minSpacingMs` apart, and at most `perJobCap` spawns per job attempt.
// A slot is held for the whole spawn, so a long download keeps it.

import {setTimeout as sleep} from 'node:timers/promises'

export type SpawnGateRefusal = {kind: 'cap-exceeded'} | {kind: 'cancelled'}

export interface ExploreSpawnGateOptions {
	maxConcurrent?: number
	minSpacingMs?: number
	perJobCap?: number
	now?: () => number
	sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
}

export class ExploreSpawnGate {
	private readonly maxConcurrent: number
	private readonly minSpacingMs: number
	private readonly perJobCap: number
	private readonly now: () => number
	private readonly sleep: (ms: number, signal?: AbortSignal) => Promise<void>
	private active = 0
	private readonly waiters: Array<() => void> = []
	// Reserved at slot acquisition, so two spawns acquiring together are still staggered.
	private nextStartAt = Number.NEGATIVE_INFINITY
	private readonly spawnsByJob = new Map<string, number>()

	constructor(opts: ExploreSpawnGateOptions = {}) {
		this.maxConcurrent = Math.max(1, opts.maxConcurrent ?? 2)
		this.minSpacingMs = Math.max(0, opts.minSpacingMs ?? 5000)
		this.perJobCap = Math.max(1, opts.perJobCap ?? 6)
		this.now = opts.now ?? Date.now
		this.sleep = opts.sleep ?? ((ms, signal) => sleep(ms, undefined, {signal}))
	}

	async run<T>(jobId: string, fn: () => Promise<T>, signal?: AbortSignal): Promise<T | SpawnGateRefusal> {
		if (signal?.aborted) return {kind: 'cancelled'}
		const used = this.spawnsByJob.get(jobId) ?? 0
		if (used >= this.perJobCap) return {kind: 'cap-exceeded'}
		this.spawnsByJob.set(jobId, used + 1)
		if (!(await this.acquire(signal))) return this.refund(jobId)
		try {
			const startAt = Math.max(this.now(), this.nextStartAt)
			this.nextStartAt = startAt + this.minSpacingMs
			const wait = startAt - this.now()
			if (wait > 0) {
				try {
					await this.sleep(wait, signal)
				} catch (err) {
					if (!signal?.aborted) throw err
				}
			}
			if (signal?.aborted) return this.refund(jobId)
			return await fn()
		} finally {
			this.release()
		}
	}

	// A spawn cancelled before it ran does not count against its job.
	private refund(jobId: string): SpawnGateRefusal {
		const used = this.spawnsByJob.get(jobId) ?? 0
		if (used <= 1) this.spawnsByJob.delete(jobId)
		else this.spawnsByJob.set(jobId, used - 1)
		return {kind: 'cancelled'}
	}

	// The job attempt ended (finalized or dropped): its budget goes with it.
	resetJob(jobId: string): void {
		this.spawnsByJob.delete(jobId)
	}

	// Resolves true once a slot is held, false if the job was cancelled while waiting.
	private acquire(signal?: AbortSignal): Promise<boolean> {
		if (this.active < this.maxConcurrent) {
			this.active += 1
			return Promise.resolve(true)
		}
		return new Promise<boolean>(resolve => {
			const onAbort = (): void => {
				const index = this.waiters.indexOf(grant)
				if (index >= 0) this.waiters.splice(index, 1)
				resolve(false)
			}
			const grant = (): void => {
				signal?.removeEventListener('abort', onAbort)
				this.active += 1
				resolve(true)
			}
			this.waiters.push(grant)
			signal?.addEventListener('abort', onAbort, {once: true})
		})
	}

	private release(): void {
		this.active -= 1
		this.waiters.shift()?.()
	}
}

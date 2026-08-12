// Automatic-retry machinery for the queue. Owns the user's attempt budget and
// one pending timer per item, and is the only place that decides a failed item
// should try again on its own.
//
// Extracted from QueueService so the scheduler keeps its single
// responsibility: QueueService decides what runs now, this decides what gets a
// second chance later. It holds no queue state — every mutation goes back
// through the injected commit callbacks, so `commit()` remains the queue's
// only writer.

import log from 'electron-log/main.js'
import {decideAutoRetry} from '@shared/autoRetry.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import type {LocalizedError, QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

export interface QueueAutoRetryDeps {
	findItem: (itemId: string) => QueueItem | undefined
	patch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
	retryReset: (itemId: string) => void
}

export class QueueAutoRetry {
	private attempts = 0
	private readonly timers = new Map<string, NodeJS.Timeout>()

	constructor(private readonly deps: QueueAutoRetryDeps) {}

	// Lowering the budget — including to 0 — must cancel schedules it no longer
	// covers. Without this a timer armed under the old budget still fires and
	// restarts an item after the user turned automatic retries off.
	setAttempts(value: number, items: readonly QueueItem[] = []): void {
		this.attempts = Math.max(0, Math.trunc(value))
		logger.info('Auto-retry attempts changed', {autoRetryAttempts: this.attempts})
		for (const item of items) {
			if (!item.retryAt) continue
			if (this.stillEligible(item)) continue
			logger.info('Auto-retry schedule dropped — no longer within budget', {itemId: item.id, retryCount: item.retryCount, budget: this.attempts})
			this.clear(item.id)
			this.deps.patch(item.id, 'autoRetry:budgetShrank', prev => ({...prev, retryAt: undefined}))
		}
	}

	// An item already holds a consumed count, so it stays eligible only while
	// the budget still reaches it.
	private stillEligible(item: QueueItem): boolean {
		return this.attempts > 0 && (item.retryCount ?? 0) <= this.attempts
	}

	// Returns true when a retry was scheduled, so the caller can tell an
	// awaiting-retry failure apart from a terminal one.
	schedule(item: QueueItem, error: LocalizedError): boolean {
		const decision = decideAutoRetry(error.kind, item.retryCount ?? 0, this.attempts)
		if (!decision.retry) return false
		const retryAt = new Date(Date.now() + decision.delayMs).toISOString()
		this.deps.patch(item.id, `autoRetry:scheduled:${decision.attempt}`, prev => ({...prev, retryCount: decision.attempt, retryAt}))
		this.arm(item.id, decision.delayMs)
		logger.info('Auto-retry scheduled', {itemId: item.id, attempt: decision.attempt, of: this.attempts, delayMs: decision.delayMs, kind: error.kind})
		return true
	}

	clear(itemId: string): void {
		const timer = this.timers.get(itemId)
		if (!timer) return
		clearTimeout(timer)
		this.timers.delete(itemId)
	}

	clearAll(): void {
		for (const timer of this.timers.values()) clearTimeout(timer)
		this.timers.clear()
	}

	// Clears a scheduled retry and hands the item back its full budget. Used
	// when the user retries by hand: they intervened, so the item should not
	// inherit an exhausted count.
	reset(itemId: string): void {
		this.clear(itemId)
		this.deps.patch(itemId, 'retry:resetAutoRetry', prev => ({...prev, retryCount: 0, retryAt: undefined}))
	}

	// Re-arms retries that were pending when the app quit. Without this an item
	// persisted with `retryAt` would sit in error forever, having silently lost
	// the timer that was going to rescue it.
	rearmPersisted(items: readonly QueueItem[]): void {
		if (this.attempts <= 0) return
		const now = Date.now()
		for (const item of items) {
			if (item.status !== QUEUE_STATUS.error || !item.retryAt) continue
			const due = Date.parse(item.retryAt)
			const delay = Number.isFinite(due) ? Math.max(0, due - now) : 0
			logger.info('Auto-retry re-armed after restart', {itemId: item.id, delayMs: delay})
			this.arm(item.id, delay)
		}
	}

	private arm(itemId: string, delayMs: number): void {
		this.clear(itemId)
		const timer = setTimeout(() => {
			this.timers.delete(itemId)
			this.fire(itemId)
		}, delayMs)
		timer.unref?.()
		this.timers.set(itemId, timer)
	}

	private fire(itemId: string): void {
		const item = this.deps.findItem(itemId)
		// The user may have cancelled, removed, or manually retried in the
		// meantime — only an item still sitting in error is ours to resume.
		if (!item || item.status !== QUEUE_STATUS.error) return
		// Final guard: the budget may have shrunk between arming and firing.
		// setAttempts() cancels known schedules, but re-checking here means a
		// missed cancellation cannot resurrect a disabled retry.
		if (!this.stillEligible(item)) {
			logger.info('Auto-retry firing skipped — outside budget', {itemId, retryCount: item.retryCount, budget: this.attempts})
			this.deps.patch(itemId, 'autoRetry:outsideBudget', prev => ({...prev, retryAt: undefined}))
			return
		}
		logger.info('Auto-retry firing', {itemId, attempt: item.retryCount})
		// retry-reset preserves resumeContext, so the respawn picks up existing
		// .part files instead of starting the transfer over.
		this.deps.patch(itemId, 'autoRetry:clearSchedule', prev => ({...prev, retryAt: undefined}))
		this.deps.retryReset(itemId)
	}
}

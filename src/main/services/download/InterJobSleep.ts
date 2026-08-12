// Inter-job sleep window for the normal lane. Owns the "not before" instant
// and the single timer that wakes the scheduler when it expires.
//
// Extracted from QueueService so the scheduler reads as one decision loop
// rather than a decision loop interleaved with timer bookkeeping. Holds no
// queue state: it only answers "is the normal lane allowed to spawn yet?" and
// calls back when that answer changes.
//
// Priority-lane spawns ignore this entirely — the user asked for that item now.

import {INTER_JOB_SLEEP_MS} from '@shared/constants.js'

export class InterJobSleep {
	private until = 0
	private timer: NodeJS.Timeout | null = null

	// Opens a fresh window after a normal-lane job settles, giving a site's
	// rate-limit window a chance to roll over before the next spawn.
	//
	// Deliberately does not pre-arm the timer: the scheduler decides whether
	// one is actually needed (no pending items ⇒ no timer).
	//
	// Drops any live timer, because it was scheduled against the previous, now
	// shorter deadline. Leaving it would let it fire early, zero `until`, and
	// release a waiting item before the new window elapsed. With the normal
	// lane capped at 1 this was unreachable — only one job could settle at a
	// time — but a user-raised concurrency limit makes staggered completions
	// routine. `sync()` arms a replacement on the next scheduler pass.
	arm(): void {
		this.until = Date.now() + INTER_JOB_SLEEP_MS
		if (this.timer) {
			clearTimeout(this.timer)
			this.timer = null
		}
	}

	clear(): void {
		this.until = 0
		if (this.timer) {
			clearTimeout(this.timer)
			this.timer = null
		}
	}

	blocksAt(now: number): boolean {
		return now < this.until
	}

	get deadline(): number {
		return this.until
	}

	// Arms or drops the wake-up timer to match whether anything is actually
	// waiting on the window. `onWake` re-runs the scheduler.
	sync(waiting: boolean, now: number, onWake: () => void): void {
		if (waiting && !this.timer) {
			const delay = Math.max(0, this.until - now)
			this.timer = setTimeout(() => {
				this.timer = null
				this.until = 0
				onWake()
			}, delay)
			return
		}
		// Window expired and nothing's waiting — drop the timer if it somehow
		// outlived its purpose.
		if (!waiting && this.timer && this.until <= now) {
			clearTimeout(this.timer)
			this.timer = null
		}
	}
}

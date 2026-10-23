// Holds queue starts while the item's site is rate-limiting this connection.
// Owns the single timer that wakes the scheduler when the earliest cooldown
// ends, the way InterJobSleep owns the pacing window.
//
// Unlike the pacing window this holds both lanes: a priority item is the user
// asking for it now, but the site has just refused this connection, so a start
// would only meet the same limit. The item stays pending and starts on its own
// when the cooldown ends, or as soon as a "Try now" request comes back clean.

import {requestSiteFor} from '@shared/sites/index.js'
import type {QueueItem} from '@shared/types.js'
import type {LaunchGate} from '../LaunchGate.js'

export class QueueSiteCooldown {
	private timer: NodeJS.Timeout | null = null
	private wakeAt = 0

	constructor(private readonly launchGate: Pick<LaunchGate, 'rateLimitedUntil' | 'onChange'> | undefined) {}

	// Until when the item's start waits; null when it may start now.
	holdUntil(item: QueueItem): number | null {
		return this.launchGate?.rateLimitedUntil(requestSiteFor(item.url)) ?? null
	}

	remainingMs(item: QueueItem, now: number): number {
		const until = this.holdUntil(item)
		return until === null ? 0 : Math.max(0, until - now)
	}

	// Re-runs the scheduler whenever a cooldown starts or ends early.
	onChange(listener: () => void): void {
		this.launchGate?.onChange(listener)
	}

	// Keeps one timer armed for the earliest held item; drops it when nothing waits.
	sync(earliest: number | null, now: number, onWake: () => void): void {
		if (earliest === null) {
			this.clear()
			return
		}
		if (this.timer && this.wakeAt === earliest) return
		this.clear()
		this.wakeAt = earliest
		this.timer = setTimeout(
			() => {
				this.timer = null
				onWake()
			},
			Math.max(0, earliest - now)
		)
		this.timer.unref?.()
	}

	clear(): void {
		if (this.timer) clearTimeout(this.timer)
		this.timer = null
		this.wakeAt = 0
	}
}

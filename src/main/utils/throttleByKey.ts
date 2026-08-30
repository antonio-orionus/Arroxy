// Trailing per-key throttle with an explicit flush.
//
// A high-frequency source keyed by something — a binary id, a job id — needs the
// newest value per key, not every value. The binary downloader reports progress
// per network chunk, hundreds of events per second on a fast pipe, and
// forwarding each one over IPC leaves the renderer visibly lagging real progress
// for tens of seconds after a download has already finished.
//
// Trailing rather than leading, so what arrives is always the most recent value
// rather than the one that happened to open the window. `flush` exists because a
// phase transition has to be ordered *after* the buffered value it supersedes:
// delivering "extracting" while a stale "downloading" still sits in the buffer
// would rewind the bar.
export interface KeyedThrottle<K, V> {
	// Buffer `value` for `key`. At most one delivery per `intervalMs` per key.
	push(key: K, value: V): void
	// Deliver `key`'s buffered value now, if any, and clear its pending timer.
	flush(key: K): void
	// Deliver every buffered value. Call once when the throttled work is over,
	// otherwise the last chunk of progress is dropped on the floor.
	flushAll(): void
}

interface Slot<V> {
	pending: V | null
	timer: NodeJS.Timeout | null
}

export function throttleByKey<K, V>(deliver: (value: V) => void, intervalMs: number): KeyedThrottle<K, V> {
	const slots = new Map<K, Slot<V>>()

	const slotFor = (key: K): Slot<V> => {
		const existing = slots.get(key)
		if (existing) return existing
		const slot: Slot<V> = {pending: null, timer: null}
		slots.set(key, slot)
		return slot
	}

	const drain = (slot: Slot<V>): void => {
		const value = slot.pending
		slot.pending = null
		if (value !== null) deliver(value)
	}

	const flushSlot = (slot: Slot<V>): void => {
		if (slot.timer) {
			clearTimeout(slot.timer)
			slot.timer = null
		}
		drain(slot)
	}

	return {
		push(key, value) {
			const slot = slotFor(key)
			slot.pending = value
			slot.timer ??= setTimeout(() => {
				slot.timer = null
				drain(slot)
			}, intervalMs)
		},
		flush(key) {
			const slot = slots.get(key)
			if (slot) flushSlot(slot)
		},
		flushAll() {
			for (const slot of slots.values()) flushSlot(slot)
		}
	}
}

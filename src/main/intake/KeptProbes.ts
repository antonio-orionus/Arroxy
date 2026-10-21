// Collection probes a needs-choice row asked about, kept so First N and the
// review need no second probe. Bounded in count and age: a kept probe is a
// shortcut, never the only way forward (a choice without one probes again).

import type {PlaylistProbeResult} from '@shared/types.js'

const KEPT_PROBE_LIMIT = 32
const KEPT_PROBE_TTL_MS = 60 * 60 * 1000

interface Kept {
	probe: PlaylistProbeResult
	keptAt: number
}

export class KeptProbes {
	private readonly kept = new Map<string, Kept>()

	constructor(
		private readonly now: () => number = Date.now,
		private readonly limit = KEPT_PROBE_LIMIT,
		private readonly ttlMs = KEPT_PROBE_TTL_MS
	) {}

	keep(itemId: string, probe: PlaylistProbeResult): void {
		this.kept.delete(itemId)
		this.kept.set(itemId, {probe, keptAt: this.now()})
		// Insertion order is age order: the oldest go first.
		for (const oldest of this.kept.keys()) {
			if (this.kept.size <= this.limit) break
			this.kept.delete(oldest)
		}
	}

	get(itemId: string): PlaylistProbeResult | undefined {
		const entry = this.kept.get(itemId)
		if (!entry) return undefined
		if (this.now() - entry.keptAt > this.ttlMs) {
			this.kept.delete(itemId)
			return undefined
		}
		return entry.probe
	}

	forget(itemId: string): void {
		this.kept.delete(itemId)
	}
}

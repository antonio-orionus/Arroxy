// links.add's idempotency: the same (client, requestId) answers the same
// intake, so a retransmit never queues twice, including one that arrives
// while the first is still placing its row (both share that call). A refused
// request is forgotten, so the client can send it again once it is fixed.
// Answers are kept for a while and the map is bounded, like the intakes they
// name; a call still placing is never forgotten.

import {INTAKE_RECORDS_MAX, INTAKE_RETENTION_MS} from './IntakeRegistry.js'

interface Entry<T> {
	clientId: string
	answer: Promise<T>
	// Null while the call is still placing its row.
	settledAt: number | null
}

export class LinksAddRequests<T> {
	private readonly entries = new Map<string, Entry<T>>()

	constructor(private readonly now: () => number) {}

	// The client's calls still placing their row, which the probing cap counts
	// too: the queue hears of an intake only once its row is placed.
	placing(clientId: string): number {
		let count = 0
		for (const entry of this.entries.values()) if (entry.clientId === clientId && entry.settledAt === null) count++
		return count
	}

	// `place` runs only for a pair not seen yet; it must not throw before it
	// returns its promise (an async function never does).
	run(clientId: string, requestId: string, place: () => Promise<T>): Promise<T> {
		this.prune()
		const key = JSON.stringify([clientId, requestId])
		const known = this.entries.get(key)
		if (known) return known.answer
		const entry: Entry<T> = {clientId, answer: place(), settledAt: null}
		this.entries.set(key, entry)
		entry.answer.then(
			() => {
				entry.settledAt = this.now()
			},
			() => {
				if (this.entries.get(key) === entry) this.entries.delete(key)
			}
		)
		return entry.answer
	}

	private prune(): void {
		const now = this.now()
		const settled: string[] = []
		for (const [key, {settledAt}] of this.entries) {
			if (settledAt === null) continue
			if (now - settledAt >= INTAKE_RETENTION_MS) this.entries.delete(key)
			else settled.push(key)
		}
		// Oldest first: the map keeps the order calls came in.
		for (const key of settled.slice(0, Math.max(0, this.entries.size - INTAKE_RECORDS_MAX))) this.entries.delete(key)
	}
}

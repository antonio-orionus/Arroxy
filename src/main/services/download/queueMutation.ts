// Queue mutation contracts + pure logging helpers, extracted from QueueService
// so the scheduler class stays under the repo's LOC cap. No state, no I/O —
// commit() in QueueService remains the queue's only writer.

import type {QueueItem} from '@shared/types.js'
import type {QueueEvent} from '@shared/queueTransition.js'

export type Mutation = {kind: 'add'; items: QueueItem[]} | {kind: 'event'; itemId: string; evt: QueueEvent} | {kind: 'patch'; itemId: string; patcher: (item: QueueItem) => QueueItem; reason: string} | {kind: 'remove'; itemId: string}

// One line per status:lane pair, plus scheduler bookkeeping — used for the
// post-mortem log lines on every mutation.
export function statusSummary(items: readonly QueueItem[], spawningCount: number, schedulerPaused: boolean): Record<string, number> {
	const counts: Record<string, number> = {}
	for (const item of items) {
		const key = `${item.status}:${item.lane}`
		counts[key] = (counts[key] ?? 0) + 1
	}
	counts.spawning = spawningCount
	counts.paused = schedulerPaused ? 1 : 0
	return counts
}

// Short human-readable mutation label for commit() debug logs.
export function describeMutation(m: Mutation): string {
	switch (m.kind) {
		case 'add':
			return `add[${m.items.length}]`
		case 'event':
			return `event[${m.itemId}:${m.evt.kind}]`
		case 'patch':
			return `patch[${m.itemId}:${m.reason}]`
		case 'remove':
			return `remove[${m.itemId}]`
	}
}

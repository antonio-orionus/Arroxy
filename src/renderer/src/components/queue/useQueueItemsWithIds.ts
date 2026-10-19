import {useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import type {QueueItem} from '@shared/types.js'

// Queue items whose ids are in `ids`, in queue order. The scan reruns only when
// the queue or the ids change, not on scroll renders, and the previous array is
// kept while its items are unchanged, so progress on other rows leaves memoized
// consumers alone. useShallow is the lint-safe way to hold that previous array.
export function useQueueItemsWithIds(queue: QueueItem[], ids: ReadonlySet<string>): QueueItem[] {
	const keepUnchanged = useShallow((items: QueueItem[]) => items)
	const items = useMemo(() => queue.filter(item => ids.has(item.id)), [ids, queue])
	return keepUnchanged(items)
}

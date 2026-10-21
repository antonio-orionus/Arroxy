// queue.list's pages: cut by the caller's limit and by size, so one page fits
// a relay frame (16 KB after encryption) with room for the envelope. The
// cursor is opaque to the client: the row a page ended on and where the next
// would start, so rows removed before it do not make the next page skip any.

import {z} from 'zod'
import type {QueueItemView} from 'arroxy-control'
import type {QueueItem} from '@shared/types.js'
import {controlFailure} from './controlErrors.js'

// JSON bytes of items in one page (the event feed's snapshot pages want the same budget).
const CONTROL_PAGE_BYTES = 12 * 1024
const QUEUE_LIST_DEFAULT_LIMIT = 100

const cursorSchema = z.object({after: z.string().min(1), next: z.number().int().nonnegative()})
type Cursor = z.infer<typeof cursorSchema>

export interface QueuePage {
	items: QueueItemView[]
	nextCursor: string | null
}

export function queuePage(rows: readonly QueueItem[], view: (item: QueueItem) => QueueItemView, request: {cursor?: string; limit?: number}): QueuePage {
	const start = request.cursor === undefined ? 0 : startOf(rows, decodeCursor(request.cursor))
	const {items, next} = takePage(rows, view, start, request.limit ?? QUEUE_LIST_DEFAULT_LIMIT)
	const last = items.at(-1)
	return {items, nextCursor: next < rows.length && last ? encodeCursor({after: last.id, next}) : null}
}

// The views of rows from `start` that fit one page, and where the next page
// starts. A page always takes one row, however large, so paging always moves on.
export function takePage<T>(rows: readonly T[], view: (row: T) => QueueItemView, start: number, limit: number): {items: QueueItemView[]; next: number} {
	const items: QueueItemView[] = []
	// The brackets of the array, then each item and its comma.
	let bytes = 2
	let index = start
	for (; index < rows.length && items.length < limit; index++) {
		const row = rows[index]
		if (row === undefined) break
		const item = view(row)
		const size = Buffer.byteLength(JSON.stringify(item)) + 1
		if (items.length > 0 && bytes + size > CONTROL_PAGE_BYTES) break
		items.push(item)
		bytes += size
	}
	return {items, next: index}
}

function startOf(rows: readonly QueueItem[], cursor: Cursor): number {
	const after = rows.findIndex(row => row.id === cursor.after)
	return after >= 0 ? after + 1 : Math.min(cursor.next, rows.length)
}

function encodeCursor(cursor: Cursor): string {
	return Buffer.from(JSON.stringify(cursor)).toString('base64url')
}

function decodeCursor(raw: string): Cursor {
	let decoded: unknown
	try {
		decoded = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
	} catch {
		decoded = null
	}
	const parsed = cursorSchema.safeParse(decoded)
	if (!parsed.success) throw controlFailure('invalid_request', 'The cursor is not one queue.list gave.')
	return parsed.data
}

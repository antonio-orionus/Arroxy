import {memo, type ReactNode} from 'react'
import type {TFunction} from 'i18next'

// Built once: toLocaleString with options constructs a formatter per call.
const QUEUE_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short'})

function formatQueueDate(value: string | null, t: TFunction): string {
	if (!value) return t('queue.table.notAvailable')
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return t('queue.table.notAvailable')
	return QUEUE_DATE_FORMAT.format(date)
}

export const QueueDateCell = memo(function QueueDateCell({value, t}: {value: string | null; t: TFunction}): ReactNode {
	return <span className="block truncate text-caption text-muted-foreground">{formatQueueDate(value, t)}</span>
})

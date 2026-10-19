import {memo, type ReactNode} from 'react'
import type {TFunction} from 'i18next'

// toLocaleString with options builds a formatter on every call, so the cells
// share one. A formatter fixes its time zone when built, so it is rebuilt when
// the UTC offset moves, following a system time zone change the way
// toLocaleString would.
let queueDateFormat: {utcOffset: number; formatter: Intl.DateTimeFormat} | null = null

function queueDateFormatter(): Intl.DateTimeFormat {
	const utcOffset = new Date().getTimezoneOffset()
	if (queueDateFormat?.utcOffset !== utcOffset) queueDateFormat = {utcOffset, formatter: new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short'})}
	return queueDateFormat.formatter
}

function formatQueueDate(value: string | null, t: TFunction): string {
	if (!value) return t('queue.table.notAvailable')
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return t('queue.table.notAvailable')
	return queueDateFormatter().format(date)
}

export const QueueDateCell = memo(function QueueDateCell({value, t}: {value: string | null; t: TFunction}): ReactNode {
	return <span className="block truncate text-caption text-muted-foreground">{formatQueueDate(value, t)}</span>
})

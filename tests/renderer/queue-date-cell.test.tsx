import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {QueueDateCell} from '@renderer/components/queue/QueueDateCell.js'
import {i18next} from '@shared/i18n/index.js'

const FINISHED_AT = '2026-06-19T09:00:00.000Z'
const originalTimeZone = process.env.TZ

function formatIn(timeZone: string, value: string): string {
	return new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short', timeZone}).format(new Date(value))
}

afterEach(() => {
	if (originalTimeZone === undefined) delete process.env.TZ
	else process.env.TZ = originalTimeZone
})

describe('QueueDateCell', () => {
	it('follows a system time zone change made while the app is open', () => {
		process.env.TZ = 'UTC'
		const {unmount} = render(<QueueDateCell value={FINISHED_AT} t={i18next.t} />)
		expect(screen.getByText(formatIn('UTC', FINISHED_AT))).toBeInTheDocument()
		unmount()

		process.env.TZ = 'Asia/Tokyo'
		render(<QueueDateCell value={FINISHED_AT} t={i18next.t} />)
		expect(screen.getByText(formatIn('Asia/Tokyo', FINISHED_AT))).toBeInTheDocument()
	})

	it('shows not-available for a missing or unparseable date', () => {
		const {rerender} = render(<QueueDateCell value={null} t={i18next.t} />)
		expect(screen.getByText(i18next.t('queue.table.notAvailable'))).toBeInTheDocument()
		rerender(<QueueDateCell value="not a date" t={i18next.t} />)
		expect(screen.getByText(i18next.t('queue.table.notAvailable'))).toBeInTheDocument()
	})
})

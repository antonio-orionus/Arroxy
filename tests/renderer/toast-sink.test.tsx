import {render} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {ExternalToast} from 'sonner'
import {notify, setNotificationSink} from '@renderer/lib/notify.js'
import {useToastSink} from '@renderer/lib/toastSink.js'

const shown = vi.hoisted((): {message: string; options: ExternalToast}[] => [])

vi.mock('sonner', () => {
	const record = (message: string, options: ExternalToast = {}): string | number => {
		shown.push({message, options})
		return options.id ?? shown.length
	}
	return {toast: {info: record, warning: record, error: record}}
})

function App() {
	useToastSink()
	return null
}

describe('toast sink', () => {
	beforeEach(() => {
		shown.length = 0
		vi.spyOn(console, 'info').mockImplementation(() => {})
	})
	afterEach(() => setNotificationSink(null))

	it('collapses repeats into the toast that is still on screen', () => {
		render(<App />)
		notify.clipboard('Link filled from clipboard')
		notify.clipboard('Multiple links copied — use Bulk URLs')

		expect(shown).toHaveLength(2)
		expect(shown[1]?.options.id).toBe(shown[0]?.options.id)
	})

	// Sonner animates a timed-out toast out before removing it; a toast created
	// with the same id in that window updates the leaving toast and vanishes
	// with it. A message that arrives once its toast started closing must open
	// a new toast instead.
	it.each(['onAutoClose', 'onDismiss'] as const)('opens a new toast once the previous one started closing (%s)', closing => {
		render(<App />)
		notify.clipboard('Link filled from clipboard')
		const first = shown[0]
		if (!first) throw new Error('expected a first toast')
		first.options[closing]?.({id: first.options.id ?? '', title: first.message})

		notify.clipboard('Multiple links copied — use Bulk URLs')
		const second = shown[1]
		expect(second?.options.id).toBeDefined()
		expect(second?.options.id).not.toBe(first.options.id)

		notify.clipboard('Multiple links copied — use Bulk URLs')
		expect(shown[2]?.options.id).toBe(second?.options.id)
	})

	it('ignores a late close callback from an older toast', () => {
		render(<App />)
		notify.clipboard('first')
		const first = shown[0]
		if (!first) throw new Error('expected a first toast')
		first.options.onAutoClose?.({id: first.options.id ?? '', title: first.message})
		notify.clipboard('second')
		first.options.onDismiss?.({id: first.options.id ?? '', title: first.message})
		notify.clipboard('third')

		expect(shown[2]?.options.id).toBe(shown[1]?.options.id)
	})
})

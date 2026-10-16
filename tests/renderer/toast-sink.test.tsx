import {render} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
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

describe('toast actions', () => {
	beforeEach(() => {
		shown.length = 0
	})
	afterEach(() => setNotificationSink(null))

	it('renders a single action as the toast’s action button', () => {
		render(<App />)
		const view = vi.fn()
		notify.quickDownloadAdded('Video', view)
		const action = shown[0]?.options.action
		if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('expected an action object')
		expect(action.label).toBe('View')
		action.onClick(new MouseEvent('click') as never)
		expect(view).toHaveBeenCalledTimes(1)
		expect(shown[0]?.options.cancel).toBeUndefined()
	})

	it('renders the main action first and View as the second button', () => {
		render(<App />)
		const retry = vi.fn()
		const view = vi.fn()
		notify.quickDownloadFailed('row', 'Video', {kind: 'retry', run: retry}, view)
		const {action, cancel} = shown[0]?.options ?? {}
		if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('expected an action object')
		if (!cancel || typeof cancel !== 'object' || !('onClick' in cancel)) throw new Error('expected a second button')
		expect([action.label, cancel.label]).toEqual(['Retry', 'View'])
		action.onClick(new MouseEvent('click') as never)
		cancel.onClick(new MouseEvent('click') as never)
		expect(retry).toHaveBeenCalledTimes(1)
		expect(view).toHaveBeenCalledTimes(1)
	})

	// Sonner closes the toast after an action click without calling onDismiss
	// or onAutoClose. A same-id notification raised by the action itself (a
	// fast re-failure) must still open a fresh toast, not the leaving one.
	it.each(['action', 'cancel'] as const)('opens a new toast for a notification raised right after a %s click', button => {
		render(<App />)
		const refail = (): void => notify.quickDownloadFailed('row', 'Video', {kind: 'retry', run: () => undefined})
		notify.quickDownloadFailed('row', 'Video', {kind: 'retry', run: refail}, refail)
		const clicked = shown[0]?.options[button]
		if (!clicked || typeof clicked !== 'object' || !('onClick' in clicked)) throw new Error('expected a button')
		clicked.onClick(new MouseEvent('click') as never)

		expect(shown).toHaveLength(2)
		expect(shown[1]?.options.id).not.toBe(shown[0]?.options.id)
	})
})

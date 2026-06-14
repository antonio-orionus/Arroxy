import {render, screen, fireEvent} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {WhatsNewDialog} from '@renderer/components/system/WhatsNewDialog.js'
import type {ReleaseNotes} from '@shared/releaseNotes.js'

const NOTES: ReleaseNotes = {
	version: '1.2.0',
	intro: ['This release makes updates easier to understand.'],
	sections: [
		{title: 'Update Notes', body: [], bullets: ["Shows a What's New popup after updating.", 'Keeps the changelog as the source of truth.']},
		{title: 'Reliability', body: [], bullets: ['Avoids network fetches while opening the popup.']}
	]
}

describe('WhatsNewDialog', () => {
	it('renders release notes in a scrollable dialog', () => {
		render(<WhatsNewDialog open notes={NOTES} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)

		expect(screen.getByTestId('whats-new-dialog')).toBeInTheDocument()
		expect(screen.getByRole('heading', {name: "What's new in Arroxy 1.2.0"})).toBeInTheDocument()
		expect(screen.getByText('This release makes updates easier to understand.')).toBeInTheDocument()
		expect(screen.getByRole('heading', {name: 'Update Notes'})).toBeInTheDocument()
		expect(screen.getByText("Shows a What's New popup after updating.")).toBeInTheDocument()
		expect(screen.getByTestId('whats-new-scroll')).toHaveClass('overflow-y-auto')
	})

	it('calls the supplied actions from the footer buttons', () => {
		const onClose = vi.fn()
		const onOpenFullNotes = vi.fn()
		render(<WhatsNewDialog open notes={NOTES} onClose={onClose} onOpenFullNotes={onOpenFullNotes} />)

		fireEvent.click(screen.getByRole('button', {name: 'Full release notes ↗'}))
		expect(onOpenFullNotes).toHaveBeenCalledOnce()

		fireEvent.click(screen.getByRole('button', {name: 'Continue'}))
		expect(onClose).toHaveBeenCalledOnce()
	})

	it('does not render when closed or missing notes', () => {
		const {rerender} = render(<WhatsNewDialog open={false} notes={NOTES} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		expect(screen.queryByTestId('whats-new-dialog')).not.toBeInTheDocument()

		rerender(<WhatsNewDialog open notes={null} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		expect(screen.queryByTestId('whats-new-dialog')).not.toBeInTheDocument()
	})
})

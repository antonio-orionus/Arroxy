import {render, screen, fireEvent} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {WhatsNewDialog} from '@renderer/components/system/WhatsNewDialog.js'
import type {ReleaseNotes, ReleaseNotesBlock, ReleaseNotesDigest} from '@shared/releaseNotes.js'

const plain = (text: string): ReleaseNotesBlock => [{kind: 'text', text}]

const CURRENT: ReleaseNotes = {
	version: '1.2.0',
	intro: [plain('This release makes updates easier to understand.')],
	sections: [
		{title: 'Update Notes', body: [], bullets: [plain("Shows a What's New popup after updating."), plain('Keeps the changelog as the source of truth.')]},
		{title: 'Reliability', body: [], bullets: [plain('Avoids network fetches while opening the popup.')]}
	]
}

const PREVIOUS: ReleaseNotes = {version: '1.1.0', intro: [plain('Older release the user never saw.')], sections: [{title: 'Playlists', body: [], bullets: [plain('Adds per-item profiles.')]}]}

const SINGLE: ReleaseNotesDigest = {version: '1.2.0', releases: [CURRENT]}
const MULTI: ReleaseNotesDigest = {version: '1.2.0', releases: [CURRENT, PREVIOUS]}

describe('WhatsNewDialog', () => {
	it('renders changelog emphasis as elements, never as literal markers', () => {
		const notes: ReleaseNotes = {
			version: '1.3.0',
			intro: [
				[
					{
						kind: 'strong',
						children: [
							{kind: 'text', text: 'Download · '},
							{kind: 'em', children: [{kind: 'text', text: 'your profile'}]}
						]
					},
					{kind: 'text', text: ' queues it.'}
				]
			],
			sections: []
		}
		render(<WhatsNewDialog open digest={{version: '1.3.0', releases: [notes]}} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)

		const strong = screen.getByText((_content, element) => element?.tagName === 'STRONG' && element.textContent === 'Download · your profile')
		expect(strong.querySelector('em')).toHaveTextContent('your profile')
		expect(screen.getByTestId('whats-new-dialog')).not.toHaveTextContent('*')
	})

	it('renders release notes in a scrollable dialog', () => {
		render(<WhatsNewDialog open digest={SINGLE} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)

		expect(screen.getByTestId('whats-new-dialog')).toBeInTheDocument()
		expect(screen.getByRole('heading', {name: "What's new in Arroxy 1.2.0"})).toBeInTheDocument()
		expect(screen.getByText('This release makes updates easier to understand.')).toBeInTheDocument()
		expect(screen.getByRole('heading', {name: 'Update Notes'})).toBeInTheDocument()
		expect(screen.getByText("Shows a What's New popup after updating.")).toBeInTheDocument()
		expect(screen.getByTestId('whats-new-scroll')).toHaveClass('overflow-y-auto')
	})

	it('labels each release when the user skipped versions', () => {
		render(<WhatsNewDialog open digest={MULTI} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)

		expect(screen.getByTestId('whats-new-release-1.2.0')).toBeInTheDocument()
		expect(screen.getByTestId('whats-new-release-1.1.0')).toBeInTheDocument()
		expect(screen.getAllByText('v1.2.0')).toHaveLength(1)
		expect(screen.getByText('v1.1.0')).toBeInTheDocument()
		expect(screen.getByText('Older release the user never saw.')).toBeInTheDocument()
		expect(screen.getByRole('heading', {name: 'Playlists'})).toBeInTheDocument()
	})

	it('shows the version exactly once, wherever it belongs for the shape', () => {
		const {rerender} = render(<WhatsNewDialog open digest={SINGLE} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		// Single release: the header badge carries the version, no per-release label.
		expect(screen.getAllByText('v1.2.0')).toHaveLength(1)
		expect(screen.queryByTestId('whats-new-release-1.2.0')?.textContent).not.toContain('v1.2.0')

		// Several releases: each block is labelled, so the header badge steps aside.
		rerender(<WhatsNewDialog open digest={MULTI} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		expect(screen.getAllByText('v1.2.0')).toHaveLength(1)
		expect(screen.getByTestId('whats-new-release-1.2.0').textContent).toContain('v1.2.0')
	})

	it('calls the supplied actions from the footer buttons', () => {
		const onClose = vi.fn()
		const onOpenFullNotes = vi.fn()
		render(<WhatsNewDialog open digest={SINGLE} onClose={onClose} onOpenFullNotes={onOpenFullNotes} />)

		fireEvent.click(screen.getByRole('button', {name: 'Full release notes ↗'}))
		expect(onOpenFullNotes).toHaveBeenCalledOnce()

		fireEvent.click(screen.getByRole('button', {name: 'Continue'}))
		expect(onClose).toHaveBeenCalledOnce()
	})

	it('does not render when closed or missing notes', () => {
		const {rerender} = render(<WhatsNewDialog open={false} digest={SINGLE} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		expect(screen.queryByTestId('whats-new-dialog')).not.toBeInTheDocument()

		rerender(<WhatsNewDialog open digest={null} onClose={vi.fn()} onOpenFullNotes={vi.fn()} />)
		expect(screen.queryByTestId('whats-new-dialog')).not.toBeInTheDocument()
	})
})

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {useState, type ReactNode} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {BulkUrlDialog} from '@renderer/components/wizard/BulkUrlDialog.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

describe('BulkUrlDialog', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		useAppStore.setState({settings: defaultAppSettings('/tmp'), startBulkUrls: vi.fn(), bulkQuickDownload: vi.fn().mockResolvedValue(true)})
	})

	it('caps preview rendering and reports omitted rows', () => {
		const urls = Array.from({length: 205}, (_, index) => `https://example.com/video-${index}`)

		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw={urls.join('\n')} />)

		expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('205')
		expect(screen.getByText('https://example.com/video-199')).toBeInTheDocument()
		expect(screen.queryByText('https://example.com/video-200')).not.toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-preview-omitted')).toHaveTextContent('+5')
	})

	it('says once that a supported URL is needed', () => {
		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="not a link at all" />)

		expect(screen.getAllByText('Add at least one supported URL to continue.')).toHaveLength(1)
	})

	it('submits the current textarea value rather than the deferred preview', () => {
		const startBulkUrls = vi.fn()
		useAppStore.setState({startBulkUrls})

		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/old" />)

		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/latest'}})
		fireEvent.click(screen.getByTestId('bulk-url-confirm'))

		expect(startBulkUrls).toHaveBeenCalledWith(['https://example.com/latest'])
	})

	it('Quick Download places the accepted links and closes once they are placed', async () => {
		const bulkQuickDownload = vi.fn().mockResolvedValue(true)
		const onOpenChange = vi.fn()
		useAppStore.setState({bulkQuickDownload})
		render(<BulkUrlDialog open onOpenChange={onOpenChange} initialRaw={'https://example.com/a\nhttps://example.com/b'} />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))

		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
		expect(bulkQuickDownload).toHaveBeenCalledWith(['https://example.com/a', 'https://example.com/b'])
	})

	it('stays open with the text kept when nothing was placed', async () => {
		const bulkQuickDownload = vi.fn().mockResolvedValue(false)
		const onOpenChange = vi.fn()
		useAppStore.setState({bulkQuickDownload})
		render(<BulkUrlDialog open onOpenChange={onOpenChange} initialRaw="https://example.com/a" />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))

		await waitFor(() => expect(bulkQuickDownload).toHaveBeenCalledOnce())
		expect(onOpenChange).not.toHaveBeenCalled()
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue('https://example.com/a')
	})

	it('places once however often Quick Download is pressed while placing', async () => {
		let finish: (closes: boolean) => void = () => undefined
		const bulkQuickDownload = vi.fn(() => new Promise<boolean>(resolve => (finish = resolve)))
		useAppStore.setState({bulkQuickDownload})
		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/a" />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))
		fireEvent.click(screen.getByTestId('bulk-quick-download'))
		finish(true)

		await waitFor(() => expect(bulkQuickDownload).toHaveBeenCalledOnce())
	})

	// The home unmounts the dialog when it closes, and a reopened dialog is a new
	// one: a placement the closed dialog started must not close the new one.
	it('a placement finishing after Cancel never closes the dialog opened since', async () => {
		let finish: (closes: boolean) => void = () => undefined
		const bulkQuickDownload = vi.fn(() => new Promise<boolean>(resolve => (finish = resolve)))
		useAppStore.setState({bulkQuickDownload})
		function Home(): ReactNode {
			const [open, setOpen] = useState(true)
			const [raw, setRaw] = useState('https://example.com/first')
			return (
				<>
					<button
						type="button"
						data-testid="reopen"
						onClick={() => {
							setRaw('https://example.com/second')
							setOpen(true)
						}}
					/>
					{open ? <BulkUrlDialog open onOpenChange={setOpen} initialRaw={raw} /> : null}
				</>
			)
		}
		render(<Home />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))
		fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
		await waitFor(() => expect(screen.queryByTestId('bulk-url-dialog')).not.toBeInTheDocument())
		fireEvent.click(screen.getByTestId('reopen'))
		expect(await screen.findByTestId('bulk-url-textarea')).toHaveValue('https://example.com/second')

		await act(async () => finish(true))

		expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue('https://example.com/second')
	})

	// Text typed while the links are placed is the user's next batch: keep it.
	it('keeps text edited while placing, and stays open with it', async () => {
		let finish: (closes: boolean) => void = () => undefined
		const bulkQuickDownload = vi.fn(() => new Promise<boolean>(resolve => (finish = resolve)))
		useAppStore.setState({bulkQuickDownload})
		const onOpenChange = vi.fn()
		render(<BulkUrlDialog open onOpenChange={onOpenChange} initialRaw="https://example.com/first" />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))
		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/next'}})
		await act(async () => finish(true))

		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue('https://example.com/next')
		expect(onOpenChange).not.toHaveBeenCalledWith(false)
	})

	it('holds Interactive Download while the links are placed, so they are not sent twice', async () => {
		let finish: (closes: boolean) => void = () => undefined
		const bulkQuickDownload = vi.fn(() => new Promise<boolean>(resolve => (finish = resolve)))
		const startBulkUrls = vi.fn()
		useAppStore.setState({bulkQuickDownload, startBulkUrls})
		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/first" />)

		fireEvent.click(screen.getByTestId('bulk-quick-download'))
		expect(screen.getByTestId('bulk-url-confirm')).toBeDisabled()
		fireEvent.click(screen.getByTestId('bulk-url-confirm'))
		expect(startBulkUrls).not.toHaveBeenCalled()

		await act(async () => finish(false))
		expect(screen.getByTestId('bulk-url-confirm')).not.toBeDisabled()
	})

	it('renders a compact profile-aware quick download control', () => {
		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/video" />)

		expect(screen.getByTestId('bulk-quick-profile-preview')).toHaveAttribute('data-linked-control', 'quick-profile')
		expect(screen.getByTestId('bulk-quick-download')).toHaveTextContent('Quick Download')
		expect(screen.getByTestId('bulk-active-profile-card')).toHaveTextContent('Balanced 720p')
		expect(screen.getByTestId('bulk-active-profile-card')).not.toHaveTextContent('720p ·')

		fireEvent.click(screen.getByRole('button', {name: 'Switch download profile: Balanced 720p'}))
		expect(screen.getByTestId('bulk-profile-menu')).toBeInTheDocument()
		expect(screen.getByTestId('bulk-profile-option-balanced')).toHaveAttribute('aria-pressed', 'true')
	})

	it('uses a wider shell for the profile-aware bulk workflow', () => {
		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/video" />)

		expect(screen.getByTestId('bulk-url-dialog')).toHaveClass('w-[calc(100%-2rem)]', 'sm:max-w-2xl', 'md:max-w-3xl')
	})

	it('keeps long pasted input inside bounded scroll regions', () => {
		const raw = Array.from({length: 160}, (_, index) => `build log line ${index}`).join('\n')

		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw={raw} />)

		expect(screen.getByTestId('bulk-url-dialog')).toHaveClass('flex', 'flex-col', 'max-h-[calc(100dvh-2rem)]', 'overflow-hidden')
		expect(screen.getByTestId('bulk-url-dialog-body')).toHaveClass('min-h-0', 'overflow-y-auto')
		expect(screen.getByTestId('bulk-url-textarea')).toHaveClass('h-40', 'resize-none', 'overflow-y-auto')
		expect(screen.getByTestId('bulk-url-textarea')).not.toHaveClass('field-sizing-content')
	})
})

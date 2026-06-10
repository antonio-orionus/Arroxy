import {fireEvent, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {BulkUrlDialog} from '@renderer/components/wizard/BulkUrlDialog.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

describe('BulkUrlDialog', () => {
	beforeEach(() => {
		useAppStore.setState({quickDownloadStatus: 'idle', startBulkUrls: vi.fn(), quickDownloadUrls: vi.fn().mockResolvedValue(undefined)})
	})

	it('caps preview rendering and reports omitted rows', () => {
		const urls = Array.from({length: 205}, (_, index) => `https://example.com/video-${index}`)

		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw={urls.join('\n')} />)

		expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('205')
		expect(screen.getByText('https://example.com/video-199')).toBeInTheDocument()
		expect(screen.queryByText('https://example.com/video-200')).not.toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-preview-omitted')).toHaveTextContent('+5')
	})

	it('submits the current textarea value rather than the deferred preview', () => {
		const startBulkUrls = vi.fn()
		useAppStore.setState({startBulkUrls})

		render(<BulkUrlDialog open onOpenChange={vi.fn()} initialRaw="https://example.com/old" />)

		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/latest'}})
		fireEvent.click(screen.getByTestId('bulk-url-confirm'))

		expect(startBulkUrls).toHaveBeenCalledWith(['https://example.com/latest'])
	})
})

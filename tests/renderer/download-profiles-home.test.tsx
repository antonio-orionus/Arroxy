import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {makeItem} from '../shared/fixtures.js'

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

describe('DownloadProfilesHome queue tab', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		window.history.replaceState(null, '', '#download')
		useAppStore.setState({queue: [makeItem({id: 'queued-video', title: 'Queued video', status: 'pending'})], wizardUrl: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadProgressFailed: 0})
	})

	afterEach(() => {
		i18next.removeResourceBundle('en', 'translation')
		i18next.addResourceBundle('en', 'translation', en, true, true)
	})

	it('opens the queue manager from the top-level tab row', async () => {
		render(<DownloadProfilesHome />)

		fireEvent.click(screen.getByRole('tab', {name: /^queue/i}))

		expect(screen.getByTestId('queue-manager-tab')).toBeInTheDocument()
		expect(await screen.findByTestId('queue-manager-row-queued-video')).toHaveTextContent('Queued video')
	})

	it('uses the localized Queue tab label', () => {
		i18next.addResource('en', 'translation', 'queue.tabLabel', 'Lineup')

		render(<DownloadProfilesHome />)

		expect(screen.getByRole('tab', {name: /^lineup/i})).toBeInTheDocument()
	})

	it('marks the Queue tab active only while queue work is running or moving files', () => {
		render(<DownloadProfilesHome />)
		expect(screen.getByRole('tab', {name: /^queue/i})).not.toHaveAttribute('data-queue-active', 'true')

		act(() => useAppStore.setState({queue: [makeItem({id: 'running-video', title: 'Running video', status: 'running'})]}))
		expect(screen.getByRole('tab', {name: /^queue/i})).toHaveAttribute('data-queue-active', 'true')

		act(() => useAppStore.setState({queue: [makeItem({id: 'moving-video', title: 'Moving video', status: 'pending', lastStatus: {key: 'movingFiles'}})]}))
		expect(screen.getByRole('tab', {name: /^queue/i})).toHaveAttribute('data-queue-active', 'true')
	})
})

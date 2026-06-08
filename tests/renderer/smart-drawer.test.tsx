import {render, screen} from '@testing-library/react'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import {SmartDrawer} from '@renderer/components/layout/SmartDrawer.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {makeItem} from '../shared/fixtures.js'
import type {QueueItem} from '@shared/types.js'

const stubActions = {setDrawerOpen: vi.fn(), dismissQueueTip: vi.fn(), clearCompleted: vi.fn(), startItemDownload: vi.fn(), cancelItemDownload: vi.fn(), pauseItemDownload: vi.fn(), resumeItemDownload: vi.fn(), removeQueueItem: vi.fn(), retryQueueItem: vi.fn(), openItemFolder: vi.fn(), openItemUrl: vi.fn()}

function setQueue(queue: QueueItem[]): void {
	useAppStore.setState({queue, drawerOpen: false, showQueueTip: false, settings: null, ...stubActions})
}

beforeEach(() => {
	for (const fn of Object.values(stubActions)) fn.mockReset()
})

describe('SmartDrawer header summary', () => {
	it('does not render sleep banner', () => {
		setQueue([])
		render(<SmartDrawer />)
		expect(screen.queryByTestId('inter-job-sleep-banner')).not.toBeInTheDocument()
	})

	it('shows "No downloads yet." when queue is empty', () => {
		setQueue([])
		render(<SmartDrawer />)
		expect(screen.getByTestId('drawer-header-summary')).toHaveTextContent('No downloads yet.')
		expect(screen.queryByTestId('drawer-header-progress')).not.toBeInTheDocument()
	})

	it('shows percent + phase text when exactly one item is downloading', () => {
		setQueue([makeItem({id: 'q1', status: 'running', progressPercent: 42, progressDetail: null, lastStatus: {key: 'mergingFormats', params: {}}})])
		render(<SmartDrawer />)
		const summary = screen.getByTestId('drawer-header-summary')
		expect(summary).toHaveTextContent('42%')
		expect(summary).toHaveTextContent('Merging audio and video')
		const bar = screen.getByTestId('drawer-header-progress')
		expect(bar).toHaveStyle({width: '42%'})
	})

	it('uses progressDetail (speed/ETA) when present for the single-item case', () => {
		setQueue([makeItem({id: 'q1', status: 'running', progressPercent: 25, progressDetail: '1.2 MiB/s · ETA 00:30', lastStatus: {key: 'downloadingMedia', params: {}}})])
		render(<SmartDrawer />)
		expect(screen.getByTestId('drawer-header-summary')).toHaveTextContent('25% · 1.2 MiB/s · ETA 00:30')
	})

	it('shows "N downloading · avg%" with no phase text when 2+ are active', () => {
		setQueue([makeItem({id: 'q1', status: 'running', progressPercent: 40, lastStatus: {key: 'mergingFormats', params: {}}}), makeItem({id: 'q2', status: 'running', progressPercent: 60, lastStatus: {key: 'downloadingMedia', params: {}}})])
		render(<SmartDrawer />)
		const summary = screen.getByTestId('drawer-header-summary')
		expect(summary).toHaveTextContent('2 downloading · 50%')
		expect(summary).not.toHaveTextContent('Merging')
		expect(summary).not.toHaveTextContent('Downloading')
		const bar = screen.getByTestId('drawer-header-progress')
		expect(bar).toHaveStyle({width: '50%'})
	})

	it('aggregates correctly with 3 mixed-phase active items', () => {
		setQueue([
			makeItem({id: 'q1', status: 'running', progressPercent: 30, lastStatus: {key: 'mergingFormats', params: {}}}),
			makeItem({id: 'q2', status: 'running', progressPercent: 60, lastStatus: {key: 'downloadingMedia', params: {}}}),
			makeItem({id: 'q3', status: 'running', progressPercent: 90, lastStatus: {key: 'fetchingSubtitles', params: {}}})
		])
		render(<SmartDrawer />)
		const summary = screen.getByTestId('drawer-header-summary')
		expect(summary).toHaveTextContent('3 downloading · 60%')
		expect(summary).not.toHaveTextContent('Merging')
		expect(summary).not.toHaveTextContent('subtitles')
	})

	it('renders no summary when queue has only completed/idle items', () => {
		setQueue([makeItem({id: 'q1', status: 'done', progressPercent: 100}), makeItem({id: 'q2', status: 'pending', progressPercent: 0})])
		render(<SmartDrawer />)
		expect(screen.queryByTestId('drawer-header-summary')).not.toBeInTheDocument()
		expect(screen.queryByTestId('drawer-header-progress')).not.toBeInTheDocument()
	})
})

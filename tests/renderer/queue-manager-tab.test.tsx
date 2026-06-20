import {fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {QueueManagerTab} from '@renderer/components/queue/QueueManagerTab.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const virtualRange = vi.hoisted(() => ({start: 0, count: 12, estimateSize: 62}))

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		virtualRange.estimateSize = size
		const end = Math.min(count, virtualRange.start + virtualRange.count)
		return {
			getTotalSize: () => count * size,
			getVirtualItems: () =>
				Array.from({length: Math.max(0, end - virtualRange.start)}, (_, offset) => {
					const index = virtualRange.start + offset
					return {index, key: index, size, start: index * size}
				}),
			measureElement: () => undefined
		}
	}
}))

const actions = {
	applyQueueSelectionAction: vi.fn(),
	openItemFolder: vi.fn(),
	openItemUrl: vi.fn(),
	pauseAll: vi.fn(),
	resumeAll: vi.fn(),
	cancelAll: vi.fn(),
	clearCompleted: vi.fn(),
	setItemLane: vi.fn(),
	cancelItemDownload: vi.fn(),
	pauseItemDownload: vi.fn(),
	resumeItemDownload: vi.fn(),
	removeQueueItem: vi.fn(),
	retryQueueItem: vi.fn(),
	changeQueueOutputTarget: vi.fn()
}

beforeEach(() => {
	virtualRange.start = 0
	virtualRange.count = 12
	virtualRange.estimateSize = 62
	Object.defineProperty(window, 'innerWidth', {configurable: true, writable: true, value: 1280})
	window.localStorage.clear()
	for (const fn of Object.values(actions)) fn.mockReset()
	actions.applyQueueSelectionAction.mockResolvedValue({ok: true, data: {action: 'pause', appliedIds: [], skipped: []}})
	actions.changeQueueOutputTarget.mockResolvedValue(ok({outputDir: '/archive', items: [], skipped: []}))
	Object.defineProperty(navigator, 'clipboard', {writable: true, configurable: true, value: {writeText: vi.fn().mockResolvedValue(undefined)}})
	const api = buildMockAppApi()
	vi.mocked(api.dialog.chooseFolder).mockResolvedValue(ok({path: '/archive'}))
	window.appApi = api
	useAppStore.setState({queue: [], ...actions})
})

afterEach(() => {
	Reflect.deleteProperty(navigator, 'clipboard')
	i18next.removeResourceBundle('en', 'translation')
	i18next.addResourceBundle('en', 'translation', en, true, true)
})

function makeLargeQueue(count: number) {
	return Array.from({length: count}, (_, index) => makeItem({id: `item-${index + 1}`, title: `Queue video ${index + 1}`, status: index % 3 === 0 ? 'done' : 'pending', addedAt: new Date(Date.UTC(2026, 5, 19, 10, 0, index)).toISOString()}))
}

describe('QueueManagerTab', () => {
	it('renders queue rows with the qBittorrent-style columns', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending', formatLabel: '1080p · mp4', outputDir: '/downloads'}), makeItem({id: 'running', title: 'Active video', status: 'running', progressPercent: 42, formatLabel: 'Audio · opus'})]})

		render(<QueueManagerTab />)

		expect(screen.getByRole('columnheader', {name: /title/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /status/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /progress/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /format/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /output target/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /artifacts/i})).toBeInTheDocument()
		expect(screen.getByRole('columnheader', {name: /added/i})).toBeInTheDocument()
		expect(screen.queryByRole('columnheader', {name: /finished/i})).not.toBeInTheDocument()
		expect(screen.queryByRole('columnheader', {name: /actions/i})).not.toBeInTheDocument()
		expect(screen.getByTestId('queue-manager-row-pending')).toHaveTextContent('Waiting video')
		expect(screen.getByTestId('queue-manager-row-running')).toHaveTextContent('42%')
	})

	it('virtualizes large queues instead of rendering every row', () => {
		useAppStore.setState({queue: makeLargeQueue(5000)})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('5000 total')
		expect(screen.getAllByTestId(/^queue-manager-row-/)).toHaveLength(12)
		expect(screen.getByTestId('queue-manager-row-item-5000')).toBeInTheDocument()
		expect(screen.queryByTestId('queue-manager-row-item-4988')).not.toBeInTheDocument()
	})

	it('bounds the virtualized queue scroll area instead of letting large queues expand the panel', () => {
		useAppStore.setState({queue: makeLargeQueue(5000)})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('queue-manager-scroll')).toHaveClass('h-[clamp(12rem,calc(100vh-16rem),34rem)]')
	})

	it('renders the current virtual window for later queue rows', () => {
		virtualRange.start = 100
		virtualRange.count = 8
		useAppStore.setState({queue: makeLargeQueue(5000)})

		render(<QueueManagerTab />)

		expect(screen.getAllByTestId(/^queue-manager-row-/)).toHaveLength(8)
		expect(screen.getByTestId('queue-manager-row-item-4900')).toBeInTheDocument()
		expect(screen.queryByTestId('queue-manager-row-item-5000')).not.toBeInTheDocument()
	})

	it('filters by queue status', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'}), makeItem({id: 'done', title: 'Finished video', status: 'done', progressPercent: 100})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-filter-done'))

		expect(screen.queryByTestId('queue-manager-row-pending')).not.toBeInTheDocument()
		expect(screen.getByTestId('queue-manager-row-done')).toHaveTextContent('Finished video')
	})

	it('keeps filter, selection, expanded artifacts, and column preferences independent', () => {
		useAppStore.setState({
			queue: [
				makeItem({id: 'pending', title: 'Waiting video', status: 'pending', artifacts: [{id: 'artifact:/downloads/pending.mkv', kind: 'media', path: '/downloads/pending.mkv', fileName: 'pending.mkv', missing: false, discoveredAt: '2026-06-19T10:00:00.000Z'}]}),
				makeItem({id: 'done', title: 'Finished video', status: 'done', progressPercent: 100})
			]
		})

		render(<QueueManagerTab />)

		fireEvent.click(screen.getByTestId('queue-filter-pending'))
		fireEvent.click(screen.getByTestId('queue-manager-row-pending'))
		fireEvent.click(screen.getByRole('button', {name: /show artifacts for waiting video/i}))
		fireEvent.click(screen.getByRole('button', {name: /columns/i}))
		fireEvent.click(screen.getByRole('checkbox', {name: /progress/i}))

		expect(screen.getByTestId('queue-manager-row-pending')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-artifacts-pending')).toHaveTextContent('pending.mkv')
		expect(screen.queryByRole('columnheader', {name: /progress/i})).not.toBeInTheDocument()
		expect(screen.queryByTestId('queue-manager-row-done')).not.toBeInTheDocument()
	})

	it('uses localized Queue Manager chrome and artifact labels', () => {
		i18next.addResource('en', 'translation', 'queue.filterAll', 'Everything')
		i18next.addResource('en', 'translation', 'queue.selectionSummary', '{{selected}} chosen · {{total}} queued')
		i18next.addResource('en', 'translation', 'queue.table.sortBy', 'Order by {{label}}')
		i18next.addResource('en', 'translation', 'queue.table.showArtifactsFor', 'Reveal artifacts for {{title}}')
		i18next.addResource('en', 'translation', 'queue.artifact.media', 'Video file')
		i18next.addResource('en', 'translation', 'queue.artifact.missing', 'Not found')
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', artifacts: [{id: 'artifact:/downloads/video.mkv', kind: 'media', path: '/downloads/video.mkv', fileName: 'video.mkv', missing: true, discoveredAt: '2026-06-18T10:00:00.000Z'}]})]})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('0 chosen · 1 queued')
		expect(screen.getByTestId('queue-filter-all')).toHaveTextContent('Everything')
		expect(screen.getByRole('button', {name: 'Order by Title'})).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', {name: 'Reveal artifacts for Finished video'}))
		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('Video file')
		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('Not found')
	})

	it('applies a selection-aware pause action to selected rows', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'}), makeItem({id: 'done', title: 'Finished video', status: 'done'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-pending'))
		fireEvent.click(screen.getByTestId('queue-action-pause'))

		expect(actions.applyQueueSelectionAction).toHaveBeenCalledWith('pause', ['pending'])
		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('1 selected')
	})

	it('renders selected actions as compact icon buttons with disabled location explanation', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-done'))

		const toolbar = screen.getByTestId('queue-selected-actions')
		expect(within(toolbar).getByTestId('queue-action-pause')).toHaveAccessibleName('Pause')
		expect(within(toolbar).getByTestId('queue-action-pause').textContent).toBe('')
		const setLocation = within(toolbar).getByTestId('queue-action-change-output-target')
		expect(setLocation).toBeDisabled()
		expect(setLocation).toHaveAttribute('title', 'Select pending items to set location.')
	})

	it('promotes selected pending rows with Pull now', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-pending'))
		fireEvent.click(screen.getByRole('button', {name: /pull now/i}))

		expect(actions.applyQueueSelectionAction).toHaveBeenCalledWith('pull-now', ['pending'])
	})

	it('drops selected ids when rows leave the queue', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-done'))
		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('1 selected')

		useAppStore.setState({queue: []})

		await waitFor(() => expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('0 selected'))
		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('0 total')
	})

	it('supports keyboard row selection with Space', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})]})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-pending')
		row.focus()
		fireEvent.keyDown(row, {key: ' '})

		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('1 selected')
	})

	it('supports keyboard row selection with Enter', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})]})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-pending')
		row.focus()
		fireEvent.keyDown(row, {key: 'Enter'})

		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('1 selected')
	})

	it('plain-clicking a row replaces the previous row selection', () => {
		useAppStore.setState({queue: [makeItem({id: 'first', title: 'First video', status: 'pending'}), makeItem({id: 'second', title: 'Second video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.click(screen.getByTestId('queue-manager-row-second'))

		expect(screen.getByTestId('queue-manager-row-first')).not.toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveClass('queue-manager-row-selected')
		expect(screen.getByTestId('queue-selection-summary')).toHaveTextContent('1 selected')
	})

	it('Ctrl-click toggles a row while preserving the rest of the selection', () => {
		useAppStore.setState({queue: [makeItem({id: 'first', title: 'First video', status: 'pending'}), makeItem({id: 'second', title: 'Second video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.click(screen.getByTestId('queue-manager-row-second'), {ctrlKey: true})
		fireEvent.click(screen.getByTestId('queue-manager-row-first'), {ctrlKey: true})

		expect(screen.getByTestId('queue-manager-row-first')).not.toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
	})

	it('Meta-click toggles a row while preserving the rest of the selection', () => {
		useAppStore.setState({queue: [makeItem({id: 'first', title: 'First video', status: 'pending'}), makeItem({id: 'second', title: 'Second video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.click(screen.getByTestId('queue-manager-row-second'), {metaKey: true})

		expect(screen.getByTestId('queue-manager-row-first')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
	})

	it('Shift-click selects the visible range from the last anchor row', () => {
		useAppStore.setState({
			queue: [
				makeItem({id: 'first', title: 'First video', status: 'pending', addedAt: '2026-06-19T09:03:00.000Z'}),
				makeItem({id: 'second', title: 'Second video', status: 'pending', addedAt: '2026-06-19T09:02:00.000Z'}),
				makeItem({id: 'third', title: 'Third video', status: 'pending', addedAt: '2026-06-19T09:01:00.000Z'})
			]
		})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.click(screen.getByTestId('queue-manager-row-third'), {shiftKey: true})

		expect(screen.getByTestId('queue-manager-row-first')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-third')).toHaveAttribute('aria-selected', 'true')
	})

	it('holding left click and dragging across rows adds them to the selection', () => {
		useAppStore.setState({
			queue: [
				makeItem({id: 'first', title: 'First video', status: 'pending', addedAt: '2026-06-19T09:03:00.000Z'}),
				makeItem({id: 'second', title: 'Second video', status: 'pending', addedAt: '2026-06-19T09:02:00.000Z'}),
				makeItem({id: 'third', title: 'Third video', status: 'pending', addedAt: '2026-06-19T09:01:00.000Z'})
			]
		})

		render(<QueueManagerTab />)
		fireEvent.pointerDown(screen.getByTestId('queue-manager-row-first'), {button: 0, buttons: 1})
		fireEvent.pointerEnter(screen.getByTestId('queue-manager-row-second'), {buttons: 1})
		fireEvent.pointerEnter(screen.getByTestId('queue-manager-row-third'), {buttons: 1})
		fireEvent.pointerUp(window, {button: 0, buttons: 0})

		expect(screen.getByTestId('queue-manager-row-first')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-third')).toHaveAttribute('aria-selected', 'true')
	})

	it('drag selection shrinks when dragging back to the anchor row', () => {
		useAppStore.setState({
			queue: [
				makeItem({id: 'first', title: 'First video', status: 'pending', addedAt: '2026-06-19T09:03:00.000Z'}),
				makeItem({id: 'second', title: 'Second video', status: 'pending', addedAt: '2026-06-19T09:02:00.000Z'}),
				makeItem({id: 'third', title: 'Third video', status: 'pending', addedAt: '2026-06-19T09:01:00.000Z'})
			]
		})

		render(<QueueManagerTab />)
		fireEvent.pointerDown(screen.getByTestId('queue-manager-row-first'), {button: 0, buttons: 1})
		fireEvent.pointerEnter(screen.getByTestId('queue-manager-row-third'), {buttons: 1})
		fireEvent.pointerEnter(screen.getByTestId('queue-manager-row-first'), {buttons: 1})
		fireEvent.pointerUp(window, {button: 0, buttons: 0})

		expect(screen.getByTestId('queue-manager-row-first')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).not.toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-third')).not.toHaveAttribute('aria-selected', 'true')
	})

	it('expands inline artifacts for a queue item', () => {
		useAppStore.setState({
			queue: [
				makeItem({
					id: 'done',
					title: 'Finished video',
					status: 'done',
					artifacts: [
						{id: 'artifact:/downloads/video.mkv', kind: 'media', path: '/downloads/video.mkv', fileName: 'video.mkv', discoveredAt: '2026-06-18T10:00:00.000Z'},
						{id: 'artifact:/downloads/video.en.vtt', kind: 'subtitle', path: '/downloads/video.en.vtt', fileName: 'video.en.vtt', discoveredAt: '2026-06-18T10:00:00.000Z'}
					]
				})
			]
		})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-done')
		fireEvent.click(within(row).getByRole('button', {name: /show artifacts/i}))

		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('video.mkv')
		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('video.en.vtt')
	})

	it('keeps expanded artifacts aligned with visible columns at responsive widths', () => {
		Object.defineProperty(window, 'innerWidth', {configurable: true, writable: true, value: 840})
		const longFileName = `${'What_is_happening_at_Meta_'.repeat(18)}[00CepY3H8k4].webm`
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', artifacts: [{id: 'artifact:/downloads/long.webm', kind: 'media', path: `/downloads/${longFileName}`, fileName: longFileName, discoveredAt: '2026-06-18T10:00:00.000Z'}]})]})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-done')
		fireEvent.click(within(row).getByRole('button', {name: /show artifacts/i}))

		expect(screen.getByTestId('queue-artifacts-done').querySelector('td')).toHaveAttribute('colspan', '5')
	})

	it('hides internal artifacts from inline artifacts', () => {
		useAppStore.setState({
			queue: [
				makeItem({
					id: 'done',
					title: 'Finished video',
					status: 'done',
					artifacts: [
						{id: 'artifact:/downloads/video.info.json', kind: 'companion', path: '/downloads/video.info.json', fileName: 'video.info.json', discoveredAt: '2026-06-18T10:00:00.000Z'},
						{id: 'artifact:/downloads/.arroxy-temp/item/_arroxy.info.json', kind: 'companion', path: '/downloads/.arroxy-temp/item/_arroxy.info.json', fileName: '_arroxy.info.json', discoveredAt: '2026-06-18T10:00:00.000Z'},
						{id: 'artifact:/internal/probe.info.json', kind: 'companion', path: '/internal/probe.info.json', fileName: 'probe.info.json', discoveredAt: '2026-06-18T10:00:00.000Z', internal: true}
					]
				})
			]
		})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-done')
		fireEvent.click(within(row).getByRole('button', {name: /show artifacts/i}))

		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('video.info.json')
		expect(screen.getByTestId('queue-artifacts-done')).not.toHaveTextContent('_arroxy.info.json')
		expect(screen.getByTestId('queue-artifacts-done')).not.toHaveTextContent('probe.info.json')
	})

	it('keyboard interaction inside the artifacts button does not toggle row selection', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', artifacts: [{id: 'artifact:/downloads/video.mkv', kind: 'media', path: '/downloads/video.mkv', fileName: 'video.mkv', discoveredAt: '2026-06-18T10:00:00.000Z'}]})]})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-done')
		const artifactsButton = within(row).getByRole('button', {name: /show artifacts/i})
		artifactsButton.focus()
		fireEvent.keyDown(artifactsButton, {key: 'Enter'})
		fireEvent.click(artifactsButton)

		expect(row).not.toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-artifacts-done')).toHaveTextContent('video.mkv')
	})

	it('sets location for selected pending rows after choosing a folder', async () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending', outputDir: '/downloads', progressPercent: 0})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-pending'))
		expect(screen.getByRole('button', {name: /set location/i})).toBeEnabled()
		fireEvent.click(screen.getByTestId('queue-action-change-output-target'))

		await waitFor(() => expect(actions.changeQueueOutputTarget).toHaveBeenCalledWith(['pending'], '/archive'))
		expect(window.appApi.dialog.chooseFolder).toHaveBeenCalledWith('/downloads')
	})

	it('disables Set location and shows the pending-only hint for ineligible selection', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-done'))

		const setLocation = screen.getByRole('button', {name: /set location/i})
		expect(setLocation).toBeDisabled()
		expect(setLocation).toHaveAttribute('title', 'Select pending items to set location.')
		expect(screen.getByTestId('queue-selected-actions')).not.toHaveTextContent('Select pending items to set location.')
	})

	it('explains disabled Set location in the context menu', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-done'))

		const setLocation = await screen.findByRole('menuitem', {name: /set location/i})
		expect(setLocation).toHaveAttribute('aria-disabled', 'true')
		expect(setLocation).toHaveAttribute('title', 'Select pending items to set location.')
		expect(setLocation).toHaveTextContent('Pending only')
	})

	it('lets disabled state override destructive context menu color', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-done'))

		const cancelItem = await screen.findByRole('menuitem', {name: /cancel/i})
		expect(cancelItem).toHaveAttribute('aria-disabled', 'true')
		expect(cancelItem).toHaveClass('data-[variant=destructive]:data-disabled:text-muted-foreground')
	})

	it('right-clicking an unselected row replaces the current selection for context actions', async () => {
		useAppStore.setState({queue: [makeItem({id: 'first', title: 'First video', status: 'pending'}), makeItem({id: 'second', title: 'Second video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-second'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /pause/i}))

		expect(screen.getByTestId('queue-manager-row-first')).not.toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
		expect(actions.applyQueueSelectionAction).toHaveBeenCalledWith('pause', ['second'])
	})

	it('right-clicking a selected row keeps the current selection for context actions', async () => {
		useAppStore.setState({queue: [makeItem({id: 'first', title: 'First video', status: 'pending'}), makeItem({id: 'second', title: 'Second video', status: 'pending'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-first'))
		fireEvent.click(screen.getByTestId('queue-manager-row-second'), {ctrlKey: true})
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-second'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /pause/i}))

		expect(screen.getByTestId('queue-manager-row-first')).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('queue-manager-row-second')).toHaveAttribute('aria-selected', 'true')
		expect(actions.applyQueueSelectionAction).toHaveBeenCalledWith('pause', ['first', 'second'])
	})

	it('copies a row link from the context menu', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', url: 'https://www.youtube.com/watch?v=copy-me'})]})

		render(<QueueManagerTab />)
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-done'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /copy link/i}))

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://www.youtube.com/watch?v=copy-me')
	})

	it('persists column visibility changes', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', addedAt: '2026-06-19T09:00:00.000Z', finishedAt: '2026-06-19T09:05:00.000Z'})]})

		const {unmount} = render(<QueueManagerTab />)
		const columnsButton = screen.getByRole('button', {name: /columns/i})
		expect(columnsButton.textContent).toBe('')
		fireEvent.click(columnsButton)
		fireEvent.click(screen.getByRole('checkbox', {name: /finished/i}))
		expect(screen.getByRole('columnheader', {name: /finished/i})).toBeInTheDocument()

		unmount()
		render(<QueueManagerTab />)

		expect(screen.getByRole('columnheader', {name: /finished/i})).toBeInTheDocument()
	})

	it('labels global queue actions as applying to all items', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})]})

		render(<QueueManagerTab />)

		const group = screen.getByRole('group', {name: 'All items'})
		expect(group).toHaveTextContent('All items')
		expect(screen.getByTestId('btn-pause-all')).toHaveAccessibleName('Pause every active download and stop new ones from starting')
		expect(screen.getByTestId('btn-pause-all').textContent).toBe('')
		expect(screen.getByTestId('btn-resume-first')).toHaveAccessibleName('Resume paused downloads and let the queue keep going')
		expect(screen.getByTestId('btn-clear-completed')).toHaveAccessibleName('Clear completed downloads')
	})

	it('persists sorting across remounts', () => {
		useAppStore.setState({queue: [makeItem({id: 'z', title: 'Zeta video', status: 'pending', addedAt: '2026-06-19T09:00:00.000Z'}), makeItem({id: 'a', title: 'Alpha video', status: 'pending', addedAt: '2026-06-19T09:01:00.000Z'})]})

		const {unmount} = render(<QueueManagerTab />)
		fireEvent.click(screen.getByRole('button', {name: /sort by title/i}))
		expect(screen.getAllByTestId('queue-title').map(node => node.textContent)).toEqual(['Alpha video', 'Zeta video'])

		unmount()
		render(<QueueManagerTab />)

		expect(screen.getAllByTestId('queue-title').map(node => node.textContent)).toEqual(['Alpha video', 'Zeta video'])
	})
})

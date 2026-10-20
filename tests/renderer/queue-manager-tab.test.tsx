import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueManagerTab} from '@renderer/components/queue/QueueManagerTab.js'
import * as hintComponents from '@renderer/components/shared/Hint.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {expectHint} from '../shared/hint.js'

// matchMedia over a mutable viewport width: `(max-width: Npx)` lists re-evaluate
// on resize and notify their change listeners, as the browser does.
const viewport = vi.hoisted(() => ({width: 1280, lists: new Set<{query: string; matches: boolean; listeners: Set<() => void>}>()}))

function maxWidthMatches(query: string): boolean {
	const match = /\(max-width:\s*(\d+)px\)/.exec(query)
	return match ? viewport.width <= Number(match[1]) : false
}

function stubViewport(width: number): void {
	viewport.width = width
	viewport.lists.clear()
	Object.defineProperty(window, 'innerWidth', {configurable: true, writable: true, value: width})
	vi.stubGlobal('matchMedia', (query: string) => {
		const list = {query, matches: maxWidthMatches(query), listeners: new Set<() => void>()}
		viewport.lists.add(list)
		return {
			media: query,
			get matches() {
				return maxWidthMatches(query)
			},
			addEventListener: (_type: 'change', listener: () => void) => list.listeners.add(listener),
			removeEventListener: (_type: 'change', listener: () => void) => list.listeners.delete(listener)
		}
	})
}

function resizeViewport(width: number): void {
	viewport.width = width
	Object.defineProperty(window, 'innerWidth', {configurable: true, writable: true, value: width})
	for (const list of viewport.lists) {
		const matches = maxWidthMatches(list.query)
		if (matches === list.matches) continue
		list.matches = matches
		for (const listener of list.listeners) listener()
	}
}

const virtualRange = vi.hoisted(() => ({start: 0, count: 12, estimateSize: 62}))
const scrollToIndex = vi.hoisted(() => vi.fn())

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
			measureElement: () => undefined,
			scrollToIndex
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
	setAutoRemoveCompleted: vi.fn(),
	setItemLane: vi.fn(),
	cancelItemDownload: vi.fn(),
	pauseItemDownload: vi.fn(),
	resumeItemDownload: vi.fn(),
	removeQueueItem: vi.fn(),
	retryQueueItem: vi.fn(),
	changeQueueOutputTarget: vi.fn()
}

beforeEach(() => {
	scrollToIndex.mockReset()
	virtualRange.start = 0
	virtualRange.count = 12
	virtualRange.estimateSize = 62
	stubViewport(1280)
	window.localStorage.clear()
	for (const fn of Object.values(actions)) fn.mockReset()
	actions.applyQueueSelectionAction.mockResolvedValue({ok: true, data: {action: 'pause', appliedIds: [], skipped: []}})
	actions.changeQueueOutputTarget.mockResolvedValue(ok({outputDir: '/archive', items: [], skipped: []}))
	Object.defineProperty(navigator, 'clipboard', {writable: true, configurable: true, value: {writeText: vi.fn().mockResolvedValue(undefined)}})
	const api = buildMockAppApi()
	vi.mocked(api.dialog.chooseFolder).mockResolvedValue(ok({path: '/archive'}))
	window.appApi = api
	useAppStore.setState({queue: [], queueFocus: null, ...actions})
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	Reflect.deleteProperty(navigator, 'clipboard')
	i18next.removeResourceBundle('en', 'translation')
	i18next.addResourceBundle('en', 'translation', en, true, true)
})

function headerNames(): string[] {
	return screen.getAllByRole('columnheader').map(header => header.textContent?.trim() ?? '')
}

// Each header's share of the table width, keyed by its label.
function headerWidths(): Record<string, number> {
	return Object.fromEntries(screen.getAllByRole('columnheader').map(header => [header.textContent?.trim() ?? '', Number.parseFloat(header.style.width)]))
}

// jsdom lays nothing out: give the table a width and each header a box in
// column order, so resize and keyboard reordering can measure them. Columns
// are 100px unless `widths` says otherwise, and run right to left when `rtl`.
function stubTableGeometry({widths = [], rtl = false}: {widths?: readonly number[]; rtl?: boolean} = {}): void {
	const tableWidth = 1000
	const rect = (left: number, width: number): DOMRect => ({x: left, y: 0, left, top: 0, width, height: 40, right: left + width, bottom: 40, toJSON: () => ({})})
	const widthAt = (index: number): number => widths[index] ?? 100
	vi.spyOn(HTMLTableElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(0, tableWidth))
	vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLTableCellElement) {
		const start = Array.from({length: this.cellIndex}, (_, index) => widthAt(index)).reduce((sum, width) => sum + width, 0)
		const width = widthAt(this.cellIndex)
		return rect(rtl ? tableWidth - start - width : start, width)
	})
}

// Picks a header up with Space, presses `arrow` once and drops it.
async function moveColumnWithKeyboard(header: HTMLElement, arrow: 'ArrowLeft' | 'ArrowRight'): Promise<void> {
	const settle = (): Promise<void> =>
		act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0))
		})
	header.focus()
	fireEvent.keyDown(header, {code: 'Space', key: ' '})
	await settle()
	fireEvent.keyDown(document, {code: arrow, key: arrow})
	await settle()
	fireEvent.keyDown(document, {code: 'Space', key: ' '})
}

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
		expect(screen.getByTestId('queue-manager-row-pending')).toHaveAttribute('data-status', 'pending')
		expect(screen.getByTestId('queue-manager-row-running')).toHaveAttribute('data-status', 'running')
	})

	it('gives every default column a fixed width share that adds up to the whole table', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})

		render(<QueueManagerTab />)

		expect(screen.getByRole('columnheader', {name: /size/i})).toBeInTheDocument()
		// The table uses a fixed layout: a header without a width collapses to
		// nothing and its label spills over the next column.
		const widths = headerWidths()
		expect(Object.values(widths).every(width => width > 0)).toBe(true)
		expect(Object.values(widths).reduce((sum, width) => sum + width, 0)).toBeCloseTo(100)
	})

	it('resizes a column from the keyboard by trading width with its right neighbour, and remembers it', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		stubTableGeometry()

		const {unmount} = render(<QueueManagerTab />)
		const before = headerWidths()
		const handle = screen.getByRole('separator', {name: 'Resize Title column'})
		fireEvent.keyDown(handle, {key: 'ArrowRight'})
		fireEvent.keyDown(handle, {key: 'ArrowRight'})
		const after = headerWidths()

		expect(after.Title).toBeGreaterThan(before.Title ?? 0)
		expect(after.Status).toBeLessThan(before.Status ?? 0)
		expect((after.Title ?? 0) + (after.Status ?? 0)).toBeCloseTo((before.Title ?? 0) + (before.Status ?? 0))
		expect(after.Progress).toBeCloseTo(before.Progress ?? 0)

		unmount()
		render(<QueueManagerTab />)
		expect(headerWidths().Title).toBeCloseTo(after.Title ?? 0)
	})

	it('resizes a column by dragging its edge and saves the width on release', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		stubTableGeometry()

		const {unmount} = render(<QueueManagerTab />)
		const before = headerWidths()
		const handle = screen.getByRole('separator', {name: 'Resize Status column'})
		fireEvent.pointerDown(handle, {pointerId: 1, button: 0, clientX: 300})
		// 30px of a 1000px table is 3% of it.
		fireEvent.pointerMove(handle, {pointerId: 1, clientX: 330})
		const during = headerWidths()
		expect(during.Status).toBeCloseTo((before.Status ?? 0) + 3)
		expect(during.Progress).toBeCloseTo((before.Progress ?? 0) - 3)
		fireEvent.pointerUp(handle, {pointerId: 1, clientX: 330})

		unmount()
		render(<QueueManagerTab />)
		expect(headerWidths().Status).toBeCloseTo(during.Status ?? 0)
	})

	it('has no resize handle after the last column', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})

		render(<QueueManagerTab />)

		expect(screen.queryByRole('separator', {name: 'Resize Added column'})).not.toBeInTheDocument()
		expect(screen.getByRole('separator', {name: 'Resize Size column'})).toBeInTheDocument()
	})

	it('sorts from the keyboard instead of picking the column up', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		stubTableGeometry()

		render(<QueueManagerTab />)
		const sortByTitle = screen.getByRole('button', {name: /sort by title/i})
		sortByTitle.focus()

		// A prevented keydown would stop the button from activating.
		expect(fireEvent.keyDown(sortByTitle, {code: 'Enter', key: 'Enter'})).toBe(true)
		expect(fireEvent.keyDown(sortByTitle, {code: 'Space', key: ' '})).toBe(true)
	})

	it('moves a wide column one place in a right-to-left table', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		// Title wide and Status narrow, so an edge-aligned move would overshoot.
		stubTableGeometry({widths: [332, 48], rtl: true})

		render(<QueueManagerTab />)
		await moveColumnWithKeyboard(screen.getByRole('columnheader', {name: /title/i}), 'ArrowLeft')

		await waitFor(() => expect(headerNames().slice(0, 3)).toEqual(['Status', 'Title', 'Progress']))
	})

	it('moves a column with the keyboard and remembers the new order', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		stubTableGeometry()

		const {unmount} = render(<QueueManagerTab />)
		const title = screen.getByRole('columnheader', {name: /title/i})
		title.focus()
		fireEvent.keyDown(title, {code: 'Space', key: ' '})
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0))
		})
		fireEvent.keyDown(document, {code: 'ArrowRight', key: 'ArrowRight'})
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0))
		})
		fireEvent.keyDown(document, {code: 'Space', key: ' '})

		await waitFor(() => expect(headerNames().slice(0, 2)).toEqual(['Status', 'Title']))
		unmount()
		render(<QueueManagerTab />)
		expect(headerNames().slice(0, 2)).toEqual(['Status', 'Title'])
	})

	it('resets column order, widths and visibility from the columns menu', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		stubTableGeometry()

		render(<QueueManagerTab />)
		const defaults = headerWidths()
		fireEvent.keyDown(screen.getByRole('separator', {name: 'Resize Title column'}), {key: 'ArrowRight'})
		fireEvent.click(screen.getByRole('button', {name: /columns/i}))
		fireEvent.click(screen.getByRole('menuitemcheckbox', {name: /progress/i}))
		expect(headerNames()).not.toContain('Progress')

		// Checkbox items keep the menu open.
		fireEvent.click(screen.getByRole('menuitem', {name: 'Reset columns'}))

		expect(headerNames()).toContain('Progress')
		expect(headerWidths().Title).toBeCloseTo(defaults.Title ?? 0)
	})

	it('formats queue dates with a shared formatter instead of per-cell locale lookups', () => {
		const addedAt = '2026-06-19T09:00:00.000Z'
		const nextAddedAt = '2027-01-01T09:00:00.000Z'
		const format = (value: string): string => new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(value))
		const [addedLabel, nextAddedLabel] = [format(addedAt), format(nextAddedAt)]
		const running = makeItem({id: 'running', status: 'running', progressPercent: 42, addedAt})
		// Two spies, because each misses one regression: toLocaleString builds its
		// formatter inside V8, out of the constructor spy's sight, and a per-cell
		// formatter never touches toLocaleString.
		const formatDate = vi.spyOn(Date.prototype, 'toLocaleString')
		const buildFormatter = vi.spyOn(Intl, 'DateTimeFormat')
		try {
			useAppStore.setState({queue: [running]})
			render(<QueueManagerTab />)
			expect(screen.getByTestId('queue-manager-row-running')).toHaveTextContent(addedLabel)
			const builtOnMount = buildFormatter.mock.calls.length
			expect(builtOnMount).toBeLessThanOrEqual(1)

			act(() => useAppStore.setState({queue: [{...running, progressPercent: 58, addedAt: nextAddedAt}]}))
			expect(screen.getByTestId('queue-manager-row-running')).toHaveTextContent(nextAddedLabel)
			expect(buildFormatter).toHaveBeenCalledTimes(builtOnMount)
			expect(formatDate).not.toHaveBeenCalled()
		} finally {
			buildFormatter.mockRestore()
			formatDate.mockRestore()
		}
	})

	it('only recalculates progress cells whose percentage changed', () => {
		const first = makeItem({id: 'first', status: 'running', progressPercent: 42})
		const second = makeItem({id: 'second', status: 'running', progressPercent: 37.125})
		useAppStore.setState({queue: [first, second]})
		render(<QueueManagerTab />)
		const round = vi.spyOn(Math, 'round')
		try {
			act(() => useAppStore.setState({queue: [{...first, progressPercent: 58}, second]}))
			expect(screen.getByTestId('queue-manager-row-first')).toHaveTextContent('58%')
			expect(screen.getByTestId('queue-manager-row-second')).toHaveTextContent('37%')
			expect(round).toHaveBeenCalledWith(58)
			expect(round).not.toHaveBeenCalledWith(37.125)

			act(() =>
				useAppStore.setState({
					queue: [
						{...first, progressPercent: 58},
						{...second, progressPercent: 39.125}
					]
				})
			)
			expect(screen.getByTestId('queue-manager-row-second')).toHaveTextContent('39%')
			expect(round).toHaveBeenCalledWith(39.125)
		} finally {
			round.mockRestore()
		}
	})

	it('keeps unchanged metadata hints out of progress renders while showing metadata changes', async () => {
		const item = makeItem({id: 'running', status: 'running', progressPercent: 42, formatLabel: '1440p · VP9', outputDir: '/archive/lectures'})
		const renderHint = vi.spyOn(hintComponents, 'Hint')
		try {
			useAppStore.setState({queue: [item]})
			render(<QueueManagerTab />)
			renderHint.mockClear()

			act(() => useAppStore.setState({queue: [{...item, progressPercent: 58}]}))
			const row = screen.getByTestId('queue-manager-row-running')
			expect(row).toHaveTextContent('58%')
			expect(row).toHaveTextContent('1440p · VP9')
			const hintLabels = renderHint.mock.calls.map(([props]) => props.label)
			expect(hintLabels).not.toContain('1440p · VP9')
			expect(hintLabels).not.toContain('/archive/lectures')
			await expectHint(within(row).getByText('1440p · VP9'), '1440p · VP9')

			act(() => useAppStore.setState({queue: [{...item, formatLabel: '1080p · H.264', outputDir: '/archive/videos'}]}))
			expect(row).toHaveTextContent('1080p · H.264')
			expect(row).toHaveTextContent('/archive/videos')
			await expectHint(within(row).getByText('1080p · H.264'), '1080p · H.264')
		} finally {
			renderHint.mockRestore()
		}
	})

	it('does not rebuild closed context actions on progress and still opens actions for the current row', async () => {
		const item = makeItem({id: 'running', status: 'running', progressPercent: 42})
		useAppStore.setState({queue: [item]})
		render(<QueueManagerTab />)
		const translate = vi.spyOn(i18next, 't')
		try {
			act(() => useAppStore.setState({queue: [{...item, progressPercent: 58}]}))
			expect(screen.getByTestId('queue-manager-row-running')).toHaveTextContent('58%')
			expect(translate.mock.calls.map(([key]) => key)).not.toContain('queue.item.pendingOnly')

			fireEvent.contextMenu(screen.getByTestId('queue-manager-row-running'))
			fireEvent.click(await screen.findByRole('menuitem', {name: /pause/i}))
			expect(actions.applyQueueSelectionAction).toHaveBeenCalledWith('pause', ['running'])
		} finally {
			translate.mockRestore()
		}
	})

	it('refreshes an open context menu when its selected item becomes ineligible for a location change', async () => {
		const item = makeItem({id: 'changing', status: 'pending'})
		useAppStore.setState({queue: [item]})
		render(<QueueManagerTab />)
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-changing'))
		expect(await screen.findByRole('menuitem', {name: /set location/i})).not.toHaveAttribute('aria-disabled', 'true')

		act(() => useAppStore.setState({queue: [{...item, status: 'running', progressPercent: 12}]}))
		const location = screen.getByRole('menuitem', {name: /set location/i})
		expect(location).toHaveAttribute('aria-disabled', 'true')
		fireEvent.click(location)
		expect(window.appApi.dialog.chooseFolder).not.toHaveBeenCalled()
	})

	it('flags a finished row whose files are all gone in its size cell', () => {
		const file = {id: 'artifact:/d/gone.mp4', kind: 'media' as const, path: '/d/gone.mp4', fileName: 'gone.mp4', discoveredAt: '2026-10-01T10:00:00.000Z'}
		useAppStore.setState({queue: [makeItem({id: 'gone', status: 'done', artifacts: [{...file, missing: true}]}), makeItem({id: 'sized', status: 'done', artifacts: [{...file, id: 'artifact:/d/kept.mp4', path: '/d/kept.mp4', sizeBytes: 2048}]})]})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('queue-manager-row-gone')).toHaveTextContent('Missing')
		expect(screen.getByTestId('queue-manager-row-sized')).toHaveTextContent('2 KiB')
		expect(screen.getByTestId('queue-manager-row-sized')).not.toHaveTextContent('Missing')
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

		// Size containment keeps 5000 rows out of the panel's height; the scroll box takes the height left.
		expect(screen.getByTestId('queue-manager-scroll')).toHaveClass('contain-size', 'flex-1', 'min-h-48')
		// The table's own wrapper must not scroll, or the sticky header pins to it instead of to the scroll box.
		expect(screen.getByTestId('queue-manager-scroll').querySelector('[data-slot="table-container"]')).toHaveClass('overflow-visible')
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

	it('labels a quality-limited finished row briefly and explains it in the tooltip', async () => {
		useAppStore.setState({queue: [makeItem({id: 'limited', title: 'Limited video', status: 'done', progressPercent: 100, lastStatus: {key: 'qualityLimited', params: {height: 360}}}), makeItem({id: 'plain', title: 'Plain video', status: 'done', progressPercent: 100, lastStatus: {key: 'complete'}})]})

		render(<QueueManagerTab />)

		const notices = screen.getAllByTestId('queue-quality-warning')
		expect(notices).toHaveLength(1)
		expect(notices[0]).toHaveTextContent('Limited to 360p')
		expect(notices[0]).not.toHaveAttribute('title')
		await expectHint(notices[0], /360p[\s\S]*another network/i)
	})

	it('shows one notice covering both a quality limit and failed subtitles', async () => {
		useAppStore.setState({queue: [makeItem({id: 'both', title: 'Both video', status: 'done', progressPercent: 100, lastStatus: {key: 'qualityLimitedSubtitlesFailed', params: {height: 360}}})]})

		render(<QueueManagerTab />)

		const notice = screen.getByTestId('queue-quality-warning')
		expect(notice).toHaveTextContent('Limited to 360p')
		expect(notice.textContent).toMatch(/subtitles/i)
		await expectHint(notice, /subtitles[\s\S]*another network/i)
	})

	it('warns on a finished row whose audio could not be removed, alone or with failed subtitles', async () => {
		useAppStore.setState({queue: [makeItem({id: 'kept', title: 'Kept video', status: 'done', progressPercent: 100, lastStatus: {key: 'audioKept'}}), makeItem({id: 'kept-subs', title: 'Kept subs video', status: 'done', progressPercent: 100, lastStatus: {key: 'audioKeptSubtitlesFailed'}})]})

		render(<QueueManagerTab />)

		const kept = within(screen.getByTestId('queue-manager-row-kept')).getByTestId('queue-audio-warning')
		const keptSubs = within(screen.getByTestId('queue-manager-row-kept-subs')).getByTestId('queue-audio-warning')
		expect(kept).toHaveTextContent('Sound not removed')
		await expectHint(kept, /audio could not be removed/i)
		expect(keptSubs.textContent).toMatch(/subtitles/i)
		await expectHint(keptSubs, /audio could not be removed[\s\S]*subtitles/i)
	})

	it('warns on a finished subtitles-only row that found no subtitles in its languages', async () => {
		useAppStore.setState({queue: [makeItem({id: 'none', title: 'No subs video', status: 'done', progressPercent: 100, lastStatus: {key: 'noSubtitleTracks'}})]})

		render(<QueueManagerTab />)

		const notice = within(screen.getByTestId('queue-manager-row-none')).getByTestId('queue-subs-warning')
		expect(notice).toHaveTextContent('No subtitles found')
		await expectHint(notice, /no subtitles in the chosen languages[\s\S]*nothing was saved/i)
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
		fireEvent.click(screen.getByRole('menuitemcheckbox', {name: /progress/i}))

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

	it('renders selected actions as compact icon buttons with disabled location explanation', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-done'))

		const toolbar = screen.getByTestId('queue-selected-actions')
		expect(within(toolbar).getByTestId('queue-action-pause')).toHaveAccessibleName('Pause')
		expect(within(toolbar).getByTestId('queue-action-pause').textContent).toBe('')
		const setLocation = within(toolbar).getByTestId('queue-action-change-output-target')
		expect(setLocation).toHaveAttribute('aria-disabled', 'true')
		expect(setLocation).not.toHaveAttribute('title')
		await expectHint(setLocation, 'Select pending items to set location.')
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
		stubViewport(840)
		const longFileName = `${'What_is_happening_at_Meta_'.repeat(18)}[00CepY3H8k4].webm`
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', artifacts: [{id: 'artifact:/downloads/long.webm', kind: 'media', path: `/downloads/${longFileName}`, fileName: longFileName, discoveredAt: '2026-06-18T10:00:00.000Z'}]})]})

		render(<QueueManagerTab />)
		const row = screen.getByTestId('queue-manager-row-done')
		fireEvent.click(within(row).getByRole('button', {name: /show artifacts/i}))

		expect(screen.getByTestId('queue-artifacts-done').querySelector('td')).toHaveAttribute('colspan', '5')
	})

	it('re-aligns expanded artifacts when the window crosses a column breakpoint', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', artifacts: [{id: 'artifact:/downloads/video.mkv', kind: 'media', path: '/downloads/video.mkv', fileName: 'video.mkv', discoveredAt: '2026-06-18T10:00:00.000Z'}]})]})

		render(<QueueManagerTab />)
		fireEvent.click(within(screen.getByTestId('queue-manager-row-done')).getByRole('button', {name: /show artifacts/i}))
		const artifactsCell = (): Element | null => screen.getByTestId('queue-artifacts-done').querySelector('td')
		expect(artifactsCell()).toHaveAttribute('colspan', '8')

		act(() => resizeViewport(840))
		expect(artifactsCell()).toHaveAttribute('colspan', '5')

		act(() => resizeViewport(1280))
		expect(artifactsCell()).toHaveAttribute('colspan', '8')
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
		expect(screen.getByRole('button', {name: /set location/i})).not.toHaveAttribute('aria-disabled', 'true')
		fireEvent.click(screen.getByTestId('queue-action-change-output-target'))

		await waitFor(() => expect(actions.changeQueueOutputTarget).toHaveBeenCalledWith(['pending'], '/archive'))
		expect(window.appApi.dialog.chooseFolder).toHaveBeenCalledWith('/downloads')
	})

	it('disables Set location and shows the pending-only hint for ineligible selection', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.click(screen.getByTestId('queue-manager-row-done'))

		const setLocation = screen.getByRole('button', {name: /set location/i})
		expect(setLocation).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId('queue-selected-actions')).not.toHaveTextContent('Select pending items to set location.')
		await expectHint(setLocation, 'Select pending items to set location.')
	})

	it('explains disabled Set location in the context menu', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', outputDir: '/downloads'})]})

		render(<QueueManagerTab />)
		fireEvent.contextMenu(screen.getByTestId('queue-manager-row-done'))

		const setLocation = await screen.findByRole('menuitem', {name: /set location/i})
		expect(setLocation).toHaveAttribute('aria-disabled', 'true')
		expect(setLocation).toHaveAttribute('aria-description', 'Select pending items to set location.')
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
		fireEvent.click(screen.getByRole('menuitemcheckbox', {name: /finished/i}))
		expect(screen.getByRole('columnheader', {name: /finished/i})).toBeInTheDocument()

		unmount()
		render(<QueueManagerTab />)

		expect(screen.getByRole('columnheader', {name: /finished/i})).toBeInTheDocument()
	})

	it('renders row cells only for visible columns', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', title: 'Finished video', status: 'done', addedAt: '2026-06-19T09:00:00.000Z', finishedAt: '2026-06-19T09:05:00.000Z'})]})

		render(<QueueManagerTab />)
		const cellCount = (): number => within(screen.getByTestId('queue-manager-row-done')).getAllByRole('cell').length

		expect(cellCount()).toBe(screen.getAllByRole('columnheader').length)
		const hiddenCellCount = cellCount()

		fireEvent.click(screen.getByRole('button', {name: /columns/i}))
		fireEvent.click(screen.getByRole('menuitemcheckbox', {name: /finished/i}))

		expect(cellCount()).toBe(hiddenCellCount + 1)
		expect(cellCount()).toBe(screen.getAllByRole('columnheader').length)
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

	it('offers a switch that removes finished downloads automatically, off by default', () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})], settings: defaultAppSettings('/tmp')})

		render(<QueueManagerTab />)

		const toggle = screen.getByTestId('queue-auto-remove-toggle')
		expect(toggle).toHaveAccessibleName('Auto-clear done')
		expect(toggle).not.toBeChecked()

		fireEvent.click(toggle)
		expect(actions.setAutoRemoveCompleted).toHaveBeenCalledWith(true)
	})

	it('shows the auto-remove switch on when the setting is on, and turns it off on click', () => {
		const base = defaultAppSettings('/tmp')
		useAppStore.setState({queue: [], settings: {...base, common: {...base.common, autoRemoveCompleted: true}}})

		render(<QueueManagerTab />)

		const toggle = screen.getByTestId('queue-auto-remove-toggle')
		expect(toggle).toBeChecked()

		fireEvent.click(toggle)
		expect(actions.setAutoRemoveCompleted).toHaveBeenCalledWith(false)
	})

	it('shows the paused-queue banner with a resume action while the scheduler is paused and items are waiting', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})], schedulerPaused: true})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('queue-paused-banner')).toBeInTheDocument()
		fireEvent.click(screen.getByTestId('queue-resume-from-banner'))
		expect(actions.resumeAll).toHaveBeenCalledOnce()
	})

	it('hides the paused-queue banner while the scheduler is running', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})], schedulerPaused: false})

		render(<QueueManagerTab />)

		expect(screen.queryByTestId('queue-paused-banner')).not.toBeInTheDocument()
	})

	it('disables pause-all while the queue is already paused', () => {
		useAppStore.setState({queue: [makeItem({id: 'pending', title: 'Waiting video', status: 'pending'})], schedulerPaused: true})

		render(<QueueManagerTab />)

		expect(screen.getByTestId('btn-pause-all')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId('btn-resume-first')).not.toHaveAttribute('aria-disabled', 'true')
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

	describe('a View command', () => {
		it('scrolls to the row, highlights it, and consumes the command', async () => {
			useAppStore.setState({queue: makeLargeQueue(40)})
			render(<QueueManagerTab />)
			act(() => useAppStore.getState().showQueueItem('item-30'))

			// Newest first by default, so the 30th of 40 is the 11th row.
			await waitFor(() => expect(scrollToIndex).toHaveBeenCalledWith(10, {align: 'center'}))
			expect(useAppStore.getState().queueFocus).toBeNull()
			expect(await screen.findByTestId('queue-manager-row-item-30')).toHaveAttribute('data-highlighted', 'true')
			expect(screen.getByTestId('queue-manager-row-item-31')).not.toHaveAttribute('data-highlighted')
		})

		it('clears a status filter that hides the row', async () => {
			useAppStore.setState({queue: [makeItem({id: 'done-1', title: 'Finished', status: 'done'}), makeItem({id: 'waiting', title: 'Waiting', status: 'pending'})]})
			render(<QueueManagerTab />)
			fireEvent.click(screen.getByTestId('queue-filter-done'))
			act(() => useAppStore.getState().showQueueItem('waiting'))

			expect(await screen.findByTestId('queue-manager-row-waiting')).toHaveAttribute('data-highlighted', 'true')
		})

		// The row went away (cancelled, swapped) before View: the command is
		// spent rather than left to highlight something later.
		it('consumes a command for a row that is not in the queue', () => {
			useAppStore.setState({queue: makeLargeQueue(3)})
			render(<QueueManagerTab />)
			act(() => useAppStore.getState().showQueueItem('gone'))
			expect(useAppStore.getState().queueFocus).toBeNull()
			expect(scrollToIndex).not.toHaveBeenCalled()
		})
	})
})

// The column picker is a menu of checkbox items: it stays open while columns
// are toggled, arrows walk the list, and Escape hands focus back.
describe('QueueManagerTab column picker', () => {
	it('toggles columns from a keyboard-driven checkbox menu', async () => {
		useAppStore.setState({queue: [makeItem({id: 'done', status: 'done'})]})
		render(<QueueManagerTab />)
		const trigger = screen.getByTestId('queue-columns-menu')

		trigger.focus()
		fireEvent.keyDown(trigger, {key: 'ArrowDown'})
		const menu = await screen.findByRole('menu')
		const items = within(menu).getAllByRole('menuitemcheckbox')
		await waitFor(() => expect(items).toContain(document.activeElement))
		const focusedIndex = (): number => items.findIndex(item => item === document.activeElement)
		const first = focusedIndex()
		fireEvent.keyDown(menu, {key: 'ArrowDown'})
		await waitFor(() => expect(focusedIndex()).toBeGreaterThan(first))

		const finished = within(menu).getByRole('menuitemcheckbox', {name: /finished/i})
		expect(finished).toHaveAttribute('aria-checked', 'false')
		fireEvent.click(finished)
		expect(await screen.findByRole('columnheader', {name: /finished/i})).toBeInTheDocument()
		expect(screen.getByRole('menu')).toBeInTheDocument()
		expect(within(screen.getByRole('menu')).getByRole('menuitemcheckbox', {name: /finished/i})).toHaveAttribute('aria-checked', 'true')

		fireEvent.keyDown(screen.getByRole('menu'), {key: 'Escape'})
		await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
		await waitFor(() => expect(trigger).toHaveFocus())
	})

	it('keeps always-on columns checked and disabled', async () => {
		render(<QueueManagerTab />)

		fireEvent.click(screen.getByTestId('queue-columns-menu'))
		const title = await screen.findByRole('menuitemcheckbox', {name: /^title$/i})
		expect(title).toHaveAttribute('aria-checked', 'true')
		expect(title).toHaveAttribute('aria-disabled', 'true')
	})
})

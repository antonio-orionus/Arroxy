import {act, render, screen, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueManagerTab} from '@renderer/components/queue/QueueManagerTab.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {HeldProbe, QueueItem, SiteCooldown} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A row main holds for its site's rate-limit cooldown says so in Downloads,
// keeps its status badge (badges match the status filter chips), and drops the
// note once the cooldown runs out. A placeholder row says so only while main
// holds its probe, never once the probe runs (#664). A queued row says so
// whenever its own site cools down, since the queue starts nothing there until
// then, but not while the whole queue is paused: it would not start then anyway.

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => ({
		getTotalSize: () => count * estimateSize(),
		getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size: estimateSize(), start: index * estimateSize()})),
		measureElement: () => undefined,
		scrollToIndex: () => undefined
	})
}))

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const NOW = new Date('2026-10-22T12:00:00Z')
const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const VIMEO = 'https://vimeo.com/76979871'

function probing(id: string, url: string): QueueItem {
	return makeItem({id, status: 'probing', url, title: url, job: UNRESOLVED, probeMode: 'video'})
}

function queued(id: string, url: string): QueueItem {
	return makeItem({id, status: 'pending', url, title: id})
}

function seed(queue: QueueItem[], siteCooldowns: SiteCooldown[], heldProbes: HeldProbe[] = queue.map(item => ({owner: item.id, site: 'youtube'})), schedulerPaused = false): void {
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), queue, siteCooldowns, heldProbes, schedulerPaused})
	render(<QueueManagerTab />)
}

function row(id: string): HTMLElement {
	return screen.getByTestId(`queue-manager-row-${id}`)
}

const youtubeCooling: SiteCooldown = {site: 'youtube', until: new Date(NOW.getTime() + 10 * 60_000).toISOString(), evidence: 'rateLimited'}

beforeEach(() => {
	vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']})
	vi.setSystemTime(NOW)
	window.appApi = buildMockAppApi()
	window.localStorage.clear()
	window.history.replaceState(null, '', '#queue')
})

afterEach(() => {
	vi.useRealTimers()
	window.history.replaceState(null, '', '#download')
})

describe('a probing row whose site is cooling down', () => {
	it('says it waits for the site until the cooldown ends, under the fetching-details badge', () => {
		seed([probing('yt', YOUTUBE)], [youtubeCooling])
		const waiting = within(row('yt')).getByTestId('queue-site-waiting')
		expect(waiting.textContent).toMatch(/^Waits for YouTube until /)
		expect(within(row('yt')).getByText('Fetching details')).toBeInTheDocument()
	})

	it("says nothing on another site's probing row", () => {
		seed([probing('yt', YOUTUBE), probing('vimeo', VIMEO)], [youtubeCooling], [{owner: 'yt', site: 'youtube'}])
		expect(within(row('vimeo')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByTestId('queue-site-waiting')).toBeInTheDocument()
	})

	it('drops the note when the cooldown runs out', () => {
		seed([probing('yt', YOUTUBE)], [youtubeCooling])
		expect(within(row('yt')).getByTestId('queue-site-waiting')).toBeInTheDocument()
		act(() => {
			vi.advanceTimersByTime(10 * 60_000)
		})
		expect(within(row('yt')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByText('Fetching details')).toBeInTheDocument()
	})

	it('says nothing on a row whose probe is running, though its site cools down', () => {
		seed([probing('running', YOUTUBE), probing('held', 'https://www.youtube.com/watch?v=jNQXAC9IVRw')], [youtubeCooling], [{owner: 'held', site: 'youtube'}])
		expect(within(row('running')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
		expect(within(row('held')).getByTestId('queue-site-waiting')).toBeInTheDocument()
	})

	it('names the site a redirect led to, not the one of its link', () => {
		const vimeoCooling: SiteCooldown = {site: 'vimeo.com', until: youtubeCooling.until, evidence: 'rateLimited'}
		seed([probing('short', 'https://short.example/v')], [vimeoCooling], [{owner: 'short', site: 'vimeo.com'}])
		expect(within(row('short')).getByTestId('queue-site-waiting').textContent).toMatch(/^Waits for vimeo\.com until /)
	})
})

describe('a queued row whose site is cooling down', () => {
	it('says it waits for the site until the cooldown ends, under the waiting badge', () => {
		seed([queued('yt', YOUTUBE)], [youtubeCooling], [])
		expect(within(row('yt')).getByTestId('queue-site-waiting').textContent).toMatch(/^Waits for YouTube until /)
		expect(within(row('yt')).getByText('Waiting')).toBeInTheDocument()
	})

	it("says nothing on another site's queued row", () => {
		seed([queued('yt', YOUTUBE), queued('vimeo', VIMEO)], [youtubeCooling], [])
		expect(within(row('vimeo')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByTestId('queue-site-waiting')).toBeInTheDocument()
	})

	it('drops the note when the cooldown runs out', () => {
		seed([queued('yt', YOUTUBE)], [youtubeCooling], [])
		act(() => {
			vi.advanceTimersByTime(10 * 60_000)
		})
		expect(within(row('yt')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByText('Waiting')).toBeInTheDocument()
	})

	it('says nothing while the whole queue is paused', () => {
		seed([queued('yt', YOUTUBE)], [youtubeCooling], [], true)
		expect(within(row('yt')).queryByTestId('queue-site-waiting')).not.toBeInTheDocument()
	})
})

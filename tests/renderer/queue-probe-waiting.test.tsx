import {act, render, screen, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueManagerTab} from '@renderer/components/queue/QueueManagerTab.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {QueueItem, SiteCooldown} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A placeholder row whose probe waits out its site's rate-limit cooldown says
// so in Downloads, keeps its "Fetching details" badge (badges match the status
// filter chips), and drops the note once the cooldown runs out.

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

function seed(queue: QueueItem[], siteCooldowns: SiteCooldown[]): void {
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), queue, siteCooldowns})
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
		const waiting = within(row('yt')).getByTestId('queue-probe-waiting')
		expect(waiting.textContent).toMatch(/^Waits for YouTube until /)
		expect(within(row('yt')).getByText('Fetching details')).toBeInTheDocument()
	})

	it("says nothing on another site's probing row", () => {
		seed([probing('yt', YOUTUBE), probing('vimeo', VIMEO)], [youtubeCooling])
		expect(within(row('vimeo')).queryByTestId('queue-probe-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByTestId('queue-probe-waiting')).toBeInTheDocument()
	})

	it('drops the note when the cooldown runs out', () => {
		seed([probing('yt', YOUTUBE)], [youtubeCooling])
		expect(within(row('yt')).getByTestId('queue-probe-waiting')).toBeInTheDocument()
		act(() => {
			vi.advanceTimersByTime(10 * 60_000)
		})
		expect(within(row('yt')).queryByTestId('queue-probe-waiting')).not.toBeInTheDocument()
		expect(within(row('yt')).getByText('Fetching details')).toBeInTheDocument()
	})
})

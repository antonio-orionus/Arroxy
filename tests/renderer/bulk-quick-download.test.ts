// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {setNotificationSink, type NotificationActions, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {AppApi} from '@shared/api.js'
import {makeItem} from '../shared/fixtures.js'
import {armQueue, BOT_BLOCK, deferredProbe, OTHER_URL, PLAYLIST_URL, queue, VIDEO, VIDEO_URL} from '../shared/quickDownloadHarness.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Bulk URLs' Quick Download goes through link intake in main, as the URL tab's
// does: each accepted link becomes a placeholder row at once, main's probe
// slots pace the probes, and one toast tells the batch.

interface Toast {
	level: NotificationLevel
	message: string
	id: string
	actions: NotificationActions | undefined
}
const toasts: Toast[] = []

const RADIO_URL = 'https://www.youtube.com/watch?v=ghi&list=RDghi'
const MIXED_URL = 'https://www.youtube.com/watch?v=abc&list=PLtest'

let api: AppApi

beforeEach(() => {
	api = buildMockAppApi()
	armQueue(api)
	window.appApi = api
	window.history.replaceState(null, '', '#download')
	toasts.length = 0
	setNotificationSink((level, message, id, actions) => toasts.push({level, message, id, actions}))
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: true, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue: [], queueFocus: null, exploreView: null})
})

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
})

function bulk(urls: string[]): Promise<boolean> {
	return useAppStore.getState().bulkQuickDownload(urls)
}

describe("Bulk URLs' Quick Download", () => {
	it('places one probing row per link at once, last link first, each with its mode', async () => {
		const probe = deferredProbe(api)
		expect(await bulk([VIDEO_URL, PLAYLIST_URL, RADIO_URL])).toBe(true)

		// Newest first in Downloads: placed last to first, the rows read in pasted order.
		expect(queue().map(item => [item.url, item.status, item.probeMode])).toEqual([
			[RADIO_URL, 'probing', 'video'],
			[PLAYLIST_URL, 'probing', 'playlist'],
			[VIDEO_URL, 'probing', 'video']
		])
		expect(probe.calls.map(call => call.url)).toEqual([RADIO_URL, PLAYLIST_URL, VIDEO_URL])
	})

	it('says so in one toast with View on the first link, and no Added toast per link', async () => {
		deferredProbe(api)
		await bulk([VIDEO_URL, OTHER_URL])

		expect(toasts.map(toast => [toast.level, toast.message])).toEqual([['info', 'Added 2 links to Downloads']])
		toasts[0]?.actions?.[0].onClick()
		expect(window.location.hash).toBe('#queue')
		expect(useAppStore.getState().queueFocus?.itemId).toBe(queue().find(item => item.url === VIDEO_URL)?.id)
	})

	it('folds links already in the queue and links not added into the one toast', async () => {
		deferredProbe(api)
		useAppStore.setState({queue: [makeItem({id: 'live', status: 'pending', url: OTHER_URL, title: 'Live'})]})
		const add = api.intake.add
		api.intake.add = vi.fn(input => (input.url === PLAYLIST_URL ? Promise.resolve(fail({code: 'ipc', message: 'refused', recoverable: true} as const)) : add(input)))

		expect(await bulk([VIDEO_URL, OTHER_URL, PLAYLIST_URL])).toBe(true)

		expect(toasts.map(toast => [toast.level, toast.message])).toEqual([['warning', "Added 1 link to Downloads · 1 already in the queue · 1 couldn't be added"]])
	})

	it('keeps the dialog open and says so as an error when no link was placed', async () => {
		api.intake.add = vi.fn(() => Promise.resolve(fail({code: 'ipc', message: 'refused', recoverable: true} as const)))

		expect(await bulk([VIDEO_URL, OTHER_URL])).toBe(false)

		expect(queue()).toEqual([])
		expect(toasts.map(toast => [toast.level, toast.message, toast.actions])).toEqual([['error', "2 links couldn't be added", undefined]])
	})

	it('offers no View while a wizard run is open', async () => {
		deferredProbe(api)
		useAppStore.setState({wizardStep: 'formats'})
		await bulk([VIDEO_URL])
		expect(toasts.map(toast => [toast.message, toast.actions])).toEqual([['Added 1 link to Downloads', undefined]])
	})

	it("still tells each link's later outcome as it comes", async () => {
		const probe = deferredProbe(api)
		await bulk([VIDEO_URL, OTHER_URL])
		toasts.length = 0

		probe.resolve(fail(BOT_BLOCK))
		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(toasts.map(toast => toast.message)).toEqual([expect.stringContaining("Couldn't prepare")]))
	})

	// The placement is told once; what main tells a placed link later (here: its
	// video turned out to be live already, so main dropped the row) toasts as usual.
	it('tells a placed link that turns out to be already queued after the batch toast', async () => {
		const probe = deferredProbe(api)
		useAppStore.setState({queue: [makeItem({id: 'live', status: 'pending', url: VIDEO_URL, title: 'Live'})]})
		await bulk([OTHER_URL])
		expect(toasts.map(toast => toast.message)).toEqual(['Added 1 link to Downloads'])

		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(toasts.map(toast => toast.message)).toEqual(['Added 1 link to Downloads', 'Already in the queue']))
		expect(queue().map(item => item.id)).toEqual(['live'])
	})

	it('sends the whole batch to the review when a link names a video in a list, placing nothing', async () => {
		const probe = deferredProbe(api)
		const startBulkUrls = vi.fn()
		useAppStore.setState({startBulkUrls})

		expect(await bulk([VIDEO_URL, MIXED_URL])).toBe(true)

		expect(startBulkUrls).toHaveBeenCalledWith([VIDEO_URL, MIXED_URL])
		expect(queue()).toEqual([])
		expect(probe.calls).toEqual([])
		expect(toasts).toEqual([])
	})

	it('opens the cookies setup first when it is incomplete, placing nothing', async () => {
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'file', cookiesPath: '  '}}})

		expect(await bulk([VIDEO_URL])).toBe(false)

		expect(useAppStore.getState().cookiesConfigDialogIssue).not.toBeNull()
		expect(queue()).toEqual([])
		expect(toasts).toEqual([])
	})

	it('places nothing for an empty paste', async () => {
		expect(await bulk(['   '])).toBe(false)
		expect(queue()).toEqual([])
	})
})

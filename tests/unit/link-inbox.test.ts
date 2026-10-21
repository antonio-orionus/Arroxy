import {afterEach, describe, expect, it, vi, type Mock} from 'vite-plus/test'
import {buildArroxyLink} from '@main/linkScheme/arroxyLink.js'
import {LinkInbox, type LinkInboxLog, type LinkInboxTarget} from '@main/linkScheme/LinkInbox.js'
import {registerLinkScheme} from '@main/linkScheme/registerLinkScheme.js'
import {createLinkDelivery, type LinkWindow} from '@main/linkScheme/linkDelivery.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

const FIRST = 'https://www.youtube.com/watch?v=first'
const SECOND = 'https://www.youtube.com/watch?v=second'

function fakeLog(): {info: Mock<LinkInboxLog['info']>; warn: Mock<LinkInboxLog['warn']>} {
	return {info: vi.fn<LinkInboxLog['info']>(), warn: vi.fn<LinkInboxLog['warn']>()}
}

function readyInbox(log = fakeLog()): {inbox: LinkInbox; deliver: Mock<LinkInboxTarget['deliver']>; log: ReturnType<typeof fakeLog>} {
	const inbox = new LinkInbox(log)
	const deliver = vi.fn<LinkInboxTarget['deliver']>(() => Promise.resolve(true))
	inbox.attach({deliver})
	inbox.rendererReady()
	return {inbox, deliver, log}
}

afterEach(() => {
	vi.unstubAllEnvs()
	vi.resetModules()
})

describe('LinkInbox', () => {
	it('hands a link to the window as soon as the renderer listens', () => {
		const {inbox, deliver} = readyInbox()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST, expect.any(Function))
	})

	it('keeps a link that arrives before ready until the window exists and the renderer listens', () => {
		const inbox = new LinkInbox(fakeLog())
		const deliver = vi.fn<LinkInboxTarget['deliver']>(() => Promise.resolve(true))
		// macOS delivers the link that launched the app before `ready`.
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.attach({deliver})
		expect(deliver).not.toHaveBeenCalled()
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST, expect.any(Function))
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledOnce()
	})

	it('keeps only the newest link while waiting, the way a newer copy replaces the copied link', () => {
		const inbox = new LinkInbox(fakeLog())
		const deliver = vi.fn<LinkInboxTarget['deliver']>(() => Promise.resolve(true))
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.receive(buildArroxyLink(SECOND), 'open-url')
		inbox.attach({deliver})
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(SECOND, expect.any(Function))
	})

	it('holds links again while the renderer reloads', () => {
		const {inbox, deliver} = readyInbox()
		inbox.rendererGone()
		inbox.receive(buildArroxyLink(FIRST), 'second-instance')
		expect(deliver).not.toHaveBeenCalled()
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST, expect.any(Function))
	})

	it('drops a malformed link silently, with a log line that names why but not the link', () => {
		const {inbox, deliver, log} = readyInbox()
		const raw = `arroxy://open?url=${encodeURIComponent('file:///secret/path')}`
		inbox.receive(raw, 'open-url')
		expect(deliver).not.toHaveBeenCalled()
		expect(log.warn).toHaveBeenCalledExactlyOnceWith('arroxy link ignored', {via: 'open-url', reason: 'notAWebLink'})
		expect(JSON.stringify(log.warn.mock.calls)).not.toContain('secret')
	})

	it('takes the link from a launch or second-instance command line', () => {
		const {inbox, deliver} = readyInbox()
		inbox.receiveArgv(['/opt/Arroxy/arroxy', '--no-sandbox', buildArroxyLink(FIRST)], 'second-instance')
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST, expect.any(Function))
	})

	it('ignores a command line without a link, and one with several', () => {
		const {inbox, deliver, log} = readyInbox()
		inbox.receiveArgv(['/opt/Arroxy/arroxy', FIRST], 'launch')
		expect(log.warn).not.toHaveBeenCalled()
		inbox.receiveArgv(['/opt/Arroxy/arroxy', buildArroxyLink(FIRST), buildArroxyLink(SECOND)], 'second-instance')
		expect(deliver).not.toHaveBeenCalled()
		expect(log.warn).toHaveBeenCalledExactlyOnceWith('arroxy link ignored', {via: 'second-instance', reason: 'severalLinks'})
	})
})

describe('registerLinkScheme', () => {
	it('listens for macOS open-url events and reads the launch command line', () => {
		let openUrl: ((url: string) => void) | null = null
		const inbox = registerLinkScheme({onOpenUrl: listener => (openUrl = listener), onSecondInstance: vi.fn(), argv: ['/opt/Arroxy/arroxy', buildArroxyLink(FIRST)], log: fakeLog()})
		expect(inbox).not.toBeNull()
		expect(openUrl).not.toBeNull()
		const deliver = vi.fn<LinkInboxTarget['deliver']>(() => Promise.resolve(true))
		inbox?.attach({deliver})
		inbox?.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST, expect.any(Function))
		openUrl!(buildArroxyLink(SECOND))
		expect(deliver).toHaveBeenLastCalledWith(SECOND, expect.any(Function))
	})

	it('takes the link of a second launch while the app is still starting', () => {
		let secondInstance: ((argv: readonly string[]) => void) | null = null
		const inbox = registerLinkScheme({onOpenUrl: vi.fn(), onSecondInstance: listener => (secondInstance = listener), argv: ['/opt/Arroxy/arroxy'], log: fakeLog()})
		// Startup is still awaiting settings and the queue: no window yet.
		secondInstance!(['/opt/Arroxy/arroxy', '--', buildArroxyLink(SECOND)])
		const deliver = vi.fn<LinkInboxTarget['deliver']>(() => Promise.resolve(true))
		inbox?.attach({deliver})
		inbox?.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(SECOND, expect.any(Function))
	})

	it('stays inert in a release build, although installers register the scheme', async () => {
		const {registerLinkScheme: register} = await importWithReleaseFlagsOff(() => import('@main/linkScheme/registerLinkScheme.js'))
		const onOpenUrl = vi.fn()
		const onSecondInstance = vi.fn()
		expect(register({onOpenUrl, onSecondInstance, argv: ['/opt/Arroxy/arroxy', buildArroxyLink(FIRST)], log: fakeLog()})).toBeNull()
		expect(onOpenUrl).not.toHaveBeenCalled()
		expect(onSecondInstance).not.toHaveBeenCalled()
	})
})

describe('LinkInbox with a delivery waiting on the clipboard', () => {
	const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

	function wire(): {inbox: LinkInbox; sent: string[]; clipboardRead: () => void} {
		const inbox = new LinkInbox(fakeLog())
		const sent: string[] = []
		const pendingReads: (() => void)[] = []
		const window: LinkWindow = {isDestroyed: () => false, isMinimized: () => false, isVisible: () => true, restore: vi.fn(), show: vi.fn(), focus: vi.fn(), sendLink: url => sent.push(url)}
		const clipboard = {ignoreCurrentClipboard: () => new Promise<void>(resolve => pendingReads.push(resolve))}
		inbox.attach({deliver: createLinkDelivery({window, clipboard, headless: false})})
		inbox.rendererReady()
		return {inbox, sent, clipboardRead: () => pendingReads.splice(0).forEach(resolve => resolve())}
	}

	it('keeps a link whose renderer went away during the clipboard wait until the next one listens', async () => {
		const {inbox, sent, clipboardRead} = wire()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.rendererGone()
		clipboardRead()
		await settle()
		expect(sent).toEqual([])
		inbox.rendererReady()
		clipboardRead()
		await settle()
		expect(sent).toEqual([FIRST])
		inbox.rendererReady()
		clipboardRead()
		await settle()
		expect(sent).toEqual([FIRST])
	})

	it('lets a newer link that arrives during the wait replace the one kept back', async () => {
		const {inbox, sent, clipboardRead} = wire()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.rendererGone()
		inbox.receive(buildArroxyLink(SECOND), 'second-instance')
		clipboardRead()
		await settle()
		inbox.rendererReady()
		clipboardRead()
		await settle()
		expect(sent).toEqual([SECOND])
	})

	it('keeps only the newest of two links whose renderer went away during the wait', async () => {
		const {inbox, sent, clipboardRead} = wire()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.receive(buildArroxyLink(SECOND), 'second-instance')
		inbox.rendererGone()
		clipboardRead()
		await settle()
		inbox.rendererReady()
		clipboardRead()
		await settle()
		expect(sent).toEqual([SECOND])
	})

	it('drops the link when the window is destroyed during the wait', async () => {
		const inbox = new LinkInbox(fakeLog())
		let destroyed = false
		let release!: () => void
		const sendLink = vi.fn()
		const window: LinkWindow = {isDestroyed: () => destroyed, isMinimized: () => false, isVisible: () => true, restore: vi.fn(), show: vi.fn(), focus: vi.fn(), sendLink}
		inbox.attach({deliver: createLinkDelivery({window, clipboard: {ignoreCurrentClipboard: () => new Promise<void>(resolve => (release = resolve))}, headless: false})})
		inbox.rendererReady()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		destroyed = true
		release()
		await settle()
		inbox.rendererReady()
		await settle()
		expect(sendLink).not.toHaveBeenCalled()
	})
})

describe('createLinkDelivery', () => {
	function fakeWindow(state: {visible?: boolean; minimized?: boolean; destroyed?: boolean} = {}): LinkWindow & {calls: string[]} {
		const calls: string[] = []
		return {calls, isDestroyed: () => state.destroyed ?? false, isMinimized: () => state.minimized ?? false, isVisible: () => state.visible ?? true, restore: () => calls.push('restore'), show: () => calls.push('show'), focus: () => calls.push('focus'), sendLink: url => calls.push(`send ${url}`)}
	}

	it('marks the clipboard seen before the window comes forward, then sends the link', async () => {
		const window = fakeWindow({minimized: true, visible: false})
		const clipboard = {
			ignoreCurrentClipboard: vi.fn(() => {
				window.calls.push('ignore clipboard')
				return Promise.resolve()
			})
		}
		await createLinkDelivery({window, clipboard, headless: false})(FIRST, () => true)
		expect(window.calls).toEqual(['ignore clipboard', 'restore', 'show', 'focus', `send ${FIRST}`])
	})

	it('never shows a headless window', async () => {
		const window = fakeWindow({visible: false})
		await createLinkDelivery({window, clipboard: {ignoreCurrentClipboard: () => Promise.resolve()}, headless: true})(FIRST, () => true)
		expect(window.calls).toEqual(['focus', `send ${FIRST}`])
	})

	it('does nothing once the window is gone', async () => {
		const window = fakeWindow({destroyed: true})
		await createLinkDelivery({window, clipboard: {ignoreCurrentClipboard: () => Promise.resolve()}, headless: false})(FIRST, () => true)
		expect(window.calls).toEqual([])
	})
})

import {afterEach, describe, expect, it, vi, type Mock} from 'vite-plus/test'
import {buildArroxyLink} from '@main/linkScheme/arroxyLink.js'
import {LinkInbox, type LinkInboxLog} from '@main/linkScheme/LinkInbox.js'
import {registerLinkScheme} from '@main/linkScheme/registerLinkScheme.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

const FIRST = 'https://www.youtube.com/watch?v=first'
const SECOND = 'https://www.youtube.com/watch?v=second'

function fakeLog(): {info: Mock<LinkInboxLog['info']>; warn: Mock<LinkInboxLog['warn']>} {
	return {info: vi.fn<LinkInboxLog['info']>(), warn: vi.fn<LinkInboxLog['warn']>()}
}

function readyInbox(log = fakeLog()): {inbox: LinkInbox; deliver: Mock<(url: string) => void>; log: ReturnType<typeof fakeLog>} {
	const inbox = new LinkInbox(log)
	const deliver = vi.fn<(url: string) => void>()
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
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST)
	})

	it('keeps a link that arrives before ready until the window exists and the renderer listens', () => {
		const inbox = new LinkInbox(fakeLog())
		const deliver = vi.fn()
		// macOS delivers the link that launched the app before `ready`.
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.attach({deliver})
		expect(deliver).not.toHaveBeenCalled()
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST)
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledOnce()
	})

	it('keeps only the newest link while waiting, the way a newer copy replaces the copied link', () => {
		const inbox = new LinkInbox(fakeLog())
		const deliver = vi.fn()
		inbox.receive(buildArroxyLink(FIRST), 'open-url')
		inbox.receive(buildArroxyLink(SECOND), 'open-url')
		inbox.attach({deliver})
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(SECOND)
	})

	it('holds links again while the renderer reloads', () => {
		const {inbox, deliver} = readyInbox()
		inbox.rendererGone()
		inbox.receive(buildArroxyLink(FIRST), 'second-instance')
		expect(deliver).not.toHaveBeenCalled()
		inbox.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST)
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
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST)
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
		const inbox = registerLinkScheme({onOpenUrl: listener => (openUrl = listener), argv: ['/opt/Arroxy/arroxy', buildArroxyLink(FIRST)], log: fakeLog()})
		expect(inbox).not.toBeNull()
		expect(openUrl).not.toBeNull()
		const deliver = vi.fn()
		inbox?.attach({deliver})
		inbox?.rendererReady()
		expect(deliver).toHaveBeenCalledExactlyOnceWith(FIRST)
		openUrl!(buildArroxyLink(SECOND))
		expect(deliver).toHaveBeenLastCalledWith(SECOND)
	})

	it('stays inert in a release build, although installers register the scheme', async () => {
		const {registerLinkScheme: register} = await importWithReleaseFlagsOff(() => import('@main/linkScheme/registerLinkScheme.js'))
		const onOpenUrl = vi.fn()
		expect(register({onOpenUrl, argv: ['/opt/Arroxy/arroxy', buildArroxyLink(FIRST)], log: fakeLog()})).toBeNull()
		expect(onOpenUrl).not.toHaveBeenCalled()
	})
})

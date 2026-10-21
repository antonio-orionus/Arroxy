import {describe, it, expect, vi, beforeEach, afterEach} from 'vite-plus/test'

vi.mock('electron', () => ({clipboard: {readText: vi.fn()}}))

vi.mock('@shared/ipc', () => ({IPC_CHANNELS: {eventsClipboardUrl: 'events:clipboardUrl'}}))

import {ClipboardWatcher, type WatcherWindow, type WatcherEvent} from '@main/services/ClipboardWatcher.js'

type SendMock = WatcherWindow['send'] & {mock: {calls: unknown[][]}}

interface FakeWindow extends WatcherWindow {
	fire(event: WatcherEvent): void
	setFocused(value: boolean): void
	setVisible(value: boolean): void
	setDestroyed(value: boolean): void
	send: SendMock
}

function makeWindow(opts: {focused?: boolean; visible?: boolean; destroyed?: boolean} = {}): FakeWindow {
	let focused = opts.focused ?? true
	let visible = opts.visible ?? true
	let destroyed = opts.destroyed ?? false
	const listeners = new Map<WatcherEvent, Set<() => void>>()
	const send = vi.fn() as unknown as SendMock
	return {
		isFocused: () => focused,
		isVisible: () => visible,
		isDestroyed: () => destroyed,
		on: (event, cb) => {
			if (!listeners.has(event)) listeners.set(event, new Set())
			listeners.get(event)!.add(cb)
		},
		off: (event, cb) => {
			listeners.get(event)?.delete(cb)
		},
		send,
		fire: event => {
			listeners.get(event)?.forEach(cb => cb())
		},
		setFocused: value => {
			focused = value
		},
		setVisible: value => {
			visible = value
		},
		setDestroyed: value => {
			destroyed = value
		}
	}
}

interface Deferred<T> {
	promise: Promise<T>
	resolve(value: T): void
	reject(reason: unknown): void
}

function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return {promise, resolve, reject}
}

const yt = (id: string): string => `https://www.youtube.com/watch?v=${id}`

describe('ClipboardWatcher', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('ignoreCurrentClipboard keeps an earlier copy from being offered when the window comes forward', async () => {
		const reader = {readText: vi.fn().mockResolvedValue(yt('copiedEarlier'))}
		const win = makeWindow({focused: false})
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)

		await watcher.ignoreCurrentClipboard()
		win.setFocused(true)
		win.fire('focus')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).not.toHaveBeenCalled()

		reader.readText.mockResolvedValue(yt('copiedAfter'))
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('copiedAfter'))
	})

	it('ignoreCurrentClipboard drops a read already in flight', async () => {
		const pending = deferred<string>()
		const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(yt('copiedEarlier'))}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		await vi.advanceTimersByTimeAsync(800)
		expect(reader.readText).toHaveBeenCalledOnce()

		await watcher.ignoreCurrentClipboard()
		pending.resolve(yt('copiedEarlier'))
		await vi.advanceTimersByTimeAsync(1600)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('does not poll when disabled by default', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		new ClipboardWatcher(win, 800, reader)
		reader.readText.mockResolvedValue(yt('abc'))
		await vi.advanceTimersByTimeAsync(5000)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('sends nothing when clipboard has non-URL text', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue('not a url')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('forwards arbitrary http(s) URLs (multi-site support)', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue('https://vimeo.com/12345')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', 'https://vimeo.com/12345')
	})

	it('forwards raw clipboard text when it contains multiple accepted URLs', async () => {
		const text = 'Grab these: https://vimeo.com/12345, https://example.com/video/67890'
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(text)
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', text)
	})

	it('does not forward freeform text with only one accepted URL', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue('watch this later: https://vimeo.com/12345')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('does not forward a link followed by other text', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue('https://vimeo.com/12345 is great')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('does not forward a link to an obvious non-media file', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue('https://example.com/photo.jpg')
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).not.toHaveBeenCalled()
	})

	it('sends the channel with a YouTube URL on detection', async () => {
		const url = yt('abc')
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(url)
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', url)
	})

	it('deduplicates — same URL on consecutive ticks sends only once', async () => {
		const url = yt('abc')
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(url)
		await vi.advanceTimersByTimeAsync(2400)
		expect(win.send).toHaveBeenCalledTimes(1)
	})

	it('sends again when clipboard changes to a new YouTube URL', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)

		reader.readText.mockResolvedValue(yt('first'))
		await vi.advanceTimersByTimeAsync(800)

		reader.readText.mockResolvedValue(yt('second'))
		await vi.advanceTimersByTimeAsync(800)

		expect(win.send).toHaveBeenCalledTimes(2)
		expect(win.send).toHaveBeenLastCalledWith('events:clipboardUrl', yt('second'))
	})

	it('fires for a URL already on clipboard at enable time', async () => {
		// Cold-start scenario: user copies a URL in the browser, then opens (or
		// focuses) Arroxy. The URL was on the clipboard before enable; we still
		// want to surface it.
		const url = yt('preexisting')
		const reader = {readText: vi.fn().mockResolvedValue(url)}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', url)
	})

	it('stops polling after setEnabled(false)', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(yt('abc'))
		await vi.advanceTimersByTimeAsync(800)
		watcher.setEnabled(false)
		await vi.advanceTimersByTimeAsync(2400)
		expect(win.send).toHaveBeenCalledTimes(1)
	})

	it('accepts youtu.be short URLs', async () => {
		const url = 'https://youtu.be/abc123'
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(url)
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledWith('events:clipboardUrl', url)
	})

	it('trims whitespace before sending', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		reader.readText.mockResolvedValue(`  ${yt('abc')}  `)
		await vi.advanceTimersByTimeAsync(800)
		expect(win.send).toHaveBeenCalledWith('events:clipboardUrl', yt('abc'))
	})

	it('dispose clears the interval idempotently', async () => {
		const reader = {readText: vi.fn().mockResolvedValue('')}
		const win = makeWindow()
		const watcher = new ClipboardWatcher(win, 800, reader)
		watcher.setEnabled(true)
		watcher.dispose()
		watcher.dispose()
		reader.readText.mockResolvedValue(yt('abc'))
		await vi.advanceTimersByTimeAsync(2400)
		expect(win.send).not.toHaveBeenCalled()
	})

	describe('focus / visibility gating', () => {
		it('does not start polling when window is not focused at enable time', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow({focused: false})
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			reader.readText.mockResolvedValue(yt('abc'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()
		})

		it('does not start polling when window is hidden at enable time', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow({visible: false})
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			reader.readText.mockResolvedValue(yt('abc'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()
		})

		it('pauses polling on blur and resumes on focus', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow({focused: true})
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)

			reader.readText.mockResolvedValue(yt('first'))
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledTimes(1)

			win.setFocused(false)
			win.fire('blur')

			reader.readText.mockResolvedValue(yt('blurred'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).toHaveBeenCalledTimes(1)

			win.setFocused(true)
			win.fire('focus')
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledTimes(2)
			expect(win.send).toHaveBeenLastCalledWith('events:clipboardUrl', yt('blurred'))
		})

		it('pauses polling on hide and resumes on show', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)

			win.setVisible(false)
			win.fire('hide')
			reader.readText.mockResolvedValue(yt('hidden'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()

			win.setVisible(true)
			win.fire('show')
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledTimes(1)
		})

		it('pauses polling on minimize and resumes on restore', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)

			win.setVisible(false)
			win.fire('minimize')
			reader.readText.mockResolvedValue(yt('mini'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()

			win.setVisible(true)
			win.fire('restore')
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledTimes(1)
		})

		it('dispose detaches focus/visibility listeners', async () => {
			const reader = {readText: vi.fn().mockResolvedValue('')}
			const win = makeWindow()
			const offSpy = vi.spyOn(win, 'off')
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			watcher.dispose()
			// Every event we subscribed to must be detached on dispose.
			const events = new Set(offSpy.mock.calls.map(c => c[0]))
			expect(events).toEqual(new Set(['focus', 'blur', 'show', 'hide', 'minimize', 'restore']))
		})
	})

	// Electron 44 made clipboard.readText() asynchronous, so a read can still be
	// pending when the next tick fires or when the window loses attention.
	describe('async reads', () => {
		it('does not start a second read while one is still pending', async () => {
			const pending = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(yt('next'))}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)

			await vi.advanceTimersByTimeAsync(2400)
			expect(reader.readText).toHaveBeenCalledTimes(1)

			pending.resolve(yt('first'))
			await vi.advanceTimersByTimeAsync(0)
			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('first'))

			await vi.advanceTimersByTimeAsync(800)
			expect(reader.readText).toHaveBeenCalledTimes(2)
			expect(win.send).toHaveBeenLastCalledWith('events:clipboardUrl', yt('next'))
		})

		it('drops a read that resolves after polling was disabled', async () => {
			const pending = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(yt('abc'))}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			watcher.setEnabled(false)
			pending.resolve(yt('abc'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()

			// The dropped read must not count as seen: re-enabling surfaces it.
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('abc'))
		})

		it('drops a read that resolves after the window blurred, and surfaces it on refocus', async () => {
			const pending = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(yt('abc'))}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			win.setFocused(false)
			win.fire('blur')
			pending.resolve(yt('abc'))
			await vi.advanceTimersByTimeAsync(2400)
			expect(win.send).not.toHaveBeenCalled()

			win.setFocused(true)
			win.fire('focus')
			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('abc'))
		})

		it('drops a read from before a blur/focus cycle even if polling restarted', async () => {
			const stale = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(stale.promise).mockResolvedValue(yt('fresh'))}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			win.setFocused(false)
			win.fire('blur')
			win.setFocused(true)
			win.fire('focus')
			stale.resolve(yt('stale'))
			await vi.advanceTimersByTimeAsync(800)

			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('fresh'))
		})

		it('a read that never settles does not wedge polling after a blur/focus cycle', async () => {
			const reader = {
				readText: vi
					.fn()
					.mockReturnValueOnce(new Promise<string>(() => {}))
					.mockResolvedValue(yt('abc'))
			}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			win.setFocused(false)
			win.fire('blur')
			win.setFocused(true)
			win.fire('focus')
			await vi.advanceTimersByTimeAsync(800)

			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('abc'))
		})

		it('drops a read that resolves after dispose', async () => {
			const pending = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise)}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			watcher.dispose()
			pending.resolve(yt('abc'))
			await vi.advanceTimersByTimeAsync(0)
			expect(win.send).not.toHaveBeenCalled()
		})

		it('does not send to a window destroyed while the read was pending', async () => {
			const pending = deferred<string>()
			const reader = {readText: vi.fn().mockReturnValueOnce(pending.promise)}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)
			await vi.advanceTimersByTimeAsync(800)

			win.setDestroyed(true)
			pending.resolve(yt('abc'))
			await vi.advanceTimersByTimeAsync(0)
			expect(win.send).not.toHaveBeenCalled()
		})

		it('keeps polling after a rejected read', async () => {
			const reader = {readText: vi.fn().mockRejectedValueOnce(new Error('clipboard busy')).mockResolvedValue(yt('abc'))}
			const win = makeWindow()
			const watcher = new ClipboardWatcher(win, 800, reader)
			watcher.setEnabled(true)

			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).not.toHaveBeenCalled()

			await vi.advanceTimersByTimeAsync(800)
			expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', yt('abc'))
		})
	})
})

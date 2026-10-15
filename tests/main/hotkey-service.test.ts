import {describe, expect, it} from 'vite-plus/test'
import {HotkeyService, classifyHotkeyClipboard, type HotkeyWindow, type ShortcutRegistry} from '@main/services/HotkeyService.js'

function makeRegistry(): ShortcutRegistry & {handlers: Map<string, () => void>; foreign: Set<string>} {
	const handlers = new Map<string, () => void>()
	const foreign = new Set<string>()
	return {
		handlers,
		foreign,
		register(accelerator, handler) {
			// Electron semantics: register() fails if another app owns the chord,
			// and isRegistered() only reports chords this process owns.
			if (foreign.has(accelerator) || handlers.has(accelerator)) return false
			handlers.set(accelerator, handler)
			return true
		},
		unregister(accelerator) {
			handlers.delete(accelerator)
		},
		isRegistered: accelerator => handlers.has(accelerator)
	}
}

function makeWindow(): HotkeyWindow & {sent: Array<{channel: string; payload: unknown}>; destroy(): void} {
	const sent: Array<{channel: string; payload: unknown}> = []
	let destroyed = false
	return {
		sent,
		destroy: () => {
			destroyed = true
		},
		isVisible: () => true,
		isFocused: () => true,
		isMinimized: () => false,
		isDestroyed: () => destroyed,
		send: (channel, payload) => {
			sent.push({channel, payload})
		}
	}
}

function flushMicrotasks(): Promise<void> {
	return new Promise(resolve => setImmediate(resolve))
}

function deferred<T>(): {promise: Promise<T>; resolve(value: T): void} {
	let resolve!: (value: T) => void
	const promise = new Promise<T>(res => {
		resolve = res
	})
	return {promise, resolve}
}

describe('HotkeyService.apply', () => {
	it('keeps the desired chord inactive until the renderer is ready and unregisters it during reload', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')})

		service.apply(true, 'CommandOrControl+Shift+D')
		expect(service.getState()).toEqual({accelerator: null, registered: false})

		service.setRendererReady(true)
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})

		service.setRendererReady(false)
		expect(service.getState()).toEqual({accelerator: null, registered: false})
	})

	it('registers the accelerator when enabled and reports registered state', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')

		expect(registry.handlers.has('CommandOrControl+Shift+D')).toBe(true)
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})
	})

	it('does not register when disabled', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(false, 'CommandOrControl+Shift+D')

		expect(registry.handlers.size).toBe(0)
		expect(service.getState()).toEqual({accelerator: null, registered: false})
	})

	it('unregisters the previous chord when the accelerator changes', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(true, 'CommandOrControl+Alt+H')

		expect(registry.handlers.has('CommandOrControl+Shift+D')).toBe(false)
		expect(registry.handlers.has('CommandOrControl+Alt+H')).toBe(true)
	})

	it('unregisters everything on disable', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(false, 'CommandOrControl+Shift+D')

		expect(registry.handlers.size).toBe(0)
	})

	it('surfaces a conflict instead of throwing when another app owns the chord', () => {
		const registry = makeRegistry()
		registry.foreign.add('CommandOrControl+Shift+D')
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		expect(() => service.apply(true, 'CommandOrControl+Shift+D')).not.toThrow()
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: false})
	})

	it('keeps working when the wanted chord is already registered by us', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(true, 'CommandOrControl+Shift+D')

		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})
	})

	it('dispose unregisters the chord', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => Promise.resolve('')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.dispose()

		expect(registry.handlers.size).toBe(0)
	})
})

describe('HotkeyService.handleTrigger', () => {
	it('sends a single-URL trigger from clipboard text', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const service = new HotkeyService(window, registry, {readText: () => Promise.resolve('  https://youtu.be/watch?v=one  ')}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		registry.handlers.get('CommandOrControl+Shift+D')!()
		await flushMicrotasks()

		expect(window.sent).toHaveLength(1)
		expect(window.sent[0]?.payload).toEqual({kind: 'single', url: 'https://youtu.be/watch?v=one'})
	})

	it('sends multiple and empty classifications for non-single clipboards', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		let clipboard = 'https://a.example/1, https://b.example/2'
		const service = new HotkeyService(window, registry, {readText: () => Promise.resolve(clipboard)}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		await service.handleTrigger()
		clipboard = 'no url here'
		await service.handleTrigger()

		expect(window.sent.map(entry => entry.payload)).toEqual([{kind: 'multiple'}, {kind: 'empty'}])
	})

	it('does nothing when not registered', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const service = new HotkeyService(window, registry, {readText: () => Promise.resolve('https://a.example/1')}, {rendererReady: true})

		await service.handleTrigger()

		expect(window.sent).toHaveLength(0)
	})

	// Electron 44 made clipboard.readText() asynchronous: the window or the
	// chord can go away while the read is pending.
	it('does not send to a window destroyed while the clipboard read was pending', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const read = deferred<string>()
		const service = new HotkeyService(window, registry, {readText: () => read.promise}, {rendererReady: true})
		service.apply(true, 'CommandOrControl+Shift+D')

		const trigger = service.handleTrigger()
		window.destroy()
		read.resolve('https://a.example/1')
		await trigger

		expect(window.sent).toHaveLength(0)
	})

	it('drops a trigger whose chord was disposed while the clipboard read was pending', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const read = deferred<string>()
		const service = new HotkeyService(window, registry, {readText: () => read.promise}, {rendererReady: true})
		service.apply(true, 'CommandOrControl+Shift+D')

		const trigger = service.handleTrigger()
		service.dispose()
		read.resolve('https://a.example/1')
		await trigger

		expect(window.sent).toHaveLength(0)
	})

	it('treats a rejected clipboard read as an empty clipboard', async () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const service = new HotkeyService(window, registry, {readText: () => Promise.reject(new Error('clipboard busy'))}, {rendererReady: true})
		service.apply(true, 'CommandOrControl+Shift+D')

		await expect(service.handleTrigger()).resolves.toBeUndefined()

		expect(window.sent.map(entry => entry.payload)).toEqual([{kind: 'empty'}])
	})
})

describe('classifyHotkeyClipboard', () => {
	it('classifies trimmed single, multiple, and empty payloads', () => {
		expect(classifyHotkeyClipboard('https://example.com/one')).toEqual({kind: 'single', url: 'https://example.com/one'})
		expect(classifyHotkeyClipboard('one https://example.com/one two https://example.com/two')).toEqual({kind: 'multiple'})
		expect(classifyHotkeyClipboard('   ')).toEqual({kind: 'empty'})
		expect(classifyHotkeyClipboard('just words')).toEqual({kind: 'empty'})
	})
})

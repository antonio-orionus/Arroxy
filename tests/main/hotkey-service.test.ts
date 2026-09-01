import {describe, expect, it} from 'vitest'
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

function makeWindow(): HotkeyWindow & {sent: Array<{channel: string; payload: unknown}>} {
	const sent: Array<{channel: string; payload: unknown}> = []
	return {
		sent,
		isVisible: () => true,
		isFocused: () => true,
		isMinimized: () => false,
		isDestroyed: () => false,
		send: (channel, payload) => {
			sent.push({channel, payload})
		}
	}
}

describe('HotkeyService.apply', () => {
	it('keeps the desired chord inactive until the renderer is ready and unregisters it during reload', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''})

		service.apply(true, 'CommandOrControl+Shift+D')
		expect(service.getState()).toEqual({accelerator: null, registered: false})

		service.setRendererReady(true)
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})

		service.setRendererReady(false)
		expect(service.getState()).toEqual({accelerator: null, registered: false})
	})

	it('registers the accelerator when enabled and reports registered state', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')

		expect(registry.handlers.has('CommandOrControl+Shift+D')).toBe(true)
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})
	})

	it('does not register when disabled', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(false, 'CommandOrControl+Shift+D')

		expect(registry.handlers.size).toBe(0)
		expect(service.getState()).toEqual({accelerator: null, registered: false})
	})

	it('unregisters the previous chord when the accelerator changes', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(true, 'CommandOrControl+Alt+H')

		expect(registry.handlers.has('CommandOrControl+Shift+D')).toBe(false)
		expect(registry.handlers.has('CommandOrControl+Alt+H')).toBe(true)
	})

	it('unregisters everything on disable', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(false, 'CommandOrControl+Shift+D')

		expect(registry.handlers.size).toBe(0)
	})

	it('surfaces a conflict instead of throwing when another app owns the chord', () => {
		const registry = makeRegistry()
		registry.foreign.add('CommandOrControl+Shift+D')
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		expect(() => service.apply(true, 'CommandOrControl+Shift+D')).not.toThrow()
		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: false})
	})

	it('keeps working when the wanted chord is already registered by us', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.apply(true, 'CommandOrControl+Shift+D')

		expect(service.getState()).toEqual({accelerator: 'CommandOrControl+Shift+D', registered: true})
	})

	it('dispose unregisters the chord', () => {
		const registry = makeRegistry()
		const service = new HotkeyService(makeWindow(), registry, {readText: () => ''}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		service.dispose()

		expect(registry.handlers.size).toBe(0)
	})
})

describe('HotkeyService.handleTrigger', () => {
	it('sends a single-URL trigger from clipboard text', () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const service = new HotkeyService(window, registry, {readText: () => '  https://youtu.be/watch?v=one  '}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		registry.handlers.get('CommandOrControl+Shift+D')!()

		expect(window.sent).toHaveLength(1)
		expect(window.sent[0]?.payload).toEqual({kind: 'single', url: 'https://youtu.be/watch?v=one'})
	})

	it('sends multiple and empty classifications for non-single clipboards', () => {
		const registry = makeRegistry()
		const window = makeWindow()
		let clipboard = 'https://a.example/1, https://b.example/2'
		const service = new HotkeyService(window, registry, {readText: () => clipboard}, {rendererReady: true})

		service.apply(true, 'CommandOrControl+Shift+D')
		registry.handlers.get('CommandOrControl+Shift+D')!()
		clipboard = 'no url here'
		registry.handlers.get('CommandOrControl+Shift+D')!()

		expect(window.sent.map(entry => entry.payload)).toEqual([{kind: 'multiple'}, {kind: 'empty'}])
	})

	it('does nothing when not registered', () => {
		const registry = makeRegistry()
		const window = makeWindow()
		const service = new HotkeyService(window, registry, {readText: () => 'https://a.example/1'}, {rendererReady: true})

		service.handleTrigger()

		expect(window.sent).toHaveLength(0)
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

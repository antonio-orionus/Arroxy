// @vitest-environment node
import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vite-plus/test'
import {sharedQuitHooks} from '@main/sharedQuitHooks.js'

class FakeApp extends EventEmitter {
	readonly exit = vi.fn()
	quit(): {defaultPrevented: boolean} {
		const result = {defaultPrevented: false}
		const event = {preventDefault: () => (result.defaultPrevented = true)}
		this.emit('before-quit', event)
		this.emit('will-quit', event)
		return result
	}
}

describe('sharedQuitHooks', () => {
	it('exits only once every hold that stopped the quit has finished', () => {
		const app = new FakeApp()
		const hooks = sharedQuitHooks(app)
		hooks.on('will-quit', event => event.preventDefault())
		hooks.on('will-quit', event => event.preventDefault())
		expect(app.quit().defaultPrevented).toBe(true)
		hooks.exit(0)
		expect(app.exit).not.toHaveBeenCalled()
		hooks.exit(0)
		expect(app.exit).toHaveBeenCalledWith(0)
	})

	it('lets a quit no hold stopped go through, and passes before-quit on untouched', () => {
		const app = new FakeApp()
		const hooks = sharedQuitHooks(app)
		const before = vi.fn()
		hooks.on('before-quit', before)
		hooks.on('will-quit', () => undefined)
		expect(app.quit().defaultPrevented).toBe(false)
		expect(before).toHaveBeenCalledTimes(1)
		expect(app.exit).not.toHaveBeenCalled()
	})

	it('counts a hold once however often it stops the same quit', () => {
		const app = new FakeApp()
		const hooks = sharedQuitHooks(app)
		hooks.on('will-quit', event => {
			event.preventDefault()
			event.preventDefault()
		})
		app.quit()
		hooks.exit(0)
		expect(app.exit).toHaveBeenCalledWith(0)
	})
})

// @vitest-environment node

import {EventEmitter} from 'node:events'
import {describe, expect, it} from 'vite-plus/test'
import {ConnectionSlots, type SlotSocket} from '@main/control/socket/connectionSlots.js'

// Connection slots on the control socket: handshakes and sessions are
// counted apart, so connections that never authenticate (another user's
// read-only pipe end on Windows) cannot lock allowed clients out.

class FakeSocket extends EventEmitter implements SlotSocket {
	destroyed = false
	destroy(): void {
		if (this.destroyed) return
		this.destroyed = true
		this.emit('close')
	}
}

describe('ConnectionSlots', () => {
	it('drops the oldest handshake to admit a new connection when handshakes are full', () => {
		const slots = new ConnectionSlots({sessions: 1, handshakes: 2})
		const [a, b, c] = [new FakeSocket(), new FakeSocket(), new FakeSocket()]
		slots.admit(a)
		slots.admit(b)
		slots.admit(c)
		expect([a.destroyed, b.destroyed, c.destroyed]).toEqual([true, false, false])
	})

	it('moves an authenticated connection out of the handshake count, up to the session cap', () => {
		const slots = new ConnectionSlots({sessions: 1, handshakes: 2})
		const [a, b, c, d] = [new FakeSocket(), new FakeSocket(), new FakeSocket(), new FakeSocket()]
		slots.admit(a)
		expect(slots.promote(a)).toBe(true)
		slots.admit(b)
		slots.admit(c)
		slots.admit(d)
		expect([a.destroyed, b.destroyed]).toEqual([false, true])
		expect(slots.promote(c)).toBe(false)
		a.destroy()
		expect(slots.promote(c)).toBe(true)
	})

	it('frees a slot when its connection closes, and closes them all', () => {
		const slots = new ConnectionSlots({sessions: 1, handshakes: 1})
		const [a, b] = [new FakeSocket(), new FakeSocket()]
		slots.admit(a)
		a.destroy()
		slots.admit(b)
		expect(b.destroyed).toBe(false)
		slots.closeAll()
		expect(b.destroyed).toBe(true)
	})
})

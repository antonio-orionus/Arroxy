// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {LineFrames} from '@main/control/socket/lineFrames.js'

// Newline-delimited frames off the control socket, capped in bytes.

const bytes = (text: string): Buffer => Buffer.from(text, 'utf8')

describe('LineFrames', () => {
	it('splits lines across chunks and skips blank ones', () => {
		const frames = new LineFrames(() => 64)
		expect(frames.push(bytes('{"a":1}\n{"b"'))).toEqual({ok: true, lines: ['{"a":1}']})
		expect(frames.push(bytes(':2}\n\n{"c":3}\n'))).toEqual({ok: true, lines: ['{"b":2}', '{"c":3}']})
	})

	it('keeps a multi-byte character split between chunks whole', () => {
		const frames = new LineFrames(() => 64)
		const line = bytes('"é"\n')
		expect(frames.push(line.subarray(0, 2))).toEqual({ok: true, lines: []})
		expect(frames.push(line.subarray(2))).toEqual({ok: true, lines: ['"é"']})
	})

	it('accepts a frame of exactly the cap and refuses one byte more', () => {
		expect(new LineFrames(() => 4).push(bytes('abcd\n'))).toEqual({ok: true, lines: ['abcd']})
		expect(new LineFrames(() => 4).push(bytes('abcde\n'))).toEqual({ok: false, reason: 'oversized'})
	})

	it('refuses a buffer that grows past the cap with no newline', () => {
		const frames = new LineFrames(() => 4)
		expect(frames.push(bytes('abcd'))).toEqual({ok: true, lines: []})
		expect(frames.push(bytes('e'))).toEqual({ok: false, reason: 'oversized'})
	})

	it('counts the cap in bytes, not characters', () => {
		expect(new LineFrames(() => 4).push(bytes('ééé\n'))).toEqual({ok: false, reason: 'oversized'})
	})

	it('refuses a line that is not UTF-8', () => {
		expect(new LineFrames(() => 8).push(Buffer.from([0xff, 0xfe, 0x0a]))).toEqual({ok: false, reason: 'encoding'})
	})

	it('caps each line by its position, blank lines not counted', () => {
		const frames = new LineFrames(index => (index < 1 ? 4 : 16))
		expect(frames.push(bytes('abcd\n\nabcdefgh\nabcdefghijklmnop'))).toEqual({ok: true, lines: ['abcd', 'abcdefgh']})
		expect(frames.push(bytes('q'))).toEqual({ok: false, reason: 'oversized'})
		expect(new LineFrames(index => (index < 1 ? 4 : 16)).push(bytes('abcde'))).toEqual({ok: false, reason: 'oversized'})
	})
})

// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'
import {balloonNotifier, createSinkNotifier} from '@main/services/hotkeyOsNotifier.js'

// The sink notifier is the E2E assertion point for hotkey OS notifications:
// instead of posting to the OS (undetectable in tests), every notification
// body is appended as one line to a file the spec reads.
describe('createSinkNotifier', () => {
	let dir: string | null = null

	afterEach(() => {
		if (dir) fs.rmSync(dir, {recursive: true, force: true})
		dir = null
	})

	it('appends each notification body as a line, creating parent dirs', () => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-sink-notifier-'))
		const sinkPath = path.join(dir, 'nested', 'notifications.log')
		const notifier = createSinkNotifier(sinkPath)

		notifier.show('first body')
		notifier.show('second body')

		expect(fs.readFileSync(sinkPath, 'utf8')).toBe('first body\nsecond body\n')
	})

	it('keeps multi-line bodies on one line so the spec can assert per-line', () => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-sink-notifier-'))
		const sinkPath = path.join(dir, 'notifications.log')
		const notifier = createSinkNotifier(sinkPath)

		notifier.show('line one\nline two')

		expect(fs.readFileSync(sinkPath, 'utf8').split('\n')).toEqual(['line one line two', ''])
	})
})

// Windows portable builds ship without a Start Menu shortcut, so Windows has no
// registered AppUserModelID to match a toast against and drops every one of
// them. A tray balloon hangs off the tray icon instead, which needs no AUMID.
describe('balloonNotifier', () => {
	it('routes the body to the tray and leaves the fallback untouched', () => {
		const balloons: string[] = []
		const fallbacks: string[] = []
		const notifier = balloonNotifier({displayBalloon: body => (balloons.push(body), true)}, {show: body => void fallbacks.push(body)})

		notifier.show('queued')

		expect(balloons).toEqual(['queued'])
		expect(fallbacks).toEqual([])
	})

	it('falls back when there is no tray to hang the balloon off', () => {
		const fallbacks: string[] = []
		const notifier = balloonNotifier({displayBalloon: () => false}, {show: body => void fallbacks.push(body)})

		notifier.show('queued')

		expect(fallbacks).toEqual(['queued'])
	})
})

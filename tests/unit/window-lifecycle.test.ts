// @vitest-environment node

import {describe, expect, it} from 'vitest'
import {decideCloseAction, decideRendererCrashAction} from '@main/windowLifecycle.js'

describe('decideCloseAction — no tray (darwin or tray init failed)', () => {
	it('darwin + no downloads → allow', () => {
		expect(decideCloseAction({platform: 'darwin', hasTray: false, closeBehavior: 'ask', runningCount: 0})).toBe('allow')
	})

	it('darwin + running downloads → warn-and-quit', () => {
		expect(decideCloseAction({platform: 'darwin', hasTray: false, closeBehavior: 'ask', runningCount: 1})).toBe('warn-and-quit')
	})

	it('darwin ignores hasTray — tray is never created on darwin', () => {
		expect(decideCloseAction({platform: 'darwin', hasTray: true, closeBehavior: 'tray', runningCount: 5})).toBe('warn-and-quit')
	})

	it('linux without tray + no downloads → allow', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: false, closeBehavior: 'ask', runningCount: 0})).toBe('allow')
	})

	it('linux without tray + running → warn-and-quit', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: false, closeBehavior: 'ask', runningCount: 3})).toBe('warn-and-quit')
	})
})

describe('decideCloseAction — tray present', () => {
	it('closeBehavior=tray → hide (regardless of download count)', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'tray', runningCount: 0})).toBe('hide')
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'tray', runningCount: 5})).toBe('hide')
	})

	it('closeBehavior=quit + no downloads → quit-direct', () => {
		expect(decideCloseAction({platform: 'win32', hasTray: true, closeBehavior: 'quit', runningCount: 0})).toBe('quit-direct')
	})

	it('closeBehavior=quit + running → warn-and-quit', () => {
		expect(decideCloseAction({platform: 'win32', hasTray: true, closeBehavior: 'quit', runningCount: 2})).toBe('warn-and-quit')
	})

	it('closeBehavior=ask + no downloads → quit-direct', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'ask', runningCount: 0})).toBe('quit-direct')
	})

	it('closeBehavior=ask + running → ask-tray (first-time tray dialog)', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'ask', runningCount: 1})).toBe('ask-tray')
	})

	it('unknown closeBehavior treated same as ask', () => {
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'unknown', runningCount: 0})).toBe('quit-direct')
		expect(decideCloseAction({platform: 'linux', hasTray: true, closeBehavior: 'unknown', runningCount: 2})).toBe('ask-tray')
	})
})

describe('decideRendererCrashAction', () => {
	it('clean-exit → ignore regardless of window', () => {
		expect(decideRendererCrashAction({reason: 'clean-exit', isMainWindow: true, dialogResponse: 0})).toBe('ignore')
		expect(decideRendererCrashAction({reason: 'clean-exit', isMainWindow: false, dialogResponse: 0})).toBe('ignore')
	})

	it('non-main window crash → ignore', () => {
		expect(decideRendererCrashAction({reason: 'crashed', isMainWindow: false, dialogResponse: 0})).toBe('ignore')
	})

	it('main window crash + user picks reload (0) → reload', () => {
		expect(decideRendererCrashAction({reason: 'crashed', isMainWindow: true, dialogResponse: 0})).toBe('reload')
	})

	it('main window crash + user picks quit (1) → quit', () => {
		expect(decideRendererCrashAction({reason: 'killed', isMainWindow: true, dialogResponse: 1})).toBe('quit')
	})

	it('oom crash + reload response → reload', () => {
		expect(decideRendererCrashAction({reason: 'oom', isMainWindow: true, dialogResponse: 0})).toBe('reload')
	})
})

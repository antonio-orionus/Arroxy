import {expect, test} from '@playwright/test'
import {withClipboardLock} from './clipboardLock.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Risk: the right-click menu's own clipboard items (electron-context-menu)
// silently doing nothing. Electron 44 made the clipboard API async and
// array-based; electron-context-menu 4.x still called the old object form, so
// Copy Link / Copy Image Address left the clipboard untouched with no error.
//
// A native menu cannot be clicked from Playwright, so the spec captures the
// menu electron-context-menu builds (Menu.prototype.popup), fires the real
// webContents 'context-menu' event, clicks the item, and reads the system
// clipboard back. Clipboard access is serialized by withClipboardLock.

test('context menu Copy Link and Copy Image Address write to the system clipboard', async () => {
	test.setTimeout(120_000)
	await withFixtureProductApp({userDataPrefix: 'arroxy-ctxprobe-'}, async ({app}) => {
		await withClipboardLock(async () => {
			const result = await app.evaluate(async ({BrowserWindow, Menu, clipboard}) => {
				const captured: Array<InstanceType<typeof Menu>> = []
				const original = Menu.prototype.popup
				Menu.prototype.popup = function (this: InstanceType<typeof Menu>) {
					captured.push(this)
				}
				const wc = BrowserWindow.getAllWindows()[0].webContents
				const base = {
					x: 10,
					y: 10,
					frameURL: '',
					pageURL: 'file:///',
					linkURL: '',
					linkText: '',
					srcURL: '',
					mediaType: 'none',
					hasImageContents: false,
					isEditable: false,
					selectionText: '',
					titleText: '',
					misspelledWord: '',
					dictionarySuggestions: [],
					frameCharset: 'utf-8',
					inputFieldType: 'none',
					menuSourceType: 'mouse',
					mediaFlags: {},
					editFlags: {canUndo: false, canRedo: false, canCut: false, canCopy: false, canPaste: false, canDelete: false, canSelectAll: false, canEditRichly: false}
				}
				const out: Record<string, string> = {}
				const waitFor = async <T>(probe: () => T | Promise<T>, done: (value: T) => boolean): Promise<T> => {
					const deadline = Date.now() + 5_000
					let value = await probe()
					while (!done(value) && Date.now() < deadline) {
						await new Promise(resolve => setTimeout(resolve, 25))
						value = await probe()
					}
					return value
				}
				const fire = async (params: Partial<typeof base>, id: string): Promise<string> => {
					captured.length = 0
					wc.emit('context-menu', {preventDefault: () => undefined, defaultPrevented: false}, {...base, ...params})
					const menu = await waitFor(
						() => captured.at(-1),
						value => value !== undefined
					)
					const item = menu?.getMenuItemById(id)
					if (!item) return `missing menu item ${id}`
					await clipboard.writeText('sentinel')
					item.click()
					return waitFor(
						() => clipboard.readText(),
						text => text !== 'sentinel'
					)
				}
				out.copyLink = await fire({linkURL: 'https://example.com/link', linkText: 'Example'}, 'copyLink')
				out.copyImageAddress = await fire({mediaType: 'image', srcURL: 'https://example.com/img.png', hasImageContents: true}, 'copyImageAddress')
				Menu.prototype.popup = original
				return out
			})
			expect(result).toEqual({copyLink: 'https://example.com/link', copyImageAddress: 'https://example.com/img.png'})
		})
	})
})

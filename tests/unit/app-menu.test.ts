import {describe, expect, it, vi} from 'vite-plus/test'
import type {MenuItemConstructorOptions} from 'electron'
import type {MenuAction} from '@shared/schemas.js'
import {LANGUAGE_NATIVE_NAMES, SUPPORTED_LANGS} from '@shared/i18n/index.js'
import {buildAppMenuTemplate, type AppMenuDeps} from '@main/appMenu.js'

function makeDeps(overrides: Partial<AppMenuDeps> = {}): AppMenuDeps & {sent: MenuAction[]} {
	const sent: MenuAction[] = []
	return {appName: 'Arroxy', t: key => `«${key}»`, language: 'en', style: 'aurora', theme: 'system', limitRate: undefined, send: action => sent.push(action), openDiscord: vi.fn(), sent, ...overrides}
}

function submenuOf(template: MenuItemConstructorOptions[], label: string): MenuItemConstructorOptions[] {
	const entry = template.find(item => item.label === label)
	if (!entry || !Array.isArray(entry.submenu)) throw new Error(`no submenu "${label}"`)
	return entry.submenu
}

function find(items: MenuItemConstructorOptions[], label: string): MenuItemConstructorOptions {
	const item = items.find(entry => entry.label === label)
	if (!item) throw new Error(`no item "${label}"`)
	return item
}

describe('buildAppMenuTemplate', () => {
	it('keeps the standard macOS menus around the app-specific ones', () => {
		const template = buildAppMenuTemplate(makeDeps())
		expect(template.map(item => item.label ?? item.role)).toEqual(['Arroxy', 'fileMenu', 'editMenu', 'View', 'windowMenu', 'Help'])
	})

	it('opens the in-app About dialog from the app menu', () => {
		const deps = makeDeps()
		const about = find(submenuOf(buildAppMenuTemplate(deps), 'Arroxy'), '«about.openTitle»')
		about.click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'about'}])
	})

	it('lists both styles as a radio group with the current one checked', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({style: 'minimal'})), 'View'), '«wizard.url.style.modeLabel»')
		expect(items.map(item => [item.label, item.type, item.checked])).toEqual([
			['«wizard.url.style.aurora.label»', 'radio', false],
			['«wizard.url.style.minimal.label»', 'radio', true]
		])
	})

	it('sends the picked style to the renderer', () => {
		const deps = makeDeps()
		const style = submenuOf(submenuOf(buildAppMenuTemplate(deps), 'View'), '«wizard.url.style.modeLabel»')
		find(style, '«wizard.url.style.minimal.label»').click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'style', style: 'minimal'}])
	})

	it('lists light, system and dark as a radio group with the current theme checked', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({theme: 'dark'})), 'View'), '«app.theme»')
		expect(items.map(item => [item.label, item.checked])).toEqual([
			['«theme.light»', false],
			['«theme.system»', false],
			['«theme.dark»', true]
		])
	})

	it('sends the picked theme to the renderer', () => {
		const deps = makeDeps()
		const theme = submenuOf(submenuOf(buildAppMenuTemplate(deps), 'View'), '«app.theme»')
		find(theme, '«theme.dark»').click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'theme', theme: 'dark'}])
	})

	it('lists every app language by its native name, with the current one checked', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({language: 'de'})), 'View'), '«language.label»')
		expect(items.map(item => item.label)).toEqual(SUPPORTED_LANGS.map(code => LANGUAGE_NATIVE_NAMES[code]))
		expect(items.every(item => item.type === 'radio')).toBe(true)
		expect(items.filter(item => item.checked).map(item => item.label)).toEqual(['Deutsch'])
	})

	it('sends the picked language to the renderer', () => {
		const deps = makeDeps()
		const language = submenuOf(submenuOf(buildAppMenuTemplate(deps), 'View'), '«language.label»')
		find(language, 'Français').click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'language', language: 'fr'}])
	})

	it('puts the footer links in the Help menu', () => {
		const deps = makeDeps()
		const help = submenuOf(buildAppMenuTemplate(deps), 'Help')
		find(help, 'Discord').click?.({} as never, undefined, {})
		find(help, '«app.feedback»').click?.({} as never, undefined, {})
		find(help, '«share.footerTooltip»').click?.({} as never, undefined, {})
		expect(deps.openDiscord).toHaveBeenCalledTimes(1)
		expect(deps.sent).toEqual([{kind: 'feedback'}, {kind: 'share'}])
	})

	it('opens Settings from the app menu with the standard shortcut', () => {
		const deps = makeDeps()
		const settings = find(submenuOf(buildAppMenuTemplate(deps), 'Arroxy'), '«wizard.url.tabs.settings»…')
		expect(settings.accelerator).toBe('CommandOrControl+,')
		settings.click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'settings'}])
	})

	it('offers Off and the preset speed limits, checking the current one', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({limitRate: '1M'})), 'Arroxy'), '«wizard.url.limitRate.label»')
		expect(items[0]).toMatchObject({label: '«wizard.url.limitRate.off»', type: 'radio', checked: false})
		expect(items.filter(item => item.checked).map(item => item.label)).toEqual(['1 MB/s'])
	})

	it('checks Off when no limit is set', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({limitRate: '  '})), 'Arroxy'), '«wizard.url.limitRate.label»')
		expect(items.filter(item => item.checked).map(item => item.label)).toEqual(['«wizard.url.limitRate.off»'])
	})

	it('keeps a custom limit visible and checked instead of showing none', () => {
		const items = submenuOf(submenuOf(buildAppMenuTemplate(makeDeps({limitRate: '3.5M'})), 'Arroxy'), '«wizard.url.limitRate.label»')
		expect(items.filter(item => item.checked).map(item => item.label)).toEqual(['3.5 MB/s'])
	})

	it('sends the picked speed limit, and none for Off', () => {
		const deps = makeDeps({limitRate: '1M'})
		const items = submenuOf(submenuOf(buildAppMenuTemplate(deps), 'Arroxy'), '«wizard.url.limitRate.label»')
		find(items, '500 KB/s').click?.({} as never, undefined, {})
		find(items, '«wizard.url.limitRate.off»').click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'speedLimit', limitRate: '500K'}, {kind: 'speedLimit'}])
	})

	it('puts logs and the diagnostics file in the Help menu', () => {
		const deps = makeDeps()
		const help = submenuOf(buildAppMenuTemplate(deps), 'Help')
		find(help, '«app.logs»').click?.({} as never, undefined, {})
		find(help, '«app.saveDiagnostics»').click?.({} as never, undefined, {})
		expect(deps.sent).toEqual([{kind: 'logs'}, {kind: 'diagnostics'}])
	})
})

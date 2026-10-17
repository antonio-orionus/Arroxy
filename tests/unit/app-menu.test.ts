import {describe, expect, it, vi} from 'vite-plus/test'
import type {MenuItemConstructorOptions} from 'electron'
import type {MenuAction} from '@shared/schemas.js'
import {buildAppMenuTemplate, type AppMenuDeps} from '@main/appMenu.js'

function makeDeps(overrides: Partial<AppMenuDeps> = {}): AppMenuDeps & {sent: MenuAction[]} {
	const sent: MenuAction[] = []
	return {appName: 'Arroxy', t: key => `«${key}»`, style: 'aurora', theme: 'system', send: action => sent.push(action), openDiscord: vi.fn(), sent, ...overrides}
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
		expect(template.map(item => item.label ?? item.role)).toEqual(['Arroxy', 'editMenu', 'View', 'windowMenu', 'Help'])
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

	it('puts the footer links in the Help menu', () => {
		const deps = makeDeps()
		const help = submenuOf(buildAppMenuTemplate(deps), 'Help')
		find(help, 'Discord').click?.({} as never, undefined, {})
		find(help, '«app.feedback»').click?.({} as never, undefined, {})
		find(help, '«share.footerTooltip»').click?.({} as never, undefined, {})
		expect(deps.openDiscord).toHaveBeenCalledTimes(1)
		expect(deps.sent).toEqual([{kind: 'feedback'}, {kind: 'share'}])
	})
})

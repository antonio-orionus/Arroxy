import type {MenuItemConstructorOptions} from 'electron'
import {formatLimitRateLabel, isLimitRatePreset, LIMIT_RATE_PRESETS} from '@shared/limitRate.js'
import {UI_STYLES, type MenuAction, type UiStyle, type UiTheme} from '@shared/schemas.js'

export interface AppMenuDeps {
	appName: string
	t: (dottedKey: string) => string
	style: UiStyle
	theme: UiTheme
	// The saved speed limit (`500K`, `1.5M`); blank or absent means no limit.
	limitRate: string | undefined
	send: (action: MenuAction) => void
	openDiscord: () => void
}

const STYLE_LABEL_KEYS = {aurora: 'wizard.url.style.aurora.label', minimal: 'wizard.url.style.minimal.label'} as const satisfies Record<UiStyle, string>
const THEME_LABEL_KEYS = {light: 'theme.light', system: 'theme.system', dark: 'theme.dark'} as const satisfies Record<UiTheme, string>
// Footer order, not the schema's.
const THEME_ORDER = ['light', 'system', 'dark'] as const satisfies readonly UiTheme[]

// The macOS application menu: the standard Edit and Window menus around the
// app's own commands. The footer stays the source of truth on every platform;
// this is the same set of controls where a Mac user looks first.
export function buildAppMenuTemplate({appName, t, style, theme, limitRate, send, openDiscord}: AppMenuDeps): MenuItemConstructorOptions[] {
	const trimmedLimit = limitRate?.trim()
	const activeLimit = trimmedLimit === undefined || trimmedLimit === '' ? undefined : trimmedLimit
	// A limit typed in Settings that is not a preset still shows, checked, so the
	// menu never claims "no limit" while one is active.
	const limitOptions: MenuItemConstructorOptions[] = [
		{label: t('wizard.url.limitRate.off'), type: 'radio', checked: activeLimit === undefined, click: () => send({kind: 'speedLimit'})},
		...LIMIT_RATE_PRESETS.map((preset): MenuItemConstructorOptions => ({label: formatLimitRateLabel(preset), type: 'radio', checked: preset === activeLimit, click: () => send({kind: 'speedLimit', limitRate: preset})})),
		...(activeLimit !== undefined && !isLimitRatePreset(activeLimit) ? [{label: formatLimitRateLabel(activeLimit), type: 'radio' as const, checked: true, enabled: false}] : [])
	]
	return [
		{
			label: appName,
			submenu: [
				{label: t('about.openTitle'), click: () => send({kind: 'about'})},
				{type: 'separator'},
				{label: `${t('wizard.url.tabs.settings')}…`, accelerator: 'CommandOrControl+,', click: () => send({kind: 'settings'})},
				{label: t('wizard.url.limitRate.label'), submenu: limitOptions},
				{type: 'separator'},
				{role: 'services'},
				{type: 'separator'},
				{role: 'hide'},
				{role: 'hideOthers'},
				{role: 'unhide'},
				{type: 'separator'},
				{role: 'quit'}
			]
		},
		{role: 'editMenu'},
		{
			label: 'View',
			submenu: [
				{label: t('wizard.url.style.modeLabel'), submenu: UI_STYLES.map(option => ({label: t(STYLE_LABEL_KEYS[option]), type: 'radio', checked: option === style, click: () => send({kind: 'style', style: option})}))},
				{label: t('app.theme'), submenu: THEME_ORDER.map(option => ({label: t(THEME_LABEL_KEYS[option]), type: 'radio', checked: option === theme, click: () => send({kind: 'theme', theme: option})}))},
				{type: 'separator'},
				{role: 'reload'},
				{role: 'forceReload'},
				{role: 'toggleDevTools'},
				{type: 'separator'},
				{role: 'resetZoom'},
				{role: 'zoomIn'},
				{role: 'zoomOut'},
				{type: 'separator'},
				{role: 'togglefullscreen'}
			]
		},
		{role: 'windowMenu'},
		{
			label: 'Help',
			role: 'help',
			submenu: [
				{label: 'Discord', click: openDiscord},
				{label: t('app.feedback'), click: () => send({kind: 'feedback'})},
				{label: t('share.footerTooltip'), click: () => send({kind: 'share'})},
				{type: 'separator'},
				{label: t('app.logs'), click: () => send({kind: 'logs'})},
				{label: t('app.saveDiagnostics'), click: () => send({kind: 'diagnostics'})}
			]
		}
	]
}

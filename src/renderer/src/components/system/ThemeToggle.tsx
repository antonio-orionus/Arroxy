import type React from 'react'
import {Sun, Moon, Monitor} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {type UiTheme, uiThemeSchema} from '@shared/schemas.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {useAppStore} from '../../store/useAppStore.js'

const UI_THEMES = new Set<string>(uiThemeSchema.options)

function isUiTheme(value: string | undefined): value is UiTheme {
	return value !== undefined && UI_THEMES.has(value)
}

function shouldSyncThemeToUrl(): boolean {
	if (import.meta.env.MODE === 'browser-mock') return true
	if (import.meta.env.MODE !== 'test') return false
	const params = new URLSearchParams(window.location.search)
	return params.has('backdrop') || params.has('theme')
}

function syncThemeToUrl(theme: UiTheme): void {
	if (!shouldSyncThemeToUrl()) return
	const url = new URL(window.location.href)
	url.searchParams.set('theme', theme)
	window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function ThemeToggle(): React.JSX.Element {
	const {t} = useTranslation()
	const {uiTheme, setUiTheme} = useAppStore()
	return (
		<ToggleGroup
			value={[uiTheme]}
			onValueChange={arr => {
				const nextTheme = arr[0]
				if (!isUiTheme(nextTheme)) return
				setUiTheme(nextTheme)
				syncThemeToUrl(nextTheme)
			}}
			size="sm"
		>
			<ToggleGroupItem value="light" aria-label={t('theme.light')}>
				<Sun className="size-3" />
			</ToggleGroupItem>
			<ToggleGroupItem value="system" aria-label={t('theme.system')}>
				<Monitor className="size-3" />
			</ToggleGroupItem>
			<ToggleGroupItem value="dark" aria-label={t('theme.dark')}>
				<Moon className="size-3" />
			</ToggleGroupItem>
		</ToggleGroup>
	)
}

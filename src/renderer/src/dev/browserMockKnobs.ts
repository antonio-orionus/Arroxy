import {SUPPORTED_LANGS} from '@shared/schemas.js'
import type {SupportedLang, UiTheme} from '@shared/schemas.js'

export type MockPlatform = 'win32' | 'darwin' | 'linux'
export const MOCK_PLATFORMS: readonly MockPlatform[] = ['win32', 'darwin', 'linux'] as const
export const MOCK_PLATFORM_LABELS: Record<MockPlatform, string> = {win32: 'Windows', darwin: 'macOS', linux: 'Linux'}

export const RTL_LANGS = new Set<SupportedLang>(['ar', 'ur', 'ps'])

export interface BrowserMockKnobs {
	theme: UiTheme | null
	locale: SupportedLang | null
	platform: MockPlatform | null
}

function getParams(location: Pick<Location, 'search'> | URL): URLSearchParams {
	return new URLSearchParams(location.search.replace(/^\?/, ''))
}

export function readKnobs(location: Pick<Location, 'search'> | URL): BrowserMockKnobs {
	const params = getParams(location)

	const rawTheme = params.get('theme')
	const theme: UiTheme | null = rawTheme === 'light' || rawTheme === 'dark' || rawTheme === 'system' ? rawTheme : null

	const rawLocale = params.get('locale')
	const locale: SupportedLang | null = rawLocale !== null && (SUPPORTED_LANGS as readonly string[]).includes(rawLocale) ? (rawLocale as SupportedLang) : null

	const rawPlatform = params.get('platform')
	const platform: MockPlatform | null = (MOCK_PLATFORMS as readonly string[]).includes(rawPlatform ?? '') ? (rawPlatform as MockPlatform) : null

	return {theme, locale, platform}
}

export function knobUrl(updates: Partial<BrowserMockKnobs>, base: Pick<Location, 'href'>): string {
	const url = new URL(base.href)
	if (updates.theme !== undefined) {
		if (updates.theme === null) url.searchParams.delete('theme')
		else url.searchParams.set('theme', updates.theme)
	}
	if (updates.locale !== undefined) {
		if (updates.locale === null) url.searchParams.delete('locale')
		else url.searchParams.set('locale', updates.locale)
	}
	if (updates.platform !== undefined) {
		if (updates.platform === null) url.searchParams.delete('platform')
		else url.searchParams.set('platform', updates.platform)
	}
	return `${url.pathname}${url.search}${url.hash}`
}

export function applyThemeLive(theme: UiTheme | null): void {
	const html = document.documentElement
	html.classList.remove('dark', 'light')
	if (theme === 'dark') html.classList.add('dark')
	else if (theme === 'light') html.classList.add('light')
}

export type StaticBootSplashPreviewTheme = 'light' | 'dark'

function searchParams(search: string): URLSearchParams {
	return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
}

export function shouldHoldStaticBootSplash(input: {mode: string; search: string}): boolean {
	if (input.mode !== 'browser-mock') return false
	const params = searchParams(input.search)
	return params.get('scenario') === 'boot-splash' || params.get('bootSplash') === '1'
}

export function readStaticBootSplashPreviewTheme(search: string): StaticBootSplashPreviewTheme | null {
	const theme = searchParams(search).get('theme')
	return theme === 'light' || theme === 'dark' ? theme : null
}

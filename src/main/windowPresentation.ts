import type {UiTheme} from '@shared/schemas.js'

export const BOOT_SPLASH_DARK_BACKGROUND_COLOR = '#050813'
export const BOOT_SPLASH_LIGHT_BACKGROUND_COLOR = '#f1f3f9'

export function resolveMainWindowBackgroundColor(uiTheme: UiTheme | undefined, systemPrefersDark: boolean): string {
	if (uiTheme === 'dark') return BOOT_SPLASH_DARK_BACKGROUND_COLOR
	if (uiTheme === 'light') return BOOT_SPLASH_LIGHT_BACKGROUND_COLOR
	return systemPrefersDark ? BOOT_SPLASH_DARK_BACKGROUND_COLOR : BOOT_SPLASH_LIGHT_BACKGROUND_COLOR
}

/** A fresh install persists no uiTheme key, so `undefined` means "follow the system". */
export function followsSystemTheme(uiTheme: UiTheme | undefined): boolean {
	return uiTheme === undefined || uiTheme === 'system'
}

interface ThemeTargetWindow {
	isDestroyed(): boolean
	setBackgroundColor(color: string): void
}

interface NativeThemeSource {
	readonly shouldUseDarkColors: boolean
	on(event: 'updated', listener: () => void): void
	off(event: 'updated', listener: () => void): void
}

/**
 * Keeps the window background in step with the desktop colour scheme.
 *
 * On Linux the colour scheme arrives from xdg-desktop-portal over D-Bus, which
 * is activated on demand: a cold first launch creates the window before the
 * portal answers, so `shouldUseDarkColors` is still false and the window is
 * painted light on a dark desktop. Sampling once at creation cannot recover
 * from that, because the value is correct only from the second launch onwards
 * once the portal is warm.
 */
export function watchSystemThemeBackground(window: ThemeTargetWindow, nativeTheme: NativeThemeSource, getUiTheme: () => UiTheme | undefined, notify?: (systemPrefersDark: boolean) => void): () => void {
	const apply = (): void => {
		if (window.isDestroyed()) return
		// Always forwarded: the renderer resolves uiTheme itself, and Chromium
		// does not fire a prefers-color-scheme change when the portal answers
		// late, so this is the renderer's only signal.
		notify?.(nativeTheme.shouldUseDarkColors)
		if (!followsSystemTheme(getUiTheme())) return
		window.setBackgroundColor(resolveMainWindowBackgroundColor(undefined, nativeTheme.shouldUseDarkColors))
	}
	nativeTheme.on('updated', apply)
	return () => nativeTheme.off('updated', apply)
}

import 'electron-log/renderer.js'
import React, {Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './App.js'
import {initI18n, pickLanguage, isRtl} from '@shared/i18n/index.js'
import {ensureAppBridge, renderBridgeFailure} from './bootstrapBridge.js'
import {readStaticBootSplashPreviewTheme, shouldHoldStaticBootSplash} from './bootstrapPreview.js'
import './styles.css'

async function bootstrap(): Promise<void> {
	const mode = import.meta.env.MODE
	const userAgent = navigator.userAgent

	if (shouldHoldStaticBootSplash({mode, search: window.location.search})) {
		const html = document.documentElement
		html.dataset.bootSplashPreview = 'true'
		const theme = readStaticBootSplashPreviewTheme(window.location.search)
		if (theme !== null) html.dataset.bootSplashTheme = theme
		return
	}

	if (!('appApi' in window) && import.meta.env.MODE === 'browser-mock') {
		const {installBrowserMock} = await import('./browserMock.js')
		installBrowserMock()
	}

	await ensureAppBridge({mode, userAgent, hasAppApi: () => 'appApi' in window, installBrowserMock: () => undefined})

	const lang = pickLanguage(navigator.language)
	initI18n(lang)
	document.documentElement.lang = lang
	document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'

	const rootElement = document.getElementById('root')
	if (!rootElement) {
		throw new Error('Renderer root element was not found')
	}

	createRoot(rootElement).render(
		<React.StrictMode>
			<Suspense fallback={null}>
				<App />
			</Suspense>
		</React.StrictMode>
	)
}

void bootstrap().catch((error: unknown) => {
	console.error(error)
	renderBridgeFailure(document.getElementById('root'), error)
})

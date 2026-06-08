import 'electron-log/renderer.js'
import React, {Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './App.js'
import {initI18n, pickLanguage, isRtl} from '@shared/i18n/index.js'
import {useAppStore} from './store/useAppStore.js'
import {ensureAppBridge, renderBridgeFailure} from './bootstrapBridge.js'
import './styles.css'

async function bootstrap(): Promise<void> {
	const mode = import.meta.env.MODE
	const userAgent = navigator.userAgent

	if (!('appApi' in window) && import.meta.env.MODE === 'browser-mock') {
		const {installBrowserMock} = await import('./browserMock.js')
		installBrowserMock()
	}

	await ensureAppBridge({mode, userAgent, hasAppApi: () => 'appApi' in window, installBrowserMock: () => undefined})

	let lang = pickLanguage(navigator.language)
	const result = await window.appApi.settings.get()
	if (result.ok && result.data.common.language) {
		lang = pickLanguage(result.data.common.language)
	}
	initI18n(lang)
	document.documentElement.lang = lang
	document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
	useAppStore.setState({language: lang})

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

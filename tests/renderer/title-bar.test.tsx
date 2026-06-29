import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {WindowApi} from '@shared/api.js'

function installWindowApi(platform: NodeJS.Platform): void {
	window.platform = platform
	const windowApi = {close: vi.fn().mockResolvedValue(undefined), isMaximized: vi.fn().mockResolvedValue(false), maximize: vi.fn().mockResolvedValue(undefined), minimize: vi.fn().mockResolvedValue(undefined), onMaximizedChange: vi.fn().mockReturnValue(() => undefined)} satisfies WindowApi
	Object.defineProperty(window, 'appApi', {configurable: true, value: {window: windowApi}})
}

async function renderTitleBar(platform: NodeJS.Platform): Promise<void> {
	vi.resetModules()
	installWindowApi(platform)
	const {TitleBar} = await import('@renderer/components/layout/TitleBar.js')
	render(<TitleBar />)
}

describe('TitleBar window controls', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('uses native macOS traffic lights instead of renderer window controls', async () => {
		await renderTitleBar('darwin')

		expect(screen.getByTestId('title-bar')).toHaveTextContent('Arroxy')
		expect(screen.getByTestId('native-window-controls-spacer')).toBeInTheDocument()
		expect(screen.queryByTestId('window-controls-mac')).not.toBeInTheDocument()
		expect(screen.queryByTestId('wc-close')).not.toBeInTheDocument()
	})

	it('keeps renderer window controls on Windows and Linux', async () => {
		await renderTitleBar('linux')

		expect(screen.getByTestId('window-controls-win')).toBeInTheDocument()
		expect(screen.getByTestId('wc-close')).toBeInTheDocument()
		expect(screen.queryByTestId('native-window-controls-spacer')).not.toBeInTheDocument()
	})
})

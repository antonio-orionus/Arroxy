// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {DownloadProfilesSettingsTab} from '@renderer/components/wizard/DownloadProfilesSettingsTab.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppApi} from '@shared/api.js'
import type {AppSettings} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'

let mockApi: AppApi

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

function mount(common: Partial<AppSettings['common']> = {}): void {
	const settings = buildSettings(common)
	mockApi = buildMockAppApi()
	mockApi.settings.update = vi.fn().mockResolvedValue(ok(settings))
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	useAppStore.setState({initialized: true, initializing: false, settings})
	render(
		<TooltipProvider>
			<DownloadProfilesSettingsTab />
		</TooltipProvider>
	)
}

describe('download connections setting', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('shows the recommended value as a placeholder and stays empty when off', () => {
		mount()
		const input = screen.getByTestId('download-connections-input')
		expect(input).toHaveValue(null)
		expect(input).toHaveAttribute('placeholder', '4')
	})

	it('renders the stored value', () => {
		mount({downloadConnections: 8})
		expect(screen.getByTestId('download-connections-input')).toHaveValue(8)
	})

	it('persists a valid value on blur', async () => {
		mount()
		const input = screen.getByTestId('download-connections-input')
		fireEvent.change(input, {target: {value: '8'}})
		fireEvent.blur(input)
		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {downloadConnections: 8}}))
	})

	it('treats an emptied field as off', async () => {
		mount({downloadConnections: 8})
		const input = screen.getByTestId('download-connections-input')
		fireEvent.change(input, {target: {value: ''}})
		fireEvent.blur(input)
		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {downloadConnections: 0}}))
	})

	it('reverts an over-maximum value without persisting it', async () => {
		mount({downloadConnections: 4})
		const input = screen.getByTestId('download-connections-input')
		fireEvent.change(input, {target: {value: '99'}})
		fireEvent.blur(input)
		expect(mockApi.settings.update).not.toHaveBeenCalled()
		await waitFor(() => expect(input).toHaveValue(4))
	})

	it('shows the default as a placeholder for downloads at once', () => {
		mount()
		const input = screen.getByTestId('concurrent-downloads-input')
		expect(input).toHaveValue(null)
		expect(input).toHaveAttribute('placeholder', '1')
	})

	it('persists a raised concurrent-downloads limit', async () => {
		mount()
		const input = screen.getByTestId('concurrent-downloads-input')
		fireEvent.change(input, {target: {value: '3'}})
		fireEvent.blur(input)
		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {concurrentDownloads: 3}}))
	})

	it('rejects a concurrent-downloads value above the maximum', async () => {
		mount({concurrentDownloads: 2})
		const input = screen.getByTestId('concurrent-downloads-input')
		fireEvent.change(input, {target: {value: '50'}})
		fireEvent.blur(input)
		expect(mockApi.settings.update).not.toHaveBeenCalled()
		await waitFor(() => expect(input).toHaveValue(2))
	})

	it('no longer offers a connections field inside the custom pacing grid', () => {
		mount({networkPacingPreset: 'custom'})
		expect(screen.getByTestId('network-pacing-custom')).toBeInTheDocument()
		expect(screen.queryByTestId('pacing-concurrent-fragments')).not.toBeInTheDocument()
	})
})

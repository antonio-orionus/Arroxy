// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
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
	// Main answers with the settings it saved, patch merged in.
	mockApi.settings.update = vi.fn(async (patch: {common?: Partial<AppSettings['common']>}) => ok({...settings, common: {...settings.common, ...patch.common}}))
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	useAppStore.setState({initialized: true, initializing: false, settings})
	render(
		<TooltipProvider>
			<DownloadProfilesSettingsTab />
		</TooltipProvider>
	)
}

describe('remove finished downloads setting', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('is off by default', () => {
		mount()
		expect(screen.getByTestId('auto-remove-completed-switch')).not.toBeChecked()
	})

	it('renders the stored value', () => {
		mount({autoRemoveCompleted: true})
		expect(screen.getByTestId('auto-remove-completed-switch')).toBeChecked()
	})

	it('persists a change', async () => {
		mount()
		fireEvent.click(screen.getByTestId('auto-remove-completed-switch'))
		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {autoRemoveCompleted: true}}))
		await waitFor(() => expect(screen.getByTestId('auto-remove-completed-switch')).toBeChecked())
	})
})

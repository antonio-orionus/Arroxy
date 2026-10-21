import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {StyleToggle} from '@renderer/components/system/StyleToggle.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'

function ok<T>(data: T) {
	return Promise.resolve({ok: true as const, data})
}

const update = vi.fn((patch: {common?: Record<string, unknown>}) => ok({...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, ...patch.common}} satisfies AppSettings))

function seedSettings(common: Record<string, unknown> = {}): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({settings: {...base, common: {...base.common, ...common}}, uiStyle: 'aurora'})
}

describe('StyleToggle', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		update.mockClear()
		window.appApi = {settings: {update}, intake: {setWindowContext: vi.fn().mockResolvedValue({ok: true, data: undefined})}} as unknown as typeof window.appApi
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('switches the style from the footer and saves it', () => {
		seedSettings({styleHintDismissed: true})
		render(<StyleToggle hintReady />)
		fireEvent.click(screen.getByTestId('footer-style-minimal'))
		expect(useAppStore.getState().uiStyle).toBe('minimal')
		expect(update).toHaveBeenCalledWith({common: {uiStyle: 'minimal'}})
	})

	it('points at the picker once the app is ready, then goes away for good', async () => {
		seedSettings()
		render(<StyleToggle hintReady />)
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()

		await act(() => vi.advanceTimersByTimeAsync(2_000))
		expect(screen.getByTestId('style-hint')).toBeInTheDocument()

		await act(() => vi.advanceTimersByTimeAsync(13_000))
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
		expect(update).toHaveBeenCalledWith({common: {styleHintDismissed: true}})
	})

	it('waits while something else (splash, release notes) is on screen', async () => {
		seedSettings()
		render(<StyleToggle hintReady={false} />)
		await act(() => vi.advanceTimersByTimeAsync(5_000))
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
	})

	it('never shows again after it was dismissed', async () => {
		seedSettings({styleHintDismissed: true})
		render(<StyleToggle hintReady />)
		await act(() => vi.advanceTimersByTimeAsync(5_000))
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
	})

	it('counts picking a style as having seen the hint', async () => {
		seedSettings()
		render(<StyleToggle hintReady />)
		await act(() => vi.advanceTimersByTimeAsync(2_000))
		fireEvent.click(screen.getByTestId('footer-style-minimal'))
		await act(() => vi.advanceTimersByTimeAsync(0))
		expect(update).toHaveBeenCalledWith({common: {styleHintDismissed: true}})
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
	})

	it('stays gone for the session when saving the dismissal fails', async () => {
		update.mockImplementationOnce(() => Promise.resolve({ok: false as const, error: {code: 'save-failed', message: 'nope'}}) as never)
		seedSettings()
		// What main still has on disk after the failed write: the hint not yet dismissed.
		const canonical = useAppStore.getState().settings
		window.appApi = {settings: {update, get: vi.fn(() => ok(canonical))}} as unknown as typeof window.appApi
		render(<StyleToggle hintReady />)
		await act(() => vi.advanceTimersByTimeAsync(2_000))
		expect(screen.getByTestId('style-hint')).toBeInTheDocument()

		await act(() => vi.advanceTimersByTimeAsync(13_000))
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
		await act(() => vi.advanceTimersByTimeAsync(30_000))
		expect(screen.queryByTestId('style-hint')).not.toBeInTheDocument()
	})
})

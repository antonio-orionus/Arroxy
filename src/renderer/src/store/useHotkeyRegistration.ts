import {useCallback, useEffect, useState} from 'react'
import {DEFAULTS} from '@shared/constants.js'
import {useAppStore} from './useAppStore.js'

export interface HotkeyRegistration {
	enabled: boolean
	accelerator: string
	/** null = not asked yet, or the hotkey is off. Never conflate with false. */
	registered: boolean | null
	refresh: () => Promise<void>
}

/**
 * Whether the configured global hotkey is actually live.
 *
 * The renderer never assumes registration succeeded: main owns the OS-level
 * claim, another app may already hold the chord, and the setting can change
 * from a settings.json hand-edit. So the verdict is fetched, and re-fetched
 * whenever the enable flag or the chord changes.
 */
export function useHotkeyRegistration({observe = true}: {observe?: boolean} = {}): HotkeyRegistration {
	const common = useAppStore(state => state.settings?.common)
	const enabled = common?.hotkeyEnabled ?? false
	const accelerator = common?.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator
	const shouldObserve = observe && enabled
	const [registered, setRegistered] = useState<boolean | null>(null)

	const refresh = useCallback(async () => {
		if (!shouldObserve) return
		const result = await window.appApi.hotkey.getState()
		setRegistered(result.ok ? result.data.registered : null)
	}, [shouldObserve])

	useEffect(() => {
		if (!shouldObserve) return
		let cancelled = false
		void window.appApi.hotkey.getState().then(result => {
			if (!cancelled) setRegistered(result.ok ? result.data.registered : null)
		})
		return () => {
			cancelled = true
		}
	}, [shouldObserve, accelerator])

	return {enabled, accelerator, registered: shouldObserve ? registered : null, refresh}
}

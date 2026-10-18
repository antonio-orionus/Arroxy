import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import type {DownloadProfile} from '@shared/types.js'
import type {DownloadProfileDraftAction} from '../../store/wizard/downloadProfileDraft.js'

interface ProfileDestinationControlsOptions {
	initialProfile: DownloadProfile | null
	destination: string
	onAction: (action: DownloadProfileDraftAction) => void
	// Sets or clears the editor-wide action error shown above the form.
	onActionError: (error: string | null) => void
	onChangeGlobalDestination?: () => Promise<void> | void
}

export interface ProfileDestinationControls {
	overrideOpen: boolean
	pickerError: string | null
	canChangeGlobalDestination: boolean
	changeDestination: (nextDestination: string) => void
	clearDestinationOverride: () => void
	chooseDestinationFolder: () => Promise<void>
	changeGlobalDestination: () => Promise<void>
}

// The destination override's UI state and the folder actions behind it. The
// editor calls this rather than the policy card, because the dialog content
// unmounts while closed and this state must live as long as the draft does.
export function useProfileDestinationControls({initialProfile, destination, onAction, onActionError, onChangeGlobalDestination}: ProfileDestinationControlsOptions): ProfileDestinationControls {
	const {t} = useTranslation()
	const [overrideOpen, setOverrideOpen] = useState(() => initialProfile?.output.kind === 'fixed')
	const [pickerError, setPickerError] = useState<string | null>(null)

	function beginDestinationEdit(nextOverrideOpen: boolean): void {
		onActionError(null)
		setPickerError(null)
		setOverrideOpen(nextOverrideOpen)
	}

	function changeDestination(nextDestination: string): void {
		beginDestinationEdit(true)
		onAction({type: 'set-destination', destination: nextDestination})
	}

	function clearDestinationOverride(): void {
		beginDestinationEdit(false)
		onAction({type: 'set-destination', destination: ''})
	}

	async function chooseDestinationFolder(): Promise<void> {
		beginDestinationEdit(true)
		try {
			const result = await window.appApi.dialog.chooseFolder(destination.trim() || undefined)
			if (!result.ok || !result.data.path) return
			onAction({type: 'set-destination', destination: result.data.path})
		} catch (error) {
			console.error('Failed to open destination folder picker', error)
			setPickerError('Could not open folder picker. Enter a path manually.')
		}
	}

	async function changeGlobalDestination(): Promise<void> {
		if (!onChangeGlobalDestination) return
		onActionError(null)
		try {
			await onChangeGlobalDestination()
		} catch (error) {
			console.error('Failed to change global destination', error)
			onActionError(t('wizard.profileEditor.error.changeGlobalDestination'))
		}
	}

	return {overrideOpen, pickerError, canChangeGlobalDestination: Boolean(onChangeGlobalDestination), changeDestination, clearDestinationOverride, chooseDestinationFolder, changeGlobalDestination}
}

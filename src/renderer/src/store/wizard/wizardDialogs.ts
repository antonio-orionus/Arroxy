// WizardDialogs slice — transient UI flags that gate the wizard's modal
// interruptions (mixed-URL prompt, advanced auto-open, cookies-config dialog).
// All of these are session-only (not persisted) and reset to defaults when
// the wizard reset fires.

import type {GetState, SetState, WizardDialogsSlice} from '../types.js'
import {replaceHash} from '@renderer/lib/navigation.js'

// The Settings tab only exists on the home screen, so reaching it from a wizard
// step first leaves that step and drops any prompt that was waiting on it.
const LEAVE_WIZARD_FOR_SETTINGS = {wizardStep: 'url', wizardOrigin: 'download', wizardError: null, wizardErrorOrigin: null, mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null, cookiesConfigDialogIssue: null} as const

export function createWizardDialogsSlice(set: SetState, _get: GetState): WizardDialogsSlice {
	return {
		mixedUrlPromptOpen: false,
		mixedUrlPending: null,
		mixedUrlPromptSource: null,
		advancedAutoOpen: false,
		advancedAutoTarget: 'cookies',
		cookiesConfigDialogIssue: null,

		setAdvancedAutoOpen: (open, target = 'cookies') => set({advancedAutoOpen: open, advancedAutoTarget: target}),

		cancelMixedPrompt: () => {
			set({mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null})
		},

		openSettings: () => {
			replaceHash('settings')
			set({...LEAVE_WIZARD_FOR_SETTINGS, advancedAutoOpen: false})
		},

		openAdvancedSettings: target => {
			replaceHash('settings')
			set({...LEAVE_WIZARD_FOR_SETTINGS, advancedAutoOpen: true, advancedAutoTarget: target})
		},

		dismissCookiesConfigDialog: () => {
			set({cookiesConfigDialogIssue: null})
		}
	}
}

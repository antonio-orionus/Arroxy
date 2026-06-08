// WizardDialogs slice — transient UI flags that gate the wizard's modal
// interruptions (mixed-URL prompt, advanced auto-open, cookies-config dialog).
// All of these are session-only (not persisted) and reset to defaults when
// the wizard reset fires.

import type {GetState, SetState, WizardDialogsSlice} from '../types.js'
import {replaceHash} from '@renderer/lib/navigation.js'

export function createWizardDialogsSlice(set: SetState, _get: GetState): WizardDialogsSlice {
	return {
		mixedUrlPromptOpen: false,
		mixedUrlPending: null,
		advancedAutoOpen: false,
		advancedAutoTarget: 'cookies',
		cookiesConfigDialogIssue: null,
		quickPlaylistCapDialogOpen: false,

		setAdvancedAutoOpen: (open, target = 'cookies') => set({advancedAutoOpen: open, advancedAutoTarget: target}),

		cancelMixedPrompt: () => {
			set({mixedUrlPromptOpen: false, mixedUrlPending: null})
		},

		openAdvancedSettings: target => {
			replaceHash('settings')
			set({wizardStep: 'url', wizardError: null, wizardErrorOrigin: null, mixedUrlPromptOpen: false, mixedUrlPending: null, advancedAutoOpen: true, advancedAutoTarget: target, cookiesConfigDialogIssue: null})
		},

		dismissCookiesConfigDialog: () => {
			set({cookiesConfigDialogIssue: null})
		},

		dismissQuickPlaylistCapDialog: () => {
			set({quickPlaylistCapDialogOpen: false, quickDownloadStatus: 'idle', quickDownloadError: null})
		}
	}
}

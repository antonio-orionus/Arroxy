import type {IncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {ProbeError} from '@shared/types.js'
import type {MixedUrlPromptSource} from '../types.js'

// Leaves `wizardUrl` alone: Explore's link never belongs in the URL tab's field.
export interface MixedUrlPromptPatch {
	mixedUrlPromptOpen: true
	mixedUrlPending: string
	mixedUrlPromptSource: MixedUrlPromptSource
	wizardError: ProbeError | null
	cookiesConfigDialogIssue: IncompleteCookiesConfigIssue | null
}

export function mixedUrlPromptPatch(url: string, source: MixedUrlPromptSource): MixedUrlPromptPatch {
	return {mixedUrlPromptOpen: true, mixedUrlPending: url, mixedUrlPromptSource: source, wizardError: null, cookiesConfigDialogIssue: null}
}

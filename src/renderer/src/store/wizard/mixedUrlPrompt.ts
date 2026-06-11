import type {IncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {ProbeError} from '@shared/types.js'
import type {MixedUrlPromptSource} from '../types.js'

export interface MixedUrlPromptPatch {
	wizardUrl: string
	mixedUrlPromptOpen: true
	mixedUrlPending: string
	mixedUrlPromptSource: MixedUrlPromptSource
	wizardError: ProbeError | null
	cookiesConfigDialogIssue: IncompleteCookiesConfigIssue | null
}

export function mixedUrlPromptPatch(url: string, source: MixedUrlPromptSource): MixedUrlPromptPatch {
	return {wizardUrl: url, mixedUrlPromptOpen: true, mixedUrlPending: url, mixedUrlPromptSource: source, wizardError: null, cookiesConfigDialogIssue: null}
}

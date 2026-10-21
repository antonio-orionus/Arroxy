// Resolves a quick download's probe against the store: the row's pinned
// profile, or the active one with the wizard's folder when it has none.

import i18next from 'i18next'
import {resolvePinnedQuickProbe, type QuickProbeContext, type QuickProbeEnv, type QuickProbeResolution} from '@shared/intake/probeResolution.js'
import type {Result} from '@shared/result.js'
import type {ProbeError, ProbeResult} from '@shared/types.js'
import type {AppState} from '../types.js'
import {pinActiveDownloadProfile, rendererPreparationEnv} from '../wizard/queueSubmission.js'

function rendererQuickProbeEnv(): QuickProbeEnv {
	return {...rendererPreparationEnv(), probeFailedText: () => i18next.t('wizard.url.quickProbeFailed'), prepareFailedText: () => i18next.t('wizard.url.quickPrepareFailed')}
}

export function resolveQuickProbe(result: Result<ProbeResult, ProbeError>, context: QuickProbeContext, state: AppState): QuickProbeResolution {
	return resolvePinnedQuickProbe(result, {...context, profile: context.profile ?? pinActiveDownloadProfile(state)}, state, rendererQuickProbeEnv())
}

import {create} from 'zustand'
import {createProbeOrchestratorSlice} from './wizard/probeOrchestrator.js'
import {createFormatPickerSlice} from './wizard/formatPicker.js'
import {createOutputConfigSlice} from './wizard/outputConfig.js'
import {createVideoPartSlice} from './wizard/videoPart.js'
import {createWizardDialogsSlice} from './wizard/wizardDialogs.js'
import {createQueueSlice} from './queueSlice.js'
import {createQuickDownloadSlice} from './quickDownload/quickDownloadSlice.js'
import {createUiSlice} from './uiSlice.js'
import {createSystemSlice} from './systemSlice.js'
import {createSiteCooldownSlice} from './siteCooldownSlice.js'
import {watchExploreRetryTargets} from './quickDownload/exploreSignInRetry.js'
import {watchIntakeWindowContext} from './quickDownload/intakeWindowContext.js'
import type {AppState} from './types.js'

// QueueService on main is the queue-of-record; the renderer queue is a
// projection driven by IPC events. The previous renderer-side jobScheduler
// is gone — main's QueueService.maybeStartNext handles cap=1 scheduling.
export const useAppStore = create<AppState>()((set, get) => ({
	...createSystemSlice(set, get),
	...createUiSlice(set, get),
	...createProbeOrchestratorSlice(set, get),
	...createFormatPickerSlice(set, get),
	...createVideoPartSlice(set, get),
	...createOutputConfigSlice(set, get),
	...createWizardDialogsSlice(set, get),
	...createQueueSlice(set, get),
	...createQuickDownloadSlice(set, get),
	...createSiteCooldownSlice(set, get)
}))

// "Sign in with Explore" retries the failed items once Explore reports the sign-in.
watchExploreRetryTargets(useAppStore)
// Intake runs in main, which prepares links with the wizard's folder and this screen's HDR.
watchIntakeWindowContext(useAppStore)

// Re-export pure helpers so existing import paths
// (`import { foo } from '../store/useAppStore.js'`) keep working without churn
// in component files.
export {formatStatus, formatLocalizedError, formatProbeError} from './helpers.js'

import {create} from 'zustand'
import {createProbeOrchestratorSlice} from './wizard/probeOrchestrator.js'
import {createFormatPickerSlice} from './wizard/formatPicker.js'
import {createOutputConfigSlice} from './wizard/outputConfig.js'
import {createWizardDialogsSlice} from './wizard/wizardDialogs.js'
import {createQueueSlice} from './queueSlice.js'
import {createUiSlice} from './uiSlice.js'
import {createSystemSlice} from './systemSlice.js'
import type {AppState} from './types.js'

// QueueService on main is the queue-of-record; the renderer queue is a
// projection driven by IPC events. The previous renderer-side jobScheduler
// is gone — main's QueueService.maybeStartNext handles cap=1 scheduling.
export const useAppStore = create<AppState>()((set, get) => ({...createSystemSlice(set, get), ...createUiSlice(set, get), ...createProbeOrchestratorSlice(set, get), ...createFormatPickerSlice(set, get), ...createOutputConfigSlice(set, get), ...createWizardDialogsSlice(set, get), ...createQueueSlice(set, get)}))

// Re-export pure helpers so existing import paths
// (`import { foo } from '../store/useAppStore.js'`) keep working without churn
// in component files.
export {presetLabel, presetOptions, groupVideoFormats, resolveAudioLabel, resolveVideoResolution, formatStatus, formatLocalizedError, formatProbeError} from './helpers.js'

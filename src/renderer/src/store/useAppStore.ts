import { create } from 'zustand';
import { createWizardSlice } from './wizardSlice';
import { createQueueSlice } from './queueSlice';
import { createUiSlice } from './uiSlice';
import { createSystemSlice } from './systemSlice';
import type { AppState } from './types';

export const useAppStore = create<AppState>()((set, get) => ({
  ...createSystemSlice(set, get),
  ...createUiSlice(set, get),
  ...createWizardSlice(set, get),
  ...createQueueSlice(set, get)
}));

// Re-export pure helpers so existing import paths
// (`import { foo } from '../store/useAppStore'`) keep working without churn
// in component files.
export { presetLabel, presetOptions, groupVideoFormats, resolveAudioLabel, resolveVideoResolution, formatStatus, formatLocalizedError, formatError } from './helpers';

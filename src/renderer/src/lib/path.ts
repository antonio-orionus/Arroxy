// Renderer-side re-export. Validation logic lives in @shared/subfolder so
// the main-process IPC schema can enforce the same rules at the trust boundary.
export { isValidSubfolder, effectiveOutputDir } from '@shared/subfolder';

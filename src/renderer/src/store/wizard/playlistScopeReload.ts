import type { ProbeError } from '@shared/types.js';
import { formatProbeError } from '../helpers.js';

export function playlistScopeReloadErrorMessage(error: ProbeError): string {
  if (error.kind === 'other' && error.message === 'Playlist returned no entries') {
    return 'No videos matched that playlist scope. Your previous list is still shown.';
  }
  return formatProbeError(error) || 'Could not reload that playlist scope. Your previous list is still shown.';
}

export function unknownPlaylistScopeReloadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  return 'Unknown error';
}

import {templateOutputDir} from '@shared/filenameTemplate.js'
import {effectiveOutputDir, playlistBaseDir} from '@shared/subfolder.js'
import type {AppState} from '../types.js'
import {resolveJobFilenameTemplate, templateOwnsDirs} from './outputTemplates.js'

type PlaylistDirState = Pick<AppState, 'wizardOutputDir' | 'wizardSubfolderEnabled' | 'wizardSubfolderName' | 'playlistTitle' | 'playlistId' | 'settings'>

// Single source of truth for where a playlist's files land — used by the queue
// builder (download target), the folder scan, and the sync alert (display).
//
// Two regimes:
//   - Flat template: output base + explicit/auto (playlist-title) subfolder. The
//     sync "Change folder" action keeps this in sync by writing back
//     base+subfolder (see setPlaylistFolder), so there is exactly one
//     representation.
//   - Nesting template: the template owns layout, so the auto-folder steps
//     aside (otherwise `{playlist_title}/…` would nest the title twice) and the
//     directory is rendered from playlist-level metadata instead.
//
// Only playlist-level fields are rendered here. A template that also nests by a
// per-entry field ({uploader}) puts individual items deeper than this path; the
// folder scan then finds nothing and dedupe degrades, which is the same
// graceful degrade used when {id} is missing.
export function resolvePlaylistDir(s: PlaylistDirState): string {
	const template = resolveJobFilenameTemplate(undefined, s.settings?.common?.filenameTemplate)
	if (templateOwnsDirs(undefined, s.settings?.common?.filenameTemplate)) {
		const root = effectiveOutputDir(s.wizardOutputDir, s.wizardSubfolderEnabled, s.wizardSubfolderName)
		return templateOutputDir(root, template, {playlistTitle: s.playlistTitle, playlistId: s.playlistId})
	}
	return playlistBaseDir(s.wizardOutputDir, s.wizardSubfolderEnabled, s.wizardSubfolderName, s.playlistTitle)
}

import {resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import {compileFilenameTemplate, DEFAULT_FILENAME_TEMPLATE, templateHasId} from '@shared/filenameTemplate.js'
import type {DownloadProfile} from '@shared/schemas.js'

/**
 * Resolve the effective Arroxy filename template (profile override > global >
 * built-in) and compile it to the yt-dlp output template that reaches `-o`.
 */
export function resolveOutputTemplate(profile: DownloadProfile | undefined, globalTemplate: string | undefined): string {
	const compiled = compileFilenameTemplate(resolveFilenameTemplate(profile, globalTemplate))
	if (compiled.ok) return compiled.template

	// A template that fails to compile must never reach `-o`. Persisted settings
	// can go stale — hand-edited config, or a token removed in a later release —
	// so fall back to the built-in default rather than emitting a broken argument
	// or failing the download outright.
	const fallback = compileFilenameTemplate(DEFAULT_FILENAME_TEMPLATE)
	if (!fallback.ok) throw new Error('invariant: the default filename template must compile')
	return fallback.template
}

/**
 * Playlist dedupe (`findPlayableFileName`) and M3U writing locate downloaded
 * files by matching `[videoId]` before the extension. When the effective
 * template omits `{id}` both features would silently mismatch, so callers must
 * degrade instead: skip the folder scan, and don't write a playlist file.
 */
export function canMatchDownloadsById(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	return templateHasId(resolveFilenameTemplate(profile, globalTemplate))
}

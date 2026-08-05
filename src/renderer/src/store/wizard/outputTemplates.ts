import {resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import {templateHasId} from '@shared/filenameTemplate.js'
import type {DownloadProfile} from '@shared/schemas.js'

/**
 * Effective Arroxy filename template for a job: profile override > global >
 * built-in default.
 *
 * This deliberately stays in Arroxy token syntax. Compiling to a yt-dlp output
 * template happens in the main process, so a compromised renderer cannot hand
 * yt-dlp an arbitrary `-o` containing absolute paths or `../`.
 */
export function resolveJobFilenameTemplate(profile: DownloadProfile | undefined, globalTemplate: string | undefined): string {
	return resolveFilenameTemplate(profile, globalTemplate)
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

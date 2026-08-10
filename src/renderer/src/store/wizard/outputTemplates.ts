import {resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import {templateHasDirs, templateHasId, type TemplateMetadata} from '@shared/filenameTemplate.js'
import type {DownloadProfile, PlaylistEntry} from '@shared/types.js'
import type {AppState} from '../types.js'

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

/**
 * Whether the template — not the subfolder setting — decides directory layout.
 * When true the playlist auto-folder steps aside, because a template naming a
 * `{playlist_title}` folder would otherwise nest it twice.
 */
export function templateOwnsDirs(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	return templateHasDirs(resolveFilenameTemplate(profile, globalTemplate))
}

/**
 * A playlist file lists its entries relative to one directory. A nesting
 * template can scatter entries across per-uploader or per-date folders, leaving
 * no such directory — so M3U degrades exactly as it already does when `{id}` is
 * missing.
 */
export function canWriteM3u(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	return canMatchDownloadsById(profile, globalTemplate) && !templateOwnsDirs(profile, globalTemplate)
}

/** Drop blanks so an absent field collapses its folder rather than emptying it. */
function omitBlank(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim() ?? ''
	return trimmed.length > 0 ? trimmed : undefined
}

export type SingleTemplateState = Pick<AppState, 'wizardTitle' | 'wizardVideoId' | 'wizardUploader' | 'wizardUploadDate'>

/** Metadata for the single-video wizard path. */
export function singleTemplateMeta(state: SingleTemplateState): TemplateMetadata {
	return {title: omitBlank(state.wizardTitle), id: omitBlank(state.wizardVideoId), uploader: omitBlank(state.wizardUploader), uploadDate: omitBlank(state.wizardUploadDate)}
}

/**
 * Metadata for one playlist entry. Per-entry fields win; the playlist-level
 * fields come from the probe that produced the entry.
 */
export function playlistEntryTemplateMeta(entry: PlaylistEntry, playlistTitle: string, playlistId: string): TemplateMetadata {
	return {title: omitBlank(entry.title), id: omitBlank(entry.videoId), uploader: omitBlank(entry.uploader), uploadDate: omitBlank(entry.uploadDate), playlistTitle: omitBlank(playlistTitle), playlistId: omitBlank(playlistId), playlistIndex: entry.playlistIndex}
}

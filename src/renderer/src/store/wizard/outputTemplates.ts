import {resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import {bindFilenameTemplate, DEFAULT_FILENAME_TEMPLATE, templateDirsVaryPerEntry, templateHasDirs, templateHasId, type TemplateMetadata} from '@shared/filenameTemplate.js'
import type {DownloadProfile, PlaylistEntry} from '@shared/types.js'
import {notify} from '@renderer/lib/notify.js'
import {hostPlatform} from '@renderer/lib/platform.js'
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
 * Whether folder sync can trust a single directory for the whole playlist.
 *
 * A template that names directories after per-entry fields ({uploader}, {date})
 * puts items in different folders, so scanning one directory would report
 * nothing downloaded and invite a full re-download. Degrade instead — the same
 * response as a template with no `{id}` to match on.
 */
export function canScanPlaylistFolder(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	const template = resolveFilenameTemplate(profile, globalTemplate)
	return templateHasId(template) && !templateDirsVaryPerEntry(template)
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

/**
 * Bind a template into the filename segment the job will carry, sized to the
 * user's filesystem.
 *
 * The budget needs the real output directory and the real platform, so it can
 * only run here — `outputDir` is already resolved by this point. Compiling to a
 * yt-dlp `-o` still happens in main; this only decides how long the name may be.
 *
 * A template that cannot fit falls back to the built-in default rather than
 * failing the download, matching how main already degrades an unparseable
 * template. `path-too-deep` is reported the same way even though no name can
 * rescue it — the write will fail with yt-dlp's own error, and the notify line
 * says why.
 */
export function bindJobFilenameTemplate(template: string, meta: TemplateMetadata, outputDir: string): string {
	const ctx = {outputDir, platform: hostPlatform()}
	const bound = bindFilenameTemplate(template, meta, ctx)
	if (bound.ok) {
		if (bound.truncated.length > 0) notify.filenameShortened(meta.title ?? '', bound.truncated)
		return bound.template
	}
	notify.filenameBudgetFailed(bound.reason, outputDir)
	const fallback = bindFilenameTemplate(DEFAULT_FILENAME_TEMPLATE, meta, ctx)
	return fallback.ok ? fallback.template : DEFAULT_FILENAME_TEMPLATE
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
 *
 * A placeholder title (`titleIsPlaceholder`, fabricated as `Untitled · #N` by
 * the flat-playlist probe) maps to `title: undefined` so bindFilenameTemplate
 * leaves `{title}` as a late-binding placeholder for yt-dlp to resolve at
 * download time — the same deferral path `{uploader}` and `{id}` already use.
 *
 * `playlistIndexOverride` carries the display number (position within the
 * sorted selected set, 1-based). It is passed only as TemplateMetadata —
 * never written back onto the entry, whose `playlistIndex` stays immutable
 * probe-order identity so selection survives sort changes.
 */
export function playlistEntryTemplateMeta(entry: PlaylistEntry, playlistTitle: string, playlistId: string, playlistIndexOverride?: number): TemplateMetadata {
	const title = entry.titleIsPlaceholder === true ? undefined : omitBlank(entry.title)
	return {title, id: omitBlank(entry.videoId), uploader: omitBlank(entry.uploader), uploadDate: omitBlank(entry.uploadDate), playlistTitle: omitBlank(playlistTitle), playlistId: omitBlank(playlistId), playlistIndex: playlistIndexOverride ?? entry.playlistIndex}
}

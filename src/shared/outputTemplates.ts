import {resolveFilenameTemplate, type ResolvedDownloadProfile} from '@shared/downloadProfiles.js'
import {bindFilenameTemplate, DEFAULT_FILENAME_TEMPLATE, templateDirsVaryPerEntry, templateHasDirs, templateEndsWithBracketedId, templateSite, type TemplateMetadata} from '@shared/filenameTemplate.js'
import {requestedFormats, type BudgetFailure, type InFlightFiles, type InFlightFormat} from '@shared/nameBudget.js'
import type {DownloadProfile, MediaTags, PlaylistEntry, PlaylistSelection, VideoProbeResult} from '@shared/types.js'
import {requestedSubtitles} from '@shared/subtitleTracks.js'

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
 * files by matching `[videoId]` right before the extension. When the effective
 * template's filename does not end in `[{id}]` both features would silently
 * mismatch, so callers must degrade instead: skip the folder scan, and don't
 * write a playlist file.
 */
export function canMatchDownloadsById(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	return templateEndsWithBracketedId(resolveFilenameTemplate(profile, globalTemplate))
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
 * response as a template with no `[{id}]` to match on.
 */
export function canScanPlaylistFolder(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	const template = resolveFilenameTemplate(profile, globalTemplate)
	return templateEndsWithBracketedId(template) && !templateDirsVaryPerEntry(template)
}

/**
 * A playlist file lists its entries relative to one directory. A nesting
 * template can scatter entries across per-uploader or per-date folders, leaving
 * no such directory — so M3U degrades exactly as it already does when `[{id}]` is
 * missing.
 */
export function canWriteM3u(profile: DownloadProfile | undefined, globalTemplate: string | undefined): boolean {
	return canMatchDownloadsById(profile, globalTemplate) && !templateOwnsDirs(profile, globalTemplate)
}

/**
 * Where a job's name is bound: the filesystem rules that apply, and who hears
 * that a name was shortened or did not fit.
 */
export interface FilenameBinding {
	platform: NodeJS.Platform
	shortened(title: string, tokens: readonly string[]): void
	budgetFailed(reason: BudgetFailure, outputDir: string): void
}

/**
 * Bind a template into the filename segment the job will carry, sized to the
 * user's filesystem.
 *
 * The budget needs the real output directory, the real platform, and what the
 * job downloads (`inFlight`: yt-dlp's names mid-download are longer than the
 * finished one), so it runs where the job is prepared, once all three are
 * resolved. Compiling to a yt-dlp `-o` still happens in main; this only decides
 * how long the name may be.
 *
 * A template that cannot fit falls back to the built-in default rather than
 * failing the download, matching how main already degrades an unparseable
 * template. `path-too-deep` is reported the same way even though no name can
 * rescue it — the write will fail with yt-dlp's own error, and the report
 * says why.
 */
export function bindJobFilename(template: string, meta: TemplateMetadata, outputDir: string, inFlight: InFlightFiles, binding: FilenameBinding, suffix?: string): string {
	const ctx = {outputDir, platform: binding.platform, inFlight}
	const bound = bindFilenameTemplate(template, meta, ctx, suffix)
	if (bound.ok) {
		if (bound.truncated.length > 0) binding.shortened(meta.title ?? '', bound.truncated)
		return bound.template
	}
	binding.budgetFailed(bound.reason, outputDir)
	const fallback = bindFilenameTemplate(DEFAULT_FILENAME_TEMPLATE, meta, ctx, suffix)
	// The suffix survives even a name that cannot fit: a part must never be
	// written under the whole video's name.
	return fallback.ok ? fallback.template : suffix ? `${DEFAULT_FILENAME_TEMPLATE} ${suffix}` : DEFAULT_FILENAME_TEMPLATE
}

/**
 * What a download profile has yt-dlp write. `probed` is the probe's format list:
 * the video's own, or a playlist row's from its hydration probe. A row from a
 * flat playlist probe has none, so its format ids stay unknown until yt-dlp runs.
 */
export function profileInFlight(resolved: ResolvedDownloadProfile, probed: readonly InFlightFormat[]): InFlightFiles {
	return {formats: resolved.isSubtitleOnly ? [] : requestedFormats(undefined, probed), subtitleLanguages: resolved.subtitles ? requestedSubtitles(resolved.subtitles.request) : []}
}

/** What a playlist batch has yt-dlp write for an entry; `probed` as in profileInFlight. */
export function playlistSelectionInFlight(selection: PlaylistSelection, probed: readonly InFlightFormat[]): InFlightFiles {
	return selection.kind === 'subtitles' ? {formats: [], subtitleLanguages: selection.languages} : {formats: requestedFormats(undefined, probed), subtitleLanguages: []}
}

/** Drop blanks so an absent field collapses its folder rather than emptying it. */
export function omitBlank(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim() ?? ''
	return trimmed.length > 0 ? trimmed : undefined
}

export function mediaTagsMeta(tags: MediaTags | undefined): Pick<TemplateMetadata, 'category' | 'artist' | 'album' | 'track'> {
	return {category: omitBlank(tags?.category), artist: omitBlank(tags?.artist), album: omitBlank(tags?.album), track: omitBlank(tags?.track)}
}

/** Metadata for a video probe queued without the wizard (Quick Download). */
export function videoProbeTemplateMeta(probe: Pick<VideoProbeResult, 'title' | 'videoId' | 'uploader' | 'uploadDate' | 'webpageUrl' | 'mediaTags'>): TemplateMetadata {
	return {title: omitBlank(probe.title), id: omitBlank(probe.videoId), uploader: omitBlank(probe.uploader), uploadDate: omitBlank(probe.uploadDate), site: templateSite(probe.webpageUrl), ...mediaTagsMeta(probe.mediaTags)}
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
	return {
		title,
		id: omitBlank(entry.videoId),
		uploader: omitBlank(entry.uploader),
		uploadDate: omitBlank(entry.uploadDate),
		site: templateSite(entry.url),
		...mediaTagsMeta(entry.mediaTags),
		playlistTitle: omitBlank(playlistTitle),
		playlistId: omitBlank(playlistId),
		playlistIndex: playlistIndexOverride ?? entry.playlistIndex
	}
}

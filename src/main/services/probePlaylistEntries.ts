import log from 'electron-log/main.js'
import {placeholderTitleFlag} from '@shared/queueTitle.js'
import type {PlaylistEntry} from '@shared/types.js'
import type {InfoDict, VideoInfo} from 'yt-dlp-bridge/info'
import {siteForExtractor, type Site} from '@shared/sites/index.js'
import {mediaTagsField, resolveTimestamp, resolveUploadDate, resolveUploader, upgradeThumbnailScheme} from './probeInfoFields.js'

const logger = log.scope('probe')

function pickEntryThumbnail(entry: InfoDict): string {
	const v = entry as VideoInfo
	if (typeof v.thumbnail === 'string' && v.thumbnail.length > 0) return upgradeThumbnailScheme(v.thumbnail)
	const list = v.thumbnails
	if (!list || list.length === 0) return ''
	// Some extractors (NicoVideo) emit thumbnail entries with `url: null` as
	// placeholders — find the first entry with a usable URL.
	for (const t of list) {
		if (typeof t.url === 'string' && t.url.length > 0) return upgradeThumbnailScheme(t.url)
	}
	return ''
}

function untitledLabel(playlistIndex: number): string {
	return `Untitled · #${playlistIndex}`
}

// Browse-id playlist hints + nested-container detection now live on the Site
// adapter (src/shared/sites/youtube.ts). For non-YouTube sites these methods
// are absent and the helpers below short-circuit cleanly.
function siteHintForId(site: Site, id: string): string | null {
	return site.hintForPlaylistId ? site.hintForPlaylistId(id) : null
}

function siteIsNestedContainer(site: Site, id: string): boolean {
	return site.isNestedContainer ? site.isNestedContainer({id}) : false
}

function buildEntryUrl(entry: InfoDict): string | null {
	// _type='url' / 'url_transparent' / 'video': webpage_url is canonical when present.
	// Flat-playlist entries often only have `url` (the watch URL) — accept either.
	const v = entry as VideoInfo & {url?: string}
	if (typeof v.webpage_url === 'string' && v.webpage_url.length > 0) return v.webpage_url
	if (typeof v.url === 'string' && v.url.startsWith('http')) return v.url
	return null
}

export function mapPlaylistEntries(entries: readonly InfoDict[], jobUrl: string, siteOrExtractor: Site | string): PlaylistEntry[] {
	const site = typeof siteOrExtractor === 'string' ? siteForExtractor(siteOrExtractor) : siteOrExtractor
	return mapPlaylistEntriesInner(entries, jobUrl, site)
}

function mapPlaylistEntriesInner(entries: readonly InfoDict[], jobUrl: string, site: Site): PlaylistEntry[] {
	// First pass: detect whether the result set contains any real video entry
	// (id without a known container prefix). If yes, the heterogeneous-result
	// case applies and we'll filter containers out below. If no (all nested),
	// we keep them — better than an empty picker.
	let hasVideoEntries = false
	for (const entry of entries) {
		const id = typeof (entry as VideoInfo).id === 'string' ? (entry as VideoInfo).id! : ''
		if (id && !siteIsNestedContainer(site, id)) {
			hasVideoEntries = true
			break
		}
	}

	const out: PlaylistEntry[] = []
	let fallbackIndex = 1
	let droppedContainerCount = 0
	for (const entry of entries) {
		const url = buildEntryUrl(entry)
		if (!url) {
			logger.warn('Playlist entry skipped — no resolvable URL', {jobUrl, entryId: typeof (entry as VideoInfo).id === 'string' ? (entry as VideoInfo).id : '(none)'})
			fallbackIndex++
			continue
		}
		const v = entry as VideoInfo & {playlist_index?: number}
		const playlistIndex = typeof v.playlist_index === 'number' ? v.playlist_index : fallbackIndex
		const idStr = typeof v.id === 'string' ? v.id : ''
		// Heterogeneous-result filter: when the set contains any actual video,
		// drop nested containers (channel/playlist/album/mix). Selecting them
		// would silently download their entire contents, which doesn't fit the
		// wizard's "pick videos" model. If the set is entirely nested (no
		// videos at all — pure music-category search), we keep everything so
		// the picker isn't empty.
		if (hasVideoEntries && idStr && siteIsNestedContainer(site, idStr)) {
			droppedContainerCount++
			fallbackIndex++
			continue
		}
		// Fallback chain: explicit title → site-specific id hint → neutral
		// placeholder. The id hint is YouTube-only today (browse-id prefixes);
		// generic sites return null and fall through to the placeholder. Only the
		// final placeholder branch marks titleIsPlaceholder — the id hint is a
		// real site-provided hint, not a fabrication.
		const rawTitle = typeof v.title === 'string' ? v.title.trim() : ''
		const idHint = idStr ? siteHintForId(site, idStr) : null
		const isPlaceholderTitle = rawTitle.length === 0 && idHint == null
		const title = rawTitle.length > 0 ? rawTitle : (idHint ?? untitledLabel(playlistIndex))
		// PlaylistEntry.id must be unique per row, not per video. YouTube mix /
		// radio feeds frequently repeat the same video at multiple positions;
		// collapsing them to one id would make the selection state and the
		// post-confirm filter (`playlistItems.filter(e => ids.includes(e.id))`)
		// treat them as one — clicking one would check both, and a single
		// selection would produce two queue items. Index-prefixing guarantees
		// 1 row = 1 stable id even when the underlying yt-dlp id collides.
		const videoIdPart = typeof v.id === 'string' && v.id.length > 0 ? v.id : url
		// Only reachable on the all-nested path — the branch above already
		// dropped containers whenever the set held a real video. Marking rather
		// than dropping keeps the picker populated; downstream refuses to queue
		// them, which is what the flag exists for.
		const isContainer = idStr.length > 0 && siteIsNestedContainer(site, idStr)
		const entryTimestamp = resolveTimestamp(v)
		out.push({
			id: `${playlistIndex}::${videoIdPart}`,
			url,
			title,
			thumbnail: pickEntryThumbnail(entry),
			duration: typeof v.duration === 'number' ? Math.round(v.duration) : undefined,
			playlistIndex,
			videoId: idStr.length > 0 ? idStr : null,
			uploader: resolveUploader(v),
			uploadDate: resolveUploadDate(v),
			...mediaTagsField(v),
			...(entryTimestamp !== undefined ? {timestamp: entryTimestamp} : {}),
			...(isContainer ? {isContainer: true as const} : {}),
			...placeholderTitleFlag(isPlaceholderTitle)
		})
		fallbackIndex++
	}
	if (droppedContainerCount > 0) {
		logger.info('Playlist entries filtered: dropped nested containers', {jobUrl, droppedContainerCount, keptCount: out.length})
	}
	return out
}

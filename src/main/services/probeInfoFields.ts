import type {MediaTags} from '@shared/types.js'
import type {VideoInfo} from 'yt-dlp-bridge/info'
import {resolveMediaTags} from './probeMediaTags.js'

// Fields a probe reads the same way from a video and from a playlist entry.

// The renderer CSP allows `img-src 'self' data: https:` — no plaintext http.
// Several extractors (Bilibili's i0.hdslb.com among them) hand back http URLs,
// which the renderer then refuses to load, leaving a broken thumbnail. The CDNs
// serve the identical bytes over https, so upgrade the scheme here rather than
// widening the CSP: allowing http images would let a network attacker inject
// arbitrary picture content into the picker.
export function upgradeThumbnailScheme(url: string): string {
	return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url
}

/**
 * Resolve the uploader the same way the compiled `{uploader}` output template
 * does (`%(uploader,channel,creator,uploader_id)`). Arroxy renders `{uploader}`
 * itself in directory position, so drifting from that chain would put a video
 * in a folder named differently from the file yt-dlp writes inside it.
 */
export function resolveUploader(source: {uploader?: string; channel?: string; creator?: string; uploader_id?: string}): string | undefined {
	for (const candidate of [source.uploader, source.channel, source.creator, source.uploader_id]) {
		if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim()
	}
	return undefined
}

export function resolveUploadDate(source: {upload_date?: string}): string | undefined {
	// Anything not YYYYMMDD would render a nonsense folder name, so drop it.
	return source.upload_date !== undefined && /^\d{8}$/.test(source.upload_date) ? source.upload_date : undefined
}

// Spread rather than set, so a result with no tags has no `mediaTags` key.
export function mediaTagsField(source: VideoInfo): {mediaTags?: MediaTags} {
	const mediaTags = resolveMediaTags(source)
	return mediaTags ? {mediaTags} : {}
}

export function resolveTimestamp(source: {timestamp?: number}): number | undefined {
	// Epoch seconds from yt-dlp. uploadDate is YYYYMMDD — too coarse to order
	// same-day uploads within a series — so the sort control needs this finer
	// value. Anything non-finite, non-integer, or non-positive is not a real
	// timestamp, so drop it the same way resolveUploadDate drops malformed dates.
	return typeof source.timestamp === 'number' && Number.isFinite(source.timestamp) && Number.isInteger(source.timestamp) && source.timestamp > 0 ? source.timestamp : undefined
}

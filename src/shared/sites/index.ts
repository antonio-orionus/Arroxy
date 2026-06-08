// Lookup helpers for the Site adapter. Two ways to resolve a site:
//   - by URL hostname (used during probe before we know the extractor)
//   - by yt-dlp extractor identity (used during download phases after probe)
//
// New sites get a new adapter file + a branch in each lookup. Callers stay
// adapter-agnostic.

import {isYouTubeExtractor} from '../ytdlp/extractorPredicates.js'
import {genericSite} from './generic.js'
import {youtubeSite} from './youtube.js'
import type {Site} from './types.js'

export type {Site, SiteId, PlaylistEntryHint} from './types.js'

function isYouTubeHost(url: string): boolean {
	try {
		const host = new URL(url).hostname.toLowerCase()
		return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com')
	} catch {
		return false
	}
}

// Resolve a Site adapter from a URL. Used by the unified probe pipeline before
// the extractor is known. URL-based detection is conservative (hostname only)
// to avoid mis-routing — a non-YouTube CDN URL that happens to mention
// "youtube" in a query param won't match.
export function siteForUrl(url: string): Site {
	return isYouTubeHost(url) ? youtubeSite : genericSite
}

// Resolve a Site adapter from yt-dlp's extractor identity. Used during the
// download phases after probe has fingerprinted the source.
export function siteForExtractor(extractor: string | undefined | null): Site {
	return isYouTubeExtractor(extractor) ? youtubeSite : genericSite
}

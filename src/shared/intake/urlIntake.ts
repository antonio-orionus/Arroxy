// URL intake helpers used before probing. Kept separate from the probe
// orchestrator so URL normalization and mixed-URL detection stay testable.

import {classifyUrlIntent, isMixedUrlIntent} from '@shared/urlIntent.js'

export function isMixedYouTubeUrl(url: string): boolean {
	return isMixedUrlIntent(classifyUrlIntent(url))
}

const YT_CHANNEL_TAB_NAMES = new Set(['videos', 'shorts', 'streams', 'live', 'playlists', 'community', 'about', 'featured', 'channels', 'store', 'releases', 'podcasts'])

export function rewriteYouTubeChannelRoot(url: string): string {
	try {
		const u = new URL(url)
		const host = u.hostname.toLowerCase()
		const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com')
		if (!isYouTube) return url
		const segments = u.pathname.split('/').filter(Boolean)
		if (segments.length === 0) return url
		const isChannelRoot = (segments[0].startsWith('@') && segments.length === 1) || ((segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') && segments.length === 2)
		if (!isChannelRoot) return url
		const lastSegment = segments[segments.length - 1].toLowerCase()
		if (YT_CHANNEL_TAB_NAMES.has(lastSegment)) return url
		u.pathname = `${u.pathname.replace(/\/$/, '')}/videos`
		return u.toString()
	} catch {
		return url
	}
}

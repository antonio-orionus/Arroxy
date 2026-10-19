import {cleanUrl} from '@shared/cleanUrl.js'
import {isYouTubeHostname} from '@shared/sites/youtube.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'

const WEB_PROTOCOLS = new Set(['http:', 'https:'])

// Whether an Explore page, or a link on one, is something the download flow
// can take as-is. On YouTube: a video (a video-with-list counts — the flow
// asks which one), a playlist, or a channel; search results and the home feed
// name nothing to grab. On any other site, any web page: only yt-dlp can tell
// what it holds. Main gates the link menu on it, the renderer the bar.
export function isExploreGrabbable(url: string): boolean {
	let parsed: URL
	try {
		parsed = new URL(url)
	} catch {
		return false
	}
	if (!WEB_PROTOCOLS.has(parsed.protocol) || parsed.hostname === '') return false
	if (!isYouTubeHostname(parsed.hostname)) return true
	const intent = classifyUrlIntent(cleanUrl(url))
	switch (intent.kind) {
		case 'obvious-single':
			return intent.site === 'youtube'
		case 'mixed':
			return true
		case 'obvious-collection':
			return intent.collection !== 'search'
		case 'unknown':
			return false
	}
}

import {cleanUrl} from '@shared/cleanUrl.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'

// Whether an Explore page, or a link on one, is something the download flow
// can take as-is: a YouTube video (a video-with-list counts — the flow asks
// which one), a playlist, or a channel. Search results and the home feed name
// nothing to grab. Main gates the link menu on it, the renderer the bar.
export function isExploreGrabbable(url: string): boolean {
	if (!url) return false
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

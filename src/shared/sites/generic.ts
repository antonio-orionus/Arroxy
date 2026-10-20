// Generic Site adapter — vanilla yt-dlp behavior with no site-specific
// quirks. Returned for any extractor / URL that doesn't match a more specific
// adapter (currently: anything that isn't YouTube).

import type {Site} from './types.js'

export const genericSite: Site = {
	id: 'generic',
	needsPotToken: false,
	supportsSponsorBlock: false,
	needsAutoCaptionDedupe: false,
	autoCaptionRequiresOrigSuffix: false
	// No hintForPlaylistId / isNestedContainer — yt-dlp's generic extractor
	// doesn't expose the metadata that those would parse.
}

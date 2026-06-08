// Site adapter — single seam for site-specific quirks across the probe and
// download pipelines. Two adapters today: `youtube` and `generic`. Each
// site-specific behavior that used to be a scattered `isYouTubeExtractor()` /
// `isYouTubeHostUrl()` check now lives behind a method on this interface.
//
// Keep the interface small and declarative. New behaviors get a method here
// rather than a branch in callers.

export type SiteId = 'youtube' | 'generic'

export interface PlaylistEntryHint {
	id?: string
	ie_key?: string
}

export interface Site {
	readonly id: SiteId

	// PoT (proof-of-origin token) mint applies. Currently only YouTube — token
	// service stays inert for non-YouTube probes.
	readonly needsPotToken: boolean

	// SponsorBlock crowdsourced segment data is YouTube-only. Other extractors
	// get the flag stripped from yt-dlp args even if the user toggled it (the
	// wizard hides the SponsorBlock step for non-YouTube extractors anyway, this
	// is defense-in-depth).
	readonly supportsSponsorBlock: boolean

	// YouTube auto-captions arrive as rolling cues that duplicate the prior
	// line + 1 word. Enable post-process dedupe only for YouTube.
	readonly needsAutoCaptionDedupe: boolean

	// YouTube bundles real auto-captions and on-demand translations into the
	// same map; only `-orig`-suffixed langs are real generated tracks. Other
	// extractors emit auto-captions under bare lang codes — applying the filter
	// would discard every track.
	readonly autoCaptionRequiresOrigSuffix: boolean

	// Browse-id hint for the playlist intake step. YouTube's playlist intake
	// browse-ids encode container kind in the prefix (UC*, MPRE*, MPSPPL*, …);
	// generic sites have no analog.
	hintForPlaylistId?(id: string): string | null

	// Heterogeneous container detection — yt-dlp's playlist enumeration for
	// YouTube can return a mix of videos and nested playlists/channels. Generic
	// sites don't have this issue.
	isNestedContainer?(entry: PlaylistEntryHint): boolean
}

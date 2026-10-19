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

// Owned cookie shape so src/shared stays Electron-free; the desktop adapter
// maps Electron's Cookie onto it.
export interface ExploreCookie {
	name: string
	value: string
	domain: string
	hostOnly: boolean
	path: string
	secure: boolean
	httpOnly: boolean
	session: boolean
	expirationDate?: number
}

// A hostname rule for an Explore view (the site's own hosts, which hosts are sign-in). `pattern` names a built-in matcher.
export type HostRule = {kind: 'exact'; host: string} | {kind: 'suffix'; domain: string} | {kind: 'pattern'; pattern: 'google-accounts-cctld' | 'google-consent-cctld' | 'google-cctld'}

export interface SiteExplore {
	// Where the Explore tab opens for this site.
	readonly homeUrl: string
	// A job's jar contains only cookies on these registrable domains (and their subdomains).
	readonly cookieDomains: readonly string[]
	// Cookie hosts that carry the user's account across the provider's services:
	// they never reach the jar of a download from any other site.
	readonly accountCookieHosts: readonly HostRule[]
	// The site's own content hosts: an address typed in the bar for one of them
	// opens in the site's canonical https form.
	readonly contentHosts: readonly HostRule[]
	// The account provider's sign-in and account hosts: the ad blocker never acts on them.
	readonly signInHosts: readonly HostRule[]
	// Cookie-consent hops on the way to the site: reached by the site's own
	// redirects, never as an address typed in the bar.
	readonly consentHosts: readonly HostRule[]
	// Presence check only (cheap, synchronous); validity is ExploreSessionService.verifySignedIn.
	isSignedIn(cookies: readonly ExploreCookie[]): boolean
	// Paths of the pages a while away from the tab may release (idle unload):
	// nothing on them is typed in that their URL does not keep.
	readonly idleUnloadPaths: readonly string[]
	// A typed link on a site host in the form the site serves it (a short
	// link as its full page, say); absent when every form loads as it is.
	canonicalAddress?(url: URL): URL
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

	// In-app browser (Explore) capability. Absent for sites that cannot escalate
	// a download onto a signed-in session.
	readonly explore?: SiteExplore
}

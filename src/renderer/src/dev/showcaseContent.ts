import type {PlaylistEntry, ProbeResult, QueueItem} from '@shared/types.js'

// Showcase content for browser-mock (`?showcase=1`): replaces the workbench's
// "Mock …" fixture titles and remote thumbnails with neutral sample titles and
// generated artwork, so README and store screenshots look like real use without
// showing anyone's actual video art. Deterministic: the same item always gets
// the same title and artwork. Placeholder-only states stay testable because the
// workbench without the knob is unchanged.

const SAMPLE_TITLES = [
	'Northern Lights Over Lofoten in 4K',
	'Rainforest Rain Sounds for Focus',
	'Alpine Lakes: A Slow Travel Film',
	'Ocean Worlds: The Living Reef',
	'Night Train Through the Mountains',
	'Coral Reef Life in 8K HDR',
	'Desert Dunes at Golden Hour',
	'Iceland Waterfalls from Above',
	'Jazz Café Live Session',
	'Cherry Blossom Walk in Kyoto',
	'Thunderstorm Over the Prairie',
	'Lighthouse Coast Timelapse',
	'Wild Horses of the Steppe',
	'Autumn Forest Ambience',
	'City Lights at Blue Hour',
	'Snowfall in a Mountain Cabin',
	'Canyon River Kayak Run'
] as const

const PALETTES = [
	['#0f2027', '#2c5364', '#7ad7f0'],
	['#1a1a40', '#7a0bc0', '#fa58b6'],
	['#134e5e', '#71b280', '#f5f7a8'],
	['#0b486b', '#f56217', '#ffd194'],
	['#141e30', '#243b55', '#9aa3c4'],
	['#1d2b64', '#c06c84', '#f8cdda'],
	['#000428', '#004e92', '#5ee7df'],
	['#3a1c71', '#d76d77', '#ffaf7b'],
	['#0f3443', '#34e89e', '#d9f8c4']
] as const

// A fixture title that came from the workbench rather than a real-world name.
const FIXTURE_TITLE = /^(Mock|Scenario)\b/
// The workbench probes `https://example.com/<scenario>`; real sources show a real host.
const FIXTURE_HOST = /^https?:\/\/(www\.)?example\.com\//
// The default mock video is a 24-hour livestream; a sample title needs a normal length.
const MAX_SAMPLE_DURATION_SECONDS = 4 * 60 * 60

function hash(text: string): number {
	let value = 7
	for (const char of text) value = (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0
	return value
}

export function showcaseTitle(seed: string): string {
	return SAMPLE_TITLES[hash(seed) % SAMPLE_TITLES.length]
}

export function showcaseArtwork(seed: string): string {
	const value = hash(seed)
	const [from, mid, to] = PALETTES[value % PALETTES.length]
	const horizon = 150 + (value % 60)
	const sunX = 260 + (value % 180)
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset=".6" stop-color="${mid}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="480" height="270" fill="url(#g)"/><circle cx="${sunX}" cy="78" r="30" fill="${to}" opacity=".6"/><path d="M0 ${horizon + 40} Q120 ${horizon} 240 ${horizon + 30} T480 ${horizon + 10} V270 H0Z" fill="#000" opacity=".28"/><path d="M0 ${horizon + 70} Q150 ${horizon + 35} 290 ${horizon + 62} T480 ${horizon + 55} V270 H0Z" fill="#000" opacity=".32"/></svg>`
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function showcaseUrl(url: string, seed: string): string {
	return FIXTURE_HOST.test(url) ? `https://www.youtube.com/watch?v=${hash(seed).toString(36)}` : url
}

function title(current: string, seed: string): string {
	return FIXTURE_TITLE.test(current) ? showcaseTitle(seed) : current
}

function duration(seconds: number | undefined): number | undefined {
	return seconds !== undefined && seconds > MAX_SAMPLE_DURATION_SECONDS ? 1122 + (seconds % 600) : seconds
}

// Workbench links use real, recognisable video IDs; showcase links use neutral ones.
export function showcaseWatchUrl(url: string): string {
	return url.replace(/([?&]v=)([\w-]+)/, (_match, prefix: string, id: string) => `${prefix}${hash(id).toString(36)}`)
}

export function showcasePlaylistEntry(entry: PlaylistEntry): PlaylistEntry {
	const seed = entry.id
	return {...entry, title: title(entry.title, seed), thumbnail: showcaseArtwork(seed), duration: duration(entry.duration)}
}

export function showcaseProbe(probe: ProbeResult): ProbeResult {
	const seed = probe.webpageUrl
	const webpageUrl = showcaseUrl(probe.webpageUrl, seed)
	if (probe.kind === 'playlist') return {...probe, webpageUrl, playlistTitle: title(probe.playlistTitle, seed), entries: probe.entries.map(showcasePlaylistEntry)}
	return {...probe, webpageUrl, title: title(probe.title, seed), thumbnail: showcaseArtwork(seed), duration: duration(probe.duration)}
}

export function showcaseQueueItem(item: QueueItem): QueueItem {
	const seed = item.id
	return {...item, title: title(item.title, seed), thumbnail: showcaseArtwork(seed)}
}

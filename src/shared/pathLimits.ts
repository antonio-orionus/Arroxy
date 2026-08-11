// Filesystem length limits, per platform, in the unit each platform actually
// counts in. Pure data and pure measurement — no I/O, no `process` access — so
// callers inject the platform and tests cover every OS from any host.
//
// The unit is the whole point of this module. A single byte budget is wrong on
// two of the three platforms Arroxy ships to:
//
//   macOS (APFS)   255 UTF-16 code units  — measured on APFS: 255 CJK chars
//                                           (765 bytes) write fine, 128 emoji
//                                           (256 code units) do not.
//   Windows (NTFS) 255 UTF-16 code units  — Microsoft: the filesystem treats
//                                           names as "an opaque sequence of
//                                           WCHARs".
//   Linux (ext4…)  255 bytes              — NAME_MAX; the VFS treats names as
//                                           opaque NUL-terminated byte strings
//                                           with no encoding awareness.
//
// Budgeting every platform in bytes therefore charges CJK and emoji titles a
// ~3x penalty on macOS and Windows that those filesystems never imposed.

export type LengthUnit = 'utf8-bytes' | 'utf16-units'

export interface PlatformLimits {
	/** Longest single path component the filesystem will accept. */
	componentMax: number
	componentUnit: LengthUnit
	/** Longest absolute path the OS will accept. */
	pathMax: number
	pathUnit: LengthUnit
}

// Windows is the binding constraint by a wide margin. MAX_PATH is 260
// characters unless *both* the registry value LongPathsEnabled is 1 *and* the
// executable's manifest declares longPathAware. yt-dlp's exe is long-path aware
// (PyInstaller ships longPathAware in its default manifest), but Electron's is
// not and libuv never prepends the `\\?\` prefix itself — it only ever strips
// it, in realpath. So Arroxy's own filesystem work (playlist dedupe scanning,
// M3U writing, output directory creation) is capped at 260 regardless of what
// yt-dlp could manage. We budget against 260 rather than shipping a manifest
// change, because the registry half of the opt-in is not ours to set.
const WINDOWS: PlatformLimits = {componentMax: 255, componentUnit: 'utf16-units', pathMax: 260, pathUnit: 'utf16-units'}
const MACOS: PlatformLimits = {componentMax: 255, componentUnit: 'utf16-units', pathMax: 1024, pathUnit: 'utf8-bytes'}
const POSIX: PlatformLimits = {componentMax: 255, componentUnit: 'utf8-bytes', pathMax: 4096, pathUnit: 'utf8-bytes'}

/**
 * Limits for a platform string. Every NodeJS.Platform other than darwin and
 * win32 is POSIX-like, so Linux's limits are the correct default rather than a
 * guess.
 */
export function limitsFor(platform: NodeJS.Platform): PlatformLimits {
	if (platform === 'win32') return WINDOWS
	if (platform === 'darwin') return MACOS
	return POSIX
}

const encoder = new TextEncoder()

/** Length of `value` in the given unit. */
export function measure(value: string, unit: LengthUnit): number {
	// A JS string is already a sequence of UTF-16 code units, so `.length` is
	// exactly the count NTFS and APFS apply.
	return unit === 'utf16-units' ? value.length : encoder.encode(value).length
}

const graphemeSegmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'})

/**
 * Split into user-perceived characters.
 *
 * Code points are not a fine enough unit to cut on. Slicing UTF-16 code units
 * leaves a lone surrogate, which no platform accepts — but slicing code points
 * still severs a ZWJ emoji sequence into fragments, and strands a combining
 * mark on whatever character the cut happened to land after. Graphemes are the
 * boundary a person would recognise, so a truncated name never ends mid-symbol.
 */
export function graphemes(value: string): string[] {
	return [...graphemeSegmenter.segment(value)].map(segment => segment.segment)
}

/** Truncate to a length budget, never cutting inside a character. */
export function truncateTo(value: string, max: number, unit: LengthUnit): string {
	if (max <= 0) return ''
	if (measure(value, unit) <= max) return value
	let out = ''
	let used = 0
	for (const cluster of graphemes(value)) {
		const size = measure(cluster, unit)
		if (used + size > max) break
		out += cluster
		used += size
	}
	return out
}

/**
 * Compose to NFC before measuring or writing.
 *
 * Decomposed input costs double for the same visible text: 255 decomposed "é"
 * is 510 UTF-16 code units and fails on APFS, while the composed form is 255
 * and succeeds. Extractors return whichever form the site used, so normalizing
 * is the difference between honouring a title and truncating half of it away.
 */
export function normalizeName(value: string): string {
	return value.normalize('NFC')
}

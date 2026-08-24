// Subfolder name validator + effective-path helper. Shared between renderer
// (UI input validation), main process (IPC schema enforcement), and tests.
//
// Rules cover Windows/macOS/Linux disallowed filename characters plus
// reserved DOS device names — anything that would break path joining at
// the OS level.

// Reject filename-illegal chars including ASCII control bytes (\x00-\x1F),
// which are explicitly disallowed on Windows and produce undefined behavior
// in path APIs on POSIX.
// eslint-disable-next-line no-control-regex -- control bytes are intentionally matched here
const FORBIDDEN_CHARS = /[<>:"/\\|?*\x00-\x1F]/
const RESERVED_NAMES = /^(CON|PRN|AUX|NUL|CONIN\$|CONOUT\$|(COM|LPT)([0-9]|\u00b9|\u00b2|\u00b3))(\..*)?$/i

export const SUBFOLDER_NAME_MAX = 64

export function isValidSubfolder(name: string): boolean {
	const t = name.trim()
	if (t === '' || t === '.' || t === '..') return false
	if (FORBIDDEN_CHARS.test(t)) return false
	if (RESERVED_NAMES.test(t)) return false
	if (t.endsWith('.') || t.endsWith(' ')) return false
	if (t.length > SUBFOLDER_NAME_MAX) return false
	return true
}

// Choose a separator from what `base` already uses; fall back to `/` when
// ambiguous (e.g. relative path with no separator).
export function joinSubfolder(base: string, sub: string): string {
	if (!sub) return base
	const sep = base.includes('\\') ? '\\' : '/'
	const trimmed = base.replace(/[/\\]+$/, '')
	return trimmed + sep + sub
}

// Sanitize a playlist title for use as a folder name. Same rules as
// sanitizeDirSegment(), except a title that sanitizes away entirely still has to
// produce a folder — 'Playlist' is that fallback.
export function safeFolderName(title: string): string {
	return sanitizeDirSegment(title) ?? 'Playlist'
}

/**
 * Sanitize one rendered path component from a filename template into something
 * safe to create on every supported OS, or null when nothing usable remains.
 *
 * Returning null rather than a fallback name is what lets the caller drop the
 * segment: an empty `{playlist_title}` on a single video must write no folder at
 * all rather than one named 'Playlist'. safeFolderName() wraps this with that
 * fallback for the one case that does need a folder no matter what.
 */
export function sanitizeDirSegment(raw: string): string | null {
	const cleaned = raw
		.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // eslint-disable-line no-control-regex
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[. ]+$/, '')
		.slice(0, SUBFOLDER_NAME_MAX)
		// Slicing can re-expose a trailing dot or space that Windows drops.
		.replace(/[. ]+$/, '')
	if (cleaned === '' || cleaned === '.' || cleaned === '..') return null
	// Escaping appends '_', so a reserved name has to give the underscore its own
	// room in the budget. Otherwise `NUL.<60 chars>` comes back one character over
	// SUBFOLDER_NAME_MAX and isValidSubfolder rejects a name we generated ourselves.
	const budgeted = RESERVED_NAMES.test(cleaned) ? cleaned.slice(0, SUBFOLDER_NAME_MAX - 1).replace(/[. ]+$/, '') : cleaned
	return escapeReservedName(budgeted)
}

/**
 * Escape a Windows reserved device name rather than dropping it.
 *
 * `CON`, `NUL`, `COM1` and friends address devices, not files, and the rule
 * applies with any extension — `NUL.mp4` is still the null device. The user
 * asked for this name, so `CON_` honors that without breaking Windows. Shared
 * by directory segments and filenames so both escape identically.
 *
 * The underscore has to land on the stem, not the end of the string: since the
 * reservation ignores the extension, `NUL.mp4_` is still the null device, and it
 * has mangled the extension for nothing. `NUL_.mp4` is an ordinary file.
 */
export function escapeReservedName(name: string): string {
	if (!RESERVED_NAMES.test(name)) return name
	const dot = name.indexOf('.')
	return dot === -1 ? `${name}_` : `${name.slice(0, dot)}_${name.slice(dot)}`
}

export function effectiveOutputDir(base: string, enabled: boolean, subfolder: string): string {
	const t = subfolder.trim()
	if (!enabled || !t || !isValidSubfolder(t)) return base
	return joinSubfolder(base, t)
}

// Directory a playlist's files land in: an explicit subfolder when the user
// named one, else a folder named after the (sanitized) playlist title.
// Single source of truth for where playlist media is written
// (buildPlaylistQueueItem) and where we scan for already-downloaded items
// (scanDownloadedInFolder) — the two must agree or the scan looks in the wrong dir.
export function playlistBaseDir(base: string, subfolderEnabled: boolean, subfolderName: string, playlistTitle: string): string {
	const sub = subfolderName.trim()
	return subfolderEnabled && isValidSubfolder(sub) ? joinSubfolder(base, sub) : joinSubfolder(base, safeFolderName(playlistTitle || 'Playlist'))
}

// Inverse of joinSubfolder: split a directory path into its parent and final
// segment, tolerating either separator and trailing slashes. Maps a user-picked
// playlist folder back onto base + explicit subfolder so the base+subfolder
// SSOT stays consistent and playlistBaseDir reproduces the chosen dir exactly
// (rather than appending the auto/saved subfolder a second time).
export function splitDir(dir: string): {parent: string; leaf: string} {
	const trimmed = dir.replace(/[/\\]+$/, '')
	// Windows drive root ("C:\" or "C:"): the root IS the parent and there is no
	// leaf, so joinSubfolder(parent, '') round-trips back to the drive root
	// instead of mangling it to "/C:".
	if (/^[A-Za-z]:$/.test(trimmed)) return {parent: trimmed + '\\', leaf: ''}
	// Separator-only root ("/" or "\") collapsed to empty by the trim above —
	// restore the bare root as the parent so the round-trip holds.
	if (trimmed === '' && dir !== '') return {parent: dir.slice(0, 1), leaf: ''}
	const idx = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
	if (idx < 0) return {parent: '', leaf: trimmed}
	const parent = idx === 0 ? trimmed.slice(0, 1) : trimmed.slice(0, idx)
	return {parent: /^[A-Za-z]:$/.test(parent) && trimmed[idx] === '\\' ? parent + '\\' : parent, leaf: trimmed.slice(idx + 1)}
}

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
const FORBIDDEN_CHARS = /[<>:"/\\|?*\x00-\x1F]/;
const RESERVED_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

export const SUBFOLDER_NAME_MAX = 64;

export function isValidSubfolder(name: string): boolean {
  const t = name.trim();
  if (t === '' || t === '.' || t === '..') return false;
  if (FORBIDDEN_CHARS.test(t)) return false;
  if (RESERVED_NAMES.test(t)) return false;
  if (t.endsWith('.') || t.endsWith(' ')) return false;
  if (t.length > SUBFOLDER_NAME_MAX) return false;
  return true;
}

// Choose a separator from what `base` already uses; fall back to `/` when
// ambiguous (e.g. relative path with no separator).
export function joinSubfolder(base: string, sub: string): string {
  if (!sub) return base;
  const sep = base.includes('\\') ? '\\' : '/';
  const trimmed = base.replace(/[/\\]+$/, '');
  return trimmed + sep + sub;
}

// Sanitize a playlist title for use as a folder name. Strips or replaces
// characters that are illegal on Windows/macOS/Linux and trims whitespace.
export function safeFolderName(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // eslint-disable-line no-control-regex
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[. ]+$/, '') // no trailing dots or spaces (Windows)
      .slice(0, SUBFOLDER_NAME_MAX) || 'Playlist'
  );
}

export function effectiveOutputDir(base: string, enabled: boolean, subfolder: string): string {
  const t = subfolder.trim();
  if (!enabled || !t || !isValidSubfolder(t)) return base;
  return joinSubfolder(base, t);
}

// Directory a playlist's files land in: an explicit subfolder when the user
// named one, else a folder named after the (sanitized) playlist title.
// Single source of truth for where playlist media is written
// (buildPlaylistQueueItem) and where we scan for already-downloaded items
// (scanDownloadedInFolder) — the two must agree or the scan looks in the wrong dir.
export function playlistBaseDir(base: string, subfolderEnabled: boolean, subfolderName: string, playlistTitle: string): string {
  const sub = subfolderName.trim();
  return subfolderEnabled && isValidSubfolder(sub) ? joinSubfolder(base, sub) : joinSubfolder(base, safeFolderName(playlistTitle || 'Playlist'));
}

// Inverse of joinSubfolder: split a directory path into its parent and final
// segment, tolerating either separator and trailing slashes. Maps a user-picked
// playlist folder back onto base + explicit subfolder so the base+subfolder
// SSOT stays consistent and playlistBaseDir reproduces the chosen dir exactly
// (rather than appending the auto/saved subfolder a second time).
export function splitDir(dir: string): { parent: string; leaf: string } {
  const trimmed = dir.replace(/[/\\]+$/, '');
  // Windows drive root ("C:\" or "C:"): the root IS the parent and there is no
  // leaf, so joinSubfolder(parent, '') round-trips back to the drive root
  // instead of mangling it to "/C:".
  if (/^[A-Za-z]:$/.test(trimmed)) return { parent: trimmed + '\\', leaf: '' };
  // Separator-only root ("/" or "\") collapsed to empty by the trim above —
  // restore the bare root as the parent so the round-trip holds.
  if (trimmed === '' && dir !== '') return { parent: dir.slice(0, 1), leaf: '' };
  const idx = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
  if (idx < 0) return { parent: '', leaf: trimmed };
  const parent = idx === 0 ? trimmed.slice(0, 1) : trimmed.slice(0, idx);
  return { parent: /^[A-Za-z]:$/.test(parent) && trimmed[idx] === '\\' ? parent + '\\' : parent, leaf: trimmed.slice(idx + 1) };
}

// Subfolder name validator + effective-path helper. Shared between renderer
// (UI input validation), main process (IPC schema enforcement), and tests.
//
// Rules cover Windows/macOS/Linux disallowed filename characters plus
// reserved DOS device names — anything that would break path joining at
// the OS level.

// Reject filename-illegal chars including ASCII control bytes (\x00-\x1F),
// which are explicitly disallowed on Windows and produce undefined behavior
// in path APIs on POSIX.
// eslint-disable-next-line no-control-regex
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

export function effectiveOutputDir(
  base: string,
  enabled: boolean,
  subfolder: string
): string {
  const t = subfolder.trim();
  if (!enabled || !t || !isValidSubfolder(t)) return base;
  return joinSubfolder(base, t);
}

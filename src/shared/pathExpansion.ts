// yt-dlp expands shell variables and `~` in literal path text. Before it fills
// in any field, it runs os.path.expandvars(os.path.expanduser(...)) over the
// whole `-o` template (YoutubeDL._outtmpl_expandpath) and over every `--paths`
// value (YoutubeDL.get_output_path). Field values are inserted afterwards and
// are safe; literal text is not, and Arroxy binds titles, uploaders and folder
// names into those strings as literal text.
//
// There is no escape that survives both expanders: POSIX expandvars has none,
// and `$$` is not one — yt-dlp's own `$$` workaround still lets the second `$`
// expand. So the character that would start an expansion is swapped for its
// full-width look-alike, the way yt-dlp itself swaps `:` or `|` in a filename.
// Only a sigil that could actually begin a reference is touched, so "$100" and
// "100% off" keep their ASCII signs.
//
//   POSIX  `$name`, `${name}` (ASCII name, only when set)
//   nt     the same, plus `$$` -> `$`, `%name%`, `%%` -> `%`
//   both   `~` or `~user` at the very start of the string

// `$` before a name, a brace, or a second `$`. A name starting with a digit or
// `-` is legal on Windows but never set in practice.
const DOLLAR_REFERENCE = /\$(?=[A-Za-z_{$])/g
// The same, plus a `$` that ends the text: for a piece of a larger name, what
// follows is not known yet and may change when a neighbour is truncated.
const DOLLAR_REFERENCE_OR_END = /\$(?=[A-Za-z_{$]|$)/g
// `%` before a name, a second `%` (nt's escape, which collapses the pair), or
// `(`, which opens a yt-dlp field when a directory reaches `-o` unescaped.
const PERCENT_REFERENCE = /%(?=[A-Za-z_%(])/g

const FULLWIDTH_DOLLAR = '\uFF04'
const FULLWIDTH_PERCENT = '\uFF05'
const FULLWIDTH_TILDE = '\uFF5E'

/**
 * Literal text for the filename part of `-o`. `%` is left alone: the compiler
 * escapes it as `%%`, which yt-dlp preserves through expansion. A `~` matters
 * only where the name starts, because ntpath.expanduser turns `~name` into a
 * sibling profile directory, which then overrides `--paths` — the file would
 * land in `C:\Users\<title>`. Pass `atStart: false` for text that follows
 * something else in the name.
 */
export function neutralizeFilenameExpansion(text: string, atStart = true): string {
	const dollars = text.replace(DOLLAR_REFERENCE, FULLWIDTH_DOLLAR)
	return atStart ? dollars.replace(/^~/, FULLWIDTH_TILDE) : dollars
}

/**
 * One piece of a filename that is still being assembled (a bound value or a
 * literal between tokens). Context-free on purpose: every occurrence of a
 * repeated token gets the same text, and no cut or neighbour can turn a safe
 * `$` into a reference later. The leading `~` is the caller's, since only the
 * caller knows which piece starts the name.
 */
export function neutralizeFilenamePiece(text: string): string {
	return text.replace(DOLLAR_REFERENCE_OR_END, FULLWIDTH_DOLLAR)
}

/**
 * One directory name Arroxy renders into `--paths` (or into the directory part
 * of `-o`). Nothing escapes `%` there, so a Windows `%NAME%` and `%%` are
 * neutralised too. A leading `~` cannot matter: a segment always follows an
 * absolute base directory.
 */
export function neutralizeDirExpansion(text: string): string {
	return text.replace(DOLLAR_REFERENCE, FULLWIDTH_DOLLAR).replace(PERCENT_REFERENCE, FULLWIDTH_PERCENT)
}

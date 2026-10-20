// Pure, so a renderer can build an output template without the planner's
// Node imports.

/**
 * Literal text for an output template (`-o`, a `--print-to-file` file). Each
 * `%`, `$` and `~` becomes an absent field whose default is that sign,
 * `%(_absent|$)s`. yt-dlp expands before it fills fields, so expansion never
 * sees a `$`, a leading `~` or a `%NAME%`, and the fill then puts the sign
 * back. Lossless on POSIX and Windows.
 *
 * Not `%%`: ntpath pairs `%` signs left to right, and one field before a `%%`
 * (yt-dlp's own escape) shifts the pairing so that a literal `%NAME%`
 * expands. Here every run between two `%` signs starts with `(` or `)`, which
 * no set variable's name does, and each sign adds two `%`, so the pairing of
 * what follows stays as it was.
 */
export function templateLiteral(text: string): string {
	return text.replace(/[%$~]/g, sign => `%(_absent|${sign})s`)
}

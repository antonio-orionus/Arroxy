// yt-dlp runs os.path.expandvars(os.path.expanduser(...)) over every `--paths`
// value (YoutubeDL.get_output_path) and over the `-o` template, then writes to
// the result. Titles and template folders are neutralised before they get
// there (shared/pathExpansion.ts); the folder the user picked or typed cannot
// be, because `--paths` has no escape at all. So the download folder is
// checked instead: this is a port of the two Python expanders yt-dlp's child
// would run, against the environment it would get.
//
// `-o` protects `%%` and `$$` from expansion and `--paths` does not, so a
// folder that survives the `--paths` rules survives `-o` too.

type Env = Readonly<Record<string, string | undefined>>

// posixpath.expandvars: `$name` or `${name}`, ASCII word characters, replaced
// only when set. There is no escape.
const POSIX_REFERENCE = /\$([A-Za-z0-9_]+|\{[^}]*\})/g

function posixExpandVars(path: string, env: Env): string {
	return path.replace(POSIX_REFERENCE, (whole, name: string) => {
		const key = name.startsWith('{') && name.endsWith('}') ? name.slice(1, -1) : name
		// Own names only: `$toString` must not find Object.prototype's.
		return (Object.hasOwn(env, key) ? env[key] : undefined) ?? whole
	})
}

// ntpath's variable names, and Windows' case-insensitive environment.
const NT_VAR_CHARS = /[A-Za-z0-9_-]/

function ntLookup(env: Env, name: string): string | undefined {
	const upper = name.toUpperCase()
	for (const [key, value] of Object.entries(env)) if (key.toUpperCase() === upper) return value
	return undefined
}

// ntpath.expandvars, step for step: text in single quotes is left alone, `%%`
// and `$$` collapse to one sign, `%name%`, `${name}` and `$name` are replaced
// when set and kept as written when not.
function ntExpandVars(path: string, env: Env): string {
	let out = ''
	let i = 0
	while (i < path.length) {
		const c = path.charAt(i)
		if (c === "'") {
			const close = path.indexOf("'", i + 1)
			const end = close === -1 ? path.length : close + 1
			out += path.slice(i, end)
			i = end
		} else if (c === '%') {
			if (path.charAt(i + 1) === '%') {
				out += '%'
				i += 2
				continue
			}
			const close = path.indexOf('%', i + 1)
			if (close === -1) {
				out += path.slice(i)
				break
			}
			const name = path.slice(i + 1, close)
			out += ntLookup(env, name) ?? `%${name}%`
			i = close + 1
		} else if (c === '$') {
			const next = path.charAt(i + 1)
			if (next === '$') {
				out += '$'
				i += 2
			} else if (next === '{') {
				const close = path.indexOf('}', i + 2)
				if (close === -1) {
					out += path.slice(i)
					break
				}
				const name = path.slice(i + 2, close)
				out += ntLookup(env, name) ?? `\${${name}}`
				i = close + 1
			} else {
				let end = i + 1
				while (end < path.length && NT_VAR_CHARS.test(path.charAt(end))) end++
				const name = path.slice(i + 1, end)
				out += ntLookup(env, name) ?? `$${name}`
				i = end
			}
		} else {
			out += c
			i++
		}
	}
	return out
}

/** The folder as yt-dlp's expandvars would rewrite it, `~` aside. */
export function ytDlpExpandVars(path: string, platform: NodeJS.Platform, env: Env): string {
	return platform === 'win32' ? ntExpandVars(path, env) : posixExpandVars(path, env)
}

/**
 * True when yt-dlp, given `folder` in `--paths`, would write somewhere else.
 * A leading `~` counts whoever's home it names: an absolute folder never has
 * one, and a relative one cannot be predicted.
 */
export function ytDlpExpandsPath(folder: string, platform: NodeJS.Platform, env: Env): boolean {
	return folder.startsWith('~') || ytDlpExpandVars(folder, platform, env) !== folder
}

// What yt-dlp does to an `-o` template before it fills a field, ported from
// YoutubeDL._outtmpl_expandpath and CPython's posixpath/ntpath expandvars, and
// the field fill for the two forms a literal can take (`%%` and an absent field
// with a default). Real yt-dlp is the oracle (scripts/check-filename-parity.ts);
// this model only lets the unit tests try many strings on both OSes fast.

type Env = Readonly<Record<string, string>>

function posixExpandVars(text: string, env: Env): string {
	return text.replace(/\$(\w+|\{[^}]*\})/g, (whole, name: string) => {
		const key = name.startsWith('{') ? name.slice(1, -1) : name
		return Object.hasOwn(env, key) ? (env[key] ?? whole) : whole
	})
}

function ntLookup(env: Env, name: string): string | undefined {
	const upper = name.toUpperCase()
	return Object.entries(env).find(([key]) => key.toUpperCase() === upper)?.[1]
}

// ntpath.expandvars: `'…'` untouched, `%%` and `$$` collapse, `%name%`,
// `${name}`, `$name` replaced when set.
function ntExpandVars(text: string, env: Env): string {
	return text.replace(/'[^']*'?|%(%|[^%]*%?)|\$(\$|[-\w]+|\{[^}]*\}?)/g, (whole: string, percent: string | undefined, dollar: string | undefined) => {
		if (whole.startsWith("'")) return whole
		if (percent === '%' || dollar === '$') return whole.charAt(0)
		if (percent !== undefined) return percent.endsWith('%') ? (ntLookup(env, percent.slice(0, -1)) ?? whole) : whole
		if (dollar !== undefined) {
			const name = dollar.startsWith('{') ? (dollar.endsWith('}') ? dollar.slice(1, -1) : null) : dollar
			return name === null ? whole : (ntLookup(env, name) ?? whole)
		}
		return whole
	})
}

// Either expander turns a leading `~` or `~name` into some home folder; which
// one does not matter here, only that the text changed.
function expandUser(text: string, home: string): string {
	return text.startsWith('~') ? `${home}${text.slice(1)}` : text
}

const SEP = 'SEPARATORsep0123456789abcdefghij'

export function ytDlpExpandTemplate(template: string, platform: 'posix' | 'nt', env: Env): string {
	const protectedText = template.replaceAll('%%', `%${SEP}%`).replaceAll('$$', `$${SEP}$`)
	const home = platform === 'nt' ? 'C:\\Users\\model' : '/home/model'
	const user = expandUser(protectedText, home)
	return (platform === 'nt' ? ntExpandVars(user, env) : posixExpandVars(user, env)).replaceAll(SEP, '')
}

// Field substitution for templates whose only fields are `%(_absent|c)s`
// (absent, so the default) and `%%`. Anything else is left for the caller.
export function fillLiteralFields(template: string): string {
	return template.replace(/%%|%\(_absent\|([^)]*)\)s/g, (whole, fallback: string | undefined) => (whole === '%%' ? '%' : (fallback ?? '')))
}

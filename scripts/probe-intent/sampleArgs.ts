// The sampler's command line: video URLs, and `--keep <dir>` anywhere.
export function parseSampleArgs(args: readonly string[]): {urls: string[]; keepDir: string | null} {
	const urls: string[] = []
	let keepDir: string | null = null
	for (let index = 0; index < args.length; index++) {
		const arg = args[index]
		if (arg !== '--keep') {
			if (arg !== undefined) urls.push(arg)
			continue
		}
		keepDir = args[index + 1] ?? null
		if (keepDir === null) throw new Error('--keep needs a directory')
		index++
	}
	return {urls, keepDir}
}

// A sampled video's name in reports and kept files: its YouTube id for any
// link shape (`watch?v=`, `/shorts/`, `youtu.be/`), else the link made safe
// as a file name.
export function sampleId(url: string): string {
	const parsed = new URL(url)
	const fromPath = /^\/(?:shorts\/|embed\/|live\/)?([\w-]{11})$/.exec(parsed.pathname)?.[1]
	const id = parsed.searchParams.get('v') ?? (parsed.hostname.endsWith('youtu.be') || parsed.pathname.startsWith('/shorts/') ? fromPath : undefined)
	return id ?? `${parsed.hostname}${parsed.pathname}`.replace(/[^\w-]+/g, '-')
}

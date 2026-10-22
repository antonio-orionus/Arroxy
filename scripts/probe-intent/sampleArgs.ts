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
// link shape (`watch?v=`, `/shorts/`, `/live/`, `/embed/`, `youtu.be/`),
// else the link made safe as a file name.
export function sampleId(url: string): string {
	const safe = (text: string): string => text.replace(/[^\w-]+/g, '-')
	if (!URL.canParse(url)) return safe(url)
	const parsed = new URL(url)
	const youtube = /(?:^|\.)(?:youtube\.com|youtu\.be)$/.test(parsed.hostname)
	const fromPath = /^\/(?:shorts\/|embed\/|live\/)?([\w-]{11})$/.exec(parsed.pathname)?.[1]
	return parsed.searchParams.get('v') ?? (youtube ? fromPath : undefined) ?? safe(`${parsed.hostname}${parsed.pathname}`)
}

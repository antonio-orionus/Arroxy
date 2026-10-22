import {youtubeLinkVideoId} from '../../src/shared/urlIntent.js'

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

// A sampled video's name in reports and kept files: its YouTube id, read as
// the app reads a link, else the link made safe as a file name.
export function sampleId(url: string): string {
	const id = youtubeLinkVideoId(url)
	// An empty `v=` names no video.
	if (id !== null && id !== '') return id
	return url.replace(/^\w+:\/\//, '').replace(/[^\w-]+/g, '-')
}

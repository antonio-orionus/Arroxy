// The YouTube entries of every stable yt-dlp release after `--since`, as
// Markdown, for the YouTube URL contract scan's PR body. Reads the GitHub
// releases API response (an array of releases) on stdin. yt-dlp's notes list an
// extractor as `- **youtube**` (or `**youtube:tab**`…) with its changes indented
// under it; both are kept.

import {readFileSync} from 'node:fs'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {z} from 'zod'

const releasesSchema = z.array(z.object({tag_name: z.string(), prerelease: z.boolean(), body: z.string().nullable()}))

function indent(line: string): number {
	return line.length - line.trimStart().length
}

export function youtubeLines(body: string): string[] {
	const out: string[] = []
	let header: number | null = null
	for (const line of body.split(/\r?\n/)) {
		if (header !== null && line.trim() !== '' && indent(line) > header) {
			out.push(line)
			continue
		}
		header = null
		if (/^\s*- \*\*youtube/i.test(line)) {
			header = indent(line)
			out.push(line)
		} else if (/youtube/i.test(line) && /^\s*-/.test(line)) {
			out.push(line)
		}
	}
	return out
}

// Run as a script (not when the test imports youtubeLines).
if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
	const {values} = parseArgs({options: {since: {type: 'string'}}})
	const since = values.since ?? ''
	const releases = releasesSchema.parse(JSON.parse(readFileSync(0, 'utf8')))
	// Release tags are dates (YYYY.MM.DD), so they sort as strings.
	const newer = releases.filter(release => !release.prerelease && release.tag_name > since).sort((a, b) => a.tag_name.localeCompare(b.tag_name))
	for (const release of newer) {
		const lines = youtubeLines(release.body ?? '')
		console.log(`### ${release.tag_name}\n\n${lines.length > 0 ? lines.join('\n') : '(no YouTube entries)'}\n`)
	}
}

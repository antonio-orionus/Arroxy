import {mkdir, rename, writeFile} from 'node:fs/promises'
import {dirname, join, relative} from 'node:path'
import type {CallerSubtitlesWorkflowInput} from 'yt-dlp-bridge'

// What yt-dlp (checked on 2026.08.19) does for a subtitle fetch with a report:
// it writes one `video.<key>.srt` per planned track (in the `subtitles`
// subfolder for that mode), in the temp folder when the run has one, then
// moves each to the same path under the folder. The report names where it
// wrote a track, so the temp folder, and carries no track names after
// `--convert-subs`. A track converted from TTML is never moved: `leftInTemp`.
export async function writeFetchedSubtitles(req: CallerSubtitlesWorkflowInput, opts: {leftInTemp?: readonly string[]} = {}): Promise<void> {
	const {output} = req
	if (!('tracks' in req.subtitles) || !output.report?.subtitles) return
	const subfolder = output.subtitleMode === 'subfolder' ? 'subtitles/' : ''
	const temp = output.tempDirectory === undefined ? '' : `./${relative(output.directory, output.tempDirectory)}/`
	const report: Record<string, {ext: string; filepath: string}> = {}
	for (const track of req.subtitles.tracks) {
		const name = `${subfolder}video.${track.key}.srt`
		const written = join(output.directory, temp, name)
		await mkdir(dirname(written), {recursive: true})
		await writeFile(written, `${track.key} track`)
		if (temp !== '' && !opts.leftInTemp?.includes(track.key)) {
			const moved = join(output.directory, name)
			await mkdir(dirname(moved), {recursive: true})
			await rename(written, moved)
		}
		report[track.key] = {ext: 'srt', filepath: `${temp}${name}`}
	}
	await writeFile(output.report.subtitles, `${JSON.stringify(report)}\n`)
}

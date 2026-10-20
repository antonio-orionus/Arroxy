import {readFile, rm} from 'node:fs/promises'
import {isAbsolute} from 'node:path'

// Where a finished download ended up, asked of yt-dlp rather than scraped from
// its log. `after_move` prints run once every postprocessor (remux, convert,
// audio extraction) and the move out of the temp folder have finished, so
// `filepath` is the file on disk. The log names it only through lines whose
// wording varies by postprocessor, in the console's encoding. The file is
// written in UTF-8 whatever the console's encoding is.
export const FINAL_PATH_FILE_NAME = '_arroxy.final-path.txt'

// FILE is an output template, so a literal `%` is written `%%`. yt-dlp also
// expands `$VAR` in it, as it does in `--paths`; FILE sits under the job's
// folder, and PreflightPhase refuses a folder that would expand.
export function finalPathPrintArgs(file: string): string[] {
	return ['--print-to-file', 'after_move:filepath', file.replaceAll('%', '%%')]
}

// yt-dlp appends, so a file left by an earlier run would answer for this one.
// False when it is still there: that run must not ask for the path.
export async function clearFinalPathFile(file: string): Promise<boolean> {
	return rm(file, {force: true}).then(
		() => true,
		() => false
	)
}

// The last absolute path printed, or null when the run printed none (it failed
// before the move, or the file cannot be read).
export async function readFinalPathFile(file: string): Promise<string | null> {
	const text = await readFile(file, 'utf8').catch(() => null)
	if (text === null) return null
	return parseFinalPath(text)
}

export function parseFinalPath(text: string): string | null {
	const last = text.split(/\r?\n/).findLast(line => line.length > 0)
	return last !== undefined && isAbsolute(last) ? last : null
}

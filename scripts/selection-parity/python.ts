// The Python that runs the pinned yt-dlp for the selection parity check
// (`bun run check`). yt-dlp needs Python 3.10 or newer. macOS ships only a
// `python3` stub until the Command Line Tools are installed, and Windows names
// it `python` or the `py` launcher, so each is tried and its version checked.

import {execFile} from 'node:child_process'
import {promisify} from 'node:util'

const run = promisify(execFile)

export interface PythonCommand {
	command: string
	args: readonly string[]
}

const CANDIDATES: readonly PythonCommand[] =
	process.platform === 'win32'
		? [
				{command: 'py', args: ['-3']},
				{command: 'python', args: []},
				{command: 'python3', args: []}
			]
		: [
				{command: 'python3', args: []},
				{command: 'python', args: []}
			]

const VERSION_CHECK = 'import sys; print(sys.version_info >= (3, 10))'

export const PYTHON_REQUIREMENT = 'Python 3.10 or newer (python3, python or py -3), to run yt-dlp for the selection parity check'

export async function findPython(): Promise<PythonCommand | null> {
	for (const candidate of CANDIDATES) {
		try {
			const {stdout} = await run(candidate.command, [...candidate.args, '-c', VERSION_CHECK])
			if (stdout.trim() === 'True') return candidate
		} catch {
			// Not installed, a stub, or too old: try the next name.
		}
	}
	return null
}

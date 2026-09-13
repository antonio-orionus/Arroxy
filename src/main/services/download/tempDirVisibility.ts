// Keeps `.arroxy-temp` out of the user's way in Windows Explorer.
//
// The dot prefix is the whole hiding mechanism on macOS and Linux, and it does
// nothing on Windows: the folder sits in plain sight next to the finished
// videos for as long as a download runs. Windows hides a folder by attribute
// instead, and `attrib +h` is the one way to set it without a native binding.
//
// Called only at the moment the root is created — see `setupTempDir`. The
// attribute is a property of the directory, not of the session, and the root is
// removed again when a job finalizes, so anything remembered across a
// create/delete cycle would leave every later download's folder visible.
//
// Purely cosmetic, so every failure here is swallowed. A machine with a locked
// down `attrib`, a redirected folder, or a permission policy that refuses the
// change still downloads exactly as before.

import {execFile} from 'node:child_process'
import {promisify} from 'node:util'

const execFileAsync = promisify(execFile)

export interface TempDirHiderDeps {
	platform: string
	run: (file: string, args: readonly string[]) => Promise<unknown>
}

export function createTempDirHider(deps: TempDirHiderDeps): (tempDirRoot: string) => Promise<void> {
	const isWindows = deps.platform === 'win32'
	return async (tempDirRoot: string): Promise<void> => {
		if (!isWindows) return
		try {
			await deps.run('attrib', ['+h', tempDirRoot])
		} catch {
			// Cosmetic; the download does not care.
		}
	}
}

// Node reports a recursive `mkdir`'s first created directory in Windows'
// extended-length namespace (it is `path.toNamespacedPath` of what was passed
// in), while the path handed to it is plain — so the two never compare equal on
// Windows unless the namespace is undone. Getting this wrong is silent: the
// comparison simply never matches.
//
// The namespace has two spellings. A drive path gains a bare `\\?\` prefix; a
// UNC share `\\server\share` becomes `\\?\UNC\server\share`, so stripping only
// the prefix leaves `UNC\server\share`, which never equals the share path. On a
// network output folder that would make every job look like it created the root
// and spawn `attrib` for each one.
const EXTENDED_UNC_PREFIX = '\\\\?\\UNC\\'
const EXTENDED_PREFIX = '\\\\?\\'

export function normalizeCreatedPath(created: string): string {
	if (created.startsWith(EXTENDED_UNC_PREFIX)) return `\\\\${created.slice(EXTENDED_UNC_PREFIX.length)}`
	if (created.startsWith(EXTENDED_PREFIX)) return created.slice(EXTENDED_PREFIX.length)
	return created
}

export const hideTempDirRoot = createTempDirHider({
	platform: process.platform,
	// `windowsHide` keeps the console window from flashing over the app.
	run: (file, args) => execFileAsync(file, [...args], {windowsHide: true})
})

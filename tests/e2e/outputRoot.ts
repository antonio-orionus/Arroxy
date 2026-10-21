import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Where a fixture run's download folder goes. ARROXY_E2E_OUTPUT_ROOT moves only
// that folder, so output paths can be pushed toward Windows' 260-character or
// Linux's 255-byte name limits. A deep TEMP cannot stand in for it: yt-dlp is a
// PyInstaller build that unpacks itself into TEMP, so a deep one breaks yt-dlp
// before Arroxy's own path handling is reached. userData and TEMP stay put.
export function makeFixtureOutputDir(prefix: string, env: NodeJS.ProcessEnv = process.env): string {
	const configured = env.ARROXY_E2E_OUTPUT_ROOT
	const root = configured ? path.resolve(configured) : os.tmpdir()
	fs.mkdirSync(root, {recursive: true})
	return fs.mkdtempSync(path.join(root, prefix))
}

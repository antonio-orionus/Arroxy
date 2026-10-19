// The GitHub Actions matrix for the FFmpeg remux matrix workflow: one job per
// pinned FFmpeg package, on a hosted runner of that platform and architecture.
// A pin with no runner here fails the workflow instead of going untested.
//
//   bun scripts/ffmpeg-matrix/ci-targets.ts   # appends matrix=<json> to $GITHUB_OUTPUT
import fs from 'node:fs'
import {FFMPEG_PACKAGE_PINS} from '../../src/main/services/binary/FfmpegPackagePins.js'
import type {FfmpegPackageEntry} from '../../src/shared/types.js'
import {isCliEntrypoint} from '../build/btbnResolver.js'

const RUNNERS: Readonly<Record<string, string>> = {
	'win32-x64': 'windows-latest',
	'darwin-x64': 'macos-15-intel',
	'darwin-arm64': 'macos-latest',
	'linux-x64': 'ubuntu-latest',
	'linux-arm64': 'ubuntu-24.04-arm'
}

export function ciTargets(pins: readonly Pick<FfmpegPackageEntry, 'platform' | 'arch' | 'version'>[]): {target: string; runner: string; version: string}[] {
	return pins.map(pin => {
		const target = `${pin.platform}-${pin.arch}`
		const runner = RUNNERS[target]
		if (!runner) throw new Error(`no GitHub-hosted runner configured for the ${target} FFmpeg pin; add one to scripts/ffmpeg-matrix/ci-targets.ts`)
		return {target, runner, version: pin.version}
	})
}

if (isCliEntrypoint(import.meta)) {
	const line = `matrix=${JSON.stringify({include: ciTargets(FFMPEG_PACKAGE_PINS)})}\n`
	if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, line)
	process.stdout.write(line)
}

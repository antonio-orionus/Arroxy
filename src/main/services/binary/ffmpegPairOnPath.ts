import path from 'node:path'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'

export interface FfmpegPairPaths {
	ffmpegPath: string
	ffprobePath: string
}

// After a package manager installs FFmpeg, both tools must be found, or the
// pair Arroxy is pointed at would not match. `extraDirs` are searched after
// PATH, for installs that announce themselves somewhere the running process
// cannot see yet.
export async function ffmpegPairOnPath(installer: string, extraDirs: readonly string[] = []): Promise<FfmpegPairPaths> {
	const ext = process.platform === 'win32' ? '.exe' : ''
	const find = async (name: string): Promise<string | null> => firstExecutable([...(await whereOnPath(name)), ...extraDirs.map(dir => path.join(dir, name))])
	const ffmpegPath = await find(`ffmpeg${ext}`)
	const ffprobePath = await find(`ffprobe${ext}`)
	if (ffmpegPath && ffprobePath) return {ffmpegPath, ffprobePath}
	throw new Error(`${installer} finished, but ffmpeg and ffprobe were not both found.`)
}

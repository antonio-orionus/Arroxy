import path from 'node:path'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'

export interface FfmpegPairPaths {
	ffmpegPath: string
	ffprobePath: string
}

// After a package manager installs FFmpeg, both tools must come from one
// folder, or Arroxy would be pointed at a mismatched pair: an older ffmpeg
// earlier on PATH beside the ffprobe just installed. `extraDirs` are searched
// after PATH, for installs that announce themselves somewhere the running
// process cannot see yet.
export async function ffmpegPairOnPath(installer: string, extraDirs: readonly string[] = []): Promise<FfmpegPairPaths> {
	const ext = process.platform === 'win32' ? '.exe' : ''
	const folders = [...new Set([...(await whereOnPath(`ffmpeg${ext}`)).map(found => path.dirname(found)), ...extraDirs])]
	for (const folder of folders) {
		const ffmpegPath = path.join(folder, `ffmpeg${ext}`)
		const ffprobePath = path.join(folder, `ffprobe${ext}`)
		// react-doctor-disable-next-line react-doctor/async-await-in-loop -- folders are taken in PATH order
		const [ffmpeg, ffprobe] = await Promise.all([firstExecutable([ffmpegPath]), firstExecutable([ffprobePath])])
		if (ffmpeg && ffprobe) return {ffmpegPath, ffprobePath}
	}
	throw new Error(`${installer} finished, but ffmpeg and ffprobe were not both found.`)
}

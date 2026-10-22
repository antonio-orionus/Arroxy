import type {DependencyId, WarmupProgressEvent} from '@shared/types.js'
import {buildSetupScript} from './scenarios/setupScenarios.js'

type Emit = (event: WarmupProgressEvent) => void

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// Setup scenarios play their scripted progress. Returns false when the
// scenario has no script, so the caller runs its ordinary warmup.
export async function playSetupScript(scenario: {id: string}, emit: Emit): Promise<boolean> {
	const script = buildSetupScript(scenario)
	if (!script) return false
	for (const step of script) {
		await delay(step.delayMs)
		emit(step.event)
	}
	return true
}

// A first launch, as the real warmup runs it: yt-dlp and the FFmpeg package
// download side by side, and the package (ffmpeg, ffprobe and their libraries
// in one archive) reports on the ffmpeg row only. ffprobe has no download of
// its own.
export async function simulateFirstLaunchDownloads(emit: Emit): Promise<void> {
	const download = async (name: DependencyId, size: number, steps: number): Promise<void> => {
		for (let i = 1; i <= steps; i++) {
			await delay(120)
			emit({binary: name, phase: 'downloading', bytesDownloaded: Math.round((size / steps) * i), totalBytes: size})
		}
	}
	emit({binary: 'ffprobe', phase: 'starting'})
	await Promise.all([
		download('yt-dlp', 18 * 1024 * 1024, 8).then(() => emit({binary: 'yt-dlp', phase: 'done'})),
		download('ffmpeg', 42 * 1024 * 1024, 20).then(async () => {
			emit({binary: 'ffmpeg', phase: 'extracting'})
			await delay(600)
			emit({binary: 'ffmpeg', phase: 'done'})
			emit({binary: 'ffprobe', phase: 'done'})
		})
	])
}

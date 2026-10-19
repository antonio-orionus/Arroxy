import type {DependencyDiagnostic, DependencyId, WarmUpOutput, WarmupProgressEvent} from '@shared/types.js'

interface ScenarioLike {
	id: string
}

export function buildWarmUp(scenario: ScenarioLike): WarmUpOutput {
	const dependencies = allRunnableDependencies()
	switch (scenario.id) {
		case 'diagnostics-ytdlp-missing':
			dependencies['yt-dlp'] = failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed')
			return {completed: false, dependencies, blockingFailures: ['yt-dlp'], cancelled: false}
		case 'diagnostics-ffmpeg-broken':
			dependencies.ffmpeg = failedDependency('ffmpeg', 'bad_exit_code', 'ffmpeg exited with code 1')
			return {completed: false, dependencies, blockingFailures: ['ffmpeg'], cancelled: false}
		case 'diagnostics-ffprobe-broken':
			dependencies.ffprobe = failedDependency('ffprobe', 'bad_exit_code', 'ffprobe exited with code 1')
			return {completed: false, dependencies, blockingFailures: ['ffprobe'], cancelled: false}
		case 'diagnostics-all-missing': {
			const allFailed = {'yt-dlp': failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed'), ffmpeg: failedDependency('ffmpeg', 'download_failed', 'ffmpeg download failed'), ffprobe: failedDependency('ffprobe', 'download_failed', 'ffprobe download failed')}
			return {completed: false, dependencies: allFailed, blockingFailures: ['yt-dlp', 'ffmpeg', 'ffprobe'], cancelled: false}
		}
		case 'diagnostics-warmup-running':
		case 'setup-first-run':
		case 'setup-media-update':
		case 'setup-unpacking':
			return {completed: false, dependencies, blockingFailures: [], cancelled: false}
		case 'repair-offline': {
			const offline = {'yt-dlp': failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed'), ffmpeg: failedDependency('ffmpeg', 'download_failed', 'ffmpeg download failed'), ffprobe: failedDependency('ffprobe', 'download_failed', 'ffprobe download failed')}
			return {completed: false, dependencies: offline, blockingFailures: ['yt-dlp', 'ffmpeg', 'ffprobe'], cancelled: false}
		}
		case 'repair-mixed': {
			const mixed = {'yt-dlp': failedDependency('yt-dlp', 'blocked_or_quarantined', 'SmartScreen blocked yt-dlp.exe'), ffmpeg: failedDependency('ffmpeg', 'download_failed', 'ffmpeg download failed'), ffprobe: failedDependency('ffprobe', 'download_failed', 'ffprobe download failed')}
			return {completed: false, dependencies: mixed, blockingFailures: ['yt-dlp', 'ffmpeg', 'ffprobe'], cancelled: false}
		}
		default:
			return {completed: true, dependencies, blockingFailures: [], cancelled: false}
	}
}

function allRunnableDependencies(): Record<DependencyId, DependencyDiagnostic> {
	return {
		'yt-dlp': {id: 'yt-dlp', state: 'runnable', source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'mock'}, resolvedPath: '/mock/yt-dlp', attempts: []},
		ffmpeg: {id: 'ffmpeg', state: 'runnable', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: '/mock/ffmpeg', attempts: []},
		ffprobe: {id: 'ffprobe', state: 'runnable', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: '/mock/ffprobe', attempts: []}
	}
}

function failedDependency(id: DependencyId, kind: NonNullable<DependencyDiagnostic['failure']>['kind'], message: string): DependencyDiagnostic {
	return {id, state: 'failed', source: {kind: 'managed', channel: id === 'yt-dlp' ? 'nightly' : 'default', provider: 'github', url: 'mock'}, resolvedPath: null, failure: {kind, message}, attempts: []}
}

export interface SetupScriptStep {
	delayMs: number
	event: WarmupProgressEvent
}

const MB = 1024 * 1024
const ENGINE_BYTES = 18 * MB
const MEDIA_BYTES = 42 * MB

function downloadSteps(binary: DependencyId, total: number, from: number, to: number, steps: number): SetupScriptStep[] {
	return Array.from({length: steps}, (_, index) => ({delayMs: 400, event: {binary, phase: 'downloading', bytesDownloaded: Math.round(from + ((to - from) * (index + 1)) / steps), totalBytes: total}}))
}

// Scripted warmup progress for the setup scenarios. The mock plays it, then
// leaves warmup running, so the splash holds the last state for review. The
// pace (~0.2 MB/s) is slow on purpose: it is what makes the time left show.
export function buildSetupScript(scenario: ScenarioLike): SetupScriptStep[] | null {
	switch (scenario.id) {
		case 'setup-first-run': {
			const engine = downloadSteps('yt-dlp', ENGINE_BYTES, 16 * MB, ENGINE_BYTES, 12)
			const media = downloadSteps('ffmpeg', MEDIA_BYTES, 9 * MB, 12 * MB, 20)
			const interleaved = media.flatMap((step, index) => (engine[index] ? [step, {...engine[index], delayMs: 0}] : [step]))
			return [{delayMs: 0, event: {binary: 'ffprobe', phase: 'starting'}}, ...interleaved.slice(0, 26), {delayMs: 0, event: {binary: 'yt-dlp', phase: 'probing', firstCheck: false}}, ...interleaved.slice(26)]
		}
		case 'setup-media-update':
			return [{delayMs: 0, event: {binary: 'ffprobe', phase: 'starting'}}, ...downloadSteps('ffmpeg', MEDIA_BYTES, 14 * MB, 17 * MB, 20)]
		case 'setup-unpacking':
			return [...downloadSteps('yt-dlp', ENGINE_BYTES, 17 * MB, ENGINE_BYTES, 2), ...downloadSteps('ffmpeg', MEDIA_BYTES, 41 * MB, MEDIA_BYTES, 2), {delayMs: 0, event: {binary: 'yt-dlp', phase: 'done'}}, {delayMs: 0, event: {binary: 'ffmpeg', phase: 'extracting'}}]
		default:
			return null
	}
}

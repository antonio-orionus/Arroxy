import {STATUS_KEY} from '@shared/schemas.js'
import {dropAudioStreams, logger} from '../audioStrip.js'
import {forgetOnExit, killJobProcess} from '../download/processControl.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {interruptedOutcome} from './phaseHelpers.js'

// Video without audio, after the download: a site with no video-only stream
// gave one with sound (`bestvideo*`), so its audio comes off here. A failed
// strip keeps the file as downloaded rather than lose the video, and the job
// finishes with a notice saying the sound is still there.
export const DropAudioPhase: Phase = {
	kind: 'drop-audio',
	async run(ctx: PhaseContext): Promise<PhaseOutcome> {
		const {active, ytDlp} = ctx
		const {job} = active
		const ffmpegPath = ytDlp.ffmpegPath
		if (!ffmpegPath || !active.mediaPath) {
			logger.warn('drop-audio skipped — no ffmpeg or no media file', {jobId: job.id, mediaPath: active.mediaPath})
			return {kind: 'continue'}
		}
		ctx.emitStatus('download', STATUS_KEY.convertingVideo)
		try {
			const result = await dropAudioStreams({
				ffmpegPath,
				videoPath: active.mediaPath,
				onSpawn: proc => {
					active.ffmpegProcess = proc
					forgetOnExit(proc, () => {
						if (active.ffmpegProcess === proc) active.ffmpegProcess = undefined
					})
					if (active.cancelRequested) killJobProcess(proc, 'SIGKILL')
					ctx.register(() => {
						killJobProcess(proc, 'SIGKILL')
					})
				},
				jobId: job.id
			})
			if (!result.ok) {
				logger.warn('drop-audio: kept the file with its audio', {jobId: job.id})
				active.audioKept = true
			}
		} finally {
			active.ffmpegProcess = undefined
		}
		return interruptedOutcome(active) ?? {kind: 'continue'}
	}
}

import {STATUS_KEY} from '@shared/schemas.js'
import {checkDiskSpace} from '@main/utils/diskSpace.js'
import {checkWritableDirectory} from '@main/utils/writableDirectory.js'
import type {LocalizedError} from '@shared/types.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'

function formatGB(bytes: number): string {
	return `${Math.round(bytes / 1e8) / 10} GB`
}

export function PreflightPhase(expectedBytes: number | undefined): Phase {
	return {
		kind: 'preflight',
		async run(ctx: PhaseContext): Promise<PhaseOutcome> {
			const {job} = ctx.active
			// Before the disk check: an unwritable folder would otherwise let
			// yt-dlp start, then die on its first write. The temp folder lives
			// under outputDir, so this covers it too.
			const writable = await checkWritableDirectory(job.outputDir)
			if (!writable.ok) {
				const error: LocalizedError = {kind: 'outputNotWritable', raw: `${job.outputDir}: ${writable.error}`}
				ctx.emitStatus('error', STATUS_KEY.outputNotWritable, {dir: job.outputDir}, error)
				return {kind: 'hard-failed', error}
			}
			const check = await checkDiskSpace(job.outputDir, expectedBytes)
			if (!check.ok) {
				const requiredFmt = check.requiredBytes !== undefined ? formatGB(check.requiredBytes) : '—'
				const freeFmt = check.freeBytes !== undefined ? formatGB(check.freeBytes) : '—'
				const raw = check.error !== undefined ? `Cannot read disk space at ${job.outputDir}: ${check.error}` : `Need ${requiredFmt} free, only ${freeFmt} available`
				const error: LocalizedError = {kind: 'outOfDiskSpace', raw}
				ctx.emitStatus('error', STATUS_KEY.diskSpaceInsufficient, {required: requiredFmt, free: freeFmt}, error)
				return {kind: 'hard-failed', error}
			}
			return {kind: 'continue'}
		}
	}
}

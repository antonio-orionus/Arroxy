import {STATUS_KEY} from '@shared/schemas.js'
import {checkDiskSpace} from '@main/utils/diskSpace.js'
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

import {STATUS_KEY} from '@shared/schemas.js'
import {checkDiskSpace} from '@main/utils/diskSpace.js'
import {checkWritableDirectory} from '@main/utils/writableDirectory.js'
import type {LocalizedError} from '@shared/types.js'
import {ytDlpExpandsPath, ytDlpExpandVars} from '../ytDlpPathExpansion.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'

// A full disk refuses the write probe too. Those codes fall through to the
// disk-space check so the user gets the free-space message, not a permissions one.
const DISK_FULL_CODES: ReadonlySet<string> = new Set(['ENOSPC', 'EDQUOT'])

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
			if (!writable.ok && !(writable.code !== undefined && DISK_FULL_CODES.has(writable.code))) {
				const error: LocalizedError = {kind: 'outputNotWritable', raw: `${job.outputDir}: ${writable.error}`}
				ctx.emitStatus('error', STATUS_KEY.outputNotWritable, {dir: job.outputDir}, error)
				return {kind: 'hard-failed', error}
			}
			// Before the disk check, which would measure the wrong place: yt-dlp
			// would create and fill the expanded folder. The temp folder and the
			// final-path file live under outputDir, so this covers them too. Not
			// before the write probe: a failure emitted before the phase's first
			// await reaches the queue before it knows the job, and is dropped.
			const env = ctx.ytDlp.childEnv()
			if (ytDlpExpandsPath(job.outputDir, process.platform, env)) {
				const error: LocalizedError = {kind: 'outputPathExpands', raw: `${job.outputDir}: yt-dlp would write to ${ytDlpExpandVars(job.outputDir, process.platform, env)}`}
				ctx.emitStatus('error', STATUS_KEY.outputPathExpands, {dir: job.outputDir}, error)
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

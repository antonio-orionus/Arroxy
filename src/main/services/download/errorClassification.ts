// Pure classification of a non-success YtDlpResult into a LocalizedError +
// the StatusKey/params the caller should emit. Extracted from
// DownloadService.emitYtdlpFailure so phases can build the error payload
// directly and emit via PhaseContext.emitStatus, instead of round-tripping
// through DownloadService.
//
// The disk-space upgrade lives here: yt-dlp masks ffmpeg's stderr, so an
// ENOSPC during merge surfaces only as "Postprocessing: Conversion failed!".
// On a postprocess failure we probe the output dir and rewrite the kind to
// outOfDiskSpace iff the probe confirms ENOSPC.

import log from 'electron-log/main.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {isPostprocessFailure} from 'ytdlp-errors'
import {checkDiskSpace, type DiskSpaceResult} from '@main/utils/diskSpace.js'
import type {LocalizedError, StatusKey} from '@shared/types.js'
import type {YtDlpResult} from '../YtDlp.js'

const logger = log.scope('downloads')

export interface YtDlpFailureClassification {
	payload: LocalizedError
	statusKey: StatusKey
	params?: Record<string, string | number>
}

export type DiskProbe = (dir: string) => Promise<DiskSpaceResult>

export async function classifyYtDlpFailure(result: Exclude<YtDlpResult, {kind: 'success'}>, outputDir: string, jobId: string, diskProbe: DiskProbe = dir => checkDiskSpace(dir, undefined)): Promise<YtDlpFailureClassification> {
	if (result.kind === 'spawn-error') {
		const payload: LocalizedError = {kind: 'unknown', raw: result.error.message}
		return {payload, statusKey: STATUS_KEY.ytdlpProcessError, params: {error: result.error.message}}
	}

	let kind = result.errorKind
	if (kind === 'postprocessFailure' && isPostprocessFailure(result.rawError)) {
		const probe = await diskProbe(outputDir)
		if (!probe.ok && probe.error === undefined && probe.freeBytes !== undefined) {
			kind = 'outOfDiskSpace'
			logger.info('Reclassified postprocess failure as outOfDiskSpace', {jobId, outputDir, freeBytes: probe.freeBytes})
		} else if (probe.error !== undefined) {
			logger.info('Postprocess failure: disk probe inconclusive', {jobId, outputDir, probeError: probe.error})
		}
	}

	const payload: LocalizedError = {kind, raw: result.rawError ?? ''}
	if (kind === 'unknown' && result.rawError) {
		return {payload, statusKey: STATUS_KEY.ytdlpProcessError, params: {error: result.rawError}}
	}
	return {payload, statusKey: STATUS_KEY.ytdlpExitCode, params: {code: result.exitCode}}
}

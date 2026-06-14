import {mkdir, rm, stat} from 'node:fs/promises'
import {join} from 'node:path'
import type {AudioConvert as BridgeAudioConvert} from 'yt-dlp-bridge'
import {isAudioConvertTargetLossy} from '@shared/audioTargets.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {siteForExtractor} from '@shared/sites/index.js'
import type {AudioConvert} from '@shared/types.js'
import {YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS} from '@shared/youtubePlayerClients.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {QueueResumeLifecycle} from '../download/QueueResumeLifecycle.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal} from './phaseHelpers.js'

async function setupTempDir(outputDir: string, jobId: string, preserve: boolean, overridePath?: string): Promise<string | undefined> {
	const tempDir = overridePath ?? join(outputDir, '.arroxy-temp', jobId.slice(0, 8))
	try {
		if (!preserve) await rm(tempDir, {recursive: true, force: true})
		await mkdir(tempDir, {recursive: true})
		return tempDir
	} catch {
		return undefined
	}
}

async function detectCachedInfoJson(tempDir: string | undefined): Promise<string | undefined> {
	if (!tempDir) return undefined
	const path = join(tempDir, '_arroxy.info.json')
	try {
		const s = await stat(path)
		return s.isFile() ? path : undefined
	} catch {
		return undefined
	}
}

function isSkippableSponsorBlockApiFailure(result: Exclude<YtDlpResult, {kind: 'success'}>, req: YtDlpRequest): boolean {
	if (result.kind !== 'exit-error') return false
	if (req.kind !== 'media' || req.sponsorBlock === undefined || req.sponsorBlock.categories.length === 0) return false
	return /Unable to communicate with SponsorBlock API/i.test([result.rawError, result.stderr].filter(Boolean).join('\n'))
}

function bridgeAudioConvert(input: AudioConvert): BridgeAudioConvert {
	return {...input, lossy: isAudioConvertTargetLossy(input.target)}
}

function hasMediaTransferStarted(active: PhaseContext['active']): boolean {
	return active.mediaDownloadStarted === true || (active.mediaComponentPaths?.length ?? 0) > 0 || active.mediaPath !== undefined
}

export function VideoPhase(embed: boolean): Phase {
	return {
		kind: embed ? 'video+embed' : 'video',
		async run(ctx: PhaseContext): Promise<PhaseOutcome> {
			const {active, ytDlp} = ctx
			const {input, job} = active
			const preparedJob = input.job

			if (preparedJob.kind === 'subtitle-only') {
				throw new Error('invariant: VideoPhase reached with subtitle-only job')
			}

			const isResume = active.tempDir != null
			const tempDir = await setupTempDir(job.outputDir, job.id, isResume, active.tempDir)
			if (tempDir) {
				active.tempDir = tempDir
				// Disposables drain on finalize for completed / soft-failed /
				// hard-failed / cancelled outcomes; on `paused`, JobLifecycle skips
				// the drain so resume can pick up the .part files.
				QueueResumeLifecycle.registerVideoTempDataCleanup(active, job.outputDir, tempDir, disposable => ctx.register(disposable))
			}
			// Resume hardening: if a prior spawn wrote _arroxy.info.json into the
			// preserved tempDir, feed it to yt-dlp so extraction is skipped on
			// resume (signed-URL / format-ID / session-cookie drift cause spurious
			// "Requested format is not available" failures otherwise).
			const resumeInfoJsonPath = await detectCachedInfoJson(isResume ? tempDir : undefined)
			const loadInfoJsonPath = resumeInfoJsonPath ?? input.probeInfoJsonPath

			// SponsorBlock applicability is owned by the Site adapter — currently
			// YouTube-only. Passing the flag for non-YouTube extractors is harmless
			// but wasted; the wizard hides the SponsorBlock step on non-supporting
			// sites and this is the defense-in-depth gate.
			const site = siteForExtractor(preparedJob.extractor)
			const sbConfig = site.supportsSponsorBlock && preparedJob.sponsorBlock.mode !== 'off' ? {mode: preparedJob.sponsorBlock.mode, categories: preparedJob.sponsorBlock.categories} : undefined

			const formatId = preparedJob.kind === 'single-format' ? preparedJob.formatId : undefined
			const formatSelector = preparedJob.kind === 'ranged-format' ? preparedJob.formatSelector : undefined
			const formatSort = preparedJob.kind === 'ranged-format' ? preparedJob.formatSort : undefined
			const mergeOutputFormat = preparedJob.kind === 'ranged-format' ? preparedJob.mergeOutputFormat : undefined
			const audioConvert = preparedJob.kind === 'audio-convert' ? preparedJob.audioConvert : preparedJob.kind === 'ranged-format' ? preparedJob.audioConvert : undefined
			const bridgeConvert = audioConvert ? bridgeAudioConvert(audioConvert) : undefined
			const outputTemplate = preparedJob.outputTemplate
			const {embed: embedOpts} = preparedJob
			const extractor = site.id === 'youtube' ? {youtube: {playerClient: [...YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS]}} : undefined

			const buildRequest = (infoJsonPath: string | undefined): YtDlpRequest => {
				return {
					kind: 'media',
					url: input.url,
					output: {directory: job.outputDir, ...(tempDir ? {tempDirectory: tempDir} : {}), ...(outputTemplate ? {template: outputTemplate} : {})},
					selection: {formatId, formatSelector, formatSort, mergeOutputFormat},
					...(bridgeConvert ? {audio: {convert: bridgeConvert}} : {}),
					...(embed && (preparedJob.subtitles?.languages.length ?? 0) > 0 && preparedJob.subtitles ? {subtitles: {embed: true, languages: preparedJob.subtitles.languages, writeAuto: preparedJob.subtitles.writeAuto}} : {}),
					...(sbConfig ? {sponsorBlock: sbConfig} : {}),
					...(extractor ? {extractor} : {}),
					embed: {chapters: embedOpts.chapters, metadata: embedOpts.metadata, thumbnail: embedOpts.thumbnail, description: embedOpts.description, thumbnailSidecar: embedOpts.thumbnailSidecar},
					...(infoJsonPath ? {resume: {loadInfoJsonPath: infoJsonPath}} : {})
				}
			}

			// Don't preemptively emit downloadingMedia on spawn — yt-dlp spends
			// a few seconds on extractor work and thumbnail conversion first.
			// The first `[download] Destination:` line in consumeProgress emits
			// the accurate status when the actual data download begins.
			const runMedia = async (infoJsonPath: string | undefined): Promise<{req: YtDlpRequest; result: YtDlpResult}> => {
				const req = buildRequest(infoJsonPath)
				const result = await ytDlp.run(
					req,
					buildYtDlpSignal(ctx, active, {
						onMinting: attempt => {
							ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
						}
					})
				)
				return {req, result}
			}

			let {req, result} = await runMedia(loadInfoJsonPath)

			if (active.pauseRequested) return {kind: 'paused'}
			if (active.cancelRequested) return {kind: 'cancelled'}

			if (loadInfoJsonPath && result.kind !== 'success' && !hasMediaTransferStarted(active) && !isSkippableSponsorBlockApiFailure(result, req)) {
				const retry = await runMedia(undefined)
				req = retry.req
				result = retry.result
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}
			}

			if (result.kind !== 'success') {
				if (isSkippableSponsorBlockApiFailure(result, req)) {
					return {kind: 'continue'}
				}
				const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
				const resumeContext = QueueResumeLifecycle.buildResumeContext(active, payload)
				if (resumeContext) active.resumeContext = resumeContext
				if (resumeContext) ctx.emitStatus('error', statusKey, params, payload, resumeContext)
				else ctx.emitStatus('error', statusKey, params, payload)
				return {kind: 'hard-failed', error: payload, resumeContext}
			}

			if (result.usedExtractorFallback) active.usedExtractorFallback = true
			return {kind: 'continue'}
		}
	}
}

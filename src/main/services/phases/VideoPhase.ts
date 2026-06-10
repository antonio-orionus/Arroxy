import {mkdir, rm, stat} from 'node:fs/promises'
import {join} from 'node:path'
import {STATUS_KEY} from '@shared/schemas.js'
import {siteForExtractor} from '@shared/sites/index.js'
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
	if (!('sponsorBlock' in req) || req.sponsorBlock === undefined || req.sponsorBlock.categories.length === 0) return false
	return /Unable to communicate with SponsorBlock API/i.test([result.rawError, result.stderr].filter(Boolean).join('\n'))
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
			const loadInfoJsonPath = await detectCachedInfoJson(isResume ? tempDir : undefined)

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
			const outputTemplate = preparedJob.outputTemplate
			const {embed: embedOpts} = preparedJob

			const req: YtDlpRequest =
				embed && (preparedJob.subtitles?.languages.length ?? 0) > 0
					? {
							kind: 'video+embed',
							url: input.url,
							outputDir: job.outputDir,
							tempDir,
							formatId,
							formatSelector,
							formatSort,
							mergeOutputFormat,
							audioConvert,
							subtitleLanguages: preparedJob.subtitles!.languages,
							writeAutoSubs: preparedJob.subtitles!.writeAuto,
							sponsorBlock: sbConfig,
							embedChapters: embedOpts.chapters,
							embedMetadata: embedOpts.metadata,
							embedThumbnail: embedOpts.thumbnail,
							writeDescription: embedOpts.description,
							writeThumbnail: embedOpts.thumbnailSidecar,
							outputTemplate,
							loadInfoJsonPath
						}
					: {
							kind: 'video',
							url: input.url,
							outputDir: job.outputDir,
							tempDir,
							formatId,
							formatSelector,
							formatSort,
							mergeOutputFormat,
							audioConvert,
							sponsorBlock: sbConfig,
							embedChapters: embedOpts.chapters,
							embedMetadata: embedOpts.metadata,
							embedThumbnail: embedOpts.thumbnail,
							writeDescription: embedOpts.description,
							writeThumbnail: embedOpts.thumbnailSidecar,
							outputTemplate,
							loadInfoJsonPath
						}

			// Don't preemptively emit downloadingMedia on spawn — yt-dlp spends
			// a few seconds on extractor work and thumbnail conversion first.
			// The first `[download] Destination:` line in consumeProgress emits
			// the accurate status when the actual data download begins.
			const result = await ytDlp.run(
				req,
				buildYtDlpSignal(ctx, active, {
					onMinting: attempt => {
						ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
					}
				})
			)

			if (active.pauseRequested) return {kind: 'paused'}
			if (active.cancelRequested) return {kind: 'cancelled'}

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

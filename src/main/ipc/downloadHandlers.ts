import log from 'electron-log/main.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {cookiesConfigIssueMessage, getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {fail, type Result} from '@shared/result.js'
import {z} from 'zod'
import {cancelDownloadSchema, pauseResumeSchema, probeSchema, resumeSchema, startDownloadSchema} from '@shared/schemas.js'
import type {ProbeError, ProbeResult} from '@shared/types.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {ProbeService} from '@main/services/ProbeService.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {handle, handleRaw} from './utils.js'

interface DownloadHandlerDeps {
	downloadService: DownloadService
	probeService: ProbeService
	settingsStore: SettingsStore
}

function getCookiesValidationFailure(settings: Awaited<ReturnType<SettingsStore['get']>>): Result<never> | null {
	const issue = getIncompleteCookiesConfigIssue(settings.common)
	return issue ? fail(createAppError('validation', cookiesConfigIssueMessage(issue))) : null
}

export function registerDownloadHandlers(deps: DownloadHandlerDeps): void {
	const {downloadService, probeService, settingsStore} = deps

	handle<z.infer<typeof probeSchema>, ProbeResult, ProbeError>(IPC_CHANNELS.downloadsProbe, probeSchema, async ({url, playlistMode, playlistScope}) => {
		const settings = await settingsStore.get()
		const issue = getIncompleteCookiesConfigIssue(settings.common)
		if (issue) return fail<ProbeResult, ProbeError>({kind: 'other', code: 'cookies_config', message: cookiesConfigIssueMessage(issue)})
		return probeService.probe(url, settings.common.cookiesMode ?? 'off', playlistMode ?? 'auto', playlistScope)
	})

	// Renderer fires this when the user changes URL or navigates away from a
	// probe in progress. Cancels every in-flight probe so the spinner never
	// blocks behind a stale 60s YouTube fallback chain.
	handleRaw(IPC_CHANNELS.downloadsProbeCancel, () => {
		probeService.cancelInFlight()
	})

	handle(IPC_CHANNELS.downloadsStart, startDownloadSchema, async data => {
		const settings = await settingsStore.get()
		const validationFailure = getCookiesValidationFailure(settings)
		if (validationFailure) return validationFailure
		const outputDir = data.outputDir ?? settings.common.defaultOutputDir
		return downloadService.start({...data, outputDir, cookiesMode: settings.common.cookiesMode ?? 'off'})
	})

	handle(IPC_CHANNELS.downloadsCancel, cancelDownloadSchema, ({jobId}) => {
		log.info('[cancel IPC] received', {jobId: jobId ?? '(undefined)'})
		return downloadService.cancel(jobId)
	})

	handle(IPC_CHANNELS.downloadsPause, pauseResumeSchema, ({jobId}) => downloadService.pause(jobId))

	handle(IPC_CHANNELS.downloadsResume, resumeSchema, ({jobId}) => downloadService.resume(jobId))
}

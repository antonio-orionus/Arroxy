import type {ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import {requestFetchesAuto} from '@shared/subtitleTracks.js'
import {VideoPhase} from './VideoPhase.js'
import {SubtitleOnlyPhase} from './SubtitleOnlyPhase.js'
import {SidecarSubsPhase} from './SidecarSubsPhase.js'
import {PreflightPhase} from './PreflightPhase.js'
import {DropAudioPhase} from './DropAudioPhase.js'
import type {Phase} from './types.js'

export type StrategyKind = 'subtitle-only' | 'video' | 'video+sidecar' | 'video+embed' | 'video+embed+auto'

const PHASES: Record<StrategyKind, Phase[]> = {'subtitle-only': [SubtitleOnlyPhase], video: [VideoPhase], 'video+embed': [VideoPhase, SidecarSubsPhase(true)], 'video+sidecar': [VideoPhase, SidecarSubsPhase(false)], 'video+embed+auto': [VideoPhase, SidecarSubsPhase(true)]}

export function strategyFor(job: PreparedJob): StrategyKind {
	switch (job.kind) {
		case 'subtitle-only':
			return 'subtitle-only'
		case 'single-format':
		case 'audio-convert':
		case 'ranged-format': {
			const subs = job.subtitles
			if (!subs) return 'video'
			if (subs.mode === 'embed' && requestFetchesAuto(subs.request)) return 'video+embed+auto'
			if (subs.mode === 'embed') return 'video+embed'
			return 'video+sidecar'
		}
		// The probe-stage placeholder never reaches phase planning —
		// DownloadService.start() refuses it before runJob.
		case 'unresolved':
			throw new Error('invariant: unresolved (probe-stage) job has no download strategy')
	}
}

// A profile's video without audio may download a stream with sound (a site
// with no video-only stream); its audio comes off before subtitles go in.
function dropsAudio(job: PreparedJob): boolean {
	return job.kind === 'ranged-format' && job.intent.kind === 'video-only'
}

export function phasesFor(input: ResolvedStartDownloadInput): Phase[] {
	const {job} = input
	// expectedBytes known for a single format and for audio extracted as it is.
	// Other jobs (a re-encode, ranged-format, subtitle-only) still run preflight against the floor in
	// checkDiskSpace so a near-full disk gets caught before yt-dlp spawns.
	const expectedBytes = job.kind === 'single-format' || job.kind === 'audio-convert' ? job.expectedBytes : undefined
	const [media, ...afterMedia] = PHASES[strategyFor(job)]
	return [PreflightPhase(expectedBytes), ...(media ? [media] : []), ...(dropsAudio(job) ? [DropAudioPhase] : []), ...afterMedia]
}

export {PhaseExecutor} from './PhaseExecutor.js'
export type {Phase, PhaseContext, PhaseOutcome, ActiveDownload, PausedDownload} from './types.js'
export {AsyncStack} from './types.js'

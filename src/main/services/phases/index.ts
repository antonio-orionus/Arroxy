import type {StartDownloadInput} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import {VideoPhase} from './VideoPhase.js'
import {SubtitleOnlyPhase} from './SubtitleOnlyPhase.js'
import {SidecarSubsPhase} from './SidecarSubsPhase.js'
import {PreflightPhase} from './PreflightPhase.js'
import type {Phase} from './types.js'

export type StrategyKind = 'subtitle-only' | 'video' | 'video+sidecar' | 'video+embed' | 'video+embed+auto'

const PHASES: Record<StrategyKind, Phase[]> = {'subtitle-only': [SubtitleOnlyPhase], video: [VideoPhase(false)], 'video+embed': [VideoPhase(false), SidecarSubsPhase(true)], 'video+sidecar': [VideoPhase(false), SidecarSubsPhase(false)], 'video+embed+auto': [VideoPhase(false), SidecarSubsPhase(true)]}

export function strategyFor(job: PreparedJob): StrategyKind {
	switch (job.kind) {
		case 'subtitle-only':
			return 'subtitle-only'
		case 'single-format':
		case 'audio-convert':
		case 'ranged-format': {
			const subs = job.subtitles
			if (!subs) return 'video'
			if (subs.mode === 'embed' && subs.writeAuto) return 'video+embed+auto'
			if (subs.mode === 'embed') return 'video+embed'
			return 'video+sidecar'
		}
	}
}

export function phasesFor(input: StartDownloadInput): Phase[] {
	const {job} = input
	// expectedBytes only known for single-format probes. Other kinds (audio-convert,
	// ranged-format, subtitle-only) still run preflight against the floor in
	// checkDiskSpace so a near-full disk gets caught before yt-dlp spawns.
	const expectedBytes = job.kind === 'single-format' ? job.expectedBytes : undefined
	return [PreflightPhase(expectedBytes), ...PHASES[strategyFor(job)]]
}

export {PhaseExecutor} from './PhaseExecutor.js'
export type {Phase, PhaseContext, PhaseOutcome, ActiveDownload, PausedDownload} from './types.js'
export {AsyncStack} from './types.js'

import type {DependencyDiagnostic, DependencyFailureKind, DependencyId} from '@shared/types.js'
import {SETUP_GROUP_OF, type SetupToolGroup} from '../../store/warmupDownloads.js'

// A failure the panel can explain. 'unknown' covers a failed diagnostic that
// carries no kind, or a kind newer than this renderer.
export type RepairCause = DependencyFailureKind | 'unknown'

const KNOWN_CAUSES: ReadonlySet<string> = new Set<DependencyFailureKind>(['download_failed', 'extract_failed', 'hash_failed', 'spawn_failed', 'permission_denied', 'blocked_or_quarantined', 'bad_exit_code', 'timeout', 'pair_incomplete'])

function causeOf(diagnostic: DependencyDiagnostic | undefined): RepairCause {
	const kind = diagnostic?.failure?.kind
	return kind && KNOWN_CAUSES.has(kind) ? kind : 'unknown'
}

export interface RepairGroup {
	group: SetupToolGroup
	// Every binary in the group, blocking or not: FFmpeg and FFprobe are set up
	// as a pair, so manual repair always offers both.
	ids: DependencyId[]
	cause: RepairCause
}

const GROUP_IDS: Record<SetupToolGroup, DependencyId[]> = {engine: ['yt-dlp'], media: ['ffmpeg', 'ffprobe']}

// One entry per tool group that is blocking, in display order. A group's cause
// is the first blocking member's: one package supplies both media tools, so
// they fail for the same reason.
export function repairGroups(diagnostics: Record<DependencyId, DependencyDiagnostic>, blocking: readonly DependencyId[]): RepairGroup[] {
	const groups: RepairGroup[] = []
	for (const group of ['engine', 'media'] as const) {
		const failing = blocking.filter(id => SETUP_GROUP_OF[id] === group)
		if (failing.length === 0) continue
		groups.push({group, ids: GROUP_IDS[group], cause: causeOf(diagnostics[failing[0]])})
	}
	return groups
}

// The cause every blocking group shares, or null when they fail for different
// reasons and each needs its own explanation.
export function sharedCause(groups: readonly RepairGroup[]): RepairCause | null {
	const [first, ...rest] = groups
	if (!first) return null
	return rest.every(group => group.cause === first.cause) ? first.cause : null
}

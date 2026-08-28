import type {DependencyDiagnostic, DependencyFailureKind, DependencyId} from './types.js'

const RUNTIME_REQUIRED_DEPENDENCY_IDS: readonly DependencyId[] = ['yt-dlp', 'ffmpeg', 'ffprobe'] as const

export function blockingDependencyFailures(dependencies: Partial<Record<DependencyId, DependencyDiagnostic>>): DependencyId[] {
	return RUNTIME_REQUIRED_DEPENDENCY_IDS.filter(id => dependencies[id]?.state !== 'runnable')
}

// A probe failure says one of two very different things, and the resolver chain
// has to tell them apart before deciding whether another candidate is worth a
// try.
//
// Candidate-fatal means *this* binary is wrong — a missing file, the wrong
// architecture, a non-zero exit. A different candidate genuinely might work, so
// falling through is the right move.
//
// Environment-fatal means the machine refused to run it: the probe timed out,
// the OS denied execution, or a security scanner held it. Nothing about the next
// candidate changes that verdict — it will hit the identical wall, and on the
// managed path each attempt costs a fresh download first. That is the shape of
// the yt-dlp download loop: one slow probe cascading into a second download that
// could never have helped.
const ENVIRONMENT_FATAL_FAILURE_KINDS: ReadonlySet<DependencyFailureKind> = new Set<DependencyFailureKind>(['timeout', 'permission_denied', 'blocked_or_quarantined'])

export function isEnvironmentFatalFailure(kind: DependencyFailureKind): boolean {
	return ENVIRONMENT_FATAL_FAILURE_KINDS.has(kind)
}

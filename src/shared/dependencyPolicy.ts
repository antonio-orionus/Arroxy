import type {DependencyDiagnostic, DependencyFailureKind, DependencyId, DependencySource} from './types.js'

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
// Environment-fatal means the machine refused to run it, and nothing about the
// next candidate changes that verdict — it will hit the identical wall, and on
// the managed path each attempt costs a fresh download first. That is the shape
// of the yt-dlp download loop: one slow probe cascading into a second download
// that could never have helped.
//
// Which of the two a refusal is depends on whose file it was. We chmod what we
// materialize and we know it is unquarantined, so the OS still refusing it says
// the machine is the problem. A path the *user* handed us — a manual override, an
// ARROXY_YT_DLP_PATH, something discovered on PATH — is a hint, not a verdict:
// a 0644 file there says nothing about whether a managed download would run, and
// treating it as fatal would strand the very users who set an override to work
// around a broken install.
//
// Slowness is the exception, and is always about the machine: a probe that
// outlives its budget means this computer is slow at starting this kind of
// binary, whoever chose the path.
const ALWAYS_ENVIRONMENT_FATAL: ReadonlySet<DependencyFailureKind> = new Set<DependencyFailureKind>(['timeout'])

// Refusals that are only systemic when the file is one we produced.
const REFUSAL_FAILURE_KINDS: ReadonlySet<DependencyFailureKind> = new Set<DependencyFailureKind>(['permission_denied', 'blocked_or_quarantined'])

const SELF_PROVISIONED_SOURCE_KINDS: ReadonlySet<DependencySource['kind']> = new Set<DependencySource['kind']>(['managed', 'managedCache', 'bundled', 'cache'])

export function isEnvironmentFatalFailure(kind: DependencyFailureKind, source: DependencySource): boolean {
	if (ALWAYS_ENVIRONMENT_FATAL.has(kind)) return true
	return REFUSAL_FAILURE_KINDS.has(kind) && SELF_PROVISIONED_SOURCE_KINDS.has(source.kind)
}

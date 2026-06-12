import type {DependencyDiagnostic, DependencyId} from './types.js'

const RUNTIME_REQUIRED_DEPENDENCY_IDS: readonly DependencyId[] = ['yt-dlp', 'ffmpeg', 'ffprobe'] as const

export function blockingDependencyFailures(dependencies: Partial<Record<DependencyId, DependencyDiagnostic>>): DependencyId[] {
	return RUNTIME_REQUIRED_DEPENDENCY_IDS.filter(id => dependencies[id]?.state !== 'runnable')
}

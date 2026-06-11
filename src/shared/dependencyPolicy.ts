import type {DependencyDiagnostic, DependencyId} from './types.js'

const RUNTIME_REQUIRED_DEPENDENCY_IDS: readonly DependencyId[] = ['yt-dlp', 'ffmpeg', 'ffprobe', 'deno'] as const

export interface DependencyRequirementContext {
	skipDeno?: boolean
}

function requiredDependencyIds(ctx: DependencyRequirementContext = {}): readonly DependencyId[] {
	return ctx.skipDeno ? RUNTIME_REQUIRED_DEPENDENCY_IDS.filter(id => id !== 'deno') : RUNTIME_REQUIRED_DEPENDENCY_IDS
}

export function blockingDependencyFailures(dependencies: Partial<Record<DependencyId, DependencyDiagnostic>>, ctx: DependencyRequirementContext = {}): DependencyId[] {
	return requiredDependencyIds(ctx).filter(id => dependencies[id]?.state !== 'runnable')
}

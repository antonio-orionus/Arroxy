import type {DependencyId, DependencySource} from '@shared/types.js'

export type ManagedVersionCheck = {kind: 'githubLatest'; latestUrl: string} | {kind: 'exactTag'; tag: string}

interface BaseManagedSourcePlan {
	id: DependencyId
	name: string
	source: Extract<DependencySource, {kind: 'managed'}>
	destinationPath: string
	downloadUrl: string
	checksumUrl: string
	requiredChecksum: boolean
	parseChecksum: (content: string) => string | null
}

export interface ManagedFileSourcePlan extends BaseManagedSourcePlan {
	installKind: 'file'
	versionCheck?: ManagedVersionCheck
}

export interface ManagedArchiveSourcePlan extends BaseManagedSourcePlan {
	installKind: 'archive'
	archiveFileName: string
	innerExecutableName: string
}

export type ManagedSourcePlan = ManagedFileSourcePlan | ManagedArchiveSourcePlan

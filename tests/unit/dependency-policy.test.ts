import {describe, expect, it} from 'vitest'
import {blockingDependencyFailures} from '@shared/dependencyPolicy.js'
import type {DependencyDiagnostic, DependencyId} from '@shared/types.js'

function diag(id: DependencyId, state: DependencyDiagnostic['state']): DependencyDiagnostic {
	return {id, state, source: null, resolvedPath: state === 'runnable' ? `/mock/${id}` : null, failure: state === 'failed' ? {kind: 'spawn_failed', message: 'mock'} : undefined, attempts: []}
}

describe('blockingDependencyFailures', () => {
	it('treats missing required dependency diagnostics as blocking failures', () => {
		const dependencies = {'yt-dlp': diag('yt-dlp', 'runnable')} as Record<DependencyId, DependencyDiagnostic>

		expect(blockingDependencyFailures(dependencies)).toEqual(['ffmpeg', 'ffprobe'])
	})
})

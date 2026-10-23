import {describe, expect, it} from 'vite-plus/test'
import {repairGroups, sharedCause} from '@renderer/components/system/repairGroups.js'
import type {DependencyFailureKind} from '@shared/schemas.js'
import type {DependencyDiagnostic, DependencyId} from '@shared/types.js'

function failed(id: DependencyId, kind: DependencyFailureKind | 'something-new'): DependencyDiagnostic {
	return {id, state: 'failed', source: null, resolvedPath: null, failure: {kind: kind as DependencyFailureKind, message: kind}, attempts: []}
}

function runnable(id: DependencyId): DependencyDiagnostic {
	return {id, state: 'runnable', source: null, resolvedPath: `/bin/${id}`, attempts: []}
}

describe('repair groups', () => {
	// One package supplies both media tools, so they fail together; showing them
	// as two cards was false precision.
	it('merges FFmpeg and FFprobe into one media tools group', () => {
		const groups = repairGroups({'yt-dlp': runnable('yt-dlp'), ffmpeg: failed('ffmpeg', 'download_failed'), ffprobe: failed('ffprobe', 'download_failed')}, ['ffmpeg', 'ffprobe'])
		expect(groups).toEqual([{group: 'media', ids: ['ffmpeg', 'ffprobe'], cause: 'download_failed'}])
	})

	it('offers both media tools for manual setup even when only one is blocking', () => {
		const groups = repairGroups({'yt-dlp': runnable('yt-dlp'), ffmpeg: runnable('ffmpeg'), ffprobe: failed('ffprobe', 'bad_exit_code')}, ['ffprobe'])
		expect(groups).toEqual([{group: 'media', ids: ['ffmpeg', 'ffprobe'], cause: 'bad_exit_code'}])
	})

	it('names one shared cause when every group fails for the same reason', () => {
		const groups = repairGroups({'yt-dlp': failed('yt-dlp', 'download_failed'), ffmpeg: failed('ffmpeg', 'download_failed'), ffprobe: failed('ffprobe', 'download_failed')}, ['yt-dlp', 'ffmpeg', 'ffprobe'])
		expect(groups.map(group => group.group)).toEqual(['engine', 'media'])
		expect(sharedCause(groups)).toBe('download_failed')
	})

	it('has no shared cause when the groups fail differently', () => {
		const groups = repairGroups({'yt-dlp': failed('yt-dlp', 'blocked_or_quarantined'), ffmpeg: failed('ffmpeg', 'download_failed'), ffprobe: failed('ffprobe', 'download_failed')}, ['yt-dlp', 'ffmpeg', 'ffprobe'])
		expect(sharedCause(groups)).toBeNull()
	})

	it('knows a stalled download as its own cause', () => {
		const groups = repairGroups({'yt-dlp': runnable('yt-dlp'), ffmpeg: failed('ffmpeg', 'download_stalled'), ffprobe: failed('ffprobe', 'download_stalled')}, ['ffmpeg', 'ffprobe'])
		expect(groups).toEqual([{group: 'media', ids: ['ffmpeg', 'ffprobe'], cause: 'download_stalled'}])
	})

	it('falls back to an unknown cause for a failure kind newer than this renderer', () => {
		const groups = repairGroups({'yt-dlp': failed('yt-dlp', 'something-new'), ffmpeg: runnable('ffmpeg'), ffprobe: runnable('ffprobe')}, ['yt-dlp'])
		expect(groups).toEqual([{group: 'engine', ids: ['yt-dlp'], cause: 'unknown'}])
	})
})

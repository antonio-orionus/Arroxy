import type {BulkMetadataItemStatus, PlaylistEntry} from '@shared/types.js'
import type {AppState} from '../../store/types.js'

export interface BulkStressFixture {
	entries: PlaylistEntry[]
	metadataById: Record<string, BulkMetadataItemStatus>
	completed: number
	total: number
}

export function bulkStressFixture(count = 50): BulkStressFixture {
	const statusForIndex = (index: number): BulkMetadataItemStatus => {
		if (index % 17 === 0) return 'failed'
		if (index % 5 === 0) return 'resolving'
		if (index % 3 === 0) return 'pending'
		return 'done'
	}
	const entries: PlaylistEntry[] = Array.from({length: count}, (_, i) => {
		const number = i + 1
		const duplicateBlock = Math.floor(i / 5) + 1
		const title = `Bulk stress duplicate title block ${duplicateBlock} - archival lecture with a very long title, brackets [session ${duplicateBlock}], repeated wording, and enough metadata to pressure row layout`
		return {id: `bulk-stress-${number}`, url: `https://www.youtube.com/watch?v=bulk${String(number).padStart(8, '0')}`, title, thumbnail: i % 4 === 0 ? '' : 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg', duration: i % 6 === 0 ? undefined : 120 + i * 33, playlistIndex: number, videoId: `bulk${number}`}
	})
	const metadataById = Object.fromEntries(entries.map((entry, index) => [entry.id, statusForIndex(index)])) as Record<string, BulkMetadataItemStatus>
	return {entries, metadataById, completed: Object.values(metadataById).filter(status => status !== 'pending' && status !== 'resolving').length, total: entries.length}
}

export function bulkStressState(): Partial<AppState> {
	const fixture = bulkStressFixture()
	return {
		wizardStep: 'playlistItems',
		wizardMode: 'bulk',
		wizardExtractor: 'youtube',
		wizardExtractorKey: 'Youtube',
		playlistItems: fixture.entries,
		selectedPlaylistItemIds: fixture.entries.map(entry => entry.id),
		playlistTitle: 'Bulk URLs',
		playlistId: 'bulk-stress',
		playlistIsMultiVideo: false,
		playlistLikelyCapped: false,
		playlistProbeLoading: false,
		bulkMetadataStatus: 'resolving',
		bulkMetadataCompleted: fixture.completed,
		bulkMetadataTotal: fixture.total,
		bulkMetadataById: fixture.metadataById,
		syncedDownloadedIds: [],
		syncScanState: 'idle'
	}
}

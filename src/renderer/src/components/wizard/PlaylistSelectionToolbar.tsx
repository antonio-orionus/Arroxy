import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Input} from '../ui/input.js'

function RemovedPlaylistItemsRestore({removedCount, onRestore}: {removedCount: number; onRestore: () => void}): ReactNode {
	const {t} = useTranslation()
	if (removedCount === 0) return null
	return (
		<div className="flex items-center gap-2">
			<span className="text-xs text-muted-foreground" data-testid="removed-playlist-items-count">
				{t('wizard.playlist.removedCount', {count: removedCount})}
			</span>
			<Button type="button" variant="outline" size="sm" onClick={onRestore} data-testid="restore-removed-playlist-items">
				{t('wizard.playlist.restore')}
			</Button>
		</div>
	)
}

function PlaylistRangeSelect({disabled, onSelectRange}: {disabled: boolean; onSelectRange: (from: number, to: number) => void}): ReactNode {
	const {t} = useTranslation()
	const [rangeFrom, setRangeFrom] = useState('')
	const [rangeTo, setRangeTo] = useState('')

	function applyRange(): void {
		const from = parseInt(rangeFrom, 10)
		const to = parseInt(rangeTo, 10)
		if (!isNaN(from) && !isNaN(to)) onSelectRange(from, to)
	}

	return (
		<div className="ml-auto flex items-center gap-1">
			<span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeFrom')}</span>
			<Input className="h-7 w-14 px-2 text-xs" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} placeholder="1" disabled={disabled} />
			<span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeTo')}</span>
			<Input className="h-7 w-14 px-2 text-xs" value={rangeTo} onChange={e => setRangeTo(e.target.value)} placeholder="10" disabled={disabled} />
			<Button type="button" variant="outline" size="sm" onClick={applyRange} disabled={disabled}>
				{t('wizard.playlist.rangeApply')}
			</Button>
		</div>
	)
}

export function PlaylistSelectionToolbar({busy}: {busy: boolean}): ReactNode {
	const {t} = useTranslation()
	const removedCount = useAppStore(s => s.removedPlaylistItemIds.length)
	const selectAllPlaylistItems = useAppStore(s => s.selectAllPlaylistItems)
	const selectNonePlaylistItems = useAppStore(s => s.selectNonePlaylistItems)
	const selectPlaylistRange = useAppStore(s => s.selectPlaylistRange)
	const restoreRemovedPlaylistItems = useAppStore(s => s.restoreRemovedPlaylistItems)
	return (
		<div className="flex items-center gap-2 flex-wrap">
			<Button type="button" variant="outline" size="sm" onClick={selectAllPlaylistItems} disabled={busy}>
				{t('wizard.playlist.selectAll')}
			</Button>
			<Button type="button" variant="outline" size="sm" onClick={selectNonePlaylistItems} disabled={busy}>
				{t('wizard.playlist.selectNone')}
			</Button>
			<RemovedPlaylistItemsRestore removedCount={removedCount} onRestore={restoreRemovedPlaylistItems} />
			<PlaylistRangeSelect disabled={busy} onSelectRange={selectPlaylistRange} />
		</div>
	)
}

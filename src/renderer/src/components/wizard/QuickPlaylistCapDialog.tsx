import {type ReactNode} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {AlertTriangle} from 'lucide-react'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'

export function QuickPlaylistCapDialog(): ReactNode {
	const {t} = useTranslation()
	const quickPlaylistCapDialogOpen = useAppStore(state => state.quickPlaylistCapDialogOpen)
	const playlistItems = useAppStore(state => state.playlistItems)
	const playlistTitle = useAppStore(state => state.playlistTitle)
	const isSubmittingToQueue = useAppStore(state => state.isSubmittingToQueue)
	const settings = useAppStore(state => state.settings)
	const dismissQuickPlaylistCapDialog = useAppStore(state => state.dismissQuickPlaylistCapDialog)
	const queueLoadedPlaylistWithActiveProfile = useAppStore(state => state.queueLoadedPlaylistWithActiveProfile)
	const retryQuickPlaylistCap = useAppStore(state => state.retryQuickPlaylistCap)
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const itemCount = playlistItems.length

	return (
		<Dialog
			open={quickPlaylistCapDialogOpen}
			onOpenChange={open => {
				if (!open) dismissQuickPlaylistCapDialog()
			}}
		>
			<DialogContent data-testid="quick-playlist-cap-dialog" className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="text-warning" aria-hidden />
						{t('wizard.playlistCap.title')}
					</DialogTitle>
					<DialogDescription>
						{/* The title is the playlist's own text: an element, so the message's placeholders never reach into it. */}
						{playlistTitle ? <Trans i18nKey="wizard.playlistCap.descriptionWithTitle" count={itemCount} values={{limit: playlistLimit}} components={{title: <span>{playlistTitle}</span>}} /> : t('wizard.playlistCap.description', {count: itemCount, limit: playlistLimit})}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg border border-border bg-background/30 p-3">
					<p className="mb-2 text-xs font-semibold text-foreground">{t('wizard.playlistCap.changeLimit')}</p>
					<PlaylistProbeLimitSelector
						testId="quick-playlist-cap-probe-limit"
						showCurrent={false}
						onLimitChanged={() => {
							void retryQuickPlaylistCap()
						}}
					/>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={dismissQuickPlaylistCapDialog}>
						{t('common.cancel')}
					</Button>
					<Button variant="glow" type="button" onClick={() => void queueLoadedPlaylistWithActiveProfile()} disabled={itemCount === 0 || isSubmittingToQueue} data-testid="quick-playlist-cap-queue-loaded">
						{t('wizard.playlistCap.queueLoaded')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

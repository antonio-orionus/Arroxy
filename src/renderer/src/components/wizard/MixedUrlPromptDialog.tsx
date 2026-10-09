import {useRef, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Info} from 'lucide-react'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter} from '../ui/dialog.js'
import {Button} from '../ui/button.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {useAppStore} from '../../store/useAppStore.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'

// Mixed YouTube URLs (?v=X&list=Y) are ambiguous: yt-dlp's default routes
// Radio/Mix lists to playlist enumeration, which rarely matches user intent
// (they clicked a specific video). The wizardSlice opens this dialog before
// probing whenever it detects the mixed pattern; the user's choice flows
// through to the probe IPC as `playlistMode: 'video' | 'playlist'`.
export function MixedUrlPromptDialog(): ReactNode {
	const {t} = useTranslation()
	const {mixedUrlPromptOpen, mixedUrlPromptSource, cancelMixedPrompt, dismissMixedPrompt, settings} = useAppStore()
	const playlistButtonRef = useRef<HTMLButtonElement>(null)
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const isQuickDownload = mixedUrlPromptSource === 'quick-download'

	return (
		<Dialog open={mixedUrlPromptOpen} onOpenChange={open => !open && cancelMixedPrompt()}>
			{/* Focus the playlist action on open, the recommended action, instead
          of the close button or the nested playlist-limit selector. */}
			<DialogContent initialFocus={playlistButtonRef}>
				<DialogTitle>{t('wizard.mixedPrompt.title')}</DialogTitle>
				<DialogDescription>{t(isQuickDownload ? 'wizard.mixedPrompt.quickBody' : 'wizard.mixedPrompt.body')}</DialogDescription>
				<Alert variant="info" size="sm" className="mt-3" data-testid="mixed-playlist-cap">
					<Info />
					<AlertDescription title={t('wizard.url.playlistProbeLimit.tooltip')}>
						{t('wizard.mixedPrompt.playlistLimit', {count: playlistLimit})} · {t(isQuickDownload ? 'wizard.mixedPrompt.quickLimitDescription' : 'wizard.url.playlistProbeLimit.description')}
					</AlertDescription>
					<div className="col-start-2 mt-1.5">
						<PlaylistProbeLimitSelector testId="mixed-playlist-probe-limit" showCurrent={false} className="w-36" />
					</div>
				</Alert>
				<DialogFooter>
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button {...props} type="button" variant="outline" onClick={() => void dismissMixedPrompt('video')} data-testid="mixed-single-choice">
									{t(isQuickDownload ? 'wizard.mixedPrompt.quickSingleVideo' : 'wizard.mixedPrompt.singleVideo')}
								</Button>
							)}
						/>
						<TooltipContent className="max-w-[18rem] leading-snug" data-testid="mixed-single-tooltip">
							{t(isQuickDownload ? 'wizard.mixedPrompt.quickSingleTooltip' : 'wizard.mixedPrompt.singleTooltip')}
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button {...props} ref={playlistButtonRef} type="button" variant="outline" onClick={() => void dismissMixedPrompt('playlist')} data-testid="mixed-playlist-choice">
									{t(isQuickDownload ? 'wizard.mixedPrompt.quickWholePlaylist' : 'wizard.mixedPrompt.pickFromPlaylist')}
								</Button>
							)}
						/>
						<TooltipContent className="max-w-[18rem] leading-snug" data-testid="mixed-playlist-tooltip">
							{t(isQuickDownload ? 'wizard.mixedPrompt.quickPlaylistTooltip' : 'wizard.mixedPrompt.playlistTooltip')}
						</TooltipContent>
					</Tooltip>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// The queue's SELECTED_ACTIONS pattern, repurposed: each action assigns a
// profile to the current selection instead of mutating a queue item. Icon-only
// buttons + tooltip so the visible bar stays compact even with several
// profiles; anything past the first eight lives behind "More…".

import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, RotateCcw} from 'lucide-react'
import type {DownloadProfileRef} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {TooltipIconButton} from '../ui/tooltip-icon-button.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

const ACTION_BAR_VISIBLE_LIMIT = 8

interface PlaylistProfileActionBarProps {
	options: DownloadProfileActionOption[]
	selectedCount: number
	onAssign: (ref: DownloadProfileRef) => void
	onReset: () => void
}

export function PlaylistProfileActionBar({options, selectedCount, onAssign, onReset}: PlaylistProfileActionBarProps): ReactNode {
	const {t} = useTranslation()
	const [moreOpen, setMoreOpen] = useState(false)
	const disabled = selectedCount === 0
	const visible = options.slice(0, ACTION_BAR_VISIBLE_LIMIT)
	const overflow = options.slice(ACTION_BAR_VISIBLE_LIMIT)

	function assign(ref: DownloadProfileRef): void {
		onAssign(ref)
		setMoreOpen(false)
	}

	return (
		<div className="flex flex-wrap items-center gap-1.5" data-testid="playlist-profile-actions">
			<ButtonGroup className="flex-wrap" aria-label={t('queue.selectedActionsLabel')}>
				{visible.map(option => (
					<TooltipIconButton key={option.profile.id} icon={<option.Icon size={13} aria-hidden />} label={t('wizard.playlistProfiles.assignAria', {profileName: option.profile.name})} data-testid={`assign-profile-${option.profile.id}`} className="h-7 w-7" disabled={disabled} onClick={() => assign(option.ref)} />
				))}
			</ButtonGroup>
			<Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onReset} className="h-7 gap-1.5 border-[1.5px] border-[var(--border-strong)] px-2 text-xs" data-testid="playlist-profile-reset">
				<RotateCcw size={13} aria-hidden />
				{t('wizard.url.profile.reset')}
			</Button>
			{overflow.length > 0 ? (
				<Popover open={moreOpen} onOpenChange={setMoreOpen}>
					<PopoverTrigger
						render={
							<Button type="button" variant="outline" size="sm" disabled={disabled} className="h-7 gap-1 px-2 text-xs" data-testid="playlist-profile-more">
								{t('wizard.playlistProfiles.more')}
								<ChevronDown size={12} aria-hidden />
							</Button>
						}
					/>
					<PopoverContent align="start" className="w-56 gap-1 p-1.5">
						{overflow.map(option => (
							<Button key={option.profile.id} type="button" variant="ghost" size="sm" className="h-8 justify-start gap-2 px-2 text-xs" data-testid={`assign-profile-${option.profile.id}`} onClick={() => assign(option.ref)}>
								<option.Icon size={13} className="shrink-0 text-[var(--brand)]" aria-hidden />
								<span className="min-w-0 flex-1 truncate text-left">{option.profile.name}</span>
							</Button>
						))}
					</PopoverContent>
				</Popover>
			) : null}
		</div>
	)
}

// The queue's SELECTED_ACTIONS pattern, repurposed: each action assigns a
// profile to the current selection instead of mutating a queue item. Icon-only
// buttons + tooltip so the visible bar stays compact even with several
// profiles; anything past the first eight lives behind "More…". Each profile
// also carries a hover/focus-revealed pencil that reaches the same profile
// editor QuickProfileControl opens (see StepPlaylistProfiles), so a hasty
// profile pick can be corrected without leaving the assignment step.

import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, PenLine, RotateCcw} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {TooltipIconButton} from '../ui/tooltip-icon-button.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

const ACTION_BAR_VISIBLE_LIMIT = 8

interface PlaylistProfileActionBarProps {
	options: DownloadProfileActionOption[]
	selectedCount: number
	onAssign: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onReset: () => void
}

export function PlaylistProfileActionBar({options, selectedCount, onAssign, onEditProfile, onReset}: PlaylistProfileActionBarProps): ReactNode {
	const {t} = useTranslation()
	const [moreOpen, setMoreOpen] = useState(false)
	const disabled = selectedCount === 0
	const visible = options.slice(0, ACTION_BAR_VISIBLE_LIMIT)
	const overflow = options.slice(ACTION_BAR_VISIBLE_LIMIT)

	function assign(ref: DownloadProfileRef): void {
		onAssign(ref)
		setMoreOpen(false)
	}

	// Never assigns — this is the whole point of keeping it a sibling button
	// rather than nesting it inside the assign control (invalid HTML anyway).
	// stopPropagation still runs first so a future wrapper that makes the
	// whole cluster clickable can't turn "edit" into "assign" by accident.
	function editProfile(event: {stopPropagation: () => void}, profile: DownloadProfile): void {
		event.stopPropagation()
		onEditProfile(profile)
	}

	return (
		<div className="flex flex-wrap items-center gap-1.5" data-testid="playlist-profile-actions">
			<ButtonGroup className="flex-wrap" aria-label={t('queue.selectedActionsLabel')}>
				{visible.map(option => (
					<ButtonGroup key={option.profile.id} className="group/profile">
						<TooltipIconButton icon={<option.Icon size={13} aria-hidden />} label={t('wizard.playlistProfiles.assignAria', {profileName: option.profile.name})} data-testid={`assign-profile-${option.profile.id}`} className="h-7 w-7" disabled={disabled} onClick={() => assign(option.ref)} />
						<Tooltip>
							<TooltipTrigger
								render={props => (
									<Button
										{...props}
										type="button"
										variant="ghost"
										size="icon"
										aria-label={t('wizard.playlistProfiles.editProfile', {name: option.profile.name})}
										data-testid={`edit-profile-${option.profile.id}`}
										className="h-7 w-7 opacity-0 transition-opacity duration-150 group-hover/profile:opacity-100 focus-visible:opacity-100"
										onClick={event => editProfile(event, option.profile)}
									>
										<PenLine size={12} aria-hidden />
									</Button>
								)}
							/>
							<TooltipContent>{t('wizard.playlistProfiles.editProfile', {name: option.profile.name})}</TooltipContent>
						</Tooltip>
					</ButtonGroup>
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
							<div key={option.profile.id} className="group/profile flex items-center gap-1">
								<Button type="button" variant="ghost" size="sm" className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 text-xs" data-testid={`assign-profile-${option.profile.id}`} onClick={() => assign(option.ref)}>
									<option.Icon size={13} className="shrink-0 text-[var(--brand)]" aria-hidden />
									<span className="min-w-0 flex-1 truncate text-left">{option.profile.name}</span>
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={t('wizard.playlistProfiles.editProfile', {name: option.profile.name})}
									data-testid={`edit-profile-${option.profile.id}`}
									className="h-8 w-8 shrink-0 opacity-0 transition-opacity duration-150 group-hover/profile:opacity-100 focus-visible:opacity-100"
									onClick={event => editProfile(event, option.profile)}
								>
									<PenLine size={12} aria-hidden />
								</Button>
							</div>
						))}
					</PopoverContent>
				</Popover>
			) : null}
		</div>
	)
}

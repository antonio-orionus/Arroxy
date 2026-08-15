// One labeled dropdown replaces the old icon-only action-bar row. Icon-only
// buttons worked for the queue tab's SELECTED_ACTIONS (pause/resume/cancel
// are universal glyphs) but not here: six of the eight builtin profiles are
// all `video-audio` and render the identical clapperboard icon, so users
// could not tell them apart by glyph alone. A single trigger opens one list
// with icon + name for every profile — no more "More…" split, since the
// whole point was that the icon-only row couldn't hold enough information to
// be worth keeping compact.
//
// Row treatment (icon + name) mirrors PlaylistProfileTable's right-click menu
// so the two read as the same list. Each row also carries a hover/focus-
// revealed pencil that reaches the same profile editor QuickProfileControl
// opens (see StepPlaylistProfiles), so a hasty pick can be corrected without
// leaving the assignment step.
//
// The first nine (StepPlaylistProfiles's DIGIT_CODES) carry a trailing digit
// teaching the number-key shortcut — the dismissible hint alert is the only
// other place that's taught, so once it's dismissed this is the sole
// remaining discovery path.

import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, PenLine, RotateCcw} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

// Matches DIGIT_CODES.length in StepPlaylistProfiles.tsx — number keys 1-9
// only ever address the first nine ordered profiles.
const DIGIT_HINT_LIMIT = 9

interface PlaylistProfileActionBarProps {
	options: DownloadProfileActionOption[]
	selectedCount: number
	onAssign: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onReset: () => void
}

export function PlaylistProfileActionBar({options, selectedCount, onAssign, onEditProfile, onReset}: PlaylistProfileActionBarProps): ReactNode {
	const {t} = useTranslation()
	const [open, setOpen] = useState(false)
	const disabled = selectedCount === 0

	function assign(ref: DownloadProfileRef): void {
		onAssign(ref)
		setOpen(false)
	}

	// Never assigns — stopPropagation runs first so the row button beneath the
	// pencil can never also fire from the same click.
	function editProfile(event: {stopPropagation: () => void}, profile: DownloadProfile): void {
		event.stopPropagation()
		onEditProfile(profile)
	}

	return (
		<div className="flex flex-wrap items-center gap-1.5" data-testid="playlist-profile-actions">
			<Popover open={open} onOpenChange={setOpen}>
				{/* Never disabled, unlike the row assign buttons inside — the pencil on
				every row must stay reachable even with nothing selected, since editing
				a profile has nothing to do with the current selection. */}
				<PopoverTrigger
					render={
						<Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 border-[1.5px] border-[var(--border-strong)] px-2 text-xs" data-testid="playlist-profile-assign-trigger">
							{t('wizard.playlistProfiles.assignTrigger')}
							<ChevronDown size={12} aria-hidden />
						</Button>
					}
				/>
				{/* Sized to content (mirrors ContextMenuContent) so the longest builtin
				name — "Smart TV MP4 Full HD 1080p" — never truncates; max-w caps it
				against both the viewport (--available-width, set by the positioner)
				and a hard ceiling so a pathologically long custom name can't blow out
				the layout. */}
				<PopoverContent align="start" className="w-max max-w-[min(24rem,var(--available-width))] max-h-72 gap-1 overflow-y-auto p-1.5">
					{options.map((option, index) => (
						<div key={option.profile.id} className="group/profile flex items-center gap-1">
							<Button type="button" variant="ghost" size="sm" disabled={disabled} className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 text-xs" data-testid={`assign-profile-${option.profile.id}`} onClick={() => assign(option.ref)}>
								<option.Icon size={14} className="shrink-0" aria-hidden />
								<span className="min-w-0 flex-1 truncate text-left">{option.profile.name}</span>
								{index < DIGIT_HINT_LIMIT ? (
									<span className="shrink-0 text-[10px] text-muted-foreground/55 tabular-nums" aria-hidden>
										{index + 1}
									</span>
								) : null}
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
			<Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onReset} className="h-7 gap-1.5 border-[1.5px] border-[var(--border-strong)] px-2 text-xs" data-testid="playlist-profile-reset">
				<RotateCcw size={13} aria-hidden />
				{t('wizard.url.profile.reset')}
			</Button>
		</div>
	)
}

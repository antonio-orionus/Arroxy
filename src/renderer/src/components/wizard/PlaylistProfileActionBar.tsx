// The step's toolbar: "Assign to N videos" opens the same profile menu as the
// URL tab's profile card and every row's profile, acting on the selected rows,
// and Reset returns them to the baseline. Both need a selection, so both are
// disabled without one.

import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, RotateCcw} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {Button} from '../ui/button.js'
import {Popover, PopoverTrigger} from '../ui/popover.js'
import {ProfilePickerMenu} from './ProfilePicker.js'
import type {PlaylistProfileMenuModel} from './playlistProfileMenu.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'

interface PlaylistProfileActionBarProps {
	menu: PlaylistProfileMenuModel
	selectedCount: number
	onAssign: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onNewProfile: () => void
	onReset: () => void
}

export function PlaylistProfileActionBar({menu, selectedCount, onAssign, onEditProfile, onNewProfile, onReset}: PlaylistProfileActionBarProps): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const [open, setOpen] = useState(false)
	const disabled = selectedCount === 0

	return (
		<div className="flex flex-wrap items-center gap-1.5" data-testid="playlist-profile-actions">
			<Popover open={open && !disabled} onOpenChange={setOpen}>
				<PopoverTrigger
					disabled={disabled}
					render={
						<Button type="button" variant="outline" size="sm" data-testid="playlist-profile-assign-trigger">
							{disabled ? t('wizard.playlistProfiles.assignTriggerEmpty') : t('wizard.playlistProfiles.assignTrigger', {count: selectedCount})}
							<ChevronDown className="transition-transform duration-200 group-aria-expanded/button:rotate-180" aria-hidden />
						</Button>
					}
				/>
				<ProfilePickerMenu
					layout="list"
					options={menu.options}
					editProfile={menu.sharedProfile}
					editLabel={menu.sharedProfile ? t('wizard.playlistProfiles.editProfile', {name: nameOf(menu.sharedProfile)}) : undefined}
					description={t('wizard.playlistProfiles.menuDescription', {count: selectedCount})}
					align="start"
					onPickProfile={onAssign}
					onEditProfile={onEditProfile}
					onNewProfile={onNewProfile}
					onClose={() => setOpen(false)}
					testIdPrefix="playlist"
				/>
			</Popover>
			<Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onReset} data-testid="playlist-profile-reset">
				<RotateCcw data-icon="inline-start" />
				{t('wizard.url.profile.reset')}
			</Button>
		</div>
	)
}

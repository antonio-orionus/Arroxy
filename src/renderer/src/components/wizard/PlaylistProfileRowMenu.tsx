// One profile menu for every row's profile button: each button is a detached
// trigger carrying its row id, so the table mounts a single menu instead of one
// per visible row. The menu is the same one the toolbar and the URL tab open.

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {Popover, type PopoverHandle} from '../ui/popover.js'
import {ProfilePickerMenu} from './ProfilePicker.js'
import type {PlaylistProfileMenuModel} from './playlistProfileMenu.js'

export type PlaylistProfileRowMenuHandle = PopoverHandle<string>

interface PlaylistProfileRowMenuProps {
	handle: PlaylistProfileRowMenuHandle
	// The rows a menu opened from this row acts on, and its model for them.
	menuFor: (rowId: string) => {targets: string[]; menu: PlaylistProfileMenuModel}
	onAssign: (itemIds: string[], ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onNewProfile: (itemIds: string[]) => void
}

export function PlaylistProfileRowMenu({handle, menuFor, onAssign, onEditProfile, onNewProfile}: PlaylistProfileRowMenuProps): ReactNode {
	const {t} = useTranslation()
	return (
		<Popover handle={handle}>
			{({payload}) => {
				if (payload === undefined) return null
				const {targets, menu} = menuFor(payload)
				return (
					<ProfilePickerMenu
						layout="list"
						options={menu.options}
						editProfile={menu.sharedProfile}
						editLabel={menu.sharedProfile ? t('wizard.playlistProfiles.editProfile', {name: menu.sharedProfile.name}) : undefined}
						description={t('wizard.playlistProfiles.menuDescription', {count: targets.length})}
						align="start"
						onPickProfile={ref => onAssign(targets, ref)}
						onEditProfile={onEditProfile}
						onNewProfile={() => onNewProfile(targets)}
						onClose={() => handle.close()}
						testIdPrefix="playlist-row"
					/>
				)
			}}
		</Popover>
	)
}

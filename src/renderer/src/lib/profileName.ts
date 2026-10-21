import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import {DOWNLOAD_PROFILE_NAME_MAX} from '@shared/schemas.js'
import type {DownloadProfile} from '@shared/types.js'

type NamedProfile = Pick<DownloadProfile, 'id' | 'name'>

const ELLIPSIS = '…'

// For store code and toasts: the name in the language the app shows now.
export function profileDisplayName(profile: NamedProfile): string {
	return downloadProfileName(profile, key => i18next.t(key))
}

// For components: re-renders with the rest of the UI when the language changes.
export function useProfileDisplayName(): (profile: NamedProfile) => string {
	const {t} = useTranslation()
	return profile => downloadProfileName(profile, key => t(key))
}

// The default name for saving a run's edits as a new profile: the profile's
// name with the translated "(edited)" around it. A name too long for the
// result to fit the profile-name limit is shortened, ending in an ellipsis.
export function editedProfileName(profileName: string): string {
	const edited = (profile: string): string => i18next.t('wizard.review.nextTime.defaultName', {profile})
	const full = edited(profileName)
	if (full.length <= DOWNLOAD_PROFILE_NAME_MAX) return full
	const room = Math.max(0, DOWNLOAD_PROFILE_NAME_MAX - edited('').length - ELLIPSIS.length)
	// Never split a surrogate pair: half an emoji is not a character.
	const head = profileName.slice(0, room).replace(/[\uD800-\uDBFF]$/, '')
	return edited(`${head.trimEnd()}${ELLIPSIS}`)
}

import i18next from 'i18next'
import {useTranslation} from 'react-i18next'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import type {DownloadProfile} from '@shared/types.js'

type NamedProfile = Pick<DownloadProfile, 'id' | 'name'>

// For store code and toasts: the name in the language the app shows now.
export function profileDisplayName(profile: NamedProfile): string {
	return downloadProfileName(profile, key => i18next.t(key))
}

// For components: re-renders with the rest of the UI when the language changes.
export function useProfileDisplayName(): (profile: NamedProfile) => string {
	const {t} = useTranslation()
	return profile => downloadProfileName(profile, key => t(key))
}

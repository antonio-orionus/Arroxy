import {mainT} from '@main/i18n.js'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import type {DownloadProfile} from '@shared/types.js'

// A profile's name as the English UI shows it.
export function englishProfileName(profile: Pick<DownloadProfile, 'id' | 'name'>): string {
	return downloadProfileName(profile, key => mainT('en', key))
}

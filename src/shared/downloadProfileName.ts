import {isBuiltinDownloadProfileId} from './downloadProfiles.js'
import type {BuiltinDownloadProfileId, DownloadProfile} from './schemas.js'

export type BuiltinDownloadProfileNameKey = `wizard.url.profile.builtinName.${BuiltinDownloadProfileId}`

// The name a profile is shown under: the one the user typed, or a built-in's
// own name in the app language. Callers pass their own translator, so the
// renderer and main each look it up in the language they show.
export function downloadProfileName(profile: Pick<DownloadProfile, 'id' | 'name'>, translate: (key: BuiltinDownloadProfileNameKey) => string): string {
	if (profile.name !== undefined) return profile.name
	return isBuiltinDownloadProfileId(profile.id) ? translate(`wizard.url.profile.builtinName.${profile.id}`) : profile.id
}

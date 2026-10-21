import {isBuiltinDownloadProfileId} from './downloadProfiles.js'
import type {BuiltinDownloadProfileId, DownloadProfile} from './schemas.js'

export const BUILTIN_DOWNLOAD_PROFILE_NAME_KEYS = {
	'best-quality': 'wizard.url.profile.builtinName.best-quality',
	'best-2160': 'wizard.url.profile.builtinName.best-2160',
	'best-1440': 'wizard.url.profile.builtinName.best-1440',
	'hd-1080': 'wizard.url.profile.builtinName.hd-1080',
	balanced: 'wizard.url.profile.builtinName.balanced',
	'small-file': 'wizard.url.profile.builtinName.small-file',
	'mp4-1080': 'wizard.url.profile.builtinName.mp4-1080',
	'mp4-720': 'wizard.url.profile.builtinName.mp4-720',
	'mp4-480': 'wizard.url.profile.builtinName.mp4-480',
	'audio-only': 'wizard.url.profile.builtinName.audio-only',
	'subtitles-only': 'wizard.url.profile.builtinName.subtitles-only',
	'low-240': 'wizard.url.profile.builtinName.low-240',
	'low-144': 'wizard.url.profile.builtinName.low-144'
} as const satisfies Record<BuiltinDownloadProfileId, string>

export type BuiltinDownloadProfileNameKey = (typeof BUILTIN_DOWNLOAD_PROFILE_NAME_KEYS)[BuiltinDownloadProfileId]

// The name a profile is shown under: the one the user typed, or a built-in's
// own name in the app language. Callers pass their own translator, so the
// renderer and main each look it up in the language they show.
export function downloadProfileName(profile: Pick<DownloadProfile, 'id' | 'name'>, translate: (key: BuiltinDownloadProfileNameKey) => string): string {
	if (profile.name !== undefined) return profile.name
	return isBuiltinDownloadProfileId(profile.id) ? translate(BUILTIN_DOWNLOAD_PROFILE_NAME_KEYS[profile.id]) : profile.id
}

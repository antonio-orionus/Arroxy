import type {BuiltinDownloadProfileId} from '@shared/schemas.js'

// Every English name each built-in shipped with, from the history of its
// catalog. Built-ins used to store their name, so an edited one saved it with
// its other settings; loading drops these, and the profile shows its own name
// in the app language again. A name not listed here is one the user typed.
// Frozen: built-ins no longer store a name, so a later rename needs no entry.
const SHIPPED_BUILTIN_PROFILE_NAMES: Record<BuiltinDownloadProfileId, readonly string[]> = {
	'best-quality': ['Best quality', 'Best available'],
	'best-2160': ['2160p', '4K UHD 2160p'],
	'best-1440': ['1440p', 'QHD 1440p'],
	'hd-1080': ['HD 1080p', 'Full HD 1080p'],
	balanced: ['Balanced', 'Balanced 720p'],
	'small-file': ['Small file', 'Small file 480p'],
	'mp4-1080': ['MP4 1080p', 'Smart TV MP4 Full HD', 'Smart TV MP4 Full HD 1080p', 'Smart TV H.264 MP4 1080p', 'Smart TV 1080p'],
	'mp4-720': ['Smart TV MP4 HD', 'Smart TV MP4 HD 720p', 'Smart TV H.264 MP4 720p', 'Smart TV 720p'],
	'mp4-480': ['Smart TV MP4 SD', 'Smart TV MP4 SD 480p', 'Smart TV H.264 MP4 480p', 'Smart TV 480p'],
	'audio-only': ['Audio only'],
	'subtitles-only': ['Subtitles only'],
	'low-240': ['Low data 240p'],
	'low-144': ['Lowest 144p']
}

export function isShippedBuiltinProfileName(id: BuiltinDownloadProfileId, name: string): boolean {
	return SHIPPED_BUILTIN_PROFILE_NAMES[id].includes(name)
}

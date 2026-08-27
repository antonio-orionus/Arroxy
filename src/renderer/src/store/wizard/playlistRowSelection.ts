import type {PlaylistEntry} from '@shared/types.js'

/**
 * Whether a row in the playlist picker may be selected for download.
 *
 * A probe result made entirely of playlists, channels or albums keeps those
 * rows so the picker isn't empty — but each addresses a whole set of videos,
 * and a queue item carries one filename bound before it runs. They stay
 * visible and inspectable; they just cannot be chosen.
 */
export function isSelectablePlaylistRow(entry: PlaylistEntry | undefined): boolean {
	return entry !== undefined && entry.isContainer !== true
}

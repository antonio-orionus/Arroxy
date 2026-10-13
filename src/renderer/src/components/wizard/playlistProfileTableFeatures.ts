// TanStack Table features for the playlist-profiles table. The table is a
// fixed-column, unsorted view of the playlist, so it needs only the core
// row model that every TanStack table gets without registration.

import {tableFeatures} from '@tanstack/react-table'

export const playlistProfileTableFeatures = tableFeatures({})

export type PlaylistProfileTableFeatures = typeof playlistProfileTableFeatures

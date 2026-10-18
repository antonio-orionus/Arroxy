// Columns for the playlist-profiles table: a selection checkbox (select-all in
// the header), title (thumbnail + title, mirrors StepPlaylistItems' row), the
// row's profile as a button that opens the shared profile menu, and duration.
//
// The definitions are static and the cells read live state from context.
// flexRender mounts each header and cell function as a component, so column
// definitions rebuilt on every selection change would remount every cell: a
// checkbox would lose focus as it is toggled, and an open menu its anchor.

import {createColumnHelper} from '@tanstack/react-table'
import type {PlaylistEntry} from '@shared/types.js'
import {ColumnHeader, DurationCell, ProfileCell, SelectAllHeader, SelectRowCell, TitleCell} from './PlaylistProfileCells.js'
import type {PlaylistProfileTableFeatures} from './playlistProfileTableFeatures.js'

const columnHelper = createColumnHelper<PlaylistProfileTableFeatures, PlaylistEntry>()

export const PLAYLIST_PROFILE_COLUMNS = columnHelper.columns([
	columnHelper.display({id: 'select', header: () => <SelectAllHeader />, cell: info => <SelectRowCell entry={info.row.original} />}),
	columnHelper.accessor('title', {header: () => <ColumnHeader labelKey="queue.table.title" />, cell: info => <TitleCell entry={info.row.original} />}),
	columnHelper.display({id: 'profile', header: () => <ColumnHeader labelKey="wizard.playlistProfiles.columnProfile" />, cell: info => <ProfileCell entry={info.row.original} />}),
	columnHelper.accessor('duration', {header: () => <ColumnHeader labelKey="wizard.playlistProfiles.columnDuration" />, cell: info => <DurationCell duration={info.getValue()} />})
])

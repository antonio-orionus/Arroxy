import {Clock, Disc3, ListVideo, Radio, ThumbsUp, Upload, type LucideIcon} from 'lucide-react'
import type {ListKind} from '@shared/schemas.js'

// What the controls on a link that names a video and a list call that list,
// per kind (spec §3.4). Every kind-dependent key is spelled out so the
// unused-key check sees each one.

// The list button: "Download playlist…", "Download Mix…".
export const DOWNLOAD_LIST_KEY = {playlist: 'wizard.url.downloadList.playlist', mix: 'wizard.url.downloadList.mix', album: 'wizard.url.downloadList.album', uploads: 'wizard.url.downloadList.uploads', 'watch-later': 'wizard.url.downloadList.watchLater', liked: 'wizard.url.downloadList.liked'} as const satisfies Record<
	ListKind,
	string
>

// The list dialog's title, also the list button's hint: "Download from this playlist".
export const LIST_TITLE_KEY = {playlist: 'wizard.listPrompt.title.playlist', mix: 'wizard.listPrompt.title.mix', album: 'wizard.listPrompt.title.album', uploads: 'wizard.listPrompt.title.uploads', 'watch-later': 'wizard.listPrompt.title.watchLater', liked: 'wizard.listPrompt.title.liked'} as const satisfies Record<
	ListKind,
	string
>

export const LIST_KIND_ICONS: Record<ListKind, LucideIcon> = {playlist: ListVideo, mix: Radio, album: Disc3, uploads: Upload, 'watch-later': Clock, liked: ThumbsUp}

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {X} from 'lucide-react'
import type {ListKind} from '@shared/schemas.js'
import type {QueueItem} from '@shared/types.js'
import {listKindForUrl} from '@shared/sites/youtubeListKind.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {TableCell, TableRow} from '../ui/table.js'
import {Hint} from '../shared/Hint.js'
import {LIST_KIND_ICONS} from '../wizard/listKindCopy.js'

// The list offer (spec §3.6): a video the hotkey took from a link that also
// names a list says so under its title and offers the list. Taking the list
// is optional, so it is a quiet line that reads as part of the row, never an
// alert, and nothing loads until it is taken.

const FROM_LIST_KEY = {playlist: 'queue.listOffer.from.playlist', mix: 'queue.listOffer.from.mix', album: 'queue.listOffer.from.album', uploads: 'queue.listOffer.from.uploads', 'watch-later': 'queue.listOffer.from.watchLater', liked: 'queue.listOffer.from.liked'} as const satisfies Record<ListKind, string>

const GET_LIST_KEY = {playlist: 'queue.listOffer.get.playlist', mix: 'queue.listOffer.get.mix', album: 'queue.listOffer.get.album', uploads: 'queue.listOffer.get.uploads', 'watch-later': 'queue.listOffer.get.watchLater', liked: 'queue.listOffer.get.liked'} as const satisfies Record<ListKind, string>

export function QueueListOfferRow({columnsLength, item}: {columnsLength: number; item: QueueItem}): ReactNode {
	const {t} = useTranslation()
	const takeListOffer = useAppStore(state => state.takeListOffer)
	const dismissListOffer = useAppStore(state => state.dismissListOffer)
	if (!item.listOffer) return null
	const kind = listKindForUrl(item.listOffer) ?? 'playlist'
	const Icon = LIST_KIND_ICONS[kind]
	return (
		<TableRow data-testid={`queue-list-offer-row-${item.id}`} className="queue-row-continuation hover:bg-transparent">
			<TableCell colSpan={columnsLength} className="min-w-0 overflow-hidden whitespace-normal px-3 pt-0 pb-2">
				<div className="ms-13 flex min-w-0 items-center gap-1.5">
					<span className="flex min-w-0 items-center gap-1 text-caption text-subtle-foreground">
						<Icon aria-hidden className="size-3.5 shrink-0" />
						<span className="truncate">{t(FROM_LIST_KEY[kind])}</span>
					</span>
					<Hint label={t('queue.listOffer.hint')}>
						<Button
							type="button"
							variant="link"
							size="xs"
							className="h-5 px-0 text-caption"
							onClick={event => {
								event.stopPropagation()
								void takeListOffer(item.id)
							}}
							data-testid={`queue-list-offer-${item.id}`}
						>
							{t(GET_LIST_KEY[kind])}
						</Button>
					</Hint>
					<Hint label={t('queue.listOffer.dismiss')}>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							aria-label={t('queue.listOffer.dismiss')}
							onClick={event => {
								event.stopPropagation()
								void dismissListOffer(item.id)
							}}
							data-testid={`queue-list-offer-dismiss-${item.id}`}
						>
							<X aria-hidden />
						</Button>
					</Hint>
				</div>
			</TableCell>
		</TableRow>
	)
}

import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ListChecks, Play} from 'lucide-react'
import type {QueueItem} from '@shared/types.js'
import {QUEUE_STATUS, type ListKind} from '@shared/schemas.js'
import {formatLocalizedError, useAppStore} from '../../store/useAppStore.js'
import {placeholderErrorExperience, rowProbeError} from '../../store/quickDownload/quickDownloadToasts.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {TableCell, TableRow} from '../ui/table.js'
import {QuickDownloadErrorAlert} from '../wizard/QuickDownloadErrorAlert.js'
import {CookiesGuidanceAlert} from '../wizard/format/CookiesErrorAlert.js'
import {buildProbeErrorExperience} from '../../store/wizard/probeErrorExperience.js'
import {isProbeErrorRow} from './queueAttention.js'

// The detail line under a row only the user can move on (P2-R38): a failed
// preparation carries the probe error alert's guidance, an open choice its answers.
export function QueueAttentionRow({columnsLength, item}: {columnsLength: number; item: QueueItem}): ReactNode {
	return (
		<TableRow data-testid={`queue-attention-${item.id}`} className="bg-muted/20 hover:bg-muted/20">
			<TableCell colSpan={columnsLength} className="min-w-0 overflow-hidden whitespace-normal px-3 py-2">
				<div className="ms-8 min-w-0 max-w-3xl sm:ms-11">{isProbeErrorRow(item) ? <ProbeErrorGuidance item={item} /> : <ChoiceAnswers item={item} />}</div>
			</TableCell>
		</TableRow>
	)
}

// A download that failed for want of an account, under the off cookie mode
// with Explore on: the same Explore offer as a failed preparation, alone (the
// row's own Retry already downloads again). The explore mode escalates
// downloads by itself, so it gets nothing here, unless the escalated job
// still failed: then the row says the site refused it signed in.
export function DownloadErrorGuidanceRow({columnsLength, item}: {columnsLength: number; item: QueueItem}): ReactNode {
	const commonSettings = useAppStore(state => state.settings?.common)
	const exploreSignedIn = useAppStore(state => state.exploreView?.signedIn ?? null)
	const {openCookiesSettings, openExploreSignIn, signInWithExploreThenRetry, retryWithExploreSignIn, retryDownloadWithCookies} = useAppStore.getState()
	const experience = buildProbeErrorExperience({error: rowProbeError(item.error, item.auth), url: item.url, commonSettings, exploreSignedIn, stage: 'download'})
	if (!experience.actions.signInWithExploreThenRetry && !experience.actions.retryWithExploreSignIn && experience.cookies.variant !== 'explore-refused') return null
	const target = {kind: 'download', itemId: item.id} as const
	return (
		<TableRow data-testid={`queue-attention-${item.id}`} className="bg-muted/20 hover:bg-muted/20">
			<TableCell colSpan={columnsLength} className="min-w-0 overflow-hidden whitespace-normal px-3 py-2">
				<div className="ms-8 min-w-0 max-w-3xl sm:ms-11">
					<CookiesGuidanceAlert
						guidance={experience.cookies}
						density="compact"
						onOpenSettings={openCookiesSettings}
						onSignInWithExplore={openExploreSignIn}
						onSignInWithExploreThenRetry={site => void signInWithExploreThenRetry(target, site)}
						onRetryWithExploreSignIn={() => void retryWithExploreSignIn(target)}
						onEnableCookiesAndRetry={() => void retryDownloadWithCookies(item.id)}
						openSettingsTestId="queue-download-cookies-settings"
					/>
				</div>
			</TableCell>
		</TableRow>
	)
}

function ProbeErrorGuidance({item}: {item: QueueItem}): ReactNode {
	const commonSettings = useAppStore(state => state.settings?.common)
	const exploreSignedIn = useAppStore(state => state.exploreView?.signedIn ?? null)
	const {retryQuickDownloadRow, retryQuickDownloadRowWithCookies, openCookiesSettings, openExploreSignIn, signInWithExploreThenRetry, retryWithExploreSignIn} = useAppStore.getState()
	const experience = placeholderErrorExperience(rowProbeError(item.error, item.auth), item.url, commonSettings, exploreSignedIn)
	return (
		<QuickDownloadErrorAlert
			experience={experience}
			message={formatLocalizedError(item.error)}
			url={item.url}
			onRetry={() => void retryQuickDownloadRow(item.id)}
			onEnableCookiesAndRetry={() => void retryQuickDownloadRowWithCookies(item.id)}
			onOpenCookiesSettings={openCookiesSettings}
			onSignInWithExplore={openExploreSignIn}
			onSignInWithExploreThenRetry={site => void signInWithExploreThenRetry({kind: 'row', itemId: item.id}, site)}
			onRetryWithExploreSignIn={() => void retryWithExploreSignIn({kind: 'row', itemId: item.id})}
		/>
	)
}

// The size question's body, by whether the list went past the load limit.
const CHOICE_BODY = {capped: 'queue.choice.cappedBody', uncapped: 'queue.choice.uncappedBody'} as const satisfies Record<'capped' | 'uncapped', string>

// The video-or-list question and its list answer, per kind of list (#581),
// spelled out so the unused-key check sees each.
const VIDEO_OR_LIST_BODY = {playlist: 'queue.choice.videoOrList.playlist', mix: 'queue.choice.videoOrList.mix', album: 'queue.choice.videoOrList.album', uploads: 'queue.choice.videoOrList.uploads', 'watch-later': 'queue.choice.videoOrList.watchLater', liked: 'queue.choice.videoOrList.liked'} as const satisfies Record<
	ListKind,
	string
>
const LIST_ANSWER = {playlist: 'queue.choice.list.playlist', mix: 'queue.choice.list.mix', album: 'queue.choice.list.album', uploads: 'queue.choice.list.uploads', 'watch-later': 'queue.choice.list.watchLater', liked: 'queue.choice.list.liked'} as const satisfies Record<ListKind, string>

function ChoiceAnswers({item}: {item: QueueItem}): ReactNode {
	const choice = item.status === QUEUE_STATUS.needsChoice ? item.choice : undefined
	if (choice?.kind === 'list-size') return <ListSizeAnswers itemId={item.id} loaded={choice.loaded} capped={choice.capped} />
	if (choice?.kind === 'video-or-list') return <VideoOrListAnswers itemId={item.id} list={choice.list} />
	return null
}

// A Bulk URLs link naming a video and a list, asked before anything loads:
// the video alone, the list in the background, or Pick from it (the Review).
function VideoOrListAnswers({itemId, list}: {itemId: string; list: ListKind}): ReactNode {
	const {t} = useTranslation()
	const choose = useAppStore(state => state.chooseQuickDownloadRow)
	return (
		<Alert variant="info" size="sm" data-testid="queue-choice">
			<ListChecks aria-hidden />
			<AlertDescription className="flex flex-col gap-2">
				<span>{t(VIDEO_OR_LIST_BODY[list])}</span>
				<div className="flex flex-wrap gap-2">
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'video')} data-testid="queue-choice-video">
						<Play data-icon="inline-start" aria-hidden />
						{t('queue.choice.video')}
					</Button>
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'list')} data-testid="queue-choice-list">
						{t(LIST_ANSWER[list])}
					</Button>
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'review')} data-testid="queue-choice-pick">
						{t('queue.choice.pick')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	)
}

// All and Review always; First N only when the list went past the load limit.
function ListSizeAnswers({itemId, loaded, capped}: {itemId: string; loaded: number; capped: boolean}): ReactNode {
	const {t} = useTranslation()
	const choose = useAppStore(state => state.chooseQuickDownloadRow)
	const count = loaded
	return (
		<Alert variant="info" size="sm" data-testid="queue-choice">
			<ListChecks aria-hidden />
			<AlertDescription className="flex flex-col gap-2">
				<span>{t(CHOICE_BODY[capped ? 'capped' : 'uncapped'], {count})}</span>
				<div className="flex flex-wrap gap-2">
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'all')} data-testid="queue-choice-all">
						{t('queue.choice.all')}
					</Button>
					{capped ? (
						<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'first')} data-testid="queue-choice-first">
							{t('queue.choice.first', {count})}
						</Button>
					) : null}
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(itemId, 'review')} data-testid="queue-choice-review">
						{t('queue.choice.review')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	)
}

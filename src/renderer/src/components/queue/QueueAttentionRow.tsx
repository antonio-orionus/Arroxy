import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ListChecks} from 'lucide-react'
import type {QueueItem} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {formatLocalizedError, useAppStore} from '../../store/useAppStore.js'
import {placeholderErrorExperience, rowProbeError} from '../../store/quickDownload/quickDownloadToasts.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {TableCell, TableRow} from '../ui/table.js'
import {QuickDownloadErrorAlert} from '../wizard/QuickDownloadErrorAlert.js'
import {CookiesGuidanceAlert} from '../wizard/format/CookiesErrorAlert.js'
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
// downloads by itself, so it gets nothing here.
export function DownloadErrorGuidanceRow({columnsLength, item}: {columnsLength: number; item: QueueItem}): ReactNode {
	const commonSettings = useAppStore(state => state.settings?.common)
	const exploreSignedIn = useAppStore(state => state.exploreView?.signedIn ?? null)
	const {openCookiesSettings, openExploreSignIn, signInWithExploreThenRetry, retryWithExploreSignIn, retryDownloadWithCookies} = useAppStore.getState()
	const experience = placeholderErrorExperience(rowProbeError(item.error), item.url, commonSettings, exploreSignedIn)
	if (!experience.actions.signInWithExploreThenRetry && !experience.actions.retryWithExploreSignIn) return null
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
	const experience = placeholderErrorExperience(rowProbeError(item.error), item.url, commonSettings, exploreSignedIn)
	return (
		<QuickDownloadErrorAlert
			experience={experience}
			message={{kind: 'text', text: formatLocalizedError(item.error)}}
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

function ChoiceAnswers({item}: {item: QueueItem}): ReactNode {
	const {t} = useTranslation()
	const choose = useAppStore(state => state.chooseQuickDownloadRow)
	const choice = item.status === QUEUE_STATUS.needsChoice ? item.choice : undefined
	if (!choice) return null
	const capped = choice.kind === 'playlist-cap'
	const count = capped ? choice.loaded : choice.count
	return (
		<Alert variant="info" size="sm" data-testid="queue-choice">
			<ListChecks aria-hidden />
			<AlertDescription className="flex flex-col gap-2">
				<span>{capped ? t('queue.choice.cappedBody', {count}) : t('queue.choice.reviewBody', {count})}</span>
				<div className="flex flex-wrap gap-2">
					{capped ? (
						<>
							<Button type="button" size="sm" variant="outline" onClick={() => void choose(item.id, 'all')} data-testid="queue-choice-all">
								{t('queue.choice.all')}
							</Button>
							<Button type="button" size="sm" variant="outline" onClick={() => void choose(item.id, 'first')} data-testid="queue-choice-first">
								{t('queue.choice.first', {count})}
							</Button>
						</>
					) : null}
					<Button type="button" size="sm" variant="outline" onClick={() => void choose(item.id, 'review')} data-testid="queue-choice-review">
						{t('queue.choice.review')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	)
}

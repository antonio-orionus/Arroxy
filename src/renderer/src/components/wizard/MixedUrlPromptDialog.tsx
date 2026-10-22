import {useRef, useState, type ReactNode, type RefObject} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {Gauge, ListChecks, ListStart, ListVideo, Play, type LucideIcon} from 'lucide-react'
import type {ListKind} from '@shared/schemas.js'
import {listKindForUrl} from '@shared/sites/youtubeListKind.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {Badge} from '../ui/badge.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Button} from '../ui/button.js'
import {Item, ItemGroup} from '../ui/item.js'
import {Kbd} from '../ui/kbd.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useProfileDisplayName} from '../../lib/profileName.js'
import {Hint} from '../shared/Hint.js'
import {IconTile} from '../shared/IconTile.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'
import {LIST_TITLE_KEY} from './listKindCopy.js'

// Every kind-dependent string, spelled out so the unused-key check sees each one.
const PICK_TITLE_KEYS = {
	playlist: 'wizard.listPrompt.pickTitle.playlist',
	mix: 'wizard.listPrompt.pickTitle.mix',
	album: 'wizard.listPrompt.pickTitle.album',
	uploads: 'wizard.listPrompt.pickTitle.uploads',
	'watch-later': 'wizard.listPrompt.pickTitle.watchLater',
	liked: 'wizard.listPrompt.pickTitle.liked'
} as const satisfies Record<ListKind, string>

const OPTION_CLASS = 'h-auto min-w-0 flex-1 justify-start gap-3 px-2 py-2 text-start whitespace-normal'

// One answer: an icon, its name, and what it does in the hint.
function Option({icon: Icon, label, hint, enter, disabled, buttonRef, onChoose, testId}: {icon: LucideIcon; label: ReactNode; hint: string; enter: boolean; disabled: boolean; buttonRef?: RefObject<HTMLButtonElement | null>; onChoose: () => void; testId: string}): ReactNode {
	return (
		<Item variant="outline" size="sm" className="p-1">
			<Hint label={hint}>
				<Button ref={buttonRef} type="button" variant="ghost" disabled={disabled} focusableWhenDisabled aria-description={hint} className={OPTION_CLASS} onClick={onChoose} data-testid={testId}>
					<IconTile size="sm">
						<Icon aria-hidden />
					</IconTile>
					<span className="flex min-w-0 flex-1 items-center gap-2 text-title">{label}</span>
					{enter ? <Kbd aria-hidden>Enter</Kbd> : null}
				</Button>
			</Hint>
		</Item>
	)
}

// The one number every answer reads: the playlist load limit, with what it does in its hint.
function LimitControl({onSavingChange}: {onSavingChange: (saving: boolean) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<Hint label={t('wizard.listPrompt.limitHint')}>
			<span className="flex items-center gap-2 text-caption text-subtle-foreground" data-testid="mixed-limit">
				<Gauge className="size-4" aria-hidden />
				{t('wizard.listPrompt.limitLabel')}
				<PlaylistProbeLimitSelector testId="mixed-playlist-probe-limit" showCurrent={false} onSavingChange={onSavingChange} />
			</span>
		</Hint>
	)
}

// A YouTube link naming a video and a list (?v=X&list=Y) could mean either. The
// store opens this before loading anything, from the list's button (This video
// sits beside it). From the list button: Just this video, kept for people used
// to the old dialog; the list in the background, its row asking past the limit;
// exactly the first N; or Interactive's picker. From Interactive it confirms how
// many to load for the picker, or sets up the video alone. One number, the
// playlist load limit, sets N.
export function MixedUrlPromptDialog(): ReactNode {
	const {t} = useTranslation()
	const profileNameOf = useProfileDisplayName()
	const {mixedUrlPromptOpen, mixedUrlPending, mixedUrlPromptSource, cancelMixedPrompt, dismissMixedPrompt, settings} = useAppStore(
		useShallow(state => ({mixedUrlPromptOpen: state.mixedUrlPromptOpen, mixedUrlPending: state.mixedUrlPending, mixedUrlPromptSource: state.mixedUrlPromptSource, cancelMixedPrompt: state.cancelMixedPrompt, dismissMixedPrompt: state.dismissMixedPrompt, settings: state.settings}))
	)
	const focusRef = useRef<HTMLButtonElement>(null)
	const [limitSaving, setLimitSaving] = useState(false)
	// The store clears the link and source the moment an answer is given, before
	// the exit animation ends. Keep the last real ones for what is still on screen.
	const [shown, setShown] = useState({url: mixedUrlPending, source: mixedUrlPromptSource})
	if (mixedUrlPending && (shown.url !== mixedUrlPending || shown.source !== mixedUrlPromptSource)) setShown({url: mixedUrlPending, source: mixedUrlPromptSource})
	const kind = (shown.url ? listKindForUrl(shown.url) : null) ?? 'playlist'
	const isQuick = shown.source === 'url-tab' || shown.source === 'explore'
	const profileName = profileNameOf(resolveActiveDownloadProfile(settings?.profiles).profile)
	const count = resolvePlaylistProbeLimit(settings?.common)

	return (
		<Dialog open={mixedUrlPromptOpen} onOpenChange={open => !open && cancelMixedPrompt()}>
			<DialogContent className="sm:max-w-md" initialFocus={focusRef}>
				<DialogHeader className="gap-1 pe-8">
					<DialogTitle data-testid="mixed-prompt-title">{t(isQuick ? LIST_TITLE_KEY[kind] : PICK_TITLE_KEYS[kind])}</DialogTitle>
					{kind === 'mix' ? <DialogDescription data-testid="mixed-prompt-mix-note">{t('wizard.listPrompt.mixNote')}</DialogDescription> : null}
				</DialogHeader>
				{isQuick ? (
					<>
						<ItemGroup className="gap-2">
							<Option icon={Play} label={t('wizard.listPrompt.videoLabel')} hint={t('wizard.listPrompt.videoHint', {profileName})} enter={false} disabled={limitSaving} onChoose={() => void dismissMixedPrompt({kind: 'video'})} testId="mixed-video-choice" />
							<Option icon={ListVideo} label={t('wizard.listPrompt.backgroundLabel')} hint={t('wizard.listPrompt.backgroundHint', {profileName, count})} enter buttonRef={focusRef} disabled={limitSaving} onChoose={() => void dismissMixedPrompt({kind: 'list'})} testId="mixed-list-choice" />
							<Option
								icon={ListStart}
								label={
									<>
										{t('wizard.listPrompt.firstLabel')}
										<Badge variant="secondary" data-testid="mixed-first-count">
											{count}
										</Badge>
									</>
								}
								hint={t('wizard.listPrompt.firstHint', {profileName, count})}
								enter={false}
								disabled={limitSaving}
								onChoose={() => void dismissMixedPrompt({kind: 'first', count})}
								testId="mixed-first-choice"
							/>
							<Option icon={ListChecks} label={t('wizard.listPrompt.interactiveLabel')} hint={t('wizard.listPrompt.interactiveHint', {count})} enter={false} disabled={limitSaving} onChoose={() => void dismissMixedPrompt({kind: 'pick'})} testId="mixed-pick-choice" />
						</ItemGroup>
						<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
							<LimitControl onSavingChange={setLimitSaving} />
							<p className="text-caption text-subtle-foreground">{t('wizard.listPrompt.escOnly')}</p>
						</div>
					</>
				) : (
					// Interactive already means "pick": it only confirms how many to load.
					<>
						<div className="flex flex-col gap-1.5">
							<p className="flex flex-wrap items-center gap-2 text-body">
								{t('wizard.listPrompt.pickLoadBefore')}
								<PlaylistProbeLimitSelector testId="mixed-playlist-probe-limit" showCurrent={false} onSavingChange={setLimitSaving} />
								{t('wizard.listPrompt.pickLoadAfter')}
							</p>
							<p className="text-caption text-subtle-foreground">{t('wizard.listPrompt.pickLoadNote')}</p>
						</div>
						<DialogFooter className="flex-row justify-end">
							<Hint label={t('wizard.listPrompt.videoPickHint')}>
								<Button type="button" variant="outline" className="me-auto" aria-description={t('wizard.listPrompt.videoPickHint')} onClick={() => void dismissMixedPrompt({kind: 'video'})} data-testid="mixed-video-choice">
									<Play data-icon="inline-start" aria-hidden />
									{t('wizard.listPrompt.videoLabel')}
								</Button>
							</Hint>
							<Button type="button" variant="outline" onClick={cancelMixedPrompt} data-testid="mixed-pick-cancel">
								{t('common.cancel')}
							</Button>
							<Button ref={focusRef} type="button" disabled={limitSaving} focusableWhenDisabled onClick={() => void dismissMixedPrompt({kind: 'pick'})} data-testid="mixed-pick-continue">
								{t('common.continue')}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

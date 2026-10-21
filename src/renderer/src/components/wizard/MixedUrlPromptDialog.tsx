import {useRef, useState, type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import type {ListKind} from '@shared/schemas.js'
import {listKindForUrl} from '@shared/sites/youtubeListKind.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Button} from '../ui/button.js'
import {Item, ItemActions, ItemGroup} from '../ui/item.js'
import {Kbd} from '../ui/kbd.js'
import {useAppStore} from '../../store/useAppStore.js'
import {useProfileDisplayName} from '../../lib/profileName.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'

// Every kind-dependent string, spelled out so the unused-key check sees each one.
const TITLE_KEYS = {playlist: 'wizard.listPrompt.title.playlist', mix: 'wizard.listPrompt.title.mix', album: 'wizard.listPrompt.title.album', uploads: 'wizard.listPrompt.title.uploads', 'watch-later': 'wizard.listPrompt.title.watchLater', liked: 'wizard.listPrompt.title.liked'} as const satisfies Record<
	ListKind,
	string
>

const LIST_OPTION_KEYS = {
	playlist: 'wizard.listPrompt.listOption.playlist',
	mix: 'wizard.listPrompt.listOption.mix',
	album: 'wizard.listPrompt.listOption.album',
	uploads: 'wizard.listPrompt.listOption.uploads',
	'watch-later': 'wizard.listPrompt.listOption.watchLater',
	liked: 'wizard.listPrompt.listOption.liked'
} as const satisfies Record<ListKind, string>

const PICK_OPTION_KEYS = {
	playlist: 'wizard.listPrompt.pickOption.playlist',
	mix: 'wizard.listPrompt.pickOption.mix',
	album: 'wizard.listPrompt.pickOption.album',
	uploads: 'wizard.listPrompt.pickOption.uploads',
	'watch-later': 'wizard.listPrompt.pickOption.watchLater',
	liked: 'wizard.listPrompt.pickOption.liked'
} as const satisfies Record<ListKind, string>

// An option's label and what it does. Spans, since it sits inside a button.
function OptionText({label, hint}: {label: string; hint: string}): ReactNode {
	return (
		<span className="flex min-w-0 flex-1 flex-col gap-0.5">
			<span>{label}</span>
			<span className="text-caption font-normal text-subtle-foreground">{hint}</span>
		</span>
	)
}

// A YouTube link naming a video and a list (?v=X&list=Y) could mean either. The
// store opens this before loading anything; it asks only what to take, the
// video or the first N of the list, N being the load limit the selector edits.
// A quick download already knows how (the active profile); Interactive goes on
// to the formats or the playlist picker.
export function MixedUrlPromptDialog(): ReactNode {
	const {t} = useTranslation()
	const profileName = useProfileDisplayName()
	const {mixedUrlPromptOpen, mixedUrlPending, mixedUrlPromptSource, cancelMixedPrompt, dismissMixedPrompt, settings} = useAppStore(
		useShallow(state => ({mixedUrlPromptOpen: state.mixedUrlPromptOpen, mixedUrlPending: state.mixedUrlPending, mixedUrlPromptSource: state.mixedUrlPromptSource, cancelMixedPrompt: state.cancelMixedPrompt, dismissMixedPrompt: state.dismissMixedPrompt, settings: state.settings}))
	)
	const singleButtonRef = useRef<HTMLButtonElement>(null)
	const [limitSaving, setLimitSaving] = useState(false)
	const kind = (mixedUrlPending ? listKindForUrl(mixedUrlPending) : null) ?? 'playlist'
	const isQuick = mixedUrlPromptSource === 'url-tab' || mixedUrlPromptSource === 'explore'
	const count = resolvePlaylistProbeLimit(settings?.common)

	return (
		<Dialog open={mixedUrlPromptOpen} onOpenChange={open => !open && cancelMixedPrompt()}>
			<DialogContent className="sm:max-w-md" initialFocus={singleButtonRef}>
				<DialogHeader className="gap-1 pe-8">
					<DialogTitle data-testid="mixed-prompt-title">{t(TITLE_KEYS[kind])}</DialogTitle>
					<DialogDescription data-testid="mixed-prompt-subtitle">{isQuick ? t('wizard.listPrompt.withProfile', {profileName: profileName(resolveActiveDownloadProfile(settings?.profiles).profile)}) : t('wizard.listPrompt.interactiveSubtitle')}</DialogDescription>
					{kind === 'mix' && <p className="text-caption text-subtle-foreground">{t('wizard.listPrompt.mixNote')}</p>}
				</DialogHeader>
				<ItemGroup className="gap-2">
					<Item variant="outline" size="sm" className="p-1">
						<Button ref={singleButtonRef} type="button" variant="ghost" className="h-auto min-w-0 flex-1 justify-start gap-2.5 px-2 py-1.5 text-start whitespace-normal" onClick={() => void dismissMixedPrompt('video')} data-testid="mixed-single-choice">
							<OptionText label={t('wizard.listPrompt.justThisVideo')} hint={t(isQuick ? 'wizard.listPrompt.justThisVideoQuickHint' : 'wizard.listPrompt.justThisVideoInteractiveHint')} />
							<Kbd aria-hidden>Enter</Kbd>
						</Button>
					</Item>
					<Item variant="outline" size="sm" className="p-1 pe-2">
						<Button type="button" variant="ghost" disabled={limitSaving} className="h-auto min-w-0 flex-1 justify-start px-2 py-1.5 text-start whitespace-normal" onClick={() => void dismissMixedPrompt('playlist')} data-testid="mixed-playlist-choice">
							<OptionText label={t(isQuick ? LIST_OPTION_KEYS[kind] : PICK_OPTION_KEYS[kind])} hint={t(isQuick ? 'wizard.listPrompt.listQuickHint' : 'wizard.listPrompt.listInteractiveHint', {count})} />
						</Button>
						<ItemActions>
							<PlaylistProbeLimitSelector testId="mixed-playlist-probe-limit" showCurrent={false} onSavingChange={setLimitSaving} />
						</ItemActions>
					</Item>
				</ItemGroup>
				<p className="text-caption text-subtle-foreground">{t('wizard.listPrompt.escHint')}</p>
			</DialogContent>
		</Dialog>
	)
}

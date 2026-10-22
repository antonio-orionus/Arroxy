import type {ReactElement, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {downloadProfileRefFor, enabledDownloadProfiles, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import type {ListKind} from '@shared/schemas.js'
import type {DownloadProfileRef} from '@shared/types.js'
import {videoListKind} from '@shared/urlIntent.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {useAppStore} from '../store/useAppStore.js'
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger} from '../components/ui/context-menu.js'
import {emitMockLinkAction} from './exploreMock.js'

const FROM_LIST_KEY = {playlist: 'explore.linkMenu.fromList.playlist', mix: 'explore.linkMenu.fromList.mix', album: 'explore.linkMenu.fromList.album', uploads: 'explore.linkMenu.fromList.uploads', 'watch-later': 'explore.linkMenu.fromList.watchLater', liked: 'explore.linkMenu.fromList.liked'} as const satisfies Record<
	ListKind,
	string
>

// browser-mock stand-in for Explore's native link menu (built in main), with the
// same items in the same order, so its design can be tried in a browser. Its picks
// go through the renderer's real link-action handler.
export function ExploreMockLinkMenu({url, children}: {url: string; children: ReactElement}): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const prefs = useAppStore(state => state.settings?.profiles)
	const limit = resolvePlaylistProbeLimit(useAppStore(state => state.settings?.common))
	const active = resolveActiveDownloadProfile(prefs)
	const profileName = nameOf(active.profile)
	const listKind = videoListKind(url)
	const grabbable = isExploreGrabbable(url)
	const activeValue = `${active.ref.kind}:${active.ref.id}`
	const refFor = (value: string): DownloadProfileRef | undefined =>
		enabledDownloadProfiles(prefs)
			.map(profile => downloadProfileRefFor(profile, prefs))
			.find(ref => `${ref.kind}:${ref.id}` === value)
	const pick = (value: string): void => {
		const profile = refFor(value)
		if (profile) emitMockLinkAction({kind: listKind ? 'download-video' : 'download', url, profile})
	}
	return (
		<ContextMenu>
			<ContextMenuTrigger render={children} />
			<ContextMenuContent className="min-w-64">
				{grabbable ? (
					<>
						{listKind ? (
							<>
								<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'download-video', url})}>{t('explore.linkMenu.downloadThisVideo', {profileName})}</ContextMenuItem>
							</>
						) : (
							<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'download', url})}>{t('explore.toolbar.downloadWithProfile', {profileName})}</ContextMenuItem>
						)}
						<ContextMenuSub>
							<ContextMenuSubTrigger>{listKind ? t('explore.linkMenu.thisVideoWith') : t('explore.linkMenu.downloadWith')}</ContextMenuSubTrigger>
							<ContextMenuSubContent>
								<ContextMenuRadioGroup value={activeValue} onValueChange={value => pick(String(value))}>
									{enabledDownloadProfiles(prefs).map(profile => {
										const ref = downloadProfileRefFor(profile, prefs)
										const value = `${ref.kind}:${ref.id}`
										return (
											<ContextMenuRadioItem key={value} value={value}>
												{nameOf(profile)}
											</ContextMenuRadioItem>
										)
									})}
								</ContextMenuRadioGroup>
							</ContextMenuSubContent>
						</ContextMenuSub>
						{/* This video's two items, then the list's: grouped by what they take. */}
						{listKind ? (
							<>
								<ContextMenuSeparator />
								<ContextMenuSub>
									<ContextMenuSubTrigger>{t(FROM_LIST_KEY[listKind])}</ContextMenuSubTrigger>
									<ContextMenuSubContent>
										<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'list', url, answer: 'background'})}>{t('wizard.listPrompt.backgroundLabel')}</ContextMenuItem>
										<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'list', url, answer: 'first'})}>{t('explore.linkMenu.downloadFirst', {count: limit})}</ContextMenuItem>
										<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'list', url, answer: 'pick'})}>{t('wizard.listPrompt.interactiveLabel')}</ContextMenuItem>
									</ContextMenuSubContent>
								</ContextMenuSub>
							</>
						) : null}
						{/* On a video-in-a-list link Interactive is the list's picker: it sits in that submenu only. */}
						{listKind ? null : (
							<>
								<ContextMenuSeparator />
								<ContextMenuItem onClick={() => emitMockLinkAction({kind: 'interactive', url})}>{t('explore.linkMenu.interactive')}</ContextMenuItem>
							</>
						)}
						<ContextMenuSeparator />
					</>
				) : null}
				<ContextMenuItem onClick={() => void navigator.clipboard?.writeText(url)}>{t('explore.linkMenu.copyLink')}</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

import {useEffect} from 'react'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import type {ExploreLinkAction} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import type {MixedPromptAnswer} from '../../store/types.js'

// Interactive works off `wizardUrl`, set just before; the run starts in
// Explore, so the wizard lands back here.
export function openExploreInteractive(url: string): void {
	const {setWizardUrl, submitUrl} = useAppStore.getState()
	setWizardUrl(url)
	void submitUrl('explore')
}

// A list answer picked straight from the menu, as the list dialog would give it.
// The first N is the load limit as it is now: the menu only named it.
function listAnswer(answer: Extract<ExploreLinkAction, {kind: 'list'}>['answer']): MixedPromptAnswer {
	switch (answer) {
		case 'background':
			return {kind: 'list'}
		case 'first':
			return {kind: 'first', count: resolvePlaylistProbeLimit(useAppStore.getState().settings?.common)}
	}
}

// A link menu pick runs as the bar's controls would for that link. The link
// came from a web page: only one the bar could take goes through.
async function runLinkAction(action: ExploreLinkAction): Promise<void> {
	if (!isExploreGrabbable(action.url)) return
	// Using the menu is having found it.
	const {settings, dismissExploreLinkCallout} = useAppStore.getState()
	if (settings?.common.exploreLinkCalloutDismissed !== true) void dismissExploreLinkCallout()
	switch (action.kind) {
		case 'interactive':
			openExploreInteractive(action.url)
			return
		case 'list':
			await useAppStore.getState().answerVideoListLink(action.url, 'explore', listAnswer(action.answer))
			return
		case 'download':
		case 'download-video':
			// A profile pick is the bar's pick: it becomes the active profile, then the
			// link is queued with it. A failed save queues nothing: the old profile is not what was picked.
			if (action.profile && !(await useAppStore.getState().setActiveDownloadProfile(action.profile))) return
			await useAppStore.getState().quickDownload({url: action.url, entry: 'explore', ...(action.kind === 'download-video' ? {playlistMode: 'video' as const} : {})})
	}
}

// Picks are run only while the Explore tab is mounted: the page, and so its
// menu, shows only then, and a pick that lands after the tab was left is dropped.
export function useExploreLinkActions(): void {
	useEffect(() => window.appApi.explore.onLinkAction(action => void runLinkAction(action)), [])
}

import {useEffect} from 'react'
import {isExploreGrabbable} from '@shared/exploreGrab.js'
import type {ExploreLinkAction} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'

// Interactive works off `wizardUrl`, set just before; the run starts in
// Explore, so the wizard lands back here.
export function openExploreInteractive(url: string): void {
	const {setWizardUrl, submitUrl} = useAppStore.getState()
	setWizardUrl(url)
	void submitUrl('explore')
}

// A link menu pick runs as the bar's controls would for that link. The link
// came from a web page: only one the bar could take goes through.
async function runLinkAction(action: ExploreLinkAction): Promise<void> {
	if (!isExploreGrabbable(action.url)) return
	switch (action.kind) {
		case 'interactive':
			openExploreInteractive(action.url)
			return
		case 'download':
			// A profile pick is the bar's pick: it becomes the active profile, then the link is queued with it.
			if (action.profile) await useAppStore.getState().setActiveDownloadProfile(action.profile)
			await useAppStore.getState().quickDownload({url: action.url, entry: 'explore'})
	}
}

// Picks are run only while the Explore tab is mounted: the page, and so its
// menu, shows only then, and a pick that lands after the tab was left is dropped.
export function useExploreLinkActions(): void {
	useEffect(() => window.appApi.explore.onLinkAction(action => void runLinkAction(action)), [])
}

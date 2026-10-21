import i18next from 'i18next'
import {classifyClipboardText, singleWebLink} from '@shared/clipboardLinks.js'
import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import {notify} from '@renderer/lib/notify.js'
import type {SetState} from '../types.js'

// The renderer's end of the clipboard watcher, bound for the app's lifetime so
// no copy is lost while the URL step is not shown. A single link becomes the
// copied link, which the Download tab takes once it is idle; several links
// only hint at Bulk URLs and drop any link still waiting, since the newest
// copy wins. The payload is re-checked here: it crossed IPC.
export function bindCopiedLinks(set: SetState): () => void {
	return window.appApi.events.onClipboardUrl(payload => {
		const links = classifyClipboardText(payload)
		if (links.kind === 'none') return
		if (links.kind === 'single') {
			set({copiedLink: {url: links.url, from: 'clipboard'}})
			return
		}
		set({copiedLink: null})
		notify.clipboard(i18next.t('wizard.url.clipboard.bulkHint'))
	})
}

// An arroxy:// link main accepted becomes the copied link: it fills the URL
// field like a copy would, and nothing starts until the user acts. Main holds
// links until this listener tells it the renderer is ready.
export function bindOpenedLinks(set: SetState): () => void {
	if (!isReleaseFlagOn('linkScheme')) return () => undefined
	const unbind = window.appApi.events.onOpenedLink(payload => {
		const url = singleWebLink(payload)
		if (url !== null) set({copiedLink: {url, from: 'link'}})
	})
	void window.appApi.links.rendererReady()
	return unbind
}

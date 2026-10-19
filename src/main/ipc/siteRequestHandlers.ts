import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {siteTryNowSchema} from '@shared/schemas.js'
import type {SiteRequestState} from '@main/services/SiteRequestState.js'
import {handle, handleRaw} from './utils.js'

let detachPush: (() => void) | null = null

// The renderer shows each running rate-limit cooldown and offers "Try now",
// which lets the next request to that site through once.
export function registerSiteRequestHandlers(siteRequests: SiteRequestState, window: BrowserWindow): void {
	handleRaw(IPC_CHANNELS.siteRequestsGetCooldowns, () => ok(siteRequests.snapshot()))
	handle(IPC_CHANNELS.siteRequestsTryNow, siteTryNowSchema, ({site}) => {
		siteRequests.allowOnce(site)
		return Promise.resolve(ok(undefined))
	})

	detachPush?.()
	detachPush = siteRequests.onChange(cooldowns => {
		if (window.isDestroyed()) return
		window.webContents.send(IPC_CHANNELS.siteRequestsCooldownsChanged, cooldowns)
	})
}

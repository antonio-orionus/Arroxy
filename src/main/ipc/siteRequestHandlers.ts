import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {siteTryNowSchema} from '@shared/schemas.js'
import type {ProbeSlots} from '@main/services/ProbeSlots.js'
import type {LaunchGate} from '@main/services/LaunchGate.js'
import {handle, handleRaw} from './utils.js'

let detachPush: (() => void) | null = null
let detachHeldPush: (() => void) | null = null

// The renderer shows each running rate-limit cooldown and offers "Try now",
// which lets the next request to that site through once. Downloads says which
// rows a cooldown holds from the probes ProbeSlots holds, by row id.
export function registerSiteRequestHandlers(launchGate: Pick<LaunchGate, 'snapshot' | 'onChange' | 'allowOnce'>, probeSlots: Pick<ProbeSlots, 'heldProbes' | 'onHeldChange'>, window: BrowserWindow): void {
	handleRaw(IPC_CHANNELS.siteRequestsGetCooldowns, () => ok(launchGate.snapshot()))
	handleRaw(IPC_CHANNELS.siteRequestsGetHeldProbes, () => ok(probeSlots.heldProbes()))
	handle(IPC_CHANNELS.siteRequestsTryNow, siteTryNowSchema, ({site}) => {
		launchGate.allowOnce(site)
		return Promise.resolve(ok(undefined))
	})

	detachPush?.()
	detachPush = launchGate.onChange(cooldowns => {
		if (window.isDestroyed()) return
		window.webContents.send(IPC_CHANNELS.siteRequestsCooldownsChanged, cooldowns)
	})
	detachHeldPush?.()
	detachHeldPush = probeSlots.onHeldChange(held => {
		if (window.isDestroyed()) return
		window.webContents.send(IPC_CHANNELS.siteRequestsHeldProbesChanged, held)
	})
}

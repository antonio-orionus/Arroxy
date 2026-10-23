import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {signInUseAgainSchema} from '@shared/schemas.js'
import type {SuspectSignIns} from '@main/services/SuspectSignIns.js'
import {handle, handleRaw} from './utils.js'

let detachPush: (() => void) | null = null

// Settings lists the sites whose Explore sign-in downloads marked as not
// working, and offers "Use my sign-in again" for each (ADR 0022).
export function registerSignInHandlers(suspects: Pick<SuspectSignIns, 'list' | 'useAgain' | 'onChange'>, window: BrowserWindow): void {
	handleRaw(IPC_CHANNELS.signInsGetNotWorking, () => ok(suspects.list()))
	handle(IPC_CHANNELS.signInsUseAgain, signInUseAgainSchema, ({site}) => {
		suspects.useAgain(site)
		return Promise.resolve(ok(undefined))
	})

	detachPush?.()
	detachPush = suspects.onChange(sites => {
		if (window.isDestroyed()) return
		window.webContents.send(IPC_CHANNELS.signInsNotWorkingChanged, sites)
	})
}

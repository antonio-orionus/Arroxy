import type {SetState} from './types.js'

export function maybeShowQueueTip(set: SetState): void {
	if (!localStorage.getItem('arroxy_seen_queue_tip')) {
		localStorage.setItem('arroxy_seen_queue_tip', '1')
		set({drawerOpen: true, showQueueTip: true})
	}
}

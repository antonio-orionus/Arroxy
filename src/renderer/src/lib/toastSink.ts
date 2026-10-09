import {useEffect} from 'react'
import {toast, type ExternalToast} from 'sonner'
import {setNotificationSink, type NotificationLevel} from './notify.js'

const RENDERERS: Record<NotificationLevel, (message: string, options: ExternalToast) => void> = {error: (message, options) => toast.error(message, options), warning: (message, options) => toast.warning(message, options), info: (message, options) => toast.info(message, options)}

/**
 * Point the notification adapter at sonner for as long as the app is mounted.
 *
 * Registration lives in a hook rather than at module scope so tests can mount
 * and unmount it, and so the sink is torn down with the tree that renders it.
 *
 * A notification id collapses repeats only into a toast that is still on
 * screen. Sonner animates a closing toast out before removing it, and a toast
 * created with the same id in that window updates the leaving toast and
 * vanishes with it. So once a toast starts closing, its id moves to a new
 * generation and the next message opens a fresh toast.
 */
export function useToastSink(): void {
	useEffect(() => {
		const generations = new Map<string, number>()
		setNotificationSink((level, message, id) => {
			const generation = generations.get(id) ?? 0
			const retire = (): void => {
				if ((generations.get(id) ?? 0) === generation) generations.set(id, generation + 1)
			}
			RENDERERS[level](message, {id: `${id}#${generation}`, onAutoClose: retire, onDismiss: retire})
		})
		return () => {
			setNotificationSink(null)
		}
	}, [])
}

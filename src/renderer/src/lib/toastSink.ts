import {useEffect} from 'react'
import {toast} from 'sonner'
import {setNotificationSink, type NotificationLevel} from './notify.js'

const RENDERERS: Record<NotificationLevel, (message: string, options: {id: string}) => void> = {error: (message, options) => toast.error(message, options), warning: (message, options) => toast.warning(message, options), info: (message, options) => toast.info(message, options)}

/**
 * Point the notification adapter at sonner for as long as the app is mounted.
 *
 * Registration lives in a hook rather than at module scope so tests can mount
 * and unmount it, and so the sink is torn down with the tree that renders it.
 */
export function useToastSink(): void {
	useEffect(() => {
		setNotificationSink((level, message, id) => {
			RENDERERS[level](message, {id})
		})
		return () => {
			setNotificationSink(null)
		}
	}, [])
}

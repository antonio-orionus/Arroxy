import {KeyboardCode, KeyboardSensor, type KeyboardSensorProps} from '@dnd-kit/core'

// dnd-kit's KeyboardSensor starts reading keys one task after the pick-up, so
// the key that picked the item up does not drop it again. The pick-up render
// runs before that task, and Chromium serves queued input ahead of timers, so
// a key pressed during the render was lost. This sensor holds such keys and
// replays them, in order, once dnd-kit is listening.
export class KeyboardSortSensor extends KeyboardSensor {
	constructor(props: KeyboardSensorProps) {
		super(props)
		const {event: pickUp, options} = props
		const doc = pickUp.target instanceof Node ? (pickUp.target.ownerDocument ?? document) : document
		const view = doc.defaultView ?? window
		const codes = new Set<string>([...Object.values(KeyboardCode), ...(options.keyboardCodes?.cancel ?? []), ...(options.keyboardCodes?.end ?? [])])
		const held: KeyboardEvent[] = []
		const hold = (event: KeyboardEvent): void => {
			if (event === pickUp || !codes.has(event.code)) return
			event.preventDefault()
			event.stopImmediatePropagation()
			held.push(event)
		}
		doc.addEventListener('keydown', hold, true)
		// Queued after the base sensor's own listener timer, so it runs once that listener is in place.
		view.setTimeout(() => {
			doc.removeEventListener('keydown', hold, true)
			for (const event of held) {
				const {code, key, altKey, ctrlKey, metaKey, shiftKey} = event
				;(event.target ?? doc).dispatchEvent(new view.KeyboardEvent('keydown', {code, key, altKey, ctrlKey, metaKey, shiftKey, bubbles: true, cancelable: true}))
			}
		})
	}
}

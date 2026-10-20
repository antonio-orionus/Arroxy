import {flushSync} from 'react-dom'
import {KeyboardCode, KeyboardSensor, type KeyboardSensorProps} from '@dnd-kit/core'

// Timer turns a replayed key may wait for the drop target before the next key goes anyway.
const MAX_SETTLE_TURNS = 20

// dnd-kit's KeyboardSensor starts reading keys one task after the pick-up, so
// the key that picked the item up does not drop it again. The pick-up render
// runs before that task, and Chromium serves queued input ahead of timers, so
// a key pressed during the render was lost. This sensor holds such keys and
// replays them, in order, once dnd-kit is listening.
export class KeyboardSortSensor extends KeyboardSensor {
	constructor(props: KeyboardSensorProps) {
		// Once the drag is over, held keys have nothing left to act on.
		let stopped = false
		super({
			...props,
			onEnd: () => {
				stopped = true
				props.onEnd()
			},
			onCancel: () => {
				stopped = true
				props.onCancel()
			}
		})
		const {event: pickUp, options, context} = props
		const doc = pickUp.target instanceof Node ? (pickUp.target.ownerDocument ?? document) : document
		const view = doc.defaultView ?? window
		const codes = new Set<string>([...Object.values(KeyboardCode), ...(options.keyboardCodes?.cancel ?? []), ...(options.keyboardCodes?.end ?? [])])
		const held: KeyboardEvent[] = []
		let replaying: KeyboardEvent | null = null
		// Keys pressed while earlier ones still wait their turn queue behind them.
		const hold = (event: KeyboardEvent): void => {
			if (event === pickUp || event === replaying || !codes.has(event.code)) return
			event.preventDefault()
			event.stopImmediatePropagation()
			held.push(event)
		}
		// Rendering a replayed move synchronously refreshes the collisions at
		// once; the drop target follows a render later. The next key needs both,
		// as it has them between real presses.
		const settled = (): boolean => {
			const {over, collisions} = context.current
			return (over?.id ?? null) === (collisions?.[0]?.id ?? null)
		}
		// The hold stays until the last replayed move has settled, so a key
		// pressed meanwhile still queues behind it.
		const replay = (index: number, turns: number): void => {
			if (!stopped && turns < MAX_SETTLE_TURNS && !settled()) {
				view.setTimeout(() => replay(index, turns + 1))
				return
			}
			const event = held[index]
			if (stopped || !event) {
				doc.removeEventListener('keydown', hold, true)
				return
			}
			const {code, key, altKey, ctrlKey, metaKey, shiftKey} = event
			const copy = new view.KeyboardEvent('keydown', {code, key, altKey, ctrlKey, metaKey, shiftKey, bubbles: true, cancelable: true})
			replaying = copy
			flushSync(() => (event.target ?? doc).dispatchEvent(copy))
			replaying = null
			replay(index + 1, 0)
		}
		doc.addEventListener('keydown', hold, true)
		// Queued after the base sensor's own listener timer, so it runs once that listener is in place.
		view.setTimeout(() => replay(0, 0))
	}
}

import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import loveImg from '../../assets/Love.png'
import {SpeechBubble} from '../shared/SpeechBubble.js'

interface Props {
	visible: boolean
	message: string
}

export function FeedbackNudge({visible, message}: Props): ReactNode {
	if (!visible) return null

	return (
		<div className="pointer-events-none absolute bottom-full end-0 mb-2" data-testid="feedback-nudge">
			<div className={cn('nudge-in', 'pointer-events-auto flex items-end gap-2')}>
				<img src={loveImg} alt="" aria-hidden draggable={false} className="size-10 shrink-0 object-contain" />
				<SpeechBubble tail="bottom" className="whitespace-nowrap">
					{message}
				</SpeechBubble>
			</div>
		</div>
	)
}

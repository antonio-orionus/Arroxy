import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {SpeechBubble} from './SpeechBubble.js'

interface Props {
	image: string
	message: string
	side?: 'left' | 'right'
	className?: string
}

export function MascotBubble({image, message, side = 'left', className}: Props): ReactNode {
	const isRight = side === 'right'

	return (
		<div className={cn('flex items-center gap-2.5', isRight && 'flex-row-reverse', className)}>
			<div className="shrink-0 rounded-2xl bg-primary/12 p-2">
				<img src={image} alt="" aria-hidden className="size-20 object-contain" />
			</div>
			<SpeechBubble tail={isRight ? 'end' : 'start'} className="text-muted-foreground">
				{message}
			</SpeechBubble>
		</div>
	)
}

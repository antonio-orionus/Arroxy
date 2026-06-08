import type {JSX} from 'react'
import {cn} from '@renderer/lib/utils.js'

interface Props {
	image: string
	message: string
	side?: 'left' | 'right'
	className?: string
}

export function MascotBubble({image, message, side = 'left', className}: Props): JSX.Element {
	const isRight = side === 'right'

	return (
		<div className={cn('flex items-center', isRight && 'flex-row-reverse', className)}>
			<div className="rounded-2xl bg-[var(--brand-dim)] p-2 shrink-0">
				<img src={image} alt="" aria-hidden className="w-20 h-20 object-contain" />
			</div>
			<div className={cn('relative rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground leading-relaxed shadow-sm', !isRight ? 'ms-2' : 'me-2')}>
				{message}
				{!isRight && (
					<>
						<span aria-hidden className="absolute top-[10px] -start-[7px] w-0 h-0" style={{borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderInlineEnd: '7px solid var(--border)'}} />
						<span aria-hidden className="absolute top-[10px] -start-[5px] w-0 h-0" style={{borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderInlineEnd: '7px solid var(--secondary)'}} />
					</>
				)}
				{isRight && (
					<>
						<span aria-hidden className="absolute top-[10px] -end-[7px] w-0 h-0" style={{borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderInlineStart: '7px solid var(--border)'}} />
						<span aria-hidden className="absolute top-[10px] -end-[5px] w-0 h-0" style={{borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderInlineStart: '7px solid var(--secondary)'}} />
					</>
				)}
			</div>
		</div>
	)
}

import {useState, useEffect, type JSX} from 'react'
import {cn} from '@renderer/lib/utils.js'
import loveImg from '../../assets/Love.png'

interface Props {
	visible: boolean
	message: string
}

export function FeedbackNudge({visible, message}: Props): JSX.Element | null {
	const [rendered, setRendered] = useState(visible)
	const cls = visible ? 'nudge-in' : 'nudge-out'

	if (visible && !rendered) setRendered(true)

	useEffect(() => {
		if (!visible && rendered) {
			const t = setTimeout(() => setRendered(false), 220)
			return () => clearTimeout(t)
		}
	}, [visible, rendered])

	if (!rendered) return null

	return (
		<div className="pointer-events-none absolute bottom-full end-0 mb-2" data-testid="feedback-nudge">
			<div className={cn(cls, 'pointer-events-auto flex items-end gap-2')}>
				<img src={loveImg} alt="" aria-hidden draggable={false} className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_14px_var(--brand-glow)]" />
				<div className="glow-tile relative whitespace-nowrap rounded-2xl border-transparent px-4 py-2.5 text-xs leading-relaxed text-foreground/85">
					{message}
					<span aria-hidden className="absolute -bottom-[7px] end-4 h-3 w-3 rotate-45 border-b border-r border-[var(--glow-border)] bg-[var(--card)]" />
				</div>
			</div>
		</div>
	)
}

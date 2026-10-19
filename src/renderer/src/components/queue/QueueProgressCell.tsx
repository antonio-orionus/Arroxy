import {memo, type ReactNode} from 'react'
import {Progress} from '../ui/progress.js'

export const QueueProgressCell = memo(function QueueProgressCell({value}: {value: number}): ReactNode {
	return (
		<div className="min-w-24 max-w-32">
			<div className="font-mono text-xs text-muted-foreground">{Math.round(value)}%</div>
			<Progress value={value} className="mt-1 gap-0 [&_[data-slot=progress-track]]:h-[3px]" />
		</div>
	)
})

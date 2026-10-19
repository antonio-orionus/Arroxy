import {memo, type ReactNode} from 'react'
import {Hint} from '../shared/Hint.js'

export const QueueMetadataCell = memo(function QueueMetadataCell({value, className}: {value: string; className: string}): ReactNode {
	return (
		<Hint label={value} reveal>
			<span className={className}>{value}</span>
		</Hint>
	)
})

import type {ReactNode} from 'react'
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'

// A titled group of related controls inside a stage or dialog: settings
// sections, profile-editor sections. `action` sits at the header's end (a count
// badge, a reset button).
export function Panel({title, description, action, testId, className, children}: {title: ReactNode; description?: ReactNode; action?: ReactNode; testId?: string; className?: string; children: ReactNode}): ReactNode {
	return (
		<Card variant="inset" size="sm" className={className} data-testid={testId}>
			<CardHeader>
				<CardTitle className="font-semibold">{title}</CardTitle>
				{description ? <CardDescription className="text-xs text-subtle-foreground">{description}</CardDescription> : null}
				{action ? <CardAction>{action}</CardAction> : null}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}

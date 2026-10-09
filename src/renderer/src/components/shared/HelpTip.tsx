import type {ReactNode} from 'react'
import {Info} from 'lucide-react'
import {Button} from '../ui/button.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'

// The small (i) next to a setting label that explains it on hover or focus.
export function HelpTip({label, children, testId}: {label: string; children: ReactNode; testId?: string}): ReactNode {
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={label} className="text-subtle-foreground hover:text-foreground" data-testid={testId}>
						<Info aria-hidden />
					</Button>
				)}
			/>
			<TooltipContent className="max-w-72 leading-snug">{children}</TooltipContent>
		</Tooltip>
	)
}

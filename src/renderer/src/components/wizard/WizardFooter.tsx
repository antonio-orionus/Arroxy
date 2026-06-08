import type {ReactNode} from 'react'
import {Separator} from '../ui/separator.js'

interface WizardFooterProps {
	children: ReactNode
	info?: ReactNode
	extraAbove?: ReactNode
}

export function WizardFooter({children, info, extraAbove}: WizardFooterProps): ReactNode {
	return (
		<div className="sticky bottom-0 -mx-6 px-6 bg-background z-10">
			{extraAbove}
			<Separator className="bg-border/50 -mx-6 w-auto my-1.5" />
			<div className="flex items-center py-3 -mx-6 px-6">
				<div className="flex-1 text-[13px] text-muted-foreground">{info}</div>
				<div className="flex gap-2">{children}</div>
			</div>
		</div>
	)
}

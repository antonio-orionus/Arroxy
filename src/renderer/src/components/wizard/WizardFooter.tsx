import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Separator} from '../ui/separator.js'

interface WizardFooterProps {
	children: ReactNode
	info?: ReactNode
	extraAbove?: ReactNode
	// Caps the footer's content to the step's own width cap, so its edges line up
	// with the content above while the bar itself spans the stage.
	contentClassName?: string
}

export function WizardFooter({children, info, extraAbove, contentClassName}: WizardFooterProps): ReactNode {
	return (
		<div className="wizard-footer-surface sticky bottom-0 z-10 -mx-6">
			{extraAbove ? (
				<div className="px-6">
					<div className={contentClassName}>{extraAbove}</div>
				</div>
			) : null}
			<Separator className="wizard-footer-divider my-0 w-full" />
			<div className={cn('flex items-center px-6 py-3', contentClassName && 'box-content', contentClassName)}>
				<div className="flex-1 text-sm text-muted-foreground">{info}</div>
				<div className="flex gap-2">{children}</div>
			</div>
		</div>
	)
}

import type {ReactNode} from 'react'
import {Separator} from '../ui/separator.js'

interface WizardFooterProps {
	children: ReactNode
	info?: ReactNode
	extraAbove?: ReactNode
}

export function WizardFooter({children, info, extraAbove}: WizardFooterProps): ReactNode {
	return (
		<div className="wizard-footer-surface sticky bottom-0 z-10 -mx-6">
			{extraAbove ? (
				<div className="px-6">
					{/* The band pads both edges, so its lines sit centred above the divider; with nothing in it, it takes no room. */}
					<div className={'mx-auto flex max-w-(--wizard-column) flex-col gap-1.5 py-2 empty:hidden'}>{extraAbove}</div>
				</div>
			) : null}
			<Separator className="wizard-footer-divider my-0 w-full" />
			<div className={'mx-auto box-content flex max-w-(--wizard-column) items-center px-6 py-3'}>
				<div className="flex-1 text-sm text-muted-foreground">{info}</div>
				<div className="flex gap-2">{children}</div>
			</div>
		</div>
	)
}

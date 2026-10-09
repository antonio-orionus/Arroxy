import type {ReactNode} from 'react'
import {Separator} from '../ui/separator.js'
import {SectionLabel} from './SectionLabel.js'

// A labelled sub-group inside a Panel. Panels never nest; a group that needs its
// own heading inside one is a PanelSection, divided from the content above.
export function PanelSection({title, action, testId, children}: {title: ReactNode; action?: ReactNode; testId?: string; children: ReactNode}): ReactNode {
	return (
		<section className="flex flex-col gap-2.5" data-testid={testId}>
			<Separator />
			<div className="flex min-h-5 items-center justify-between gap-3">
				<SectionLabel>{title}</SectionLabel>
				{action}
			</div>
			{children}
		</section>
	)
}

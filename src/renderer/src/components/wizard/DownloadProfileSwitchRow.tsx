import type {ReactNode} from 'react'
import {Info} from 'lucide-react'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldTitle} from '../ui/field.js'
import {Switch} from '../ui/switch.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'

function ProfileHelpTooltip({label, children}: {label: string; children: ReactNode}): ReactNode {
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Button {...props} type="button" variant="ghost" size="icon-xs" aria-label={`${label} help`} className="text-[var(--text-subtle)] hover:text-foreground">
						<Info aria-hidden />
					</Button>
				)}
			/>
			<TooltipContent className="max-w-[18rem] leading-snug">{children}</TooltipContent>
		</Tooltip>
	)
}

export function ProfileSwitchRow({id, label, description, checked, onCheckedChange}: {id: string; label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void}): ReactNode {
	return (
		<Field orientation="horizontal" className="min-h-10 items-center justify-between gap-3 rounded-md border border-border bg-background/25 px-3 py-2 text-[12px]">
			<FieldContent className="min-w-0">
				<FieldTitle id={id} className="flex items-center gap-1.5 text-[12px] font-medium">
					{label}
					{description ? <ProfileHelpTooltip label={label}>{description}</ProfileHelpTooltip> : null}
				</FieldTitle>
			</FieldContent>
			<Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} />
		</Field>
	)
}

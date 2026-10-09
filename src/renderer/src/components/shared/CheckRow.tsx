import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Checkbox} from '../ui/checkbox.js'
import {Field, FieldLabel, FieldTitle} from '../ui/field.js'

// One toggleable option in a multi-select grid (SponsorBlock categories,
// subtitle languages). The checkbox sibling of ChoiceRow, on the same surface.
export function CheckRow({id, label, checked, onCheckedChange, meta, disabled, testId, className}: {id: string; label: ReactNode; checked: boolean; onCheckedChange: (checked: boolean) => void; meta?: ReactNode; disabled?: boolean; testId?: string; className?: string}): ReactNode {
	return (
		<FieldLabel htmlFor={id} className={cn('w-full rounded-md *:data-[slot=field]:px-2 *:data-[slot=field]:py-1.5', className)} data-testid={testId}>
			<Field orientation="horizontal" className="items-center gap-2">
				{/* base-ui gives `id` to its hidden input, so name the visible checkbox explicitly. */}
				<Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-labelledby={`${id}-label`} />
				<FieldTitle id={`${id}-label`} className="min-w-0 flex-1 truncate">
					{label}
				</FieldTitle>
				{meta}
			</Field>
		</FieldLabel>
	)
}

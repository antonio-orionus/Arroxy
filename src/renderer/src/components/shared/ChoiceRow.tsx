import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Field, FieldLabel, FieldTitle} from '../ui/field.js'
import {RadioGroupItem} from '../ui/radio-group.js'

// One option in a RadioGroup list (format rows, audio tracks): radio, label,
// and right-aligned metadata on a choice surface. The whole row is the label,
// so clicking anywhere selects; arrow keys move through the group.
export function ChoiceRow({id, value, label, meta, disabled, className}: {id: string; value: string; label: ReactNode; meta?: ReactNode; disabled?: boolean; className?: string}): ReactNode {
	return (
		<FieldLabel htmlFor={id} className={cn('w-full rounded-md *:data-[slot=field]:px-2 *:data-[slot=field]:py-1.5', className)}>
			<Field orientation="horizontal" className="items-center gap-2">
				{/* base-ui gives `id` to its hidden input, so name the visible radio explicitly. */}
				<RadioGroupItem id={id} value={value} disabled={disabled} aria-labelledby={`${id}-label`} />
				<FieldTitle id={`${id}-label`} className="min-w-0 flex-1">
					{label}
				</FieldTitle>
				{meta ? <span className="shrink-0 text-xs whitespace-nowrap text-subtle-foreground">{meta}</span> : null}
			</Field>
		</FieldLabel>
	)
}

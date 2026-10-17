import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Field, FieldLabel, FieldTitle} from '../ui/field.js'
import {RadioGroupItem} from '../ui/radio-group.js'

// One option in a RadioGroup list (format rows, audio tracks): radio, label,
// and right-aligned metadata on a choice surface. The whole row is the label,
// so clicking anywhere selects; arrow keys move through the group.
// `adornment` (an icon or badge) sits before the label and never shrinks, so the
// label stays plain text that truncates with an ellipsis. `tag` (a short badge)
// follows the label and never shrinks either. `fixedLabel` keeps a short label
// (a resolution) whole and lets the metadata give way first.
export function ChoiceRow({id, value, label, adornment, tag, meta, disabled, fixedLabel = false, className}: {id: string; value: string; label: string; adornment?: ReactNode; tag?: ReactNode; meta?: string; disabled?: boolean; fixedLabel?: boolean; className?: string}): ReactNode {
	return (
		<FieldLabel htmlFor={id} className={cn('w-full min-w-0 rounded-md *:data-[slot=field]:px-2 *:data-[slot=field]:py-1.5', className)}>
			<Field orientation="horizontal" className="min-w-0 items-center gap-2">
				{/* base-ui gives `id` to its hidden input, so name the visible radio explicitly. */}
				<RadioGroupItem id={id} value={value} disabled={disabled} aria-labelledby={`${id}-label`} />
				{/* The label grows and shrinks at the base rate; the details shrink four times faster, so the label keeps its room first. */}
				<FieldTitle id={`${id}-label`} className={cn('w-auto gap-1.5', fixedLabel ? 'flex-none' : 'min-w-0 flex-auto')}>
					{adornment}
					<span className="min-w-0 truncate" title={label}>
						{label}
					</span>
					{tag}
				</FieldTitle>
				{/* Long track details (codec, channels, bitrate, size) truncate rather than overflow the row. */}
				{meta ? (
					<span className="max-w-[65%] min-w-0 shrink-4 truncate text-end text-xs text-subtle-foreground" title={meta}>
						{meta}
					</span>
				) : null}
			</Field>
		</FieldLabel>
	)
}

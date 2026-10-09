import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Field, FieldLabel, FieldTitle} from '../ui/field.js'
import {RadioGroupItem} from '../ui/radio-group.js'

// One option in a RadioGroup list (format rows, audio tracks): radio, label,
// and right-aligned metadata on a choice surface. The whole row is the label,
// so clicking anywhere selects; arrow keys move through the group.
export function ChoiceRow({id, value, label, meta, disabled, className}: {id: string; value: string; label: ReactNode; meta?: ReactNode; disabled?: boolean; className?: string}): ReactNode {
	return (
		<FieldLabel htmlFor={id} className={cn('w-full min-w-0 rounded-md *:data-[slot=field]:px-2 *:data-[slot=field]:py-1.5', className)}>
			<Field orientation="horizontal" className="min-w-0 items-center gap-2">
				{/* base-ui gives `id` to its hidden input, so name the visible radio explicitly. */}
				<RadioGroupItem id={id} value={value} disabled={disabled} aria-labelledby={`${id}-label`} />
				<FieldTitle id={`${id}-label`} className="w-auto min-w-0 flex-1">
					<span className="min-w-0 truncate">{label}</span>
				</FieldTitle>
				{/* Long track details (codec, channels, bitrate, size) truncate rather than overflow the row. */}
				{meta ? <span className="max-w-[65%] min-w-0 truncate text-end text-xs text-subtle-foreground">{meta}</span> : null}
			</Field>
		</FieldLabel>
	)
}

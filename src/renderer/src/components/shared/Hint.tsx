import {useContext, useState, type ReactElement, type ReactNode} from 'react'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {NativeViewPointerEntries} from './nativeViewPointerEntries.js'

const ABOVE_NATIVE_VIEW = {side: 'shift', align: 'shift', fallbackAxisSide: 'none'} as const

// Every hover/focus hint in the app goes through here, never the native `title`
// attribute: `title` draws a second, unstyled bubble beside the app tooltip.
// An empty label disables the hint but keeps the tree, so a call site can hint
// only sometimes without remounting (and unfocusing) the trigger.
// A disabled Button child needs `focusableWhenDisabled`: the browser sends no
// hover to a disabled button. `reveal` is for the full text of a truncated
// label: it waits before opening, so sweeping across a list flashes nothing.
// Hint owns its trigger; to hint another trigger (a popover's), wrap that one.
export function Hint({label, reveal = false, side, children}: {label: ReactNode; reveal?: boolean; side?: 'top' | 'bottom' | 'left' | 'right'; children: ReactElement}): ReactNode {
	const pointerEntries = useContext(NativeViewPointerEntries)
	const [openedAt, setOpenedAt] = useState<number | null>(null)
	const empty = label === undefined || label === null || label === false || label === ''
	const aboveView = pointerEntries !== null
	return (
		<Tooltip disabled={empty} {...(aboveView ? {open: !empty && openedAt === pointerEntries, onOpenChange: (open: boolean) => setOpenedAt(open ? pointerEntries : null)} : {})}>
			<TooltipTrigger delay={reveal ? 600 : undefined} render={children} />
			<TooltipContent side={aboveView ? 'top' : side} collisionAvoidance={aboveView ? ABOVE_NATIVE_VIEW : undefined} collisionPadding={aboveView ? 8 : undefined} className={reveal ? 'max-w-md break-all' : undefined}>
				{label}
			</TooltipContent>
		</Tooltip>
	)
}

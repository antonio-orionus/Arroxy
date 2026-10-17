import {createContext} from 'react'

// Explore's native view sits below its toolbar and paints over any DOM under
// it, so a hint above the view must open upward: `side: 'shift'` slides it,
// never flips it down into the view. The pointer can also leave a trigger
// straight onto the view, and the renderer then never sees its mouseleave:
// the value counts main's reports of the pointer entering the view, and a hint
// opened before the latest one is closed. Null outside the toolbar.
export const NativeViewPointerEntries = createContext<number | null>(null)
